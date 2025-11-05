// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _EXPECTED_BLOCK_TIME } from '@subwallet/extension-base/services/chain-service/constants';
import { GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { PreviousVoteAmountDetail, VoteAmountDetailProps } from '@subwallet/extension-koni-ui/types/gov';
import { GOV_ONGOING_STATES, GovStatusKey, Referendum, ReferendumDetail, ReferendumVoteDetail, Tally } from '@subwallet/subsquare-api-sdk';
import BigNumber from 'bignumber.js';

export const GOV_QUERY_KEYS = {
  referendaList: (chainSlug: string) =>
    ['subsquare', 'referendaList', chainSlug] as const,

  referendumDetail: (chainSlug: string, referendumId: string | number) =>
    ['subsquare', 'referendumDetail', chainSlug, referendumId] as const,

  referendumVotes: (chain: string, referendumId: string | number) =>
    ['subsquare', 'referendumDetail', 'votes', chain, referendumId] as const,

  tracks: (chain: string) =>
    ['subsquare', 'referendumDetail', 'votes', chain] as const
};

export function toPercentage (value = 0, decimals = 0) {
  const length = Math.pow(10, decimals);

  return Math.round(value * 100 * length) / length;
}

export function getTallyVotesBarPercent (tally: Tally) {
  const ayes = tally?.ayes ?? 0;
  const nays = tally?.nays ?? 0;

  let ayesPercent = 50;
  let naysPercent = 50;
  const nTotal = new BigNumber(ayes).plus(nays);

  if (nTotal.gt(0)) {
    ayesPercent = new BigNumber(ayes).div(nTotal).toNumber();
    naysPercent = 1 - ayesPercent;
    ayesPercent = toPercentage(ayesPercent, 1);
    naysPercent = toPercentage(naysPercent, 1);
  }

  return {
    ayesPercent,
    naysPercent
  };
}

/**
 * Compute the minimum approval threshold (%) for a Gov1 (Democracy) referendum.
 *
 * This function reproduces the logic from Substrate's `vote_threshold.rs`
 * for `SuperMajorityApprove`, `SuperMajorityAgainst`, and `SimpleMajority`.
 *
 * References:
 * - https://github.com/paritytech/substrate/blob/master/frame/democracy/src/vote_threshold.rs
 */
export function getMinApprovalThresholdGov1 (referendum: Referendum | ReferendumDetail): number {
  const onchain = referendum?.onchainData;
  const threshold = onchain?.meta?.threshold;

  if (!onchain || !threshold) {
    return 0;
  }

  /**
   * --- SimpleMajority ---
   *
   * Simple rule:
   *   ayes > nays
   *   => ayes / (ayes + nays) > 0.5
   */
  if (threshold === 'SimpleMajority') {
    return toPercentage(0.5, 1); // 50.0%
  }

  // Retrieve the on-chain tally (ayes, nays, turnout, electorate)
  const t = onchain.tally;

  if (!t) {
    return 0;
  }

  const turnout = new BigNumber(t.turnout);
  const electorate = new BigNumber(t.electorate);

  // Avoid division by zero or invalid data
  if (electorate.lte(0) || turnout.lte(0)) {
    return 0;
  }

  const sqrtT = turnout.sqrt(); // √turnout
  const sqrtE = electorate.sqrt(); // √electorate

  let pMin: BigNumber;

  switch (threshold) {
    /**
     * --- SuperMajorityApprove ---
     *
     * Substrate rule:
     *   ayes / √electorate > nays / √turnout
     *
     * Let:
     *   a = ayes / (ayes + nays)
     *   (1 - a) = nays / (ayes + nays)
     *
     * Rearranging:
     *   a / √electorate > (1 - a) / √turnout
     *   => a > (1 - a) * (√electorate / √turnout)
     *   => a * (1 + √electorate / √turnout) > √electorate / √turnout
     *   => a > (√electorate / √turnout) / (1 + √electorate / √turnout)
     *   => a > √electorate / (√turnout + √electorate)
     *
     * So, the approval fraction must exceed √E / (√T + √E)
     */
    case 'SuperMajorityApprove':
      pMin = sqrtE.div(sqrtT.plus(sqrtE));
      break;

    /**
     * --- SuperMajorityAgainst ---
     *
     * Substrate rule:
     *   ayes / √turnout > nays / √electorate
     *
     * Similarly:
     *   a / √turnout > (1 - a) / √electorate
     *   => a > (1 - a) * (√turnout / √electorate)
     *   => a * (1 + √turnout / √electorate) > √turnout / √electorate
     *   => a > (√turnout / √electorate) / (1 + √turnout / √electorate)
     *   => a > √turnout / (√turnout + √electorate)
     *
     * So, the approval fraction must exceed √T / (√T + √E)
     */
    case 'SuperMajorityAgainst':
      pMin = sqrtT.div(sqrtT.plus(sqrtE));
      break;

    default:
      return 0;
  }

  // Clamp to [0, 1] range and convert to percentage
  const clamped = BigNumber.maximum(0, BigNumber.minimum(1, pMin));

  return toPercentage(clamped.toNumber(), 1); // return % between 0 and 100
}

function getMinApprovalThresholdGov2 (referendumDetail: Referendum | ReferendumDetail): number {
  const { decisionPeriod, minApproval } = referendumDetail.trackInfo;
  const decidingSince = referendumDetail.onchainData?.info?.deciding?.since;
  const currentBlock = referendumDetail.onchainData?.state?.indexer?.blockHeight;

  if (!minApproval || !decidingSince || !currentBlock) {
    return 0;
  }

  const gone = new BigNumber(currentBlock).minus(decidingSince);
  const percentage = gone.div(decisionPeriod);
  const x = percentage.multipliedBy(1e9);

  // Case 1: reciprocal
  if (minApproval.reciprocal) {
    const { factor, xOffset, yOffset } = minApproval.reciprocal;

    const v = new BigNumber(factor)
      .div(x.plus(xOffset))
      .multipliedBy(1e9);

    const calcValue = v.plus(yOffset).div(1e9);

    return toPercentage(Math.max(calcValue.toNumber(), 0), 1);
  }

  // Case 2: linear
  if (minApproval.linearDecreasing) {
    const { ceil, floor, length } = minApproval.linearDecreasing;

    const xValue = BigNumber.min(x, length);
    const slope = new BigNumber(ceil).minus(floor).div(length);
    const deducted = slope.multipliedBy(xValue);
    const perbill = new BigNumber(ceil).minus(deducted);

    const calcValue = perbill.div(1e9);

    return toPercentage(Math.max(calcValue.toNumber(), 0), 1);
  }

  return 0;
}

export function getMinApprovalThreshold (referendum: Referendum | ReferendumDetail): number {
  if (referendum.version === 1) {
    return getMinApprovalThresholdGov1(referendum);
  } else {
    return getMinApprovalThresholdGov2(referendum);
  }
}

const _MIGRATION_BLOCK_OFFSET: Record<string, number> = {
  kusama: 19310415,
  polkadot: 18237370
};

const calculateTimeLeft = (
  blockTime: number,
  currentBlock: number,
  alarmBlock: number | null,
  state: GovStatusKey,
  blockDuration = 6,
  migrationBlockOffset: number,
  decisionPeriod?: number,
  decidingSince?: number
): { timeLeft?: string; endTime: number } => {
  let endBlock: number;

  if (state === GovStatusKey.DECIDING && decisionPeriod && decidingSince) {
    let adjustedSince = decidingSince;

    // migrate case
    if (new BigNumber(decidingSince).minus(currentBlock).gt(1_000_000)) {
      adjustedSince = decidingSince - migrationBlockOffset;
    }

    endBlock = adjustedSince + decisionPeriod;
  } else if (alarmBlock && GOV_ONGOING_STATES.includes(state) && currentBlock < alarmBlock) {
    endBlock = alarmBlock;
  } else {
    return { timeLeft: undefined, endTime: 0 };
  }

  const blockTimeBN = new BigNumber(blockTime);
  const blocksLeftBN = new BigNumber(endBlock).minus(currentBlock);
  const blockDurationBN = new BigNumber(blockDuration);
  const multiplier = new BigNumber(1000);

  const endTime = blockTimeBN.plus(
    blocksLeftBN.multipliedBy(blockDurationBN).multipliedBy(multiplier)
  );

  const now = new BigNumber(Date.now());
  const timeLeftMs = endTime.minus(now);

  if (timeLeftMs.lte(0)) {
    return { timeLeft: undefined, endTime: endTime.toNumber() };
  }

  const msInDay = new BigNumber(1000 * 60 * 60 * 24);
  const msInHour = new BigNumber(1000 * 60 * 60);
  const msInMinute = new BigNumber(1000 * 60);
  const msInSecond = new BigNumber(1000);

  const days = timeLeftMs.dividedToIntegerBy(msInDay);
  const hours = timeLeftMs.modulo(msInDay).dividedToIntegerBy(msInHour);
  const minutes = timeLeftMs.modulo(msInHour).dividedToIntegerBy(msInMinute);
  const seconds = timeLeftMs.modulo(msInMinute).dividedToIntegerBy(msInSecond);

  let timeLeft: string;

  if (days.gte(2)) {
    timeLeft = `${days.toFixed()}d ${hours.toFixed()}hr${!hours.eq(1) ? 's' : ''}`;
  } else if (days.eq(1)) {
    timeLeft = `1d ${hours.toFixed()}hr${!hours.eq(1) ? 's' : ''}`;
  } else {
    timeLeft = `${hours.toFixed().padStart(2, '0')}:${minutes
      .toFixed()
      .padStart(2, '0')}:${seconds.toFixed().padStart(2, '0')}`;
  }

  return { timeLeft, endTime: endTime.toNumber() };
};

export const getTimeLeft = (data: Referendum | ReferendumDetail, chain: string): string | undefined => {
  return calculateTimeLeft(
    data.state.indexer.blockTime,
    data.state.indexer.blockHeight,
    data.onchainData.info.alarm?.[0] || null,
    data.state.name,
    _EXPECTED_BLOCK_TIME[chain],
    _MIGRATION_BLOCK_OFFSET[chain] || 0,
    data.trackInfo?.decisionPeriod,
    data.onchainData.info.deciding?.since
  ).timeLeft;
};

export const getGovTokenLogoSlugBySymbol = (symbol: string, assetRegistry: _ChainAsset[]): string | undefined => {
  const lowerSymbol = symbol.toLowerCase();
  const asset = assetRegistry.find((item) => item.symbol.toLowerCase() === lowerSymbol);

  return asset?.slug.toLowerCase();
};

export const getPreviousVoteAmountDetail = (voteInfo?: ReferendumVoteDetail): PreviousVoteAmountDetail | undefined => {
  if (voteInfo) {
    if (voteInfo.isStandard) {
      if (voteInfo.aye) {
        return {
          ayeAmount: voteInfo.balance,
          type: GovVoteType.AYE
        };
      } else {
        return {
          nayAmount: voteInfo.balance,
          type: GovVoteType.NAY
        };
      }
    } else if (voteInfo.isSplit) {
      return {
        ayeAmount: voteInfo.ayeBalance,
        nayAmount: voteInfo.nayBalance,
        type: GovVoteType.SPLIT
      };
    } else {
      return {
        ayeAmount: voteInfo.ayeBalance,
        nayAmount: voteInfo.nayBalance,
        abstainAmount: voteInfo.abstainBalance,
        type: GovVoteType.ABSTAIN
      };
    }
  }

  return undefined;
};

export const calculateTotalAmountVotes = (details: VoteAmountDetailProps): BigNumber => {
  return (['ayeAmount', 'nayAmount', 'abstainAmount'] as (keyof VoteAmountDetailProps)[]).reduce((sum, key) => sum.plus((details[key] as string) || 0), new BigNumber(0));
};
