// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { YieldPositionInfo } from '@subwallet/extension-base/types';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { useGetChainAndExcludedTokenByCurrentProxy, useSelector } from '@subwallet/extension-koni-ui/hooks';
import BigN from 'bignumber.js';
import { useMemo } from 'react';

const useGetYieldPositionForSpecificAccount = (address?: string): YieldPositionInfo[] => {
  const poolInfoMap = useSelector((state) => state.earning.poolInfoMap);
  const yieldPositions = useSelector((state) => state.earning.yieldPositions);
  const isAllAccount = useSelector((state) => state.accountState.isAllAccount);
  const currentAccountProxy = useSelector((state) => state.accountState.currentAccountProxy);
  const { allowedChains, excludedTokens } = useGetChainAndExcludedTokenByCurrentProxy();

  return useMemo(() => {
    const infoSpecificList: YieldPositionInfo[] = [];

    const checkAddress = (item: YieldPositionInfo) => {
      if (isAllAccount) {
        if (address) {
          return isSameAddress(address, item.address);
        }

        return true;
      } else {
        return currentAccountProxy?.accounts.some(({ address: _address }) => {
          const compareAddress = address ? isSameAddress(address, _address) : true;

          return compareAddress && isSameAddress(_address, item.address);
        });
      }
    };

    for (const info of yieldPositions) {
      if (!allowedChains.includes(info.chain) || excludedTokens.includes(info.balanceToken)) {
        continue;
      }

      if (!poolInfoMap[info.slug]) {
        continue;
      }

      const haveStake = new BigN(info.totalStake).gt(0);

      if (!haveStake) {
        continue;
      }

      const isValid = checkAddress(info);

      if (isValid) {
        infoSpecificList.push(info);
      }
    }

    return infoSpecificList;
  }, [address, allowedChains, currentAccountProxy?.accounts, excludedTokens, isAllAccount, poolInfoMap, yieldPositions]);
};

export default useGetYieldPositionForSpecificAccount;
