// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChainRecommendValidator } from '@subwallet/extension-base/constants';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { NominationInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { fetchStaticData } from '@subwallet/extension-base/utils';
import { StakingValidatorItem } from '@subwallet/extension-koni-ui/components';
import EmptyValidator from '@subwallet/extension-koni-ui/components/Account/EmptyValidator';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field/Base';
import { EarningValidatorDetailModal } from '@subwallet/extension-koni-ui/components/Modal/Earning';
import { VALIDATOR_DETAIL_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetPoolTargetList, useSelector, useSelectValidators } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps, ValidatorDataType } from '@subwallet/extension-koni-ui/types';
import { getValidatorKey } from '@subwallet/extension-koni-ui/utils/transaction/stake';
import { Button, Icon, InputRef, ModalContext, SwList, SwModal, useExcludeModal } from '@subwallet/react-ui';
import { Book, CaretLeft } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, SyntheticEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps, BasicInputWrapper {
  modalId: string;
  chain: string;
  from: string;
  slug: string;
  nominations: NominationInfo[]
  setForceFetchValidator: (val: boolean) => void;
}

const Component = (props: Props, ref: ForwardedRef<InputRef>) => {
  const { chain, className = '', modalId, nominations, onChange
    , setForceFetchValidator, slug } = props;
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);

  useExcludeModal(modalId);

  const items = useGetPoolTargetList(slug) as ValidatorDataType[];
  const networkPrefix = chainInfoMap[chain]?.substrateInfo?.addressPrefix;

  const { poolInfoMap } = useSelector((state) => state.earning);

  const poolInfo = poolInfoMap[slug];
  const maxCount = poolInfo?.statistic?.maxCandidatePerFarmer || 1;

  const [defaultPoolMap, setDefaultPoolMap] = useState<Record<string, ChainRecommendValidator>>({});

  const maxPoolMembersValue = useMemo(() => {
    if (poolInfo.type === YieldPoolType.NATIVE_STAKING) {
      return poolInfo.maxPoolMembers;
    }

    return undefined;
  }, [poolInfo]);

  const { changeValidators,
    onApplyChangeValidators,
    onCancelSelectValidator,
    onInitValidators } = useSelectValidators(modalId, chain, maxCount, onChange);

  const [viewDetailItem, setViewDetailItem] = useState<ValidatorDataType | undefined>(undefined);
  const [autoValidator, setAutoValidator] = useState('');

  const nominatorValueList = useMemo(() => {
    return nominations?.map((item) => getValidatorKey(item.validatorAddress, item.validatorIdentity)) || [];
  }, [nominations]);

  const resultList = useMemo(() => {
    const nominatedValidatorAddresses = new Set(nominations.map((n) => n.validatorAddress));

    return items.filter((item) => nominatedValidatorAddresses.has(item.address));
  }, [items, nominations]);

  const handleValidatorLabel = useMemo(() => {
    const label = getValidatorLabel(chain);

    return label !== 'dApp' ? label.toLowerCase() : label;
  }, [chain]);

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
        validatorTitle={t(handleValidatorLabel)}
      />
    );
  }, [handleValidatorLabel, items.length, setForceFetchValidator, t]);

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
        onClickMoreBtn={onClickMore(item)}
        prefixAddress = {networkPrefix}
        validatorInfo={item}
      />
    );
  }, [changeValidators, networkPrefix, nominatorValueList, onClickMore]);

  useEffect(() => {
    fetchStaticData<Record<string, ChainRecommendValidator>>('direct-nomination-validator').then((earningPoolRecommendation) => {
      setDefaultPoolMap(earningPoolRecommendation);
    }).catch(console.error);
  }, []);

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
            icon={(
              <Icon
                phosphorIcon={Book}
                weight={'fill'}
              />
            )}
            onClick={onApplyChangeValidators}
          >
            {t('Change validator')}
          </Button>
        )}
        id={modalId}
        onCancel={onCancelSelectValidator}
        title={t('Selected validators')}
      >
        <SwList.Section

          list={resultList}
          renderItem={renderItem}
          renderWhenEmpty={renderEmpty}
        />
      </SwModal>

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

const EarningValidatorSelectedModal = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-header': {
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingLG
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
      marginBottom: token.marginXS
    }
  };
});

export default EarningValidatorSelectedModal;
