// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { FrameBalancesFreezesInfo, FrameBalancesHoldsInfo, FrameBalancesLocksInfo } from '@subwallet/extension-base/core/substrate/types';
import { _BALANCE_CHAIN_GROUP, _BALANCE_LOCKED_ID_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { TaoStakeInfo } from '@subwallet/extension-base/services/earning-service/handlers/native-staking/tao';
import { LockedBalanceDetails } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';

export async function getSpecialStakingBalances (chainInfo: _ChainInfo, addresses: string[], substrateApi: _SubstrateApi): Promise<BigN[]> {
  // Default: 0 cho tất cả address
  let balances = new Array<BigN>(addresses.length).fill(new BigN(0));

  // --- Bittensor ----------------------------------------------------------------
  if (_BALANCE_CHAIN_GROUP.bittensor.includes(chainInfo.slug)) {
    const rawData = await substrateApi.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkeys(addresses);
    const values: Array<[string, TaoStakeInfo[]]> = rawData.toPrimitive() as Array<[string, TaoStakeInfo[]]>;

    balances = values.map(([, stakes]) =>
      stakes
        .filter((i) => i.netuid === 0)
        .reduce((prev, curr) => prev.plus(curr.stake), BigN(0))
    );

    return balances;
  }

  return balances;
}

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

export function buildLockedDetails (item: (FrameBalancesLocksInfo | FrameBalancesHoldsInfo | FrameBalancesFreezesInfo)[], totalLockedFromTransfer: bigint, reserved: bigint): LockedBalanceDetails {
  let stakingBalance = new BigN(0);
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
    others: others.gt(0) ? others.toFixed() : '0'
  };
}
