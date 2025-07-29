// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NumberDisplay } from '@subwallet/extension-web-ui/components';
import { useSelector } from '@subwallet/extension-web-ui/hooks';
import useTranslation from '@subwallet/extension-web-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Icon } from '@subwallet/react-ui';
import { ChartLineUp } from 'phosphor-react';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;
  const { currencyData } = useSelector((state) => state.price);
  const { t } = useTranslation();

  return (
    <div className={className}>
      <div className='__price-value-wrapper'>
        <NumberDisplay
          className={'__price-value'}
          decimal={0}
          prefix={`${currencyData.symbol} `}
          size={30}
          value={0}
        />
      </div>

      <div className={'__price-data-unavailable-block'}>
        <div className='__price-data-unavailable-block-icon'>
          <Icon
            customSize={'64px'}
            phosphorIcon={ChartLineUp}
          />
        </div>

        <div className='__price-data-unavailable-block-title'>
          {t('No chart data available')}
        </div>

        <div className='__price-data-unavailable-block-description'>
          {t('This token is not listed or does not have market data on Coingecko at the moment')}
        </div>
      </div>
    </div>
  );
};

export const NotSupportedContent = styled(Component)<ThemeProps>(({ theme: { token } }: ThemeProps) => ({
  textAlign: 'center',

  '.__price-value-wrapper': {
    display: 'flex',
    height: 64,
    alignItems: 'center',
    marginBottom: 28
  },

  '.__price-value': {
    fontWeight: token.headingFontWeight,
    lineHeight: token.lineHeightHeading2,
    fontSize: token.fontSizeHeading2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',

    '.ant-typography': {
      lineHeight: 'inherit',
      fontWeight: 'inherit !important'
    }
  },

  '.__price-data-unavailable-block': {
    paddingTop: 40
  },

  '.__price-data-unavailable-block-icon': {
    width: 112,
    height: 112,
    borderRadius: '100%',
    backgroundColor: 'rgba(115, 115, 115, 0.1)',
    color: token['gray-4'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    marginInline: 'auto'
  },

  '.__price-data-unavailable-block-title': {
    fontSize: token.fontSizeHeading5,
    lineHeight: token.lineHeightHeading5,
    color: token.colorTextLight2,
    marginBottom: token.marginSM
  },

  '.__price-data-unavailable-block-description': {
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    color: token.colorTextLight3
  }
}));
