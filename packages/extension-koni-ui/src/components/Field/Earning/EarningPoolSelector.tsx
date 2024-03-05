// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PREDEFINED_STAKING_POOL } from '@subwallet/extension-base/constants';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { StakingPoolItem } from '@subwallet/extension-koni-ui/components';
import EmptyValidator from '@subwallet/extension-koni-ui/components/Account/EmptyValidator';
import { Avatar } from '@subwallet/extension-koni-ui/components/Avatar';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field/Base';
import { EarningPoolDetailModal } from '@subwallet/extension-koni-ui/components/Modal/Earning';
import { EarningPoolDetailModalId } from '@subwallet/extension-koni-ui/components/Modal/Earning/EarningPoolDetailModal';
import { FilterModal } from '@subwallet/extension-koni-ui/components/Modal/FilterModal';
import { SortingModal } from '@subwallet/extension-koni-ui/components/Modal/SortingModal';
import { useFilterModal, useGetPoolTargetList, useYieldPositionDetail } from '@subwallet/extension-koni-ui/hooks';
import { NominationPoolDataType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ActivityIndicator, Badge, Button, Icon, InputRef, ModalContext, SelectModal, useExcludeModal } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import { Book, CaretLeft, FadersHorizontal, Lightning, SortAscending } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, SyntheticEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { isEthereumAddress } from '@polkadot/util-crypto';

interface Props extends ThemeProps, BasicInputWrapper {
  slug: string;
  chain: string;
  from: string;
  onClickBookButton?: (e: SyntheticEvent) => void;
  setForceFetchValidator: (val: boolean) => void;
}

enum SortKey {
  MEMBER = 'member',
  TOTAL_POOLED = 'total-pooled',
  DEFAULT = 'default'
}

interface SortOption {
  label: string;
  value: SortKey;
  desc: boolean;
}

interface FilterOption {
  label: string;
  value: NominationPoolDataType['state'];
}

const SORTING_MODAL_ID = 'pool-sorting-modal';
const FILTER_MODAL_ID = 'pool-filter-modal';

const defaultPoolMap = Object.assign({}, PREDEFINED_STAKING_POOL);

const Component = (props: Props, ref: ForwardedRef<InputRef>) => {
  const { chain, className = '', defaultValue, disabled,
    from,
    id = 'pool-selector',
    label, loading, onChange,
    onClickBookButton,
    placeholder,
    setForceFetchValidator,
    slug, statusHelp,
    value } = props;

  useExcludeModal(id);

  const { t } = useTranslation();

  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);

  const isActive = checkActive(id);

  const items = useGetPoolTargetList(slug) as NominationPoolDataType[];
  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, onResetFilter, selectedFilters } = useFilterModal(FILTER_MODAL_ID);
  const { compound } = useYieldPositionDetail(slug, from);

  const sortingOptions: SortOption[] = useMemo(() => {
    return [
      {
        desc: false,
        label: t('Lowest total member'),
        value: SortKey.MEMBER
      },
      {
        desc: true,
        label: t('Highest total staked'),
        value: SortKey.TOTAL_POOLED
      }
    ];
  }, [t]);

  const filterOptions: FilterOption[] = useMemo(() => ([
    {
      label: t('Open'),
      value: 'Open'
    },
    {
      label: t('Locked'),
      value: 'Locked'
    },
    {
      label: t('Destroying'),
      value: 'Destroying'
    }
  ]), [t]);

  const [viewDetailItem, setViewDetailItem] = useState<NominationPoolDataType | undefined>(undefined);
  const [sortSelection, setSortSelection] = useState<SortKey>(SortKey.DEFAULT);

  const nominationPoolValueList = useMemo((): string[] => {
    return compound?.nominations.map((item) => item.validatorAddress) || [];
  }, [compound?.nominations]);

  const defaultSelectPool = defaultPoolMap[chain];

  const resultList = useMemo((): NominationPoolDataType[] => {
    return [...items]
      .filter((value) => {
        const filters = selectedFilters as NominationPoolDataType['state'][];

        if (filters.length) {
          return filters.includes(value.state);
        } else {
          return true;
        }
      })
      .sort((a: NominationPoolDataType, b: NominationPoolDataType) => {
        switch (sortSelection) {
          case SortKey.MEMBER:
            return a.memberCounter - b.memberCounter;
          case SortKey.TOTAL_POOLED:
            return new BigN(b.bondedAmount).minus(a.bondedAmount).toNumber();
          case SortKey.DEFAULT:
          default:
            return 0;
        }
      });
  }, [items, selectedFilters, sortSelection]);

  const isDisabled = useMemo(() =>
    disabled ||
      !!nominationPoolValueList.length ||
      !items.length
  , [disabled, items.length, nominationPoolValueList.length]
  );

  const _onSelectItem = useCallback((value: string) => {
    onChange && onChange({ target: { value } });
  }, [onChange]);

  const searchFunction = useCallback((item: NominationPoolDataType, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();

    return (
      item.address.toLowerCase().includes(searchTextLowerCase) ||
      (item.name
        ? item.name.toLowerCase().includes(searchTextLowerCase)
        : false)
    );
  }, []);

  const onClickMore = useCallback((item: NominationPoolDataType) => {
    return (e: SyntheticEvent) => {
      e.stopPropagation();
      setViewDetailItem(item);
      activeModal(EarningPoolDetailModalId);
    };
  }, [activeModal]);

  const renderItem = useCallback((item: NominationPoolDataType) => {
    return (
      <StakingPoolItem
        {...item}
        className={'pool-item'}
        onClickMoreBtn={onClickMore(item)}
      />
    );
  }, [onClickMore]);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyValidator
        isDataEmpty={items.length === 0}
        onClickReload={setForceFetchValidator}
        validatorTitle={t(getValidatorLabel(chain).toLowerCase())}
      />
    );
  }, [chain, items.length, setForceFetchValidator, t]);

  const renderSelected = useCallback((item: NominationPoolDataType) => {
    return (
      <div className={'__selected-item'}>
        <div className={'__selected-item-name common-text'}>
          {item.name || `Pool #${item.id}`}
        </div>
      </div>
    );
  }, []);

  const onChangeSortOpt = useCallback((value: string) => {
    setSortSelection(value as SortKey);
  }, []);

  const onResetSort = useCallback(() => {
    setSortSelection(SortKey.DEFAULT);
  }, []);

  const onClickActionBtn = useCallback(() => {
    activeModal(FILTER_MODAL_ID);
  }, [activeModal]);

  const onCloseDetail = useCallback(() => {
    inactiveModal(EarningPoolDetailModalId);
  }, [inactiveModal]);

  const onClickLightningButton = useCallback((e: SyntheticEvent) => {
    e.stopPropagation();
    const poolId = defaultSelectPool;

    if (poolId !== undefined) {
      onChange?.({ target: { value: `${poolId}` } });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    const defaultSelectedPool = defaultValue || nominationPoolValueList[0] || `${defaultSelectPool || ''}`;

    onChange && onChange({ target: { value: defaultSelectedPool } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nominationPoolValueList, items]);

  useEffect(() => {
    if (!isActive) {
      setSortSelection(SortKey.DEFAULT);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      onResetFilter();
    }
  }, [isActive, onResetFilter]);

  return (
    <>
      <SelectModal
        actionBtnIcon={(
          <Badge dot={!!selectedFilters.length}>
            <Icon phosphorIcon={FadersHorizontal} />
          </Badge>
        )}
        className={`${className} modal-full`}
        closeIcon={(
          <Icon
            phosphorIcon={CaretLeft}
            size='md'
          />
        )}
        disabled={isDisabled}
        id={id}
        inputClassName={`${className} pool-selector-input`}
        itemKey={'idStr'}
        items={resultList}
        label={label}
        loading={loading}
        onClickActionBtn={onClickActionBtn}
        onSelect={_onSelectItem}
        placeholder={placeholder || t('Select pool')}
        prefix={(
          <Avatar
            size={20}
            theme={value ? isEthereumAddress(value) ? 'ethereum' : 'polkadot' : undefined}
            value={value}
          />
        )}
        renderItem={renderItem}
        renderSelected={renderSelected}
        renderWhenEmpty={renderEmpty}
        rightIconProps={{
          icon: (
            <Badge dot={sortSelection !== SortKey.DEFAULT}>
              <Icon phosphorIcon={SortAscending} />
            </Badge>
          ),
          onClick: () => {
            activeModal(SORTING_MODAL_ID);
          }
        }}
        searchFunction={searchFunction}
        searchMinCharactersCount={2}
        searchPlaceholder={t<string>('Search validator')}
        selected={value || ''}
        showActionBtn
        statusHelp={statusHelp}
        suffix={loading
          ? (
            <div>
              <ActivityIndicator size={20} />
            </div>
          )
          : (
            <div className='select-pool-suffix'>
              <Button
                disabled={isDisabled}
                icon={(
                  <Icon
                    phosphorIcon={Book}
                    size='sm'
                  />
                )}
                onClick={onClickBookButton}
                size='xs'
                type='ghost'
              />
              {
                !!defaultSelectPool && (
                  <Button
                    disabled={isDisabled}
                    icon={(
                      <Icon
                        phosphorIcon={Lightning}
                        size='sm'
                      />
                    )}
                    onClick={onClickLightningButton}
                    size='xs'
                    type='ghost'
                  />
                )
              }
            </div>
          )}
        title={label || placeholder || t('Select pool')}
      />

      <FilterModal
        id={FILTER_MODAL_ID}
        onApplyFilter={onApplyFilter}
        onCancel={onCloseFilterModal}
        onChangeOption={onChangeFilterOption}
        optionSelectionMap={filterSelectionMap}
        options={filterOptions}
      />

      <SortingModal
        id={SORTING_MODAL_ID}
        onChangeOption={onChangeSortOpt}
        onReset={onResetSort}
        optionSelection={sortSelection}
        options={sortingOptions}
      />

      <EarningPoolDetailModal
        detailItem={viewDetailItem}
        onCancel={onCloseDetail}
      />
    </>
  );
};

const EarningPoolSelector = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-header': {
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingLG
    },

    '.ant-sw-modal-content': {
      paddingBottom: token.padding
    },

    '&.pool-selector-input': {
      '.__selected-item': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: token.colorTextLight1,
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      },
      '.__selected-item-name': {
        textOverflow: 'ellipsis',
        fontWeight: token.headingFontWeight,
        overflow: 'hidden'
      },
      '.ant-select-modal-input-wrapper': {
        paddingTop: 0,
        paddingBottom: token.paddingXXS
      }
    },

    '.ant-select-modal-input-wrapper': {
      height: 44
    },

    '.select-pool-suffix': {
      marginRight: -token.marginSM + 2
    }
  };
});

export default EarningPoolSelector;
