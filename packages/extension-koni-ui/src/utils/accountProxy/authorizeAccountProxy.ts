// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountAuthType } from '@subwallet/extension-base/background/types';
import { AccountChainType, AccountProxy } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-koni-ui/utils';

interface AuthorizeAccountProxiesConditions {
  accountAuthTypes: AccountAuthType[];
  isSubstrateConnector?: boolean;
}

export const filterAuthorizeAccountProxies = (accountProxies: AccountProxy[], conditions: AuthorizeAccountProxiesConditions): AccountProxy[] => {
  const { accountAuthTypes, isSubstrateConnector } = conditions;

  const rs = accountProxies.filter(({ accounts, chainTypes, id }) => {
    if (isAccountAll(id)) {
      return false;
    }

    const isEcdsaAccountProxy = accounts.some((account) => account.isSubstrateECDSA);

    return accountAuthTypes.some((type) => {
      if (type === 'substrate') {
        return chainTypes.includes(AccountChainType.SUBSTRATE);
      } else if (type === 'evm') {
        return chainTypes.includes(AccountChainType.ETHEREUM) && (isSubstrateConnector || !isEcdsaAccountProxy);
      } else if (type === 'ton') {
        return chainTypes.includes(AccountChainType.TON);
      } else if (type === 'cardano') {
        return chainTypes.includes(AccountChainType.CARDANO);
      }

      return false;
    });
  });

  if (!rs.length) {
    return [];
  }

  return rs;
};

export const convertAuthorizeTypeToChainTypes = (accountAuthTypes: AccountAuthType[] = [], accountChainTypes: AccountChainType[]): AccountChainType[] => {
  if (!accountAuthTypes) {
    return [];
  }

  const chainTypes: AccountChainType[] = [];

  accountAuthTypes.forEach((type) => {
    if (type === 'substrate') {
      chainTypes.push(AccountChainType.SUBSTRATE);
    } else if (type === 'evm') {
      chainTypes.push(AccountChainType.ETHEREUM);
    } else if (type === 'ton') {
      chainTypes.push(AccountChainType.TON);
    } else if (type === 'cardano') {
      chainTypes.push(AccountChainType.CARDANO);
    }
  });

  return chainTypes.filter((type) => accountChainTypes.includes(type));
};
