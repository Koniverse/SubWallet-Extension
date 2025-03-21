// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BaseModal, CloseIcon } from '@subwallet/extension-web-ui/components';
import { TRANSACTION_CLAIM_BRIDGE, TRANSACTION_TRANSFER_MODAL, TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL, TRANSACTION_YIELD_CLAIM_MODAL, TRANSACTION_YIELD_FAST_WITHDRAW_MODAL, TRANSACTION_YIELD_UNSTAKE_MODAL, TRANSACTION_YIELD_WITHDRAW_MODAL } from '@subwallet/extension-web-ui/constants';
import { useTranslation } from '@subwallet/extension-web-ui/hooks';
import Transaction from '@subwallet/extension-web-ui/Popup/Transaction/Transaction';
import ClaimBridge from '@subwallet/extension-web-ui/Popup/Transaction/variants/ClaimBridge';
import ClaimReward from '@subwallet/extension-web-ui/Popup/Transaction/variants/ClaimReward';
import Withdraw from '@subwallet/extension-web-ui/Popup/Transaction/variants/Withdraw';
import { Icon, ModalContext, useExcludeModal } from '@subwallet/react-ui';
import { CaretLeft } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export type TransactionModalProps = {
  onBack?: VoidFunction;
  onCancel?: VoidFunction;
  onDoneCallback?: VoidFunction;
}

export interface TransactionModalContextType {
  claimRewardModal: {
    open: (props: TransactionModalProps) => void;
    close: VoidFunction;
  },
  claimBridgeModal: {
    open: (props: TransactionModalProps) => void;
    close: VoidFunction;
  },
  withdrawModal: {
    open: (props: TransactionModalProps) => void;
    close: VoidFunction;
  },
  closeTransactionModalById: (id: string) => void,
}

export const TransactionModalContext = React.createContext<TransactionModalContextType>({
  claimRewardModal: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    open: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close: () => {}
  },
  claimBridgeModal: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    open: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close: () => {}
  },
  withdrawModal: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    open: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close: () => {}
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

  const [claimRewardModalProps, setClaimRewardModalProps] = useState<TransactionModalProps | undefined>();
  const [claimBridgeModalProps, setClaimBridgeModalProps] = useState<TransactionModalProps | undefined>();
  const [withdrawModalProps, setWithdrawModalProps] = useState<TransactionModalProps | undefined>();

  useExcludeModal(TRANSACTION_TRANSFER_MODAL);
  useExcludeModal(TRANSACTION_YIELD_UNSTAKE_MODAL);
  useExcludeModal(TRANSACTION_YIELD_WITHDRAW_MODAL);
  useExcludeModal(TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL);
  useExcludeModal(TRANSACTION_YIELD_FAST_WITHDRAW_MODAL);
  useExcludeModal(TRANSACTION_YIELD_CLAIM_MODAL);
  useExcludeModal(TRANSACTION_CLAIM_BRIDGE);

  /* Claim reward Modal */

  const openClaimRewardModal = useCallback((props: TransactionModalProps = {}) => {
    setClaimRewardModalProps(props);
    activeModal(TRANSACTION_YIELD_CLAIM_MODAL);
  }, [activeModal]);

  const closeClaimRewardModal = useCallback(() => {
    inactiveModal(TRANSACTION_YIELD_CLAIM_MODAL);
    setClaimRewardModalProps(undefined);
  }, [inactiveModal]);

  /* Claim reward Modal */

  /* Claim bridge Modal */

  const openClaimBridgeModal = useCallback((props: TransactionModalProps = {}) => {
    setClaimBridgeModalProps(props);
    activeModal(TRANSACTION_CLAIM_BRIDGE);
  }, [activeModal]);

  const closeClaimBridgeModal = useCallback(() => {
    inactiveModal(TRANSACTION_CLAIM_BRIDGE);
    setClaimBridgeModalProps(undefined);
  }, [inactiveModal]);

  /* Claim bridge Modal */

  /* Withdraw Modal */

  const openWithdrawModal = useCallback((props: TransactionModalProps = {}) => {
    setWithdrawModalProps(props);
    activeModal(TRANSACTION_YIELD_WITHDRAW_MODAL);
  }, [activeModal]);

  const closeWithdrawModal = useCallback(() => {
    inactiveModal(TRANSACTION_YIELD_WITHDRAW_MODAL);
    setWithdrawModalProps(undefined);
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
      open: openClaimRewardModal,
      close: closeClaimRewardModal
    },
    claimBridgeModal: {
      open: openClaimBridgeModal,
      close: closeClaimBridgeModal
    },
    withdrawModal: {
      open: openWithdrawModal,
      close: closeWithdrawModal
    },
    closeTransactionModalById
  }), [closeClaimBridgeModal, closeClaimRewardModal, closeTransactionModalById, closeWithdrawModal, openClaimBridgeModal, openClaimRewardModal, openWithdrawModal]);

  return (
    <TransactionModalContext.Provider value={contextValue}>
      {children}

      {
        claimRewardModalProps && (
          <BaseModal
            className={'right-side-modal'}
            closeIcon={
              claimRewardModalProps.onBack
                ? (
                  <Icon
                    phosphorIcon={CaretLeft}
                    size='md'
                  />
                )
                : undefined
            }
            destroyOnClose={true}
            id={TRANSACTION_YIELD_CLAIM_MODAL}
            onCancel={claimRewardModalProps.onBack || closeClaimRewardModal}
            rightIconProps={claimRewardModalProps.onBack
              ? {
                icon: <CloseIcon />,
                onClick: claimRewardModalProps.onCancel || closeClaimRewardModal
              }
              : undefined
            }
            title={t('Claim rewards')}
          >
            <Transaction
              modalContent={true}
              modalId={TRANSACTION_YIELD_CLAIM_MODAL}
              onDoneCallback={claimRewardModalProps.onDoneCallback}
            >
              <ClaimReward />
            </Transaction>
          </BaseModal>
        )
      }

      {
        claimBridgeModalProps && (
          <BaseModal
            className={'right-side-modal'}
            closeIcon={
              claimBridgeModalProps.onBack
                ? (
                  <Icon
                    phosphorIcon={CaretLeft}
                    size='md'
                  />
                )
                : undefined
            }
            destroyOnClose={true}
            id={TRANSACTION_CLAIM_BRIDGE}
            onCancel={claimBridgeModalProps.onBack || closeClaimBridgeModal}
            rightIconProps={claimBridgeModalProps.onBack
              ? {
                icon: <CloseIcon />,
                onClick: claimBridgeModalProps.onCancel || closeClaimBridgeModal
              }
              : undefined
            }
            title={t('Claim rewards')}
          >
            <Transaction
              modalContent={true}
              modalId={TRANSACTION_CLAIM_BRIDGE}
              onDoneCallback={claimBridgeModalProps.onDoneCallback}
            >
              <ClaimBridge />
            </Transaction>
          </BaseModal>
        )
      }

      {
        withdrawModalProps && (
          <BaseModal
            className={'right-side-modal'}
            closeIcon={
              withdrawModalProps.onBack
                ? (
                  <Icon
                    phosphorIcon={CaretLeft}
                    size='md'
                  />
                )
                : undefined
            }
            destroyOnClose={true}
            id={TRANSACTION_YIELD_WITHDRAW_MODAL}
            onCancel={withdrawModalProps.onBack || closeWithdrawModal}
            rightIconProps={withdrawModalProps.onBack
              ? {
                icon: <CloseIcon />,
                onClick: withdrawModalProps.onCancel || closeWithdrawModal
              }
              : undefined
            }
            title={t('Withdraw')}
          >
            <Transaction
              modalContent={true}
              modalId={TRANSACTION_YIELD_WITHDRAW_MODAL}
              onDoneCallback={withdrawModalProps.onDoneCallback}
            >
              <Withdraw />
            </Transaction>
          </BaseModal>
        )
      }
    </TransactionModalContext.Provider>
  );
};
