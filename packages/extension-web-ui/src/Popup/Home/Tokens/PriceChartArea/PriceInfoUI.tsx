// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NumberDisplay } from '@subwallet/extension-web-ui/components';
import { useSelector } from '@subwallet/extension-web-ui/hooks';
import { PriceInfoUIProps } from '@subwallet/extension-web-ui/Popup/Home/Tokens/PriceChartArea/types';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Tag } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & PriceInfoUIProps;

const Component: React.FC<Props> = (props: Props) => {
  const { change,
    className,
    isPriceDown,
    percent, value } = props;
  const { currencyData } = useSelector((state) => state.price);

  return (
    <div className={className}>
      <div
        className='__price-value-wrapper'
      >
        <div className={CN('__price-symbol')}>
          {currencyData.symbol}
        </div>
        <NumberDisplay
          className={'__price-value'}
          decimal={0}
          decimalOpacity={0.45}
          size={38}
          subFloatNumber
          value={value}
        />
      </div>

      <div className='__price-change-container'>
        <NumberDisplay
          className={'__price-change-value'}
          decimal={0}
          decimalOpacity={1}
          prefix={`${isPriceDown ? '-' : '+'} ${(currencyData.isPrefix && currencyData.symbol) || ''}`}
          suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
          value={change}
        />

        <Tag
          className={CN('__price-change-percent', {
            '-decrease': isPriceDown
          })}
          shape={'round'}
        >
          <NumberDisplay
            decimal={0}
            decimalOpacity={1}
            prefix={isPriceDown ? '-' : '+'}
            suffix={'%'}
            value={percent}
            weight={700}
          />
        </Tag>
      </div>
    </div>
  );
};

export const PriceInfoUI = styled(Component)<ThemeProps>(({ theme: { token } }: ThemeProps) => ({
  paddingLeft: token.padding,
  paddingRight: token.padding,
  alignItems: 'center',

  '.__price-value-wrapper': {
    display: 'flex',
    justifyContent: 'center',
    width: 'fit-content',
    margin: 'auto',
    marginBottom: token.marginXXS
  },

  '.__price-symbol': {
    marginRight: token.marginXXS,
    fontSize: token.fontSizeHeading5,
    lineHeight: token.lineHeightHeading5,
    fontWeight: token.headingFontWeight
  },

  '.__price-value': {
    textAlign: 'center',
    fontWeight: token.headingFontWeight,
    lineHeight: token.lineHeightHeading1,
    fontSize: token.fontSizeHeading1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',

    '.ant-typography': {
      lineHeight: 'inherit',
      fontWeight: 'inherit !important'
    }
  },

  '.__price-change-container': {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: token.sizeXS,

    '.ant-typography': {
      lineHeight: 'inherit',
      color: 'inherit !important',
      fontSize: 'inherit !important'
    }
  },

  '.__price-change-value': {
    color: token.colorTextLight1,
    lineHeight: token.lineHeight
  },

  '.__price-change-percent': {
    backgroundColor: token['cyan-6'],
    color: token['green-1'],
    marginInlineEnd: 0,
    display: 'flex',

    '&.-decrease': {
      backgroundColor: token.colorError,
      color: token.colorTextLight1
    },

    '.ant-number': {
      fontSize: token.fontSizeXS
    }
  }
}));
