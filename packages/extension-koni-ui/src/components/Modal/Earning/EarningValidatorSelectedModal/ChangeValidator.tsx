// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType, NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { NominationInfo, SubmitChangeValidatorStaking, ValidatorInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { StakingValidatorItem } from '@subwallet/extension-koni-ui/components';
import EmptyValidator from '@subwallet/extension-koni-ui/components/Account/EmptyValidator';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field/Base';
import { EarningValidatorDetailModal } from '@subwallet/extension-koni-ui/components/Modal/Earning';
import { FilterModal } from '@subwallet/extension-koni-ui/components/Modal/FilterModal';
import { SortingModal } from '@subwallet/extension-koni-ui/components/Modal/SortingModal';
import { VALIDATOR_DETAIL_MODAL } from '@subwallet/extension-koni-ui/constants';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useChainChecker, useFilterModal, useHandleSubmitTransaction, usePreCheckAction, useSelector, useSelectValidators } from '@subwallet/extension-koni-ui/hooks';
import { changeEarningValidator } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps, ValidatorDataType } from '@subwallet/extension-koni-ui/types';
import { getValidatorKey } from '@subwallet/extension-koni-ui/utils/transaction/stake';
import { Badge, Button, Icon, ModalContext, SwList, SwModal, useExcludeModal } from '@subwallet/react-ui';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import BigN from 'bignumber.js';
import { CaretLeft, CheckCircle, FadersHorizontal, SortAscending } from 'phosphor-react';
import React, { forwardRef, SyntheticEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps, BasicInputWrapper {
  modalId: string;
  chain: string;
  from: string;
  slug: string;
  items: ValidatorDataType[];
  nominations: NominationInfo[]
  onClickBookButton?: (e: SyntheticEvent) => void;
  onClickLightningButton?: (e: SyntheticEvent) => void;
  isSingleSelect?: boolean;
  setForceFetchValidator: (val: boolean) => void;
  onCancel?: VoidFunction,
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

const Component = (props: Props) => {
  const { chain, className = '', from
    , isSingleSelect: _isSingleSelect = false,
    items, modalId, nominations
    , onCancel, onChange, setForceFetchValidator, slug } = props;

  const [submitLoading, setSubmitLoading] = useState(false);
  const [viewDetailItem, setViewDetailItem] = useState<ValidatorDataType | undefined>(undefined);
  const [sortSelection, setSortSelection] = useState<SortKey>(SortKey.DEFAULT);
  const [selectedValidators, setSelectedValidators] = useState<ValidatorInfo[]>([]);

  const { t } = useTranslation();
  const { activeModal, checkActive } = useContext(ModalContext);
  const { alertModal: { close: closeAlert, open: openAlert } } = useContext(WalletModalContext);
  const isActive = checkActive(modalId);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);

  const onPreCheck = usePreCheckAction(from);
  const { onError, onSuccess } = useHandleSubmitTransaction();

  const sectionRef = useRef<SwListSectionRef>(null);
  const networkPrefix = chainInfoMap[chain]?.substrateInfo?.addressPrefix;

  const { poolInfoMap } = useSelector((state) => state.earning);
  const poolInfo = poolInfoMap[slug];
  const maxCount = poolInfo?.statistic?.maxCandidatePerFarmer || 1;

  const isRelayChain = useMemo(() => _STAKING_CHAIN_GROUP.relay.includes(chain), [chain]);
  const isSingleSelect = useMemo(() => _isSingleSelect || !isRelayChain, [_isSingleSelect, isRelayChain]);
  const hasReturn = useMemo(() => items[0]?.expectedReturn !== undefined, [items]);

  const maxPoolMembersValue = useMemo(() => {
    if (poolInfo.type === YieldPoolType.NATIVE_STAKING) {
      return poolInfo.maxPoolMembers;
    }

    return undefined;
  }, [poolInfo]);

  const sortingOptions: SortOption[] = useMemo(() => {
    const result: SortOption[] = [
      {
        desc: false,
        label: t('Lowest commission'),
        value: SortKey.COMMISSION
      }
    ];

    if (hasReturn) {
      result.push({
        desc: true,
        label: t('Highest annual return'),
        value: SortKey.RETURN
      });
    }

    if (nominations && nominations.length > 0) {
      result.push({
        desc: true,
        label: t('Nomination'),
        value: SortKey.NOMINATING
      });
    }

    result.push({
      desc: false,
      label: t('Lowest min active stake'),
      value: SortKey.MIN_STAKE
    });

    return result;
  }, [t, hasReturn, nominations]);

  const { changeValidators,
    onCancelSelectValidator,
    onChangeSelectedValidator } = useSelectValidators(modalId, chain, maxCount, onChange, isSingleSelect);

  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, onResetFilter, selectedFilters } = useFilterModal(FILTER_MODAL_ID);

  const fewValidators = changeValidators.length > 1;

  const applyLabel = useMemo(() => {
    if (!fewValidators) {
      return detectTranslate('Apply {{number}} validator');
    } else {
      return detectTranslate('Apply {{number}} validators');
    }
  }, [fewValidators]);

  const nominatorValueList = useMemo(() => {
    return nominations && nominations.length
      ? nominations.map((item) => getValidatorKey(item.validatorAddress, item.validatorIdentity))
      : [];
  }, [nominations]);

  const sortValidator = useCallback((a: ValidatorDataType, b: ValidatorDataType) => {
    const aKey = getValidatorKey(a.address, a.identity).split('___')[0];
    const bKey = getValidatorKey(b.address, b.identity).split('___')[0];

    // Compare address only in case nominatorValueList lacks identity but validator keys include it
    const hasA = nominatorValueList.some((nom) => nom.startsWith(aKey));
    const hasB = nominatorValueList.some((nom) => nom.startsWith(bKey));

    if (hasA && !hasB) {
      return -1;
    }

    if (!hasA && hasB) {
      return 1;
    }

    return 0;
  }, [nominatorValueList]);

  const resultList = useMemo((): ValidatorDataType[] => {
    return [...items].sort((a: ValidatorDataType, b: ValidatorDataType) => {
      switch (sortSelection) {
        case SortKey.COMMISSION:
          return a.commission - b.commission;
        case SortKey.RETURN:
          return (b.expectedReturn || 0) - (a.expectedReturn || 0);
        case SortKey.MIN_STAKE:
          return new BigN(a.minBond).minus(b.minBond).toNumber();
        case SortKey.NOMINATING:
          return sortValidator(a, b);

        case SortKey.DEFAULT:
          if (a.isCrowded && !b.isCrowded) {
            return 1;
          } else if (!a.isCrowded && b.isCrowded) {
            return -1;
          } else {
            return 0;
          }

        default:
          return 0;
      }
    });
  }, [items, sortSelection, sortValidator]);

  const filterFunction = useMemo<(item: ValidatorDataType) => boolean>(() => {
    return (item) => {
      if (!selectedFilters.length) {
        return true;
      }

      // todo: logic filter here

      return true;
    };
  }, [selectedFilters]);

  const isNoValidatorChanged = useMemo(() => {
    if (changeValidators.length !== nominatorValueList.length) {
      return false;
    }

    const selectedSet = new Set(changeValidators);

    return nominatorValueList.every((validator) => selectedSet.has(validator));
  }, [changeValidators, nominatorValueList]);

  const submit = useCallback((target: ValidatorInfo[]) => {
    const submitData: SubmitChangeValidatorStaking = {
      slug: poolInfo.slug,
      address: from,
      amount: '0',
      selectedValidators: target
    };

    setSubmitLoading(true);

    setTimeout(() => {
      changeEarningValidator(submitData)
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setSubmitLoading(false);
        });
    }, 300);
  }, [poolInfo.slug, from, onError, onSuccess]);

  const onClickSubmit = useCallback((values: { target: ValidatorInfo[] }) => {
    const { target } = values;

    if (isNoValidatorChanged) {
      openAlert({
        type: NotificationType.INFO,
        content: t('Your new selections of validators is the same as the original selection. Do you still want to continue?'),
        title: t('No changes detected!'),
        okButton: {
          text: t('Continue'),
          onClick: () => {
            closeAlert();
            submit(target);
          }
        },
        cancelButton: {
          text: t('Cancel'),
          onClick: closeAlert
        }
      });

      return;
    }

    submit(target);
  }, [isNoValidatorChanged, openAlert, t, closeAlert, submit]);

  const onResetSort = useCallback(() => {
    setSortSelection(SortKey.DEFAULT);
  }, []);

  const onChangeSortOpt = useCallback((value: string) => {
    setSortSelection(value as SortKey);
  }, []);

  const onClickItem = useCallback((value: string) => {
    onChangeSelectedValidator(value);
  }, [onChangeSelectedValidator]);

  const onClickMore = useCallback((item: ValidatorDataType) => {
    return (e: SyntheticEvent) => {
      e.stopPropagation();
      setViewDetailItem(item);
      activeModal(VALIDATOR_DETAIL_MODAL);
    };
  }, [activeModal]);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyValidator
        isDataEmpty={items.length === 0}
        onClickReload={setForceFetchValidator}
        validatorTitle={t('Validators')}
      />
    );
  }, [items.length, setForceFetchValidator, t]);

  const renderItem = useCallback((item: ValidatorDataType) => {
    const key = getValidatorKey(item.address, item.identity);
    const keyBase = key.split('___')[0];

    const selected = changeValidators.includes(key);
    const nominated = nominatorValueList.includes(key) || nominatorValueList.some((nom) => nom.split('___')[0] === keyBase);

    return (
      <StakingValidatorItem
        apy={item?.expectedReturn?.toString() || '0'}
        className={'pool-item'}
        isNominated={nominated}
        isSelected={selected}
        key={key}
        onClick={onClickItem}
        onClickMoreBtn={onClickMore(item)}
        prefixAddress = {networkPrefix}
        validatorInfo={item}
      />
    );
  }, [changeValidators, networkPrefix, nominatorValueList, onClickItem, onClickMore]);

  const onClickActionBtn = useCallback(() => {
    activeModal(FILTER_MODAL_ID);
  }, [activeModal]);

  const searchFunction = useCallback((item: ValidatorDataType, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();

    return (
      item.address.toLowerCase().includes(searchTextLowerCase) ||
      (item.identity
        ? item.identity.toLowerCase().includes(searchTextLowerCase)
        : false)
    );
  }, []);

  const handleCancel = useCallback(() => {
    onCancelSelectValidator();

    onCancel?.();
  }, [onCancelSelectValidator, onCancel]);

  useEffect(() => {
    const selected = changeValidators
      .map((key) => {
        const [address] = key.split('___');

        return items.find((item) => item.address === address);
      })
      .filter((item): item is ValidatorDataType => !!item)
      .map((item) => ({ ...item }));

    setSelectedValidators(selected);
  }, [changeValidators, items]);

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

  const checkChain = useChainChecker();

  useEffect(() => {
    chain && checkChain(chain);
  }, [chain, checkChain]);

  useExcludeModal(modalId);

  return (
    <>
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
            icon={(
              <Icon
                phosphorIcon={CheckCircle}
                weight={'fill'}
              />
            )}
            loading={submitLoading}
            onClick={onPreCheck(() => onClickSubmit({ target: selectedValidators }), ExtrinsicType.CHANGE_EARNING_VALIDATOR)}
          >
            {t(applyLabel, { number: changeValidators.length })}
          </Button>
        )}
        id={modalId}
        onCancel={handleCancel}
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
        title={t('Select validators')}
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
          searchPlaceholder={t<string>('Search validator')}
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
        <EarningValidatorDetailModal
          chain={chain}
          maxPoolMembersValue={maxPoolMembersValue}
          validatorItem={viewDetailItem}
        />
      )}
    </>
  );
};

const ChangeValidator = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-list-search-input': {
      paddingBottom: token.paddingSM
    },

    '.ant-sw-modal-header': {
      paddingTop: token.paddingXS,
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

    '.pool-item:not(:last-child)': {
      marginBottom: token.marginXXS
    }
  };
});

export default ChangeValidator;
