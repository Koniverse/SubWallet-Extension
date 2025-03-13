// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProcessType } from '@subwallet/extension-base/types';
import { ProcessStepItem, ProcessStepItemType } from '@subwallet/extension-koni-ui/components';
import { TRANSACTION_STEPS_MODAL } from '@subwallet/extension-koni-ui/constants';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, SwModal } from '@subwallet/react-ui';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export interface TransactionStepsModalProps {
  type: ProcessType;
  items: ProcessStepItemType[]
}

type Props = ThemeProps & TransactionStepsModalProps & {
  onCancel: VoidFunction;
};

const modalId = TRANSACTION_STEPS_MODAL;

const Component: FC<Props> = (props: Props) => {
  const { className, items, onCancel, type } = props;
  const { t } = useTranslation();

  const modalTitle = useMemo(() => {
    if (type === ProcessType.SWAP) {
      return t('Swap process');
    }

    if (type === ProcessType.EARNING) {
      return t('Stake process');
    }

    return t('Process');
  }, [t, type]);

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
      <div className='__list-container'>
        {
          items.map((item) => (
            <ProcessStepItem
              {...item}
              className={'__process-step-item'}
              key={item.index}
            />
          ))
        }
      </div>
    </SwModal>
  );
};

const TransactionStepsModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
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

    '.__list-container': {
      paddingTop: token.padding,
      paddingLeft: token.padding,
      paddingRight: token.padding
    },

    '.__process-step-item': {
      '.__line': {
        marginTop: 4,
        marginBottom: 4
      },

      '.__item-right-part': {
        paddingBottom: 12
      }
    }
  });
});

export default TransactionStepsModal;
