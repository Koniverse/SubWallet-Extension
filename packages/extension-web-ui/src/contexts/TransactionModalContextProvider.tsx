// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BaseModal } from '@subwallet/extension-web-ui/components';
import { TRANSACTION_CLAIM_BRIDGE, TRANSACTION_TRANSFER_MODAL, TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL, TRANSACTION_YIELD_CLAIM_MODAL, TRANSACTION_YIELD_FAST_WITHDRAW_MODAL, TRANSACTION_YIELD_UNSTAKE_MODAL, TRANSACTION_YIELD_WITHDRAW_MODAL } from '@subwallet/extension-web-ui/constants';
import { useTranslation } from '@subwallet/extension-web-ui/hooks';
import Transaction from '@subwallet/extension-web-ui/Popup/Transaction/Transaction';
import ClaimBridge from '@subwallet/extension-web-ui/Popup/Transaction/variants/ClaimBridge';
import ClaimReward from '@subwallet/extension-web-ui/Popup/Transaction/variants/ClaimReward';
import Withdraw from '@subwallet/extension-web-ui/Popup/Transaction/variants/Withdraw';
import { ModalContext, useExcludeModal } from '@subwallet/react-ui';
import React, { useCallback, useContext, useMemo, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export interface TransactionModalContextType {
  claimRewardModal: {
    open: VoidFunction;
  },
  claimBridgeModal: {
    open: VoidFunction;
  },
  withdrawModal: {
    open: VoidFunction;
  },
  closeTransactionModalById: (id: string) => void,
}

export const TransactionModalContext = React.createContext<TransactionModalContextType>({
  claimRewardModal: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    open: () => {}
  },
  claimBridgeModal: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    open: () => {}
  },
  withdrawModal: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    open: () => {}
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeTransactionModalById: () => {}
});

// todo: need add follow transactions:
//  - send fund
//  - send NFT
//  - unstake
//  - cancel unstake

export const TransactionModalContextProvider = ({ children }: Props) => {
  const { t } = useTranslation();
  const { activeModal, inactiveModal } = useContext(ModalContext);

  const [isClaimRewardModalVisible, setIsClaimRewardModalVisible] = useState<boolean>(false);
  const [isClaimBridgeModalVisible, setIsClaimBridgeModalVisible] = useState<boolean>(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState<boolean>(false);

  useExcludeModal(TRANSACTION_TRANSFER_MODAL);
  useExcludeModal(TRANSACTION_YIELD_UNSTAKE_MODAL);
  useExcludeModal(TRANSACTION_YIELD_WITHDRAW_MODAL);
  useExcludeModal(TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL);
  useExcludeModal(TRANSACTION_YIELD_FAST_WITHDRAW_MODAL);
  useExcludeModal(TRANSACTION_YIELD_CLAIM_MODAL);
  useExcludeModal(TRANSACTION_CLAIM_BRIDGE);

  /* Claim reward Modal */

  const openClaimRewardModal = useCallback(() => {
    setIsClaimRewardModalVisible(true);
    activeModal(TRANSACTION_YIELD_CLAIM_MODAL);
  }, [activeModal]);

  const closeClaimRewardModal = useCallback(() => {
    inactiveModal(TRANSACTION_YIELD_CLAIM_MODAL);
    setIsClaimRewardModalVisible(false);
  }, [inactiveModal]);

  /* Claim reward Modal */

  /* Claim bridge Modal */

  const openClaimBridgeModal = useCallback(() => {
    setIsClaimBridgeModalVisible(true);
    activeModal(TRANSACTION_CLAIM_BRIDGE);
  }, [activeModal]);

  const closeClaimBridgeModal = useCallback(() => {
    inactiveModal(TRANSACTION_CLAIM_BRIDGE);
    setIsClaimBridgeModalVisible(false);
  }, [inactiveModal]);

  /* Claim bridge Modal */

  /* Withdraw Modal */

  const openWithdrawModal = useCallback(() => {
    setIsWithdrawModalVisible(true);
    activeModal(TRANSACTION_YIELD_WITHDRAW_MODAL);
  }, [activeModal]);

  const closeWithdrawModal = useCallback(() => {
    inactiveModal(TRANSACTION_YIELD_WITHDRAW_MODAL);
    setIsWithdrawModalVisible(false);
  }, [inactiveModal]);

  /* Withdraw Modal */

  const closeTransactionModalById = useCallback((id: string) => {
    if (id === TRANSACTION_YIELD_CLAIM_MODAL) {
      closeClaimRewardModal();
    } else if (id === TRANSACTION_CLAIM_BRIDGE) {
      closeClaimBridgeModal();
    } else if (id === TRANSACTION_YIELD_WITHDRAW_MODAL) {
      closeWithdrawModal();
    }
  }, [closeClaimBridgeModal, closeClaimRewardModal, closeWithdrawModal]);

  const contextValue: TransactionModalContextType = useMemo(() => ({
    claimRewardModal: {
      open: openClaimRewardModal
    },
    claimBridgeModal: {
      open: openClaimBridgeModal
    },
    withdrawModal: {
      open: openWithdrawModal
    },
    closeTransactionModalById
  }), [closeTransactionModalById, openClaimBridgeModal, openClaimRewardModal, openWithdrawModal]);

  return (
    <TransactionModalContext.Provider value={contextValue}>
      {children}

      {
        isClaimRewardModalVisible && (
          <BaseModal
            className={'right-side-modal'}
            destroyOnClose={true}
            id={TRANSACTION_YIELD_CLAIM_MODAL}
            onCancel={closeClaimRewardModal}
            title={t('Claim rewards')}
          >
            <Transaction
              modalContent={true}
              modalId={TRANSACTION_YIELD_CLAIM_MODAL}
            >
              <ClaimReward />
            </Transaction>
          </BaseModal>
        )
      }

      {
        isClaimBridgeModalVisible && (
          <BaseModal
            className={'right-side-modal'}
            destroyOnClose={true}
            id={TRANSACTION_CLAIM_BRIDGE}
            onCancel={closeClaimBridgeModal}
            title={t('Claim rewards')}
          >
            <Transaction
              modalContent={true}
              modalId={TRANSACTION_CLAIM_BRIDGE}
            >
              <ClaimBridge />
            </Transaction>
          </BaseModal>
        )
      }

      {
        isWithdrawModalVisible && (
          <BaseModal
            className={'right-side-modal'}
            destroyOnClose={true}
            id={TRANSACTION_YIELD_WITHDRAW_MODAL}
            onCancel={closeWithdrawModal}
            title={t('Withdraw')}
          >
            <Transaction
              modalContent={true}
              modalId={TRANSACTION_YIELD_WITHDRAW_MODAL}
            >
              <Withdraw />
            </Transaction>
          </BaseModal>
        )
      }
    </TransactionModalContext.Provider>
  );
};
