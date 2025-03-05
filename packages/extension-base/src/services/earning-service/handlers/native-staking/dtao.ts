// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ExtrinsicType, NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { BITTENSOR_REFRESH_STAKE_APY, BITTENSOR_REFRESH_STAKE_INFO } from '@subwallet/extension-base/constants';
import { getEarningStatusByNominations } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import BaseParaStakingPoolHandler from '@subwallet/extension-base/services/earning-service/handlers/native-staking/base-para';
import { BaseYieldPositionInfo, BasicTxErrorType, EarningStatus, NativeYieldPoolInfo, StakeCancelWithdrawalParams, SubmitJoinNativeStaking, TransactionData, UnstakingInfo, ValidatorInfo, YieldPoolInfo, YieldPoolType, YieldPositionInfo, YieldTokenBaseInfo } from '@subwallet/extension-base/types';
import { reformatAddress } from '@subwallet/extension-base/utils';
import BigN, { BigNumber } from 'bignumber.js';

import { BN, BN_ZERO } from '@polkadot/util';

import { calculateReward, dynamicTaoSlug } from '../../utils';
import { fetchDelegates, TaoStakeInfo } from './tao';

export interface SubnetData {
  netuid: number;
  name: string;
  symbol: string;
  ownerHotkey: string;
  maxAllowedValidators: number;
}

interface TaoStakingStakeOption {
  owner: string;
  amount: string;
  rate?: BigNumber;
  // identity: string
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
}

interface DynamicInfo {
  netuid: number;
  ownerHotkey: string;
  subnetName: number[];
  tokenSymbol: number[];
}

interface SubnetsInfo {
  netuid: number;
  maxAllowedValidators: number;
}

export const getTaoToAlphaMapping = async (substrateApi: _SubstrateApi) => {
  const allSubnets = (await substrateApi.api.call.subnetInfoRuntimeApi.getAllDynamicInfo()).toJSON() as RateSubnetData[] | undefined;

  console.log('allSubnets', allSubnets);

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

export default class DynamicTaoStakingPoolHandler extends BaseParaStakingPoolHandler {
  public override handleYieldWithdraw (address: string, unstakingInfo: UnstakingInfo): Promise<TransactionData> {
    throw new Error('Method not implemented.');
  }

  public override handleYieldCancelUnstake (params: StakeCancelWithdrawalParams): Promise<TransactionData> {
    throw new Error('Method not implemented.');
  }

  // @ts-ignore
  public override readonly type = YieldPoolType.DYNAMIC_STAKING;
  public override slug: string;
  protected override name: string;
  protected override shortName: string;
  public subnetName: string;
  public subnetData: SubnetData[] = [];

  constructor (state: KoniState, chain: string) {
    super(state, chain);
    this.subnetName = 'dTAO';
    this.slug = dynamicTaoSlug;
    this.name = 'Dynamic Tao Staking';
    this.shortName = 'dTAO Staking';
    this.init().catch(console.error);
  }

  private async init () {
    try {
      const substrateApi = await this.substrateApi.isReady;
      const dynamicInfo = (await substrateApi.api.call.subnetInfoRuntimeApi.getAllDynamicInfo()).toJSON() as DynamicInfo[] | undefined;
      const subnetsInfo = (await substrateApi.api.call.subnetInfoRuntimeApi.getSubnetsInfoV2()).toJSON() as SubnetsInfo[] | undefined;

      if (dynamicInfo && subnetsInfo) {
        const mergedData = dynamicInfo
          .filter((dynInfo) => dynInfo.netuid !== 0)
          .map((dynInfo) => {
            const extraInfo = subnetsInfo.find((subnet) => subnet.netuid === dynInfo.netuid);

            const nameRaw = String.fromCharCode(...dynInfo.subnetName);
            const name = nameRaw.charAt(0).toUpperCase() + nameRaw.slice(1);

            const symbol = new TextDecoder('utf-8').decode(Uint8Array.from(dynInfo.tokenSymbol));

            return {
              netuid: dynInfo.netuid,
              name,
              symbol,
              ownerHotkey: dynInfo.ownerHotkey,
              maxAllowedValidators: extraInfo ? extraInfo.maxAllowedValidators : 0
            };
          });

        this.subnetData = mergedData;
      }
    } catch (err) {
      console.error(err);
    }
  }

  protected override getDescription (): string {
    return 'Stake TAO to earn rewards from subnet';
  }

  private getSubnetByNetuid (netuid: number): SubnetData | undefined {
    return this.subnetData.find((subnet) => subnet.netuid === netuid);
  }

  /* Subscribe pool info */

  async subscribePoolInfo (callback: (data: YieldPoolInfo) => void): Promise<VoidFunction> {
    let cancel = false;
    const substrateApi = await this.substrateApi.isReady;

    const updateStakingInfo = async () => {
      try {
        if (cancel) {
          return;
        }

        const minDelegatorStake = (await substrateApi.api.query.subtensorModule.nominatorMinRequiredStake()).toJSON() || 0;
        const BNminDelegatorStake = new BigN(minDelegatorStake.toString());

        this.subnetData.forEach((subnet) => {
          const netuid = subnet.netuid.toString().padStart(2, '0');
          const subnetSlug = `TAO___dynamic_staking___${this.chain}__subnet_${netuid}`;
          const subnetName = `${subnet.name || 'Unknown'} ${netuid}`;

          const data: NativeYieldPoolInfo = {
            ...this.baseInfo,
            type: this.type,
            slug: subnetSlug,
            metadata: {
              ...this.metadataInfo,
              name: subnetName,
              shortName: subnetName,
              description: 'Stake TAO to earn rewards',
              subnetData: {
                subnetName: this.subnetName,
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
                join: BNminDelegatorStake.toString(),
                defaultUnstake: '0',
                fastUnstake: '0'
              },
              eraTime: 1.2,
              era: 0,
              unstakingPeriod: 1.2
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

    await substrateApi.isReady;

    subscribeStakingMetadataInterval();
    const interval = setInterval(subscribeStakingMetadataInterval, BITTENSOR_REFRESH_STAKE_APY);

    return () => {
      cancel = true;
      clearInterval(interval);
    };
  }

  /* Subscribe pool position */

  async parseNominatorMetadata (chainInfo: _ChainInfo, address: string, delegatorState: TaoStakingStakeOption[]): Promise<Omit<YieldPositionInfo, keyof BaseYieldPositionInfo>> {
    const nominationList: NominationInfo[] = [];
    const getMinDelegatorStake = this.substrateApi.api.query.subtensorModule.nominatorMinRequiredStake();
    const minDelegatorStake = (await getMinDelegatorStake).toString();
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
          validatorMinStake: minDelegatorStake,
          originActiveStake: originActiveStake
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
    let cancel = false;
    const substrateApi = await this.substrateApi.isReady;

    const defaultInfo = this.baseInfo;
    const chainInfo = this.chainInfo;

    const getPoolPosition = async () => {
      const rawDelegateStateInfos = await Promise.all(
        useAddresses.map(async (address) =>
          (await substrateApi.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address)).toJSON()
        )
      );
      const price = await getTaoToAlphaMapping(this.substrateApi);

      if (rawDelegateStateInfos && rawDelegateStateInfos.length > 0) {
        rawDelegateStateInfos.forEach((rawDelegateStateInfo, i) => {
          const owner = reformatAddress(useAddresses[i], 42);
          const delegateStateInfo = rawDelegateStateInfo as unknown as TaoStakeInfo[];

          const subnetPositions: Record<number, { delegatorState: TaoStakingStakeOption[], totalBalance: BN, originalTotalStake: BN }> = {};

          for (const delegate of delegateStateInfo) {
            const hotkey = delegate.hotkey;
            const netuid = delegate.netuid;
            const stake = new BigN(delegate.stake);
            const subnet = this.getSubnetByNetuid(netuid);

            if (subnet) {
              const taoToAlphaPrice = new BigN(price[netuid]);

              if (!subnetPositions[netuid]) {
                subnetPositions[netuid] = {
                  delegatorState: [],
                  totalBalance: BN_ZERO,
                  originalTotalStake: BN_ZERO
                };
              }

              subnetPositions[netuid].delegatorState.push({
                owner: hotkey,
                amount: stake.toString(),
                rate: taoToAlphaPrice
              });

              subnetPositions[netuid].totalBalance = subnetPositions[netuid].totalBalance.add(new BN(stake.toString()));
              subnetPositions[netuid].originalTotalStake = subnetPositions[netuid].originalTotalStake.add(new BN(stake.toString()));
            }
          }

          Object.entries(subnetPositions).forEach(([netuid, { delegatorState, originalTotalStake }]) => {
            const subnet = this.getSubnetByNetuid(parseInt(netuid));

            if (!subnet) {
              return;
            }

            const subnetSlug = `TAO___dynamic_staking___${this.chain}__subnet_${netuid.padStart(2, '0')}`;
            const subnetName = `${subnet.name || 'Unknown'} ${netuid}`;
            const subnetSymbol = subnet.symbol || 'dTAO';

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
                      subnetName: this.subnetName,
                      subnetSymbol: subnetSymbol,
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
                  subnetName: this.subnetName,
                  subnetSymbol: subnetSymbol,
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

      if (this.chain === 'bittensor') {
        await getPoolPosition();
      }
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

  private async getMainnetPoolTargets (): Promise<ValidatorInfo[]> {
    const _topValidator = await fetchDelegates();

    console.log('topValidator', _topValidator);
    const topValidator = _topValidator as unknown as Record<string, Record<string, Record<string, string>>>;
    const getNominatorMinRequiredStake = this.substrateApi.api.query.subtensorModule.nominatorMinRequiredStake();
    const nominatorMinRequiredStake = (await getNominatorMinRequiredStake).toString();
    const bnMinBond = new BN(nominatorMinRequiredStake);
    const validatorList = topValidator.data;
    const validatorAddresses = Object.keys(validatorList);

    const results = await Promise.all(
      validatorAddresses.map((i) => {
        const address = (validatorList[i].hotkey as unknown as Hotkey).ss58;
        const bnTotalStake = new BN(validatorList[i].stake);
        const bnOwnStake = new BN(validatorList[i].validator_stake);
        const otherStake = bnTotalStake.sub(bnOwnStake);
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
    return this.getMainnetPoolTargets();
  }

  /* Get pool targets */

  /* Join pool action */

  async createJoinExtrinsic (data: SubmitJoinNativeStaking, positionInfo?: YieldPositionInfo, bondDest = 'Staked'): Promise<[TransactionData, YieldTokenBaseInfo]> {
    const { amount, netuid, selectedValidators: targetValidators } = data;
    const chainApi = await this.substrateApi.isReady;
    const binaryAmount = new BN(amount);
    const selectedValidatorInfo = targetValidators[0];
    const hotkey = selectedValidatorInfo.address;

    const extrinsic = chainApi.api.tx.subtensorModule.addStake(hotkey, netuid, binaryAmount);

    return [extrinsic, { slug: this.nativeToken.slug, amount: '0' }];
  }

  /* Join pool action */

  /* Leave pool action */

  async handleYieldUnstake (amount: string, address: string, selectedTarget?: string, netuid?: number): Promise<[ExtrinsicType, TransactionData]> {
    const apiPromise = await this.substrateApi.isReady;
    const binaryAmount = new BN(amount);

    if (!selectedTarget) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const extrinsic = apiPromise.api.tx.subtensorModule.removeStake(selectedTarget, netuid, binaryAmount);

    return [ExtrinsicType.STAKING_UNBOND, extrinsic];
  }

  /* Leave pool action */
}
