// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ExtrinsicType, NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { BITTENSOR_REFRESH_STAKE_APY, BITTENSOR_REFRESH_STAKE_INFO } from '@subwallet/extension-base/constants';
import { getEarningStatusByNominations } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import BaseParaStakingPoolHandler from '@subwallet/extension-base/services/earning-service/handlers/native-staking/base-para';
import { BaseYieldPositionInfo, BasicTxErrorType, EarningStatus, NativeYieldPoolInfo, StakeCancelWithdrawalParams, SubmitJoinNativeStaking, TransactionData, UnstakingInfo, ValidatorInfo, YieldPoolInfo, YieldPoolMethodInfo, YieldPositionInfo, YieldTokenBaseInfo } from '@subwallet/extension-base/types';
import { reformatAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';

import { BN, BN_TEN, BN_ZERO } from '@polkadot/util';

import { calculateReward } from '../../utils';
import { TestnetBittensorDelegateInfo } from './dtao';

export interface TaoStakeInfo {
  hotkey: string;
  stake: string;
  netuid: number;
}

interface TaoStakingStakeOption {
  owner: string;
  amount: string;
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

interface ValidatorResponse {
  data: Validator[];
}

interface Validator {
  hotkey: {
    ss58: string;
  };
  name: string;
  nominators: number;
  stake: string;
  validator_stake: string;
  take: string;
  apr: string;
}

export const BITTENSOR_API_KEY_1 = process.env.BITTENSOR_API_KEY_1 || '';
export const BITTENSOR_API_KEY_2 = process.env.BITTENSOR_API_KEY_2 || '';
export const BITTENSOR_API_KEY_3 = process.env.BITTENSOR_API_KEY_3 || '';
export const BITTENSOR_API_KEY_4 = process.env.BITTENSOR_API_KEY_4 || '';
export const BITTENSOR_API_KEY_5 = process.env.BITTENSOR_API_KEY_5 || '';
export const BITTENSOR_API_KEY_6 = process.env.BITTENSOR_API_KEY_6 || '';
export const BITTENSOR_API_KEY_7 = process.env.BITTENSOR_API_KEY_7 || '';
export const BITTENSOR_API_KEY_8 = process.env.BITTENSOR_API_KEY_8 || '';
export const BITTENSOR_API_KEY_9 = process.env.BITTENSOR_API_KEY_9 || '';
export const BITTENSOR_API_KEY_10 = process.env.BITTENSOR_API_KEY_10 || '';

function random (...keys: string[]) {
  const validKeys = keys.filter((key) => key);
  const randomIndex = Math.floor(Math.random() * validKeys.length);

  return validKeys[randomIndex];
}

export const bittensorApiKey = (): string => {
  return random(BITTENSOR_API_KEY_1, BITTENSOR_API_KEY_2, BITTENSOR_API_KEY_3, BITTENSOR_API_KEY_4, BITTENSOR_API_KEY_5, BITTENSOR_API_KEY_6, BITTENSOR_API_KEY_7, BITTENSOR_API_KEY_8, BITTENSOR_API_KEY_9, BITTENSOR_API_KEY_10);
};

/* Fetch data */
export class BittensorCache {
  private static instance: BittensorCache | null = null;
  private cache: ValidatorResponse | null = null;
  private cacheTimeout: NodeJS.Timeout | null = null;
  private promise: Promise<ValidatorResponse> | null = null;

  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  private constructor () {}

  public static getInstance (): BittensorCache {
    if (!BittensorCache.instance) {
      BittensorCache.instance = new BittensorCache();
    }

    return BittensorCache.instance;
  }

  public async get (): Promise<ValidatorResponse> {
    if (this.cache) {
      return this.cache;
    }

    if (this.promise) {
      return this.promise;
    }

    this.promise = this.fetchData();

    return this.promise;
  }

  private async fetchData (): Promise<ValidatorResponse> {
    const apiKey = bittensorApiKey();

    try {
      const resp = await fetch('https://api.taostats.io/api/validator/latest/v1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${apiKey}`
        }
      });

      if (!resp.ok) {
        console.error('Fetch bittensor delegates fail:', resp.status);

        return this.cache || { data: [] };
      }

      const data = await resp.json() as ValidatorResponse;

      this.cache = data;
      this.promise = null;

      if (this.cacheTimeout) {
        clearTimeout(this.cacheTimeout);
      }

      this.cacheTimeout = setTimeout(() => {
        this.fetchData().then((newData) => {
          if (newData.data.length > 0) {
            this.cache = newData;
          }
        }).catch(console.error);
      }, 60 * 2000);

      return data;
    } catch (error) {
      console.error(error);
      this.promise = null;

      return this.cache || { data: [] };
    }
  }
}

// export async function fetchTaoDelegateState (address: string): Promise<RawDelegateState> {
//   const apiKey = bittensorApiKey();

//   return new Promise(function (resolve) {
//     fetch(`https://api.taostats.io/api/stake_balance/latest/v1?coldkey=${address}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `${apiKey}`
//       }
//     }).then((resp) => {
//       resolve(resp.json());
//     }).catch(console.error);
//   });
// }

/* Fetch data */

// const testnetDelegate = {
//   '5G6wdAdS7hpBuH1tjuZDhpzrGw9Wf71WEVakDCxHDm1cxEQ2': {
//     name: '0x436c6f776e4e616d65f09fa4a1',
//     url: 'https://example.com  ',
//     image: 'https://example.com/image.png',
//     discord: '0xe28094446973636f7264',
//     description: 'This is an example identity.',
//     additional: ''
//   }
// };

export default class TaoNativeStakingPoolHandler extends BaseParaStakingPoolHandler {
  protected override readonly availableMethod: YieldPoolMethodInfo = {
    join: true,
    defaultUnstake: true,
    fastUnstake: false,
    cancelUnstake: false,
    withdraw: false,
    claimReward: false
  };

  private bittensorCache: BittensorCache;
  constructor (state: KoniState, chain: string) {
    super(state, chain);
    this.bittensorCache = BittensorCache.getInstance();
  }

  /* Unimplemented function  */
  public override handleYieldWithdraw (address: string, unstakingInfo: UnstakingInfo): Promise<TransactionData> {
    return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
  }

  public override handleYieldCancelUnstake (params: StakeCancelWithdrawalParams): Promise<TransactionData> {
    return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
  }
  /* Unimplemented function  */

  public override get maintainBalance (): string {
    const ed = new BN(this.nativeToken.minAmount || '0');
    const calculateMaintainBalance = new BN(15).mul(ed).div(BN_TEN);

    const maintainBalance = calculateMaintainBalance;

    return maintainBalance.toString();
  }

  /* Subscribe pool info */

  async subscribePoolInfo (callback: (data: YieldPoolInfo) => void): Promise<VoidFunction> {
    let cancel = false;
    const substrateApi = this.substrateApi;

    const updateStakingInfo = async () => {
      try {
        if (cancel) {
          return;
        }

        const minDelegatorStake = (await substrateApi.api.query.subtensorModule.nominatorMinRequiredStake()).toPrimitive() || 0;
        const maxValidatorPerNominator = (await substrateApi.api.query.subtensorModule.maxAllowedValidators(0)).toPrimitive();
        const taoIn = (await substrateApi.api.query.subtensorModule.subnetTAO(0)).toPrimitive() as number;

        const bnTaoIn = new BN(taoIn);
        const BNminDelegatorStake = new BigN(minDelegatorStake.toString());

        const data: NativeYieldPoolInfo = {
          ...this.baseInfo,
          type: this.type,
          metadata: {
            ...this.metadataInfo,
            description: this.getDescription()
          },
          statistic: {
            assetEarning: [
              {
                slug: this.nativeToken.slug
              }
            ],
            maxCandidatePerFarmer: Number(maxValidatorPerNominator),
            maxWithdrawalRequestPerFarmer: 1,
            earningThreshold: {
              join: BNminDelegatorStake.toString(),
              defaultUnstake: '0',
              fastUnstake: '0'
            },
            eraTime: 24,
            era: 0,
            unstakingPeriod: 1.2,
            tvl: bnTaoIn.toString()
          }
        };

        callback(data);
      } catch (error) {
        console.log(error);
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
          validatorMinStake: minDelegatorStake,
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
    let cancel = false;
    const substrateApi = await this.substrateApi.isReady;
    const defaultInfo = this.baseInfo;
    const chainInfo = this.chainInfo;
    const _delegateInfo = await this.bittensorCache.get();

    const getPoolPosition = async () => {
      const rawDelegateStateInfos = await Promise.all(
        useAddresses.map(async (address) => (await substrateApi.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address)).toJSON())
      );

      if (rawDelegateStateInfos && rawDelegateStateInfos.length > 0) {
        rawDelegateStateInfos.forEach((rawDelegateStateInfo, i) => {
          const owner = reformatAddress(useAddresses[i], 42);
          const delegatorState: TaoStakingStakeOption[] = [];
          let bnTotalBalance = BN_ZERO;

          const delegateStateInfo = rawDelegateStateInfo as unknown as TaoStakeInfo[];

          const totalDelegate: Record<string, string> = {};

          for (const delegate of delegateStateInfo) {
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
            let identity = '';

            if (_delegateInfo) {
              const delegateInfo = _delegateInfo.data.find((info) => info.hotkey.ss58 === hotkey);

              identity = delegateInfo ? delegateInfo.name : '';
            }

            delegatorState.push({
              owner: hotkey,
              amount: totalDelegate[hotkey],
              identity: identity
            });
          }

          if (delegateStateInfo && delegateStateInfo.length > 0) {
            this.parseNominatorMetadata(chainInfo, owner, delegatorState)
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
      }
    };

    // const getMainnetPoolPosition = async () => {
    //   const rawDelegateStateInfos = await Promise.all(
    //     useAddresses.map((address) => fetchTaoDelegateState(address))
    //   );

    //   if (rawDelegateStateInfos.length > 0) {
    //     rawDelegateStateInfos.forEach((rawDelegateStateInfo, i) => {
    //       const owner = reformatAddress(useAddresses[i], 42);
    //       const delegatorState: TaoStakingStakeOption[] = [];
    //       let bnTotalBalance = BN_ZERO;
    //       const delegateStateInfo = rawDelegateStateInfo.data;

    //       for (const delegate of delegateStateInfo) {
    //         const name = delegate.hotkey_name || delegate.hotkey.ss58;

    //         bnTotalBalance = bnTotalBalance.add(new BN(delegate.stake));

    //         delegatorState.push({
    //           owner: delegate.hotkey.ss58,
    //           amount: delegate.stake,
    //           identity: name
    //         });
    //       }

    //       if (delegateStateInfo && delegateStateInfo.length > 0) {
    //         this.parseNominatorMetadata(chainInfo, owner, delegatorState)
    //           .then((nominatorMetadata) => {
    //             rsCallback({
    //               ...defaultInfo,
    //               ...nominatorMetadata,
    //               address: owner,
    //               type: this.type
    //             });
    //           })
    //           .catch(console.error);
    //       } else {
    //         rsCallback({
    //           ...defaultInfo,
    //           type: this.type,
    //           address: owner,
    //           balanceToken: this.nativeToken.slug,
    //           totalStake: '0',
    //           activeStake: '0',
    //           unstakeBalance: '0',
    //           status: EarningStatus.NOT_STAKING,
    //           isBondedBefore: false,
    //           nominations: [],
    //           unstakings: []
    //         });
    //       }
    //     });
    //   }
    // };

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
    const getNominatorMinRequiredStake = this.substrateApi.api.query.subtensorModule.nominatorMinRequiredStake();
    const nominatorMinRequiredStake = (await getNominatorMinRequiredStake).toString();
    const bnMinBond = new BN(nominatorMinRequiredStake);

    return testnetDelegate.map((delegate) => ({
      address: delegate.delegateSs58,
      totalStake: '0',
      ownStake: '0',
      otherStake: '0',
      minBond: bnMinBond.toString(),
      nominatorCount: delegate.nominators.length,
      commission: delegate.take / 1000,
      expectedReturn: 0,
      blocked: false,
      isVerified: false,
      chain: this.chain,
      isCrowded: false
    }) as unknown as ValidatorInfo);
  }

  private async getMainnetPoolTargets (): Promise<ValidatorInfo[]> {
    const _topValidator = await this.bittensorCache.get();

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
    if (this.chain === 'bittensor') {
      return this.getMainnetPoolTargets();
    } else {
      return this.getDevnetPoolTargets();
    }
  }

  /* Get pool targets */

  /* Join pool action */

  async createJoinExtrinsic (data: SubmitJoinNativeStaking, positionInfo?: YieldPositionInfo, bondDest = 'Staked'): Promise<[TransactionData, YieldTokenBaseInfo]> {
    const { amount, selectedValidators: targetValidators } = data;
    const chainApi = await this.substrateApi.isReady;
    const binaryAmount = new BN(amount);
    const selectedValidatorInfo = targetValidators[0];
    const hotkey = selectedValidatorInfo.address;

    const extrinsic = chainApi.api.tx.subtensorModule.addStake(hotkey, 0, binaryAmount);

    return [extrinsic, { slug: this.nativeToken.slug, amount: '0' }];
  }

  /* Join pool action */

  /* Leave pool action */

  async handleYieldUnstake (amount: string, address: string, selectedTarget?: string): Promise<[ExtrinsicType, TransactionData]> {
    const apiPromise = await this.substrateApi.isReady;
    const binaryAmount = new BN(amount);
    const poolPosition = await this.getPoolPosition(address);

    if (!selectedTarget || !poolPosition) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const extrinsic = apiPromise.api.tx.subtensorModule.removeStake(selectedTarget, 0, binaryAmount);

    return [ExtrinsicType.STAKING_UNBOND, extrinsic];
  }

  /* Leave pool action */
}
