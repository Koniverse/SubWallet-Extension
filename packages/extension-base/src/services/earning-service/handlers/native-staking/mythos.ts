// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { APIItemState, ExtrinsicType, NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { getCommission } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { _EXPECTED_BLOCK_TIME, _STAKING_ERA_LENGTH_MAP } from '@subwallet/extension-base/services/chain-service/constants';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import BaseParaStakingPoolHandler from '@subwallet/extension-base/services/earning-service/handlers/native-staking/base-para';
import { BasicTxErrorType, EarningRewardItem, EarningStatus, NativeYieldPoolInfo, SubmitJoinNativeStaking, TransactionData, UnstakingInfo, UnstakingStatus, ValidatorInfo, YieldPoolInfo, YieldPoolMethodInfo, YieldPositionInfo, YieldTokenBaseInfo } from '@subwallet/extension-base/types';
import { balanceFormatter, formatNumber, reformatAddress } from '@subwallet/extension-base/utils';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { UnsubscribePromise } from '@polkadot/api-base/types/base';
import { Codec } from '@polkadot/types/types';

interface PalletCollatorStakingCandidateInfo {
  stake: string,
  stakers: string // number of stakers
}

interface PalletCollatorStakingUserStakeInfo {
  stake: string,
  maybeLastUnstake: string[], // amount and block
  candidates: string[],
  maybeLastRewardSession: string // unclaimed from session
}

interface PalletCollatorStakingCandidateStakeInfo {
  session: string,
  stake: string
}

interface PalletCollatorStakingReleaseRequest {
  block: number,
  amount: string
}

export default class MythosNativeStakingPoolHandler extends BaseParaStakingPoolHandler {
  protected override readonly availableMethod: YieldPoolMethodInfo = {
    join: true,
    defaultUnstake: true,
    fastUnstake: false,
    cancelUnstake: false,
    withdraw: true,
    claimReward: true
  };

  /* Subscribe pool info */

  async subscribePoolInfo (callback: (data: YieldPoolInfo) => void): Promise<VoidFunction> {
    let cancel = false;
    const substrateApi = this.substrateApi;
    const nativeToken = this.nativeToken;

    const defaultCallback = async () => {
      const data: NativeYieldPoolInfo = {
        ...this.baseInfo,
        type: this.type,
        metadata: {
          ...this.metadataInfo,
          description: this.getDescription()
        }
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

    await substrateApi.isReady;

    const unsub = await (substrateApi.api.query.collatorStaking.currentSession(async (_session: Codec) => {
      if (cancel) {
        unsub();

        return;
      }

      const currentSession = _session.toString();
      const maxStakers = substrateApi.api.consts.collatorStaking.maxStakers.toString();
      const unstakeDelay = substrateApi.api.consts.collatorStaking.stakeUnlockDelay.toString();
      const maxStakedCandidates = substrateApi.api.consts.collatorStaking.maxStakedCandidates.toString();
      const sessionTime = _STAKING_ERA_LENGTH_MAP[this.chain] || _STAKING_ERA_LENGTH_MAP.default; // in hours
      const blockTime = _EXPECTED_BLOCK_TIME[this.chain];
      const unstakingPeriod = parseInt(unstakeDelay) * blockTime / 60 / 60;

      const _minStake = await substrateApi.api.query.collatorStaking.minStake();
      const minStake = _minStake.toString();
      const minStakeToHuman = formatNumber(minStake, nativeToken.decimals || 0, balanceFormatter);

      const data: NativeYieldPoolInfo = {
        ...this.baseInfo,
        type: this.type,
        metadata: {
          ...this.metadataInfo,
          description: this.getDescription(minStakeToHuman)
        },
        statistic: {
          assetEarning: [
            {
              slug: this.nativeToken.slug
            }
          ],
          maxCandidatePerFarmer: parseInt(maxStakedCandidates),
          maxWithdrawalRequestPerFarmer: 3,
          earningThreshold: {
            join: minStake,
            defaultUnstake: '0',
            fastUnstake: '0'
          },
          era: parseInt(currentSession),
          eraTime: sessionTime,
          unstakingPeriod: unstakingPeriod,
          totalApy: undefined
          // tvl: totalStake.toString(),
          // inflation
        },
        maxPoolMembers: parseInt(maxStakers)
      };

      callback(data);
    }) as unknown as UnsubscribePromise);

    return () => {
      cancel = true;
      unsub();
    };
  }

  /* Subscribe pool info */

  /* Subscribe pool position */

  async subscribePoolPosition (useAddresses: string[], resultCallback: (rs: YieldPositionInfo) => void): Promise<VoidFunction> {
    let cancel = false;
    const substrateApi = await this.substrateApi.isReady;
    const defaultInfo = this.baseInfo;
    const unsub = await substrateApi.api.query.collatorStaking.userStake.multi(useAddresses, async (userStakes: Codec[]) => {
      if (cancel) {
        unsub();

        return;
      }

      if (userStakes) {
        await Promise.all(userStakes.map(async (_userStake, i) => {
          const userStake = _userStake.toPrimitive() as unknown as PalletCollatorStakingUserStakeInfo;
          const owner = reformatAddress(useAddresses[i], 42);

          if (userStake) {
            const nominatorMetadata = await this.parseCollatorMetadata(this.chainInfo, useAddresses[i], substrateApi, userStake);

            resultCallback({
              ...defaultInfo,
              ...nominatorMetadata,
              address: owner,
              type: this.type
            });
          } else {
            resultCallback({
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
        }));
      }
    });

    return () => {
      cancel = true;
      unsub();
    };
  }

  async parseCollatorMetadata (chainInfo: _ChainInfo, stakerAddress: string, substrateApi: _SubstrateApi, userStake: PalletCollatorStakingUserStakeInfo) {
    const nominationList: NominationInfo[] = [];
    const unstakingList: UnstakingInfo[] = [];
    let unstakingBalance = BigInt(0);

    const { candidates, stake } = userStake;

    const [_minStake, _unstaking, _currentBlock, _currentTimestamp] = await Promise.all([
      substrateApi.api.query.collatorStaking.minStake(),
      substrateApi.api.query.collatorStaking.releaseQueues(stakerAddress),
      substrateApi.api.query.system.number(),
      substrateApi.api.query.timestamp.now()
    ]);

    const minStake = _minStake.toPrimitive() as string;
    const stakingStatus = candidates && !!candidates.length ? EarningStatus.EARNING_REWARD : EarningStatus.NOT_EARNING;
    const isBondedBefore = candidates && !!candidates.length;
    const unstakings = _unstaking.toPrimitive() as unknown as PalletCollatorStakingReleaseRequest[];
    const currentBlock = _currentBlock.toPrimitive() as number;
    const currentTimestamp = _currentTimestamp.toPrimitive() as number;
    const blockDuration = _EXPECTED_BLOCK_TIME[chainInfo.slug];

    if (candidates.length) {
      await Promise.all(candidates.map(async (collatorAddress) => {
        const _stakeInfo = await substrateApi.api.query.collatorStaking.candidateStake(collatorAddress, stakerAddress);
        const stakeInfo = _stakeInfo.toPrimitive() as unknown as PalletCollatorStakingCandidateStakeInfo;
        const activeStake = stakeInfo.stake.toString();

        const earningStatus = BigInt(activeStake) > BigInt(0) && BigInt(activeStake) >= BigInt(minStake)
          ? EarningStatus.EARNING_REWARD
          : EarningStatus.NOT_EARNING;

        nominationList.push({
          status: earningStatus,
          chain: chainInfo.slug,
          validatorAddress: collatorAddress,
          activeStake,
          validatorMinStake: minStake,
          hasUnstaking: !!unstakings.length
        });
      }));
    }

    if (unstakings.length) {
      unstakings.forEach((unstaking) => {
        const releaseBlock = unstaking.block;
        const unstakeAmount = unstaking.amount;
        const isClaimable = currentBlock >= releaseBlock;
        const targetTimestampMs = (releaseBlock - currentBlock) * blockDuration * 1000 + currentTimestamp;

        unstakingBalance = unstakingBalance + BigInt(unstakeAmount);

        unstakingList.push({
          chain: chainInfo.slug,
          status: isClaimable ? UnstakingStatus.CLAIMABLE : UnstakingStatus.UNLOCKING,
          claimable: unstakeAmount,
          targetTimestampMs
        } as UnstakingInfo);
      });
    }

    return {
      status: stakingStatus,
      balanceToken: this.nativeToken.slug,
      totalStake: (BigInt(stake) + unstakingBalance).toString(),
      activeStake: stake,
      unstakeBalance: unstakingBalance.toString() || '0',
      isBondedBefore: isBondedBefore,
      nominations: nominationList,
      unstakings: unstakingList
    };
  }

  /* Subscribe pool position */

  /* Get pool targets */

  async getPoolTargets (): Promise<ValidatorInfo[]> {
    const substrateApi = await this.substrateApi.isReady;

    const [_allCollators, _minStake, _commission] = await Promise.all([
      substrateApi.api.query.collatorStaking.candidates.entries(),
      substrateApi.api.query.collatorStaking.minStake(),
      substrateApi.api.query.collatorStaking.collatorRewardPercentage()
    ]);

    const maxStakersPerCollator = substrateApi.api.consts.collatorStaking.maxStakers.toPrimitive() as number;

    return _allCollators.map((_collator) => {
      const _collatorAddress = _collator[0].toHuman() as unknown as string[];
      const collatorAddress = _collatorAddress[0];
      const collatorInfo = _collator[1].toPrimitive() as unknown as PalletCollatorStakingCandidateInfo;

      const bnTotalStake = BigInt(collatorInfo.stake);
      const numOfStakers = parseInt(collatorInfo.stakers);
      const isCrowded = numOfStakers >= maxStakersPerCollator;

      return {
        address: collatorAddress,
        chain: this.chain,
        totalStake: bnTotalStake.toString(),
        ownStake: '0',
        otherStake: bnTotalStake.toString(),
        minBond: _minStake.toPrimitive(),
        nominatorCount: numOfStakers,
        commission: getCommission(_commission.toString()),
        blocked: false,
        isVerified: false,
        isCrowded
      } as ValidatorInfo;
    });
  }

  /* Get pool targets */

  /* Join pool action */

  async createJoinExtrinsic (data: SubmitJoinNativeStaking, positionInfo?: YieldPositionInfo): Promise<[TransactionData, YieldTokenBaseInfo]> {
    const substrateApi = await this.substrateApi.isReady;
    const { address, amount, selectedValidators } = data;
    const selectedValidatorInfo = selectedValidators[0];
    const _hasReward = await substrateApi.api.call?.collatorStakingApi?.shouldClaim(address);
    const hasReward = _hasReward?.toPrimitive();
    const extrinsicList: SubmittableExtrinsic<'promise'>[] = [];

    if (positionInfo?.isBondedBefore && hasReward) {
      extrinsicList.push(substrateApi.api.tx.collatorStaking.claimRewards());
    }

    extrinsicList.push(...[
      substrateApi.api.tx.collatorStaking.lock(amount),
      substrateApi.api.tx.collatorStaking.stake([{
        candidate: selectedValidatorInfo.address,
        stake: amount
      }])
    ]);

    return [substrateApi.api.tx.utility.batchAll(extrinsicList), { slug: this.nativeToken.slug, amount: '0' }];
  }

  /* Join pool action */

  /* Leave pool action */

  async handleYieldUnstake (amount: string, address: string, selectedTarget?: string): Promise<[ExtrinsicType, TransactionData]> {
    const substrateApi = await this.substrateApi.isReady;
    const _hasReward = await substrateApi.api.call?.collatorStakingApi?.shouldClaim(address);
    const hasReward = _hasReward?.toPrimitive();
    const extrinsicList: SubmittableExtrinsic<'promise'>[] = [];

    if (hasReward) {
      extrinsicList.push(substrateApi.api.tx.collatorStaking.claimRewards());
    }

    extrinsicList.push(...[
      substrateApi.api.tx.collatorStaking.unstakeFrom(selectedTarget),
      substrateApi.api.tx.collatorStaking.unlock(null) // ignore amount to unlock all
    ]);

    return [ExtrinsicType.STAKING_UNBOND, substrateApi.api.tx.utility.batchAll(extrinsicList)];
  }

  /* Leave pool action */

  /* Get pool reward */
  override async getPoolReward (useAddresses: string[], callback: (rs: EarningRewardItem, tokenInfo: _ChainAsset) => void): Promise<VoidFunction> {
    let cancel = false;
    const substrateApi = this.substrateApi;

    await substrateApi.isReady;

    if (substrateApi.api.call.collatorStakingApi) {
      await Promise.all(useAddresses.map(async (address) => {
        if (!cancel) {
          const _unclaimedReward = await substrateApi.api.call.collatorStakingApi.totalRewards(address);
          const earningRewardItem = {
            ...this.baseInfo,
            address: address,
            type: this.type,
            unclaimedReward: _unclaimedReward?.toString() || '0',
            state: APIItemState.READY
          };

          if (_unclaimedReward.toString() !== '0') {
            // await this.createClaimNotification(earningRewardItem, this.nativeToken);
            callback(earningRewardItem, this.nativeToken);
          }
        }
      }));
    }

    return () => {
      cancel = false;
    };
  }
  /* Get pool reward */

  /* Other action */

  async handleYieldCancelUnstake () {
    return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
  }

  async handleYieldWithdraw (address: string, unstakingInfo: UnstakingInfo) {
    const substrateApi = await this.substrateApi.isReady;

    return substrateApi.api.tx.collatorStaking.release();
  }

  override async handleYieldClaimReward (address: string, bondReward?: boolean) {
    const substrateApi = await this.substrateApi.isReady;

    return substrateApi.api.tx.collatorStaking.claimRewards();
  }
  /* Other action */
}
