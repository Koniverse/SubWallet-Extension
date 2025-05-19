// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountMigrationInProgressWarningModal, AddressQrModal, AlertModal, AttachAccountModal, ClaimDappStakingRewardsModal, CreateAccountModal, DeriveAccountActionModal, DeriveAccountListModal, ImportAccountModal, ImportSeedModal, NewSeedModal, RemindBackupSeedPhraseModal, RemindDuplicateAccountNameModal, RequestCameraAccessModal, RequestCreatePasswordModal, SelectAddressFormatModal, TransactionProcessDetailModal, TransactionStepsModal } from '@subwallet/extension-koni-ui/components';
import { CustomizeModal } from '@subwallet/extension-koni-ui/components/Modal/Customize/CustomizeModal';
import { AccountDeriveActionProps } from '@subwallet/extension-koni-ui/components/Modal/DeriveAccountActionModal';
import { SelectAddressFormatModalProps } from '@subwallet/extension-koni-ui/components/Modal/Global/SelectAddressFormatModal';
import { TransactionStepsModalProps } from '@subwallet/extension-koni-ui/components/Modal/TransactionStepsModal';
import { ACCOUNT_MIGRATION_IN_PROGRESS_WARNING_MODAL, ADDRESS_QR_MODAL, DERIVE_ACCOUNT_ACTION_MODAL, EARNING_INSTRUCTION_MODAL, GLOBAL_ALERT_MODAL, SELECT_ADDRESS_FORMAT_MODAL, TRANSACTION_PROCESS_DETAIL_MODAL, TRANSACTION_STEPS_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useAlert, useExtensionDisplayModes, useGetConfig, useSetSessionLatest } from '@subwallet/extension-koni-ui/hooks';
import Confirmations from '@subwallet/extension-koni-ui/Popup/Confirmations';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AlertDialogProps } from '@subwallet/extension-koni-ui/types';
import { noop } from '@subwallet/extension-koni-ui/utils';
import { ModalContext, SwModal, useExcludeModal } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { AddressQrModalProps } from '../components/Modal/Global/AddressQrModal';
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
    });
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

export interface WalletModalContextType {
  addressQrModal: {
    open: (props: AddressQrModalProps) => void,
    checkActive: () => boolean,
    update: React.Dispatch<React.SetStateAction<AddressQrModalProps | undefined>>;
    close: VoidFunction
  },
  selectAddressFormatModal: {
    open: (props: SelectAddressFormatModalProps) => void,
    close: VoidFunction
  },
  alertModal: {
    open: (props: AlertDialogProps) => void,
    close: VoidFunction
  },
  deriveModal: {
    open: (props: AccountDeriveActionProps) => void
  },
  transactionProcessDetailModal: {
    open: (processId: string) => void
  },
  transactionStepsModal: {
    open: (props: TransactionStepsModalProps) => void
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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close: () => {}
  },
  selectAddressFormatModal: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    open: () => {},
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
  },
  transactionProcessDetailModal: {
    open: noop
  },
  transactionStepsModal: {
    open: noop
  }
});

const alertModalId = GLOBAL_ALERT_MODAL;

export const WalletModalContextProvider = ({ children }: Props) => {
  const { activeModal, checkActive, hasActiveModal, inactiveAll, inactiveModal, inactiveModals } = useContext(ModalContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const hasConfirmations = useSelector((state: RootState) => state.requestState.hasConfirmations);
  const { hasMasterPassword, isLocked } = useSelector((state: RootState) => state.accountState);
  const { getConfig } = useGetConfig();
  const { onHandleSessionLatest, setTimeBackUp } = useSetSessionLatest();
  const { alertProps, closeAlert, openAlert } = useAlert(alertModalId);
  const isUnifiedAccountMigrationInProgress = useSelector((state: RootState) => state.settings.isUnifiedAccountMigrationInProgress);
  const { isPopupMode } = useExtensionDisplayModes();

  useExcludeModal('confirmations');
  useExcludeModal(EARNING_INSTRUCTION_MODAL);
  useExcludeModal(ACCOUNT_MIGRATION_IN_PROGRESS_WARNING_MODAL);

  const onCloseModal = useCallback(() => {
    setSearchParams((prev) => {
      prev.delete('popup');

      return prev;
    });
  }, [setSearchParams]);

  /* Address QR Modal */
  const [addressQrModalProps, setAddressQrModalProps] = useState<AddressQrModalProps | undefined>();
  const [selectAddressFormatModalProps, setSelectAddressFormatModalProps] = useState<SelectAddressFormatModalProps | undefined>();
  const [deriveActionModalProps, setDeriveActionModalProps] = useState<AccountDeriveActionProps | undefined>();
  const [transactionProcessId, setTransactionProcessId] = useState('');
  const [transactionStepsModalProps, setTransactionStepsModalProps] = useState<TransactionStepsModalProps | undefined>(undefined);

  const openAddressQrModal = useCallback((props: AddressQrModalProps) => {
    setAddressQrModalProps(props);
    activeModal(ADDRESS_QR_MODAL);
  }, [activeModal]);

  const openSelectAddressFormatModal = useCallback((props: SelectAddressFormatModalProps) => {
    setSelectAddressFormatModalProps(props);
    activeModal(SELECT_ADDRESS_FORMAT_MODAL);
  }, [activeModal]);

  const checkAddressQrModalActive = useCallback(() => {
    return checkActive(ADDRESS_QR_MODAL);
  }, [checkActive]);

  const closeAddressQrModal = useCallback(() => {
    inactiveModal(ADDRESS_QR_MODAL);
    setAddressQrModalProps(undefined);
  }, [inactiveModal]);

  const closeSelectAddressFormatModal = useCallback(() => {
    inactiveModal(SELECT_ADDRESS_FORMAT_MODAL);
    setSelectAddressFormatModalProps(undefined);
  }, [inactiveModal]);

  const onCancelAddressQrModal = useCallback(() => {
    addressQrModalProps?.onCancel?.() || closeAddressQrModal();
  }, [addressQrModalProps, closeAddressQrModal]);

  const onCancelSelectAddressFormatModal = useCallback(() => {
    selectAddressFormatModalProps?.onCancel?.() || closeSelectAddressFormatModal();
  }, [closeSelectAddressFormatModal, selectAddressFormatModalProps]);

  /* Address QR Modal */

  /* Derive modal */
  const openDeriveModal = useCallback((actionProps: AccountDeriveActionProps) => {
    setDeriveActionModalProps(actionProps);
    activeModal(DERIVE_ACCOUNT_ACTION_MODAL);
  }, [activeModal]);
  /* Derive modal */

  /* Process modal */

  const openProcessModal = useCallback((processId: string) => {
    setTransactionProcessId(processId);
    activeModal(TRANSACTION_PROCESS_DETAIL_MODAL);
  }, [activeModal]);

  const closeProcessModal = useCallback(() => {
    setTransactionProcessId('');
    inactiveModal(TRANSACTION_PROCESS_DETAIL_MODAL);
  }, [inactiveModal]);

  const openTransactionStepsModal = useCallback((props: TransactionStepsModalProps) => {
    setTransactionStepsModalProps(props);
    activeModal(TRANSACTION_STEPS_MODAL);
  }, [activeModal]);

  const closeTransactionStepsModal = useCallback(() => {
    setTransactionStepsModalProps(undefined);
    inactiveModal(TRANSACTION_STEPS_MODAL);
  }, [inactiveModal]);
  /* Process modal */

  const contextValue: WalletModalContextType = useMemo(() => ({
    addressQrModal: {
      open: openAddressQrModal,
      checkActive: checkAddressQrModalActive,
      update: setAddressQrModalProps,
      close: closeAddressQrModal
    },
    selectAddressFormatModal: {
      open: openSelectAddressFormatModal,
      close: closeSelectAddressFormatModal
    },
    alertModal: {
      open: openAlert,
      close: closeAlert
    },
    deriveModal: {
      open: openDeriveModal
    },
    transactionProcessDetailModal: {
      open: openProcessModal
    },
    transactionStepsModal: {
      open: openTransactionStepsModal
    }
  }), [checkAddressQrModalActive, closeAddressQrModal, closeAlert, closeSelectAddressFormatModal, openAddressQrModal, openAlert, openDeriveModal, openProcessModal, openSelectAddressFormatModal, openTransactionStepsModal]);

  useEffect(() => {
    if (hasMasterPassword && isLocked) {
      inactiveAll();
    }
  }, [hasMasterPassword, inactiveAll, isLocked]);

  useEffect(() => {
    if (!isPopupMode && isUnifiedAccountMigrationInProgress) {
      activeModal(ACCOUNT_MIGRATION_IN_PROGRESS_WARNING_MODAL);
    }
  }, [activeModal, isPopupMode, isUnifiedAccountMigrationInProgress]);

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

  // todo: will remove ClaimDappStakingRewardsModal after Astar upgrade to v3

  return <WalletModalContext.Provider value={contextValue}>
    <div
      id='popup-container'
      style={{ zIndex: hasActiveModal ? undefined : -1 }}
    />
    {children}
    <SwModal
      className={'modal-full'}
      closable={false}
      destroyOnClose={true}
      id={'confirmations'}
      onCancel={onCloseModal}
      transitionName={'fade'}
      wrapClassName={CN({ 'd-none': !hasConfirmations })}
    >
      <Confirmations />
    </SwModal>
    <CreateAccountModal />
    <RemindBackupSeedPhraseModal />
    <ImportAccountModal />
    <AttachAccountModal />
    <NewSeedModal />
    <ImportSeedModal />
    <DeriveAccountListModal />
    <ClaimDappStakingRewardsModal />
    <RequestCreatePasswordModal />
    <RequestCameraAccessModal />
    <CustomizeModal />
    <UnlockModal />
    <AccountMigrationInProgressWarningModal />
    <RemindDuplicateAccountNameModal />

    {
      !!addressQrModalProps && (
        <AddressQrModal
          {...addressQrModalProps}
          onCancel={onCancelAddressQrModal}
        />
      )
    }

    {
      !!selectAddressFormatModalProps && (
        <SelectAddressFormatModal
          {...selectAddressFormatModalProps}
          onCancel={onCancelSelectAddressFormatModal}
        />
      )
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

    <TransactionProcessDetailModal
      onCancel={closeProcessModal}
      processId={transactionProcessId}
    />

    {
      transactionStepsModalProps && (
        <TransactionStepsModal
          {...transactionStepsModalProps}
          onCancel={closeTransactionStepsModal}
        />
      )
    }

  </WalletModalContext.Provider>;
};
