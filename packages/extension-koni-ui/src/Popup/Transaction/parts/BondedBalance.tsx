// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Number, Typography } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import React from 'react';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  label?: string;
  bondedBalance?: string | number | BigN;
  decimals: number;
  symbol: string;
  maxSlippage?: number;
  isSlippageAcceptable?: boolean;
  isSubnetStaking?: boolean;
};

const Component = ({ bondedBalance, className, decimals, isSlippageAcceptable, isSubnetStaking, label, maxSlippage, symbol }: Props) => {
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;

  return (
    <Typography.Paragraph className={CN(className, 'bonded-balance')}>
      <div className='balance-wrapper'>
        {/* Phần số tiền staked */}
        <div className='balance-value'>
          <Number
            decimal={decimals}
            decimalColor={token.colorTextTertiary}
            intColor={token.colorTextTertiary}
            size={14}
            suffix={symbol}
            unitColor={token.colorTextTertiary}
            value={bondedBalance || 0}
          />
          {label || t('Staked')}
        </div>

        {/* Phần max slippage */}
        {isSubnetStaking && (
          <div className='slippage-info'>
            <span className='slippage-label'>{t('Max slippage')}:</span>
            <span
              className='slippage-value'
              style={{ color: isSlippageAcceptable ? token.colorTextTertiary : token.colorError }}
            >
              {maxSlippage ? (maxSlippage * 100) : 0}%
            </span>
          </div>
        )}
      </div>
    </Typography.Paragraph>
  );
};

const BondedBalance = styled(Component)(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    color: token.colorTextTertiary,

    '&.ant-typography': {
      marginBottom: 0
    },

    '.ant-number': {
      marginRight: '0.3em'
    },

    '.balance-wrapper': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%'
    },

    '.balance-value': {
      display: 'flex',
      alignItems: 'center'
    },

    '.slippage-info': {
      display: 'flex',
      alignItems: 'center'
    },

    '.slippage-label': {
      marginRight: token.sizeXS
    }
  });
});

export default BondedBalance;
