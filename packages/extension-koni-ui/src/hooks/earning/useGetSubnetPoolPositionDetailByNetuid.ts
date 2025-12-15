// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { EarningStatus, SubnetYieldPositionInfo, YieldPoolInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { isSameAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { useMemo } from 'react';

import { useSelector } from '../common';

interface Result {
  compound: SubnetYieldPositionInfo | undefined;
  poolInfo: YieldPoolInfo | undefined;
}

const useGetSubnetPoolPositionDetailByNetuid = (netuid?: number, address?: string): Result | null => {
  const poolInfoMap = useSelector((state) => state.earning.poolInfoMap);
  const { yieldPositions } = useSelector((state) => state.earning);
  const { currentAccountProxy, isAllAccount } = useSelector(
    (state) => state.accountState
  );

  return useMemo<Result | null>(() => {
    if (!netuid) {
      return null;
    }

    const checkAddress = (item: YieldPositionInfo): boolean => {
      if (isAllAccount) {
        return address ? isSameAddress(address, item.address) : true;
      }

      return (
        currentAccountProxy?.accounts.some(({ address: accAddr }) => {
          const matchInput = address
            ? isSameAddress(address, accAddr)
            : true;

          return matchInput && isSameAddress(accAddr, item.address);
        }) ?? false
      );
    };

    const matchedPositions = yieldPositions.filter(
      (position): position is SubnetYieldPositionInfo => {
        if (position.type !== YieldPoolType.SUBNET_STAKING) {
          return false;
        }

        const poolInfo = poolInfoMap[position.slug];
        const matchNetuid = poolInfo?.metadata?.subnetData?.netuid === netuid;

        return (
          matchNetuid &&
          checkAddress(position) &&
          new BigN(position.totalStake).gt(0)
        );
      }
    );

    if (!matchedPositions.length) {
      return {
        compound: undefined,
        poolInfo: undefined
      };
    }

    const poolInfo = poolInfoMap[matchedPositions[0].slug];

    // --- All account & no address → merge positions
    if (isAllAccount && !address) {
      const base: SubnetYieldPositionInfo = {
        ...matchedPositions[0],
        address: ALL_ACCOUNT_KEY,
        totalStake: '0',
        activeStake: '0',
        unstakeBalance: '0',
        unstakings: [],
        isBondedBefore: false
      };

      const statuses: EarningStatus[] = [];

      for (const item of matchedPositions) {
        base.totalStake = new BigN(base.totalStake)
          .plus(item.totalStake)
          .toString();

        base.activeStake = new BigN(base.activeStake)
          .plus(item.activeStake)
          .toString();

        base.unstakeBalance = new BigN(base.unstakeBalance)
          .plus(item.unstakeBalance)
          .toString();

        base.isBondedBefore ||= item.isBondedBefore;
        base.unstakings.push(...item.unstakings);
        statuses.push(item.status);
      }

      if (statuses.every((s) => s === EarningStatus.WAITING)) {
        base.status = EarningStatus.WAITING;
      } else if (statuses.every((s) => s === EarningStatus.NOT_EARNING)) {
        base.status = EarningStatus.NOT_EARNING;
      } else if (statuses.every((s) => s === EarningStatus.EARNING_REWARD)) {
        base.status = EarningStatus.EARNING_REWARD;
      } else {
        base.status = EarningStatus.PARTIALLY_EARNING;
      }

      return {
        compound: base,
        poolInfo
      };
    }

    // --- Normal case
    return {
      compound: matchedPositions[0],
      poolInfo
    };
  }, [netuid, address, isAllAccount, currentAccountProxy?.accounts, yieldPositions, poolInfoMap]);
};

export default useGetSubnetPoolPositionDetailByNetuid;
