// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { _isChainCompatibleLedgerEvm, _isChainEvmCompatible, _isSubstrateEvmCompatibleChain } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountChainType, AccountProxy, AccountSignMode } from '@subwallet/extension-base/types';
import { isSubstrateEcdsaLedgerAssetSupported } from '@subwallet/extension-base/utils';
import { InfoIcon } from '@subwallet/extension-koni-ui/components';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { VoidFunction } from '@subwallet/extension-koni-ui/types';
import { getSignModeByAccountProxy } from '@subwallet/extension-koni-ui/utils';
import React, { useCallback, useContext } from 'react';

type InputInfo = {
  context: 'useToken' | 'useNetwork';
  targetSlug: string;
  accountProxy?: AccountProxy;
}
type HookType = (inputInfo: InputInfo, processFunction: VoidFunction) => boolean;

// `useHandleLedgerAccountWarning` will trigger a warning in the following two cases:
//   1. When selecting a token address, it will display a warning for tokens belonging to unsupported networks of the ledgerEvm account, and tokens containing smart contracts on networks that bridge between the Ethereum and Substrate ecosystems for a substrate ecdsa ledger account type.
//   2. When selecting a network address, it will show a warning for EVM networks that are not supported by the ledgerEvm account, and all bridge networks for the ledger substrate ecdsa account.
export default function useHandleLedgerAccountWarning (): HookType {
  const { t } = useTranslation();
  const { alertModal } = useContext(WalletModalContext);
  const assetRegistry = useSelector((root) => root.assetRegistry.assetRegistry);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);

  return useCallback(({ accountProxy, context, targetSlug }, processFunction) => {
    if (!accountProxy) {
      return false;
    }

    const isTokenContext = context === 'useToken';
    const isNeedShowAlert = (() => {
      const signMode = getSignModeByAccountProxy(accountProxy);

      if (isTokenContext) {
        const tokenInfo = assetRegistry[targetSlug];

        if (!tokenInfo) {
          return false;
        }

        const originChain = chainInfoMap[tokenInfo.originChain];

        if (signMode === AccountSignMode.ECDSA_SUBSTRATE_LEDGER && tokenInfo) {
          if (_isSubstrateEvmCompatibleChain(originChain) && !isSubstrateEcdsaLedgerAssetSupported(tokenInfo, originChain)) {
            return true;
          }
        }

        if (signMode === AccountSignMode.GENERIC_LEDGER && accountProxy.chainTypes.includes(AccountChainType.ETHEREUM)) {
          if (_isChainEvmCompatible(originChain) && !_isChainCompatibleLedgerEvm(originChain)) {
            return true;
          }
        }
      } else {
        const chainInfo = chainInfoMap[targetSlug];

        if (!chainInfo) {
          return false;
        }

        if (signMode === AccountSignMode.GENERIC_LEDGER && accountProxy.chainTypes.includes(AccountChainType.ETHEREUM)) {
          if (_isChainEvmCompatible(chainInfo) && !_isChainCompatibleLedgerEvm(chainInfo)) {
            return true;
          }
        }

        if (signMode === AccountSignMode.ECDSA_SUBSTRATE_LEDGER && _isSubstrateEvmCompatibleChain(chainInfo)) {
          return true;
        }
      }

      return false;
    })();

    if (isNeedShowAlert) {
      const targetSymbol = isTokenContext ? assetRegistry[targetSlug]?.symbol : '';
      const title = isTokenContext ? t('Unsupported token') : t('Pay attention!');
      const subtitle = isTokenContext ? t('Do you still want to get the address?') : undefined;
      const contentMessage = isTokenContext
        ? t('Your account is not compatible with {{symbol}} token. Transferring {{symbol}} to this account will result in tokens getting stuck (i.e., can’t be transferred out or staked)', { replace: { symbol: targetSymbol } })
        : t(' This address can only be used to receive compatible tokens. Sending incompatible tokens to this address will result in these tokens getting stuck (i.e., can’t be sent out or staked)');

      const content = (<div>{contentMessage}</div>);

      alertModal.open({
        title,
        subtitle,
        content,
        closable: false,
        rightIconProps: !isTokenContext
          ? {
            icon: <InfoIcon />
          }
          : undefined,
        type: NotificationType.WARNING,
        okButton: {
          text: t('Get address'),
          onClick: () => {
            alertModal.close();
            processFunction();
          },
          schema: 'primary'
        },
        cancelButton: {
          text: t('Cancel'),
          onClick: () => {
            alertModal.close();
          },
          schema: 'secondary'
        }
      });

      return true;
    }

    return false;
  }, [alertModal, assetRegistry, chainInfoMap, t]);
}
