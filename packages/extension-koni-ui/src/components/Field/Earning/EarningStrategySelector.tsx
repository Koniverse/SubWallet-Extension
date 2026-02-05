// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RELAY_HANDLER_DIRECT_STAKING_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import { NominationInfo } from '@subwallet/extension-base/types';
import { SelectValidatorInput } from '@subwallet/extension-koni-ui/components';
import EmptyValidator from '@subwallet/extension-koni-ui/components/Account/EmptyValidator';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field/Base';
import { EarningStrategyDetailModal } from '@subwallet/extension-koni-ui/components/Modal/Earning';
import { FilterModal } from '@subwallet/extension-koni-ui/components/Modal/FilterModal';
import { SortingModal } from '@subwallet/extension-koni-ui/components/Modal/SortingModal';
import { STRATEGY_DETAIL_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useFilterModal, useGetPoolTargetList, useSelector, useSelectValidators, useYieldPositionDetail } from '@subwallet/extension-koni-ui/hooks';
import { StrategyDataType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getValidatorKey } from '@subwallet/extension-koni-ui/utils/transaction/stake';
import { Badge, Button, Icon, InputRef, ModalContext, SwList, SwModal, useExcludeModal } from '@subwallet/react-ui';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import BigN from 'bignumber.js';
import { CaretLeft, FadersHorizontal, SortAscending } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, SyntheticEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import StakingStrategyItem from '../../StakingItem/StakingStrategyItem';

interface Props extends ThemeProps, BasicInputWrapper {
  chain: string;
  from: string;
  slug: string;
  originValidator?: string;
  onClickBookButton?: (e: SyntheticEvent) => void;
  onClickLightningButton?: (e: SyntheticEvent) => void;
  isSingleSelect?: boolean;
  setForceFetchValidator: (val: boolean) => void;
}

enum SortKey {
  COMMISSION = 'commission',
  RETURN = 'return',
  MIN_STAKE = 'min-stake',
  NOMINATING = 'nominating',
  DEFAULT = 'default'
}

interface SortOption {
  label: string;
  value: SortKey;
  desc: boolean;
}

const SORTING_MODAL_ID = 'nominated-sorting-modal';
const FILTER_MODAL_ID = 'nominated-filter-modal';

const filterOptions = [
  {
    label: 'Active validator',
    value: '1'
  },
  {
    label: 'Waiting list',
    value: '2'
  },
  {
    label: 'Locked',
    value: '3'
  },
  {
    label: 'Destroying',
    value: '4'
  }
];

const defaultModalId = 'multi-validator-selector';

const Component = (props: Props, ref: ForwardedRef<InputRef>) => {
  const { chain, className = '', from
    , id = defaultModalId, isSingleSelect: _isSingleSelect = false,
    loading, onChange, setForceFetchValidator
    , slug, value, originValidator } = props;
  const { t } = useTranslation();
  const { activeModal, checkActive } = useContext(ModalContext);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);

  useExcludeModal(id);
  const isActive = checkActive(id);

  const sectionRef = useRef<SwListSectionRef>(null);

  const items = useGetPoolTargetList(slug) as StrategyDataType[];
  const networkPrefix = chainInfoMap[chain]?.substrateInfo?.addressPrefix;

  const { compound } = useYieldPositionDetail(slug, from);

  const { poolInfoMap } = useSelector((state) => state.earning);

  const poolInfo = poolInfoMap[slug];
  const maxCount = poolInfo?.statistic?.maxCandidatePerFarmer || 1;

  // const cachedNominations = useMemo(() => compound?.nominations || [], [compound]);

  const [nominations] = useState<NominationInfo[]>(compound?.nominations || []); // Remove set Nomination
  const isRelayChain = useMemo(() => RELAY_HANDLER_DIRECT_STAKING_CHAINS.includes(chain), [chain]);
  const isSingleSelect = useMemo(() => _isSingleSelect || !isRelayChain, [_isSingleSelect, isRelayChain]);
  const hasReturn = useMemo(() => items[0]?.expectedReturn !== undefined, [items]);

  const sortingOptions: SortOption[] = useMemo(() => {
    const result: SortOption[] = [
      {
        desc: false,
        label: t('ui.EARNING.components.Field.Earning.StrategySelector.lowestCommission'),
        value: SortKey.COMMISSION
      }
    ];

    if (hasReturn) {
      result.push({
        desc: true,
        label: t('ui.EARNING.components.Field.Earning.StrategySelector.highestAnnualReturn'),
        value: SortKey.RETURN
      });
    }

    if (nominations && nominations.length > 0) {
      result.push({
        desc: true,
        label: t('ui.EARNING.components.Field.Earning.StrategySelector.nomination'),
        value: SortKey.NOMINATING
      });
    }

    result.push({
      desc: false,
      label: t('ui.EARNING.components.Field.Earning.ValidatorSelector.lowestMinActiveStake'),
      value: SortKey.MIN_STAKE
    });

    return result;
  }, [t, hasReturn, nominations]);

  const { changeValidators,
    onApplyChangeValidators,
    onCancelSelectValidator,
    onChangeSelectedValidator } = useSelectValidators(id, chain, maxCount, onChange, isSingleSelect);

  const [viewDetailItem, setViewDetailItem] = useState<StrategyDataType | undefined>(undefined);
  const [sortSelection, setSortSelection] = useState<SortKey>(SortKey.DEFAULT);
  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, onResetFilter, selectedFilters } = useFilterModal(FILTER_MODAL_ID);

  const nominatorValueList = useMemo(() => {
    return nominations && nominations.length
      ? nominations.map((item) => getValidatorKey(item.validatorAddress, item.validatorIdentity))
      : [];
  }, [nominations]);

  const resultList = useMemo((): StrategyDataType[] => {
    return [...items].sort((a: StrategyDataType, b: StrategyDataType) => {
      switch (sortSelection) {
        case SortKey.RETURN:
          return (b.expectedReturn || 0) - (a.expectedReturn || 0);
        case SortKey.MIN_STAKE:
          return new BigN(a.minBond).minus(b.minBond).toNumber();

        default:
          return 0;
      }
    });
  }, [items, sortSelection]);

  const filterFunction = useMemo<(item: StrategyDataType) => boolean>(() => {
    return (item) => {
      if (!selectedFilters.length) {
        return true;
      }

      // todo: logic filter here

      return true;
    };
  }, [selectedFilters]);

  const onResetSort = useCallback(() => {
    setSortSelection(SortKey.DEFAULT);
  }, []);

  const onChangeSortOpt = useCallback((value: string) => {
    setSortSelection(value as SortKey);
  }, []);

  const onClickItem = useCallback((value: string) => {
    onChangeSelectedValidator(value);
  }, [onChangeSelectedValidator]);

  const onClickMore = useCallback((item: StrategyDataType) => {
    return (e: SyntheticEvent) => {
      e.stopPropagation();
      setViewDetailItem(item);
      activeModal(STRATEGY_DETAIL_MODAL);
    };
  }, [activeModal]);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyValidator
        isDataEmpty={items.length === 0}
        onClickReload={setForceFetchValidator}
        validatorTitle={t('ui.EARNING.components.Field.Earning.StrategySelector.noStrategyAvailable')}
      />
    );
  }, [items.length, setForceFetchValidator, t]);

  const renderItem = useCallback((item: StrategyDataType) => {
    if (item.address === originValidator) {
      return null;
    }

    const key = getValidatorKey(item.address, item.identity);
    const keyBase = key.split('___')[0];

    const selected = changeValidators.includes(key);
    const nominated = nominatorValueList.includes(key) || nominatorValueList.some((nom) => nom.split('___')[0] === keyBase);

    return (
      <StakingStrategyItem
        apy={item?.expectedReturn?.toString() || '0'}
        className={'strategy-item'}
        isNominated={nominated}
        isSelected={selected}
        key={key}
        onClick={onClickItem}
        onClickMoreBtn={onClickMore(item)}
        prefixAddress = {networkPrefix}
        strategyInfo={item}
      />
    );
  }, [changeValidators, networkPrefix, nominatorValueList, onClickItem, onClickMore, originValidator]);

  const onClickActionBtn = useCallback(() => {
    activeModal(FILTER_MODAL_ID);
  }, [activeModal]);

  const searchFunction = useCallback((item: StrategyDataType, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();

    return (
      item.address.toLowerCase().includes(searchTextLowerCase) ||
      (item.identity
        ? item.identity.toLowerCase().includes(searchTextLowerCase)
        : false)
    );
  }, []);

  const onActiveValidatorSelector = useCallback(() => {
    activeModal(id);
  }, [activeModal, id]);

  useEffect(() => {
    if (!isActive) {
      setSortSelection(SortKey.DEFAULT);
      setTimeout(() => {
        sectionRef.current?.setSearchValue('');
      }, 100);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      onResetFilter();
    }
  }, [isActive, onResetFilter]);

  return (
    <>
      <SelectValidatorInput
        chain={chain}
        disabled={!chain || !from}
        identPrefix={networkPrefix}
        label={t('ui.EARNING.components.Field.Earning.StrategySelector.selectStrategy')}
        loading={loading}
        onClick={onActiveValidatorSelector}
        placeholder={t('ui.EARNING.components.Field.Earning.StrategySelector.selectStrategy')}
        value={value || ''}
      />
      <SwModal
        className={`${className} modal-full`}
        closeIcon={(
          <Icon
            phosphorIcon={CaretLeft}
            size='md'
          />
        )}
        footer={(
          <Button
            block
            disabled={!changeValidators.length}
            onClick={onApplyChangeValidators}
          >
            {t('ui.EARNING.components.Field.Earning.StrategySelector.apply')}
          </Button>
        )}
        id={id}
        onCancel={onCancelSelectValidator}
        rightIconProps={{
          icon: (
            <Badge
              className={'g-filter-badge'}
              dot={sortSelection !== SortKey.DEFAULT}
            >
              <Icon phosphorIcon={SortAscending} />
            </Badge>
          ),
          onClick: () => {
            activeModal(SORTING_MODAL_ID);
          }
        }}
        title={t('ui.EARNING.components.Field.Earning.StrategySelector.selectStrategy')}
      >
        <SwList.Section
          actionBtnIcon={<Icon phosphorIcon={FadersHorizontal} />}
          enableSearchInput={true}
          filterBy={filterFunction}
          list={resultList}
          onClickActionBtn={onClickActionBtn}
          ref={sectionRef}
          renderItem={renderItem}
          renderWhenEmpty={renderEmpty}
          searchFunction={searchFunction}
          searchMinCharactersCount={2}
          searchPlaceholder={t<string>('ui.EARNING.components.Field.Earning.StrategySelector.searchStrategy')}
          // showActionBtn
        />
      </SwModal>

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

      {viewDetailItem && (
        <EarningStrategyDetailModal
          chain={chain}
          strategyItem={viewDetailItem}
        />
      )}
    </>
  );
};

const EarningStrategySelector = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-header': {
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingSM
    },

    '.ant-sw-list-search-input': {
      paddingBottom: token.paddingSM
    },

    '.__pool-item-wrapper': {
      marginBottom: token.marginXS
    },

    '.ant-sw-modal-body': {
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },

    '.ant-sw-modal-footer': {
      margin: 0,
      marginTop: token.marginXS,
      borderTop: 0,
      marginBottom: token.margin
    },

    '.strategy-item:not(:last-child)': {
      marginBottom: token.marginXS
    }
  };
});

export default EarningStrategySelector;
