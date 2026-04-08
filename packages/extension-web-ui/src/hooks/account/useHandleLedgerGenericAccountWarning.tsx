// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountProxy } from '@subwallet/extension-base/types';
import { WalletModalContext } from '@subwallet/extension-web-ui/contexts/WalletModalContextProvider';
import { useSelector, useTranslation } from '@subwallet/extension-web-ui/hooks';
import { VoidFunction } from '@subwallet/extension-web-ui/types';
import { ledgerGenericAccountProblemCheck } from '@subwallet/extension-web-ui/utils';
import { CheckCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useContext } from 'react';

type HookInputInfo = {
  accountProxy: AccountProxy | null | undefined;
  chainSlug: string;
}
type HookType = (inputInfo: HookInputInfo, processFunction: VoidFunction) => boolean;

export default function useHandleLedgerGenericAccountWarning (): HookType {
  const { t } = useTranslation();
  const ledgerGenericAllowNetworks = useSelector((state) => state.chainStore.ledgerGenericAllowNetworks);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const { alertModal } = useContext(WalletModalContext);

  return useCallback(({ accountProxy, chainSlug }, processFunction: VoidFunction) => {
    const ledgerCheck = ledgerGenericAccountProblemCheck(accountProxy);

    if (ledgerCheck !== 'unnecessary' && !ledgerGenericAllowNetworks.includes(chainSlug)) {
      let ledgerApp = 'Migration';

      if (ledgerCheck === 'polkadot') {
        ledgerApp = 'Polkadot';
      } else if (ledgerCheck === 'polkadot_ecdsa') {
        ledgerApp = 'Polkadot (EVM)';
      }

      alertModal.open({
        closable: false,
        title: t('ui.USE_HANDLE_LEDGER_GENERIC_ACCOUNT_WARNING.hooks.account.useHandleLedgerGenericAccountWarning.unsupportedNetwork'),
        subtitle: t('ui.USE_HANDLE_LEDGER_GENERIC_ACCOUNT_WARNING.hooks.account.useHandleLedgerGenericAccountWarning.doYouStillWantToGetTheAddress'),
        type: NotificationType.WARNING,
        content: (
          <>
            <div>
              {t(
                'ui.USE_HANDLE_LEDGER_GENERIC_ACCOUNT_WARNING.hooks.account.useHandleLedgerGenericAccountWarning.ledgerAccountsAreNotCompatibleWithNetworkTokensWillGetStuckIECanTBeTransferredOutOrStakedWhenSentToThisAccountType',
                {
                  replace: {
                    ledgerApp,
                    networkName: chainInfoMap[chainSlug]?.name
                  }
                }
              )}
            </div>
          </>
        ),
        cancelButton: {
          text: t('ui.USE_HANDLE_LEDGER_GENERIC_ACCOUNT_WARNING.hooks.account.useHandleLedgerGenericAccountWarning.cancel'),
          icon: XCircle,
          iconWeight: 'fill',
          onClick: () => {
            alertModal.close();
          },
          schema: 'secondary'
        },
        okButton: {
          text: t('ui.USE_HANDLE_LEDGER_GENERIC_ACCOUNT_WARNING.hooks.account.useHandleLedgerGenericAccountWarning.getAddress'),
          icon: CheckCircle,
          iconWeight: 'fill',
          onClick: () => {
            alertModal.close();

            processFunction();
          },
          schema: 'primary'
        }
      });

      return true;
    }

    return false;
  }, [alertModal, chainInfoMap, ledgerGenericAllowNetworks, t]);
}
