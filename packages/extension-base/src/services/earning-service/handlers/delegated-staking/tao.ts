// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ALL_ACCOUNT_KEY, BITTENSOR_REFRESH_STAKE_INFO } from '@subwallet/extension-base/constants';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import { BalanceType, BasicTxErrorType, DelegatedStrategyInfo, DelegatedYieldPoolInfo, EarningStatus, HandleYieldStepData, OptimalYieldPath, PrimitiveSubstrateProxyAccountItem, RequestDelegateStakingSubmit, RequestEarlyValidateYield, ResponseEarlyValidateYield, StakeCancelWithdrawalParams, StakingTxErrorType, StrategyInfo, SubmitJoinDelegateStaking, SubmitYieldJoinData, TransactionData, UnstakingInfo, YieldPoolInfo, YieldPoolMethodInfo, YieldPoolType, YieldPositionInfo, YieldTokenBaseInfo } from '@subwallet/extension-base/types';
import { BN_TEN, isSameAddress, toBNString } from '@subwallet/extension-base/utils';
import BigNumber from 'bignumber.js';

import { getAlphaToTaoRate } from '../../utils/alpha-price';
import BaseNativeStakingPoolHandler from '../native-staking/base';
import { TaoStakeInfo } from '../native-staking/tao';

export interface TrustedStakeStrategy {
  id: string;
  name: string;
  description: string;
  proxyAddress: string;
  strategyType: 'STANDARD_ETF' | string;

  targetConstituents: {
    subnetWeights: Record<string, number>;
  };

  minBalance: number;
  isActive: boolean;
  type: 'official' | 'custom' | string;
}

interface TrustedStakeApyStrategy {
  strategyId: string;
  strategyName: string;
  weightedApy: string;
  subnetsWithData: number;
  totalSubnets: number;
  computationStatus: string;
  computedAt: string;
}

interface TrustedStakeApyResponse {
  count: number;
  lastRefreshed: string;
  strategies: TrustedStakeApyStrategy[];
}

// TrustedStake external APIs — strategies list and APY data
const trustedStakeApi = 'https://app.trustedstake.ai/api/strategies-active';
const trustedStakeApyApi = 'https://api.app.trustedstake.ai/tmc-apy';

export default class TaoDelegateStakingPoolHandler extends BaseNativeStakingPoolHandler {
  // @ts-ignore
  public override readonly type = YieldPoolType.DELEGATED_STAKING;

  // TTL caches for TrustedStake API responses — avoids repeated HTTP calls across subscriptions.
  // Each cache pair: a stored value + an in-flight promise to prevent duplicate concurrent fetches.
  private trustedStakeStrategiesCache: { value: TrustedStakeStrategy[]; expiredAt: number } | null = null;
  private trustedStakeStrategiesPromise: Promise<TrustedStakeStrategy[]> | null = null;
  private trustedStakeApyCache: { value: Map<string, number>; expiredAt: number } | null = null;
  private trustedStakeApyPromise: Promise<Map<string, number>> | null = null;

  override readonly availableMethod: YieldPoolMethodInfo = {
    join: true,
    defaultUnstake: true,
    fastUnstake: false,
    cancelUnstake: false,
    withdraw: false,
    claimReward: false,
    changeValidator: false
  };

  constructor (state: KoniState, chain: string) {
    super(state, chain);

    const symbol = this.nativeToken.symbol;
    const chainSlug = this.chainInfo.slug;

    this.slug = `${symbol}___delegated_staking___${chainSlug}`;
  }

  override async checkAccountHaveStake (): Promise<Array<string>> {
    return Promise.resolve([]);
  }

  public override async earlyValidate (data: RequestEarlyValidateYield): Promise<ResponseEarlyValidateYield> {
    const { address } = data;

    if (address === ALL_ACCOUNT_KEY) {
      return { passed: true };
    }

    const poolInfo = await this.getPoolInfo() as DelegatedYieldPoolInfo | undefined;

    if (!poolInfo) {
      return {
        passed: false,
        errorMessage: 'There is a problem fetching your data. Check your Internet connection or change the network endpoint and try again.'
      };
    }

    const decimals = _getAssetDecimals(this.nativeToken);
    const symbol = this.nativeToken.symbol;
    const pow = BN_TEN.pow(decimals);

    // maintainBalance for earlyValidate = pool-level joinThreshold (minimum across all strategies)
    const maintainBalance = poolInfo.metadata.maintainBalance || '0';
    const proxyDeposit = poolInfo.proxyDeposit || '0';

    const [totalEquivalent, transferableBalance] = await Promise.all([
      this.state.balanceService.getBalanceByType(
        address,
        this.chain,
        this.nativeToken.slug,
        BalanceType.TOTAL_EQUIVALENT
      ),
      this.state.balanceService.getTransferableBalance(
        address,
        this.chain,
        this.nativeToken.slug
      )
    ]);

    const bnTotalEquivalent = new BigNumber(totalEquivalent.value || '0');
    const bnTransferable = new BigNumber(transferableBalance.value || '0');
    const bnMaintainBalance = new BigNumber(maintainBalance);
    const bnProxyDeposit = new BigNumber(proxyDeposit);

    const parsedMaintainBalance = bnMaintainBalance.dividedBy(pow).toFixed();
    const parsedProxyDeposit = bnProxyDeposit.dividedBy(pow).toFixed();

    if (bnTotalEquivalent.lt(bnMaintainBalance) || bnTransferable.lt(bnProxyDeposit)) {
      return {
        passed: false,
        errorMessage: `You need a minimum total ${symbol}-equivalent balance of ${parsedMaintainBalance} ${symbol} with ${parsedProxyDeposit} ${symbol} on ${this.chainInfo.name} in your transferable balance to start earning`
      };
    }

    return { passed: true };
  }

  private normalizeStrategyName (name: string): string {
    return name.trim().toLowerCase();
  }

  /**
   * Fetch active TrustedStake strategies with TTL cache.
   * Reuses in-flight promise if a fetch is already in progress to prevent duplicate requests.
   * Falls back to stale cache on network error.
   */
  private async getTrustedStakeStrategies (): Promise<TrustedStakeStrategy[]> {
    const now = Date.now();

    if (this.trustedStakeStrategiesCache && this.trustedStakeStrategiesCache.expiredAt > now) {
      return this.trustedStakeStrategiesCache.value;
    }

    if (this.trustedStakeStrategiesPromise) {
      return this.trustedStakeStrategiesPromise;
    }

    this.trustedStakeStrategiesPromise = (async () => {
      try {
        const res = await fetch(trustedStakeApi);
        const data = await res.json() as TrustedStakeStrategy[];
        const activeStrategies = data.filter((s) => s.isActive);

        this.trustedStakeStrategiesCache = {
          value: activeStrategies,
          expiredAt: Date.now() + BITTENSOR_REFRESH_STAKE_INFO
        };

        return activeStrategies;
      } catch (e) {
        console.warn('Failed to fetch TrustedStake strategies', e);

        return this.trustedStakeStrategiesCache?.value || [];
      } finally {
        this.trustedStakeStrategiesPromise = null;
      }
    })();

    return this.trustedStakeStrategiesPromise;
  }

  /**
   * Fetch weighted APY per strategy with TTL cache.
   * NOTE: strategyId in the APY endpoint differs from id in strategies-active,
   * so APY is keyed by normalized strategy name (lowercase trim) instead.
   * Returns a Map<normalizedName, apy%>.
   */
  private async getTrustedStakeApyMap (): Promise<Map<string, number>> {
    const now = Date.now();

    if (this.trustedStakeApyCache && this.trustedStakeApyCache.expiredAt > now) {
      return this.trustedStakeApyCache.value;
    }

    if (this.trustedStakeApyPromise) {
      return this.trustedStakeApyPromise;
    }

    this.trustedStakeApyPromise = (async () => {
      try {
        const res = await fetch(trustedStakeApyApi);
        const data = await res.json() as TrustedStakeApyResponse;
        const apyMap = new Map<string, number>();

        data.strategies.forEach((item) => {
          if (item.computationStatus !== 'success') {
            return;
          }

          const apy = Number(item.weightedApy);

          // strategyId is different from strategies-active id, so map APY by strategy name.
          apyMap.set(this.normalizeStrategyName(item.strategyName), apy);
        });

        this.trustedStakeApyCache = {
          value: apyMap,
          expiredAt: Date.now() + BITTENSOR_REFRESH_STAKE_INFO
        };

        return apyMap;
      } catch (e) {
        console.warn('Failed to fetch TrustedStake APY', e);

        return this.trustedStakeApyCache?.value || new Map<string, number>();
      } finally {
        this.trustedStakeApyPromise = null;
      }
    })();

    return this.trustedStakeApyPromise;
  }

  // Pool-level join threshold = minimum minBalance across all active strategies.
  // Used as maintainBalance in poolInfo so the UI can show the lowest possible entry bar.
  private async getJoinThresholdFromTrustedStake (): Promise<string | null> {
    const activeStrategies = await this.getTrustedStakeStrategies();

    if (!activeStrategies.length) {
      return null;
    }

    const minBalance = Math.min(
      ...activeStrategies.map((s) => s.minBalance)
    );

    return minBalance.toString();
  }

  async subscribePoolInfo (callback: (data: YieldPoolInfo) => void): Promise<VoidFunction> {
    let cancel = false;

    const defaultCallback = async () => {
      const chainApi = await this.substrateApi.isReady;
      const apyMap = await this.getTrustedStakeApyMap();
      // totalApy shown on pool overview = highest APY across all strategies.
      const totalApy = this.chain === 'bittensor' ? Array.from(apyMap.values()).reduce((maxApy, apy) => Math.max(maxApy, apy), 0) : 0;

      const proxyDepositBase = chainApi.api.consts.proxy.proxyDepositBase;
      const proxyDepositFactor = chainApi.api.consts.proxy.proxyDepositFactor;

      // Calculate earning threshold as baseDeposit + depositFactor
      const proxyDeposit = proxyDepositBase.add(proxyDepositFactor).toString();

      // joinThreshold = min strategy minBalance (raw units). Falls back to proxyDeposit if API unavailable.
      const joinThreshold = toBNString((await this.getJoinThresholdFromTrustedStake() || 0), _getAssetDecimals(this.nativeToken)) || proxyDeposit;

      const data: DelegatedYieldPoolInfo = {
        ...this.baseInfo,
        type: this.type,
        metadata: {
          ...this.metadataInfo,
          description: this.getDescription(joinThreshold),
          minValidate: joinThreshold,
          maintainBalance: joinThreshold,
          name: 'TAO Delegated Staking'
        },
        statistic: {
          assetEarning: [{ slug: this.nativeToken.slug }],
          maxCandidatePerFarmer: 1,
          maxWithdrawalRequestPerFarmer: 1,
          earningThreshold: {
            join: joinThreshold,
            defaultUnstake: '0',
            fastUnstake: '0'
          },
          eraTime: 4,
          era: 0,
          unstakingPeriod: 0,
          totalApy
        },
        proxyDeposit: proxyDeposit
      };

      const poolInfo = await this.getPoolInfo();

      !poolInfo && callback(data);
    };

    if (!this.isActive) {
      await defaultCallback();

      return () => {
        cancel = true;
      };
    }

    await defaultCallback();

    const intervalId = setInterval(() => {
      if (!cancel) {
        defaultCallback().catch(console.error);
      }
    }, BITTENSOR_REFRESH_STAKE_INFO);

    return () => {
      cancel = true;
      clearInterval(intervalId);
    };
  }

  override async subscribePoolPosition (useAddresses: string[], rsCallback: (rs: YieldPositionInfo) => void): Promise<VoidFunction> {
    let cancel = false;

    const chainApi = await this.substrateApi.isReady;
    const defaultInfo = this.baseInfo;
    const chainInfo = this.chainInfo;

    const proxiesList = await chainApi.api.query.proxy.proxies.multi(useAddresses);

    const getPoolPosition = async () => {
      // Re-fetch strategies & APY each interval so data stays fresh within each poll cycle.
      const trustedStrategies = await this.getTrustedStakeStrategies();
      const apyMap = await this.getTrustedStakeApyMap();
      const rawStakeInfos = await chainApi.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkeys(useAddresses);

      const stakeInfos = rawStakeInfos.toPrimitive() as Array<[string, TaoStakeInfo[]]>;

      for (let i = 0; i < stakeInfos.length; i++) {
        const [owner, delegateStateInfo] = stakeInfos[i];

        const [proxies] = proxiesList[i].toPrimitive() as unknown as [PrimitiveSubstrateProxyAccountItem[], string];

        const stakingProxies = proxies?.filter((p) => p.proxyType === 'Staking') || [];

        if (!stakingProxies.length || !delegateStateInfo?.length) {
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

          continue;
        }

        // ===== 1. Accumulate stakes by token type =====
        // netuid=0 → native TAO stake; netuid>0 → alpha token stake on that subnet.
        // Transferable balance is included because it already represents liquid TAO held by the user.
        const transferableBalance = await this.state.balanceService.getTransferableBalance(
          owner,
          this.chain,
          this.nativeToken.slug
        );

        let taoNativeTotal = new BigNumber(transferableBalance.value || '0');

        const alphaByNetuid = new Map<number, BigNumber>();

        for (const delegate of delegateStateInfo) {
          const stake = new BigNumber(delegate.stake);
          const netuid = delegate.netuid;

          if (netuid === 0) {
            taoNativeTotal = taoNativeTotal.plus(stake);
          } else {
            const prev = alphaByNetuid.get(netuid) || new BigNumber(0);

            alphaByNetuid.set(netuid, prev.plus(stake));
          }
        }

        // ===== 2. Convert alpha → TAO using on-chain swap price =====
        // alphaPrice is fetched per netuid and cached to avoid repeated RPC calls.
        // rate = price / 10^decimals to normalize to human units.
        let totalTao = taoNativeTotal;

        for (const [netuid, totalAlpha] of alphaByNetuid.entries()) {
          try {
            const rate = await getAlphaToTaoRate(
              this.substrateApi,
              this.chain,
              netuid,
              _getAssetDecimals(this.nativeToken)
            );

            const taoEquivalent = totalAlpha.multipliedBy(rate);

            totalTao = totalTao.plus(taoEquivalent);
          } catch (e) {
            console.warn(`Failed alpha price for netuid ${netuid}`, e);
          }
        }

        // ===== 3. Match on-chain proxies to TrustedStake strategies =====
        // Only proxy accounts whose delegate address matches a known TrustedStake strategy
        // are counted as "trusted" — unrecognized proxies are excluded from nominations.
        const constituentsSet = new Set<string>();

        const decimals = _getAssetDecimals(this.nativeToken);

        const nominations = stakingProxies
          .map((proxy) => {
            const strategy = trustedStrategies.find((strategy) =>
              isSameAddress(strategy.proxyAddress, proxy.delegate)
            );

            if (!strategy) {
              return null;
            }

            Object.keys(strategy.targetConstituents.subnetWeights).forEach((subnet) => {
              constituentsSet.add(subnet);
            });

            return {
              status: EarningStatus.EARNING_REWARD,
              chain: chainInfo.slug,
              validatorAddress: proxy.delegate,
              activeStake: totalTao.toFixed(),
              validatorMinStake: toBNString(strategy.minBalance, decimals),
              validatorIdentity: strategy.name,
              expectedReturn: apyMap.get(this.normalizeStrategyName(strategy.name)),
              substrateProxyType: proxy.proxyType,
              delay: proxy.delay
            };
          }).filter((n) => n !== null) as DelegatedStrategyInfo[];

        // isTrusted = account has at least one proxy pointing at a known TrustedStake strategy.
        // constituents = union of all subnet IDs across the matched strategies.
        const isTrusted = nominations.length > 0;
        const constituents = Array.from(constituentsSet);

        rsCallback({
          ...defaultInfo,
          type: this.type,
          address: owner,
          balanceToken: this.nativeToken.slug,

          totalStake: isTrusted ? totalTao.toFixed() : '0',
          activeStake: isTrusted ? totalTao.toFixed() : '0',

          unstakeBalance: '0',
          status: isTrusted
            ? EarningStatus.EARNING_REWARD
            : EarningStatus.NOT_STAKING,

          isBondedBefore: isTrusted,
          nominations: isTrusted ? nominations : [],
          unstakings: [],
          metadata: isTrusted && constituents.length
            ? { constituents }
            : undefined
        });
      }
    };

    const getStakingPositionInterval = async () => {
      if (!cancel) {
        await getPoolPosition();
      }
    };

    await getStakingPositionInterval();

    const intervalId = setInterval(() => {
      getStakingPositionInterval().catch(console.error);
    }, BITTENSOR_REFRESH_STAKE_INFO);

    return () => {
      cancel = true;
      clearInterval(intervalId);
    };
  }

  public override async getPoolTargets (): Promise<StrategyInfo[]> {
    try {
      const [strategies, apyMap] = await Promise.all([
        this.getTrustedStakeStrategies(),
        this.getTrustedStakeApyMap()
      ]);

      const decimals = _getAssetDecimals(this.nativeToken);

      return strategies
        .map((strategy): StrategyInfo => ({
          address: strategy.proxyAddress,
          chain: this.chain,
          minBond: toBNString(strategy.minBalance, decimals),
          constituents: Object.keys(strategy.targetConstituents.subnetWeights),
          identity: strategy.name,
          expectedReturn: apyMap.get(this.normalizeStrategyName(strategy.name))
        }));
    } catch (e) {
      console.warn('Failed to fetch pool targets', e);

      return [];
    }
  }

  /**
   * Validate before submitting a join transaction.
   * Two balance requirements must both be met:
   *  1. transferable >= proxyDeposit  (to pay for adding a substrate proxy)
   *  2. totalEquivalent >= minBond    (strategy-specific minimum; in TAO-equivalent terms)
   */
  public override async validateYieldJoin (data: SubmitYieldJoinData, path: OptimalYieldPath): Promise<TransactionError[]> {
    const { address, minBond, slug, substrateProxyAddress } = data as SubmitJoinDelegateStaking;

    const poolInfo = await this.getPoolInfo(slug) as DelegatedYieldPoolInfo;

    if (!poolInfo) {
      return Promise.resolve([new TransactionError(BasicTxErrorType.INTERNAL_ERROR)]);
    }

    if (isSameAddress(address, substrateProxyAddress)) {
      return Promise.resolve([new TransactionError(BasicTxErrorType.INVALID_PARAMS)]);
    }

    const errors: TransactionError[] = [];

    const transferableBalance = await this.state.balanceService.getTransferableBalance(
      address,
      this.chain,
      this.nativeToken.slug
    );

    const totalEquilvalent = await this.state.balanceService.getBalanceByType(
      address,
      this.chain,
      this.nativeToken.slug,
      BalanceType.TOTAL_EQUIVALENT
    );

    const bnTransferable = new BigNumber(transferableBalance.value || '0');
    const bnTotalEquivalent = new BigNumber(totalEquilvalent.value || '0');

    const chainApi = await this.substrateApi.isReady;

    const proxyDeposit = poolInfo.proxyDeposit || '0';

    // Check if account already has a proxy
    let hasStakingProxy = false;

    try {
      const proxies = await chainApi.api.query.proxy.proxies(address);

      if (proxies) {
        const [proxyDefs] = proxies as unknown as [PrimitiveSubstrateProxyAccountItem[], string];

        hasStakingProxy = (proxyDefs || []).length > 0;
      }
    } catch (e) {
      // ignore
    }

    const decimals = _getAssetDecimals(this.nativeToken);
    const symbol = this.nativeToken.symbol;
    const pow = BN_TEN.pow(decimals);

    const bnMinBond = new BigNumber(minBond);
    const bnProxyDeposit = new BigNumber(proxyDeposit);
    const parsedProxyDeposit = bnProxyDeposit.dividedBy(pow).toFixed();

    // If account does not have staking proxy and transferable balance is less than proxy deposit -> error
    if (!hasStakingProxy && bnTransferable.lt(bnProxyDeposit)) {
      errors.push(new TransactionError(StakingTxErrorType.NOT_ENOUGH_MIN_STAKE, `Insufficient ${symbol}-equivalent balance to delegate to this strategy. Select another one and try again`));

      return errors;
    }

    if (bnTotalEquivalent.lt(bnMinBond)) {
      errors.push(new TransactionError(StakingTxErrorType.NOT_ENOUGH_MIN_STAKE, `You need at least ${parsedProxyDeposit} ${symbol} in your transferable balance to start earning `));

      return errors;
    }

    return errors;
  }

  /**
   * Build the join extrinsic.
   * Flow: remove all existing proxies (if any) then add the new TrustedStake proxy.
   * Batched via utility.batchAll when there are proxies to remove first;
   * otherwise a single proxy.addProxy call is used to save fees.
   */
  override async createJoinExtrinsic (data: SubmitJoinDelegateStaking): Promise<[TransactionData, YieldTokenBaseInfo]> {
    const chainApi = await this.substrateApi.isReady;
    const { address, substrateProxyAddress, substrateProxyDeposit, substrateProxyType } = data;

    if (!substrateProxyAddress) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const txList = [];
    const proxies = await chainApi.api.query.proxy.proxies(address);

    if (proxies) {
      txList.push(
        chainApi.api.tx.proxy.removeProxies()
      );
    }

    txList.push(chainApi.api.tx.proxy.addProxy(substrateProxyAddress, substrateProxyType, 0));
    const extrinsic = txList.length === 1 ? txList[0] : chainApi.api.tx.utility.batchAll(txList);

    return [extrinsic, { slug: this.nativeToken.slug, amount: txList.length === 1 ? substrateProxyDeposit : '0' }];
  }

  override async handleYieldJoin (_data: SubmitYieldJoinData, path: OptimalYieldPath, currentStep: number): Promise<HandleYieldStepData> {
    const data = _data as SubmitJoinDelegateStaking;
    const { address, amount, slug, substrateProxyAddress, substrateProxyDeposit, substrateProxyType } = data;

    const positionInfo = await this.getPoolPosition(address, slug);

    if (!positionInfo) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const [extrinsic, yieldTokenInfo] = await this.createJoinExtrinsic(data);

    const delegateData: RequestDelegateStakingSubmit = {
      poolPosition: positionInfo,
      slug: this.slug,
      amount,
      address,
      substrateProxyAddress,
      substrateProxyDeposit,
      substrateProxyType
    };

    return {
      txChain: this.chain,
      extrinsicType: ExtrinsicType.ADD_SUBSTRATE_PROXY_ACCOUNT,
      extrinsic,
      txData: delegateData,
      transferNativeAmount: yieldTokenInfo.amount || '0',
      chainType: ChainType.SUBSTRATE
    };
  }

  public override validateYieldLeave (amount: string, address: string, fastLeave: boolean, selectedTarget?: string, slug?: string, poolInfo?: YieldPoolInfo): Promise<TransactionError[]> {
    return Promise.resolve([]);
  }

  protected override handleYieldUnstake (amount: string, address: string, selectedTarget?: string): Promise<[ExtrinsicType, TransactionData]> {
    throw new Error('Method not implemented.'); // Handle by remove proxy in substrate proxy service
  }

  public override handleYieldWithdraw (address: string, unstakingInfo: UnstakingInfo): Promise<TransactionData> {
    throw new Error('Method not implemented.');
  }

  public override handleYieldCancelUnstake (params: StakeCancelWithdrawalParams): Promise<TransactionData> {
    throw new Error('Method not implemented.');
  }
}
