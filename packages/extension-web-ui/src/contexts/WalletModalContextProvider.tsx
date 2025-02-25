// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddressQrModal, AlertModal, AttachAccountModal, CreateAccountModal, DeriveAccountActionModal, DeriveAccountListModal, ImportAccountModal, ImportSeedModal, NewSeedModal, RequestCameraAccessModal, RequestCreatePasswordModal, SelectExtensionModal, TonWalletContractSelectorModal } from '@subwallet/extension-web-ui/components';
import SeedPhraseModal from '@subwallet/extension-web-ui/components/Modal/Account/SeedPhraseModal';
import { ConfirmationModal } from '@subwallet/extension-web-ui/components/Modal/ConfirmationModal';
import { CustomizeModal } from '@subwallet/extension-web-ui/components/Modal/Customize/CustomizeModal';
import { AddressQrModalProps } from '@subwallet/extension-web-ui/components/Modal/Global/AddressQrModal';
import { ADDRESS_QR_MODAL, BUY_TOKEN_MODAL, CONFIRMATION_MODAL, CREATE_ACCOUNT_MODAL, DERIVE_ACCOUNT_ACTION_MODAL, EARNING_INSTRUCTION_MODAL, GLOBAL_ALERT_MODAL, SEED_PHRASE_MODAL, TON_WALLET_CONTRACT_SELECTOR_MODAL, TRANSACTION_TRANSFER_MODAL, TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL, TRANSACTION_YIELD_CLAIM_MODAL, TRANSACTION_YIELD_FAST_WITHDRAW_MODAL, TRANSACTION_YIELD_UNSTAKE_MODAL, TRANSACTION_YIELD_WITHDRAW_MODAL } from '@subwallet/extension-web-ui/constants';
import { DEFAULT_ROUTER_PATH } from '@subwallet/extension-web-ui/constants/router';
import { useAlert, useGetConfig, useSetSessionLatest, useSwitchModal } from '@subwallet/extension-web-ui/hooks';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { AlertDialogProps } from '@subwallet/extension-web-ui/types';
import { noop } from '@subwallet/extension-web-ui/utils';
import { ModalContext, useExcludeModal } from '@subwallet/react-ui';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { TonWalletContractSelectorModalProps } from '../components/Modal/TonWalletContractSelectorModal';
import { UnlockModal } from '../components/Modal/UnlockModal';

interface Props {
  children: React.ReactNode;
}

export const PREDEFINED_MODAL_NAMES = ['debugger', 'transaction', 'confirmations'];
type PredefinedModalName = typeof PREDEFINED_MODAL_NAMES[number];

export const usePredefinedModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const openPModal = useCallback((name: PredefinedModalName | null) => {
    setSearchParams((prev) => {
      if (name) {
        prev.set('popup', name);
      } else {
        prev.delete('popup');
      }

      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  const isOpenPModal = useCallback(
    (popupName?: string) => {
      const currentPopup = searchParams.get('popup');

      if (popupName) {
        return currentPopup === popupName;
      } else {
        return !!currentPopup;
      }
    },
    [searchParams]
  );

  return { openPModal, isOpenPModal };
};

// todo: move to @subwallet/extension-web-ui/components/Modal/DeriveAccountActionModal
interface AccountDeriveActionProps {
  proxyId: string;
  onCompleteCb?: () => void;
}

export interface WalletModalContextType {
  addressQrModal: {
    open: (props: AddressQrModalProps) => void,
    checkActive: () => boolean,
    update: React.Dispatch<React.SetStateAction<AddressQrModalProps | undefined>>;
    close: VoidFunction
  },
  tonWalletContractSelectorModal: {
    open: (props: TonWalletContractSelectorModalProps) => void,
    close: VoidFunction
  },
  alertModal: {
    open: (props: AlertDialogProps) => void,
    close: VoidFunction
  },
  deriveModal: {
    open: (props: AccountDeriveActionProps) => void
  }
}

export const WalletModalContext = React.createContext<WalletModalContextType>({
  addressQrModal: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    open: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    checkActive: () => false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    update: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close: () => {}
  },
  tonWalletContractSelectorModal: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    open: (props) => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close: () => {}
  },
  alertModal: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    open: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close: () => {}
  },
  deriveModal: {
    open: noop
  }
});

const alertModalId = GLOBAL_ALERT_MODAL;

export const WalletModalContextProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const { activeModal, checkActive, hasActiveModal, inactiveAll, inactiveModal, inactiveModals } = useContext(ModalContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasMasterPassword, isLocked } = useSelector((state: RootState) => state.accountState);
  const { getConfig } = useGetConfig();
  const { onHandleSessionLatest, setTimeBackUp } = useSetSessionLatest();
  const { alertProps, closeAlert, openAlert } = useAlert(alertModalId);

  useExcludeModal(CONFIRMATION_MODAL);
  useExcludeModal(TRANSACTION_TRANSFER_MODAL);
  useExcludeModal(TRANSACTION_YIELD_UNSTAKE_MODAL);
  useExcludeModal(TRANSACTION_YIELD_WITHDRAW_MODAL);
  useExcludeModal(TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL);
  useExcludeModal(TRANSACTION_YIELD_FAST_WITHDRAW_MODAL);
  useExcludeModal(TRANSACTION_YIELD_CLAIM_MODAL);
  useExcludeModal(BUY_TOKEN_MODAL);
  useExcludeModal(EARNING_INSTRUCTION_MODAL);

  const onCloseConfirmationModal = useCallback(() => {
    setSearchParams((prev) => {
      prev.delete('popup');

      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  const onSeedPhraseModalBack = useSwitchModal(SEED_PHRASE_MODAL, CREATE_ACCOUNT_MODAL);

  const onSeedPhraseModalSubmitSuccess = useCallback(() => {
    navigate(DEFAULT_ROUTER_PATH);
  }, [navigate]);

  /* Address QR Modal */
  const [addressQrModalProps, setAddressQrModalProps] = useState<AddressQrModalProps | undefined>();
  // @ts-ignore
  const [deriveActionModalProps, setDeriveActionModalProps] = useState<AccountDeriveActionProps | undefined>();
  const [tonWalletContractSelectorModalProps, setTonWalletContractSelectorModalProps] = useState<TonWalletContractSelectorModalProps | undefined>();

  const openAddressQrModal = useCallback((props: AddressQrModalProps) => {
    setAddressQrModalProps(props);
    activeModal(ADDRESS_QR_MODAL);
  }, [activeModal]);

  const checkAddressQrModalActive = useCallback(() => {
    return checkActive(ADDRESS_QR_MODAL);
  }, [checkActive]);

  const closeAddressQrModal = useCallback(() => {
    inactiveModal(ADDRESS_QR_MODAL);
    setAddressQrModalProps(undefined);
  }, [inactiveModal]);

  const onCancelAddressQrModal = useCallback(() => {
    addressQrModalProps?.onCancel?.() || closeAddressQrModal();
  }, [addressQrModalProps, closeAddressQrModal]);

  /* Address QR Modal */

  /* TON Contract Modal */
  const openTonWalletContractSelectorModal = useCallback((props: AddressQrModalProps) => {
    setTonWalletContractSelectorModalProps(props);
    activeModal(TON_WALLET_CONTRACT_SELECTOR_MODAL);
  }, [activeModal]);

  const closeTonWalletContractSelectorModal = useCallback(() => {
    inactiveModal(TON_WALLET_CONTRACT_SELECTOR_MODAL);
    setTonWalletContractSelectorModalProps(undefined);
  }, [inactiveModal]);

  const onCancelTonWalletContractSelectorModal = useCallback(() => {
    tonWalletContractSelectorModalProps?.onCancel?.() || closeTonWalletContractSelectorModal();
  }, [closeTonWalletContractSelectorModal, tonWalletContractSelectorModalProps]);
  /* TON Contract Modal */

  /* Derive modal */
  const openDeriveModal = useCallback((actionProps: AccountDeriveActionProps) => {
    setDeriveActionModalProps(actionProps);
    activeModal(DERIVE_ACCOUNT_ACTION_MODAL);
  }, [activeModal]);
  /* Derive modal */

  const contextValue: WalletModalContextType = useMemo(() => ({
    addressQrModal: {
      open: openAddressQrModal,
      checkActive: checkAddressQrModalActive,
      update: setAddressQrModalProps,
      close: closeAddressQrModal
    },
    tonWalletContractSelectorModal: {
      open: openTonWalletContractSelectorModal,
      close: onCancelTonWalletContractSelectorModal
    },
    alertModal: {
      open: openAlert,
      close: closeAlert
    },
    deriveModal: {
      open: openDeriveModal
    }
  }), [checkAddressQrModalActive, closeAddressQrModal, closeAlert, onCancelTonWalletContractSelectorModal, openAddressQrModal, openAlert, openDeriveModal, openTonWalletContractSelectorModal]);

  useEffect(() => {
    if (hasMasterPassword && isLocked) {
      inactiveAll();
    }
  }, [hasMasterPassword, inactiveAll, isLocked]);

  useEffect(() => {
    const confirmID = searchParams.get('popup');

    // Auto open confirm modal with method modalContext.activeModal else auto close all modal
    if (confirmID) {
      PREDEFINED_MODAL_NAMES.includes(confirmID) && activeModal(confirmID);
    } else {
      inactiveModals(PREDEFINED_MODAL_NAMES);
    }
  }, [activeModal, inactiveModals, searchParams]);

  useEffect(() => {
    getConfig().then(setTimeBackUp).catch(console.error);
  }, [getConfig, setTimeBackUp]);

  useEffect(() => {
    onHandleSessionLatest();
  }, [onHandleSessionLatest]);

  return <WalletModalContext.Provider value={contextValue}>
    <div
      id='popup-container'
      style={{ zIndex: hasActiveModal ? undefined : -1 }}
    />
    {children}
    <ConfirmationModal
      id={CONFIRMATION_MODAL}
      onCancel={onCloseConfirmationModal}
    />
    <CreateAccountModal />
    <SeedPhraseModal
      modalId={SEED_PHRASE_MODAL}
      onBack={onSeedPhraseModalBack}
      onSubmitSuccess={onSeedPhraseModalSubmitSuccess}
    />
    <NewSeedModal />
    <ImportAccountModal />
    <AttachAccountModal />
    <ImportSeedModal />
    <DeriveAccountListModal />
    <RequestCreatePasswordModal />
    <RequestCameraAccessModal />
    <CustomizeModal />
    <UnlockModal />
    <SelectExtensionModal />

    {
      !!addressQrModalProps && (
        <AddressQrModal
          {...addressQrModalProps}
          onCancel={onCancelAddressQrModal}
        />
      )
    }

    {!!tonWalletContractSelectorModalProps &&
      <TonWalletContractSelectorModal
        {...tonWalletContractSelectorModalProps}
        id={TON_WALLET_CONTRACT_SELECTOR_MODAL}
        onCancel={onCancelTonWalletContractSelectorModal}
      />
    }

    {
      !!alertProps && (
        <AlertModal
          modalId={alertModalId}
          {...alertProps}
        />
      )
    }

    {
      !!deriveActionModalProps && (
        <DeriveAccountActionModal
          {...deriveActionModalProps}
        />
      )
    }

  </WalletModalContext.Provider>;
};
