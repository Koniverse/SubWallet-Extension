// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountChainType, AccountSignMode } from '@subwallet/extension-base/types';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { ALL_STAKING_ACTIONS, isLedgerCapable, isProductionMode, ledgerIncompatible, SubstrateLedgerSignModeSupport } from '@subwallet/extension-koni-ui/constants';
import { getSignableProxies } from '@subwallet/extension-koni-ui/messaging/transaction/multisig';
import { useCallback } from 'react';

import { useNotification, useTranslation } from '../common';
import useGetAccountByAddress from './useGetAccountByAddress';

type WrapActionWithPreCheck = (
  onClick: VoidFunction,
  action: ExtrinsicType
) => VoidFunction;

type ActionPreCheckParams = {
  address?: string;
  chain?: string;
  blockAllAccount?: boolean;
  message?: string;
};

const usePreCheckAction = ({ address, blockAllAccount = true, chain, message }: ActionPreCheckParams): WrapActionWithPreCheck => {
  const notify = useNotification();
  const { t } = useTranslation();

  const account = useGetAccountByAddress(address);

  const getAccountTypeTitle = useCallback((signMode: AccountSignMode): string => {
    switch (signMode) {
      case AccountSignMode.LEGACY_LEDGER:
      case AccountSignMode.GENERIC_LEDGER:
      case AccountSignMode.ECDSA_SUBSTRATE_LEDGER:
        return t('ui.ACCOUNT.hook.account.usePreCheckAction.ledgerAccount');
      case AccountSignMode.ALL_ACCOUNT:
        return t('ui.ACCOUNT.hook.account.usePreCheckAction.allAccount');
      case AccountSignMode.PASSWORD:
        return t('ui.ACCOUNT.hook.account.usePreCheckAction.normalAccount');
      case AccountSignMode.QR:
        return t('ui.ACCOUNT.hook.account.usePreCheckAction.qrSignerAccount');
      case AccountSignMode.MULTISIG:
        return t('ui.ACCOUNT.hook.account.usePreCheckAction.multisigAccount');
      case AccountSignMode.READ_ONLY:
        return t('ui.ACCOUNT.hook.account.usePreCheckAction.watchOnlyAccount');
      case AccountSignMode.UNKNOWN:
      default:
        return t('ui.ACCOUNT.hook.account.usePreCheckAction.unknownAccount');
    }
  }, [t]);

  return useCallback((onClick: VoidFunction, action: ExtrinsicType) => {
    return async () => {
      if (!account) {
        notify({
          message: t('ui.ACCOUNT.hook.account.usePreCheckAction.accountNotExists'),
          type: 'info',
          duration: 1.5
        });
      } else {
        const mode = account.signMode;
        let block = false;
        let accountTitle = getAccountTypeTitle(mode);
        let defaultMessage = detectTranslate('ui.ACCOUNT.hook.account.usePreCheckAction.featureNotAvailableForAccountType');

        if (ALL_STAKING_ACTIONS.includes(action)) {
          defaultMessage = detectTranslate('ui.ACCOUNT.hook.account.usePreCheckAction.earningNotSupportedForAccountType');
        }

        if (account.isMultisig && chain) {
          const { signableProxies } = await getSignableProxies({ multisigProxyId: account.address, extrinsicType: action, chain });

          if (signableProxies.length === 0) {
            block = true;
          }
        } else if (!account.transactionActions.includes(action) || (mode === AccountSignMode.QR && account.chainType === 'ethereum' && isProductionMode)) {
          block = true;

          switch (mode) {
            case AccountSignMode.ALL_ACCOUNT:
              if (!blockAllAccount) {
                block = false;
              }

              break;

            case AccountSignMode.QR:
              accountTitle = t('ui.ACCOUNT.hook.account.usePreCheckAction.evmQrSignerAccount');
              break;

            case AccountSignMode.LEGACY_LEDGER:
            case AccountSignMode.GENERIC_LEDGER:
              if (account.chainType === AccountChainType.ETHEREUM) {
                accountTitle = t('ui.ACCOUNT.hook.account.usePreCheckAction.ledgerEvmAccount');
              } else if (account.chainType === AccountChainType.SUBSTRATE) {
                accountTitle = t('ui.ACCOUNT.hook.account.usePreCheckAction.ledgerSubstrateAccount');
              }

              break;
            case AccountSignMode.ECDSA_SUBSTRATE_LEDGER:
              accountTitle = t('ui.ACCOUNT.hook.account.usePreCheckAction.ledgerPolkadotEvmAccount');
              break;
          }
        }

        if (SubstrateLedgerSignModeSupport.includes(mode)) {
          if (!isLedgerCapable) {
            notify({
              message: t(ledgerIncompatible),
              type: 'error',
              duration: 8
            });

            return;
          }
        }

        if (!block) {
          onClick();
        } else {
          notify({
            message: t(
              message ?? t(defaultMessage),
              { replace: { accountTitle: accountTitle } }
            ),
            type: 'info',
            duration: 8
          });
        }
      }
    };
  }, [account, blockAllAccount, chain, getAccountTypeTitle, message, notify, t]);
};

export default usePreCheckAction;
