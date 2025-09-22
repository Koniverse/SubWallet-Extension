// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AlertModal, Layout, PageWrapper, RecheckChainConnectionModal } from '@subwallet/extension-koni-ui/components';
import { CANCEL_UN_STAKE_TRANSACTION, CHANGE_VALIDATOR_TRANSACTION, CLAIM_BRIDGE_TRANSACTION, CLAIM_REWARD_TRANSACTION, DEFAULT_CANCEL_UN_STAKE_PARAMS, DEFAULT_CHANGE_VALIDATOR_PARAMS, DEFAULT_CLAIM_AVAIL_BRIDGE_PARAMS, DEFAULT_CLAIM_REWARD_PARAMS, DEFAULT_EARN_PARAMS, DEFAULT_GOV_REFERENDUM_UNVOTE_PARAMS, DEFAULT_GOV_REFERENDUM_VOTE_PARAMS, DEFAULT_GOV_UNLOCK_VOTE_PARAMS, DEFAULT_NFT_PARAMS, DEFAULT_SWAP_PARAMS, DEFAULT_TRANSACTION_PARAMS, DEFAULT_TRANSFER_PARAMS, DEFAULT_UN_STAKE_PARAMS, DEFAULT_WITHDRAW_PARAMS, EARN_TRANSACTION, GOV_REFERENDUM_UNVOTE_TRANSACTION, GOV_REFERENDUM_VOTE_TRANSACTION, GOV_UNLOCK_VOTE_TRANSACTION, NFT_TRANSACTION, SWAP_TRANSACTION, TRANSACTION_TITLE_MAP, TRANSFER_TRANSACTION, UN_STAKE_TRANSACTION, WITHDRAW_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { TransactionContext, TransactionContextProps } from '@subwallet/extension-koni-ui/contexts/TransactionContext';
import { useAlert, useChainChecker, useNavigateOnChangeAccount, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ManageChainsParam, Theme, ThemeProps, TransactionFormBaseProps } from '@subwallet/extension-koni-ui/types';
import { detectTransactionPersistKey, getTransactionFromAccountProxyValue } from '@subwallet/extension-koni-ui/utils';
import { ButtonProps, ModalContext, SwSubHeader } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

interface Props extends ThemeProps {
  title?: string,
  transactionType?: ExtrinsicType
  children?: React.ReactNode;
  modalContent?: boolean;
  modalId?: string;
}

const recheckChainConnectionModalId = 'recheck-chain-connection-modal-id';
const alertModalId = 'transaction-alert-modal-id';

function Component ({ children, className, modalContent, modalId, transactionType: transactionTypeProps }: Props) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeModal, inactiveModal } = useContext(ModalContext);

  const dataContext = useContext(DataContext);

  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);

  const { alertProps, closeAlert, openAlert } = useAlert(alertModalId);
  const [recheckingChain, setRecheckingChain] = useState<string | undefined>();
  const [forceRerenderKey, setForceRerenderKey] = useState('ForceRerenderKey');

  const transactionType = useMemo((): ExtrinsicType => {
    if (transactionTypeProps) {
      return transactionTypeProps;
    }

    const pathName = location.pathname;
    const action = pathName.split('/')[2] || '';

    switch (action) {
      case 'earn':
        return ExtrinsicType.JOIN_YIELD_POOL;
      case 'unstake':
        return ExtrinsicType.STAKING_LEAVE_POOL;
      case 'cancel-unstake':
        return ExtrinsicType.STAKING_CANCEL_UNSTAKE;
      case 'claim-reward':
        return ExtrinsicType.STAKING_CLAIM_REWARD;
      case 'withdraw':
        return ExtrinsicType.STAKING_WITHDRAW;
      case 'compound':
        return ExtrinsicType.STAKING_COMPOUNDING;
      case 'send-nft':
        return ExtrinsicType.SEND_NFT;
      case 'swap':
        return ExtrinsicType.SWAP;
      case 'claim-bridge':
        return ExtrinsicType.CLAIM_BRIDGE;
      case 'gov-ref-vote':
        return ExtrinsicType.GOV_VOTE;
      case 'gov-ref-unvote':
        return ExtrinsicType.GOV_UNVOTE;
      case 'gov-unlock-vote':
        return ExtrinsicType.GOV_UNLOCK_VOTE;
      case 'send-fund':
      default:
        return ExtrinsicType.TRANSFER_BALANCE;
    }
  }, [location.pathname, transactionTypeProps]);

  const storageKey = useMemo((): string => detectTransactionPersistKey(transactionType), [transactionType]);

  const defaultTransactionStorageValue = useMemo(() => {
    const fromAccountProxy = getTransactionFromAccountProxyValue(currentAccountProxy);

    if (storageKey === NFT_TRANSACTION) {
      return {
        ...DEFAULT_NFT_PARAMS,
        fromAccountProxy
      };
    }

    if (storageKey === TRANSFER_TRANSACTION) {
      return {
        ...DEFAULT_TRANSFER_PARAMS,
        fromAccountProxy
      };
    }

    // STAKE_TRANSACTION current is deprecated
    // if (storageKey === STAKE_TRANSACTION) {
    //   return {
    //     ...DEFAULT_STAKE_PARAMS,
    //     fromAccountProxy
    //   };
    // }

    if (storageKey === EARN_TRANSACTION) {
      return {
        ...DEFAULT_EARN_PARAMS,
        fromAccountProxy
      };
    }

    if (storageKey === UN_STAKE_TRANSACTION) {
      return {
        ...DEFAULT_UN_STAKE_PARAMS,
        fromAccountProxy
      };
    }

    if (storageKey === CANCEL_UN_STAKE_TRANSACTION) {
      return {
        ...DEFAULT_CANCEL_UN_STAKE_PARAMS,
        fromAccountProxy
      };
    }

    if (storageKey === WITHDRAW_TRANSACTION) {
      return {
        ...DEFAULT_WITHDRAW_PARAMS,
        fromAccountProxy
      };
    }

    if (storageKey === CLAIM_REWARD_TRANSACTION) {
      return {
        ...DEFAULT_CLAIM_REWARD_PARAMS,
        fromAccountProxy
      };
    }

    if (storageKey === SWAP_TRANSACTION) {
      return {
        ...DEFAULT_SWAP_PARAMS,
        fromAccountProxy
      };
    }

    if (storageKey === CLAIM_BRIDGE_TRANSACTION) {
      return {
        ...DEFAULT_CLAIM_AVAIL_BRIDGE_PARAMS,
        fromAccountProxy
      };
    }

    if (storageKey === CHANGE_VALIDATOR_TRANSACTION) {
      return {
        ...DEFAULT_CHANGE_VALIDATOR_PARAMS,
        fromAccountProxy
      };
    }

    if (storageKey === GOV_REFERENDUM_VOTE_TRANSACTION) {
      return {
        ...DEFAULT_GOV_REFERENDUM_VOTE_PARAMS,
        fromAccountProxy
      };
    }

    if (storageKey === GOV_REFERENDUM_UNVOTE_TRANSACTION) {
      return {
        ...DEFAULT_GOV_REFERENDUM_UNVOTE_PARAMS,
        fromAccountProxy
      };
    }

    if (storageKey === GOV_UNLOCK_VOTE_TRANSACTION) {
      return {
        ...DEFAULT_GOV_UNLOCK_VOTE_PARAMS,
        fromAccountProxy
      };
    }

    return {
      ...DEFAULT_TRANSACTION_PARAMS,
      fromAccountProxy
    };
  }, [currentAccountProxy, storageKey]);

  const [storage, setStorage] = useLocalStorage<TransactionFormBaseProps>(storageKey, { ...defaultTransactionStorageValue });

  // TODO: Review needPersistData — may be outdated and misaligned with current logic
  //  Temporarily set needPersistData to false to avoid unintended side effects

  // const cacheStorage = useDeferredValue(storage);

  // const needPersistData = useMemo(() => {
  //   return JSON.stringify(cacheStorage) === JSON.stringify(DEFAULT_TRANSACTION_PARAMS);
  // }, [cacheStorage]);

  const needPersistData = false;

  const [defaultData, setDefaultData] = useState(storage);
  const { chain, from } = storage;

  const homePath = useMemo((): string => {
    const pathName = location.pathname;
    const action = pathName.split('/')[2] || '';

    switch (action) {
      case 'earn':
      case 'unstake':
      case 'cancel-unstake':
      case 'claim-reward':
      case 'withdraw':
      case 'compound':
        return '/home/earning';
      case 'send-nft':
        return '/home/nfts/collections';
      case 'send-fund':
      default:
        return '/home/tokens';
    }
  }, [location.pathname]);

  const titleMap = useMemo<Record<string, string>>(() => {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(TRANSACTION_TITLE_MAP)) {
      result[key] = t(value);
    }

    return result;
  }, [t]);

  useNavigateOnChangeAccount(homePath);

  const goBack = useCallback(() => {
    navigate(homePath);
  }, [homePath, navigate]);

  const [subHeaderRightButtons, setSubHeaderRightButtons] = useState<ButtonProps[] | undefined>();
  const [isDisableHeader, setIsDisableHeader] = useState<boolean>();
  const [{ disabled: disableBack, onClick: onClickBack }, setBackProps] = useState<{
    disabled: boolean,
    onClick: null | VoidFunction
  }>({ disabled: false, onClick: null });
  const [customScreenTitle, setCustomScreenTitle] = useState<string | undefined>();

  const chainChecker = useChainChecker();

  // Navigate to finish page
  const onDone = useCallback(
    (extrinsicHash: string) => {
      navigate(`/transaction-done/${from}/${chain}/${extrinsicHash}`, { replace: true });
    },
    [navigate, from, chain]
  );

  const openRecheckChainConnectionModal = useCallback((chainName: string) => {
    setRecheckingChain(chainName);
    activeModal(recheckChainConnectionModalId);
  }, [activeModal]);

  const closeRecheckChainConnectionModal = useCallback(() => {
    inactiveModal(recheckChainConnectionModalId);
  }, [inactiveModal]);

  const onClickConfirmOnRecheckChainConnectionModal = useCallback(() => {
    if (recheckingChain) {
      navigate('/settings/chains/manage', { state: { defaultSearch: recheckingChain } as ManageChainsParam });
    }
  }, [navigate, recheckingChain]);

  useEffect(() => {
    chain !== '' && chainChecker(chain);
  }, [chain, chainChecker]);

  // TODO (Hotfix):
  //  Temporary workaround for handling cases where a user opens a transaction screen via direct link.
  //  This fixes the issue where form values are incorrectly restored from a previously cached transaction.
  //  Expected direction:
  //  - Allow external logic to override form values cleanly.
  //  - fromAccountProxy should not be strictly tied to currentAccountProxy.
  //  - Ensure direct link access to transaction screens works reliably and cleanly without stale form data.
  useEffect(() => {
    const doFunction = () => {
      if (![SWAP_TRANSACTION, TRANSFER_TRANSACTION, EARN_TRANSACTION].includes(storageKey)) {
        return;
      }

      if (!currentAccountProxy) {
        return;
      }

      if (getTransactionFromAccountProxyValue(currentAccountProxy) === storage.fromAccountProxy) {
        return;
      }

      setStorage({
        ...defaultTransactionStorageValue
      });
      setDefaultData({
        ...defaultTransactionStorageValue
      });
      setForceRerenderKey(`${Date.now()}_ForceRerenderKey`);
    };

    doFunction();
  }, [currentAccountProxy, defaultTransactionStorageValue, setStorage, storage.fromAccountProxy, storageKey]);

  const contextValues = useMemo<TransactionContextProps>(() => ({
    defaultData,
    needPersistData,
    persistData: setStorage,
    onDone,
    setSubHeaderRightButtons,
    setCustomScreenTitle,
    goBack,
    setBackProps,
    closeAlert,
    openAlert,
    openRecheckChainConnectionModal,
    closeRecheckChainConnectionModal,
    modalId,
    setIsDisableHeader
  }), [closeAlert, closeRecheckChainConnectionModal, defaultData, goBack, modalId, needPersistData, onDone, openAlert, openRecheckChainConnectionModal, setStorage]);

  const recheckChainConnectionModalNode = (
    <>
      <RecheckChainConnectionModal
        modalId={recheckChainConnectionModalId}
        onCancel={closeRecheckChainConnectionModal}
        onClickConfirm={onClickConfirmOnRecheckChainConnectionModal}
      />

      {
        !!alertProps && (
          <AlertModal
            modalId={alertModalId}
            {...alertProps}
          />
        )
      }
    </>
  );

  if (modalContent) {
    return (
      <>
        <TransactionContext.Provider value={contextValues}>
          <PageWrapper resolve={dataContext.awaitStores(['chainStore', 'assetRegistry', 'balance'])}>
            <div className={CN(className, 'transaction-wrapper __modal-content')}>
              {children}
            </div>
          </PageWrapper>
        </TransactionContext.Provider>

        {recheckChainConnectionModalNode}
      </>
    );
  }

  return (
    <>
      <Layout.Home
        isDisableHeader={isDisableHeader}
        showFaderIcon
        showTabBar={false}
      >
        <TransactionContext.Provider value={contextValues}>
          <PageWrapper resolve={dataContext.awaitStores(['chainStore', 'assetRegistry', 'balance', 'price'])}>
            <div
              className={CN(className, 'transaction-wrapper')}
              key={forceRerenderKey}
            >
              <SwSubHeader
                background={'transparent'}
                center
                className={'transaction-header'}
                disableBack={disableBack}
                onBack={onClickBack || goBack}
                rightButtons={subHeaderRightButtons}
                showBackButton
                title={customScreenTitle || titleMap[transactionType]}
              />
              <Outlet />
            </div>
          </PageWrapper>
        </TransactionContext.Provider>
      </Layout.Home>

      <RecheckChainConnectionModal
        modalId={recheckChainConnectionModalId}
        onCancel={closeRecheckChainConnectionModal}
        onClickConfirm={onClickConfirmOnRecheckChainConnectionModal}
      />

      {
        !!alertProps && (
          <AlertModal
            modalId={alertModalId}
            {...alertProps}
          />
        )
      }
    </>
  );
}

const Transaction = styled(Component)(({ theme }) => {
  const token = (theme as Theme).token;

  return ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',

    '.transaction-header': {
      paddingTop: token.paddingSM,
      paddingBottom: token.paddingSM,
      flexShrink: 0
    },

    '.transaction-content': {
      flex: '1 1 370px',
      paddingLeft: token.padding,
      paddingRight: token.padding,
      overflow: 'auto'
    },

    '.transaction-footer': {
      display: 'flex',
      flexWrap: 'wrap',
      padding: `${token.paddingMD}px ${token.padding}px ${token.padding}px`,
      marginBottom: token.padding,
      gap: token.paddingXS,

      '.error-messages': {
        width: '100%',
        color: token.colorError
      },

      '.warning-messages': {
        width: '100%',
        color: token.colorWarning
      },

      '.ant-btn': {
        flex: 1
      },

      '.full-width': {
        minWidth: '100%'
      }
    }
  });
});

export default Transaction;
