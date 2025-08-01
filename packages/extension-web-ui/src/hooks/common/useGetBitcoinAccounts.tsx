// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { _isChainInfoCompatibleWithAccountInfo } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountChainType } from '@subwallet/extension-base/types';
import { AccountInfoType, AccountTokenAddress } from '@subwallet/extension-web-ui/types';
import { getBitcoinAccountDetails } from '@subwallet/extension-web-ui/utils';
import { useCallback } from 'react';

const transformBitcoinAccounts = (
  accounts: AccountInfoType[] = [],
  chainSlug: string,
  tokenSlug: string,
  chainInfo: _ChainInfo
): AccountTokenAddress[] => {
  return accounts
    .filter(
      ({ type }) => _isChainInfoCompatibleWithAccountInfo(chainInfo, { chainType: AccountChainType.BITCOIN, type })
    )
    .map((item) => ({
      accountInfo: item,
      tokenSlug,
      chainSlug
    }));
};

const useGetBitcoinAccounts = () => {
  return useCallback((chainSlug: string, tokenSlug: string, chainInfo: _ChainInfo, accounts: AccountInfoType[]): AccountTokenAddress[] => {
    const accountTokenAddressList = transformBitcoinAccounts(
      accounts || [],
      chainSlug,
      tokenSlug,
      chainInfo
    );

    accountTokenAddressList.sort((a, b) => {
      const aDetails = getBitcoinAccountDetails(a.accountInfo.type);
      const bDetails = getBitcoinAccountDetails(b.accountInfo.type);

      return aDetails.order - bDetails.order;
    });

    return accountTokenAddressList;
  }, []);
};

export default useGetBitcoinAccounts;
