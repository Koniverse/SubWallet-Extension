// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LoadingScreen } from '@subwallet/extension-web-ui/components';
import { CREATE_RETURN, DEFAULT_ROUTER_PATH, DEFAULT_SWAP_PARAMS, SELL_TOKEN_TAB, SWAP_PATH, SWAP_TRANSACTION } from '@subwallet/extension-web-ui/constants';
import { useSelector } from '@subwallet/extension-web-ui/hooks';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { getTransactionFromAccountProxyValue } from '@subwallet/extension-web-ui/utils';
import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps;

const Component: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const isNoAccount = useSelector((state) => state.accountState.isNoAccount);
  const [, setReturnStorage] = useLocalStorage(CREATE_RETURN, DEFAULT_ROUTER_PATH);
  const [, setSwapStorage] = useLocalStorage(SWAP_TRANSACTION, DEFAULT_SWAP_PARAMS);
  const [, setBuyTokenModalTab] = useLocalStorage(SELL_TOKEN_TAB, '');
  const currentAccountProxy = useSelector((root) => root.accountState.currentAccountProxy);
  const { feature } = useParams();

  const transactionFromAccountProxyValue = useMemo(() => {
    return getTransactionFromAccountProxyValue(currentAccountProxy);
  }, [currentAccountProxy]);

  useEffect(() => {
    if (feature === 'swap') {
      if (isNoAccount) {
        setReturnStorage(SWAP_PATH);
        navigate(DEFAULT_ROUTER_PATH);
      } else {
        setSwapStorage({
          ...DEFAULT_SWAP_PARAMS,
          fromAccountProxy: transactionFromAccountProxyValue
        });
        navigate(SWAP_PATH);
      }
    } else if (feature === 'sell-token') {
      if (isNoAccount) {
        setReturnStorage('/home/tokens?openBuyTokens=true');
        navigate(DEFAULT_ROUTER_PATH);
      } else {
        setBuyTokenModalTab('SELL');
        navigate('/home/tokens?openBuyTokens=true');
      }
    }
  }, [feature, isNoAccount, navigate, setReturnStorage, setBuyTokenModalTab, setSwapStorage, transactionFromAccountProxyValue]);

  return (
    <LoadingScreen />
  );
};

const RedirectHandler = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
  };
});

export default RedirectHandler;
