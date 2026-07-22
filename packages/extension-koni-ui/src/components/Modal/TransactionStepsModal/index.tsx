// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProcessType } from '@subwallet/extension-base/types';
import { TransactionProcessStepItem, TransactionProcessStepSimpleItem } from '@subwallet/extension-koni-ui/components';
import { TRANSACTION_STEPS_MODAL } from '@subwallet/extension-koni-ui/constants';
import { ThemeProps, TransactionProcessStepItemType } from '@subwallet/extension-koni-ui/types';
import { Button, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export interface TransactionStepsModalProps {
  type: ProcessType;
  items: TransactionProcessStepItemType[];
  variant?: 'standard' | 'simple';
}

type Props = ThemeProps & TransactionStepsModalProps & {
  onCancel: VoidFunction;
};

const modalId = TRANSACTION_STEPS_MODAL;

const Component: FC<Props> = (props: Props) => {
  const { className, items, onCancel, type, variant = 'standard' } = props;
  const { t } = useTranslation();

  const modalTitle = useMemo(() => {
    if (type === ProcessType.SWAP) {
      return t('ui.TRANSACTION.components.Modal.TransactionSteps.swapProcess');
    }

    if (type === ProcessType.EARNING) {
      return t('ui.TRANSACTION.components.Modal.TransactionSteps.stakeProcess');
    }

    return t('ui.TRANSACTION.components.Modal.TransactionSteps.process');
  }, [t, type]);

  const ItemComponent = variant === 'standard' ? TransactionProcessStepItem : TransactionProcessStepSimpleItem;

  return (
    <SwModal
      className={className}
      destroyOnClose={true}
      footer={(
        <Button
          block={true}
          onClick={onCancel}
        >
          {t('ui.TRANSACTION.components.Modal.TransactionSteps.close')}
        </Button>
      )}
      id={modalId}
      onCancel={onCancel}
      title={modalTitle}
    >
      <div className={CN('__list-container', {
        '-for-simple': variant === 'simple',
        '-for-standard': variant === 'standard'
      })}
      >
        {
          items.map((item) => (
            <ItemComponent
              {...item}
              className={CN('__process-step-item', {
                '__process-step-simple-item': variant === 'simple',
                '__process-step-standard-item': variant === 'standard'
              })}
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
    '.ant-sw-modal-body.ant-sw-modal-body': {
      paddingBottom: 0
    },

    '.ant-sw-modal-footer.ant-sw-modal-footer': {
      borderTop: 0
    },

    '.__list-container.-for-standard': {
      padding: '2px 8px'
    },

    '.__list-container.-for-simple': {
      paddingTop: token.padding,
      paddingLeft: token.padding,
      paddingRight: token.padding
    },

    '.__process-step-simple-item': {
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
