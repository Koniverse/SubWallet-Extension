// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NumberDisplay } from '@subwallet/extension-koni-ui/components';
import { useGetNativeTokenBasicInfo } from '@subwallet/extension-koni-ui/hooks';
import { GovernanceChainSelectorItemType } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, Logo } from '@subwallet/react-ui';
import { SwNumberProps } from '@subwallet/react-ui/es/number';
import { CheckCircle } from 'phosphor-react';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & GovernanceChainSelectorItemType & {
  onClick?: VoidFunction;
  balanceValue?: SwNumberProps['value'];
  isSelected?: boolean;
};

const Component = ({ balanceValue,
  chainName, chainSlug,
  className, isSelected,
  onClick }: Props): React.ReactElement<Props> => {
  const { symbol } = useGetNativeTokenBasicInfo(chainSlug);

  return (
    <div
      className={className}
      onClick={onClick}
    >
      <Logo
        className='__i-logo'
        isShowSubLogo={false}
        network={chainSlug}
        shape={'circle'}
        size={28}
      />

      <div className='__i-chain-name'>
        {chainName}
      </div>

      <NumberDisplay
        className='__i-balance-value'
        decimal={0}
        decimalOpacity={0.45}
        suffix={symbol}
        value={balanceValue || 0}
      />

      <div className='__i-checked-icon-wrapper'>
        {isSelected && (
          <Icon
            phosphorIcon={CheckCircle}
            size='sm'
            weight='fill'
          />
        )}
      </div>
    </div>
  );
};

export const ChainSelectorItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    minHeight: 52,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgSecondary,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: token.paddingSM,
    paddingRight: token.paddingXXS,
    cursor: 'pointer',

    '.ant-number': {
      '&, .ant-typography': {
        color: 'inherit !important',
        fontSize: 'inherit !important',
        fontWeight: 'inherit !important',
        lineHeight: 'inherit'
      }
    },

    '.__i-logo': {

    },

    '.__i-chain-name': {
      marginInline: token.marginXS,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight1,
      fontWeight: token.headingFontWeight,
      flex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      'white-space': 'nowrap'
    },

    '.__i-balance-value': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight1
    },

    '.__i-checked-icon-wrapper': {
      minWidth: 40,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: token.colorSuccess
    }
  };
});
