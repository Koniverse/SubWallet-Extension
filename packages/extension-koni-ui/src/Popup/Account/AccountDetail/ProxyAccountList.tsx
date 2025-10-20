// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { UNSUPPORTED_PROXY_NETWORKS } from '@subwallet/extension-base/services/proxy-service/constant';
import { AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { ProxyItem, ProxyType } from '@subwallet/extension-base/types/proxy';
import { BasicInputEvent, ChainSelector, EmptyList, ProxyAccountSelectorItem, ProxyItemExtended } from '@subwallet/extension-koni-ui/components';
import { ADD_PROXY_TRANSACTION, DEFAULT_ADD_PROXY_PARAMS } from '@subwallet/extension-koni-ui/constants';
import { useChainChecker, useGetChainAndExcludedTokenByCurrentAccountProxy, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { getProxyAccounts } from '@subwallet/extension-koni-ui/messaging/transaction/proxy';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { AddProxyParams, ChainItemType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ActivityIndicator, Button, Icon, SwList } from '@subwallet/react-ui';
import CN from 'classnames';
import { ListChecks, TreeStructure } from 'phosphor-react';
import React, { Context, Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeContext } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

export interface ProxyItemSelector extends ProxyItemExtended {
  isSelected: boolean;
}

type Props = ThemeProps & {
  accountProxy: AccountProxy;
  address: string;
  setProxyAccountsSelected: Dispatch<SetStateAction<Record<string, ProxyItemSelector>>>;
  proxyAccountsSelected: Record<string, ProxyItemSelector>;
  setNetworkSelected: Dispatch<SetStateAction<string>>;
  networkSelected: string;
};

const getKey = (address: string, proxyType: ProxyType) => address + '_' + proxyType;

function Component ({ accountProxy, address: addressFormated, className, networkSelected, proxyAccountsSelected, setNetworkSelected, setProxyAccountsSelected }: Props) {
  const { t } = useTranslation();
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { allowedChains } = useGetChainAndExcludedTokenByCurrentAccountProxy();
  const [, setAddProxyParamsStorage] = useLocalStorage<AddProxyParams>(ADD_PROXY_TRANSACTION, DEFAULT_ADD_PROXY_PARAMS);
  const navigate = useNavigate();
  const checkChain = useChainChecker();
  const [loading, setLoading] = useState(false);

  const chainItems = useMemo<ChainItemType[]>(() => {
    const result: ChainItemType[] = [];

    Object.values(chainInfoMap).forEach((c) => {
      if (c.substrateInfo !== null && allowedChains.includes(c.slug) && !UNSUPPORTED_PROXY_NETWORKS.includes(c.slug)) {
        result.push({
          name: c.name,
          slug: c.slug
        });
      }
    });

    return result;
  }, [allowedChains, chainInfoMap]);

  const onAddProxyAccount = useCallback(() => {
    if (!addressFormated) {
      return;
    }

    setAddProxyParamsStorage({
      ...DEFAULT_ADD_PROXY_PARAMS,
      chain: networkSelected,
      from: addressFormated
    });

    navigate('/transaction/add-proxy');
  }, [addressFormated, navigate, networkSelected, setAddProxyParamsStorage]);

  const renderEmpty = useCallback(() => {
    return (
      <div className={'__empty-proxy-account-list'}>
        <EmptyList
          emptyMessage={t('Set up your proxy accounts now!')}
          emptyTitle={t('No proxies found')}
          phosphorIcon={ListChecks}
        />

        <Button
          className={CN('__add-proxy-button')}
          disabled={accountProxy.accountType === AccountProxyType.READ_ONLY}
          icon={(
            <Icon
              customSize={'20px'}
              phosphorIcon={TreeStructure}
              weight='fill'
            />
          )}
          onClick={onAddProxyAccount}
          schema='primary'
          shape={'round'}
        >
          {t('Add proxy')}
        </Button>
      </div>

    );
  }, [accountProxy.accountType, onAddProxyAccount, t]);

  const onSelectProxyAccount = useCallback((item: ProxyItem) => {
    return () => {
      const key = getKey(item.proxyAddress, item.proxyType);

      setProxyAccountsSelected((prev) =>
        (
          { ...prev, [key]: { ...item, isSelected: !prev[key]?.isSelected } }
        )
      );
    };
  }, [setProxyAccountsSelected]);

  const renderItem = useCallback(
    (item: ProxyItem) => {
      const key = getKey(item.proxyAddress, item.proxyType);

      return (
        <ProxyAccountSelectorItem
          className={'__proxy-account-item'}
          isSelected={!!proxyAccountsSelected[key]?.isSelected}
          key={key}
          onClick={onSelectProxyAccount(item)}
          proxyAccount={item}
          showCheckedIcon={accountProxy.accountType !== AccountProxyType.READ_ONLY}
          showUnselectIcon
        />
      );
    },
    [accountProxy.accountType, onSelectProxyAccount, proxyAccountsSelected]);

  const onSelectNetwork = useCallback((event: BasicInputEvent) => {
    const newNetworkSelected = event.target.value;

    setNetworkSelected(
      (prevState) => {
        if (prevState !== newNetworkSelected) {
          checkChain(networkSelected);
          setProxyAccountsSelected({});

          return newNetworkSelected;
        }

        return prevState;
      }
    );
  }, [checkChain, networkSelected, setNetworkSelected, setProxyAccountsSelected]);

  useEffect(() => {
    if (addressFormated) {
      setLoading(true);
      getProxyAccounts({
        chain: networkSelected,
        address: addressFormated
      })
        .then(({ proxies }) => {
          setProxyAccountsSelected((prev) => {
            const newSelected: Record<string, ProxyItemSelector> = {};

            proxies.forEach((p) => {
              const key = getKey(p.proxyAddress, p.proxyType);

              newSelected[key] = { ...p, isSelected: !!prev[key]?.isSelected };
            });

            return newSelected;
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [addressFormated, networkSelected, setProxyAccountsSelected]);

  return (
    <div className={className}>
      <ChainSelector
        items={chainItems}
        onChange={onSelectNetwork}
        value={networkSelected}
      />

      {loading
        ? <div className='__load-more-container'>
          <ActivityIndicator size={token.sizeXXL} />
        </div>

        : <SwList.Section
          className={CN('__proxy-account-list')}
          gap={token.sizeXL}
          list={Object.values(proxyAccountsSelected)}
          renderItem={renderItem}
          renderWhenEmpty={renderEmpty}
        />
      }
    </div>
  );
}

export const ProxyAccountList = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  display: 'flex',
  overflow: 'hidden',
  flexDirection: 'column',
  paddingInline: token.padding,

  '.ant-sw-list-section': {
    flex: 1
  },

  '.__proxy-account-list': {
    marginTop: token.marginSM,

    '.ant-sw-list': {
      padding: 0
    }
  },

  '.__proxy-account-item': {
    paddingBlock: token.paddingXS
  },

  '.__proxy-account-item + .__proxy-account-item': {
    marginTop: token.marginXS
  },

  '.__empty-proxy-account-list': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24.5,

    '.empty-list': {
      marginTop: token.marginMD
    }
  },

  '.__add-proxy-button': {
    paddingInline: token.padding,
    paddingBlock: token.paddingXS,
    borderRadius: `${token.borderRadiusXXL}px !important`,
    height: 'auto',
    lineHeight: 'unset',
    '.ant-btn-content-wrapper': {
      fontSize: token.fontSize,
      listHeight: token.lineHeight
    }
  },

  '.__load-more-container': {
    textAlign: 'center',
    marginTop: token.marginXXL,
    marginBottom: token.margin
  }
}));
