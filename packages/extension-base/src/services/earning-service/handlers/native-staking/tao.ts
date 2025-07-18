// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ExtrinsicType, NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { BITTENSOR_REFRESH_STAKE_APY, BITTENSOR_REFRESH_STAKE_INFO } from '@subwallet/extension-base/constants';
import { getEarningStatusByNominations } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import BaseParaStakingPoolHandler from '@subwallet/extension-base/services/earning-service/handlers/native-staking/base-para';
import { BaseYieldPositionInfo, BasicTxErrorType, EarningStatus, NativeYieldPoolInfo, OptimalYieldPath, StakeCancelWithdrawalParams, StakingTxErrorType, SubmitBittensorChangeValidatorStaking, SubmitJoinNativeStaking, TransactionData, UnstakingInfo, ValidatorInfo, YieldPoolInfo, YieldPoolMethodInfo, YieldPositionInfo, YieldTokenBaseInfo } from '@subwallet/extension-base/types';
import { ProxyServiceRoute } from '@subwallet/extension-base/types/environment';
import { fetchFromProxyService, formatNumber, reformatAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { t } from 'i18next';

import { BN, BN_ZERO } from '@polkadot/util';

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
  global_nominators: number;
  validator_return_per_day: string;
  nominator_return_per_day: string;
  stake: string;
  validator_stake: string;
  take: string;
  root_stake: string;
  global_weighted_stake: string;
  weighted_root_stake: string;
  global_alpha_stake_as_tao: string;
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
  thirty_day_apy: string;
}

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
    try {
      const resp = await fetchFromProxyService(ProxyServiceRoute.BITTENSOR, '/dtao/validator/latest/v1?limit=100', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!resp.ok) {
        console.error('Fetch bittensor delegates fail:', resp.status);

        return this.cache || { data: [] };
      }

      const rawData = await resp.json() as ValidatorResponse;
      const data = {
        data: rawData.data.filter((validator) => parseFloat(validator.root_stake) > 0)
      };

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
  override readonly availableMethod: YieldPoolMethodInfo = {
    join: true,
    defaultUnstake: true,
    fastUnstake: false,
    cancelUnstake: false,
    withdraw: false,
    claimReward: false,
    changeValidator: true
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
    const ed = new BigN(this.nativeToken.minAmount || '0');
    const calculateMaintainBalance = new BigN(15).multipliedBy(ed).dividedBy(10);

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
        const _topValidator = await this.bittensorCache.fetchApr(0);

        const validators = _topValidator.data;
        const highestApr = validators[0];

        const bnTaoIn = new BigN(taoIn);
        const BNminDelegatorStake = new BigN(minDelegatorStake.toString());
        const apr = this.chain === 'bittensor' ? Number(highestApr.thirty_day_apy) * 100 : 0;

        const data: NativeYieldPoolInfo = {
          ...this.baseInfo,
          type: this.type,
          metadata: {
            ...this.metadataInfo,
            description: this.getDescription(formatNumber(BNminDelegatorStake, _getAssetDecimals(this.nativeToken)))
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
            tvl: bnTaoIn.toString(),
            totalApy: apr
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

  // Because not have subscan api
  override async checkAccountHaveStake (useAddresses: string[]): Promise<string[]> {
    return Promise.resolve([]);
  }

  /* Subscribe pool position */

  /* Get pool targets */

  // eslint-disable-next-line @typescript-eslint/require-await
  private async getDevnetPoolTargets (): Promise<ValidatorInfo[]> {
    const testnetDelegate = (await this.substrateApi.api.call.delegateInfoRuntimeApi.getDelegates()).toJSON() as unknown as TestnetBittensorDelegateInfo[];
    const getNominatorMinRequiredStake = this.substrateApi.api.query.subtensorModule.nominatorMinRequiredStake();
    const nominatorMinRequiredStake = (await getNominatorMinRequiredStake).toString();
    const bnMinBond = new BigN(nominatorMinRequiredStake);

    return testnetDelegate.map((delegate) => ({
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

    const topValidator = _topValidator;
    const getNominatorMinRequiredStake = this.substrateApi.api.query.subtensorModule.nominatorMinRequiredStake();
    const nominatorMinRequiredStake = (await getNominatorMinRequiredStake).toString();
    const bnMinBond = new BigN(nominatorMinRequiredStake);
    const validatorList = topValidator.data;

    const aprResponse = await this.bittensorCache.fetchApr(0);
    const aprMap: Record<string, string> = {};

    aprResponse.data.forEach((item) => {
      aprMap[item.hotkey.ss58] = item.thirty_day_apy;
    });

    const results = await Promise.all(
      validatorList.map((validator) => {
        const address = validator.hotkey.ss58;
        // With bittensor we use total weight, root weight and alpha staked insted of total stake, own stake and other stake
        const bnTotalWeightStake = new BigN(validator.global_weighted_stake);
        const bnRootWeightStake = new BigN(validator.weighted_root_stake);
        const bnAlphaStake = new BigN(validator.global_alpha_stake_as_tao);

        const nominatorCount = validator.global_nominators;
        const commission = validator.take;
        const roundedCommission = (parseFloat(commission) * 100).toFixed(0);

        const apr = aprMap[address];
        const expectedReturn = apr ? new BigN(apr).multipliedBy(100).toFixed(2) : '0';

        const name = validator.name || address;

        return {
          address: address,
          totalStake: bnTotalWeightStake.toString(),
          ownStake: bnRootWeightStake.toString(),
          otherStake: bnAlphaStake.toString(),
          minBond: bnMinBond.toString(),
          nominatorCount: nominatorCount,
          commission: roundedCommission,
          expectedReturn: expectedReturn,
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
    const binaryAmount = new BigN(amount);
    const selectedValidatorInfo = targetValidators[0];
    const hotkey = selectedValidatorInfo.address;

    const extrinsic = chainApi.api.tx.subtensorModule.addStake(hotkey, 0, binaryAmount.toFixed());

    return [extrinsic, { slug: this.nativeToken.slug, amount: '0' }];
  }

  // Validate for case stake more
  public override async validateYieldJoin (data: SubmitJoinNativeStaking, path: OptimalYieldPath): Promise<TransactionError[]> {
    const baseErrors = await super.validateYieldJoin(data, path);

    if (baseErrors.length > 0) {
      return baseErrors;
    }

    const { amount } = data;

    const minDelegatorStake = (await this.substrateApi.api.query.subtensorModule.nominatorMinRequiredStake()).toPrimitive() || 0;
    const bnMinStake = minDelegatorStake.toString();

    if (new BigN(amount).lt(bnMinStake)) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t(`Insufficient stake. You need to stake at least ${formatNumber(bnMinStake, _getAssetDecimals(this.nativeToken))} ${_getAssetSymbol(this.nativeToken)} to earn rewards`))];
    }

    return baseErrors;
  }

  /* Join pool action */

  /* Leave pool action */

  async handleYieldUnstake (amount: string, address: string, selectedTarget?: string): Promise<[ExtrinsicType, TransactionData]> {
    const apiPromise = await this.substrateApi.isReady;
    const binaryAmount = new BigN(amount);
    const poolPosition = await this.getPoolPosition(address);

    if (!selectedTarget || !poolPosition) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const extrinsic = apiPromise.api.tx.subtensorModule.removeStake(selectedTarget, 0, binaryAmount.toFixed());

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

    const minDelegatorStake = (await this.substrateApi.api.query.subtensorModule.nominatorMinRequiredStake()).toPrimitive() || 0;
    const bnMinUnstake = new BigN(minDelegatorStake.toString());

    if (new BigN(amount).lt(bnMinUnstake)) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t(`Amount too low. You need to unstake at least ${formatNumber(bnMinUnstake, _getAssetDecimals(this.nativeToken))} ${_getAssetSymbol(this.nativeToken)}`))];
    }

    return baseErrors;
  }

  /* Leave pool action */

  /* Change validator */
  override async handleChangeEarningValidator (data: SubmitBittensorChangeValidatorStaking): Promise<TransactionData> {
    const chainApi = await this.substrateApi.isReady;
    const { amount, maxAmount, originValidator, selectedValidators: targetValidators } = data;

    if (!originValidator) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    // Bittensor only supports changing 1 validator at a time, not multiple
    const selectedValidatorInfo = targetValidators[0];
    const destValidator = selectedValidatorInfo.address;

    if (new BigN(amount).lte(0)) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS, t('Amount must be greater than 0')));
    }

    if (originValidator === destValidator) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'From validator is the same with to validator'));
    }

    const minDelegatorStake = (await this.substrateApi.api.query.subtensorModule.nominatorMinRequiredStake()).toPrimitive() || 0;
    const bnMinMoveStake = new BigN(minDelegatorStake.toString());

    if (new BigN(maxAmount).lt(bnMinMoveStake)) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS, t(`Amount too low. You need to move at least ${formatNumber(bnMinMoveStake, _getAssetDecimals(this.nativeToken))} ${_getAssetSymbol(this.nativeToken)}`)));
    }

    // Avoid remaining amount too low -> can't do anything with that amount
    if (!(maxAmount === amount) && new BigN(maxAmount).minus(new BigN(amount)).lt(bnMinMoveStake)) {
      return Promise.reject(new TransactionError(StakingTxErrorType.REMAINING_AMOUNT_TOO_LOW,
        t(`Your remaining stake on the initial validator will fall below minimum active stake and cannot be unstaked if you proceed with the chosen amount. Hit "Move all" to move all ${formatNumber(maxAmount, _getAssetDecimals(this.nativeToken))} ${_getAssetSymbol(this.nativeToken)} to the new validator, or "Cancel" and lower the amount, then try again`
        )));
    }

    const extrinsic = chainApi.api.tx.subtensorModule.moveStake(originValidator, destValidator, 0, 0, amount);

    return extrinsic;
  }
}
