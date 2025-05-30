// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { NominationInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { StakingValidatorItem } from '@subwallet/extension-koni-ui/components';
import EmptyValidator from '@subwallet/extension-koni-ui/components/Account/EmptyValidator';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field/Base';
import { EarningValidatorDetailModal } from '@subwallet/extension-koni-ui/components/Modal/Earning';
import { EARNING_CHANGE_VALIDATOR_MODAL, VALIDATOR_DETAIL_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useChainChecker, useGetPoolTargetList, useSelector, useSelectValidators } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps, ValidatorDataType } from '@subwallet/extension-koni-ui/types';
import { getValidatorKey } from '@subwallet/extension-koni-ui/utils/transaction/stake';
import { Button, Icon, InputRef, ModalContext, SwList, SwModal, useExcludeModal } from '@subwallet/react-ui';
import { Book, CaretLeft } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, SyntheticEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import EarningValidatorSelectorSubmit from '../../Field/Earning/EarningValidatorSelectorSubmit';

interface Props extends ThemeProps, BasicInputWrapper {
  modalId: string;
  chain: string;
  from: string;
  slug: string;
  nominations: NominationInfo[]
  setForceFetchValidator: (val: boolean) => void;
  disabledButton?: boolean;
  addresses?: string[];
}

const Component = (props: Props, ref: ForwardedRef<InputRef>) => {
  const { addresses, chain, className = '', disabledButton, from
    , loading, modalId, nominations, onChange, setForceFetchValidator, slug } = props;
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);

  useExcludeModal(modalId);

  const items = useGetPoolTargetList(slug) as ValidatorDataType[];
  const networkPrefix = chainInfoMap[chain]?.substrateInfo?.addressPrefix;

  const { poolInfoMap } = useSelector((state) => state.earning);

  const poolInfo = poolInfoMap[slug];
  const maxCount = poolInfo?.statistic?.maxCandidatePerFarmer || 1;

  const maxPoolMembersValue = useMemo(() => {
    if (poolInfo.type === YieldPoolType.NATIVE_STAKING) {
      return poolInfo.maxPoolMembers;
    }

    return undefined;
  }, [poolInfo]);

  const { onCancelSelectValidator } = useSelectValidators(modalId, chain, maxCount, onChange);

  const [viewDetailItem, setViewDetailItem] = useState<ValidatorDataType | undefined>(undefined);

  const checkChain = useChainChecker();

  useEffect(() => {
    chain && checkChain(chain);
  }, [chain, checkChain]);

  const resultList = useMemo(() => {
    if (addresses && addresses.length > 0) {
      return items.filter((item) => addresses.includes(item.address.trim()));
    }

    const nominatedValidatorAddresses = nominations.map((n) => n.validatorAddress);

    return items.filter((item) => nominatedValidatorAddresses.includes(item.address.trim()));
  }, [items, nominations, addresses]);

  const handleValidatorLabel = useMemo(() => {
    const label = getValidatorLabel(chain);

    return label !== 'dApp' ? label.toLowerCase() : label;
  }, [chain]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      activeModal(EARNING_CHANGE_VALIDATOR_MODAL);
    },
    [activeModal]
  );

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

    return (
      <StakingValidatorItem
        apy={item?.expectedReturn?.toString() || '0'}
        className={'pool-item'}
        isNominated={false}
        isSelected={false}
        key={key}
        onClickMoreBtn={onClickMore(item)}
        prefixAddress = {networkPrefix}
        showUnSelectedIcon={false}
        validatorInfo={item}
      />
    );
  }, [networkPrefix, onClickMore]);

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
        footer={
          !disabledButton && (
            <Button
              block
              icon={(
                <Icon
                  phosphorIcon={Book}
                  weight={'fill'}
                />
              )}
              onClick={onClick}
            >
              {t('Change validator')}
            </Button>
          )
        }
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
      <EarningValidatorSelectorSubmit
        chain={poolInfo.chain}
        disabled={false}
        from={from}
        items={items}
        loading={loading}
        modalId={EARNING_CHANGE_VALIDATOR_MODAL}
        nominations={nominations}
        setForceFetchValidator={setForceFetchValidator}
        slug={poolInfo.slug}
      />
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
