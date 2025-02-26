// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SwapQuote } from '@subwallet/extension-base/types/swap';
import SwapQuotesItem from '@subwallet/extension-koni-ui/components/Field/Swap/SwapQuotesItem';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  modalId: string,
  items: SwapQuote[],
  loading: boolean,
  onSelectItem: (quote: SwapQuote) => void;
  onConfirmationItem: (quote: SwapQuote) => Promise<void>;
  selectedItem?: SwapQuote,
  optimalQuoteItem?: SwapQuote
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, items, loading, modalId, onConfirmationItem, onSelectItem, optimalQuoteItem, selectedItem } = props;

  const { inactiveModal } = useContext(ModalContext);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal, modalId]);

  const handleApplySlippage = useCallback(() => {
    if (selectedItem) {
      onConfirmationItem(selectedItem).catch((error) => {
        console.error('Error when confirm swap quote:', error);
      });
    }
  }, [onConfirmationItem, selectedItem]);

  return (
    <>
      <SwModal
        className={CN(className, 'swap-quotes-selector-container')}
        closable={true}
        destroyOnClose={true}
        footer={
          <>
            <Button
              block={true}
              className={'__right-button'}
              icon={(
                <Icon
                  phosphorIcon={CheckCircle}
                  weight={'fill'}
                />
              )}
              loading={loading}
              onClick={handleApplySlippage}
            >
              {'Confirm'}
            </Button>
          </>
        }
        id={modalId}
        onCancel={onCancel}
        title={'Swap quotes'}
      >
        {items.map((item) => (
          <SwapQuotesItem
            isRecommend={optimalQuoteItem?.provider.id === item.provider.id}
            key={item.provider.id}
            onSelect={onSelectItem}
            quote={item}
            selected={selectedItem?.provider.id === item.provider.id}
          />
        ))}
      </SwModal>
    </>
  );
};

const SwapQuotesSelectorModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-input-container': {
      backgroundColor: token.colorBgInput
    },
    '.ant-form-item': {
      marginBottom: 0
    },
    '.ant-btn-ghost': {
      color: token.colorWhite
    },
    '.ant-btn-ghost:hover': {
      color: token['gray-6']
    },
    '.ant-sw-modal-footer': {
      borderTop: 0
    }
  };
});

export default SwapQuotesSelectorModal;
