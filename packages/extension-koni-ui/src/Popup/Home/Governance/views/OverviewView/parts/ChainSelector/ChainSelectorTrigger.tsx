// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
import { NumberDisplay } from '@subwallet/extension-koni-ui/components';
import { useGetAccountTokenBalance, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, Logo } from '@subwallet/react-ui';
import { CaretDown } from 'phosphor-react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  selectedChain: string;
  onClick: VoidFunction;
};

const Component = ({ className, onClick, selectedChain }: Props): React.ReactElement<Props> => {
  const getAccountTokenBalance = useGetAccountTokenBalance();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);

  const balanceValue = useMemo(() => {
    if (!currentAccountProxy || !chainInfoMap[selectedChain]) {
      return '0';
    }

    const tokenSlug = _getChainNativeTokenSlug(chainInfoMap[selectedChain]);
    const balanceMap = getAccountTokenBalance([tokenSlug], currentAccountProxy.id);

    return balanceMap[tokenSlug]?.total.value || '0';
  }, [chainInfoMap, currentAccountProxy, getAccountTokenBalance, selectedChain]);

  return (
    <div
      className={className}
      onClick={onClick}
    >
      <Logo
        className='__logo'
        isShowSubLogo={false}
        network={selectedChain}
        shape={'circle'}
        size={20}
      />

      <NumberDisplay
        className='__balance-value'
        decimal={0}
        decimalOpacity={0.45}
        value={balanceValue}
      />

      <Icon
        className='__caret'
        customSize={'12px'}
        phosphorIcon={CaretDown}
      />
    </div>
  );
};

export const ChainSelectorTrigger = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    cursor: 'pointer',
    backgroundColor: token.colorBgSecondary,
    borderRadius: 32,
    display: 'flex',
    alignItems: 'center',
    gap: token.sizeXXS,
    paddingInline: token.paddingXS,
    height: 34,

    '.ant-number': {
      '&, .ant-typography': {
        color: 'inherit !important',
        fontSize: 'inherit !important',
        fontWeight: 'inherit !important',
        lineHeight: 'inherit'
      }
    },

    '.__balance-value': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight1
    },

    '.__caret': {
      color: token.colorTextLight4
    }
  };
});
