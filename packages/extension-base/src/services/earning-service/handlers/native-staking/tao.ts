// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ExtrinsicType, NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { BITTENSOR_REFRESH_STAKE_APY, BITTENSOR_REFRESH_STAKE_INFO } from '@subwallet/extension-base/constants';
import { getEarningStatusByNominations } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import BaseParaStakingPoolHandler from '@subwallet/extension-base/services/earning-service/handlers/native-staking/base-para';
import { BaseYieldPositionInfo, BasicTxErrorType, EarningStatus, NativeYieldPoolInfo, StakeCancelWithdrawalParams, SubmitJoinNativeStaking, TransactionData, UnstakingInfo, ValidatorInfo, YieldPoolInfo, YieldPositionInfo, YieldTokenBaseInfo } from '@subwallet/extension-base/types';
import { reformatAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';

import { BN, BN_ZERO } from '@polkadot/util';

import { calculateReward } from '../../utils';

interface TaoStakingStakeOption {
  owner: string,
  amount: string,
}

interface Hotkey {
  ss58: string;
}

export interface RawDelegateState {
  items: Array<{
    balance: string;
    delegate_address: {
      ss58: string;
    };
  }>;
}

interface ValidatorResponse {
  count: number;
  validators: Validator[];
}

interface Validator {
  validator_stake: string;
  amount: string;
  nominators: number;
  apr: string;
  hot_key: {
    ss58: string;
  };
  take: string;
  system_total_stake: string;
}

// interface ValidatorName {
//   count: number;
//   delegates: {
//     name: string;
//   }[];
// }
export const BITTENSOR_API_KEY_1 = process.env.BITTENSOR_API_KEY_1 || '';
export const BITTENSOR_API_KEY_2 = process.env.BITTENSOR_API_KEY_2 || '';

function random (...keys: string[]) {
  const validKeys = keys.filter((key) => key);
  const randomIndex = Math.floor(Math.random() * validKeys.length);

  return validKeys[randomIndex];
}

export const bittensorApiKey = (): string => {
  return random(BITTENSOR_API_KEY_1, BITTENSOR_API_KEY_2);
};

/* Fetch data */

export async function fetchDelegates (): Promise<ValidatorResponse> {
  const apiKey = bittensorApiKey();

  return new Promise(function (resolve) {
    fetch('https://api.taostats.io/api/v1/validator?order=amount%3Adesc&limit=100', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${apiKey}`
      }
    }).then((resp) => {
      resolve(resp.json());
    }).catch(console.error);
  });
}

export async function fetchTaoDelegateState (address: string): Promise<RawDelegateState> {
  const apiKey = bittensorApiKey();

  return new Promise(function (resolve) {
    fetch(`https://api.taostats.io/api/v1/delegate/balance?nominator_address=${address}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${apiKey}`
      }
    }).then((resp) => {
      resolve(resp.json());
    }).catch(console.error);
  });
}

/* Fetch data */

const testnetDelegate = {
  '5G6wdAdS7hpBuH1tjuZDhpzrGw9Wf71WEVakDCxHDm1cxEQ2': {
    name: '0x436c6f776e4e616d65f09fa4a1',
    url: 'https://example.com  ',
    image: 'https://example.com/image.png',
    discord: '0xe28094446973636f7264',
    description: 'This is an example identity.',
    additional: ''
  }
};

export default class TaoNativeStakingPoolHandler extends BaseParaStakingPoolHandler {
  /* Unimplemented function  */
  public override handleYieldWithdraw (address: string, unstakingInfo: UnstakingInfo): Promise<TransactionData> {
    return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
  }

  public override handleYieldCancelUnstake (params: StakeCancelWithdrawalParams): Promise<TransactionData> {
    return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
  }
  /* Unimplemented function  */

  // async fetchDelegatesInfo (address: string): Promise<ValidatorName> {
  //   const apiKey = this.bittensorApiKey;

  //   return new Promise(function (resolve) {
  //     fetch(`https://api.taostats.io/api/v1/delegate/info?address=${address}`, {
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

  /* Subscribe pool info */

  async subscribePoolInfo (callback: (data: YieldPoolInfo) => void): Promise<VoidFunction> {
    let cancel = false;
    const substrateApi = this.substrateApi;

    const updateStakingInfo = async () => {
      try {
        if (cancel) {
          return;
        }

        const minDelegatorStake = await substrateApi.api.query.subtensorModule.nominatorMinRequiredStake();

        const BNminDelegatorStake = new BigN(minDelegatorStake.toString());

        const data: NativeYieldPoolInfo = {
          ...this.baseInfo,
          type: this.type,
          metadata: {
            ...this.metadataInfo,
            description: this.getDescription('0')
          },
          statistic: {
            assetEarning: [
              {
                slug: this.nativeToken.slug
              }
            ],
            maxCandidatePerFarmer: 16,
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
          validatorMinStake: minDelegatorStake
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

    const getDevnetPoolPosition = async () => {
      const testnetAddress = Object.keys(testnetDelegate)[0];
      const delegatorState: TaoStakingStakeOption[] = [];
      let bnTotalBalance = BN_ZERO;

      const stakePromises = useAddresses.map(async (address) => {
        const stakeAmount = (await substrateApi.api.query.subtensorModule.stake(testnetAddress, address)).toString();
        const bnStakeAmount = new BN(stakeAmount);

        bnTotalBalance = bnTotalBalance.add(bnStakeAmount);

        delegatorState.push({
          owner: testnetAddress,
          amount: bnStakeAmount.toString()
        });

        rsCallback({
          ...defaultInfo,
          type: this.type,
          address: address,
          balanceToken: this.nativeToken.slug,
          totalStake: bnTotalBalance.toString(),
          activeStake: bnStakeAmount.toString(),
          unstakeBalance: '0',
          status: EarningStatus.EARNING_REWARD,
          isBondedBefore: true,
          nominations: delegatorState.map((delegate) => ({
            chain: this.chain,
            validatorAddress: delegate.owner,
            activeStake: delegate.amount,
            status: EarningStatus.EARNING_REWARD
          })),
          unstakings: []
        });
      });

      await Promise.all(stakePromises);
    };

    const getMainnetPoolPosition = async () => {
      const rawDelegateStateInfos = await Promise.all(
        useAddresses.map((address) => fetchTaoDelegateState(address))
      );

      if (rawDelegateStateInfos.length > 0) {
        rawDelegateStateInfos.forEach((rawDelegateStateInfo, i) => {
          const owner = reformatAddress(useAddresses[i], 42);
          const delegatorState: TaoStakingStakeOption[] = [];
          let bnTotalBalance = BN_ZERO;
          const delegateStateInfo = rawDelegateStateInfo.items;

          for (const delegate of delegateStateInfo) {
            bnTotalBalance = bnTotalBalance.add(new BN(delegate.balance));
            delegatorState.push({
              owner: delegate.delegate_address.ss58,
              amount: delegate.balance.toString()
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

    const getStakingPositionInterval = async () => {
      if (cancel) {
        return;
      }

      if (this.chain === 'bittensor_devnet') {
        await getDevnetPoolPosition();
      } else {
        await getMainnetPoolPosition();
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

  // eslint-disable-next-line @typescript-eslint/require-await
  private async getDevnetPoolTargets (): Promise<ValidatorInfo[]> {
    const _topValidator = testnetDelegate;
    const validatorAddresses = Object.keys(_topValidator);

    return validatorAddresses.map((address) => {
      return {
        address: address,
        totalStake: '0',
        ownStake: '0',
        otherStake: '0',
        minBond: '0',
        nominatorCount: 0,
        commission: '0',
        expectedReturn: 0,
        blocked: false,
        isVerified: false,
        chain: this.chain,
        isCrowded: false,
        identity: address
      } as unknown as ValidatorInfo;
    });
  }

  private async getMainnetPoolTargets (): Promise<ValidatorInfo[]> {
    const _topValidator = await fetchDelegates();
    const topValidator = _topValidator as unknown as Record<string, Record<string, Record<string, string>>>;
    const getNominatorMinRequiredStake = this.substrateApi.api.query.subtensorModule.nominatorMinRequiredStake();
    const nominatorMinRequiredStake = (await getNominatorMinRequiredStake).toString();
    const bnMinBond = new BN(nominatorMinRequiredStake);
    const validatorList = topValidator.validators;
    const validatorAddresses = Object.keys(validatorList);

    const results = await Promise.all(
      validatorAddresses.map((i) => {
        const address = (validatorList[i].hot_key as unknown as Hotkey).ss58;
        const bnTotalStake = new BN(validatorList[i].amount);
        const bnOwnStake = new BN(validatorList[i].validator_stake);
        const otherStake = bnTotalStake.sub(bnOwnStake);
        const nominatorCount = validatorList[i].nominators;
        const commission = validatorList[i].take;
        const roundedCommission = (parseFloat(commission) * 100).toFixed(0);

        const apr = ((parseFloat(validatorList[i].apr) / 10 ** 9) * 100).toFixed(2);
        const apyCalculate = calculateReward(parseFloat(apr));

        // let name = '';
        // const delegateInfo = await this.fetchDelegatesInfo(address);

        // name = delegateInfo.delegates[0]?.name || address;

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
          identity: address // name
        } as unknown as ValidatorInfo;
      })
    );

    return results;
  }

  async getPoolTargets (): Promise<ValidatorInfo[]> {
    if (this.chain === 'bittensor_devnet') {
      return this.getDevnetPoolTargets();
    } else {
      return this.getMainnetPoolTargets();
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

    const extrinsic = chainApi.api.tx.subtensorModule.addStake(hotkey, binaryAmount);

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

    const extrinsic = apiPromise.api.tx.subtensorModule.removeStake(selectedTarget, binaryAmount);

    return [ExtrinsicType.STAKING_LEAVE_POOL, extrinsic];
  }

  /* Leave pool action */
}