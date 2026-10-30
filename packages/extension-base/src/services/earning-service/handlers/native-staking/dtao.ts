// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { BITTENSOR_REFRESH_STAKE_APY, BITTENSOR_REFRESH_STAKE_INFO } from '@subwallet/extension-base/constants';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { BaseYieldPositionInfo, EarningStatus, NativeYieldPoolInfo, RequestEarningImpact, YieldPoolInfo, YieldPoolMethodInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { DEFAULT_SWAP_FEE_RATE, getPriceImpact, readAlphaPrices, reformatAddress, SWAP_FEE_RATE_SCALE } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';

import { BN_ZERO } from '@polkadot/util';

import { readSubnetFeeRate, simulateSubnetTrade } from './bittensor-pool';
import { createPositionGate } from './bittensor-positions';
import TaoNativeStakingPoolHandler, { BITTENSOR_BLOCK_TIME, RateSubnetData, TaoStakeInfo, TaoStakingStakeOption } from './tao';

export interface SubnetData {
  netuid: number;
  name: string;
  symbol: string;
  ownerHotkey: string;
  maxAllowedValidators: number;
  taoIn: number;
  taoInEmission: number;
  tempo: number;
}

interface DynamicInfo {
  netuid: number;
  ownerHotkey: string;
  subnetName: number[];
  tokenSymbol: number[];
  subnetIdentity?: {
    subnetName: `0x${string}`;
  },
  taoIn: number;
  taoInEmission: number;
  /** Blocks between the subnet's epochs, when it pays its stakers */
  tempo: number;
}

interface SubnetsInfo {
  netuid: number;
  maxAllowedValidators: number;
}

interface SubnetPriceData {
  netuid: number;
  price: string | number;
}

export interface EarningImpactResult {
  slippage: number;
  rate: number;
  stakingTaoFee?: string;
}

interface SubnetPosition {
  delegatorState: TaoStakingStakeOption[];
  totalBalance: BigN;
  originalTotalStake: BigN;
}

/** Bittensor testnet's subnets listed as pools: the first this many by netuid */
const TESTNET_SUBNET_LIMIT = 100;

const getAlphaToTaoRateMap = async (substrateApi: _SubstrateApi, priceScaleDecimals = 9): Promise<Record<number, string>> => {
  const result = Object.create(null) as Record<number, string>;
  const PRICE_SCALE = new BigN(10).pow(priceScaleDecimals);

  // Shared with the price list and the alpha balances, which read it on their own timers
  const allSubnetPrices: SubnetPriceData[] | undefined = await readAlphaPrices(substrateApi.api);

  if (allSubnetPrices && allSubnetPrices.length > 0) {
    for (const subnetPrice of allSubnetPrices) {
      const netuid = subnetPrice?.netuid;

      if (netuid === undefined) {
        continue;
      }

      const rawPrice = subnetPrice?.price ? new BigN(subnetPrice.price) : new BigN(0);

      result[netuid] = netuid === 0 ? '1' : rawPrice.dividedBy(PRICE_SCALE).toFixed();
    }
  }

  return result;
};

export default class SubnetTaoStakingPoolHandler extends TaoNativeStakingPoolHandler {
  // @ts-ignore
  public override readonly type = YieldPoolType.SUBNET_STAKING;

  // Root claims redeem the basket of a netuid 0 position, subnet (alpha) positions have nothing to claim
  public override readonly availableMethod: YieldPoolMethodInfo = {
    join: true,
    defaultUnstake: true,
    fastUnstake: false,
    cancelUnstake: false,
    withdraw: false,
    claimReward: false,
    changeValidator: true
  };

  public override slug: string;
  protected override name: string;
  protected override shortName: string;
  public subnetData: SubnetData[] = [];
  private isInit = false;

  constructor (state: KoniState, chain: string) {
    super(state, chain);

    const symbol = this.nativeToken.symbol;
    const chainSlug = this.chainInfo.slug;

    this.slug = `${symbol}___subnet_staking___${chainSlug}`;
    this.name = 'Subnet Tao Staking';
    this.shortName = 'dTAO Staking';
  }

  public override canHandleSlug (slug: string): boolean {
    return slug.startsWith(`${this.slug}__`);
  }

  /**
   * Preview of staking `value` TAO or unstaking `value` alpha (EXT-5): price impact and pool fee from the
   * chain's own simulation, the rate at spot, no fudge. The impact leaves the fee out; the limit price
   * leaves the slippage setting for other trades (EXT-6), so a trade whose impact is within it goes
   * through. Runtimes without the simulation fall back to the x·y=k estimate.
   */
  public override async getEarningImpact (params: RequestEarningImpact): Promise<EarningImpactResult> {
    const isStake = params.type === ExtrinsicType.STAKING_BOND;

    if (!isStake && params.type !== ExtrinsicType.STAKING_UNBOND) {
      return { slippage: 0, rate: 1 };
    }

    const input = new BigN(params.value || 0);
    const value = input.isFinite() && input.gt(0) ? input : new BigN(0);

    try {
      const { api } = await this.substrateApi.isReady;
      const { fee, out, spot } = await simulateSubnetTrade(api, params.netuid, value, isStake);

      if (spot.lte(0)) {
        throw new Error(`Subnet ${params.netuid} has no price`);
      }

      // What the input less its fee would fetch at spot
      const ideal = isStake ? value.minus(fee).dividedBy(spot) : value.minus(fee).multipliedBy(spot);

      return {
        slippage: getPriceImpact(ideal, out),
        rate: spot.toNumber(),
        // An unstake pays the fee in alpha
        stakingTaoFee: (isStake ? fee : fee.multipliedBy(spot)).integerValue(BigN.ROUND_FLOOR).toFixed(0)
      };
    } catch (e) {
      console.error(e);

      return this.estimateEarningImpact(params);
    }
  }

  /** The x·y=k preview, with the chain's fee rate (BE-5): only for runtimes without the chain's simulation. */
  private async estimateEarningImpact (params: RequestEarningImpact): Promise<EarningImpactResult> {
    const substrateApi = await this.substrateApi.isReady;
    const subnetInfo = (await substrateApi.api.call.subnetInfoRuntimeApi.getDynamicInfo(params.netuid)).toJSON() as RateSubnetData | undefined;

    const alphaIn = new BigN(subnetInfo?.alphaIn || 0);
    const taoIn = new BigN(subnetInfo?.taoIn || 0);
    const k = alphaIn.multipliedBy(taoIn);

    const value = new BigN(params.value);
    const rate = taoIn.dividedBy(alphaIn);

    const chainFeeRate = await readSubnetFeeRate(substrateApi.api, params.netuid);
    const feeRate = chainFeeRate ? chainFeeRate.dividedBy(SWAP_FEE_RATE_SCALE) : new BigN(DEFAULT_SWAP_FEE_RATE);

    if (params.type === ExtrinsicType.STAKING_BOND) {
      const newTaoIn = taoIn.plus(value);
      const newAlphaIn = k.dividedBy(newTaoIn);
      const alphaReturned = alphaIn.minus(newAlphaIn);
      const alphaIdeal = value.multipliedBy(alphaIn).dividedBy(taoIn);
      const slippage = alphaIdeal.minus(alphaReturned).dividedBy(alphaIdeal);

      const bnStakingTaoFee = value.multipliedBy(feeRate);

      return {
        slippage: slippage.plus(0.0001).toNumber(),
        rate: rate.toNumber(),
        stakingTaoFee: bnStakingTaoFee.toString()
      };
    }

    const newAlphaIn = alphaIn.plus(value);
    const newTaoReserve = k.dividedBy(newAlphaIn);
    const taoReturned = taoIn.minus(newTaoReserve);
    const taoIdeal = value.multipliedBy(taoIn).dividedBy(alphaIn);
    const slippage = taoIdeal.minus(taoReturned).dividedBy(taoIdeal);

    const taoAmount = value.multipliedBy(rate);
    const bnStakingTaoFee = taoAmount.multipliedBy(feeRate);

    return {
      slippage: slippage.plus(0.0001).toNumber(),
      rate: rate.toNumber(),
      stakingTaoFee: bnStakingTaoFee.toString()
    };
  }

  private async init (forceRefresh = false): Promise<void> {
    try {
      if ((this.isInit && !forceRefresh) || !this.substrateApi) {
        return;
      }

      const substrateApi = await this.substrateApi.isReady;
      const dynamicInfo = (await substrateApi.api.call.subnetInfoRuntimeApi.getAllDynamicInfo()).toJSON() as DynamicInfo[] | undefined;
      const subnetsInfo = (await substrateApi.api.call.subnetInfoRuntimeApi.getSubnetsInfoV2()).toJSON() as SubnetsInfo[] | undefined;

      if (dynamicInfo && subnetsInfo) {
        // Testnet keeps only its first 100 subnets by netuid, of 595 on 10-21. The others made 85% of the static
        // cache's validator lists, all copies of one global list, and of the files it rewrites each run
        const subnets = dynamicInfo.filter((dynInfo) => dynInfo.netuid !== 0).sort((a, b) => a.netuid - b.netuid);
        const mergedData = (this.chain === 'bittensor_testnet' ? subnets.slice(0, TESTNET_SUBNET_LIMIT) : subnets)
          .map((dynInfo) => {
            const extraInfo = subnetsInfo.find((subnet) => subnet.netuid === dynInfo.netuid);

            const nameRaw = dynInfo.subnetIdentity?.subnetName || String.fromCharCode(...dynInfo.subnetName);
            const identityName = dynInfo.subnetIdentity?.subnetName
              ? Buffer.from(dynInfo.subnetIdentity.subnetName.slice(2), 'hex').toString('utf-8')
              : '';
            const formattedIdentityName = identityName
              ? identityName.charAt(0).toUpperCase() + identityName.slice(1).toLowerCase()
              : '';
            const name = formattedIdentityName || nameRaw.charAt(0).toUpperCase() + nameRaw.slice(1);
            const symbol = new TextDecoder('utf-8').decode(Uint8Array.from(dynInfo.tokenSymbol));

            return {
              netuid: dynInfo.netuid,
              name,
              symbol,
              ownerHotkey: dynInfo.ownerHotkey,
              maxAllowedValidators: extraInfo ? extraInfo.maxAllowedValidators : 0,
              taoIn: dynInfo.taoIn,
              taoInEmission: dynInfo.taoInEmission,
              tempo: dynInfo.tempo
            };
          });

        this.subnetData = mergedData;
        this.isInit = true;
      }
    } catch (err) {
      console.error(err);
      this.isInit = false;
    }
  }

  protected override getDescription (): string {
    return 'Stake TAO to earn yield on dTAO';
  }

  /* Subscribe pool info */

  override async subscribePoolInfo (callback: (data: YieldPoolInfo) => void): Promise<VoidFunction> {
    await this.substrateApi.isReady;
    let cancel = false;

    const updateStakingInfo = async () => {
      await this.init(true);

      if (cancel) {
        return;
      }

      try {
        // Every subnet's APR in one pass: the static-data job runs this, clients read the cards from its cache (EXT-1)
        const aprs = await this.getAllSubnetAprs().catch((e) => {
          console.error(e);

          return undefined;
        });

        if (cancel) {
          return;
        }

        for (const subnet of this.subnetData) {
          const minStake = (await this.getMinBond(subnet.netuid)).toString();
          const apr = aprs?.[subnet.netuid];
          const netuid = subnet.netuid.toString().padStart(2, '0');
          const subnetSlug = `${this.slug}__subnet_${netuid}`;
          const subnetName = `${subnet.name || 'Unknown'} ${netuid}`;
          const bnTaoIn = new BigN(subnet.taoIn);
          const emission = new BigN(subnet.taoInEmission).dividedBy(new BigN(10).pow(7));

          const data: NativeYieldPoolInfo = {
            ...this.baseInfo,
            type: this.type,
            slug: subnetSlug,
            metadata: {
              ...this.metadataInfo,
              name: subnetName,
              shortName: subnetName,
              description: this.getDescription(),
              subnetData: {
                netuid: subnet.netuid,
                subnetSymbol: subnet.symbol || 'dTAO'
              },
              minValidate: minStake
            },
            statistic: {
              assetEarning: [{ slug: this.nativeToken.slug }],
              maxCandidatePerFarmer: subnet.maxAllowedValidators,
              maxWithdrawalRequestPerFarmer: 1,
              earningThreshold: {
                join: minStake,
                defaultUnstake: '0',
                fastUnstake: '0'
              },
              // A subnet pays its stakers every epoch, `tempo` blocks: 72 minutes on 124 of 128 mainnet subnets, 10-20.
              // An unstake is an immediate swap (EXT-16)
              eraTime: (subnet.tempo || 0) * BITTENSOR_BLOCK_TIME / 3600,
              era: 0,
              unstakingPeriod: 0,
              tvl: bnTaoIn.toString(),
              // Released clients show `totalApy` as the subnet's "Emission"; the card's APR is `upToApr`
              totalApy: emission.toNumber(),
              upToApr: apr ? apr.upTo * 100 : undefined
            }
          };

          callback(data);
        }
      } catch (error) {
        console.error('Error updating staking info:', error);
      }
    };

    const subscribeStakingMetadataInterval = () => {
      updateStakingInfo().catch(console.error);
    };

    subscribeStakingMetadataInterval();
    const interval = setInterval(subscribeStakingMetadataInterval, BITTENSOR_REFRESH_STAKE_APY);

    return () => {
      cancel = true;
      clearInterval(interval);
    };
  }

  /* Subscribe pool position */

  override async parseNominatorMetadata (chainInfo: _ChainInfo, delegatorState: TaoStakingStakeOption[], netuid?: number): Promise<Omit<YieldPositionInfo, keyof BaseYieldPositionInfo>> {
    const bnMinBond = await this.getMinBond(netuid);

    return this.parseNominatorMetadataBase(chainInfo, delegatorState, bnMinBond.toString(), true);
  }

  override async subscribePoolPosition (useAddresses: string[], rsCallback: (rs: YieldPositionInfo) => void): Promise<VoidFunction> {
    await this.init();
    let cancel = false;
    const substrateApi = await this.substrateApi.isReady;

    const defaultInfo = this.baseInfo;
    const chainInfo = this.chainInfo;
    // Each subnet's empty position once, not on every read (EXT-34)
    const shouldSend = createPositionGate();

    const getPoolPosition = async () => {
      const rawDelegateStateInfos = await substrateApi.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkeys(useAddresses);
      const delegateStateInfos = rawDelegateStateInfos.toPrimitive() as Array<[string, TaoStakeInfo[]]>;

      const alphaToTaoRateMap = await getAlphaToTaoRateMap(this.substrateApi, this.getAlphaPriceScaleDecimals());

      if (!delegateStateInfos || delegateStateInfos.length === 0) {
        return;
      }

      const subnetHotkeys = delegateStateInfos.flatMap(([, stakeInfos]) => stakeInfos.filter(({ netuid }) => netuid !== 0).map(({ hotkey }) => hotkey));
      const names = await this.getHotkeyNames([...new Set(subnetHotkeys)]);

      delegateStateInfos.forEach(([coldkey, stakeInfos]) => {
        const owner = reformatAddress(coldkey, 42);

        const subnetPositions: Record<number, SubnetPosition> = {};

        for (const delegate of stakeInfos) {
          const hotkey = delegate.hotkey;
          const netuid = delegate.netuid;

          if (netuid === 0) {
            continue;
          }

          const stake = new BigN(delegate.stake);
          const alphaToTaoPrice = new BigN(alphaToTaoRateMap[netuid]);

          if (!subnetPositions[netuid]) {
            subnetPositions[netuid] = {
              delegatorState: [],
              totalBalance: BigN(0),
              originalTotalStake: BigN(0)
            };
          }

          subnetPositions[netuid].delegatorState.push({
            owner: hotkey,
            amount: stake.toString(),
            rate: alphaToTaoPrice,
            identity: names[hotkey] ?? ''
          });

          subnetPositions[netuid].totalBalance = subnetPositions[netuid].totalBalance.plus(new BigN(stake.toString()));
          subnetPositions[netuid].originalTotalStake = subnetPositions[netuid].originalTotalStake.plus(new BigN(stake.toString()));
        }

        Object.values(this.subnetData).forEach((subnet) => {
          const netuid = subnet.netuid;
          const subnetSlug = `${this.slug}__subnet_${netuid.toString().padStart(2, '0')}`;
          const subnetName = `${subnet.name || 'Unknown'} ${netuid}`;
          const subnetSymbol = subnet.symbol || 'dTAO';

          const { delegatorState = [], originalTotalStake = BN_ZERO } = subnetPositions[netuid] || {};
          const hasStake = delegatorState.length > 0;

          if (!shouldSend(owner, subnetSlug, hasStake)) {
            return;
          }

          if (hasStake) {
            this.parseNominatorMetadata(chainInfo, delegatorState, netuid)
              .then((nominatorMetadata) => {
                rsCallback({
                  ...defaultInfo,
                  ...nominatorMetadata,
                  address: owner,
                  type: this.type,
                  slug: subnetSlug,
                  subnetData: {
                    subnetSymbol,
                    subnetShortName: subnetName,
                    originalTotalStake: originalTotalStake.toString()
                  }
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
              unstakings: [],
              slug: subnetSlug,
              subnetData: {
                subnetSymbol,
                subnetShortName: subnetName,
                originalTotalStake: '0'
              }
            });
          }
        });
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

  /* Subscribe pool position */
}
