// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ExtrinsicType, NominationInfo, UnstakingInfo } from '@subwallet/extension-base/background/KoniTypes';
import { getBondedValidators, getEarningStatusByNominations, isUnstakeAll } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { _EXPECTED_BLOCK_TIME, _STAKING_ERA_LENGTH_MAP } from '@subwallet/extension-base/services/chain-service/constants';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { parseIdentity } from '@subwallet/extension-base/services/earning-service/utils';
import { BaseYieldPositionInfo, BasicTxErrorType, CollatorExtraInfo, EarningStatus, NativeYieldPoolInfo, PalletParachainStakingDelegationInfo, PalletParachainStakingRequestType, StakeCancelWithdrawalParams, SubmitJoinNativeStaking, TransactionData, UnstakingStatus, ValidatorInfo, YieldPoolInfo, YieldPositionInfo, YieldTokenBaseInfo } from '@subwallet/extension-base/types';
import { balanceFormatter, formatNumber, parseRawNumber, reformatAddress } from '@subwallet/extension-base/utils';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { UnsubscribePromise } from '@polkadot/api-base/types/base';
import { Codec } from '@polkadot/types/types';
import { BN, BN_ZERO } from '@polkadot/util';

import BaseParaNativeStakingPoolHandler from './base-para';

interface PalletEnergyStakingEraInfo {
  current: string,
  first: string,
  length: string
}

interface EnergyStakingCandidateMetadata {
  bond: string,
  nominatorCount: number,
  totalCounted: string,
  highestBottomNominationAmount: number,
  lowestBottomNominationAmount: number,
  lowestTopNominationAmount: number
  nominationCount: number,
  status: any | 'Active'
}

type PalletEnergyStakingNominationInfo = PalletParachainStakingDelegationInfo;

interface PalletEnergyStakingNominator {
  id: string,
  nominations: PalletEnergyStakingNominationInfo[],
  total: number,
  lessTotal: number,
  status: number
}

export interface PalletEnergyStakingNominationRequestsScheduledRequest {
  nominator: string,
  whenExecutable: number,
  action: Record<PalletParachainStakingRequestType, number>
}

export default class EnergyNativeStakingPoolHandler extends BaseParaNativeStakingPoolHandler {
  /* Subscribe pool info */

  async subscribePoolInfo (callback: (data: YieldPoolInfo) => void): Promise<VoidFunction> {
    let cancel = false;
    const chainApi = this.substrateApi;
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

    await chainApi.isReady;

    const unsub = await (chainApi.api.query.parachainStaking.era(async (_era: Codec) => {
      if (cancel) {
        unsub();

        return;
      }

      const eraObj = _era.toHuman() as Record<string, string>;
      const era = parseRawNumber(eraObj.current);
      const maxNominations = chainApi.api.consts?.parachainStaking?.maxNominationsPerNominator?.toString();
      const maxTopNominatorsPerCollator = chainApi.api.consts.parachainStaking.maxTopNominationsPerCandidate?.toPrimitive() as number;

      const [_totalStake, unstakingDelay] = await Promise.all([
        chainApi.api.query.parachainStaking?.staked(era),
        chainApi.api.query.parachainStaking.delay()
      ]);

      const totalStake = _totalStake ? new BN(_totalStake.toString()) : BN_ZERO;

      const eraTime = _STAKING_ERA_LENGTH_MAP[this.chain] || _STAKING_ERA_LENGTH_MAP.default; // in hours
      const unstakingPeriod = parseInt(unstakingDelay.toString()) * eraTime;
      const minStake = '0';
      const minToHuman = formatNumber(minStake.toString(), nativeToken.decimals || 0, balanceFormatter);

      const data: NativeYieldPoolInfo = {
        ...this.baseInfo,
        type: this.type,
        metadata: {
          ...this.metadataInfo,
          description: this.getDescription(minToHuman)
        },
        statistic: {
          assetEarning: [
            {
              slug: this.nativeToken.slug
            }
          ],
          maxCandidatePerFarmer: parseInt(maxNominations),
          maxWithdrawalRequestPerFarmer: 1, // by default
          earningThreshold: {
            join: minStake.toString(),
            defaultUnstake: '0',
            fastUnstake: '0'
          },
          farmerCount: 0, // TODO recheck
          era,
          eraTime,
          totalApy: undefined, // not have
          tvl: totalStake.toString(),
          unstakingPeriod: unstakingPeriod
        },
        maxPoolMembers: maxTopNominatorsPerCollator
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

  async parseNominatorMetadata (chainInfo: _ChainInfo, address: string, substrateApi: _SubstrateApi, nominatorState: PalletEnergyStakingNominator): Promise<Omit<YieldPositionInfo, keyof BaseYieldPositionInfo>> {
    const nominationList: NominationInfo[] = [];
    const unstakingMap: Record<string, UnstakingInfo> = {};
    const substrateIdentityApi = this.substrateIdentityApi;

    let bnTotalActiveStake = BN_ZERO;
    let bnTotalStake = BN_ZERO;
    let bnTotalUnstaking = BN_ZERO;

    const _eraInfo = await substrateApi.api.query.parachainStaking.era();
    const roundInfo = _eraInfo.toPrimitive() as unknown as PalletEnergyStakingEraInfo;
    const currentRound = roundInfo.current;

    await Promise.all(nominatorState.nominations.map(async (nomination) => {
      const [_nominationScheduledRequests, [identity], _collatorInfo, _currentBlock, _currentTimestamp] = await Promise.all([
        substrateApi.api.query.parachainStaking.nominationScheduledRequests(nomination.owner),
        parseIdentity(substrateIdentityApi, nomination.owner),
        substrateApi.api.query.parachainStaking.candidateInfo(nomination.owner),
        substrateApi.api.query.system.number(),
        substrateApi.api.query.timestamp.now()
      ]);

      const currentBlock = _currentBlock.toPrimitive() as number;
      const currentTimestamp = _currentTimestamp.toPrimitive() as number;
      const collatorInfo = _collatorInfo.toPrimitive() as unknown as EnergyStakingCandidateMetadata;
      const minNomination = collatorInfo?.lowestTopNominationAmount.toString();
      const nominationScheduledRequests = _nominationScheduledRequests.toPrimitive() as unknown as PalletEnergyStakingNominationRequestsScheduledRequest[];

      let hasUnstaking = false;
      let nominationStatus: EarningStatus = EarningStatus.NOT_EARNING;

      // parse unstaking info
      if (nominationScheduledRequests) {
        for (const scheduledRequest of nominationScheduledRequests) {
          if (reformatAddress(scheduledRequest.nominator, 0) === reformatAddress(address, 0)) { // add network prefix
            const isClaimable = scheduledRequest.whenExecutable - parseInt(currentRound) <= 0;
            const remainingEra = scheduledRequest.whenExecutable - parseInt(currentRound);
            const waitingTime = remainingEra * _STAKING_ERA_LENGTH_MAP[chainInfo.slug];
            const claimable = Object.values(scheduledRequest.action)[0];

            // noted: target timestamp in parachainStaking easily volatile if block time volatile
            const targetBlock = remainingEra * parseInt(roundInfo.length) + parseInt(roundInfo.first);
            const remainingBlock = targetBlock - currentBlock;
            const targetTimestampMs = remainingBlock * _EXPECTED_BLOCK_TIME[chainInfo.slug] * 1000 + currentTimestamp;

            unstakingMap[nomination.owner] = {
              chain: chainInfo.slug,
              status: isClaimable ? UnstakingStatus.CLAIMABLE : UnstakingStatus.UNLOCKING,
              validatorAddress: nomination.owner,
              claimable: claimable.toString(),
              waitingTime,
              targetTimestampMs: targetTimestampMs
            } as UnstakingInfo;

            hasUnstaking = true;
            break; // only handle 1 scheduledRequest per collator
          }
        }
      }

      const bnStake = new BN(nomination.amount);
      const bnUnstakeBalance = unstakingMap[nomination.owner] ? new BN(unstakingMap[nomination.owner].claimable) : BN_ZERO;
      const bnActiveStake = bnStake.sub(bnUnstakeBalance);

      if (bnActiveStake.gt(BN_ZERO) && bnActiveStake.gte(new BN(minNomination))) {
        nominationStatus = EarningStatus.EARNING_REWARD;
      }

      bnTotalActiveStake = bnTotalActiveStake.add(bnActiveStake);
      bnTotalStake = bnTotalStake.add(bnStake);
      bnTotalUnstaking = bnTotalUnstaking.add(bnUnstakeBalance);

      nominationList.push({
        chain: chainInfo.slug,
        status: nominationStatus,
        validatorAddress: nomination.owner,
        validatorIdentity: identity,
        activeStake: bnActiveStake.toString(),
        hasUnstaking,
        validatorMinStake: collatorInfo.lowestTopNominationAmount.toString()
      });
    }));

    const stakingStatus = getEarningStatusByNominations(bnTotalActiveStake, nominationList);

    const totalStake = bnTotalStake.toString();
    const activeStake = bnTotalActiveStake.toString();
    const unstakingBalance = bnTotalUnstaking.toString();
    const tokenInfo = this.state.chainService.getAssetBySlug(this.nativeToken.slug);

    await this.createWithdrawNotifications(Object.values(unstakingMap), tokenInfo, address);

    return {
      status: stakingStatus,
      totalStake,
      balanceToken: this.nativeToken.slug,
      activeStake: activeStake,
      unstakeBalance: unstakingBalance,
      isBondedBefore: !!nominationList.length,
      nominations: nominationList,
      unstakings: Object.values(unstakingMap)
    };
  }

  async subscribePoolPosition (useAddresses: string[], resultCallback: (rs: YieldPositionInfo) => void): Promise<VoidFunction> {
    let cancel = false;
    const substrateApi = this.substrateApi;
    const defaultInfo = this.baseInfo;
    const chainInfo = this.chainInfo;

    await substrateApi.isReady;

    const unsub = await substrateApi.api.query.parachainStaking.nominatorState.multi(useAddresses, async (ledgers: Codec[]) => {
      if (cancel) {
        unsub();

        return;
      }

      if (ledgers) {
        await Promise.all(ledgers.map(async (_nominatorState, i) => {
          const nominatorState = _nominatorState.toPrimitive() as unknown as PalletEnergyStakingNominator;
          const owner = reformatAddress(useAddresses[i], 42);

          if (nominatorState) {
            const nominatorMetadata = await this.parseNominatorMetadata(chainInfo, owner, substrateApi, nominatorState);

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

  async checkAccountHaveStake (useAddresses: string[]): Promise<string[]> {
    const result: string[] = [];
    const substrateApi = await this.substrateApi.isReady;
    const ledgers = await substrateApi.api.query.parachainStaking?.nominatorState?.multi?.(useAddresses);

    if (!ledgers) {
      return [];
    }

    for (let i = 0; i < useAddresses.length; i++) {
      const owner = useAddresses[i];
      const nominatorState = ledgers[i].toPrimitive() as unknown as PalletEnergyStakingNominator;

      if (nominatorState && nominatorState.total > 0) {
        result.push(owner);
      }
    }

    return result;
  }

  /* Subscribe pool position */

  /* Get pool targets */
  async getPoolTargets (): Promise<ValidatorInfo[]> {
    const apiProps = await this.substrateApi.isReady;
    const substrateIdentityApi = this.substrateIdentityApi;
    const allCollators: ValidatorInfo[] = [];

    const [_allCollators, _selectedCandidates] = await Promise.all([
      apiProps.api.query.parachainStaking.candidateInfo.entries(),
      // use it when energy support collatorCommission
      // apiProps.api.query.parachainStaking.collatorCommission(),
      apiProps.api.query.parachainStaking.selectedCandidates()
    ]);

    const maxNominationPerCollator = apiProps.api.consts.parachainStaking.maxTopNominationsPerCandidate.toString();
    const selectedCollators = _selectedCandidates.toPrimitive() as string[];

    for (const collator of _allCollators) {
      const _collatorAddress = collator[0].toHuman() as string[];
      const collatorAddress = _collatorAddress[0];
      const collatorInfo = collator[1].toPrimitive() as unknown as EnergyStakingCandidateMetadata;

      const bnTotalStake = new BN(collatorInfo.totalCounted);
      const bnOwnStake = new BN(collatorInfo.bond);
      const bnOtherStake = bnTotalStake.sub(bnOwnStake);
      const bnMinBond = new BN(collatorInfo.lowestTopNominationAmount);
      const maxNominatorRewarded = parseInt(maxNominationPerCollator);

      if (selectedCollators.includes(collatorAddress)) {
        allCollators.push({
          commission: 0,
          expectedReturn: 0,
          address: collatorAddress,
          totalStake: bnTotalStake.toString(),
          ownStake: bnOwnStake.toString(),
          otherStake: bnOtherStake.toString(),
          nominatorCount: collatorInfo.nominationCount,
          blocked: false,
          isVerified: false,
          minBond: bnMinBond.toString(),
          chain: this.chain,
          isCrowded: collatorInfo.nominationCount >= maxNominatorRewarded
        });
      }
    }

    const extraInfoMap: Record<string, CollatorExtraInfo> = {};

    await Promise.all(allCollators.map(async (collator) => {
      const [_info, [identity, isReasonable]] = await Promise.all([
        apiProps.api.query.parachainStaking.candidateInfo(collator.address),
        parseIdentity(substrateIdentityApi, collator.address)
      ]);

      const rawInfo = _info.toHuman() as Record<string, any>;

      const active = rawInfo?.status === 'Active';

      extraInfoMap[collator.address] = {
        identity,
        isVerified: isReasonable,
        active
      } as CollatorExtraInfo;
    }));

    for (const validator of allCollators) {
      validator.blocked = !extraInfoMap[validator.address].active;
      validator.identity = extraInfoMap[validator.address].identity;
      validator.isVerified = extraInfoMap[validator.address].isVerified;
    }

    return allCollators;
  }

  /* Get pool targets */

  /* Join pool action */

  async createJoinExtrinsic (data: SubmitJoinNativeStaking, positionInfo?: YieldPositionInfo): Promise<[TransactionData, YieldTokenBaseInfo]> {
    const { amount, selectedValidators } = data;
    const apiPromise = await this.substrateApi.isReady;
    const binaryAmount = new BN(amount);
    const selectedCollatorInfo = selectedValidators[0];
    const { address: selectedCollatorAddress, nominatorCount: selectedCollatorNominatorCount } = selectedCollatorInfo;

    const compoundResult = (
      extrinsic: SubmittableExtrinsic<'promise'>
    ): Promise<[TransactionData, YieldTokenBaseInfo]> => {
      return Promise.resolve([extrinsic, { slug: this.nativeToken.slug, amount: '0' }]);
    };

    if (!positionInfo) {
      const extrinsic = apiPromise.api.tx.parachainStaking.nominate(selectedCollatorAddress, binaryAmount, new BN(selectedCollatorNominatorCount), 0);

      return compoundResult(extrinsic);
    }

    const { bondedValidators, nominationCount } = getBondedValidators(positionInfo.nominations);
    const parsedSelectedCollatorAddress = reformatAddress(selectedCollatorInfo.address, 0);

    if (!bondedValidators.includes(parsedSelectedCollatorAddress)) {
      const extrinsic = apiPromise.api.tx.parachainStaking.nominate(selectedCollatorAddress, binaryAmount, new BN(selectedCollatorNominatorCount), nominationCount);

      return compoundResult(extrinsic);
    } else {
      const extrinsic = apiPromise.api.tx.parachainStaking.bondExtra(selectedCollatorAddress, binaryAmount);

      return compoundResult(extrinsic);
    }
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

    const unstakeAll = isUnstakeAll(selectedTarget, poolPosition.nominations, amount);

    let extrinsic: TransactionData;

    if (!unstakeAll) {
      extrinsic = apiPromise.api.tx.parachainStaking.scheduleNominatorUnbond(selectedTarget, binaryAmount);
    } else {
      extrinsic = apiPromise.api.tx.parachainStaking.scheduleRevokeNomination(selectedTarget);
    }

    return [ExtrinsicType.STAKING_UNBOND, extrinsic];
  }

  /* Leave pool action */

  /* Other action */

  async handleYieldCancelUnstake (params: StakeCancelWithdrawalParams): Promise<TransactionData> {
    const { selectedUnstaking } = params;
    const chainApi = await this.substrateApi.isReady;

    return chainApi.api.tx.parachainStaking.cancelNominationRequest(selectedUnstaking.validatorAddress);
  }

  async handleYieldWithdraw (address: string, unstakingInfo: UnstakingInfo): Promise<TransactionData> {
    const collatorAddress = unstakingInfo.validatorAddress;

    if (!collatorAddress) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const chainApi = await this.substrateApi.isReady;

    return chainApi.api.tx.parachainStaking.executeNominationRequest(address, collatorAddress);
  }

  /* Other actions */
}
