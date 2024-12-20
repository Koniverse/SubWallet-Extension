// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BriefView } from '@subwallet/extension-koni-ui/Popup/MigrateAccount/BriefView';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';

import { EnterPasswordModal, enterPasswordModalId } from './EnterPasswordModal';
import { SoloAccountMigrationView } from './SoloAccountMigrationView';
import { SummaryView } from './SummaryView';

type Props = ThemeProps;

export enum ScreenView {
  BRIEF= 'brief',
  SOLO_ACCOUNT_MIGRATION= 'solo-account-migration',
  SUMMARY='summary'
}

function Component ({ className = '' }: Props) {
  const [currentScreenView, setCurrentScreenView] = useState<ScreenView>(ScreenView.BRIEF);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const { activeModal, inactiveModal } = useContext(ModalContext);

  const [totalToBeMigratedAccounts, setTotalToBeMigratedAccounts] = useState<number>(0);

  const onClosePasswordModal = useCallback(() => {
    inactiveModal(enterPasswordModalId);
    setIsPasswordModalOpen(false);
  }, [inactiveModal]);

  const onOpenPasswordModal = useCallback(() => {
    setIsPasswordModalOpen(true);
    activeModal(enterPasswordModalId);
  }, [activeModal]);

  const onInteractAction = useCallback(() => {
    // push status to background
  }, []);

  const onClickDismiss = useCallback(() => {
    onInteractAction();

    // close this screen
  }, [onInteractAction]);

  const onClickMigrateNow = useCallback(() => {
    onInteractAction();

    // open password
    onOpenPasswordModal();
  }, [onInteractAction, onOpenPasswordModal]);

  const onSubmitPassword = useCallback(async () => {
    // migrate all account
    // open migrate solo chain accounts

    onClosePasswordModal();
    setCurrentScreenView(ScreenView.SOLO_ACCOUNT_MIGRATION);

    setTotalToBeMigratedAccounts(5);

    return Promise.resolve();
  }, [onClosePasswordModal]);

  const onApproveSoloAccountMigration = useCallback(async () => {
    // update result accounts

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 600);
    });
  }, []);

  const onCompleteSoloAccountsMigrationProcess = useCallback(() => {
    setCurrentScreenView(ScreenView.SUMMARY);
  }, []);

  return (
    <>
      {currentScreenView === ScreenView.BRIEF && (
        <BriefView
          onDismiss={onClickDismiss}
          onMigrateNow={onClickMigrateNow}
        />
      )}

      {currentScreenView === ScreenView.SOLO_ACCOUNT_MIGRATION && (
        <SoloAccountMigrationView
          onApprove={onApproveSoloAccountMigration}
          onCompleteMigrationProcess={onCompleteSoloAccountsMigrationProcess}
          totalToBeMigratedAccounts={totalToBeMigratedAccounts}
        />
      )}

      {currentScreenView === ScreenView.SUMMARY && (
        <SummaryView />
      )}

      {
        isPasswordModalOpen && (
          <EnterPasswordModal
            onClose={onClosePasswordModal}
            onSubmit={onSubmitPassword}
          />
        )
      }
    </>
  );
}

const MigrateAccount = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({

  });
});

export default MigrateAccount;
