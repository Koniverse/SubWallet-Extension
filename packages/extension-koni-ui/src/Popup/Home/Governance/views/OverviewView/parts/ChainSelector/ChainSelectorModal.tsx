// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _GOVERNANCE_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
import { GeneralEmptyList } from '@subwallet/extension-koni-ui/components';
import Search from '@subwallet/extension-koni-ui/components/Search';
import { useGetAccountTokenBalance, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { GovernanceChainSelectorItemType } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps, TokenBalanceItemType } from '@subwallet/extension-koni-ui/types';
import { SwList, SwModal } from '@subwallet/react-ui';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ChainSelectorItem } from './ChainSelectorItem';

type Props = ThemeProps & {
  modalId: string;
  onCancel?: VoidFunction;
  onChangeChain: (chainSlug: string) => void;
  selectedChain: string;
};

type ListItemGroupLabel = {
  id: string;
  groupLabel: string;
}

type ListItem = GovernanceChainSelectorItemType | ListItemGroupLabel;

const renderEmpty = () => <GeneralEmptyList />;

const Component = ({ className = '', modalId, onCancel, onChangeChain, selectedChain }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [searchValue, setSearchValue] = useState<string>('');
  const getAccountTokenBalance = useGetAccountTokenBalance();
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const searchFunction = useCallback((item: GovernanceChainSelectorItemType, searchText: string) => {
    const lowerCaseSearchText = searchText.toLowerCase();

    return item.chainName.toLowerCase().includes(lowerCaseSearchText);
  }, []);

  const itemGroupMap = useMemo(() => {
    const getItems = (chainSlugs: string[]) => {
      return chainSlugs.map((cs) => ({
        chainSlug: cs,
        chainName: chainInfoMap[cs]?.name || `${cs}-noName`
      }));
    };

    return {
      polkadot: getItems(_GOVERNANCE_CHAIN_GROUP.polkadot),
      kusama: getItems(_GOVERNANCE_CHAIN_GROUP.kusama),
      westend: getItems(_GOVERNANCE_CHAIN_GROUP.westend_assethub),
      paseo: getItems(_GOVERNANCE_CHAIN_GROUP.paseo),
      solo: getItems(_GOVERNANCE_CHAIN_GROUP.solo),
      testnet: getItems(_GOVERNANCE_CHAIN_GROUP.testnet)
    };
  }, [chainInfoMap]);

  const listItems = useMemo<ListItem[]>(() => {
    const result: ListItem[] = [];

    const addGroup = (group: GovernanceChainSelectorItemType[], label?: string, id?: string) => {
      const filtered = group.filter((item) =>
        !searchValue || searchFunction(item, searchValue)
      );

      if (filtered.length) {
        if (label && id) {
          result.push({ id, groupLabel: label });
        }

        result.push(...filtered);
      }
    };

    addGroup(itemGroupMap.polkadot, t('ui.GOVERNANCE.screen.Governance.Overview.ChainSelectorModal.polkadotParachains'), 'polkadot');
    addGroup(itemGroupMap.kusama, t('ui.GOVERNANCE.screen.Governance.Overview.ChainSelectorModal.kusamaParachains'), 'kusama');
    addGroup(itemGroupMap.westend, t('ui.GOVERNANCE.screen.Governance.Overview.ChainSelectorModal.westendParachains'), 'westend_assethub');
    addGroup(itemGroupMap.paseo, t('ui.GOVERNANCE.screen.Governance.Overview.ChainSelectorModal.paseo'), 'paseo');
    addGroup(itemGroupMap.solo, t('ui.GOVERNANCE.screen.Governance.Overview.ChainSelectorModal.solochains'), 'solo');
    addGroup(itemGroupMap.testnet, t('ui.GOVERNANCE.screen.Governance.Overview.ChainSelectorModal.testnets'), 'testnet');

    return result;
  }, [itemGroupMap, searchFunction, searchValue, t]);

  const _onCancel = useCallback(() => {
    setSearchValue('');
    onCancel?.();
  }, [onCancel]);

  const onSelect = useCallback((item: GovernanceChainSelectorItemType) => {
    return () => {
      onChangeChain(item.chainSlug);
      _onCancel();
    };
  }, [_onCancel, onChangeChain]);

  const chainAndNativeTokenSlugMap = useMemo(() => {
    const result: Record<string, string> = {};

    Object.values(itemGroupMap).forEach((groupItem) => {
      groupItem.forEach(({ chainSlug }) => {
        result[chainSlug] = _getChainNativeTokenSlug(chainInfoMap[chainSlug]);
      });
    });

    return result;
  }, [chainInfoMap, itemGroupMap]);

  const chainBalanceMap = useMemo(() => {
    if (!currentAccountProxy) {
      return {};
    }

    const result: Record<string, TokenBalanceItemType | undefined> = {};

    const tokenBalanceMap = getAccountTokenBalance(Object.values(chainAndNativeTokenSlugMap), currentAccountProxy.id);

    Object.keys(chainAndNativeTokenSlugMap).forEach((chainSlug) => {
      result[chainSlug] = tokenBalanceMap[chainAndNativeTokenSlugMap[chainSlug]];
    });

    return result;
  }, [chainAndNativeTokenSlugMap, currentAccountProxy, getAccountTokenBalance]);

  const renderItem = useCallback((item: ListItem) => {
    if ((item as ListItemGroupLabel).groupLabel) {
      return (
        <div
          className={'__group-label'}
          key={(item as ListItemGroupLabel).id + '-label'}
        >
          {(item as ListItemGroupLabel).groupLabel}
        </div>
      );
    }

    const _item = (item as GovernanceChainSelectorItemType);

    return (
      <ChainSelectorItem
        balanceInfo={chainBalanceMap[_item.chainSlug]}
        chainName={_item.chainName}
        chainSlug={_item.chainSlug}
        className={'__selector-item'}
        isSelected={_item.chainSlug === selectedChain}
        key={_item.chainSlug}
        onClick={onSelect(_item)}
      />
    );
  }, [chainBalanceMap, onSelect, selectedChain]);

  return (
    <SwModal
      className={`${className}`}
      destroyOnClose={true}
      id={modalId}
      onCancel={_onCancel}
      title={t('ui.GOVERNANCE.screen.Governance.Overview.ChainSelectorModal.selectNetwork')}
    >
      <Search
        autoFocus={true}
        className={'__search-box'}
        onSearch={handleSearch}
        placeholder={t<string>('ui.GOVERNANCE.screen.Governance.Overview.ChainSelectorModal.enterNetwork')}
        searchValue={searchValue}
      />
      <SwList
        className={'__list-container'}
        list={listItems}
        renderItem={renderItem}
        renderWhenEmpty={renderEmpty}
      />
    </SwModal>
  );
};

export const ChainSelectorModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__group-label + .__selector-item, .__selector-item + .__selector-item, .__selector-item + .__group-label': {
      marginTop: token.marginXS
    },

    '.__group-label': {
      fontSize: 11,
      lineHeight: '20px',
      fontWeight: token.headingFontWeight,
      textTransform: 'uppercase',
      color: token.colorTextLight3
    },

    '.ant-sw-modal-content': {
      height: '100vh'
    },

    '.ant-sw-modal-body': {
      overflow: 'auto',
      display: 'flex',
      flex: 1,
      flexDirection: 'column'
    },

    '.__search-box': {
      marginBottom: token.marginXS
    },

    '.__list-container': {
      flex: 1,
      overflow: 'auto'
    }
  };
});
