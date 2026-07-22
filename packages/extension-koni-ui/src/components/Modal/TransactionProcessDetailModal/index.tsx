// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProcessTransactionData, ProcessType, ResponseSubscribeProcessById } from '@subwallet/extension-base/types';
import { TRANSACTION_PROCESS_DETAIL_MODAL } from '@subwallet/extension-koni-ui/constants';
import { cancelSubscription, subscribeProcess } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, ModalContext, SwModal } from '@subwallet/react-ui';
import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { CurrentProcessStep } from './parts/CurrentProcessStep';
import { ProcessStepList } from './parts/ProcessStepList';
import { TransactionInfoBlock } from './parts/TransactionInfoBlock';

type Props = ThemeProps & {
  processId: string;
  onCancel: () => void;
};

const modalId = TRANSACTION_PROCESS_DETAIL_MODAL;

const Component: FC<Props> = (props: Props) => {
  const { className, onCancel, processId } = props;
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);

  const [processData, setProcessData] = useState<ProcessTransactionData | undefined>();

  const modalTitle = useMemo(() => {
    if (!processData) {
      return '';
    }

    if (processData.type === ProcessType.SWAP) {
      return t('ui.TRANSACTION.components.Modal.TxProcessDetail.swapDetails');
    }

    if (processData.type === ProcessType.EARNING) {
      return t('ui.TRANSACTION.components.Modal.TxProcessDetail.stakeDetails');
    }

    return t('ui.TRANSACTION.components.Modal.TxProcessDetail.transactionDetails');
  }, [processData, t]);

  useEffect(() => {
    let cancel = false;
    let id = '';

    const onCancel = () => {
      if (id) {
        cancelSubscription(id).catch(console.error);
      }
    };

    if (!processId) {
      inactiveModal(modalId);
    } else {
      const updateProcess = (data: ResponseSubscribeProcessById) => {
        if (!cancel) {
          id = data.id;
          setProcessData(data.process);
        } else {
          onCancel();
        }
      };

      subscribeProcess({ processId }, updateProcess)
        .then(updateProcess)
        .catch(console.error);
    }

    return () => {
      cancel = true;
      onCancel();
    };
  }, [inactiveModal, processId]);

  if (!processData) {
    return null;
  }

  return (
    <SwModal
      className={className}
      destroyOnClose={true}
      footer={(
        <Button
          block={true}
          onClick={onCancel}
        >
          {t('ui.TRANSACTION.components.Modal.TxProcessDetail.close')}
        </Button>
      )}
      id={modalId}
      onCancel={onCancel}
      title={modalTitle}
    >
      <CurrentProcessStep
        className={'__current-process-step-block'}
        processData={processData}
      />
      <TransactionInfoBlock
        className={'__transaction-info-block'}
        processData={processData}
      />
      <ProcessStepList
        className={'__process-step-list'}
        processData={processData}
      />
    </SwModal>
  );
};

const TransactionProcessDetailModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-body.ant-sw-modal-body': {
      paddingBottom: 0
    },

    '.ant-sw-modal-footer.ant-sw-modal-footer': {
      borderTop: 0
    },

    '.__current-process-step-block': {
      marginBottom: token.margin
    },

    '.__transaction-info-block': {
      marginBottom: token.margin
    }
  });
});

export default TransactionProcessDetailModal;
