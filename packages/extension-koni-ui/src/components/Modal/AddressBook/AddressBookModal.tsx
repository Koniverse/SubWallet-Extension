// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ActionType } from '@subwallet/extension-base/core/types';
import { _isChainInfoCompatibleWithAccountInfo } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountSignMode, AnalyzeAddress, AnalyzedGroup } from '@subwallet/extension-base/types';
import { _reformatAddressWithChain, getAccountChainTypeForAddress } from '@subwallet/extension-base/utils';
import { AddressSelectorItem, BackIcon, EmptyList } from '@subwallet/extension-koni-ui/components';
import { useChainInfo, useCoreCreateReformatAddress, useFilterModal, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { useGetExcludedTokens } from '@subwallet/extension-koni-ui/hooks/assets';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getSignModeByAccountProxy, isAccountAll, sortFuncAnalyzeAddress } from '@subwallet/extension-koni-ui/utils';
import { getKeypairTypeByAddress } from '@subwallet/keyring';
import { Badge, Icon, ModalContext, SwList, SwModal } from '@subwallet/react-ui';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import CN from 'classnames';
import { FadersHorizontal, MagnifyingGlass } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FilterModal } from '../FilterModal';

interface Props extends ThemeProps {
  value?: string;
  id: string;
  chainSlug?: string;
  tokenSlug?: string;
  actionType?: ActionType;
  onSelect: (val: string, item: AnalyzeAddress) => void;
}

interface FilterOption {
  label: string;
  value: AnalyzedGroup;
}

const getGroupPriority = (item: AnalyzeAddress): number => {
  switch (item.analyzedGroup) {
    case AnalyzedGroup.WALLET:
      return 2;
    case AnalyzedGroup.CONTACT:
      return 1;
    case AnalyzedGroup.RECENT:
    default:
      return 0;
  }
};

const Component: React.FC<Props> = (props: Props) => {
  const { actionType, chainSlug, className, id, onSelect, tokenSlug = '', value = '' } = props;

  const { t } = useTranslation();

  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);

  const isActive = checkActive(id);

  const { accountProxies, contacts, recent } = useSelector((state) => state.accountState);

  const chainInfo = useChainInfo(chainSlug);

  const getReformatAddress = useCoreCreateReformatAddress();

  const getExcludedTokenByAccountProxy = useGetExcludedTokens();

  const filterModal = useMemo(() => `${id}-filter-modal`, [id]);

  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, onResetFilter, selectedFilters } = useFilterModal(filterModal);

  const sectionRef = useRef<SwListSectionRef>(null);

  const filterOptions: FilterOption[] = useMemo(() => ([
    {
      label: t('ui.components.Modal.AddressBook.Selector.yourWallet'),
      value: AnalyzedGroup.WALLET
    },
    {
      label: t('ui.components.Modal.AddressBook.Selector.savedContacts'),
      value: AnalyzedGroup.CONTACT
    },
    {
      label: t('ui.components.Modal.AddressBook.Selector.recent'),
      value: AnalyzedGroup.RECENT
    }
  ]), [t]);

  const renderEmpty = useCallback(() => {
    let emptyMessage = '';

    if (actionType === ActionType.SEND_NFT) {
      emptyMessage = t('ui.components.Modal.AddressBook.noAvailableAccountsForNftSend');
    } else if (actionType === ActionType.SEND_FUND) {
      emptyMessage = t('ui.components.Modal.AddressBook.noAvailableAccountsForTokenTransfer');
    } else if (actionType === ActionType.SWAP) {
      emptyMessage = t('ui.components.Modal.AddressBook.noAvailableAccountsForSwapPair');
    }

    return (
      <EmptyList
        emptyMessage={emptyMessage}
        emptyTitle={t('ui.components.Modal.AddressBook.noAccountsFound')}
        phosphorIcon={MagnifyingGlass}
      />
    );
  }, [actionType, t]);

  const items = useMemo((): AnalyzeAddress[] => {
    if (!chainInfo) {
      return [];
    }

    const result: AnalyzeAddress[] = [];

    (!selectedFilters.length || selectedFilters.includes(AnalyzedGroup.RECENT)) && recent.forEach((acc) => {
      const chains = acc.recentChainSlugs || [];

      if (chainSlug && chains.includes(chainSlug)) {
        result.push({
          displayName: acc.name,
          formatedAddress: _reformatAddressWithChain(acc.address, chainInfo),
          address: acc.address,
          analyzedGroup: AnalyzedGroup.RECENT
        });
      }
    });

    (!selectedFilters.length || selectedFilters.includes(AnalyzedGroup.CONTACT)) && contacts.forEach((acc) => {
      if (_isChainInfoCompatibleWithAccountInfo(chainInfo, {
        chainType: getAccountChainTypeForAddress(acc.address),
        type: getKeypairTypeByAddress(acc.address)
      })) {
        result.push({
          displayName: acc.name,
          formatedAddress: _reformatAddressWithChain(acc.address, chainInfo),
          address: acc.address,
          analyzedGroup: AnalyzedGroup.CONTACT
        });
      }
    });

    (!selectedFilters.length || selectedFilters.includes(AnalyzedGroup.WALLET)) && accountProxies.forEach((ap) => {
      if (isAccountAll(ap.id)) {
        return;
      }

      // todo: recheck with ledger
      const excludedTokens = getExcludedTokenByAccountProxy([chainInfo.slug], ap);

      if (excludedTokens.includes(tokenSlug)) {
        return;
      }

      if (actionType === ActionType.SEND_NFT) {
        const signMode = getSignModeByAccountProxy(ap);

        if (signMode === AccountSignMode.ECDSA_SUBSTRATE_LEDGER) {
          return;
        }
      }

      ap.accounts.forEach((acc) => {
        const formatedAddress = getReformatAddress(acc, chainInfo);

        if (formatedAddress) {
          result.push({
            displayName: acc.name,
            formatedAddress,
            address: acc.address,
            analyzedGroup: AnalyzedGroup.WALLET,
            proxyId: ap.id
          });
        }
      });
    });

    // todo: may need better solution for this sorting below

    return result
      .sort(sortFuncAnalyzeAddress)
      .sort((a, b) => getGroupPriority(b) - getGroupPriority(a));
  }, [accountProxies, actionType, chainInfo, chainSlug, contacts, getExcludedTokenByAccountProxy, getReformatAddress, recent, selectedFilters, tokenSlug]);

  const searchFunction = useCallback((item: AnalyzeAddress, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();

    return (
      item.formatedAddress.toLowerCase().includes(searchTextLowerCase) ||
      (item.displayName
        ? item.displayName.toLowerCase().includes(searchTextLowerCase)
        : false)
    );
  }, []);

  const onClose = useCallback(() => {
    inactiveModal(id);
    onResetFilter();
  }, [id, inactiveModal, onResetFilter]);

  const onSelectItem = useCallback((item: AnalyzeAddress) => {
    return () => {
      inactiveModal(id);
      onSelect(item.formatedAddress, item);
      onResetFilter();
    };
  }, [id, inactiveModal, onResetFilter, onSelect]);

  const renderItem = useCallback((item: AnalyzeAddress) => {
    return (
      <AddressSelectorItem
        address={item.formatedAddress}
        avatarValue={item.proxyId || item.address}
        className={'__list-item'}
        isSelected={value.toLowerCase() === item.formatedAddress.toLowerCase()}
        key={`${item.formatedAddress}_${item.analyzedGroup}`}
        name={item.displayName}
        onClick={onSelectItem(item)}
      />
    );
  }, [onSelectItem, value]);

  const groupSeparator = useCallback((group: AnalyzeAddress[], idx: number, groupKey: string) => {
    const _group = groupKey as AnalyzedGroup;

    let groupLabel = _group;

    switch (_group) {
      case AnalyzedGroup.WALLET:
        groupLabel = t('ui.components.Modal.AddressBook.Selector.yourWallet');
        break;
      case AnalyzedGroup.CONTACT:
        groupLabel = t('ui.components.Modal.AddressBook.Selector.savedContacts');
        break;
      case AnalyzedGroup.RECENT:
        groupLabel = t('ui.components.Modal.AddressBook.Selector.recent');
        break;
    }

    return (
      <div className='address-book-group-separator'>
        <span className='address-book-group-label'>{groupLabel}</span>
        <span className='address-book-group-counter'>&nbsp;({group.length})</span>
      </div>
    );
  }, [t]);

  const openFilter = useCallback(() => {
    activeModal(filterModal);
  }, [activeModal, filterModal]);

  const applyFilter = useCallback(() => {
    onApplyFilter();
    activeModal(id);
  }, [activeModal, id, onApplyFilter]);

  const cancelFilter = useCallback(() => {
    onCloseFilterModal();
    activeModal(id);
  }, [activeModal, id, onCloseFilterModal]);

  useEffect(() => {
    if (!isActive) {
      setTimeout(() => {
        sectionRef.current?.setSearchValue('');
      }, 100);
    }
  }, [isActive, sectionRef]);

  return (
    <>
      <SwModal
        className={CN(className)}
        id={id}
        onCancel={onClose}
        title={t('ui.components.Modal.AddressBook.Selector.addressBook')}
      >
        <SwList.Section
          actionBtnIcon={(
            <Badge
              className={'g-filter-badge'}
              dot={!!selectedFilters.length}
            >
              <Icon
                phosphorIcon={FadersHorizontal}
                size='sm'
                type='phosphor'
                weight='fill'
              />
            </Badge>
          )}
          enableSearchInput={true}
          groupBy='analyzedGroup'
          groupSeparator={groupSeparator}
          list={items}
          onClickActionBtn={openFilter}
          ref={sectionRef}
          renderItem={renderItem}
          renderWhenEmpty={renderEmpty}
          searchFunction={searchFunction}
          searchMinCharactersCount={2}
          searchPlaceholder={t<string>('ui.components.Modal.AddressBook.Selector.accountName')}
          showActionBtn={true}
        />
      </SwModal>
      <FilterModal
        closeIcon={<BackIcon />}
        id={filterModal}
        onApplyFilter={applyFilter}
        onCancel={cancelFilter}
        onChangeOption={onChangeFilterOption}
        optionSelectionMap={filterSelectionMap}
        options={filterOptions}
        title={t('ui.components.Modal.AddressBook.Selector.filterAddress')}
      />
    </>
  );
};

const AddressBookModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-body': {
      display: 'flex',
      paddingLeft: 0,
      paddingRight: 0
    },

    '.ant-sw-list-section': {
      flex: 1
    },

    '.ant-sw-list': {
      paddingBottom: 0
    },

    '.___list-separator + .__list-item, .__list-item + .__list-item, .__list-item + .___list-separator': {
      marginTop: token.marginXS
    },

    '.address-book-group-separator': {
      fontWeight: token.fontWeightStrong,
      fontSize: 11,
      lineHeight: '20px',
      textTransform: 'uppercase',

      '.address-book-group-label': {
        color: token.colorTextBase
      },

      '.address-book-group-counter': {
        color: token.colorTextTertiary
      }
    }
  };
});

export default AddressBookModal;
