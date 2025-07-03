// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { NominationInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { StakingValidatorItem } from '@subwallet/extension-koni-ui/components';
import EmptyValidator from '@subwallet/extension-koni-ui/components/Account/EmptyValidator';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field/Base';
import { EarningValidatorDetailModal } from '@subwallet/extension-koni-ui/components/Modal/Earning';
import { EARNING_CHANGE_VALIDATOR_MODAL, VALIDATOR_DETAIL_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useChainChecker, useFetchChainState, useGetPoolTargetList, useSelector, useSelectValidators } from '@subwallet/extension-koni-ui/hooks';
import { fetchPoolTarget } from '@subwallet/extension-koni-ui/messaging';
import Transaction from '@subwallet/extension-koni-ui/Popup/Transaction/Transaction';
import { store } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps, ValidatorDataType } from '@subwallet/extension-koni-ui/types';
import { getValidatorKey } from '@subwallet/extension-koni-ui/utils/transaction/stake';
import { Button, Icon, ModalContext, SwList, SwModal, useExcludeModal } from '@subwallet/react-ui';
import { Book, CaretLeft } from 'phosphor-react';
import React, { forwardRef, SyntheticEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ChangeBittensorValidator, ChangeValidator } from '../../Earning';

interface Props extends ThemeProps, BasicInputWrapper {
  modalId: string;
  chain: string;
  from: string;
  slug: string;
  title?: string;
  nominations: NominationInfo[]
  readOnly?: boolean;
  addresses?: string[];
  compound?: YieldPositionInfo;
}

const Component = (props: Props) => {
  const { addresses, chain, className = '', compound, from
    , modalId, nominations, onChange, readOnly, slug, title = 'Your validators' } = props;

  const [viewDetailItem, setViewDetailItem] = useState<ValidatorDataType | undefined>(undefined);
  const [forceFetchValidator, setForceFetchValidator] = useState(false);
  const [targetLoading, setTargetLoading] = useState(false);

  const { t } = useTranslation();
  const { activeModal, inactiveModal } = useContext(ModalContext);

  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const { poolInfoMap } = useSelector((state) => state.earning);
  const poolInfo = poolInfoMap[slug];
  const chainState = useFetchChainState(poolInfo?.chain || '');

  const maxCount = poolInfo?.statistic?.maxCandidatePerFarmer || 1;
  const { onCancelSelectValidator } = useSelectValidators(modalId, chain, maxCount, onChange);

  const networkPrefix = chainInfoMap[chain]?.substrateInfo?.addressPrefix;
  const items = useGetPoolTargetList(slug) as ValidatorDataType[];

  const maxPoolMembersValue = useMemo(() => {
    if (poolInfo.type === YieldPoolType.NATIVE_STAKING) {
      return poolInfo.maxPoolMembers;
    }

    return undefined;
  }, [poolInfo]);

  const resultList = useMemo(() => {
    if (addresses && addresses.length > 0) {
      return items.filter((item) => addresses.includes(item.address.trim()));
    }

    const nominatedValidatorAddresses = nominations.map((n) => n.validatorAddress);

    const list = items.filter((item) => nominatedValidatorAddresses.includes(item.address.trim()));

    return list;
  }, [items, nominations, addresses]);

  const handleValidatorLabel = useMemo(() => {
    const label = getValidatorLabel(chain);

    return label !== 'dApp' ? label.toLowerCase() : label;
  }, [chain]);

  const isBittensorChain = useMemo(() => {
    return poolInfo.chain === 'bittensor' || poolInfo.chain === 'bittensor_testnet';
  }, [poolInfo.chain]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      inactiveModal(modalId);
      activeModal(EARNING_CHANGE_VALIDATOR_MODAL);
    },
    [activeModal, inactiveModal, modalId]
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
  }, [handleValidatorLabel, items, setForceFetchValidator, t]);

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

  const checkChain = useChainChecker();

  useEffect(() => {
    let unmount = false;

    if ((!!poolInfo.chain && !!compound?.address && chainState?.active) || forceFetchValidator) {
      setTargetLoading(true);
      fetchPoolTarget({ slug })
        .then((result) => {
          if (!unmount) {
            store.dispatch({ type: 'earning/updatePoolTargets', payload: result });
          }
        })
        .catch(console.error)
        .finally(() => {
          if (!unmount) {
            setTargetLoading(false);
            setForceFetchValidator(false);
          }
        });
    }

    return () => {
      unmount = true;
    };
  }, [chainState?.active, forceFetchValidator, slug, poolInfo.chain, compound?.address]);

  useEffect(() => {
    chain && checkChain(chain);
  }, [chain, checkChain]);

  useExcludeModal(modalId);

  return (
    <>
      <SwModal
        className={`${className} ${!readOnly ? 'modal-full' : ''}`}
        closeIcon={(
          <Icon
            phosphorIcon={CaretLeft}
            size='md'
          />
        )}
        footer={
          !readOnly && (
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
              {t('Change validators')}
            </Button>
          )
        }
        id={modalId}
        onCancel={onCancelSelectValidator}
        title={t(title)}
      >
        <SwList
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
      {!readOnly && (
        <Transaction
          fromAddress={from}
          modalContent={true}
          modalId={EARNING_CHANGE_VALIDATOR_MODAL}
          originChain={poolInfo.chain}
        >
          {isBittensorChain
            ? (
              <ChangeBittensorValidator
                chain={poolInfo.chain}
                disabled={false}
                from={from}
                items={items}
                loading={targetLoading}
                modalId={EARNING_CHANGE_VALIDATOR_MODAL}
                nominations={nominations}
                setForceFetchValidator={setForceFetchValidator}
                slug={poolInfo.slug}
              />
            )
            : (
              <ChangeValidator
                chain={poolInfo.chain}
                disabled={false}
                from={from}
                items={items}
                loading={targetLoading}
                modalId={EARNING_CHANGE_VALIDATOR_MODAL}
                nominations={nominations}
                setForceFetchValidator={setForceFetchValidator}
                slug={poolInfo.slug}
              />
            )}
        </Transaction>
      )}
    </>
  );
};

const EarningValidatorSelectedModal = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-header': {
      '.ant-typography-ellipsis': {
        maxWidth: 'none',
        overflow: 'visible',
        textOverflow: 'initial'
      }
    },

    '.__pool-item-wrapper': {
      marginBottom: token.marginXS
    },

    '.ant-sw-modal-body': {
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },

    '.ant-sw-list': {
      flex: 1,
      overflowX: 'auto'
    },

    '.ant-sw-modal-footer': {
      margin: 0,
      borderTop: 0,
      marginBottom: token.margin
    },

    '.pool-item + .pool-item': {
      marginTop: token.marginXXS
    },

    '&.modal-full': {
      '.ant-sw-modal-header': {
        paddingTop: token.paddingXS,
        paddingBottom: token.paddingLG
      },

      '.ant-sw-list': {
        paddingLeft: token.padding,
        paddingRight: token.padding
      }
    }
  };
});

export default EarningValidatorSelectedModal;
