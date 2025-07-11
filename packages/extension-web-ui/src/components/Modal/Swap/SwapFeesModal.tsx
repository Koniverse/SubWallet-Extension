// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CommonFeeComponent, SwapFeeType, SwapQuote } from '@subwallet/extension-base/types';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { BaseModal, MetaInfo } from '@subwallet/extension-web-ui/components';
import { BN_TEN, BN_ZERO, SWAP_FEES_MODAL } from '@subwallet/extension-web-ui/constants';
import { useSelector } from '@subwallet/extension-web-ui/hooks';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Button, Icon, Tooltip } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { t } from 'i18next';
import { Info } from 'phosphor-react';
import React, { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export interface SwapFeesModalProps {
  currentQuote: SwapQuote;
  estimatedFeeValue: BigN;
}

type Props = ThemeProps & SwapFeesModalProps & {
  onCancel: VoidFunction;
};

interface FeeItem {
  value: BigN,
  type: SwapFeeType,
  label: string,
  prefix?: string,
  suffix?: string,
  tooltip?: string
}

const defaultTooltipMap: Record<SwapFeeType, (percentage?: number) => string> = {
  [SwapFeeType.PLATFORM_FEE]: () => detectTranslate('Fee paid to third-party providers to facilitate the swap. It is not paid to SubWallet'),
  [SwapFeeType.NETWORK_FEE]: () => detectTranslate('Fee paid to process your transaction on the blockchain. It is not paid to SubWallet'),
  [SwapFeeType.WALLET_FEE]: (percentage?: number) => {
    if (!percentage) {
      return detectTranslate('Fee charged by SubWallet, which is automatically factored into this quote');
    } else {
      const message = detectTranslate('A fee of {{percentage}}% is automatically factored into this quote');

      return t(message, { replace: { percentage: percentage } });
    }
  }
};

const modalId = SWAP_FEES_MODAL;

const Component: FC<Props> = (props: Props) => {
  const { className, currentQuote, estimatedFeeValue, onCancel } = props;
  const { currencyData, priceMap } = useSelector((state) => state.price);
  const assetRegistryMap = useSelector((state) => state.assetRegistry.assetRegistry);

  const { t } = useTranslation();

  const getConvertedBalance = useCallback((feeItem: CommonFeeComponent) => {
    const asset = assetRegistryMap[feeItem.tokenSlug];

    if (asset) {
      const { decimals, priceId } = asset;
      const price = priceMap[priceId || ''] || 0;

      return new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price);
    }

    return BN_ZERO;
  }, [assetRegistryMap, priceMap]);

  const feeItems = useMemo(() => {
    const result: FeeItem[] = [];

    const feeConfigs = [
      { type: SwapFeeType.NETWORK_FEE, label: t('Network fee'), getTooltip: () => defaultTooltipMap[SwapFeeType.NETWORK_FEE]() },
      { type: SwapFeeType.PLATFORM_FEE, label: t('Provider fee'), getTooltip: () => defaultTooltipMap[SwapFeeType.PLATFORM_FEE]() },
      { type: SwapFeeType.WALLET_FEE, label: t('SubWallet fee'), getTooltip: (percentage?: number) => defaultTooltipMap[SwapFeeType.WALLET_FEE](percentage) }
    ];

    const createFeeItem = (
      type: SwapFeeType,
      label: string,
      getTooltip: (percentage?: number) => string,
      percentage?: number
    ): FeeItem => ({
      label,
      value: new BigN(0),
      prefix: currencyData.isPrefix ? currencyData.symbol : '',
      suffix: !currencyData.isPrefix ? currencyData.symbol : '',
      type,
      tooltip: getTooltip(percentage)
    });

    const activeFeeTypes = new Set(currentQuote?.feeInfo?.feeComponent?.map((item) => item.feeType) ?? []);

    const feeTypeMap: Record<SwapFeeType, FeeItem> = feeConfigs
      .filter((config) => activeFeeTypes.has(config.type))
      .reduce((map, { getTooltip, label, type }) => ({
        ...map,
        [type]: createFeeItem(type, label, getTooltip)
      }), {} as Record<SwapFeeType, FeeItem>);

    currentQuote?.feeInfo.feeComponent.forEach((feeItem) => {
      const { feeType, percentage } = feeItem;

      feeTypeMap[feeType].value = feeTypeMap[feeType].value.plus(getConvertedBalance(feeItem));

      if (feeType === SwapFeeType.WALLET_FEE) {
        feeTypeMap[feeType].tooltip = defaultTooltipMap[feeType](percentage);
      }
    });

    Object.values(feeTypeMap).forEach((fee) => {
      if (!fee.value.lt(new BigN(0))) {
        result.push(fee);
      }
    });

    return result;
  }, [currencyData.isPrefix, currencyData.symbol, currentQuote?.feeInfo.feeComponent, getConvertedBalance, t]);

  return (
    <BaseModal
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
      title={t('Swap fees')}
    >
      <MetaInfo
        className={'__quote-info-block'}
        hasBackgroundWrapper={true}
        labelColorScheme={'gray'}
        labelFontWeight={'regular'}
        spaceSize={'ms'}
        valueColorScheme={'light'}
      >
        <div className={CN('__list-container')}>
          <div className={'__quote-fee-details-block'}>
            {feeItems.map((item) => (
              <MetaInfo.Number
                decimals={0}
                key={item.type}
                label={
                  <Tooltip
                    placement={'topRight'}
                    title={t(item.tooltip || '')}
                  >
                    <div className={ '__label-wrapper'}>
                      <div>{t(item.label)}</div>
                      {
                        !!item.tooltip && (
                          <Icon
                            className={'__info-icon'}
                            phosphorIcon={Info}
                          />
                        )
                      }
                    </div>
                  </Tooltip>
                }
                prefix={item.prefix}
                suffix={item.suffix}
                useNumberDisplay={true}
                value={item.value}
              />
            ))}
          </div>
          <div className='__separator'></div>
          <MetaInfo.Number
            className={'__total-fee-value'}
            decimals={0}
            label={t('Estimated total fee')}
            prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
            suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
            useNumberDisplay={true}
            value={estimatedFeeValue}
          />
        </div>
      </MetaInfo>
    </BaseModal>
  );
};

const SwapFeesModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-body.ant-sw-modal-body': {
      paddingBottom: 8
    },

    '.ant-sw-modal-footer.ant-sw-modal-footer': {
      borderTop: 0
    },

    '.__quote-fee-details-block, .__total-fee-value': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.bodyFontWeight,
      color: token.colorWhite,

      '.ant-number-integer': {
        color: `${token.colorWhite} !important`,
        fontSize: 'inherit !important',
        fontWeight: 'inherit !important',
        lineHeight: 'inherit'
      },

      '.ant-number-decimal, .ant-number-prefix': {
        color: `${token.colorWhite} !important`,
        fontSize: `${token.fontSize}px !important`,
        fontWeight: 'inherit !important',
        lineHeight: token.colorTextLight2
      }
    },

    '.__separator': {
      height: 2,
      backgroundColor: 'rgba(33, 33, 33, 0.80)',
      marginTop: token.margin,
      marginBottom: token.margin
    },

    '.__label-wrapper': {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  });
});

export default SwapFeesModal;
