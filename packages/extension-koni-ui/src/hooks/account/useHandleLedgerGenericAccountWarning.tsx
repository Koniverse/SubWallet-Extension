// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountProxy } from '@subwallet/extension-base/types';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { VoidFunction } from '@subwallet/extension-koni-ui/types';
import { ledgerGenericAccountProblemCheck } from '@subwallet/extension-koni-ui/utils';
import { CheckCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useContext } from 'react';

type HookInputInfo = {
  accountProxy: AccountProxy | null | undefined;
  chainSlug: string;
}
type HookType = (inputInfo: HookInputInfo, processFunction: VoidFunction) => void;

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
        title: t('ui.ACCOUNT.hook.account.useHandleLedgerWarning.unsupportedNetwork'),
        subtitle: t('ui.ACCOUNT.hook.account.useHandleLedgerWarning.confirmGetAddress'),
        type: NotificationType.WARNING,
        content: (
          <>
            <div>
              {t('ui.ACCOUNT.hook.account.useHandleLedgerWarning.ledgerIncompatibleNetworkWarning', {
                replace: {
                  ledgerApp: ledgerApp,
                  networkName: chainInfoMap[chainSlug]?.name
                }
              }
              )}
            </div>
          </>
        ),
        cancelButton: {
          text: t('ui.ACCOUNT.hook.account.useHandleLedgerWarning.cancel'),
          icon: XCircle,
          iconWeight: 'fill',
          onClick: () => {
            alertModal.close();
          },
          schema: 'secondary'
        },
        okButton: {
          text: t('ui.ACCOUNT.hook.account.useHandleLedgerWarning.getAddress'),
          icon: CheckCircle,
          iconWeight: 'fill',
          onClick: () => {
            alertModal.close();

            processFunction();
          },
          schema: 'primary'
        }
      });

      return;
    }

    processFunction();
  }, [alertModal, chainInfoMap, ledgerGenericAllowNetworks, t]);
}
