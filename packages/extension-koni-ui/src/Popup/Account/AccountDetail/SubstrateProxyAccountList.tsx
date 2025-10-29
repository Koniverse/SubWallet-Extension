// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { UNSUPPORTED_SUBSTRATE_PROXY_NETWORKS } from '@subwallet/extension-base/services/substrate-proxy-service/constant';
import { AccountProxy, AccountProxyType, SubstrateProxyAccountItem, SubstrateProxyType } from '@subwallet/extension-base/types';
import { BasicInputEvent, ChainSelector, EmptyList, ProxyItemExtended, SubstrateProxyAccountSelectorItem } from '@subwallet/extension-koni-ui/components';
import { ADD_SUBSTRATE_PROXY_ACCOUNT_TRANSACTION, DEFAULT_ADD_SUBSTRATE_PROXY_ACCOUNT_PARAMS } from '@subwallet/extension-koni-ui/constants';
import { useChainChecker, useCreateGetChainAndExcludedTokenByAccountProxy, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { getSubstrateProxyAccountInfo } from '@subwallet/extension-koni-ui/messaging/transaction/proxy';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { AddSubstrateProxyAccountParams, ChainItemType, ThemeProps } from '@subwallet/extension-koni-ui/types';
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
  setSubstrateProxyAccountsSelected: Dispatch<SetStateAction<Record<string, ProxyItemSelector>>>;
  substrateProxyAccountsSelected: Record<string, ProxyItemSelector>;
  setNetworkSelected: Dispatch<SetStateAction<string | undefined>>;
  networkSelected?: string;
};

const getKey = (address: string, proxyType: SubstrateProxyType) => proxyType + ':' + address;

function Component ({ accountProxy, address: addressFormated, className, networkSelected, setNetworkSelected, setSubstrateProxyAccountsSelected, substrateProxyAccountsSelected }: Props) {
  const { t } = useTranslation();
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [, setAddSubstrateProxyParamsStorage] = useLocalStorage<AddSubstrateProxyAccountParams>(ADD_SUBSTRATE_PROXY_ACCOUNT_TRANSACTION, DEFAULT_ADD_SUBSTRATE_PROXY_ACCOUNT_PARAMS);
  const navigate = useNavigate();
  const checkChain = useChainChecker();
  const [loading, setLoading] = useState(false);
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const getChainAndExcludedTokenByAccountProxy = useCreateGetChainAndExcludedTokenByAccountProxy();

  const proxyIdSet = useMemo<Set<string>>(() => new Set<string>(accountProxies.map(({ id }) => id)), [accountProxies]);

  const { allowedChains } = useMemo(() => {
    return getChainAndExcludedTokenByAccountProxy(accountProxy);
  }, [accountProxy, getChainAndExcludedTokenByAccountProxy]);

  const chainItems = useMemo<ChainItemType[]>(() => {
    const result: ChainItemType[] = [];

    Object.values(chainInfoMap).forEach((c) => {
      if (c.substrateInfo !== null && allowedChains.includes(c.slug) && !UNSUPPORTED_SUBSTRATE_PROXY_NETWORKS.includes(c.slug)) {
        result.push({
          name: c.name,
          slug: c.slug
        });
      }
    });

    return result;
  }, [allowedChains, chainInfoMap]);

  const substrateProxyAccountSelectedSorted = useMemo<ProxyItemSelector[]>(() => {
    const list = Object.values(substrateProxyAccountsSelected);

    return list.sort((a, b) => {
      const aInProxyIdSet = proxyIdSet.has(a.proxyId || '') ? 1 : 0;
      const bInProxyIdSet = proxyIdSet.has(b.proxyId || '') ? 1 : 0;

      return bInProxyIdSet - aInProxyIdSet;
    });
  }, [substrateProxyAccountsSelected, proxyIdSet]);

  const onAddSubstrateProxyAccount = useCallback(() => {
    if (!addressFormated || !networkSelected) {
      return;
    }

    setAddSubstrateProxyParamsStorage({
      ...DEFAULT_ADD_SUBSTRATE_PROXY_ACCOUNT_PARAMS,
      chain: networkSelected,
      from: addressFormated
    });

    navigate('/transaction/add-proxy');
  }, [addressFormated, navigate, networkSelected, setAddSubstrateProxyParamsStorage]);

  const renderEmpty = useCallback(() => {
    return (
      <div className={'__empty-proxy-account-list'}>
        <EmptyList
          emptyMessage={t('ui.ACCOUNT.screen.Account.Detail.SubstrateProxyAccountList.setupSubstrateProxyAccounts')}
          emptyTitle={t('ui.ACCOUNT.screen.Account.Detail.SubstrateProxyAccountList.noSubstrateProxyAccountsFound')}
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
          onClick={onAddSubstrateProxyAccount}
          schema='primary'
          shape={'round'}
        >
          {t('ui.ACCOUNT.screen.Account.Detail.SubstrateProxyAccountList.addSubstrateProxyAccount')}
        </Button>
      </div>

    );
  }, [accountProxy.accountType, onAddSubstrateProxyAccount, t]);

  const onSelectSubstrateProxyAccount = useCallback((item: SubstrateProxyAccountItem) => {
    return () => {
      const key = getKey(item.substrateProxyAddress, item.substrateProxyType);

      setSubstrateProxyAccountsSelected((prev) =>
        (
          { ...prev, [key]: { ...item, isSelected: !prev[key]?.isSelected } }
        )
      );
    };
  }, [setSubstrateProxyAccountsSelected]);

  const renderItem = useCallback(
    (item: SubstrateProxyAccountItem) => {
      const key = getKey(item.substrateProxyAddress, item.substrateProxyType);

      return (
        <SubstrateProxyAccountSelectorItem
          className={'__proxy-account-item'}
          isSelected={!!substrateProxyAccountsSelected[key]?.isSelected}
          key={key}
          onClick={onSelectSubstrateProxyAccount(item)}
          proxyAccount={item}
          showCheckedIcon={accountProxy.accountType !== AccountProxyType.READ_ONLY}
          showUnselectIcon
        />
      );
    },
    [accountProxy.accountType, onSelectSubstrateProxyAccount, substrateProxyAccountsSelected]);

  const onSelectNetwork = useCallback((event: BasicInputEvent) => {
    const newNetworkSelected = event.target.value;

    setNetworkSelected(
      (prevState) => {
        if (prevState !== newNetworkSelected) {
          checkChain(newNetworkSelected);
          setSubstrateProxyAccountsSelected({});

          return newNetworkSelected;
        }

        return prevState;
      }
    );
  }, [checkChain, setNetworkSelected, setSubstrateProxyAccountsSelected]);

  useEffect(() => {
    if (addressFormated && networkSelected) {
      setLoading(true);
      getSubstrateProxyAccountInfo({
        chain: networkSelected,
        address: addressFormated
      })
        .then(({ substrateProxyAccounts }) => {
          setSubstrateProxyAccountsSelected((prev) => {
            const newSelected: Record<string, ProxyItemSelector> = {};

            substrateProxyAccounts.forEach((p) => {
              const key = getKey(p.substrateProxyAddress, p.substrateProxyType);

              newSelected[key] = { ...p, isSelected: !!prev[key]?.isSelected };
            });

            return newSelected;
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [addressFormated, networkSelected, setSubstrateProxyAccountsSelected]);

  useEffect(() => {
    if (!networkSelected && chainItems[0]?.slug) {
      setNetworkSelected(chainItems[0].slug);
    }
  }, [chainItems, networkSelected, setNetworkSelected]);

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
          list={substrateProxyAccountSelectedSorted}
          renderItem={renderItem}
          renderWhenEmpty={renderEmpty}
        />
      }
    </div>
  );
}

export const SubstrateProxyAccountList = styled(Component)<Props>(({ theme: { token } }: Props) => ({
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    minHeight: 200
  }
}));
