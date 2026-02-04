// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { BITTENSOR_REFRESH_STAKE_INFO } from '@subwallet/extension-base/constants';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import { BasicTxErrorType, DelegatedStrategyInfo, DelegatedYieldPoolInfo, EarningStatus, HandleYieldStepData, OptimalYieldPath, PrimitiveSubstrateProxyAccountItem, RequestDelegateStakingSubmit, RequestEarlyValidateYield, ResponseEarlyValidateYield, StakeCancelWithdrawalParams, StrategyInfo, SubmitJoinDelegateStaking, SubmitYieldJoinData, TransactionData, UnstakingInfo, YieldPoolInfo, YieldPoolMethodInfo, YieldPoolType, YieldPositionInfo, YieldTokenBaseInfo } from '@subwallet/extension-base/types';
import { BN_TEN, isSameAddress, toBNString } from '@subwallet/extension-base/utils';
import BigNumber from 'bignumber.js';

import BaseNativeStakingPoolHandler from '../native-staking/base';
import { TaoStakeInfo } from '../native-staking/tao';

type CacheItem = {
  value: BigNumber;
  expiredAt: number;
}

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

class AlphaPriceCache {
  // Store resolved alpha prices with expiration time
  private readonly valueCache = new Map<string, CacheItem>();
  private readonly TTL = BITTENSOR_REFRESH_STAKE_INFO;

  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  public constructor () {}

  // Build a unique cache key per chain and subnet (netuid)
  private buildCacheKey (chain: string, netuid: number): string {
    return `${chain}__${netuid}`;
  }

  /**
   * Get alpha price with TTL-based caching
   *
   * Flow:
   * 1. Check cache and return value if still valid
   * 2. Otherwise, fetch fresh value using provided fetcher
   * 3. Cache fetched value with expiration timestamp
   */
  public async getAlphaPrice (
    params: { chain: string; netuid: number },
    fetcher: () => Promise<BigNumber>
  ): Promise<BigNumber> {
    const cacheKey = this.buildCacheKey(params.chain, params.netuid);
    const now = Date.now();

    // Return cached value if it exists and has not expired
    const cached = this.valueCache.get(cacheKey);

    if (cached && cached.expiredAt > now) {
      return cached.value;
    }

    // Fetch fresh alpha price from runtime API
    const value = await fetcher();

    // Cache fetched value with TTL
    this.valueCache.set(cacheKey, {
      value,
      expiredAt: Date.now() + this.TTL
    });

    return value;
  }

  // Clear all cached values
  public clearAll () {
    this.valueCache.clear();
  }
}

export const alphaPriceCache = new AlphaPriceCache();
const trustedStakeApi = 'https://app.trustedstake.ai/api/strategies-active';

export default class TaoDelegateStakingPoolHandler extends BaseNativeStakingPoolHandler {
  // @ts-ignore
  public override readonly type = YieldPoolType.DELEGATED_STAKING;

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
    return Promise.resolve({ passed: true });
  }

  private async getJoinThresholdFromTrustedStake (): Promise<string | null> {
    try {
      const res = await fetch(trustedStakeApi);
      const data = await res.json() as TrustedStakeStrategy[];

      const activeStrategies = data.filter((s) => s.isActive);

      if (!activeStrategies.length) {
        return null;
      }

      const minBalance = Math.min(
        ...activeStrategies.map((s) => s.minBalance)
      );

      return minBalance.toString();
    } catch (e) {
      console.warn('Failed to fetch joinThreshold', e);

      return null;
    }
  }

  async subscribePoolInfo (callback: (data: YieldPoolInfo) => void): Promise<VoidFunction> {
    let cancel = false;

    const defaultCallback = async () => {
      const chainApi = await this.substrateApi.isReady;

      // Get proxy pallet deposit info
      let proxyDeposit = '0';

      try {
        const proxyDepositBase = chainApi.api.consts.proxy.proxyDepositBase;
        const proxyDepositFactor = chainApi.api.consts.proxy.proxyDepositFactor;

        // Calculate earning threshold as baseDeposit + depositFactor
        proxyDeposit = proxyDepositBase.add(proxyDepositFactor).toString();
      } catch (error) {
        console.warn('Failed to fetch proxy deposit info:', error);
      }

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
          totalApy: 0
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

    // ===== Fetch TrustedStake strategies =====
    let trustedStrategies: TrustedStakeStrategy[] = [];

    try {
      const res = await fetch(trustedStakeApi);
      const data = await res.json() as TrustedStakeStrategy[];

      trustedStrategies = data.filter((s) => s.isActive);
    } catch (e) {
      console.warn('Failed to fetch TrustedStake strategies', e);
    }

    const getPoolPosition = async () => {
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

        // ===== 1. Calculate total stake =====
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

        // ===== 2. Convert alpha -> TAO =====
        let totalTao = taoNativeTotal;

        for (const [netuid, totalAlpha] of alphaByNetuid.entries()) {
          try {
            const price = await alphaPriceCache.getAlphaPrice(
              { chain: this.chain, netuid },
              async () => {
                const chainApi = await this.substrateApi.isReady;
                const priceRaw =
                await chainApi.api.call.swapRuntimeApi.currentAlphaPrice(netuid);

                return new BigNumber(priceRaw.toString());
              }
            );

            const rate = new BigNumber(price.toString()).dividedBy(
              BN_TEN.pow(_getAssetDecimals(this.nativeToken))
            );

            const taoEquivalent = totalAlpha.multipliedBy(rate);

            totalTao = totalTao.plus(taoEquivalent);
          } catch (e) {
            console.warn(`Failed alpha price for netuid ${netuid}`, e);
          }
        }

        // ===== 3. Filter trusted staking proxies =====
        const constituentsSet = new Set<string>();

        const nominations = stakingProxies
          .map((proxy) => {
            const strategy = trustedStrategies.find((strategy) =>
              isSameAddress(strategy.proxyAddress, proxy.delegate)
            );

            console.log('hmm', [strategy, trustedStrategies, proxy]);

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
              validatorMinStake: '0',
              validatorIdentity: strategy.name,
              substrateProxyType: proxy.proxyType,
              delay: proxy.delay
            };
          }) as DelegatedStrategyInfo[];

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
      const res = await fetch(trustedStakeApi);
      const strategies = await res.json() as TrustedStakeStrategy[];

      const decimals = _getAssetDecimals(this.nativeToken);

      return strategies
        .filter((s) => s.isActive)
        .map((strategy): StrategyInfo => ({
          address: strategy.proxyAddress,
          chain: this.chain,
          minBond: toBNString(strategy.minBalance, decimals),
          constituents: Object.keys(strategy.targetConstituents.subnetWeights),
          identity: strategy.name,
          expectedReturn: undefined
        }));
    } catch (e) {
      console.warn('Failed to fetch pool targets', e);

      return [];
    }
  }

  public override validateYieldJoin (data: SubmitYieldJoinData, path: OptimalYieldPath): Promise<TransactionError[]> {
    return Promise.resolve([]);
  }

  override async createJoinExtrinsic (data: SubmitJoinDelegateStaking, positionInfo?: YieldPositionInfo, bondDest?: string, netuid?: number): Promise<[TransactionData, YieldTokenBaseInfo]> {
    const chainApi = await this.substrateApi.isReady;
    const { address, substrateProxyAddress, substrateProxyDeposit } = data;

    if (!substrateProxyAddress) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const txList = [];
    const proxies = await chainApi.api.query.proxy.proxies(address);

    if (proxies) {
      const [proxyDefs] = proxies;

      console.log('checking', proxyDefs);
      proxyDefs.forEach((proxyDef) => {
        txList.push(
          chainApi.api.tx.proxy.removeProxy(
            proxyDef.delegate,
            proxyDef.proxyType,
            proxyDef.delay
          )
        );
      });
    }

    txList.push(chainApi.api.tx.proxy.addProxy(substrateProxyAddress, 'Staking', 0));
    const extrinsic = txList.length === 1 ? txList[0] : chainApi.api.tx.utility.batchAll(txList);

    return [extrinsic, { slug: this.nativeToken.slug, amount: txList.length === 1 ? substrateProxyDeposit : '0' }];
  }

  override async handleYieldJoin (_data: SubmitYieldJoinData, path: OptimalYieldPath, currentStep: number): Promise<HandleYieldStepData> {
    const data = _data as SubmitJoinDelegateStaking;
    const { address, amount, slug, substrateProxyAddress, substrateProxyDeposit } = data;

    const positionInfo = await this.getPoolPosition(address, slug);
    const [extrinsic, yieldTokenInfo] = await this.createJoinExtrinsic(data, positionInfo);

    if (!positionInfo) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const delegateData: RequestDelegateStakingSubmit = {
      poolPosition: positionInfo,
      slug: this.slug,
      amount,
      address,
      substrateProxyAddress,
      substrateProxyDeposit
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
