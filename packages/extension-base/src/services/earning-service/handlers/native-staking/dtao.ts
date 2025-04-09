// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ExtrinsicType, NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { BITTENSOR_REFRESH_STAKE_APY, BITTENSOR_REFRESH_STAKE_INFO } from '@subwallet/extension-base/constants';
import { getEarningStatusByNominations } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import BaseParaStakingPoolHandler from '@subwallet/extension-base/services/earning-service/handlers/native-staking/base-para';
import { BaseYieldPositionInfo, BasicTxErrorType, EarningStatus, NativeYieldPoolInfo, OptimalYieldPath, RequestEarningSlippage, StakeCancelWithdrawalParams, SubmitJoinNativeStaking, TransactionData, UnstakingInfo, ValidatorInfo, YieldPoolInfo, YieldPoolMethodInfo, YieldPoolType, YieldPositionInfo, YieldTokenBaseInfo } from '@subwallet/extension-base/types';
import { formatNumber, reformatAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { t } from 'i18next';

import { BN, BN_ZERO } from '@polkadot/util';

import { calculateReward } from '../../utils';
import { BittensorCache, TaoStakeInfo } from './tao';

export interface SubnetData {
  netuid: number;
  name: string;
  symbol: string;
  ownerHotkey: string;
  maxAllowedValidators: number;
  taoIn: number;
  taoInEmission: number;
}

interface TaoStakingStakeOption {
  owner: string;
  amount: string;
  rate?: BigN;
  identity?: string
}

interface Hotkey {
  ss58: string;
}

export interface RawDelegateState {
  data: Array<{
    hotkey_name: string;
    hotkey: {
      ss58: string;
    };
    stake: string;
  }>;
}

type Nominators = [Array<[number, number]>]

export interface TestnetBittensorDelegateInfo {
  delegateSs58: string;
  take: number;
  nominators: Nominators;
  returnPer1000: number
}
// interface ApiResponse {
//   data: SubnetData[];
// }

// interface PoolData {
//   netuid: number;
//   name: string;
//   symbol: string;
// }

// interface PoolApiResponse {
//   data: PoolData[];
// }

// const SUBNET_API_URL = 'https://dash.taostats.io/api/subnet';
// const POOL_API_URL = 'https://dash.taostats.io/api/dtao/pool';

// export async function fetchSubnetData () {
//   try {
//     const [subnetResponse, poolResponse] = await Promise.all([
//       fetch(SUBNET_API_URL).then((res) => res.json()) as Promise<ApiResponse>,
//       fetch(POOL_API_URL).then((res) => res.json()) as Promise<PoolApiResponse>
//     ]);

//     const poolMap = new Map(poolResponse.data.map((pool) => [pool.netuid, pool]));

//     const filteredSubnets = subnetResponse.data.filter((subnet) => subnet.netuid !== 0);

//     const mergedData = filteredSubnets.map((subnet) => ({
//       ...subnet,
//       name: poolMap.get(subnet.netuid)?.name || 'Unknown',
//       symbol: poolMap.get(subnet.netuid)?.symbol || 'Unknown'
//     }));

//     return mergedData;
//   } catch (err) {
//     console.error('Error:', err);

//     return [];
//   }
// }

interface RateSubnetData {
  netuid: number;
  taoIn: string;
  alphaIn: string;
  alphaOut: string;
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
}

interface SubnetsInfo {
  netuid: number;
  maxAllowedValidators: number;
}

const DEFAULT_BITTENSOR_SLIPPAGE = 0.005;

export const DEFAULT_DTAO_MINBOND = '600000';

export const getAlphaToTaoMapping = async (substrateApi: _SubstrateApi) => {
  const allSubnets = (await substrateApi.api.call.subnetInfoRuntimeApi.getAllDynamicInfo()).toJSON() as RateSubnetData[] | undefined;

  if (!allSubnets) {
    return {};
  }

  return allSubnets.reduce((acc, subnet) => {
    const netuid = subnet?.netuid;
    const taoIn = subnet?.taoIn ? new BigN(subnet.taoIn) : new BigN(0);
    const alphaIn = subnet?.alphaIn ? new BigN(subnet.alphaIn) : new BigN(0);

    if (netuid === 0) {
      acc[netuid] = '1';
    } else if (alphaIn.gt(0)) {
      acc[netuid] = taoIn.dividedBy(alphaIn).toString();
    } else {
      acc[netuid] = '1';
    }

    return acc;
  }, {} as Record<number, string>);
};

export default class SubnetTaoStakingPoolHandler extends BaseParaStakingPoolHandler {
  /* Unimplemented function  */
  public override handleYieldWithdraw (address: string, unstakingInfo: UnstakingInfo): Promise<TransactionData> {
    throw new Error('Method not implemented.');
  }

  public override handleYieldCancelUnstake (params: StakeCancelWithdrawalParams): Promise<TransactionData> {
    throw new Error('Method not implemented.');
  }
  /* Unimplemented function  */

  // @ts-ignore
  public override readonly type = YieldPoolType.SUBNET_STAKING;
  public override slug: string;
  protected override name: string;
  protected override shortName: string;
  public subnetData: SubnetData[] = [];
  private isInit = false;
  private bittensorCache: BittensorCache;
  override readonly availableMethod: YieldPoolMethodInfo = {
    join: true,
    defaultUnstake: true,
    fastUnstake: false,
    cancelUnstake: false,
    withdraw: false,
    claimReward: false
  };

  constructor (state: KoniState, chain: string) {
    super(state, chain);
    const _chainAsset = this.nativeToken;
    const _chainInfo = this.chainInfo;

    const symbol = _chainAsset.symbol;

    this.slug = this.slug = `${symbol}___subnet_staking___${_chainInfo.slug}`;
    this.name = 'Subnet Tao Staking';
    this.shortName = 'dTAO Staking';
    this.bittensorCache = BittensorCache.getInstance();
  }

  public override canHandleSlug (slug: string): boolean {
    return slug.startsWith(`${this.slug}__`);
  }

  public override async getEarningSlippage (params: RequestEarningSlippage): Promise<number> {
    const substrateApi = await this.substrateApi.isReady;
    const subnetInfo = (await substrateApi.api.call.subnetInfoRuntimeApi.getDynamicInfo(params.netuid)).toJSON() as RateSubnetData | undefined;

    const alphaIn = new BigN(subnetInfo?.alphaIn || 0);
    const taoIn = new BigN(subnetInfo?.taoIn || 0);
    const k = alphaIn.multipliedBy(taoIn);
    const value = new BigN(params.value);

    if (params.type === ExtrinsicType.STAKING_BOND) {
      const newTaoIn = taoIn.plus(value);
      const newAlphaIn = k.dividedBy(newTaoIn);
      const alphaReturned = alphaIn.minus(newAlphaIn);
      const alphaIdeal = value.multipliedBy(alphaIn).dividedBy(taoIn);
      const slippage = alphaIdeal.minus(alphaReturned).dividedBy(alphaIdeal);

      return slippage.toNumber();
    } else if (params.type === ExtrinsicType.STAKING_UNBOND) {
      const newAlphaIn = alphaIn.plus(value);
      const newTaoReserve = k.dividedBy(newAlphaIn);
      const taoReturned = taoIn.minus(newTaoReserve);
      const taoIdeal = value.multipliedBy(taoIn).dividedBy(alphaIn);
      const slippage = taoIdeal.minus(taoReturned).dividedBy(taoIdeal);

      return slippage.toNumber();
    }

    return 0;
  }

  public override get maintainBalance (): string {
    const ed = new BigN(this.nativeToken.minAmount || '0');
    const calculateMaintainBalance = new BigN(15).multipliedBy(ed).dividedBy(10);

    const maintainBalance = calculateMaintainBalance;

    return maintainBalance.toString();
  }

  private async init (): Promise<void> {
    try {
      if (this.isInit || !this.substrateApi) {
        return;
      }

      const substrateApi = await this.substrateApi.isReady;
      const dynamicInfo = (await substrateApi.api.call.subnetInfoRuntimeApi.getAllDynamicInfo()).toJSON() as DynamicInfo[] | undefined;
      const subnetsInfo = (await substrateApi.api.call.subnetInfoRuntimeApi.getSubnetsInfoV2()).toJSON() as SubnetsInfo[] | undefined;

      if (dynamicInfo && subnetsInfo) {
        const mergedData = dynamicInfo
          .filter((dynInfo) => dynInfo.netuid !== 0)
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
              taoInEmission: dynInfo.taoInEmission
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

  async subscribePoolInfo (callback: (data: YieldPoolInfo) => void): Promise<VoidFunction> {
    await this.init();

    let cancel = false;

    const updateStakingInfo = async () => {
      await this.substrateApi.isReady;

      try {
        if (cancel) {
          return;
        }

        this.subnetData.forEach((subnet) => {
          const netuid = subnet.netuid.toString().padStart(2, '0');
          const subnetSlug = `${this.slug}__subnet_${netuid.padStart(2, '0')}`;
          const subnetName = `${subnet.name || 'Unknown'} ${netuid}`;
          const bnTaoIn = new BigN(subnet.taoIn);
          const emission = new BigN(subnet.taoInEmission).dividedBy(new BigN(10).pow(new BigN(7)));

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
              }
            },
            statistic: {
              assetEarning: [
                {
                  slug: this.nativeToken.slug
                }
              ],
              maxCandidatePerFarmer: subnet.maxAllowedValidators,
              maxWithdrawalRequestPerFarmer: 1,
              earningThreshold: {
                join: DEFAULT_DTAO_MINBOND,
                defaultUnstake: '0',
                fastUnstake: '0'
              },
              eraTime: 24,
              era: 0,
              unstakingPeriod: 1.2,
              tvl: bnTaoIn.toString(),
              totalApy: emission.toNumber()
            }
          };

          callback(data);
        });
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

  async parseNominatorMetadata (chainInfo: _ChainInfo, address: string, delegatorState: TaoStakingStakeOption[]): Promise<Omit<YieldPositionInfo, keyof BaseYieldPositionInfo>> {
    await this.substrateApi.isReady;
    const nominationList: NominationInfo[] = [];
    let allActiveStake = BN_ZERO;

    for (const delegate of delegatorState) {
      const stake = new BigN(delegate.amount);
      const originActiveStake = stake.multipliedBy(delegate.rate || new BigN(1)).toFixed(0).toString();

      const bnActiveStake = new BN(originActiveStake);

      if (bnActiveStake.gt(BN_ZERO)) {
        const delegationStatus = EarningStatus.EARNING_REWARD;

        allActiveStake = allActiveStake.add(bnActiveStake);

        nominationList.push({
          status: delegationStatus,
          chain: chainInfo.slug,
          validatorAddress: delegate.owner,
          activeStake: delegate.amount,
          validatorMinStake: DEFAULT_DTAO_MINBOND,
          originActiveStake: originActiveStake,
          validatorIdentity: delegate.identity
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

  override async subscribePoolPosition (useAddresses: string[], rsCallback: (rs: YieldPositionInfo) => void): Promise<VoidFunction> {
    await this.init();

    let cancel = false;
    const substrateApi = await this.substrateApi.isReady;

    const defaultInfo = this.baseInfo;
    const chainInfo = this.chainInfo;
    const _delegateInfo = await this.bittensorCache.get();

    const getPoolPosition = async () => {
      const rawDelegateStateInfos = await Promise.all(
        useAddresses.map(async (address) =>
          (await substrateApi.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address)).toJSON()
        )
      );

      const price = await getAlphaToTaoMapping(this.substrateApi);

      if (rawDelegateStateInfos && rawDelegateStateInfos.length > 0) {
        rawDelegateStateInfos.forEach((rawDelegateStateInfo, i) => {
          const owner = reformatAddress(useAddresses[i], 42);
          const delegateStateInfo = rawDelegateStateInfo as unknown as TaoStakeInfo[];

          const subnetPositions: Record<number, { delegatorState: TaoStakingStakeOption[], totalBalance: BN, originalTotalStake: BN }> = {};

          for (const delegate of delegateStateInfo) {
            const hotkey = delegate.hotkey;
            const netuid = delegate.netuid;
            const stake = new BigN(delegate.stake);

            const aplhaToTaoPrice = new BigN(price[netuid]);

            if (!subnetPositions[netuid]) {
              subnetPositions[netuid] = {
                delegatorState: [],
                totalBalance: BN_ZERO,
                originalTotalStake: BN_ZERO
              };
            }

            let identity = '';

            if (_delegateInfo) {
              const delegateInfo = _delegateInfo.data.find((info) => info.hotkey.ss58 === hotkey);

              identity = delegateInfo ? delegateInfo.name : '';
            }

            subnetPositions[netuid].delegatorState.push({
              owner: hotkey,
              amount: stake.toString(),
              rate: aplhaToTaoPrice,
              identity: identity
            });

            subnetPositions[netuid].totalBalance = subnetPositions[netuid].totalBalance.add(new BN(stake.toString()));
            subnetPositions[netuid].originalTotalStake = subnetPositions[netuid].originalTotalStake.add(new BN(stake.toString()));
          }

          Object.values(this.subnetData).forEach((subnet) => {
            const netuid = subnet.netuid;
            const subnetSlug = `${this.slug}__subnet_${netuid.toString().padStart(2, '0')}`;
            const subnetName = `${subnet.name || 'Unknown'} ${netuid}`;
            const subnetSymbol = subnet.symbol || 'dTAO';

            const { delegatorState = [], originalTotalStake = BN_ZERO } = subnetPositions[netuid] || {};

            if (delegatorState.length > 0) {
              this.parseNominatorMetadata(chainInfo, owner, delegatorState)
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
      }
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

  /* Get pool targets */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async getDevnetPoolTargets (): Promise<ValidatorInfo[]> {
    const testnetDelegate = (await this.substrateApi.api.call.delegateInfoRuntimeApi.getDelegates()).toJSON() as unknown as TestnetBittensorDelegateInfo[];
    const bnMinBond = new BigN(DEFAULT_DTAO_MINBOND);

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
      blocked: false,
      isVerified: false,
      chain: this.chain,
      isCrowded: false
    }) as unknown as ValidatorInfo);
  }

  private async getMainnetPoolTargets (): Promise<ValidatorInfo[]> {
    const _topValidator = await this.bittensorCache.get();

    const topValidator = _topValidator as unknown as Record<string, Record<string, Record<string, string>>>;
    const bnMinBond = new BigN(DEFAULT_DTAO_MINBOND);
    const validatorList = topValidator.data;
    const validatorAddresses = Object.keys(validatorList);

    const results = await Promise.all(
      validatorAddresses.map((i) => {
        const address = (validatorList[i].hotkey as unknown as Hotkey).ss58;
        const bnTotalStake = new BigN(validatorList[i].stake);
        const bnOwnStake = new BigN(validatorList[i].validator_stake);
        const otherStake = bnTotalStake.minus(bnOwnStake);
        const nominatorCount = validatorList[i].nominators;
        const commission = validatorList[i].take;
        const roundedCommission = (parseFloat(commission) * 100).toFixed(0);

        const apr = ((parseFloat(validatorList[i].apr) / 10 ** 9) * 100).toFixed(2);
        const apyCalculate = calculateReward(parseFloat(apr));

        const name = validatorList[i].name || address;

        return {
          address: address,
          totalStake: bnTotalStake.toString(),
          ownStake: bnOwnStake.toString(),
          otherStake: otherStake.toString(),
          minBond: bnMinBond.toString(),
          nominatorCount: nominatorCount,
          commission: roundedCommission,
          expectedReturn: apyCalculate.apy,
          blocked: false,
          isVerified: false,
          chain: this.chain,
          isCrowded: false,
          identity: name
        } as unknown as ValidatorInfo;
      })
    );

    return results;
  }

  async getPoolTargets (): Promise<ValidatorInfo[]> {
    await this.init();

    if (this.chain === 'bittensor') {
      return this.getMainnetPoolTargets();
    } else {
      return this.getDevnetPoolTargets();
    }
  }

  /* Get pool targets */

  /* Join pool action */

  async createJoinExtrinsic (data: SubmitJoinNativeStaking, positionInfo?: YieldPositionInfo, bondDest = 'Staked'): Promise<[TransactionData, YieldTokenBaseInfo]> {
    const { amount, netuid, selectedValidators: targetValidators } = data;
    const chainApi = await this.substrateApi.isReady;
    const binaryAmount = new BigN(amount);

    const price = await getAlphaToTaoMapping(this.substrateApi);
    const alphaToTaoPrice = new BigN(price[netuid as number]);
    const limitPrice = (alphaToTaoPrice.multipliedBy(10 ** _getAssetDecimals(this.nativeToken))).multipliedBy(1 + DEFAULT_BITTENSOR_SLIPPAGE);

    const BNlimitPrice = new BigN(limitPrice.integerValue(BigN.ROUND_CEIL).toFixed());

    const selectedValidatorInfo = targetValidators[0];
    const hotkey = selectedValidatorInfo.address;

    const extrinsic = chainApi.api.tx.subtensorModule.addStakeLimit(hotkey, netuid, binaryAmount, BNlimitPrice, false);

    return [extrinsic, { slug: this.nativeToken.slug, amount: '0' }];
  }

  public override async validateYieldJoin (data: SubmitJoinNativeStaking, path: OptimalYieldPath): Promise<TransactionError[]> {
    const baseErrors = await super.validateYieldJoin(data, path);

    if (baseErrors.length > 0) {
      return baseErrors;
    }

    const { amount } = data;

    if (new BigN(amount).lt(new BigN(DEFAULT_DTAO_MINBOND))) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t(`Insufficient stake. You need to stake at least ${formatNumber(DEFAULT_DTAO_MINBOND, _getAssetDecimals(this.nativeToken))} ${_getAssetSymbol(this.nativeToken)} to earn rewards`))];
    }

    return baseErrors;
  }

  /* Join pool action */

  /* Leave pool action */

  async handleYieldUnstake (amount: string, address: string, selectedTarget?: string, netuid?: number): Promise<[ExtrinsicType, TransactionData]> {
    const apiPromise = await this.substrateApi.isReady;
    const binaryAmount = new BigN(amount);
    const price = await getAlphaToTaoMapping(this.substrateApi);
    const alphaToTaoPrice = new BigN(price[netuid as number]);
    const limitPrice = (alphaToTaoPrice.multipliedBy(10 ** _getAssetDecimals(this.nativeToken))).multipliedBy(1 - DEFAULT_BITTENSOR_SLIPPAGE);
    const BNlimitPrice = new BigN(limitPrice.integerValue(BigN.ROUND_CEIL).toFixed());

    if (!selectedTarget) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const extrinsic = apiPromise.api.tx.subtensorModule.removeStakeLimit(selectedTarget, netuid, binaryAmount, BNlimitPrice, false);

    return [ExtrinsicType.STAKING_UNBOND, extrinsic];
  }

  public override async validateYieldLeave (amount: string, address: string, fastLeave: boolean, selectedTarget?: string, slug?: string, poolInfo?: YieldPoolInfo): Promise<TransactionError[]> {
    const baseErrors = await super.validateYieldLeave(amount, address, fastLeave, selectedTarget, slug);

    if (baseErrors.length > 0) {
      return baseErrors;
    }

    if (!poolInfo) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS)];
    }

    const netuid = poolInfo.metadata.subnetData?.netuid;
    const price = await getAlphaToTaoMapping(this.substrateApi);
    const minUnstake = new BigN(DEFAULT_DTAO_MINBOND).dividedBy(new BigN(price[netuid as number]));

    const formattedMinUnstake = minUnstake.dividedBy(1000000).integerValue(BigN.ROUND_CEIL).dividedBy(1000);

    if (new BigN(amount).lt(formattedMinUnstake.multipliedBy(10 ** _getAssetDecimals(this.nativeToken)))) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t(`Amount too low. You need to unstake at least ${formattedMinUnstake.toString()} ${poolInfo.metadata.subnetData?.subnetSymbol || ''}`))];
    }

    return baseErrors;
  }

  /* Leave pool action */
}
