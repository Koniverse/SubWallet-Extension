// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NumberDisplay } from '@subwallet/extension-web-ui/components';
import { useSelector } from '@subwallet/extension-web-ui/hooks';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Tag } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

import { PriceInfoUIProps } from './types';

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
        <NumberDisplay
          className={'__price-value'}
          decimal={0}
          prefix={`${currencyData.symbol} `}
          size={30}
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

  '.__price-value-wrapper': {
    display: 'flex',
    marginBottom: token.marginXXS
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

  '.__price-change-container': {
    display: 'flex',
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
