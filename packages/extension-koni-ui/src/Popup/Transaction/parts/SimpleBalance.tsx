// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Number, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  label?: string;
  value: string;
  symbol: string;
  hidden?: boolean;
};

const Component = ({ className, hidden, label, symbol, value }: Props) => {
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;

  return (
    <Typography.Paragraph className={CN(className, 'free-balance', {
      hidden: hidden
    })}
    >
      <span className='__label'>
        {label || t('Available balance')}:
      </span>
      <Number
        decimal={0}
        decimalColor={token.colorTextTertiary}
        intColor={token.colorTextTertiary}
        size={14}
        suffix={symbol}
        unitColor={token.colorTextTertiary}
        value={value}
      />
    </Typography.Paragraph>
  );
};

const SimpleBalance = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'flex',
    flexWrap: 'wrap',
    color: token.colorTextTertiary,

    '.__label': {
      marginRight: 3
    },

    '.__label.-hoverable': {
      cursor: 'pointer'
    }
  };
});

export default SimpleBalance;
