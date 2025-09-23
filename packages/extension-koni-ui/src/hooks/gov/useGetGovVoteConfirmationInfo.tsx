// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetDecimals, _getAssetPriceId, _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
import { balanceFormatter, BN_ZERO, formatNumber, isSameAddress } from '@subwallet/extension-base/utils';
import { useGetAccountByAddress, useGetAccountTokenBalance, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { getConvertedBalanceValue } from '@subwallet/extension-koni-ui/hooks/screen/home/useAccountBalance';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { BigNumber } from 'bignumber.js';
import { useMemo } from 'react';

interface BalanceChange {
  from: string;
  to?: string;
}

interface GovLockedInfoConfirmation {
  transferable: BalanceChange;
  governanceLock: BalanceChange;
  convertedAmount?: string;
}

interface TransactionConfirmationInfo {
  address: string;
  chain: string;
  amount: BigNumber;
  transactionFee?: string;
  isUnVote?: boolean;
}

const useGetGovVoteConfirmationInfo = ({ address, amount, chain, isUnVote, transactionFee }: TransactionConfirmationInfo): GovLockedInfoConfirmation | null => {
  const account = useGetAccountByAddress(address);
  const govLockedInfos = useSelector((state) => state.openGov.govLockedInfos);
  const getAccountTokenBalance = useGetAccountTokenBalance();
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const assetRegistry = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const priceMap = useSelector((state: RootState) => state.price.priceMap);

  const assetInfo = useMemo(() => {
    const assetSlug = _getChainNativeTokenSlug(chainInfoMap[chain]);

    return assetRegistry[assetSlug];
  }, [assetRegistry, chainInfoMap, chain]);

  const currentGovInfo = useMemo(() => {
    let infos = govLockedInfos;

    if (chain) {
      infos = infos.filter((item) => item.chain === chain);
    }

    return infos.find((item) => isSameAddress(item.address, address));
  }, [address, chain, govLockedInfos]);

  const balanceInfo = useMemo(
    () => {
      if (!account?.proxyId) {
        return undefined;
      }

      const tokenBalanceMap = getAccountTokenBalance(
        [assetInfo.slug],
        account.proxyId
      );

      return tokenBalanceMap[assetInfo.slug];
    },
    [account, assetInfo.slug, getAccountTokenBalance]
  );

  return useMemo(() => {
    if (!balanceInfo) {
      return null;
    }

    const decimals = _getAssetDecimals(assetInfo);
    const priceId = _getAssetPriceId(assetInfo);
    const currentTransferable = balanceInfo.free.value.shiftedBy(decimals);
    const currentAllLocked = balanceInfo.locked.value.shiftedBy(decimals);
    const currentGovernanceLock = new BigNumber(currentGovInfo?.summary.totalLocked || 0);

    const transferableFrom = formatNumber(currentTransferable, decimals, balanceFormatter);
    const governanceLockFrom = formatNumber(currentGovernanceLock, decimals, balanceFormatter);
    const convertedAmount = getConvertedBalanceValue(amount.shiftedBy(-decimals), priceMap[priceId]).toString();

    const govLockedInfo: GovLockedInfoConfirmation = {
      transferable: { from: transferableFrom },
      governanceLock: { from: governanceLockFrom },
      convertedAmount
    };

    if (isUnVote) {
      // If it's an unvote and the amount to lock is greater than the current governance lock,
      // we need to set the governance lock to 0
      govLockedInfo.governanceLock.to = formatNumber(BN_ZERO, decimals, balanceFormatter);
    } else if (amount.gt(currentGovernanceLock)) {
      // If the amount to lock is greater than the current governance lock,
      // we need to increase the governance lock to the amount
      govLockedInfo.governanceLock.to = formatNumber(amount, decimals, balanceFormatter);
    }

    let transferableAfterLock = currentTransferable.minus(transactionFee || BN_ZERO);

    if (isUnVote) {
      // If it's an unvote, we need to add the amount to the transferable balance
      transferableAfterLock = transferableAfterLock.plus(currentGovernanceLock);
    } else if (amount.gt(currentAllLocked)) {
      // If the amount to lock is greater than the current total locked,
      // we need to minus the difference from the transferable balance
      const difference = amount.minus(currentAllLocked);

      transferableAfterLock = transferableAfterLock.minus(difference);
    }

    govLockedInfo.transferable.to = formatNumber(BigNumber.max(transferableAfterLock, BN_ZERO), decimals, balanceFormatter);

    return govLockedInfo;
  }, [amount, assetInfo, balanceInfo, currentGovInfo?.summary.totalLocked, isUnVote, priceMap, transactionFee]);
};

export default useGetGovVoteConfirmationInfo;
