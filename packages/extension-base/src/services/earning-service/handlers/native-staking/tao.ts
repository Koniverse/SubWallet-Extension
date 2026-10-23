// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { APIItemState, ExtrinsicType, NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { BITTENSOR_REFRESH_STAKE_APY, BITTENSOR_REFRESH_STAKE_INFO } from '@subwallet/extension-base/constants';
import { getEarningStatusByNominations } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import BaseParaStakingPoolHandler from '@subwallet/extension-base/services/earning-service/handlers/native-staking/base-para';
import { BaseYieldPositionInfo, BasicTxErrorType, EarningRewardItem, EarningStatus, NativeYieldPoolInfo, OptimalYieldPath, StakeCancelWithdrawalParams, StakingTxErrorType, SubmitBittensorChangeValidatorStaking, SubmitJoinNativeStaking, TransactionData, UnstakingInfo, ValidatorInfo, YieldPoolInfo, YieldPoolMethodInfo, YieldPoolType, YieldPositionInfo, YieldTokenBaseInfo } from '@subwallet/extension-base/types';
import { ProxyServiceRoute } from '@subwallet/extension-base/types/environment';
import { alphaPriceToTao, DEFAULT_MIN_STAKE, DEFAULT_MIN_TRANSFER, DEFAULT_SWAP_FEE_RATE, fetchFromProxyService, formatMinimum, formatNumber, getMinimumAtSpot, getStakeLimitPrice, getTaoPerAlphaMap, getWorthAtSpot, isSameAddress, readAlphaPrices, readOptional, reformatAddress, roundUpMinimum, SharedRead } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { t } from 'i18next';
import { BehaviorSubject, combineLatest } from 'rxjs';

import { ApiDecoration, SubmittableExtrinsic } from '@polkadot/api/types';
import { BN, BN_ZERO, noop } from '@polkadot/util';

import { findMinLeg } from '../../../swap-service/handler/bittensor-swap-plan';
import { simulateSubnetTrade } from './bittensor-pool';
import { isRootClaimWorthNotifying, parseRootClaimThreshold, planRootClaim, RootClaimPlan, RootClaimPreview, UNKNOWN_ROOT_CLAIM_THRESHOLD } from './bittensor-root-claim-plan';
import { getRootApr, getSubnetApr, getSubnetAprs, NetuidDividendRow, SubnetApr } from './bittensor-subnet-apr';
import { decodeIdentityName, decodeTaoWeight, formatTake, getPermittedUids, getValidatorHotkeys, getValidatorStake } from './bittensor-subnet-validators';
import { planUnstake, UnstakePlan } from './bittensor-unstake-plan';

type Nominators = [Array<[number, number]>]

export interface TestnetBittensorDelegateInfo {
  delegateSs58: string;
  take: number;
  nominators: Nominators;
  returnPer1000: number
}

export interface TaoStakeInfo {
  hotkey: string;
  stake: string;
  netuid: number;
}

export interface TaoStakingStakeOption {
  owner: string;
  amount: string;
  rate?: BigN;
  identity?: string
}

interface ValidatorAprResponse {
  data: ValidatorApr[];
}

interface ValidatorApr {
  hotkey: {
    ss58: string;
  },
  name: string;
  netuid: number;
  /** In rao: on root, the validator's root stake */
  stake: string;
  thirty_day_apy: string;
}

export interface RateSubnetData {
  netuid: number;
  taoIn: string;
  alphaIn: string;
  alphaOut: string;
}

interface NominatorCountResponse {
  data?: Array<{ hotkey: string; nominatorCount: number }>;
}

/** Who a picker lists besides permit holders, and the APR shown for each, in percent; none when there is no figure */
interface ValidatorReturns {
  paid: string[];
  expectedReturn?: (hotkey: string) => string;
}

const DEFAULT_BITTENSOR_SLIPPAGE = 0.005;

/** Bittensor's target block time, in seconds */
export const BITTENSOR_BLOCK_TIME = 12;

/**
 * What still comes from the proxy: root's 30-day APR (it stays there: BE-11 dropped, 10-22) and nominator counts. Validator
 * lists and names, and the subnet fee rate (BE-5), are read from the chain; the static `validator.json`, and its timer
 * re-reading it every minute, are gone
 */
export class BittensorCache {
  private static instance: BittensorCache | null = null;

  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  private constructor () {}

  public static getInstance (): BittensorCache {
    if (!BittensorCache.instance) {
      BittensorCache.instance = new BittensorCache();
    }

    return BittensorCache.instance;
  }

  public async fetchApr (netuid: number): Promise<ValidatorAprResponse> {
    try {
      const resp = await fetchFromProxyService(ProxyServiceRoute.BITTENSOR, `/dtao/validator/yield/latest/v1?netuid=${netuid}&limit=100&order=thirty_day_apy_desc`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const rawData = await resp.json() as ValidatorAprResponse;

      // Some subnets not return data, ensure the structure is consistent by returning an empty array
      return Array.isArray(rawData.data) ? rawData : { data: [] };
    } catch (error) {
      console.error(error);

      return { data: [] };
    }
  }

  /**
   * Each validator's nominator count on subnet `netuid`, by hotkey. Not on the chain in a readable form — a count
   * scans every stake on the hotkey — so the proxy serves it (EXT-14); empty when it has none.
   */
  public async fetchNominatorCounts (netuid: number): Promise<Record<string, number>> {
    try {
      const resp = await fetchFromProxyService(ProxyServiceRoute.BITTENSOR, `/subnet/validator/nominators/latest/v1?netuid=${netuid}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!resp.ok) {
        return {};
      }

      const rawData = await resp.json() as NominatorCountResponse;

      return Object.fromEntries((rawData.data ?? []).map(({ hotkey, nominatorCount }) => [hotkey, nominatorCount]));
    } catch (error) {
      console.error(error);

      return {};
    }
  }
}

/**
 * TAO per alpha on `netuid`; root is 1:1. `current_alpha_price` is rao of TAO per alpha, so the scale is
 * TAO's decimals — the same as `getAlphaToTaoRateMap`. Root's own price reads exactly 10^9 (mainnet spec 479,
 * testnet 481, 10-19), so it is not read as the scale any more (EXT-4).
 */
export const getAlphaToTaoRate = async (substrateApi: _SubstrateApi, netuid: number, priceScaleDecimals = 9): Promise<string> => {
  if (netuid === 0) {
    return '1';
  }

  return alphaPriceToTao((await substrateApi.api.call.swapRuntimeApi.currentAlphaPrice(netuid)).toString(), priceScaleDecimals).toFixed();
};

export default class TaoNativeStakingPoolHandler extends BaseParaStakingPoolHandler {
  override readonly availableMethod: YieldPoolMethodInfo = {
    join: true,
    defaultUnstake: true,
    fastUnstake: false,
    cancelUnstake: false,
    withdraw: false,
    claimReward: true,
    changeValidator: true
  };

  protected bittensorCache: BittensorCache;
  /** A claim's fee by call: flat whatever it pays (10-13), so one estimate serves 10 minutes of reward cycles */
  private readonly rootClaimFees = new SharedRead<BigN>(10 * 60 * 1000);
  /** A subnet's APR, kept 5 minutes: it changes once an epoch; root's under netuid 0 */
  private readonly subnetAprReads = new SharedRead<SubnetApr | undefined>(5 * 60 * 1000);
  /** Every subnet's APR at once, for the pool cards; kept 5 minutes */
  private readonly allSubnetAprReads = new SharedRead<Record<number, SubnetApr | undefined>>(5 * 60 * 1000);
  /** A hotkey's name, kept an hour: an identity rarely changes */
  private readonly hotkeyNames = new SharedRead<string>(60 * 60 * 1000);

  protected getAlphaPriceScaleDecimals (): number {
    return _getAssetDecimals(this.nativeToken);
  }

  /**
   * Positions' validator names from the chain, in place of the static `validator.json`: each hotkey's owner coldkey
   * identity, '' when it has none. Concurrent reads go out batched; one that fails is asked again next time.
   */
  protected async getHotkeyNames (hotkeys: string[]): Promise<Record<string, string>> {
    const { api } = await this.substrateApi.isReady;
    const q = api.query.subtensorModule;
    const names = await Promise.all(hotkeys.map((hotkey) => this.hotkeyNames.get(hotkey, async () => {
      const owner = await q.owner(hotkey);
      const identity = await q.identitiesV2(owner.toString());

      return decodeIdentityName(identity.toJSON());
    }).catch(() => '')));

    return Object.fromEntries(hotkeys.map((hotkey, index) => [hotkey, names[index]]));
  }

  /**
   * The smallest stake the chain takes on `netuid` (`validate_add_stake`), in rao: `DefaultMinStake` (0.002 TAO),
   * plus on a subnet the pool fee on a buy that size — none on root — here at the default fee rate. Rounded up to
   * the 2 digits the screens print, so the figure shown is always enough. The nominator minimum (0.02 TAO) is not
   * a staking rule: it bounds what a partial unstake may leave (EXT-26). EXT-20: was the raw
   * `NominatorMinRequiredStake` read as rao (0.01 TAO) on root, and a hardcoded 0.021 TAO on subnets.
   */
  protected async getMinBond (netuid = 0): Promise<BigN> {
    const { api } = await this.substrateApi.isReady;
    const minStake = new BigN(api.consts.subtensorModule.initialMinStake?.toString() || DEFAULT_MIN_STAKE);
    const fee = netuid ? minStake.multipliedBy(DEFAULT_SWAP_FEE_RATE).integerValue(BigN.ROUND_CEIL) : new BigN(0);

    return roundUpMinimum(minStake.plus(fee), _getAssetDecimals(this.nativeToken), 2);
  }

  /** `getMinBond` exactly as the chain computes it: the fee from its own simulation of a buy of `DefaultMinStake` */
  private async getExactMinStake (netuid: number): Promise<BigN> {
    const { api } = await this.substrateApi.isReady;
    const minStake = new BigN(api.consts.subtensorModule.initialMinStake?.toString() || DEFAULT_MIN_STAKE);

    if (!netuid) {
      return minStake;
    }

    const sim = await readOptional(() => api.call.swapRuntimeApi.simSwapTaoForAlpha(netuid, minStake.toFixed(0)));
    const fee = sim
      ? new BigN((sim.toPrimitive() as { taoFee?: number | string }).taoFee ?? 0)
      : minStake.multipliedBy(DEFAULT_SWAP_FEE_RATE).integerValue(BigN.ROUND_CEIL);

    return minStake.plus(fee);
  }

  constructor (state: KoniState, chain: string) {
    super(state, chain);
    this.bittensorCache = BittensorCache.getInstance();
  }

  public override get maintainBalance (): string {
    const ed = new BigN(this.nativeToken.minAmount || '0');
    const maintainBalance = new BigN(15).multipliedBy(ed).dividedBy(10);

    return maintainBalance.toString();
  }

  /* Subscribe pool info */

  async subscribePoolInfo (callback: (data: YieldPoolInfo) => void): Promise<VoidFunction> {
    let cancel = false;
    const substrateApi = await this.substrateApi.isReady;

    // `totalApy` stays the highest figure, which released clients show as "Max APY"; `upToApr` is the card's "Up to" (EXT-1)
    const aprSubject = new BehaviorSubject<{ totalApy: number, upToApr?: number }>({ totalApy: 0 });

    const fetchAPR = async () => {
      try {
        const apr = await this.getRootApr();

        aprSubject.next({
          totalApy: apr ? Math.max(0, ...Object.values(apr.byHotkey)) * 100 : 0,
          upToApr: apr ? apr.upTo * 100 : undefined
        });
      } catch (e) {
        console.error('Fetch APR error:', e);
      }
    };

    await fetchAPR();

    const interval = setInterval(() => {
      fetchAPR().catch(console.error);
    }, BITTENSOR_REFRESH_STAKE_APY);

    const rxSubnetTAO = substrateApi.api.rx.query.subtensorModule.subnetTAO(0);
    const rxMaxValidators = substrateApi.api.rx.query.subtensorModule.maxAllowedValidators(0);
    // A runtime constant: no subscription
    const bnMinStake = await this.getMinBond();
    // An unstake is an immediate swap; only root can hold stake, `RootStakeUnlockInterval` blocks after its last
    // change — 0 (off) on mainnet and testnet, 10-20. In hours, as the screens read it (EXT-16)
    const rootHoldBlocks = Number((await readOptional(() => substrateApi.api.query.subtensorModule.rootStakeUnlockInterval()))?.toPrimitive() ?? 0);
    const unstakingPeriod = rootHoldBlocks * BITTENSOR_BLOCK_TIME / 3600;

    const subscription = combineLatest([rxMaxValidators, rxSubnetTAO, aprSubject]).subscribe({
      next: ([maxValidators, taoIn, apr]) => {
        if (cancel) {
          return;
        }

        try {
          const bnTaoIn = new BigN(taoIn.toString());
          const minStake = bnMinStake.toString();
          const data: NativeYieldPoolInfo = {
            ...this.baseInfo,
            type: this.type,
            metadata: {
              ...this.metadataInfo,
              description: this.getDescription(formatNumber(bnMinStake, _getAssetDecimals(this.nativeToken))),
              minValidate: minStake
            },
            statistic: {
              assetEarning: [{ slug: this.nativeToken.slug }],
              maxCandidatePerFarmer: Number(maxValidators.toString()),
              maxWithdrawalRequestPerFarmer: 1,
              earningThreshold: {
                join: minStake,
                defaultUnstake: '0',
                fastUnstake: '0'
              },
              // Root rewards wait in the validator's basket for a claim: there is no payout period (EXT-16)
              eraTime: 0,
              era: 0,
              unstakingPeriod,
              tvl: bnTaoIn.toString(),
              totalApy: apr.totalApy,
              upToApr: apr.upToApr
            }
          };

          callback(data);
        } catch (err) {
          console.error(err);
        }
      }
    });

    return () => {
      cancel = true;
      aprSubject.complete();
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }

  /* Subscribe pool position */

  protected parseNominatorMetadataBase (chainInfo: _ChainInfo, delegatorState: TaoStakingStakeOption[], minBond: string, applyRate = false): Omit<YieldPositionInfo, keyof BaseYieldPositionInfo> {
    const nominationList: NominationInfo[] = [];
    let allActiveStake = BN_ZERO;

    for (const delegate of delegatorState) {
      const stake = new BigN(delegate.amount);
      const originActiveStake = applyRate ? stake.multipliedBy(delegate.rate || 1).toFixed(0) : stake.toFixed(0);
      const bnActiveStake = new BN(originActiveStake);

      if (bnActiveStake.gt(BN_ZERO)) {
        allActiveStake = allActiveStake.add(bnActiveStake);

        nominationList.push({
          status: EarningStatus.EARNING_REWARD,
          chain: chainInfo.slug,
          validatorAddress: delegate.owner,
          activeStake: delegate.amount,
          validatorMinStake: minBond,
          validatorIdentity: delegate.identity,
          ...(applyRate ? { originActiveStake } : {})
        });
      }
    }

    const stakingStatus = getEarningStatusByNominations(allActiveStake, nominationList);

    return {
      status: stakingStatus,
      balanceToken: this.nativeToken.slug,
      totalStake: allActiveStake.toString(),
      activeStake: allActiveStake.toString(),
      unstakeBalance: '0',
      isBondedBefore: true,
      nominations: nominationList,
      unstakings: []
    } as unknown as YieldPositionInfo;
  }

  async parseNominatorMetadata (chainInfo: _ChainInfo, delegatorState: TaoStakingStakeOption[]): Promise<Omit<YieldPositionInfo, keyof BaseYieldPositionInfo>> {
    const bnMinBond = await this.getMinBond();

    return this.parseNominatorMetadataBase(chainInfo, delegatorState, bnMinBond.toString());
  }

  override async subscribePoolPosition (useAddresses: string[], rsCallback: (rs: YieldPositionInfo) => void): Promise<VoidFunction> {
    let cancel = false;
    const substrateApi = await this.substrateApi.isReady;
    const defaultInfo = this.baseInfo;
    const chainInfo = this.chainInfo;

    const getPoolPosition = async () => {
      const rawDelegateStateInfo = await substrateApi.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkeys(useAddresses);
      const delegateStateInfo: Array<[string, TaoStakeInfo[]]> = rawDelegateStateInfo.toPrimitive() as Array<[string, TaoStakeInfo[]]>;

      if (!delegateStateInfo || delegateStateInfo.length === 0) {
        return;
      }

      const rootHotkeys = delegateStateInfo.flatMap(([, stakeInfos]) => stakeInfos.filter(({ netuid }) => netuid === 0).map(({ hotkey }) => hotkey));
      const names = await this.getHotkeyNames([...new Set(rootHotkeys)]);

      delegateStateInfo.forEach(([coldkey, stakeInfos]) => {
        const owner = reformatAddress(coldkey, 42);
        const delegatorState: TaoStakingStakeOption[] = [];
        let bnTotalBalance = BN_ZERO;

        const totalDelegate: Record<string, string> = {};

        for (const delegate of stakeInfos) {
          const hotkey = delegate.hotkey;
          const netuid = delegate.netuid;
          const stake = new BigN(delegate.stake);

          if (netuid === 0) {
            const taoStake = stake.toFixed(0);

            if (totalDelegate[hotkey]) {
              totalDelegate[hotkey] = new BigN(totalDelegate[hotkey]).plus(taoStake).toFixed();
            } else {
              totalDelegate[hotkey] = taoStake;
            }
          }
        }

        for (const hotkey in totalDelegate) {
          bnTotalBalance = bnTotalBalance.add(new BN(totalDelegate[hotkey]));

          delegatorState.push({
            owner: hotkey,
            amount: totalDelegate[hotkey],
            identity: names[hotkey] ?? ''
          });
        }

        if (delegateStateInfo && delegateStateInfo.length > 0) {
          this.parseNominatorMetadata(chainInfo, delegatorState)
            .then((nominatorMetadata) => {
              rsCallback({
                ...defaultInfo,
                ...nominatorMetadata,
                address: owner,
                type: this.type
              });
            })
            .catch(console.error);
        } else {
          rsCallback({
            ...defaultInfo,
            type: this.type,
            address: owner,
            balanceToken: this.nativeToken.slug,
            totalStake: '0',
            activeStake: '0',
            unstakeBalance: '0',
            status: EarningStatus.NOT_STAKING,
            isBondedBefore: false,
            nominations: [],
            unstakings: []
          });
        }
      });
    };

    const getStakingPositionInterval = async () => {
      if (cancel) {
        return;
      }

      await getPoolPosition();
    };

    getStakingPositionInterval().catch(console.error);

    const intervalId = setInterval(() => {
      getStakingPositionInterval().catch(console.error);
    }, BITTENSOR_REFRESH_STAKE_INFO);

    return () => {
      cancel = true;
      clearInterval(intervalId);
    };
  }

  // Because not have subscan api
  override async checkAccountHaveStake (useAddresses: string[]): Promise<string[]> {
    return Promise.resolve([]);
  }

  /* Get pool reward */

  /**
   * The claim to send now and what it pays (EXT-9). The figure comes from the chain's claim preview,
   * not the entitlement: a claim skips a fund's dust rows yet burns the whole entitlement, so
   * `get_root_basket_positions` overstates small claims. Empty on runtimes without the preview API.
   */
  protected async getRootClaimPlan (address: string, threshold: BigN): Promise<RootClaimPlan> {
    const substrateApi = await this.substrateApi.isReady;

    if (!substrateApi.api.call?.betaBasketRuntimeApi?.getRootBasketClaimPreviews) {
      return planRootClaim({ previews: [], rootHotkeys: [], threshold });
    }

    const previews = (await substrateApi.api.call.betaBasketRuntimeApi.getRootBasketClaimPreviews(address)).toPrimitive() as unknown as RootClaimPreview[];
    // `claim_root` also counts root hotkeys with nothing owed yet; only needed when it could settle several
    const rootHotkeys = previews.filter((preview) => new BigN(preview.redeemableTao).gte(BigN.max(threshold, 1))).length > 1
      ? await this.getRootHotkeys(address)
      : [];

    return planRootClaim({ previews, rootHotkeys, threshold });
  }

  /** Hotkeys the coldkey has root stake on. */
  protected async getRootHotkeys (address: string): Promise<string[]> {
    const substrateApi = await this.substrateApi.isReady;
    const stakes = (await substrateApi.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address)).toPrimitive() as unknown as TaoStakeInfo[];

    return stakes.filter((row) => row.netuid === 0 && new BigN(row.stake).gt(0)).map((row) => row.hotkey);
  }

  /** The claim extrinsic a plan calls for; undefined when nothing can be claimed. */
  protected async buildRootClaim (plan: RootClaimPlan): Promise<SubmittableExtrinsic<'promise'> | undefined> {
    const substrateApi = await this.substrateApi.isReady;

    if (plan.call === 'claimRoot') {
      // `subnets` is ignored since v4.4.1, it is kept only so old call data still decodes
      return substrateApi.api.tx.subtensorModule.claimRoot([]);
    }

    if (plan.call === 'claimRootWithHotkey' && plan.hotkey) {
      return substrateApi.api.tx.subtensorModule.claimRootWithHotkey(plan.hotkey);
    }

    return undefined;
  }

  /** What the planned claim costs, in rao — flat whatever it pays (10-13); undefined when it cannot be estimated. */
  protected async getRootClaimFee (address: string, plan: RootClaimPlan): Promise<BigN | undefined> {
    try {
      const extrinsic = await this.buildRootClaim(plan);

      if (!plan.call || !extrinsic) {
        return undefined;
      }

      return await this.rootClaimFees.get(plan.call, async () => new BigN((await extrinsic.paymentInfo(address)).partialFee.toString()));
    } catch (e) {
      console.error(e);

      return undefined;
    }
  }

  /** Minimum payout, in rao, a single validator must owe before the chain settles a claim on it */
  protected async getRootClaimThreshold (): Promise<BigN> {
    const substrateApi = await this.substrateApi.isReady;

    if (!substrateApi.api.query.subtensorModule?.rootClaimableThreshold) {
      return UNKNOWN_ROOT_CLAIM_THRESHOLD;
    }

    try {
      return parseRootClaimThreshold((await substrateApi.api.query.subtensorModule.rootClaimableThreshold(0)).toJSON());
    } catch (e) {
      console.error(e);

      return UNKNOWN_ROOT_CLAIM_THRESHOLD;
    }
  }

  override async getPoolReward (useAddresses: string[], callback: (rs: EarningRewardItem) => void): Promise<VoidFunction> {
    let cancel = false;

    // Root claims are fund-level on netuid 0, subnet (alpha) positions have nothing to claim
    if (this.type !== YieldPoolType.NATIVE_STAKING) {
      return noop;
    }

    await this.substrateApi.isReady;

    // Same for every address, so read it once per cycle rather than per address
    const threshold = await this.getRootClaimThreshold();
    let feePromise: Promise<BigN | undefined> | undefined;

    await Promise.all(useAddresses.map(async (address) => {
      if (cancel) {
        return;
      }

      try {
        // Pays 0 on runtimes without the preview API, so the UI still settles
        const plan = await this.getRootClaimPlan(address, threshold);

        // What the next claim pays: every validator, or the one paying most when they must be claimed one at a time
        const earningRewardItem: EarningRewardItem = {
          ...this.baseInfo,
          address: address,
          type: this.type,
          unclaimedReward: plan.pays.toFixed(),
          partialClaim: plan.remainingValidators > 0
            ? { remainingValidators: plan.remainingValidators, remainingReward: plan.remainingReward.toFixed() }
            : undefined,
          state: APIItemState.READY
        };

        if (plan.pays.gt(0)) {
          // The fee is flat whatever a claim pays, so one estimate serves every address in the cycle
          feePromise = feePromise ?? this.getRootClaimFee(address, plan);

          if (isRootClaimWorthNotifying(plan.pays, await feePromise)) {
            await this.createClaimNotification(earningRewardItem, this.nativeToken);
          }
        }

        callback(earningRewardItem);
      } catch (e) {
        console.error(e);
      }
    }));

    return () => {
      cancel = true;
    };
  }

  /* Get pool reward */

  /* Claim reward action */

  override async handleYieldClaimReward (address: string, bondReward?: boolean): Promise<TransactionData> {
    const substrateApi = await this.substrateApi.isReady;

    if (!substrateApi.api.tx.subtensorModule.claimRoot || !substrateApi.api.tx.subtensorModule.claimRootWithHotkey) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    // Fresh previews, so the claim matches the chain now rather than the last reward cycle
    const threshold = await this.getRootClaimThreshold();
    const plan = await this.getRootClaimPlan(address, threshold);
    // Redemption is fund-level: the payout is sold to TAO and re-staked on root, so
    // `bondReward` has no meaning here
    const extrinsic = await this.buildRootClaim(plan);

    if (extrinsic) {
      return extrinsic;
    }

    // A claim that pays nothing succeeds as a no-op that still charges a fee; one over budget is refused and charged
    const symbol = _getAssetSymbol(this.nativeToken);
    const message = plan.error === 'tooHeavy'
      ? t('bg.EARNING.services.service.earning.nativeStaking.tao.rootClaimTooHeavy')
      : t('bg.EARNING.services.service.earning.nativeStaking.tao.rewardBelowClaimThreshold', { replace: { threshold: formatNumber(threshold, _getAssetDecimals(this.nativeToken)), symbol } });

    return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS, message));
  }

  /* Claim reward action */

  /* Subscribe pool position */

  /**
   * The APR of the pool on screen (EXT-1). A subnet's from the chain, as BE-2 defined it: the hotkeys paid in its last
   * epoch and their stake, 2–3 requests. Undefined when there is no figure — a subnet that never runs its epoch
   * (`tempo` 0), or one that has not run an epoch since it registered; a subnet that paid no staker is a measured 0.
   * Root's (netuid 0) from the proxy's 30-day figures (`getRootApr`).
   */
  public getSubnetApr (netuid: number): Promise<SubnetApr | undefined> {
    if (!netuid) {
      return this.getRootApr();
    }

    return this.subnetAprReads.get(String(netuid), async () => {
      const { api } = await this.substrateApi.isReady;
      const q = api.query.subtensorModule;
      const [entries, tempoCodec, lastEpochCodec, registeredCodec] = await Promise.all([
        q.alphaDividendsPerSubnet.entries(netuid),
        q.tempo(netuid),
        readOptional(() => q.lastEpochBlock(netuid)),
        readOptional(() => q.networkRegisteredAt(netuid))
      ]);
      const tempo = Number(tempoCodec.toString());

      if (lastEpochCodec && registeredCodec && new BigN(lastEpochCodec.toString()).lte(registeredCodec.toString())) {
        return undefined;
      }

      const paid = entries
        .map(([key, value]) => ({ hotkey: key.args[1].toString(), dividend: new BigN(value.toString()) }))
        .filter(({ dividend }) => dividend.gt(0));
      // Read in the same round as the dividends would be better; A − D is 0.004% off at the median (BE-2)
      const totals = paid.length ? await q.totalHotkeyAlpha.multi(paid.map(({ hotkey }) => [hotkey, netuid])) : [];

      return getSubnetApr(paid.map((row, index) => ({ ...row, totalAlpha: new BigN(totals[index].toString()) })), tempo);
    });
  }

  /**
   * Root's APR from the proxy's 30-day figures, which stay its source (BE-11 dropped, 10-22): each validator's, and the
   * best among those holding ≥ 1% of the root stake listed. Undefined on testnet, which the proxy has no figures for,
   * or when the proxy lists none.
   */
  private getRootApr (): Promise<SubnetApr | undefined> {
    if (this.chain !== 'bittensor') {
      return Promise.resolve(undefined);
    }

    return this.subnetAprReads.get('0', async () => {
      const { data } = await this.bittensorCache.fetchApr(0);

      return getRootApr(data.map((item) => ({ hotkey: item.hotkey.ss58, stake: new BigN(item.stake || 0), apr: Number(item.thirty_day_apy) || 0 })));
    });
  }

  /**
   * Every subnet's APR at once, for the pool cards (EXT-1). Clients do not subscribe Bittensor pools: the static-data job
   * runs this and they read its figures from `yield-pools.json`. The whole dividend map, then the paid hotkeys' stakes:
   * on mainnet on 10-23, 16 requests and 3.7 MiB, against 2–3 requests a subnet for `getSubnetApr` one by one.
   */
  protected getAllSubnetAprs (): Promise<Record<number, SubnetApr | undefined>> {
    return this.allSubnetAprReads.get('all', async () => {
      const { api } = await this.substrateApi.isReady;
      const q = api.query.subtensorModule;
      const [entries, tempos, lastEpochs, registered] = await Promise.all([
        q.alphaDividendsPerSubnet.entries(),
        q.tempo.entries(),
        readOptional(() => q.lastEpochBlock.entries()),
        readOptional(() => q.networkRegisteredAt.entries())
      ]);
      const paid = entries
        .map(([key, value]) => ({ netuid: Number(key.args[0].toString()), hotkey: key.args[1].toString(), dividend: new BigN(value.toString()) }))
        .filter(({ dividend }) => dividend.gt(0));
      const totals: string[] = [];

      for (let i = 0; i < paid.length; i += 500) {
        const stakes = await q.totalHotkeyAlpha.multi(paid.slice(i, i + 500).map(({ hotkey, netuid }) => [hotkey, netuid]));

        totals.push(...stakes.map((stake) => stake.toString()));
      }

      const tempoByNetuid: Record<number, number> = {};
      const registeredAt: Record<number, string> = {};
      const notRun = new Set<number>();

      tempos.forEach(([key, value]) => {
        tempoByNetuid[Number(key.args[0].toString())] = Number(value.toString());
      });
      (registered ?? []).forEach(([key, value]) => {
        registeredAt[Number(key.args[0].toString())] = value.toString();
      });
      (lastEpochs ?? []).forEach(([key, value]) => {
        const netuid = Number(key.args[0].toString());

        if (registeredAt[netuid] !== undefined && new BigN(value.toString()).lte(registeredAt[netuid])) {
          notRun.add(netuid);
        }
      });

      const rows: NetuidDividendRow[] = paid.map((row, index) => ({ ...row, totalAlpha: new BigN(totals[index]) }));

      return getSubnetAprs(rows, tempoByNetuid, notRun);
    });
  }

  /** A validator's APR on subnet `netuid` from the chain, in percent, as the validator picker shows it */
  private async getChainValidatorReturns (netuid?: number): Promise<((hotkey: string) => string) | undefined> {
    let apr: SubnetApr | undefined;

    try {
      apr = netuid ? await this.getSubnetApr(netuid) : undefined;
    } catch (e) {
      console.error(e);
    }

    if (!apr) {
      return undefined;
    }

    const { byHotkey } = apr;

    return (hotkey: string) => new BigN(byHotkey[hotkey] ?? 0).multipliedBy(100).toFixed(2);
  }

  /* Get pool targets */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async getDevnetPoolTargets (netuid?: number): Promise<ValidatorInfo[]> {
    const testnetDelegate = (await this.substrateApi.api.call.delegateInfoRuntimeApi.getDelegates()).toJSON() as unknown as TestnetBittensorDelegateInfo[];
    const bnMinBond = await this.getMinBond(netuid);
    const chainReturn = await this.getChainValidatorReturns(netuid);

    const filteredDelegates = testnetDelegate.filter((delegate) => {
      return delegate.returnPer1000 !== 0;
    });

    return filteredDelegates.map((delegate) => ({
      address: delegate.delegateSs58,
      totalStake: '0',
      ownStake: '0',
      otherStake: '0',
      minBond: bnMinBond.toString(),
      nominatorCount: delegate.nominators.length,
      commission: delegate.take / 1000,
      ...(chainReturn ? { expectedReturn: chainReturn(delegate.delegateSs58) } : {}),
      blocked: false,
      isVerified: false,
      chain: this.chain,
      isCrowded: false
    }) as unknown as ValidatorInfo);
  }

  /** A subnet's paid hotkeys and their APR from the chain's last epoch (EXT-1); no APR when the chain has no figure */
  private async getSubnetReturns (netuid: number): Promise<ValidatorReturns> {
    const apr = await this.getSubnetApr(netuid);

    return {
      paid: Object.keys(apr?.byHotkey ?? {}),
      expectedReturn: apr ? (hotkey) => new BigN(apr.byHotkey[hotkey] ?? 0).multipliedBy(100).toFixed(2) : undefined
    };
  }

  /** Root's paid hotkeys, root dividends on any subnet in its last epoch, and their 30-day APR from the proxy (`getRootApr`) */
  private async getRootReturns (at: ApiDecoration<'promise'>): Promise<ValidatorReturns> {
    const [dividends, apr] = await Promise.all([
      readOptional(() => at.query.subtensorModule.rootAlphaDividendsPerSubnet.entries()),
      this.getRootApr()
    ]);

    const paid = (dividends ?? []).filter(([, value]) => new BigN(value.toString()).gt(0)).map(([key]) => key.args[1].toString());

    return {
      paid: [...new Set(paid)],
      expectedReturn: apr ? (hotkey) => new BigN(apr.byHotkey[hotkey] ?? 0).multipliedBy(100).toFixed(2) : undefined
    };
  }

  /**
   * The validators on `netuid` from the chain (EXT-14, BE-4), root (0) included, which replaced the static
   * `validator.json`; all at one block. Listed: permit holders and the hotkeys paid in the last epoch, on root its root
   * dividends on any subnet: 52 hotkeys on 10-21, all registered on root, holding its root stake; a subnet before its
   * first epoch has neither and lists its owner's hotkey. Each with its stake on this subnet, on root its alpha on every
   * subnet at spot, plus root stake × TaoWeight, take and owner identity; largest stake weight first. Nominator counts
   * come from the proxy, 0 when it has none.
   */
  private async getMainnetPoolTargets (netuid: number): Promise<ValidatorInfo[]> {
    const { api } = await this.substrateApi.isReady;
    // One block for the whole list; pinned, each `multi` is one `state_queryStorageAt` instead of a subscription
    const at = await api.at((await api.rpc.chain.getBlockHash()).toHex(), api.runtimeVersion);
    const q = at.query.subtensorModule;
    const [permits, { expectedReturn, paid }, taoWeightCodec, prices, bnMinBond, nominatorCounts] = await Promise.all([
      q.validatorPermit(netuid),
      netuid ? this.getSubnetReturns(netuid) : this.getRootReturns(at),
      readOptional(() => q.taoWeight()),
      readAlphaPrices(api),
      this.getMinBond(netuid),
      this.bittensorCache.fetchNominatorCounts(netuid)
    ]);
    const uids = getPermittedUids(permits.toPrimitive() as boolean[]);
    const permitted = uids.length ? (await q.keys.multi(uids.map((uid) => [netuid, uid]))).map(String) : [];
    let hotkeys = getValidatorHotkeys(permitted, paid);

    if (!hotkeys.length && netuid) {
      const ownerHotkey = await readOptional(() => q.subnetOwnerHotkey(netuid));

      hotkeys = ownerHotkey && !ownerHotkey.isEmpty ? [ownerHotkey.toString()] : [];
    }

    if (!hotkeys.length) {
      return [];
    }

    const taoPerAlpha = getTaoPerAlphaMap(prices);
    // Root shows each validator's alpha on every subnet, as `validator.json`'s `global_alpha_stake_as_tao` did
    const stakeNetuids = netuid ? [netuid] : prices.map((price) => price.netuid).filter((id) => id > 0);
    const [alphas, rootStakes, takes, owners] = await Promise.all([
      q.totalHotkeyAlpha.multi(hotkeys.flatMap((hotkey) => stakeNetuids.map((id) => [hotkey, id]))),
      q.totalHotkeyAlpha.multi(hotkeys.map((hotkey) => [hotkey, 0])),
      q.delegates.multi(hotkeys),
      q.owner.multi(hotkeys)
    ]);
    const identities = await q.identitiesV2.multi(owners.map(String));
    const taoWeight = decodeTaoWeight(taoWeightCodec?.toString());

    return hotkeys
      .map((address, index) => {
        const { rootWeight, subnetStake, totalStake } = getValidatorStake(
          {
            alphas: stakeNetuids.map((id, k) => ({ alpha: new BigN(alphas[index * stakeNetuids.length + k].toString()), taoPerAlpha: taoPerAlpha[id] ?? new BigN(0) })),
            rootStake: new BigN(rootStakes[index].toString())
          },
          taoWeight
        );
        const name = decodeIdentityName(identities[index].toJSON());

        return {
          address,
          totalStake: totalStake.toFixed(0),
          ownStake: rootWeight.toFixed(0),
          otherStake: subnetStake.toFixed(0),
          minBond: bnMinBond.toString(),
          nominatorCount: nominatorCounts[address] ?? 0,
          commission: formatTake(takes[index].toString()),
          ...(expectedReturn ? { expectedReturn: expectedReturn(address) } : {}),
          blocked: false,
          isVerified: false,
          chain: this.chain,
          isCrowded: false,
          identity: name || address
        } as unknown as ValidatorInfo;
      })
      .sort((a, b) => new BigN(b.totalStake).comparedTo(a.totalStake));
  }

  async getPoolTargets (netuid?: number): Promise<ValidatorInfo[]> {
    if (this.chain === 'bittensor') {
      return this.getMainnetPoolTargets(netuid ?? 0);
    } else {
      return this.getDevnetPoolTargets(netuid);
    }
  }

  /* Get pool targets */

  /* Join pool action */

  /**
   * The limit price of a stake (`isStake`) or an unstake of `amount` on `netuid`, in rao per alpha: the pool
   * price once the trade fills, with `slippage` left for other trades (EXT-6). Root sells 1:1. Without the
   * chain's simulation it falls back to spot.
   */
  protected async getLimitPrice (netuid: number, amount: BigN, slippage: number, isStake: boolean): Promise<BigN> {
    if (netuid !== 0) {
      try {
        const { api } = await this.substrateApi.isReady;
        const { priceAfter } = await simulateSubnetTrade(api, netuid, amount, isStake);

        return getStakeLimitPrice(priceAfter, slippage, isStake);
      } catch (e) {
        console.error(e);
      }
    }

    const alphaToTaoPrice = new BigN(await getAlphaToTaoRate(this.substrateApi, netuid, this.getAlphaPriceScaleDecimals()));

    return getStakeLimitPrice(alphaToTaoPrice, slippage, isStake);
  }

  override async createJoinExtrinsic (
    data: SubmitJoinNativeStaking,
    positionInfo?: YieldPositionInfo,
    bondDest = 'Staked'
  ): Promise<[TransactionData, YieldTokenBaseInfo]> {
    const { amount, selectedValidators: targetValidators, subnetData } = data;

    const chainApi = await this.substrateApi.isReady;
    const binaryAmount = new BigN(amount);
    const selectedValidatorInfo = targetValidators[0];
    const hotkey = selectedValidatorInfo.address;

    const netuid = subnetData?.netuid ?? 0;
    const slippage = subnetData?.slippage ?? DEFAULT_BITTENSOR_SLIPPAGE;
    const BNlimitPrice = await this.getLimitPrice(netuid, binaryAmount, slippage, true);

    const extrinsic = chainApi.api.tx.subtensorModule.addStakeLimit(
      hotkey,
      netuid,
      binaryAmount.toFixed(),
      BNlimitPrice.toFixed(),
      false
    );

    return [extrinsic, { slug: this.nativeToken.slug, amount: '0' }];
  }

  // Validate for case stake more
  public override async validateYieldJoin (data: SubmitJoinNativeStaking, path: OptimalYieldPath): Promise<TransactionError[]> {
    const baseErrors = await super.validateYieldJoin(data, path);

    if (baseErrors.length > 0) {
      return baseErrors;
    }

    const { amount, subnetData } = data;
    const netuid = subnetData?.netuid || 0;
    // Refused below what the chain takes; the message names the minimum the screens show, which is enough
    const [shownMinStake, minStake] = await Promise.all([this.getMinBond(netuid), this.getExactMinStake(netuid)]);

    if (new BigN(amount).lt(minStake)) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t('bg.EARNING.services.service.earning.nativeStaking.tao.insufficientStakeToEarn', { replace: { bnMinStake: formatNumber(shownMinStake, _getAssetDecimals(this.nativeToken)), symbol: _getAssetSymbol(this.nativeToken) } }))];
    }

    return baseErrors;
  }

  /* Join pool action */

  /* Leave pool action */

  /**
   * How unstaking `amount` from `hotkey` leaves the position, read from the chain (EXT-26), and with
   * `withMinimum`, for a partial unstake, the smallest amount the chain takes: one that sells for at least
   * `DefaultMinStake`. One round of parallel reads; the pool is simulated only for an amount near that minimum.
   * `unstakeAll` (Max) makes it a full exit whatever accrued after the amount was read.
   */
  public async getUnstakeDetail (address: string, hotkey: string, netuid: number, amount: string, withMinimum = false, unstakeAll = false): Promise<UnstakePlan & { minPartial?: BigN, nominatorMinStake: BigN, available?: BigN, taoPerUnit: BigN }> {
    const { api } = await this.substrateApi.isReady;
    // Only the stake and the price are needed; a runtime without one of the others skips that check
    const [stake, priceCodec, nominatorMinCodec, ownerCodec, availabilityCodec] = await Promise.all([
      this.getHotkeyStake(address, hotkey, netuid),
      netuid === 0 ? Promise.resolve(undefined) : api.call.swapRuntimeApi.currentAlphaPrice(netuid),
      readOptional(() => api.query.subtensorModule.nominatorMinRequiredStake()),
      readOptional(() => api.query.subtensorModule.owner(hotkey)),
      readOptional(() => api.call.stakeInfoRuntimeApi.getStakeAvailabilityForColdkeys([address], [netuid]))
    ]);
    // What the coldkey may take off the subnet: conviction-locked alpha cannot be unstaked (EXT-19)
    const availability = Object.values((availabilityCodec?.toPrimitive() ?? {}) as Record<string, Record<string, { available: number | string }>>)[0]?.[netuid];
    const available = availability ? new BigN(availability.available) : undefined;
    // Root is 1:1; a subnet's price is rao per alpha
    const taoPerUnit = netuid === 0 ? new BigN(1) : new BigN(priceCodec?.toString() || '0').dividedBy(1e9);
    // DefaultMinStake = InitialMinStake
    const minStake = new BigN(api.consts.subtensorModule.initialMinStake?.toString() || DEFAULT_MIN_STAKE);
    // `NominatorMinRequiredStake` is a per-million factor on DefaultMinStake (`get_nominator_min_required_stake`): 0.02 TAO on 10-19.
    // Unread, the remainder check is skipped: a swept remainder still comes back as free TAO
    const nominatorMinStake = nominatorMinCodec && ownerCodec ? minStake.multipliedBy(nominatorMinCodec.toString()).dividedToIntegerBy(1e6) : new BigN(0);
    const plan = planUnstake({ amount: new BigN(amount), stake, taoPerUnit, nominatorMinStake, ownsHotkey: isSameAddress(ownerCodec?.toString() || '', address), unstakeAll });

    // A remainder under the nominator minimum refuses the amount already
    if (plan.fullExit || plan.remainderTooSmall || !withMinimum) {
      return { ...plan, nominatorMinStake, available, taoPerUnit };
    }

    // `validate_remove_stake` wants a partial sale to pay at least DefaultMinStake (>=); root sells 1:1
    const spotMinimum = minStake.dividedBy(taoPerUnit).integerValue(BigN.ROUND_CEIL);

    // Twice the minimum at spot: the pool fee (0.05%) and the slippage of a sale this small cannot take it under
    if (netuid === 0 || new BigN(amount).gte(spotMinimum.multipliedBy(2))) {
      return { ...plan, minPartial: spotMinimum, nominatorMinStake, available, taoPerUnit };
    }

    let minPartial: BigN | undefined;

    try {
      minPartial = await findMinLeg(minStake.minus(1), taoPerUnit, async (alpha) => {
        const result = (await api.call.swapRuntimeApi.simSwapAlphaForTao(netuid, alpha.toFixed(0))).toPrimitive() as { taoAmount?: number | string };

        return new BigN(result.taoAmount ?? 0);
      });
    } catch (e) {
      // A runtime without the simulation: the minimum at spot
      minPartial = spotMinimum;
    }

    return { ...plan, minPartial, nominatorMinStake, available, taoPerUnit };
  }

  /** The coldkey's stake on `hotkey` on subnet `netuid`, in rao of the subnet's unit */
  private async getHotkeyStake (address: string, hotkey: string, netuid: number): Promise<BigN> {
    const { api } = await this.substrateApi.isReady;
    const rows = (await api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address)).toPrimitive() as unknown as TaoStakeInfo[];

    return rows
      .filter((row) => row.netuid === netuid && isSameAddress(row.hotkey, hotkey))
      .reduce((sum, row) => sum.plus(row.stake), new BigN(0));
  }

  override async handleYieldUnstake (amount: string, address: string, selectedTarget?: string, netuid = 0, slippage: number = DEFAULT_BITTENSOR_SLIPPAGE, unstakeAll = false): Promise<[ExtrinsicType, TransactionData]> {
    const apiPromise = await this.substrateApi.isReady;

    if (!selectedTarget) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const binaryAmount = new BigN(amount);

    // Validation already checked the minimum: only whether this is a full exit is needed here, which Max
    // always is (`planUnstake`). The limit prices `amount`: what accrues between the read and the block is too little to move it
    const [BNlimitPrice, fullExit] = await Promise.all([
      this.getLimitPrice(netuid, binaryAmount, slippage, false),
      unstakeAll ? true : this.getHotkeyStake(address, selectedTarget, netuid).then((stake) => binaryAmount.gte(stake))
    ]);

    // A full exit unstakes what is there when the block runs: rewards keep accruing after the amount was read
    if (fullExit && apiPromise.api.tx.subtensorModule.removeStakeFullLimit) {
      return [ExtrinsicType.STAKING_UNBOND, apiPromise.api.tx.subtensorModule.removeStakeFullLimit(selectedTarget, netuid, BNlimitPrice.toFixed())];
    }

    const extrinsic = apiPromise.api.tx.subtensorModule.removeStakeLimit(
      selectedTarget,
      netuid,
      binaryAmount.toFixed(),
      BNlimitPrice.toFixed(),
      false
    );

    return [ExtrinsicType.STAKING_UNBOND, extrinsic];
  }

  public override async validateYieldLeave (amount: string, address: string, fastLeave: boolean, selectedTarget?: string, slug?: string, poolInfo?: YieldPoolInfo, unstakeAll?: boolean): Promise<TransactionError[]> {
    const baseErrors = await super.validateYieldLeave(amount, address, fastLeave, selectedTarget, slug);

    if (baseErrors.length > 0) {
      return baseErrors;
    }

    if (!poolInfo) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS)];
    }

    if (!selectedTarget) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS)];
    }

    // A full exit has no minimum; a partial unstake must sell for at least the chain's minimum and leave
    // at least the nominator minimum, which the chain would otherwise unstake too (EXT-26)
    const { available, fullExit, minPartial, nominatorMinStake, remainderTooSmall, remaining, unstaked } = await this.getUnstakeDetail(address, selectedTarget, poolInfo.metadata.subnetData?.netuid || 0, amount, true, unstakeAll);
    const decimals = _getAssetDecimals(this.nativeToken);
    const symbol = poolInfo.metadata.subnetData?.subnetSymbol || _getAssetSymbol(this.nativeToken);

    // Conviction-locked alpha cannot leave: the chain refuses `StakeUnavailable` (EXT-19)
    if (available && unstaked.gt(available)) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t('bg.EARNING.services.service.earning.nativeStaking.tao.unstakeAmountLocked', { replace: { available: formatNumber(available, decimals), symbol } }))];
    }

    if (remainderTooSmall) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t('bg.EARNING.services.service.earning.nativeStaking.tao.unstakeRemainderBelowMinimum', { replace: { remaining: formatNumber(remaining, decimals), minimum: formatNumber(nominatorMinStake, decimals), symbol } }))];
    }

    if (!fullExit && (!minPartial || new BigN(amount).lt(minPartial))) {
      const bnMinUnstake = minPartial ? formatMinimum(minPartial, decimals) : '-';

      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t('bg.EARNING.services.service.earning.nativeStaking.tao.unstakeAmountTooLow', { replace: { bnMinUnstake, symbol } }))];
    }

    return baseErrors;
  }

  /* Leave pool action */

  /* Change validator */
  override async handleChangeEarningValidator (data: SubmitBittensorChangeValidatorStaking): Promise<TransactionData> {
    const chainApi = await this.substrateApi.isReady;
    const { address, amount, maxAmount, metadata, originValidator, selectedValidators: targetValidators, subnetData } = data;

    if (!originValidator) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const netuid = subnetData?.netuid || 0;
    const selectedValidatorInfo = targetValidators[0];
    const destValidator = selectedValidatorInfo.address;

    if (new BigN(amount).lte(0)) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS, t('bg.EARNING.services.service.earning.nativeStaking.tao.amountMustBeGreaterThanZero')));
    }

    if (originValidator === destValidator) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS, t('bg.EARNING.services.service.earning.nativeStaking.tao.fromValidatorSameAsTo')));
    }

    // A move within the subnet (`transfer_stake_within_subnet`) only has to be worth `InitialMinTransfer` at spot;
    // between one coldkey's own hotkeys it ignores locks and leaves the rest where it is (EXT-20)
    const { fullExit, nominatorMinStake, remainderTooSmall, remaining, taoPerUnit } = await this.getUnstakeDetail(address, originValidator, netuid, amount, false, amount === maxAmount);
    const decimals = _getAssetDecimals(this.nativeToken);
    const symbol = metadata?.subnetSymbol || _getAssetSymbol(this.nativeToken);

    // At price 0 every amount is worth 0 TAO, so the chain refuses any move (EXT-27)
    if (taoPerUnit.lte(0)) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS, t('bg.EARNING.services.service.earning.nativeStaking.tao.moveStakeSubnetUnpriced', { replace: { symbol } })));
    }

    const minTransfer = new BigN(chainApi.api.consts.subtensorModule.initialMinTransfer?.toString() || DEFAULT_MIN_TRANSFER);

    if (getWorthAtSpot(new BigN(amount), taoPerUnit).lt(minTransfer)) {
      const minimum = getMinimumAtSpot(minTransfer, taoPerUnit);

      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS, t('bg.EARNING.services.service.earning.nativeStaking.tao.moveStakeAmountTooLow', { replace: { bnMinMoveStake: minimum ? formatMinimum(minimum, decimals) : '-', symbol } })));
    }

    // The chain does not sweep what a move leaves, but under the nominator minimum it could then only be
    // unstaked or moved in full, as unstake holds it (EXT-26): offer to move it all. The type travels as
    // the error's data, so the screen does not have to recognise the translated text
    if (!fullExit && remainderTooSmall) {
      return Promise.reject(new TransactionError(StakingTxErrorType.REMAINING_AMOUNT_TOO_LOW,
        t('bg.EARNING.services.service.earning.nativeStaking.tao.remainingStakeBelowMinimumWarning', { replace: { remaining: formatNumber(remaining, decimals), minimum: formatNumber(nominatorMinStake, decimals), maxAmount: formatNumber(maxAmount, decimals), subnetSymbol: symbol } }),
        { errorType: StakingTxErrorType.REMAINING_AMOUNT_TOO_LOW }));
    }

    return chainApi.api.tx.subtensorModule.moveStake(originValidator, destValidator, netuid, netuid, amount);
  }

  /* Unimplemented function  */
  public override handleYieldWithdraw (address: string, unstakingInfo: UnstakingInfo): Promise<TransactionData> {
    return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
  }

  public override handleYieldCancelUnstake (params: StakeCancelWithdrawalParams): Promise<TransactionData> {
    return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
  }
  /* Unimplemented function  */
}
