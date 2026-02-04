// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { FrameBalancesFreezesInfo, FrameBalancesHoldsInfo, FrameBalancesLocksInfo } from '@subwallet/extension-base/core/substrate/types';
import { _BALANCE_CHAIN_GROUP, _BALANCE_LOCKED_ID_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { alphaPriceCache } from '@subwallet/extension-base/services/earning-service/handlers/delegated-staking/tao';
import { TaoStakeInfo } from '@subwallet/extension-base/services/earning-service/handlers/native-staking/tao';
import { LockedBalanceDetails } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';

// handler according to different logic
const extractId = (id: string | Record<string, unknown> | undefined): string => {
  if (!id) {
    return '';
  }

  if (typeof id === 'string') {
    return id.replace(/\0/g, '').trim();
  }

  const keys = Object.keys(id);

  return keys.length ? keys[0] : '';
};

export function buildLockedDetails (item: (FrameBalancesLocksInfo | FrameBalancesHoldsInfo | FrameBalancesFreezesInfo)[], totalLockedFromTransfer: bigint, reserved: bigint, externalStaking?: BigN, totalStakingEquivalent?: BigN): LockedBalanceDetails {
  let stakingBalance = externalStaking || new BigN(0);
  let govBalance = new BigN(0);
  let democracyBalance = new BigN(0);
  const reservedBN = new BigN(reserved.toString());

  for (const entry of item) {
    const id = extractId(entry.id);
    const amount = new BigN(String(entry.amount || 0));

    if (_BALANCE_LOCKED_ID_GROUP.staking.includes(id)) {
      stakingBalance = stakingBalance.plus(amount);
    } else if (_BALANCE_LOCKED_ID_GROUP.gov.includes(id)) {
      govBalance = govBalance.plus(amount);
    } else if (_BALANCE_LOCKED_ID_GROUP.democracy.includes(id)) {
      democracyBalance = democracyBalance.plus(amount);
    }
  }

  // others = total locked - max(staking, gov, democracy, reserved)
  const maxMain = BigN.max(stakingBalance, govBalance, democracyBalance, reservedBN);
  const others = new BigN(totalLockedFromTransfer.toString()).minus(maxMain);

  return {
    staking: stakingBalance.toFixed(),
    governance: govBalance.toFixed(),
    democracy: democracyBalance.toFixed(),
    reserved: reservedBN.toFixed(),
    others: others.gt(0) ? others.toFixed() : '0',
    totalStakingEquivalent: totalStakingEquivalent?.toFixed(0) || undefined
  };
}

export type SpecialStakingBalance = {
  /** Total staking value in native token (TAO) */
  total: BigN;

  /** Native TAO stake (netuid = 0) */
  native: BigN;

  /** Alpha stake converted to native TAO */
  alphaConverted: BigN;
};

export async function getSpecialStakingBalancesWithDetails (chainInfo: _ChainInfo, addresses: string[], substrateApi: _SubstrateApi, nativeDecimals: number): Promise<SpecialStakingBalance[]> {
  const result: SpecialStakingBalance[] = addresses.map(() => ({
    total: new BigN(0),
    native: new BigN(0),
    alphaConverted: new BigN(0)
  }));

  // Only apply for Bittensor
  if (!_BALANCE_CHAIN_GROUP.bittensor.includes(chainInfo.slug)) {
    return result;
  }

  const api = await substrateApi.isReady;

  const rawData =
    await api.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkeys(addresses);

  const values = rawData.toPrimitive() as Array<[string, TaoStakeInfo[]]>;

  for (let i = 0; i < values.length; i++) {
    const [, stakes] = values[i];
    const alphaByNetuid = new Map<number, BigN>();

    // Separate native & alpha
    for (const stake of stakes) {
      const amount = new BigN(stake.stake);

      if (stake.netuid === 0) {
        result[i].native = result[i].native.plus(amount);
      } else {
        const prev = alphaByNetuid.get(stake.netuid) || new BigN(0);

        alphaByNetuid.set(stake.netuid, prev.plus(amount));
      }
    }

    // Convert alpha → native
    for (const [netuid, totalAlpha] of alphaByNetuid.entries()) {
      try {
        const price = await alphaPriceCache.getAlphaPrice(
          { chain: chainInfo.slug, netuid },
          async () => {
            const raw =
              await api.api.call.swapRuntimeApi.currentAlphaPrice(netuid);

            return new BigN(raw.toString());
          }
        );

        const rate = price.dividedBy(new BigN(10).pow(nativeDecimals));
        const taoEquivalent = totalAlpha.multipliedBy(rate);

        result[i].alphaConverted =
          result[i].alphaConverted.plus(taoEquivalent);
      } catch (e) {
        console.warn(`Failed to convert alpha for netuid ${netuid}`, e);
      }
    }

    // Final total
    result[i].total =
      result[i].native.plus(result[i].alphaConverted);
  }

  return result;
}
