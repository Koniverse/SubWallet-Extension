// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProcessType } from '@subwallet/extension-base/types';
import { TransactionProcessPreview } from '@subwallet/extension-koni-ui/components';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { TransactionProcessStepItemType } from '@subwallet/extension-koni-ui/types';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretRight } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { InfoItemBase } from './types';

export interface TransactionProcessItemType extends Omit<InfoItemBase, 'value'> {
  items: TransactionProcessStepItemType[];
  processChains?: string[];
  type: ProcessType;
}

const Component: React.FC<TransactionProcessItemType> = (props: TransactionProcessItemType) => {
  const { className, items, label, processChains, type } = props;
  const { transactionStepsModal } = useContext(WalletModalContext);

  const { t } = useTranslation();

  const onOpenModal = useCallback(() => {
    transactionStepsModal.open({
      items,
      type
    });
  }, [items, transactionStepsModal, type]);

  const defaultLabel = useMemo(() => {
    return t('ui.components.MetaInfo.TransactionProcessItem.process');
  }, [t]);

  const stepText = useMemo(() => {
    const stepCount = items.length;
    const text = stepCount > 1 ? '{{stepCount}} steps' : '{{stepCount}} step';

    return t(text, { replace: { stepCount: stepCount } });
  }, [items.length, t]);

  return (
    <div className={CN(className, '__row -type-transaction-process}')}>
      <div className={'__col __label-col'}>
        <div className={'__label'}>
          {label || defaultLabel}
        </div>
      </div>
      <div className={'__col __value-col -to-right'}>
        <div
          className={CN('__steps-modal-trigger', {
            '-mode-1': processChains,
            '-mode-2': !processChains
          })}
          onClick={onOpenModal}
        >
          {
            processChains
              ? (
                <TransactionProcessPreview chains={processChains} />
              )
              : (
                <span className='__steps-modal-trigger-text'>
                  {stepText}
                </span>
              )
          }

          <Icon
            className='__steps-modal-trigger-arrow-icon'
            customSize={'16px'}
            phosphorIcon={CaretRight}
          />
        </div>
      </div>
    </div>
  );
};

const TransactionProcessItem = styled(Component)<TransactionProcessItemType>(({ theme: { token } }: TransactionProcessItemType) => {
  return {
    '.__steps-modal-trigger': {
      display: 'flex',
      gap: token.sizeXXS,
      alignItems: 'center',
      cursor: 'pointer'
    },

    '.__steps-modal-trigger.-mode-2': {
      backgroundColor: token.colorTextLight8,
      borderRadius: 20,
      padding: '8px 8px 8px 16px'
    },

    '.__steps-modal-trigger-text': {
      color: token.colorTextLight1
    },
    '.__steps-modal-trigger-arrow-icon': {
      color: token.colorTextLight3
    }
  };
});

export default TransactionProcessItem;
