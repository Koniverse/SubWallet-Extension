// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { CONFIRM_TERM_SEED_PHRASE } from '@subwallet/extension-web-ui/constants';
import { WalletModalContext } from '@subwallet/extension-web-ui/contexts/WalletModalContextProvider';
import { useSetSelectedMnemonicType, useTranslation } from '@subwallet/extension-web-ui/hooks';
import { SeedPhraseTermStorage, VoidFunction } from '@subwallet/extension-web-ui/types';
import { KeypairType } from '@subwallet/keyring/types';
import React, { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';

type HookType = (accountType: KeypairType, processFunction: VoidFunction) => boolean;
const GeneralTermLocalDefault: SeedPhraseTermStorage = { state: 'nonConfirmed', useDefaultContent: false };

export default function useHandleTonAccountWarning (): HookType {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [, setConfirmedTermSeedPhrase] = useLocalStorage<SeedPhraseTermStorage>(CONFIRM_TERM_SEED_PHRASE, GeneralTermLocalDefault);
  const setSelectedMnemonicType = useSetSelectedMnemonicType(true);
  const { alertModal } = useContext(WalletModalContext);

  return useCallback((accountType: KeypairType, processFunction: VoidFunction) => {
    if (accountType === 'ton') {
      alertModal.open({
        closable: false,
        title: t('ui.USE_HANDLE_TON_ACCOUNT_WARNING.hooks.account.useHandleTonAccountWarning.incompatibleSeedPhrase'),
        type: NotificationType.WARNING,
        content: (
          <>
            <div>
              {t('ui.USE_HANDLE_TON_ACCOUNT_WARNING.hooks.account.useHandleTonAccountWarning.thisAddressSSeedPhraseIsNotCompatibleWithTonNativeWalletsContinueUsingThisAddressOrCreateANewAccountThatCanBeUsedOnBothSubwalletAndTonNativeWallets')}
            </div>
          </>
        ),
        okButton: {
          text: t('ui.USE_HANDLE_TON_ACCOUNT_WARNING.hooks.account.useHandleTonAccountWarning.getAddress'),
          onClick: () => {
            alertModal.close();
            processFunction();
          },
          schema: 'primary'
        },
        cancelButton: {
          text: t('ui.USE_HANDLE_TON_ACCOUNT_WARNING.hooks.account.useHandleTonAccountWarning.createNew'),
          onClick: () => {
            setSelectedMnemonicType('ton');
            setConfirmedTermSeedPhrase((prevState: string | SeedPhraseTermStorage) => {
              // Note: This condition is to migrate the old data structure is "string" in localStorage to the new data structure in "SeedPhraseTermStorage".
              if (typeof prevState === 'string') {
                return { state: prevState, useDefaultContent: true };
              } else {
                return { ...prevState, useDefaultContent: true };
              }
            });
            navigate('/accounts/new-seed-phrase');

            alertModal.close();
          },
          schema: 'secondary'
        }
      });

      return true;
    }

    return false;
  }, [alertModal, navigate, setConfirmedTermSeedPhrase, setSelectedMnemonicType, t]);
}
