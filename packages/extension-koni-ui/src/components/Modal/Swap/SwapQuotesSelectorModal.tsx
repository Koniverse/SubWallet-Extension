// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SwapQuote } from '@subwallet/extension-base/types/swap';
import SwapQuotesItem from '@subwallet/extension-koni-ui/components/Field/Swap/SwapQuotesItem';
import { QuoteResetTime } from '@subwallet/extension-koni-ui/components/Swap';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  modalId: string,
  items: SwapQuote[],
  applyQuote: (quote: SwapQuote) => Promise<void>,
  selectedItem?: SwapQuote,
  onCancel: VoidFunction;
  quoteAliveUntil: number | undefined;
  disableConfirmButton?: boolean;
}

const Component: React.FC<Props> = (props: Props) => {
  const { applyQuote, className, disableConfirmButton, items, modalId, onCancel, quoteAliveUntil, selectedItem } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [currentQuote, setCurrentQuote] = useState<SwapQuote | undefined>(selectedItem);

  const { t } = useTranslation();

  const onSelectItem = useCallback((quote: SwapQuote) => {
    setCurrentQuote(quote);
  }, []);

  const handleApplySlippage = useCallback(() => {
    const quoteResult = items.find((i) => i.provider.id === currentQuote?.provider.id);

    // refresh selected quote before passing it to outside
    if (quoteResult) {
      setLoading(true);
      applyQuote(quoteResult).catch((error) => {
        console.error('Error when confirm swap quote:', error);
      }).finally(() => {
        onCancel();
        setLoading(false);
      });
    }
  }, [items, currentQuote?.provider.id, applyQuote, onCancel]);

  useEffect(() => {
    if (items.length) {
      if (currentQuote && selectedItem && !items.some((i) => i.provider.id === currentQuote.provider.id)) {
        setCurrentQuote(selectedItem);
      }
    }
  }, [currentQuote, items, selectedItem]);

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
              disabled={disableConfirmButton || !currentQuote || items.length < 2}
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
        title={(
          <>
            <span className={'__modal-title'}>
              {t('ui.Modal.Swap.QuotesSelector.selectProvider')}
            </span>

            <QuoteResetTime
              className={'__reset-time'}
              quoteAliveUntilValue = {quoteAliveUntil}
            />
          </>
        )}
      >
        {items.map((item, index) => (
          <SwapQuotesItem
            className={'__swap-quote-Item'}
            isRecommend={index === 0}
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

    '.ant-sw-header-left-part': {
      position: 'relative',
      zIndex: 1
    },

    '.ant-sw-header-center-part': {
      width: 'auto'
    },

    '.__swap-quote-Item + .__swap-quote-Item': {
      marginTop: token.marginXS
    },

    '.__modal-title': {
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4
    },

    '.__reset-time': {
      position: 'absolute',
      width: 67,
      right: 0,
      top: 0,
      bottom: 0,
      maxHeight: 20,
      gap: token.sizeXXS,
      display: 'flex',
      alignItems: 'center',
      marginTop: 'auto',
      marginBottom: 'auto'
    },

    '.__reset-time-icon': {
      fontSize: 16
    },

    '.__reset-time-text': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM
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
