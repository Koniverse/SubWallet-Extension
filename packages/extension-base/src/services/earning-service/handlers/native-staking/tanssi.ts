// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { APIItemState, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import { BasicTxErrorType, EarningRewardItem, EarningStatus, NativeYieldPoolInfo, NominationInfo, StakeCancelWithdrawalParams, SubmitJoinNativeStaking, TransactionData, UnstakingInfo, ValidatorInfo, YieldPoolInfo, YieldPoolMethodInfo, YieldPoolTarget, YieldPositionInfo, YieldTokenBaseInfo } from '@subwallet/extension-base/types';
import { formatNumber } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';

import { ApiPromise } from '@polkadot/api';
import { AnyJson } from '@polkadot/types/types';

import { parseIdentity } from '../../utils';
import BaseParaNativeStakingPoolHandler from './base-para';

interface SortedEligibleCandidate {
  candidate: string;
  stake: string;
}

interface ChainsToReward {
  paraIds: number[];
  rewardsPerChain: string;
}

interface ActiveCollatorContainerChain {
  orchestratorChain: string[];
  containerChains: Record<string, string[]>;
}

interface CandidateSummary {
  delegators: number;
}

interface OwnStakeInfo {
  autoCompounding: string;
  autoCompoundingShares: string;
  manualRewards: string;
  joining: string;
  leaving: string;
  totalStake: string;
  claimable: string;
}

interface CollatorActiveConfig {
  maxCollators: number;
}

// Constants
const sequencersPerAppchain = new BigN(5);
const rewardsForStakers = new BigN(0.8);
const blocksPerYear = new BigN(5_256_000); // 6 seconds block time hence 365 * 24 * 60 * 60 / 6 (5.256.000) blocks per year

function calculateCollatorApy (rewardsPerBlock: string, totalStake: BigN, nativeTokenDecimals: number): BigN {
  const rewardsPerChainPerYear = new BigN(rewardsPerBlock).times(blocksPerYear);
  const rewardsPerSequencerPerYear = rewardsPerChainPerYear.div(sequencersPerAppchain);
  const rewardsForStakersPerSequencerPerYear = rewardsPerSequencerPerYear.times(rewardsForStakers);

  const formattedTotalStake = formatNumber(totalStake.toString(), nativeTokenDecimals);

  if (formattedTotalStake === '0') {
    return new BigN(0);
  }

  return rewardsForStakersPerSequencerPerYear.times(100).div(formattedTotalStake);
}

async function getActiveCollators (api: ApiPromise): Promise<string[]> {
  const collatorAssignment = await api.query.tanssiCollatorAssignment.collatorContainerChain();

  const activeCollatorContainerChain = collatorAssignment.toPrimitive() as unknown as ActiveCollatorContainerChain;

  const activeCollators = Object.values(activeCollatorContainerChain.containerChains || {}).flat().map((c) => c.toString());

  return activeCollators;
}

function perbillToPercentBn (perbill: AnyJson): number {
  const raw = new BigN(perbill?.toString() || '0');

  const bnPercent = raw.multipliedBy(new BigN(100)).div(new BigN(1_000_000_000));

  return bnPercent.toNumber();
}

async function getOwnStakes (chainApi: _SubstrateApi, candidates: string[], delegator: string): Promise<Record<string, OwnStakeInfo>> {
  const queries = [];

  for (const candidate of candidates) {
    // Auto-compounding
    queries.push([candidate, { AutoCompoundingShares: { delegator } }]);
    queries.push([candidate, 'AutoCompoundingSharesSupply']);
    queries.push([candidate, 'AutoCompoundingSharesTotalStaked']);

    // Manual rewards
    queries.push([candidate, { ManualRewardsShares: { delegator } }]);
    queries.push([candidate, 'ManualRewardsSharesSupply']);
    queries.push([candidate, 'ManualRewardsSharesTotalStaked']);

    // Joining
    queries.push([candidate, { JoiningShares: { delegator } }]);
    queries.push([candidate, 'JoiningSharesSupply']);
    queries.push([candidate, 'JoiningSharesTotalStaked']);

    // Leaving
    queries.push([candidate, { LeavingShares: { delegator } }]);
    queries.push([candidate, 'LeavingSharesSupply']);
    queries.push([candidate, 'LeavingSharesTotalStaked']);

    // Claimable reward
    queries.push([candidate, 'ManualRewardsCounter']);
    queries.push([candidate, { ManualRewardsCheckpoint: { delegator } }]);
  }

  const results = await chainApi.api.query.pooledStaking.pools.multi(queries);

  const stakes: Record<string, OwnStakeInfo> = {};

  const stride = 14;

  for (let i = 0; i < candidates.length; i++) {
    const base = i * stride;

    // Auto-compounding
    const acShares = new BigN(results[base + 0].toString());
    const acSupply = new BigN(results[base + 1].toString());
    const acTotal = new BigN(results[base + 2].toString());
    const autoCompounding = acSupply.isZero() ? new BigN(0) : acShares.multipliedBy(acTotal).div(acSupply);

    // Manual rewards
    const mrShares = new BigN(results[base + 3].toString());
    const mrSupply = new BigN(results[base + 4].toString());
    const mrTotal = new BigN(results[base + 5].toString());
    const manualRewards = mrSupply.isZero() ? new BigN(0) : mrShares.multipliedBy(mrTotal).div(mrSupply);

    // Joining
    const jShares = new BigN(results[base + 6].toString());
    const jSupply = new BigN(results[base + 7].toString());
    const jTotal = new BigN(results[base + 8].toString());
    const joining = jSupply.isZero() ? new BigN(0) : jShares.multipliedBy(jTotal).div(jSupply);

    // Leaving
    const lShares = new BigN(results[base + 9].toString());
    const lSupply = new BigN(results[base + 10].toString());
    const lTotal = new BigN(results[base + 11].toString());
    const leaving = lSupply.isZero() ? new BigN(0) : lShares.multipliedBy(lTotal).div(lSupply);

    // Claimable rewards
    const counter = new BigN(results[base + 12].toString());
    const checkpoint = new BigN(results[base + 13].toString());
    const claimable = counter.minus(checkpoint).multipliedBy(mrShares);

    // Total stake
    const totalStake = autoCompounding.plus(manualRewards).plus(joining).plus(leaving);

    stakes[candidates[i]] = {
      autoCompounding: autoCompounding.toFixed(0),
      autoCompoundingShares: acShares.toFixed(0),
      manualRewards: manualRewards.toFixed(0),
      joining: joining.toFixed(0),
      leaving: leaving.toFixed(0),
      totalStake: totalStake.toFixed(0),
      claimable: claimable.toFixed(0)
    };
  }

  return stakes;
}

export default class TanssiNativeStakingPoolHandler extends BaseParaNativeStakingPoolHandler {
  public override readonly availableMethod: YieldPoolMethodInfo = {
    join: true,
    defaultUnstake: true,
    fastUnstake: false,
    cancelUnstake: false,
    withdraw: false,
    claimReward: true,
    changeValidator: false
  };

  /* Subscribe pool info */

  public override async subscribePoolInfo (callback: (data: YieldPoolInfo) => void): Promise<VoidFunction> {
    let cancel = false;

    const defaultCallback = async () => {
      const chainApi = await this.substrateApi.isReady;
      const activeConfig = (await chainApi.api.query.collatorConfiguration.activeConfig()).toPrimitive() as unknown as CollatorActiveConfig;
      const maxCollators = activeConfig.maxCollators;

      const chainsToRewardOpt = await chainApi.api.query.inflationRewards.chainsToReward();
      const chainsToReward = chainsToRewardOpt.toPrimitive() as unknown as ChainsToReward;
      const rewardsPerBlock = chainsToReward.rewardsPerChain;

      const formatRewardsPerBlock = formatNumber(rewardsPerBlock, _getAssetDecimals(this.nativeToken));

      const candidates = await chainApi.api.query.pooledStaking.sortedEligibleCandidates() as unknown as SortedEligibleCandidate[];
      const activeCollators = await getActiveCollators(chainApi.api);
      const decimals = _getAssetDecimals(this.nativeToken);

      const apyList = candidates.filter((c) => activeCollators.includes(c.candidate.toString()))
        .map((c) => calculateCollatorApy(formatRewardsPerBlock, new BigN(c.stake.toString()), decimals));

      const totalApy = apyList.length ? BigN.max(...apyList).toNumber() : 0;

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
          maxCandidatePerFarmer: maxCollators,
          maxWithdrawalRequestPerFarmer: 1,
          earningThreshold: {
            join: '0',
            defaultUnstake: '0',
            fastUnstake: '0'
          },
          era: 0,
          eraTime: 6 / 3600,
          unstakingPeriod: 12,
          totalApy
        }
      };

      if (!cancel) {
        callback(data);
      }
    };

    await defaultCallback();

    return () => {
      cancel = true;
    };
  }

  /* Subscribe pool info */

  /* Subscribe pool position */

  public override async subscribePoolPosition (
    useAddresses: string[],
    onUpdate: (rs: YieldPositionInfo) => void
  ): Promise<VoidFunction> {
    const substrateApi = await this.substrateApi.isReady;

    let cancel = false;
    const intervalIds: NodeJS.Timer[] = [];
    const activeCollators = await getActiveCollators(substrateApi.api);

    for (const delegator of useAddresses) {
      const fetchAndUpdate = async () => {
        if (cancel) {
          return;
        }

        const entries = await substrateApi.api.query.pooledStaking.delegatorCandidateSummaries.entries(delegator);

        if (!entries || entries.length === 0) {
          onUpdate({
            ...this.baseInfo,
            type: this.type,
            address: delegator,
            balanceToken: this.nativeToken.slug,
            totalStake: '0',
            activeStake: '0',
            unstakeBalance: '0',
            status: EarningStatus.NOT_STAKING,
            isBondedBefore: false,
            nominations: [],
            unstakings: []
          });

          return;
        }

        const candidates: string[] = entries.map(([storageKey]) =>
          storageKey.args[1].toString()
        );

        const ownStakesMap = await getOwnStakes(substrateApi, candidates, delegator);

        const nominations: NominationInfo[] = [];
        let bnTotalStake = new BigN(0);
        let bnActiveStake = new BigN(0);
        let bnUnstakeBalance = new BigN(0);
        let bnJoiningStake = new BigN(0);
        let bnCompoundingStake = new BigN(0);
        let bnManualStake = new BigN(0);

        for (const candidate of candidates) {
          const ownStake = ownStakesMap[candidate];

          if (!ownStake) {
            continue;
          }

          const autoCompounding = new BigN(ownStake.autoCompounding);
          const manualRewards = new BigN(ownStake.manualRewards);
          const joining = new BigN(ownStake.joining);
          const leaving = new BigN(ownStake.leaving);
          const totalStake = new BigN(ownStake.totalStake);

          if (totalStake.isZero()) {
            continue;
          }

          bnTotalStake = bnTotalStake.plus(totalStake);
          bnActiveStake = bnActiveStake.plus(autoCompounding).plus(manualRewards).plus(joining);
          bnUnstakeBalance = bnUnstakeBalance.plus(leaving);
          bnJoiningStake = bnJoiningStake.plus(joining);
          bnCompoundingStake = bnCompoundingStake.plus(autoCompounding);
          bnManualStake = bnManualStake.plus(manualRewards);

          const [identity] = await parseIdentity(this.substrateIdentityApi, candidate);

          nominations.push({
            chain: this.chain,
            status: EarningStatus.EARNING_REWARD,
            validatorAddress: candidate,
            validatorIdentity: identity,
            activeStake: ((new BigN(autoCompounding)).plus(manualRewards)).toFixed(),
            hasUnstaking: !leaving.isZero(),
            validatorMinStake: '0'
          });
        }

        let status: EarningStatus;

        if (nominations.length === 0) {
          status = EarningStatus.NOT_STAKING;
        } else {
          const activeCount = nominations.filter((n) =>
            activeCollators.includes(n.validatorAddress)
          ).length;

          if (activeCount === 0) {
            status = EarningStatus.WAITING;
          } else if (activeCount < nominations.length) {
            status = EarningStatus.PARTIALLY_EARNING;
          } else {
            status = EarningStatus.EARNING_REWARD;
          }
        }

        onUpdate({
          ...this.baseInfo,
          type: this.type,
          address: delegator,
          balanceToken: this.nativeToken.slug,
          totalStake: bnTotalStake.toString(),
          activeStake: bnActiveStake.toString(),
          unstakeBalance: bnUnstakeBalance.toString(),
          status,
          isBondedBefore: nominations.length > 0,
          nominations,
          unstakings: [],
          metadata: {
            pendingStake: bnJoiningStake.toString(),
            compoundingStake: bnCompoundingStake.toString(),
            manualStake: bnManualStake.toString(),
            isShowActiveStakeDetails: bnJoiningStake.gt(0) || bnCompoundingStake.gt(0) || !bnManualStake.gt(0)
          }
        });
      };

      fetchAndUpdate().catch(console.error);

      const intervalId = setInterval(() => {
        fetchAndUpdate().catch(console.error);
      }, 30000);

      intervalIds.push(intervalId);
    }

    return () => {
      cancel = true;
      intervalIds.forEach((id) => clearInterval(id));
    };
  }

  async checkAccountHaveStake (addresses: string[]): Promise<string[]> {
    const stakedAddresses: string[] = [];
    const api = await this.substrateApi.isReady;

    const candidateSummariesByAddress = await Promise.all(
      addresses.map((address) =>
        api.api.query.pooledStaking.delegatorCandidateSummaries.entries(address)
      )
    );

    for (let i = 0; i < addresses.length; i++) {
      const candidateSummaries = candidateSummariesByAddress[i];

      if (candidateSummaries && candidateSummaries.length > 0) {
        stakedAddresses.push(addresses[i]);
      }
    }

    return stakedAddresses;
  }

  /* Subscribe pool position */

  /* Get pool targets */

  public override async getPoolTargets (): Promise<YieldPoolTarget[]> {
    const chainApi = await this.substrateApi.isReady;
    const commissionRaw = chainApi.api.consts.pooledStaking.rewardsCollatorCommission.toJSON();
    const commission = perbillToPercentBn(commissionRaw);

    const candidates = await chainApi.api.query.pooledStaking.sortedEligibleCandidates() as unknown as SortedEligibleCandidate[];

    const candidateSummaries = await chainApi.api.query.pooledStaking.candidateSummaries.entries();
    const candidateSummariesMap: Record<string, CandidateSummary> = {};

    candidateSummaries.forEach(([key, summary]) => {
      const address = key.args[0].toString();

      candidateSummariesMap[address] = summary.toJSON() as unknown as CandidateSummary;
    });

    const candidateAddresses = candidates.map((c) => c.candidate.toString());
    const activeCollators = await getActiveCollators(chainApi.api);

    const chainsToRewardOpt = await chainApi.api.query.inflationRewards.chainsToReward();
    const chainsToReward = chainsToRewardOpt.toPrimitive() as unknown as ChainsToReward;
    const rewardsPerBlock = chainsToReward.rewardsPerChain;
    const formatRewardsPerBlock = formatNumber(rewardsPerBlock, _getAssetDecimals(this.nativeToken));

    const targets: YieldPoolTarget[] = await Promise.all(
      candidates.map(async (c) => {
        const address = c.candidate.toString();
        const totalStake = new BigN(c.stake.toString());
        const candidateInfo = candidateSummariesMap[address];
        const nominatorCount = candidateInfo?.delegators || 0;

        const ownStakesMap = await getOwnStakes(chainApi, candidateAddresses, address);
        const ownStakeInfo = ownStakesMap[address];

        const ownStake = ownStakeInfo
          ? new BigN(ownStakeInfo.totalStake)
          : new BigN(0);

        const otherStake = BigN.max(totalStake.minus(ownStake), 0);

        const [identity, isReasonable] = await parseIdentity(this.substrateApi, address);

        let apy = new BigN(0);

        if (activeCollators.includes(address)) {
          apy = calculateCollatorApy(formatRewardsPerBlock, totalStake, _getAssetDecimals(this.nativeToken));
        }

        const validator: ValidatorInfo = {
          address,
          chain: this.chain,
          totalStake: totalStake.toFixed(),
          ownStake: ownStake.toFixed(),
          otherStake: otherStake.toFixed(),
          minBond: '0',
          nominatorCount,
          commission,
          blocked: false,
          isVerified: isReasonable,
          isCrowded: false,
          expectedReturn: apy.toNumber(),
          identity
        };

        return validator;
      })
    );

    return targets;
  }

  /* Get pool targets */

  /* Join pool action */

  override async createJoinExtrinsic (data: SubmitJoinNativeStaking, positionInfo?: YieldPositionInfo, bondDest?: string, netuid?: number): Promise<[TransactionData, YieldTokenBaseInfo]> {
    const { amount, selectedValidators } = data;
    const substrateApi = this.substrateApi;
    const api = await substrateApi.isReady;

    const binaryAmount = new BigN(amount);
    const selectedCollatorInfo = selectedValidators[0];
    const { address: selectedCollatorAddress } = selectedCollatorInfo;

    const extrinsic = api.api.tx.pooledStaking.requestDelegate(
      selectedCollatorAddress,
      'AutoCompounding',
      // 'ManualRewards'
      binaryAmount.toFixed()
    );

    return [extrinsic, { slug: this.nativeToken.slug, amount }];
  }

  /* Join pool action */

  /* Leave pool action */

  protected override async handleYieldUnstake (amount: string, address: string, selectedTarget?: string): Promise<[ExtrinsicType, TransactionData]> {
    if (!selectedTarget) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const substrateApi = await this.substrateApi.isReady;

    const txs = [];

    const stakesMap = await getOwnStakes(substrateApi, [selectedTarget], address);
    const stakeInfo = stakesMap[selectedTarget];

    const manualRewards = new BigN(stakeInfo.manualRewards);
    const autoCompounding = new BigN(stakeInfo.autoCompounding);

    const unstakeAmount = new BigN(amount);

    if (manualRewards.gt(0)) {
      if (unstakeAmount.lte(manualRewards)) {
        txs.push(
          substrateApi.api.tx.pooledStaking.requestUndelegate(
            selectedTarget,
            'ManualRewards',
            { Stake: unstakeAmount.toFixed() }
          )
        );
      } else {
        txs.push(
          substrateApi.api.tx.pooledStaking.requestUndelegate(
            selectedTarget,
            'ManualRewards',
            { Stake: manualRewards.toFixed() }
          )
        );

        const remaining = unstakeAmount.minus(manualRewards);

        if (remaining.gt(0)) {
          const acShares = new BigN(stakeInfo.autoCompoundingShares || '0');
          // Unstake all: use Shares to avoid small leftovers as rewards are automatically compounded every 6 seconds
          const isUnstakeAll = remaining.gte(autoCompounding.multipliedBy(0.9999));

          txs.push(
            substrateApi.api.tx.pooledStaking.requestUndelegate(
              selectedTarget,
              'AutoCompounding',
              isUnstakeAll
                ? { Shares: acShares.toFixed(0) }
                : { Stake: remaining.toFixed(0) }
            )
          );
        }
      }
    } else {
      const acShares = new BigN(stakeInfo.autoCompoundingShares || '0');
      const isUnstakeAll = unstakeAmount.gte(autoCompounding.multipliedBy(0.9999));

      txs.push(
        substrateApi.api.tx.pooledStaking.requestUndelegate(
          selectedTarget,
          'AutoCompounding',
          isUnstakeAll
            ? { Shares: acShares.toFixed(0) }
            : { Stake: unstakeAmount.toFixed(0) }
        )
      );
    }

    const extrinsic = txs.length === 1 ? txs[0] : substrateApi.api.tx.utility.batchAll(txs);

    return [ExtrinsicType.STAKING_UNBOND, extrinsic];
  }

  /* Leave pool action */

  /* Get pool reward */
  override async getPoolReward (
    useAddresses: string[],
    callback: (rs: EarningRewardItem) => void
  ): Promise<VoidFunction> {
    let cancel = false;
    const substrateApi = this.substrateApi;

    await substrateApi.isReady;

    await Promise.all(useAddresses.map(async (address) => {
      if (cancel) {
        return;
      }

      const delegatorSummaries = await substrateApi.api.query.pooledStaking.delegatorCandidateSummaries.entries(address);

      if (!delegatorSummaries || delegatorSummaries.length === 0) {
        const earningRewardItem = {
          ...this.baseInfo,
          address,
          type: this.type,
          unclaimedReward: '0',
          state: APIItemState.READY
        };

        callback(earningRewardItem);

        return;
      }

      const candidates = delegatorSummaries.map(([key]) => key.args[1].toString());
      const ownStakesMap = await getOwnStakes(substrateApi, candidates, address);

      let totalClaimable = new BigN(0);

      for (const candidate of candidates) {
        const ownStake = ownStakesMap[candidate];

        if (ownStake) {
          totalClaimable = totalClaimable.plus(ownStake.claimable || 0);
        }
      }

      const _unclaimedReward = totalClaimable.toFixed();

      const earningRewardItem = {
        ...this.baseInfo,
        address,
        type: this.type,
        unclaimedReward: _unclaimedReward,
        state: APIItemState.READY
      };

      if (_unclaimedReward !== '0') {
        await this.createClaimNotification(earningRewardItem, this.nativeToken);
      }

      callback(earningRewardItem);
    }));

    return () => {
      cancel = true;
    };
  }

  /* Get pool reward */

  /* Other actions */

  override async handleYieldClaimReward (address: string, bondReward?: boolean): Promise<TransactionData> {
    const api = await this.substrateApi.isReady;

    const delegatorSummaries = await api.api.query.pooledStaking.delegatorCandidateSummaries.entries(address);

    if (!delegatorSummaries || delegatorSummaries.length === 0) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INTERNAL_ERROR));
    }

    const candidates = delegatorSummaries.map(([key]) => key.args[1].toString());
    const ownStakesMap = await getOwnStakes(api, candidates, address);

    const claimablePairs: [string, string][] = [];

    for (const candidate of candidates) {
      const ownStake = ownStakesMap[candidate];

      if (ownStake && new BigN(ownStake.claimable).gt(0)) {
        claimablePairs.push([candidate, address]);
      }
    }

    if (claimablePairs.length === 0) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INTERNAL_ERROR));
    }

    const extrinsic = api.api.tx.pooledStaking.claimManualRewards(claimablePairs);

    return extrinsic;
  }

  public override handleYieldWithdraw (address: string, unstakingInfo: UnstakingInfo): Promise<TransactionData> {
    throw new Error('Method not implemented.');
  }

  public override handleYieldCancelUnstake (params: StakeCancelWithdrawalParams): Promise<TransactionData> {
    throw new Error('Method not implemented.');
  }

  /* Other actions */
}
