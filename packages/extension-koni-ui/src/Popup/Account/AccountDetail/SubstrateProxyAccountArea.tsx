// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _chainInfoToAccountChainType } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountProxy, AccountProxyType, SubstrateProxyAccountItem } from '@subwallet/extension-base/types';
import { BasicInputEvent, ChainSelector, EmptyList, SubstrateProxyAccountItemExtended, SubstrateProxyAccountSelectorItem } from '@subwallet/extension-koni-ui/components';
import { ADD_SUBSTRATE_PROXY_ACCOUNT_TRANSACTION, CURRENT_CHAIN_SUBSTRATE_PROXY, DEFAULT_ADD_SUBSTRATE_PROXY_ACCOUNT_PARAMS, DEFAULT_REMOVE_SUBSTRATE_PROXY_ACCOUNT_PARAMS, REMOVE_SUBSTRATE_PROXY_ACCOUNT_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { useChainChecker, useCoreCreateReformatAddress, useCreateGetChainAndExcludedTokenByAccountProxy, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { getSubstrateProxyAccountGroup } from '@subwallet/extension-koni-ui/messaging/transaction/substrateProxy';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { AddSubstrateProxyAccountParams, ChainItemType, RemoveSubstrateProxyAccountParams, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getSubstrateProxyAddressKey } from '@subwallet/extension-koni-ui/utils';
import { ActivityIndicator, Button, Icon, SwList } from '@subwallet/react-ui';
import CN from 'classnames';
import { ListChecks, Trash, TreeStructure, XCircle } from 'phosphor-react';
import React, { Context, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeContext } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

export interface SubstrateProxyItemSelector extends SubstrateProxyAccountItemExtended {
  isSelected: boolean;
}

type Props = ThemeProps & {
  accountProxy: AccountProxy;
};

function Component ({ accountProxy, className }: Props) {
  const { t } = useTranslation();
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [, setAddSubstrateProxyParamsStorage] = useLocalStorage<AddSubstrateProxyAccountParams>(ADD_SUBSTRATE_PROXY_ACCOUNT_TRANSACTION, DEFAULT_ADD_SUBSTRATE_PROXY_ACCOUNT_PARAMS);
  const [, setRemoveSubstrateProxyParamsStorage] = useLocalStorage<RemoveSubstrateProxyAccountParams>(REMOVE_SUBSTRATE_PROXY_ACCOUNT_TRANSACTION, DEFAULT_REMOVE_SUBSTRATE_PROXY_ACCOUNT_PARAMS);
  const navigate = useNavigate();
  const checkChain = useChainChecker();
  const getReformatAddress = useCoreCreateReformatAddress();
  const [substrateProxyAccountsSelected, setSubstrateProxyAccountsSelected] = useState<Record<string, SubstrateProxyItemSelector>>({});
  const [networkSelected, setNetworkSelected] = useLocalStorage<string>(CURRENT_CHAIN_SUBSTRATE_PROXY, '');
  const [loading, setLoading] = useState(false);
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const getChainAndExcludedTokenByAccountProxy = useCreateGetChainAndExcludedTokenByAccountProxy();

  const addressFormated = useMemo(() => {
    if (!networkSelected) {
      return;
    }

    const chainInfoSelected = chainInfoMap[networkSelected];

    if (!chainInfoSelected || !chainInfoSelected.substrateInfo) {
      return;
    }

    const compatibleChainTypes = _chainInfoToAccountChainType(chainInfoSelected);
    const accountSubstrate = accountProxy.accounts.find(({ chainType }) => chainType === compatibleChainTypes);

    if (!accountSubstrate) {
      return;
    }

    return getReformatAddress(accountSubstrate, chainInfoSelected);
  }, [accountProxy.accounts, chainInfoMap, getReformatAddress, networkSelected]);

  const proxyIdSet = useMemo<Set<string>>(() => new Set<string>(accountProxies.map(({ id }) => id)), [accountProxies]);

  const { allowedChains } = useMemo(() => {
    return getChainAndExcludedTokenByAccountProxy(accountProxy);
  }, [accountProxy, getChainAndExcludedTokenByAccountProxy]);

  const chainItems = useMemo<ChainItemType[]>(() => {
    const result: ChainItemType[] = [];

    // Filter chains that support substrate proxy and are in allowedChains
    Object.values(chainInfoMap).forEach((c) => {
      if (c.substrateInfo?.supportProxy && allowedChains.includes(c.slug)) {
        result.push({
          name: c.name,
          slug: c.slug
        });
      }
    });

    return result;
  }, [allowedChains, chainInfoMap]);

  // Sort selected Substrate proxy accounts, those managed by the current wallet appear on top
  const substrateProxyAccountSelectedSorted = useMemo<SubstrateProxyItemSelector[]>(() => {
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

  const onRemoveSubstrateProxyAccounts = useCallback(() => {
    if (!addressFormated || !networkSelected) {
      return;
    }

    const substrateProxyAddressKeys = Object.keys(substrateProxyAccountsSelected).filter((key) => substrateProxyAccountsSelected[key].isSelected);

    setRemoveSubstrateProxyParamsStorage({
      ...DEFAULT_REMOVE_SUBSTRATE_PROXY_ACCOUNT_PARAMS,
      chain: networkSelected,
      substrateProxyAddressKeys,
      from: addressFormated
    });

    navigate('/transaction/remove-proxy');
  }, [addressFormated, navigate, networkSelected, substrateProxyAccountsSelected, setRemoveSubstrateProxyParamsStorage]);

  const onCancelRemoveSubstrateProxyAccounts = useCallback(() => {
    setSubstrateProxyAccountsSelected((prevState) => {
      const newState: Record<string, SubstrateProxyItemSelector> = {};

      Object.keys(prevState).forEach((key) => {
        newState[key] = {
          ...prevState[key],
          isSelected: false
        };
      });

      return newState;
    });
  }, []);

  const footerNode = useMemo(() => {
    const substrateProxyAccounts = Object.values(substrateProxyAccountsSelected);
    const haveNoSubstrateProxyAccounts = substrateProxyAccounts.length === 0;

    if (haveNoSubstrateProxyAccounts) {
      return <></>;
    }

    const isAnySubstrateProxyAccountSelected = Object.values(substrateProxyAccountsSelected).some(({ isSelected }) => isSelected);

    if (isAnySubstrateProxyAccountSelected) {
      return (
        <>
          <Button
            block={true}
            className={CN('account-button')}
            icon={(
              <Icon
                phosphorIcon={XCircle}
                weight='fill'
              />
            )}
            onClick={onCancelRemoveSubstrateProxyAccounts}
            schema='secondary'
          >
            {t('ui.ACCOUNT.screen.Account.Detail.SubstrateProxyAccountArea.cancelRemoveSubstrateProxyAccount')}
          </Button>
          <Button
            block={true}
            className={CN('account-button')}
            icon={(
              <Icon
                phosphorIcon={Trash}
                weight='fill'
              />
            )}
            onClick={onRemoveSubstrateProxyAccounts}
            schema='error'
          >
            {t('ui.ACCOUNT.screen.Account.Detail.SubstrateProxyAccountArea.removeSubstrateProxyAccount')}
          </Button>
        </>
      );
    }

    return (
      <Button
        block={true}
        className={CN('account-button')}
        disabled={accountProxy.accountType === AccountProxyType.READ_ONLY}
        icon={(
          <Icon
            phosphorIcon={TreeStructure}
            weight='fill'
          />
        )}
        onClick={onAddSubstrateProxyAccount}
        schema='primary'
      >
        {t('ui.ACCOUNT.screen.Account.Detail.SubstrateProxyAccountArea.addSubstrateProxyAccount')}
      </Button>
    );
  }, [accountProxy.accountType, onAddSubstrateProxyAccount, onCancelRemoveSubstrateProxyAccounts, onRemoveSubstrateProxyAccounts, substrateProxyAccountsSelected, t]);

  const renderEmpty = useCallback(() => {
    return (
      <div className={'__empty-proxy-account-list'}>
        <EmptyList
          emptyMessage={t('ui.ACCOUNT.screen.Account.Detail.SubstrateProxyAccountArea.setupSubstrateProxyAccounts')}
          emptyTitle={t('ui.ACCOUNT.screen.Account.Detail.SubstrateProxyAccountArea.noSubstrateProxyAccountsFound')}
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
          {t('ui.ACCOUNT.screen.Account.Detail.SubstrateProxyAccountArea.addSubstrateProxyAccount')}
        </Button>
      </div>

    );
  }, [accountProxy.accountType, onAddSubstrateProxyAccount, t]);

  const onSelectSubstrateProxyAccount = useCallback((item: SubstrateProxyAccountItem) => {
    return () => {
      const key = getSubstrateProxyAddressKey(item.substrateProxyAddress, item.substrateProxyType);

      setSubstrateProxyAccountsSelected((prev) =>
        (
          { ...prev, [key]: { ...item, isSelected: !prev[key]?.isSelected } }
        )
      );
    };
  }, [setSubstrateProxyAccountsSelected]);

  const renderItem = useCallback(
    (item: SubstrateProxyAccountItem) => {
      const key = getSubstrateProxyAddressKey(item.substrateProxyAddress, item.substrateProxyType);

      return (
        <SubstrateProxyAccountSelectorItem
          className={'__proxy-account-item'}
          isSelected={!!substrateProxyAccountsSelected[key]?.isSelected}
          key={key}
          onClick={onSelectSubstrateProxyAccount(item)}
          showCheckedIcon={accountProxy.accountType !== AccountProxyType.READ_ONLY}
          showUnselectIcon
          substrateProxyAccount={item}
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

  // Fetch substrate proxy accounts when address or network changes
  useEffect(() => {
    if (addressFormated && networkSelected) {
      setLoading(true);
      getSubstrateProxyAccountGroup({
        chain: networkSelected,
        address: addressFormated
      })
        .then(({ substrateProxyAccounts }) => {
          setSubstrateProxyAccountsSelected((prev) => {
            const newSelected: Record<string, SubstrateProxyItemSelector> = {};

            substrateProxyAccounts.forEach((p) => {
              const key = getSubstrateProxyAddressKey(p.substrateProxyAddress, p.substrateProxyType);

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
      <div className={'__proxy-account-list-container'}>
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
      <div className={'__proxy-account-area-footer'}>
        {footerNode}
      </div>

    </div>
  );
}

export const SubstrateProxyAccountArea = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  paddingInline: token.padding,

  '.__proxy-account-list-container': {
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column'
  },

  '.ant-sw-list-wrapper': {
    flex: '1 1 263px'
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

  '.__proxy-account-area-footer': {
    paddingTop: token.paddingSM,
    paddingBottom: token.paddingLG,
    display: 'flex',
    gap: token.sizeSM
  },

  '.__load-more-container': {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    minHeight: 200
  }
}));
