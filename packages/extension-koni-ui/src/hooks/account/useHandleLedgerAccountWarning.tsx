// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { _isChainCompatibleLedgerEvm, _isChainEvmCompatible, _isSubstrateEvmCompatibleChain } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountChainType, AccountProxy, AccountSignMode } from '@subwallet/extension-base/types';
import { isSubstrateEcdsaLedgerAssetSupported } from '@subwallet/extension-base/utils';
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
type HookType = (inputInfo: InputInfo, processFunction: VoidFunction) => void;

export default function useHandleLedgerAccountWarning (): HookType {
  const { t } = useTranslation();
  const { alertModal } = useContext(WalletModalContext);
  const assetRegistry = useSelector((root) => root.assetRegistry.assetRegistry);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);

  return useCallback(({ accountProxy, context, targetSlug }, processFunction) => {
    if (!accountProxy) {
      processFunction();

      return;
    }

    const isTokenContext = context === 'useToken';
    let isNeedShowAlert = false;
    let targetSymbol = '';

    const checkConditionToShowAlert = (chainInfo: _ChainInfo, tokenInfo?: _ChainAsset): boolean => {
      const signMode = getSignModeByAccountProxy(accountProxy);

      if (signMode === AccountSignMode.ECDSA_SUBSTRATE_LEDGER && tokenInfo) {
        if (_isSubstrateEvmCompatibleChain(chainInfo) && !isSubstrateEcdsaLedgerAssetSupported(tokenInfo, chainInfo)) {
          return true;
        }
      }

      if (signMode === AccountSignMode.GENERIC_LEDGER && accountProxy.chainTypes.includes(AccountChainType.ETHEREUM)) {
        if (_isChainEvmCompatible(chainInfo) && !_isChainCompatibleLedgerEvm(chainInfo)) {
          return true;
        }
      }

      return false;
    };

    if (isTokenContext) {
      const tokenInfo = assetRegistry[targetSlug];

      if (!tokenInfo) {
        processFunction();

        return;
      }

      const originChain = chainInfoMap[tokenInfo.originChain];

      targetSymbol = tokenInfo.symbol;
      isNeedShowAlert = checkConditionToShowAlert(originChain, tokenInfo);
    } else {
      const chainInfo = chainInfoMap[targetSlug];

      if (!chainInfo) {
        processFunction();

        return;
      }

      targetSymbol = chainInfo.name;
      isNeedShowAlert = checkConditionToShowAlert(chainInfo);
    }

    if (isNeedShowAlert) {
      const title = isTokenContext ? t('Unsupported token') : t(' Unsupported network');
      const subtitle = t('Do you still want to get the address?');
      const contentMessage = isTokenContext
        ? t('Your account is not compatible with {{symbol}} token. Transferring {{symbol}} to this account will result in tokens getting stuck (i.e., can’t be transferred out or staked)', { replace: { symbol: targetSymbol } })
        : t('Your account is not compatible with {{symbol}} token. Transferring {{symbol}} to this account will result in tokens getting stuck (i.e., can’t be transferred out or staked)', { replace: { symbol: targetSymbol } });

      const content = (
        <>
          <div>{contentMessage}</div>
        </>
      );

      alertModal.open({
        title,
        subtitle,
        content,
        closable: false,
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

      return;
    }

    processFunction();
  }, [alertModal, assetRegistry, chainInfoMap, t]);
}
