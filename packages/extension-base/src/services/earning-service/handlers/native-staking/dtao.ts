// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ExtrinsicType, NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { BITTENSOR_REFRESH_STAKE_APY, BITTENSOR_REFRESH_STAKE_INFO } from '@subwallet/extension-base/constants';
import { getEarningStatusByNominations } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import BaseParaStakingPoolHandler from '@subwallet/extension-base/services/earning-service/handlers/native-staking/base-para';
import { BaseYieldPositionInfo, BasicTxErrorType, EarningStatus, NativeYieldPoolInfo, StakeCancelWithdrawalParams, SubmitJoinNativeStaking, TransactionData, UnstakingInfo, ValidatorInfo, YieldPoolInfo, YieldPoolType, YieldPositionInfo, YieldTokenBaseInfo } from '@subwallet/extension-base/types';
import { reformatAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';

import { BN, BN_ZERO } from '@polkadot/util';

import { calculateReward, dynamicTaoSlug } from '../../utils';
import { fetchDelegates, getTaoToAlphaMapping, TaoStakeInfo } from './tao';

interface Owner {
  ss58: string;
  hex: string;
}

interface Metadata {
  bittensor_id: string;
  name: string;
  owner: string;
  github: string;
  hw_requirements: string;
  image_url: string;
  description: string;
}

export interface SubnetData {
  netuid: number;
  owner: Owner;
  max_validators: number;
  metadata?: Metadata;
}

interface ApiResponse {
  data: SubnetData[];
}

interface MergeSubnetData extends SubnetData {
  name: string;
  symbol: string;
}

interface TaoStakingStakeOption {
  owner: string;
  amount: string;
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

interface PoolData {
  netuid: number;
  name: string;
  symbol: string;
}

interface PoolApiResponse {
  data: PoolData[];
}

const SUBNET_API_URL = 'https://dash.taostats.io/api/subnet';
const POOL_API_URL = 'https://dash.taostats.io/api/dtao/pool';

export async function fetchSubnetData () {
  try {
    const [subnetResponse, poolResponse] = await Promise.all([
      fetch(SUBNET_API_URL).then((res) => res.json()) as Promise<ApiResponse>,
      fetch(POOL_API_URL).then((res) => res.json()) as Promise<PoolApiResponse>
    ]);

    const poolMap = new Map(poolResponse.data.map((pool) => [pool.netuid, pool]));

    const filteredSubnets = subnetResponse.data.filter((subnet) => subnet.netuid !== 0);

    const mergedData = filteredSubnets.map((subnet) => ({
      ...subnet,
      name: poolMap.get(subnet.netuid)?.name || 'Unknown',
      symbol: poolMap.get(subnet.netuid)?.symbol || 'Unknown'
    }));

    return mergedData;
  } catch (err) {
    console.error('Error:', err);

    return [];
  }
}

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
  public subnetData: MergeSubnetData[] = [];

  constructor (state: KoniState, chain: string) {
    super(state, chain);
    this.subnetName = 'dTAO';
    this.slug = dynamicTaoSlug;
    this.name = 'Dynamic Tao Staking';
    this.shortName = 'dTAO Staking';
    this.init().catch(console.error);
  }

  private async init () {
    const data = await fetchSubnetData();

    if (data.length > 0) {
      this.subnetData = data;
    }
  }

  protected override getDescription (): string {
    return 'Stake TAO to earn rewards from subnet';
  }

  private getSubnetByNetuid (netuid: number): MergeSubnetData | undefined {
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
          const subnetName = `${subnet.metadata?.name || 'Unknown'} ${netuid}`;

          const data: NativeYieldPoolInfo = {
            ...this.baseInfo,
            type: this.type,
            slug: subnetSlug,
            metadata: {
              ...this.metadataInfo,
              name: subnetName,
              shortName: subnetName,
              description: subnet.metadata?.description || 'Stake TAO to earn rewards',
              subnetData: {
                subnetName: this.subnetName,
                netuid: subnet.netuid
              }
            },
            statistic: {
              assetEarning: [
                {
                  slug: this.nativeToken.slug
                }
              ],
              maxCandidatePerFarmer: subnet.max_validators,
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
      const activeStake = delegate.amount;
      const bnActiveStake = new BN(activeStake);

      if (bnActiveStake.gt(BN_ZERO)) {
        const delegationStatus = EarningStatus.EARNING_REWARD;

        allActiveStake = allActiveStake.add(bnActiveStake);

        nominationList.push({
          status: delegationStatus,
          chain: chainInfo.slug,
          validatorAddress: delegate.owner,
          activeStake: activeStake,
          validatorMinStake: minDelegatorStake
          // validatorIdentity: delegate.identity
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
        useAddresses.map(async (address) => (await substrateApi.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address)).toJSON())
      );
      const price = await getTaoToAlphaMapping(this.substrateApi);

      if (rawDelegateStateInfos && rawDelegateStateInfos.length > 0) {
        rawDelegateStateInfos.forEach((rawDelegateStateInfo, i) => {
          const owner = reformatAddress(useAddresses[i], 42);
          const delegateStateInfo = rawDelegateStateInfo as unknown as TaoStakeInfo[];

          const subnetPositions: Record<number, { delegatorState: TaoStakingStakeOption[], totalBalance: BN }> = {};

          for (const delegate of delegateStateInfo) {
            const hotkey = delegate.hotkey;
            const netuid = delegate.netuid;
            const stake = new BigN(delegate.stake);
            const subnet = this.getSubnetByNetuid(netuid);

            if (subnet) {
              const taoToAlphaPrice = price[netuid] ? new BigN(price[netuid]) : new BigN(1);
              const taoStake = stake.multipliedBy(taoToAlphaPrice).toFixed(0).toString();

              if (!subnetPositions[netuid]) {
                subnetPositions[netuid] = { delegatorState: [], totalBalance: BN_ZERO };
              }

              const existingStake = subnetPositions[netuid].delegatorState.find((d) => d.owner === hotkey);

              if (existingStake) {
                existingStake.amount = new BigN(existingStake.amount).plus(taoStake).toString();
              } else {
                subnetPositions[netuid].delegatorState.push({
                  owner: hotkey,
                  amount: taoStake
                });
              }

              subnetPositions[netuid].totalBalance = subnetPositions[netuid].totalBalance.add(new BN(taoStake));
            }
          }

          Object.entries(subnetPositions).forEach(([netuid, { delegatorState }]) => {
            const subnet = this.getSubnetByNetuid(parseInt(netuid));

            if (!subnet) {
              return;
            }

            const subnetSlug = `TAO___dynamic_staking___${this.chain}__subnet_${netuid.padStart(2, '0')}`;
            const subnetName = `${subnet.metadata?.name || 'Unknown'} ${netuid}`;
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
                      subnetShortName: subnetName
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
                  subnetShortName: subnetName
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
