// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SwapQuote } from '@subwallet/extension-base/types/swap';
import SwapQuotesItem from '@subwallet/extension-koni-ui/components/Field/Swap/SwapQuotesItem';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  modalId: string,
  items: SwapQuote[],
  onConfirmItem: (quote: SwapQuote) => Promise<void>;
  selectedItem?: SwapQuote,
  optimalQuoteItem?: SwapQuote
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, items, modalId, onConfirmItem, optimalQuoteItem, selectedItem } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [currentQuote, setCurrentQuote] = useState<SwapQuote | undefined>(selectedItem);

  const { inactiveModal } = useContext(ModalContext);

  const onSelectItem = useCallback((quote: SwapQuote) => {
    setCurrentQuote(quote);
  }, []);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal, modalId]);

  const handleApplySlippage = useCallback(() => {
    if (currentQuote) {
      setLoading(true);
      onConfirmItem(currentQuote).catch((error) => {
        console.error('Error when confirm swap quote:', error);
      }).finally(() => {
        onCancel();
        setLoading(false);
      });
    }
  }, [currentQuote, onConfirmItem, onCancel]);

  return (
    <>
      <SwModal
        className={CN(className, 'swap-quotes-selector-container')}
        closable={!loading}
        destroyOnClose={true}
        footer={
          <>
            <Button
              block={true}
              className={'__right-button'}
              disabled={!currentQuote}
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
        maskClosable={!loading}
        onCancel={onCancel}
        title={'Swap quotes'}
      >
        {items.map((item) => (
          <SwapQuotesItem
            className={'__swap-quote-Item'}
            isRecommend={optimalQuoteItem?.provider.id === item.provider.id}
            key={item.provider.id}
            onSelect={onSelectItem}
            quote={item}
            selected={currentQuote?.provider.id === item.provider.id}
          />
        ))}
      </SwModal>
    </>
  );
};

const SwapQuotesSelectorModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-body.ant-sw-modal-body': {
      paddingBottom: 0
    },

    '.__swap-quote-Item + .__swap-quote-Item': {
      marginTop: token.marginXS
    },

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
