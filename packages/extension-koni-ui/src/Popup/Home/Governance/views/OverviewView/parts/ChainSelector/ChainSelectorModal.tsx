// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _GOVERNANCE_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { GeneralEmptyList } from '@subwallet/extension-koni-ui/components';
import Search from '@subwallet/extension-koni-ui/components/Search';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { GovernanceChainSelectorItemType } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { SwList, SwModal } from '@subwallet/react-ui';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ChainSelectorItem } from './ChainSelectorItem';

type Props = ThemeProps & {
  modalId: string;
  onCancel?: VoidFunction;
  onChangeChain: (chainSlug: string) => void;
};

type ListItemGroupLabel = {
  id: string;
  groupLabel: string;
}

type ListItem = GovernanceChainSelectorItemType | ListItemGroupLabel;

const renderEmpty = () => <GeneralEmptyList />;

const Component = ({ className = '', modalId, onCancel, onChangeChain }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [searchValue, setSearchValue] = useState<string>('');

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

    addGroup(itemGroupMap.polkadot, t('Polkadot & Parachains'), 'polkadot');
    addGroup(itemGroupMap.kusama, t('Kusama & Parachains'), 'kusama');
    addGroup(itemGroupMap.westend, t('Westend and Parachains'), 'westend_assethub');
    addGroup(itemGroupMap.paseo, t('Paseo'), 'paseo');
    addGroup(itemGroupMap.solo, t('Solochains'), 'solo');
    addGroup(itemGroupMap.testnet, t('Testnets'), 'testnet');

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

  const renderItem = useCallback((item: ListItem) => {
    if ((item as ListItemGroupLabel).groupLabel) {
      return (
        <div
          className={'__group-label'}
          key={(item as ListItemGroupLabel).id}
        >
          {(item as ListItemGroupLabel).groupLabel}
        </div>
      );
    }

    return (
      <ChainSelectorItem
        chainName={(item as GovernanceChainSelectorItemType).chainName}
        chainSlug={(item as GovernanceChainSelectorItemType).chainSlug}
        className={'__selector-item'}
        key={(item as GovernanceChainSelectorItemType).chainSlug}
        onClick={onSelect(item as GovernanceChainSelectorItemType)}
      />
    );
  }, [onSelect]);

  return (
    <SwModal
      className={`${className}`}
      destroyOnClose={true}
      id={modalId}
      onCancel={_onCancel}
      title={t('Select token')}
    >
      <Search
        autoFocus={true}
        className={'__search-box'}
        onSearch={handleSearch}
        placeholder={t<string>('Enter token name or network name')}
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

  };
});
