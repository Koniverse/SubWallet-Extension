// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxyType } from '@subwallet/extension-base/types';
import { AddressSelectorItem, CloseIcon } from '@subwallet/extension-koni-ui/components';
import GeneralEmptyList from '@subwallet/extension-koni-ui/components/EmptyList/GeneralEmptyList';
import Search from '@subwallet/extension-koni-ui/components/Search';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { AccountAddressItemType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getBitcoinAccountDetails } from '@subwallet/extension-koni-ui/utils';
import { isBitcoinAddress } from '@subwallet/keyring';
import { Icon, ModalContext, SwList, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretLeft } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type ListItemGroupLabel = {
  id: string;
  groupLabel: string;
}

type ListItem = AccountAddressItemType | ListItemGroupLabel;

type GroupedItems = {
  master: AccountAddressItemType[];
  qrSigner: AccountAddressItemType[];
  watchOnly: AccountAddressItemType[];
  ledger: AccountAddressItemType[];
  injected: AccountAddressItemType[];
  unknown: AccountAddressItemType[];
};

interface Props extends ThemeProps {
  modalId: string;
  onSelectItem?: (item: AccountAddressItemType) => void,
  items: AccountAddressItemType[];
  onCancel?: VoidFunction;
  onBack?: VoidFunction;
  selectedValue?: string;
  autoSelectFirstItem?: boolean;
}

const renderEmpty = () => <GeneralEmptyList />;

function isAccountAddressItem (item: ListItem): item is AccountAddressItemType {
  return 'address' in item && 'accountProxyId' in item && 'accountName' in item && !('groupLabel' in item);
}

function Component ({ autoSelectFirstItem, className = '', items, modalId, onBack, onCancel, onSelectItem, selectedValue }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { checkActive } = useContext(ModalContext);

  const [searchValue, setSearchValue] = useState<string>('');

  const isActive = checkActive(modalId);

  const searchFunction = useCallback((item: AccountAddressItemType, searchText: string) => {
    const lowerCaseSearchText = searchText.toLowerCase();

    return item.accountName.toLowerCase().includes(lowerCaseSearchText) ||
      (item.displayAddress || item.address).toLowerCase().includes(lowerCaseSearchText);
  }, []);

  const onSelect = useCallback((item: AccountAddressItemType) => {
    return () => {
      onSelectItem?.(item);
    };
  }, [onSelectItem]);

  const renderItem = useCallback((item: ListItem) => {
    if ((item as ListItemGroupLabel).groupLabel) {
      return (
        <div
          className={'list-item-group-label'}
          key={(item as ListItemGroupLabel).id}
        >
          {(item as ListItemGroupLabel).groupLabel}
        </div>
      );
    }

    // NOTE:
    // displayAddress is only for visual representation.
    // The original address should always be used for identification, selection, comparison, and any logic-related operations.

    return (
      <AddressSelectorItem
        address={(item as AccountAddressItemType).displayAddress || (item as AccountAddressItemType).address}
        avatarValue={(item as AccountAddressItemType).accountProxyId}
        className={'account-selector-item'}
        isSelected={selectedValue === (item as AccountAddressItemType).address}
        key={(item as AccountAddressItemType).address}
        name={(item as AccountAddressItemType).accountName}
        onClick={onSelect(item as AccountAddressItemType)}
      />
    );
  }, [onSelect, selectedValue]);

  const sortedItems = useMemo<AccountAddressItemType[]>(() => {
    return [...items].sort((a, b) => {
      const _isABitcoin = isBitcoinAddress(a.address);
      const _isBBitcoin = isBitcoinAddress(b.address);
      const _isSameProxyId = a.accountProxyId === b.accountProxyId;

      if (_isABitcoin && _isBBitcoin && _isSameProxyId) {
        const aDetails = getBitcoinAccountDetails(a.accountType);
        const bDetails = getBitcoinAccountDetails(b.accountType);

        return aDetails.order - bDetails.order;
      }

      return 0;
    });
  }, [items]);

  const groupedItemMap = useMemo<GroupedItems>(() => {
    const result: GroupedItems = {
      master: [],
      qrSigner: [],
      watchOnly: [],
      ledger: [],
      injected: [],
      unknown: []
    };

    sortedItems.forEach((item) => {
      switch (item.accountProxyType) {
        case AccountProxyType.SOLO:
        case AccountProxyType.UNIFIED:
          result.master.push(item);
          break;
        case AccountProxyType.QR:
          result.qrSigner.push(item);
          break;
        case AccountProxyType.READ_ONLY:
          result.watchOnly.push(item);
          break;
        case AccountProxyType.LEDGER:
          result.ledger.push(item);
          break;
        case AccountProxyType.INJECTED:
          result.injected.push(item);
          break;
        default:
          result.unknown.push(item);
      }
    });

    return result;
  }, [sortedItems]);

  const listItems = useMemo<ListItem[]>(() => {
    const result: ListItem[] = [];

    const addGroup = (group: AccountAddressItemType[], label?: string, id?: string) => {
      const filtered = group.filter((item) =>
        !searchValue || searchFunction(item, searchValue)
      );

      if (filtered.length) {
        if (label && id) {
          result.push({ id, groupLabel: t(label) });
        }

        result.push(...filtered);
      }
    };

    addGroup(groupedItemMap.master);
    addGroup(groupedItemMap.qrSigner, 'QR signer account', 'qr');
    addGroup(groupedItemMap.watchOnly, 'Watch-only account', 'watch-only');
    addGroup(groupedItemMap.ledger, 'Ledger account', 'ledger');
    addGroup(groupedItemMap.injected, 'Injected account', 'injected');
    addGroup(groupedItemMap.unknown, 'Unknown account', 'unknown');

    return result;
  }, [groupedItemMap, searchFunction, searchValue, t]);

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
        ...groupedItemMap.master,
        ...groupedItemMap.qrSigner,
        ...groupedItemMap.watchOnly,
        ...groupedItemMap.ledger,
        ...groupedItemMap.injected,
        ...groupedItemMap.unknown
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
      title={t('ui.components.Modal.Selector.Account.selectAccount')}
    >
      <Search
        autoFocus={true}
        className={'__search-box'}
        onSearch={handleSearch}
        placeholder={t<string>('ui.components.Modal.Selector.Account.enterYourAccountNameOrAddress')}
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

const AccountSelectorModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
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
      lineHeight: '18px',
      fontWeight: token.headingFontWeight,
      color: token.colorTextLight3
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

export default AccountSelectorModal;
