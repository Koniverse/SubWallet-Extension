// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { AccountBitcoinInfoType, AccountTokenAddress } from '@subwallet/extension-koni-ui/types';
import { getBitcoinAccountDetails } from '@subwallet/extension-koni-ui/utils';
import { BitcoinMainnetKeypairTypes, BitcoinTestnetKeypairTypes } from '@subwallet/keyring/types';
import { useCallback } from 'react';

const transformBitcoinAccounts = (
  accounts: AccountBitcoinInfoType[] = [],
  chainSlug: string,
  tokenSlug: string,
  chainInfo: _ChainInfo
): AccountTokenAddress[] => {
  const isBitcoinTestnet = chainInfo.isTestnet;
  const keypairTypes = isBitcoinTestnet ? BitcoinTestnetKeypairTypes : BitcoinMainnetKeypairTypes;

  return accounts
    .filter(
      (acc) => keypairTypes.includes(acc.type)
    )
    .map((item) => ({
      accountInfo: item,
      tokenSlug,
      chainSlug
    }));
};

const useGetBitcoinAccount = () => {
  return useCallback((chainSlug: string, tokenSlug: string, chainInfo: _ChainInfo, accountProxy: AccountBitcoinInfoType[]): AccountTokenAddress[] => {
    const accountTokenAddressList = transformBitcoinAccounts(
      accountProxy || [],
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

export default useGetBitcoinAccount;
