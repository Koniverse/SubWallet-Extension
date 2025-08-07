// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { LedgerNetwork } from '@subwallet/extension-base/background/KoniTypes';
import { _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountChainType, AccountProxy, AccountSignMode } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { PredefinedLedgerNetwork, RECOVERY_SLUG } from '@subwallet/extension-web-ui/constants/ledger';
import { getSignModeByAccountProxy } from '@subwallet/extension-web-ui/utils';

interface ChainItem extends _ChainState {
  isEthereum: boolean;
}

export const getSupportedLedger = (networkInfoMap: Record<string, _ChainInfo>, networkStateMap: Record<string, _ChainState>): LedgerNetwork[] => {
  const supportedLedgerNetwork = [...PredefinedLedgerNetwork];
  const networkInfoItems: ChainItem[] = [];

  Object.values(networkStateMap).forEach((chainState) => {
    if (chainState.active) {
      networkInfoItems.push({ ...chainState, isEthereum: _isChainEvmCompatible(networkInfoMap[chainState.slug]) });
    }
  });

  return supportedLedgerNetwork.filter((ledgerNetwork) => {
    return networkInfoItems.find((item) => ledgerNetwork.slug === item.slug || (ledgerNetwork.isEthereum && item.isEthereum));
  });
};

export const convertNetworkSlug = (network: LedgerNetwork) => network.slug.concat(network.isRecovery ? RECOVERY_SLUG : '');

export const isSubstrateEcdsaAccountProxy = (accountProxy: AccountProxy) => {
  return getSignModeByAccountProxy(accountProxy) === AccountSignMode.ECDSA_SUBSTRATE_LEDGER;
};

export const hasOnlySubstrateEcdsaAccountProxy = (accountProxies: AccountProxy[]) => {
  const noAllAccountProxy = accountProxies.filter((accountProxy) => !isAccountAll(accountProxy.id));

  return noAllAccountProxy.every((accountProxy) => {
    if (accountProxy.chainTypes.includes(AccountChainType.ETHEREUM)) {
      return getSignModeByAccountProxy(accountProxy) === AccountSignMode.ECDSA_SUBSTRATE_LEDGER;
    }

    return true;
  });
};
