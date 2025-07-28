// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { NominationInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { StakingNominationItem, StakingValidatorItem } from '@subwallet/extension-koni-ui/components';
import EmptyValidator from '@subwallet/extension-koni-ui/components/Account/EmptyValidator';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field/Base';
import { EarningValidatorDetailModal } from '@subwallet/extension-koni-ui/components/Modal/Earning';
import { CHANGE_VALIDATOR_TRANSACTION, DEFAULT_CHANGE_VALIDATOR_PARAMS, VALIDATOR_DETAIL_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useFetchChainState, useGetPoolTargetList, useSelector, useSelectValidators } from '@subwallet/extension-koni-ui/hooks';
import { fetchPoolTarget } from '@subwallet/extension-koni-ui/messaging';
import Transaction from '@subwallet/extension-koni-ui/Popup/Transaction/Transaction';
import { store } from '@subwallet/extension-koni-ui/stores';
import { ChangeValidatorParams, ThemeProps, ValidatorDataType } from '@subwallet/extension-koni-ui/types';
import { getTransactionFromAccountProxyValue, reformatAddress } from '@subwallet/extension-koni-ui/utils';
import { getValidatorKey } from '@subwallet/extension-koni-ui/utils/transaction/stake';
import { Button, Icon, ModalContext, SwList, SwModal, useExcludeModal } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import { Book, CaretLeft } from 'phosphor-react';
import React, { forwardRef, SyntheticEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import ChangeBittensorValidator from './ChangeBittensorValidator';
import ChangeValidator from './ChangeValidator';

interface Props extends ThemeProps, BasicInputWrapper {
  modalId: string;
  chain: string;
  from: string;
  slug: string;
  displayType: 'validator' | 'nomination';
  title?: string;
  nominations: NominationInfo[]
  readOnly?: boolean;
  addresses?: string[];
  compound?: YieldPositionInfo;
}

const Component = (props: Props) => {
  const { addresses, chain, className = '', compound, displayType: displayTypeProps
    , from, modalId, nominations, onChange, readOnly, slug, title = 'Your validators' } = props;

  const EARNING_CHANGE_VALIDATOR_MODAL = `${modalId}-change-validator`;

  const [viewDetailItem, setViewDetailItem] = useState<ValidatorDataType | undefined>(undefined);
  const [forceFetchValidator, setForceFetchValidator] = useState(false);
  const [targetLoading, setTargetLoading] = useState(false);
  const [isChangeValidatorModalVisible, setIsChangeValidatorModalVisible] = useState<boolean>(false);

  const [, setStorage] = useLocalStorage<ChangeValidatorParams>(CHANGE_VALIDATOR_TRANSACTION, DEFAULT_CHANGE_VALIDATOR_PARAMS);
  const { t } = useTranslation();
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { currentAccountProxy } = useSelector((state) => state.accountState);

  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const { poolInfoMap } = useSelector((state) => state.earning);
  const poolInfo = poolInfoMap[slug];
  const chainState = useFetchChainState(poolInfo?.chain || '');

  const maxCount = poolInfo?.statistic?.maxCandidatePerFarmer || 1;
  const { onCancelSelectValidator } = useSelectValidators(modalId, chain, maxCount, onChange);

  const networkPrefix = chainInfoMap[chain]?.substrateInfo?.addressPrefix;
  const items = useGetPoolTargetList(slug) as ValidatorDataType[];

  const { assetRegistry } = useSelector((state) => state.assetRegistry);
  const assetInfo = assetRegistry[poolInfo.metadata.inputAsset];
  const decimals = _getAssetDecimals(assetInfo);
  const symbol = _getAssetSymbol(assetInfo);

  const maxPoolMembersValue = useMemo(() => {
    if (poolInfo.type === YieldPoolType.NATIVE_STAKING) {
      return poolInfo.maxPoolMembers;
    }

    return undefined;
  }, [poolInfo]);

  const validatortList = useMemo(() => {
    if (addresses && addresses.length > 0) {
      return items
        .filter((item) => addresses.includes(item.address.trim()))
        .map((item) => ({
          ...item
        }));
    }

    const itemMap = new Map(items.map((item) => [item.address.trim(), item]));

    const result: ValidatorDataType[] = [];

    for (const nomination of nominations) {
      const address = nomination.validatorAddress.trim();
      const item = itemMap.get(address);

      if (item) {
        result.push({
          ...item
        });
      } else {
        result.push({
          address,
          chain: nomination.chain,
          totalStake: '0',
          ownStake: '0',
          otherStake: '0',
          minBond: '0',
          nominatorCount: 0,
          commission: 0,
          expectedReturn: undefined,
          blocked: false,
          identity: nomination.validatorIdentity || '',
          isVerified: false,
          icon: undefined,
          isCrowded: false,
          eraRewardPoint: undefined,
          topQuartile: false,
          symbol: symbol,
          decimals: decimals,
          isMissingInfo: true
        });
      }
    }

    return result;
  }, [items, nominations, addresses, symbol, decimals]);

  const handleValidatorLabel = useMemo(() => {
    const label = getValidatorLabel(chain);

    return label !== 'dApp' ? label.toLowerCase() : label;
  }, [chain]);

  const isBittensorChain = useMemo(() => {
    return poolInfo.chain === 'bittensor' || poolInfo.chain === 'bittensor_testnet';
  }, [poolInfo.chain]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      setStorage({
        ...DEFAULT_CHANGE_VALIDATOR_PARAMS,
        slug: poolInfo.slug,
        from: from,
        chain: chain,
        fromAccountProxy: getTransactionFromAccountProxyValue(currentAccountProxy)
      });

      e.stopPropagation();
      inactiveModal(modalId);
      setIsChangeValidatorModalVisible(true);
      activeModal(EARNING_CHANGE_VALIDATOR_MODAL);
    },
    [EARNING_CHANGE_VALIDATOR_MODAL, activeModal, chain, currentAccountProxy, from, inactiveModal, modalId, poolInfo.slug, setStorage]
  );

  const onCancel = useCallback(() => {
    setIsChangeValidatorModalVisible(false);
  }, []);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyValidator
        isDataEmpty={items.length === 0}
        onClickReload={setForceFetchValidator}
        validatorTitle={t(handleValidatorLabel)}
      />
    );
  }, [handleValidatorLabel, items, setForceFetchValidator, t]);

  const expandNominations = useMemo(() => {
    if (!nominations || !items) {
      return nominations;
    }

    const validatorMap = items.reduce<Record<string, ValidatorDataType>>((acc, val) => {
      acc[reformatAddress(val.address)] = val;

      return acc;
    }, {});

    const mappedNominations = nominations.map((nomination) => {
      const matched = validatorMap[reformatAddress(nomination.validatorAddress)];

      return {
        ...nomination,
        validatorIdentity: matched?.identity,
        commission: matched?.commission,
        expectedReturn: matched?.expectedReturn,
        eraRewardPoint: matched?.eraRewardPoint
      };
    });

    // Find nomination have highest era pts
    const maxEraNomination = mappedNominations.reduce((max, current) => {
      const maxEra = max.eraRewardPoint ? new BigN(max.eraRewardPoint) : new BigN(0);
      const currentEra = current.eraRewardPoint ? new BigN(current.eraRewardPoint) : new BigN(0);

      return currentEra.isGreaterThan(maxEra) ? current : max;
    }, mappedNominations[0]);

    const remainingNominations = mappedNominations.filter(
      (nomination) => nomination !== maxEraNomination
    );

    // Sort nomination by apy
    const sortedRemaining = remainingNominations.sort((a, b) => {
      const aReturn = a.expectedReturn ? new BigN(a.expectedReturn) : new BigN(0);
      const bReturn = b.expectedReturn ? new BigN(b.expectedReturn) : new BigN(0);

      return bReturn.comparedTo(aReturn);
    });

    return maxEraNomination ? [maxEraNomination, ...sortedRemaining] : sortedRemaining;
  }, [items, nominations]);
  const onClickMore = useCallback((item: ValidatorDataType) => {
    return (e: SyntheticEvent) => {
      e.stopPropagation();
      setViewDetailItem(item);
      activeModal(VALIDATOR_DETAIL_MODAL);
    };
  }, [activeModal]);

  const renderItem = useCallback(
    (item: ValidatorDataType | NominationInfo) => {
      if (displayTypeProps === 'validator') {
        const validator = item as ValidatorDataType;
        const key = getValidatorKey(validator.address, validator.identity);

        return (
          <StakingValidatorItem
            apy={validator?.expectedReturn?.toString() || '0'}
            className='pool-item'
            isNominated={false}
            isSelected={false}
            key={key}
            onClickMoreBtn={onClickMore(validator)}
            prefixAddress={networkPrefix}
            showUnSelectedIcon={false}
            validatorInfo={validator}
          />
        );
      }

      const nomination = item as NominationInfo;

      return (
        <StakingNominationItem
          className='pool-item'
          isChangeValidator={true}
          isSelectable={false}
          isSelected={false}
          nominationInfo={nomination}
          poolInfo={poolInfo}
        />
      );
    },
    [displayTypeProps, networkPrefix, onClickMore, poolInfo]
  );

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
              {t('ui.EARNING.components.Modal.Earning.Validator.changeValidators')}
            </Button>
          )
        }
        id={modalId}
        onCancel={onCancelSelectValidator}
        title={t(title)}
      >
        <SwList
          list={displayTypeProps === 'validator' ? validatortList : expandNominations}
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

      {!readOnly && isChangeValidatorModalVisible && (
        <Transaction
          modalContent={true}
          modalId={EARNING_CHANGE_VALIDATOR_MODAL}
          transactionType={ExtrinsicType.CHANGE_EARNING_VALIDATOR}
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
                nominations={expandNominations}
                onCancel={onCancel}
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
                nominations={expandNominations}
                onCancel={onCancel}
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
      marginBottom: token.marginXXS
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
      marginTop: token.marginXS
    },

    '&.modal-full': {
      '.ant-sw-modal-header': {
        paddingTop: token.paddingXS,
        paddingBottom: token.paddingSM
      },

      '.ant-sw-list': {
        paddingLeft: token.padding,
        paddingRight: token.padding
      }
    }
  };
});

export default EarningValidatorSelectedModal;
