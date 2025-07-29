// Copyright 2019-2022 @polkadot/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AlertModal, Layout, PageWrapper, RecheckChainConnectionModal } from '@subwallet/extension-web-ui/components';
import { CANCEL_UN_STAKE_TRANSACTION, CLAIM_BRIDGE_TRANSACTION, CLAIM_REWARD_TRANSACTION, DEFAULT_CANCEL_UN_STAKE_PARAMS, DEFAULT_CLAIM_AVAIL_BRIDGE_PARAMS, DEFAULT_CLAIM_REWARD_PARAMS, DEFAULT_EARN_PARAMS, DEFAULT_NFT_PARAMS, DEFAULT_SWAP_PARAMS, DEFAULT_TRANSACTION_PARAMS, DEFAULT_TRANSFER_PARAMS, DEFAULT_UN_STAKE_PARAMS, DEFAULT_WITHDRAW_PARAMS, EARN_TRANSACTION, NFT_TRANSACTION, SWAP_TRANSACTION, TRANSACTION_CLAIM_BRIDGE, TRANSACTION_TITLE_MAP, TRANSACTION_TRANSFER_MODAL, TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL, TRANSACTION_YIELD_CLAIM_MODAL, TRANSACTION_YIELD_FAST_WITHDRAW_MODAL, TRANSACTION_YIELD_UNSTAKE_MODAL, TRANSACTION_YIELD_WITHDRAW_MODAL, TRANSFER_NFT_MODAL, TRANSFER_TRANSACTION, UN_STAKE_TRANSACTION, WITHDRAW_TRANSACTION } from '@subwallet/extension-web-ui/constants';
import { DataContext } from '@subwallet/extension-web-ui/contexts/DataContext';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { TransactionContext, TransactionContextProps } from '@subwallet/extension-web-ui/contexts/TransactionContext';
import { TransactionModalContext } from '@subwallet/extension-web-ui/contexts/TransactionModalContextProvider';
import { useAlert, useChainChecker, useNavigateOnChangeAccount, useTranslation } from '@subwallet/extension-web-ui/hooks';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { ManageChainsParam, Theme, ThemeProps, TransactionFormBaseProps } from '@subwallet/extension-web-ui/types';
import { detectTransactionPersistKey, getTransactionFromAccountProxyValue } from '@subwallet/extension-web-ui/utils';
import { ButtonProps, ModalContext, SwSubHeader } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

interface Props extends ThemeProps {
  title?: string;
  children?: React.ReactElement;
  transactionType?: string;
  modalContent?: boolean;
  modalId?: string;
  onDoneCallback?: VoidFunction;
}

const recheckChainConnectionModalId = 'recheck-chain-connection-modal-id';
const alertModalId = 'transaction-alert-modal-id';

function Component ({ children, className, modalContent, modalId, onDoneCallback }: Props) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);
  const { closeTransactionModalById } = useContext(TransactionModalContext);
  const { isWebUI } = useContext(ScreenContext);
  const dataContext = useContext(DataContext);

  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);

  const { alertProps, closeAlert, openAlert } = useAlert(alertModalId);
  const [recheckingChain, setRecheckingChain] = useState<string | undefined>();
  const [forceRerenderKey, setForceRerenderKey] = useState('ForceRerenderKey');

  const transactionType = useMemo((): ExtrinsicType => {
    const pathName = location.pathname;
    const action = pathName.split('/')[2] || '';

    if (checkActive(TRANSACTION_TRANSFER_MODAL)) {
      return ExtrinsicType.TRANSFER_BALANCE;
    } else if (checkActive(TRANSFER_NFT_MODAL)) {
      return ExtrinsicType.SEND_NFT;
    } else if (checkActive(TRANSACTION_YIELD_UNSTAKE_MODAL)) {
      return ExtrinsicType.STAKING_LEAVE_POOL;
    } else if (checkActive(TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL)) {
      return ExtrinsicType.STAKING_CANCEL_UNSTAKE;
    } else if (checkActive(TRANSACTION_YIELD_WITHDRAW_MODAL)) {
      return ExtrinsicType.STAKING_WITHDRAW;
    } else if (checkActive(TRANSACTION_YIELD_FAST_WITHDRAW_MODAL)) {
      return ExtrinsicType.REDEEM_LDOT;
    } else if (checkActive(TRANSACTION_YIELD_CLAIM_MODAL)) {
      return ExtrinsicType.STAKING_CLAIM_REWARD;
    } else if (checkActive(TRANSACTION_CLAIM_BRIDGE)) {
      return ExtrinsicType.CLAIM_BRIDGE;
    }

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
      case 'send-fund':
      default:
        return ExtrinsicType.TRANSFER_BALANCE;
    }
  }, [checkActive, location.pathname]);

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

  useNavigateOnChangeAccount(homePath, !modalContent);

  const goBack = useCallback(() => {
    navigate(homePath);
  }, [homePath, navigate]);

  const [subHeaderRightButtons, setSubHeaderRightButtons] = useState<ButtonProps[] | undefined>();
  const [{ disabled: disableBack, onClick: onClickBack }, setBackProps] = useState<{
    disabled: boolean,
    onClick: null | VoidFunction
  }>({ disabled: false, onClick: null });
  const [customScreenTitle, setCustomScreenTitle] = useState<string | undefined>();

  const chainChecker = useChainChecker();

  // Navigate to finish page
  const onDone = useCallback(
    (extrinsicHash: string) => {
      if (modalId) {
        // note: this method can only apply to transaction modals that is in TransactionModalContextProvider
        closeTransactionModalById(modalId);
      }

      navigate(`/transaction-done/${from}/${chain}/${extrinsicHash}`, { replace: true });
      onDoneCallback?.();
    },
    [modalId, navigate, from, chain, onDoneCallback, closeTransactionModalById]
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

  const contextValues = useMemo((): TransactionContextProps => ({
    isInModal: modalContent,
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
    modalId
  }), [closeAlert, closeRecheckChainConnectionModal, defaultData, goBack, modalContent, modalId, needPersistData, onDone, openAlert, openRecheckChainConnectionModal, setStorage]);

  useEffect(() => {
    chain !== '' && chainChecker(chain);
  }, [chain, chainChecker]);

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

  if (modalContent) {
    return (
      <>
        <TransactionContext.Provider value={contextValues}>
          <PageWrapper resolve={dataContext.awaitStores(['chainStore', 'assetRegistry', 'balance'])}>
            <div
              className={CN(className, 'transaction-wrapper __modal-content')}
              key={forceRerenderKey}
            >
              {children}
            </div>
          </PageWrapper>
        </TransactionContext.Provider>

        {recheckChainConnectionModalNode}
      </>
    );
  }

  if (isWebUI) {
    return (
      <>
        <Layout.WithSubHeaderOnly
          onBack={goBack}
          showBackButton
          title={customScreenTitle || titleMap[transactionType]}
        >
          <TransactionContext.Provider value={contextValues}>
            <PageWrapper resolve={dataContext.awaitStores(['chainStore', 'assetRegistry', 'balance', 'price'])}>
              <div
                className={CN(className, 'transaction-wrapper')}
                key={forceRerenderKey}
              >
                <Outlet />
              </div>
            </PageWrapper>
          </TransactionContext.Provider>
        </Layout.WithSubHeaderOnly>

        {recheckChainConnectionModalNode}
      </>
    );
  }

  return (
    <>
      <Layout.Home
        showFilterIcon
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

      {recheckChainConnectionModalNode}
    </>
  );
}

const Transaction = styled(Component)(({ theme }) => {
  const token = (theme as Theme).token;

  return ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',

    '.content': {
      '&.__web-ui': {
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        width: '80%',
        margin: '0 auto',

        '& > *': {
          maxWidth: '50%',
          flex: 1
        }
      }
    },

    '&.__modal-content': {
      margin: `0 -${token.margin}px`,

      '.transaction-content': {
        flex: '1 1 auto'
      }
    },

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
      padding: `${token.padding}px ${token.padding}px ${token.padding}px`,
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
