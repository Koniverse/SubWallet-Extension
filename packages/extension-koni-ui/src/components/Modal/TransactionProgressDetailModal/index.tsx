// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ProcessTransactionData, ProcessType, ResponseSubscribeProcessById } from '@subwallet/extension-base/types';
import { TRANSACTION_PROGRESS_DETAIL_MODAL } from '@subwallet/extension-koni-ui/constants';
import { cancelSubscription, subscribeProcess } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, ModalContext, SwModal } from '@subwallet/react-ui';
import { SwIconProps } from '@subwallet/react-ui/es/icon';
import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { CurrentProgressStep } from './parts/CurrentProgressStep';
import { ProgressStepList } from './parts/ProgressStepList';
import { TransactionInfoBlock } from './parts/TransactionInfoBlock';

type Props = ThemeProps & {
  processId: string;
  onCancel: () => void;
};

export interface ActionInfo {
  title: string;
  extrinsicType: ExtrinsicType;
  backgroundColor: string;
  leftIcon?: SwIconProps['phosphorIcon'];
  disabled?: boolean;
  isRead?: boolean;
}

export interface BriefActionInfo {
  icon: ActionInfo['leftIcon'];
  title: ActionInfo['title'];
  backgroundColor?: ActionInfo['backgroundColor'];
}

const modalId = TRANSACTION_PROGRESS_DETAIL_MODAL;

const Component: FC<Props> = (props: Props) => {
  const { className, onCancel, processId } = props;
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);

  const [progressData, setProgressData] = useState<ProcessTransactionData | undefined>();

  const modalTitle = useMemo(() => {
    if (!progressData) {
      return '';
    }

    if (progressData.type === ProcessType.SWAP) {
      return t('Swap details');
    }

    if (progressData.type === ProcessType.EARNING) {
      return t('Stake details');
    }

    return t('Transaction details');
  }, [progressData, t]);

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
          setProgressData(data.process);
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

  if (!progressData) {
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
          {t('Close')}
        </Button>
      )}
      id={modalId}
      onCancel={onCancel}
      title={modalTitle}
    >
      <CurrentProgressStep
        className={'__current-progress-step-block'}
        progressData={progressData}
      />
      <TransactionInfoBlock
        className={'__transaction-info-block'}
        progressData={progressData}
      />
      <ProgressStepList
        className={'__progress-step-list'}
        progressData={progressData}
      />
    </SwModal>
  );
};

const TransactionProgressDetailModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-content.ant-sw-modal-content': {
      paddingBottom: 0
    },

    '.ant-sw-modal-body.ant-sw-modal-body': {
      paddingBottom: 0
    },

    '.ant-sw-modal-footer.ant-sw-modal-footer': {
      borderTop: 0
    },

    '.__current-progress-step-block': {
      marginBottom: token.marginSM
    },

    '.__transaction-info-block': {
      marginBottom: token.marginSM
    }
  });
});

export default TransactionProgressDetailModal;
