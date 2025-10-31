// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddressSelectorItem, CloseIcon } from '@subwallet/extension-koni-ui/components';
import GeneralEmptyList from '@subwallet/extension-koni-ui/components/EmptyList/GeneralEmptyList';
import Search from '@subwallet/extension-koni-ui/components/Search';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GovAccountAddressItemType, GovVoteStatus } from '@subwallet/extension-koni-ui/types/gov';
import { Icon, ModalContext, SwList, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretLeft } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type ListItemGroupLabel = {
  id: string;
  groupLabel: string;
  listCount: string;
}

type ListItem = GovAccountAddressItemType | ListItemGroupLabel;

type GroupedItems = {
  notVoted: GovAccountAddressItemType[];
  voted: GovAccountAddressItemType[];
  delegated: GovAccountAddressItemType[];
};

interface Props extends ThemeProps {
  modalId: string;
  onSelectItem?: (item: GovAccountAddressItemType) => void,
  items: GovAccountAddressItemType[];
  onCancel?: VoidFunction;
  onBack?: VoidFunction;
  selectedValue?: string;
  autoSelectFirstItem?: boolean;
}

const renderEmpty = () => <GeneralEmptyList />;

function isAccountAddressItem (item: ListItem): item is GovAccountAddressItemType {
  return 'address' in item && 'accountProxyId' in item && 'accountName' in item && !('groupLabel' in item);
}

function Component ({ autoSelectFirstItem, className = '', items, modalId, onBack, onCancel, onSelectItem, selectedValue }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { checkActive } = useContext(ModalContext);

  const [searchValue, setSearchValue] = useState<string>('');

  const isActive = checkActive(modalId);

  const searchFunction = useCallback((item: GovAccountAddressItemType, searchText: string) => {
    const lowerCaseSearchText = searchText.toLowerCase();

    return item.accountName.toLowerCase().includes(lowerCaseSearchText) ||
      (item.displayAddress || item.address).toLowerCase().includes(lowerCaseSearchText);
  }, []);

  const onSelect = useCallback((item: GovAccountAddressItemType) => {
    return () => {
      onSelectItem?.(item);
    };
  }, [onSelectItem]);

  const renderItem = useCallback((item: ListItem) => {
    if ((item as ListItemGroupLabel).groupLabel) {
      const groupItem = item as ListItemGroupLabel;

      return (
        <div
          className={'list-item-group-label'}
          key={groupItem.id}
        >
          <span>
            {groupItem.groupLabel}
          </span>
          <span className={'list-item-group-label-count'}>
          &nbsp;({groupItem.listCount})
          </span>
        </div>
      );
    }

    return (
      <AddressSelectorItem
        address={(item as GovAccountAddressItemType).displayAddress || (item as GovAccountAddressItemType).address}
        avatarValue={(item as GovAccountAddressItemType).accountProxyId}
        className={'account-selector-item'}
        isSelected={selectedValue === (item as GovAccountAddressItemType).address}
        key={(item as GovAccountAddressItemType).address}
        name={(item as GovAccountAddressItemType).accountName}
        onClick={onSelect(item as GovAccountAddressItemType)}
      />
    );
  }, [onSelect, selectedValue]);

  const groupedItemMap = useMemo<GroupedItems>(() => {
    const result: GroupedItems = {
      notVoted: [],
      voted: [],
      delegated: []
    };

    items.forEach((item) => {
      switch (item.govVoteStatus) {
        case GovVoteStatus.NOT_VOTED:
          result.notVoted.push(item);
          break;
        case GovVoteStatus.VOTED:
          result.voted.push(item);
          break;
        case GovVoteStatus.DELEGATED:
          result.delegated.push(item);
          break;
      }
    });

    return result;
  }, [items]);

  const listItems = useMemo<ListItem[]>(() => {
    const result: ListItem[] = [];

    const addGroup = (group: GovAccountAddressItemType[], label?: string, id?: string) => {
      const filtered = group.filter((item) =>
        !searchValue || searchFunction(item, searchValue)
      );

      if (filtered.length) {
        if (label && id) {
          const count = filtered.length.toString().padStart(2, '0');

          result.push({ id, groupLabel: label, listCount: count });
        }

        result.push(...filtered);
      }
    };

    addGroup(groupedItemMap.notVoted, t('Not voted'), 'not voted');
    addGroup(groupedItemMap.voted, t('Voted'), 'voted');
    addGroup(groupedItemMap.delegated, t('Delegated'), 'delegated');

    return result;
  }, [groupedItemMap.delegated, groupedItemMap.notVoted, groupedItemMap.voted, searchFunction, searchValue, t]);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  useEffect(() => {
    if (!isActive) {
      setTimeout(() => {
        setSearchValue('');
      }, 100);
    }
  }, [isActive]);

  useEffect(() => {
    const doFunction = () => {
      const _items = [
        ...groupedItemMap.notVoted,
        ...groupedItemMap.voted,
        ...groupedItemMap.delegated
      ];

      if (!_items.length) {
        return;
      }

      const firstItem = _items[0];

      if (!firstItem) {
        return;
      }

      if (!selectedValue) {
        onSelectItem?.(firstItem);

        return;
      }

      if (!_items.some((i) => isAccountAddressItem(i) && i.address === selectedValue)) {
        onSelectItem?.(firstItem);
      }
    };

    if (autoSelectFirstItem) {
      doFunction();
    }
  }, [autoSelectFirstItem, groupedItemMap, onSelectItem, selectedValue]);

  return (
    <SwModal
      className={CN(className)}
      closeIcon={
        onBack
          ? (
            <Icon
              phosphorIcon={CaretLeft}
              size='md'
            />
          )
          : undefined
      }
      destroyOnClose={true}
      id={modalId}
      onCancel={onBack || onCancel}
      rightIconProps={onBack
        ? {
          icon: <CloseIcon />,
          onClick: onCancel
        }
        : undefined}
      title={t('Select account')}
    >
      <Search
        autoFocus={true}
        className={'__search-box'}
        onSearch={handleSearch}
        placeholder={t('Enter your account name or address')}
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
}

export const GovAccountSelectoModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-content': {
      height: '100vh'
    },

    '.ant-sw-modal-body': {
      overflow: 'auto',
      display: 'flex',
      flex: 1,
      flexDirection: 'column'
    },

    '.list-item-group-label': {
      textTransform: 'uppercase',
      fontSize: 11,
      lineHeight: '20px',
      fontWeight: token.headingFontWeight,
      color: token.colorWhite
    },

    '.list-item-group-label-count': {
      color: token.colorTextLight4
    },

    '.__search-box': {
      marginBottom: token.marginXS
    },

    '.__list-container': {
      flex: 1,
      overflow: 'auto',

      '> div + div': {
        marginTop: token.marginXS
      }
    },

    '.account-selector-item + .account-selector-item': {
      marginTop: token.marginXS
    }
  });
});

export default GovAccountSelectoModal;
