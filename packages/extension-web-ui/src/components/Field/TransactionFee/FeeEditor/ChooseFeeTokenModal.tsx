// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _AssetType } from '@subwallet/chain-list/types';
import { TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';
import { swapCustomFormatter } from '@subwallet/extension-base/utils';
import { BaseModal } from '@subwallet/extension-web-ui/components';
import ChooseFeeItem from '@subwallet/extension-web-ui/components/Field/TransactionFee/FeeEditor/ChooseFeeItem';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { ModalContext, Number } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import React, { useCallback, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

type Props = ThemeProps & {
  modalId: string,
  estimateFee: string | number | BigN,
  convertedFeeValueToUSD: string | number | BigN,
  items: TokenHasBalanceInfo[] | undefined,
  onSelectItem: (slug: string) => void,
  selectedItem?: string,
  nativeTokenDecimals: number,
  tokenSlug: string,
  feePercentageSpecialCase?: number
}

interface TokenWithFeeInfo extends TokenHasBalanceInfo {
  isDisableItem: boolean;
  convertedAmountToPay: BigN;
}

const numberMetadata = { maxNumberFormat: 8 };

// TODO: Merge this component with ChooseFeeTokenModal in Swap.
const Component: React.FC<Props> = (props: Props) => {
  const { className, convertedFeeValueToUSD, estimateFee, feePercentageSpecialCase, items, modalId, onSelectItem: _onSelectItem, selectedItem, tokenSlug } = props;
  const { currencyData } = useSelector((state: RootState) => state.price);
  const { inactiveModal } = useContext(ModalContext);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal, modalId]);

  const estimateFeeSpecial = useMemo(() => {
    return feePercentageSpecialCase && !tokenSlug.includes(_AssetType.NATIVE) ? (new BigN(estimateFee).multipliedBy(feePercentageSpecialCase).div(100)).toString() : estimateFee;
  }, [estimateFee, feePercentageSpecialCase, tokenSlug]);

  const tokensWithFeeInfo: TokenWithFeeInfo[] | undefined = useMemo(() => {
    if (!items) {
      return undefined;
    }

    const processedItems = items.map((item) => {
      const { free: balance, rate, slug } = item;
      const estimatedFeeValue = slug !== tokenSlug ? estimateFee : estimateFeeSpecial;
      const convertedAmountToPay = new BigN(estimatedFeeValue).multipliedBy(rate).integerValue(BigN.ROUND_UP);

      const isDisableItem = !convertedAmountToPay || convertedAmountToPay.lte(0) || new BigN(balance).lt(convertedAmountToPay);

      return { ...item, isDisableItem, convertedAmountToPay };
    });

    return processedItems.sort((a, b) => {
      return (a.isDisableItem ? 1 : 0) - (b.isDisableItem ? 1 : 0);
    });
  }, [estimateFee, estimateFeeSpecial, items, tokenSlug]);

  const onSelectItem = useCallback((slug: string): void => {
    _onSelectItem(slug);
    inactiveModal(modalId);
  }, [_onSelectItem, inactiveModal, modalId]);

  return (
    <>
      <BaseModal
        className={CN(className, 'choose-fee-token-container')}
        closable={true}
        destroyOnClose={true}
        id={modalId}
        onCancel={onCancel}
        title={'Select token to pay fee'}
      >
        <div className={'__choose-fee-wrapper'}>
          <div className={'__estimate-fee'}>
            <span className={'__title'}>Estimated  fee</span>
            <Number
              className={'__value'}
              customFormatter={swapCustomFormatter}
              decimal={0}
              decimalOpacity={0.45}
              formatType={'custom'}
              metadata={numberMetadata}
              prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
              size={30}
              suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
              value={convertedFeeValueToUSD}
            />
            <span className={'__pay-with'}>Pay with:</span>
          </div>
          {tokensWithFeeInfo && tokensWithFeeInfo.map((item, index) => (
            <ChooseFeeItem
              amountToPay={item.convertedAmountToPay}
              balance={item?.free}
              isDisable={item.isDisableItem}
              key={`${item.slug}-${index}`}
              onSelect={onSelectItem}
              selected={selectedItem === item.slug}
              slug={item.slug}
            />
          ))}
        </div>
      </BaseModal>
    </>
  );
};

const ChooseFeeTokenModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__estimate-fee': {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24
    },
    '.__title': {
      fontSize: 14,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight,
      color: token.colorTextTertiary
    },
    '.__pay-with': {
      fontSize: 14,
      fontWeight: token.fontWeightStrong,
      lineHeight: token.lineHeight,
      color: token.colorTextTertiary
    },
    '.__value': {
      fontSize: token.fontSizeHeading2,
      lineHeight: token.lineHeightHeading2,
      fontWeight: token.fontWeightStrong,
      color: token.colorTextLight1,

      '.ant-number-integer, ant-number-prefix': {
        color: 'inherit !important',
        fontSize: 'inherit !important',
        fontWeight: `${token.fontWeightStrong}px !important`,
        lineHeight: 'inherit'
      },

      '.ant-number-decimal': {
        color: `${token.colorTextLight3} !important`,
        fontSize: `${token.fontSizeHeading3}px !important`,
        fontWeight: 'inherit !important',
        lineHeight: token.lineHeightHeading3
      }
    }

  };
});

export default ChooseFeeTokenModal;
