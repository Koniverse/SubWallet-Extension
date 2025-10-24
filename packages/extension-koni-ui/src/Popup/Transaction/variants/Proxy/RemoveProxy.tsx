// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ProxyItem, ProxyType } from '@subwallet/extension-base/types';
import { MetaInfo, ProxyAccountListModal, ProxyAccountSelectorItem, ProxyItemExtended } from '@subwallet/extension-koni-ui/components';
import { PROXY_ACCOUNT_LIST_MODAL } from '@subwallet/extension-koni-ui/constants';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useGetAccountProxyByAddress, useGetNativeTokenSlug, useHandleSubmitTransaction, usePreCheckAction, useSetCurrentPage, useTransactionContext } from '@subwallet/extension-koni-ui/hooks';
import { useGetProxyAccountsInfoByAddress } from '@subwallet/extension-koni-ui/hooks/proxyAccount/useGetProxyAccountsInfoByAddress';
import { handleRemoveProxy } from '@subwallet/extension-koni-ui/messaging/transaction/proxy';
import { FreeBalance, TransactionContent, TransactionFooter } from '@subwallet/extension-koni-ui/Popup/Transaction/parts';
import { RemoveProxyParams, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, Info, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

const getKey = (address: string, proxyType: ProxyType) => proxyType + ':' + address;
const modalId = PROXY_ACCOUNT_LIST_MODAL;

interface ProxyAddressRemovedState {
  keyUnique: ProxyItem[];
  addressUnique: string[];
}

const extrinsicType = ExtrinsicType.REMOVE_PROXY;

const Component = ({ className }: Props): React.ReactElement<Props> => {
  useSetCurrentPage('/transaction/remove-proxy');
  const { defaultData: { chain, from, proxyAddressKeys }, goBack, proxyAccountsToSign, setBackProps, setProxyAccountsToSign } = useTransactionContext<RemoveProxyParams>();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isBalanceReady, setIsBalanceReady] = useState(true);
  const nativeTokenSlug = useGetNativeTokenSlug(chain);
  const { activeModal } = useContext(ModalContext);
  const navigate = useNavigate();
  const { onError, onSuccess } = useHandleSubmitTransaction();
  const { selectProxyAccountModal } = useContext(WalletModalContext);
  const proxyAccountInfo = useGetProxyAccountsInfoByAddress(from, chain);
  const onPreCheck = usePreCheckAction(from);

  const accountProxy = useGetAccountProxyByAddress(from);

  const proxyAddressRemovedFiltered = useMemo<ProxyAddressRemovedState>(() => {
    const proxyItems: ProxyItem[] = [];
    const addressUnique = new Set<string>();
    const proxyAccountsRecord = proxyAccountInfo.proxies.reduce<Record<string, ProxyItem>>((acc, proxyAccount) => {
      const key = getKey(proxyAccount.proxyAddress, proxyAccount.proxyType);

      acc[key] = proxyAccount;

      return acc;
    }, {});

    proxyAddressKeys.forEach((key) => {
      if (proxyAccountsRecord[key]?.proxyAddress) {
        proxyItems.push(proxyAccountsRecord[key]);
        addressUnique.add(proxyAccountsRecord[key].proxyAddress);
      }
    });

    return {
      addressUnique: Array.from(addressUnique),
      keyUnique: proxyItems
    };
  }, [proxyAccountInfo.proxies, proxyAddressKeys]);

  const isRemoveAll = proxyAddressRemovedFiltered.keyUnique.length === proxyAccountInfo.proxies.length;

  const onClickDetail = useCallback(() => {
    activeModal(modalId);
  }, [activeModal]);

  const onClickSubmit = useCallback(() => {
    const sendPromise = (proxyAddress?: string) => {
      return handleRemoveProxy({
        chain,
        address: from,
        selectedProxyAccounts: proxyAddressRemovedFiltered.keyUnique,
        isRemoveAll,
        proxyAddress
      });
    };

    setLoading(true);
    selectProxyAccountModal.open({
      chain,
      address: from,
      proxyItems: proxyAccountsToSign
    }).then(sendPromise)
      .then(onSuccess)
      .catch(onError)
      .finally(() => setLoading(false));
  }, [chain, from, isRemoveAll, onError, onSuccess, proxyAccountsToSign, proxyAddressRemovedFiltered, selectProxyAccountModal]);

  const onCancelRemove = useCallback(() => {
    if (accountProxy?.id) {
      navigate(`/accounts/detail/${accountProxy?.id}`);
    } else {
      goBack();
    }
  }, [accountProxy?.id, goBack, navigate]);

  const proxiedAccount = useMemo<ProxyItemExtended | null>(() => {
    if (!accountProxy) {
      return null;
    }

    return ({
      proxyId: accountProxy.id,
      proxyAddress: from,
      proxyType: 'Any',
      delay: 0,
      isMain: true
    });
  }, [accountProxy, from]);

  const addressCount = proxyAddressRemovedFiltered.addressUnique.length;

  useEffect(() => {
    setProxyAccountsToSign(chain, from, extrinsicType, proxyAddressRemovedFiltered.addressUnique);
  }, [chain, from, setProxyAccountsToSign, proxyAddressKeys, proxyAddressRemovedFiltered.addressUnique]);

  useEffect(() => {
    if (accountProxy?.id) {
      setBackProps((prevState) => ({
        ...prevState,
        onClick: () => {
          navigate(`/accounts/detail/${accountProxy?.id}`);
        }
      }));
    }

    return () => {
      setBackProps((prevState) => ({
        ...prevState,
        onClick: null
      }));
    };
  }, [accountProxy?.id, navigate, setBackProps]);

  if (!proxyAddressRemovedFiltered.keyUnique?.length) {
    return <></>;
  }

  return (
    <>
      <TransactionContent className={CN(className, '-transaction-content')}>
        <div>
          {!!proxiedAccount && <ProxyAccountSelectorItem
            className={'__proxy-account'}
            proxyAccount={proxiedAccount}
            showCheckedIcon={false}
          />}

          <FreeBalance
            address={from}
            chain={chain}
            className={'free-balance-block'}
            onBalanceReady={setIsBalanceReady}
            tokenSlug={nativeTokenSlug}
          />
        </div>

        <MetaInfo
          className={'meta-info'}
          hasBackgroundWrapper
        >
          {addressCount === 1
            ? <MetaInfo.Account
              address={proxyAddressRemovedFiltered.addressUnique[0]}
              chainSlug={chain}
              label={t('ui.TRANSACTION.screen.Transaction.removeProxy.proxyAccount')}
            />
            : <MetaInfo.Default
              className={'proxy-address-removed'}
              label={t('ui.TRANSACTION.screen.Transaction.removeProxy.proxyAccount')}
            >
              {addressCount} {t('ui.TRANSACTION.screen.Transaction.removeProxy.numberAccounts')}
              <Button
                className={'proxy-address-removed-info'}
                icon={ <Icon
                  className={'proxy-address-remove-detail'}
                  customSize={'20px'}
                  phosphorIcon={Info}
                  weight={'bold'}
                />}
                onClick={onClickDetail}
                size={'xs'}
                type={'ghost'}
              />
            </MetaInfo.Default>}

          <MetaInfo.Chain
            chain={chain}
            label={t('ui.TRANSACTION.screen.Transaction.removeProxy.network')}
          />
        </MetaInfo>

      </TransactionContent>
      <TransactionFooter className={CN(className, '-transaction-footer')}>
        <Button
          disabled={loading}
          icon={(
            <Icon
              phosphorIcon={XCircle}
              weight='fill'
            />
          )}
          onClick={onCancelRemove}
          schema={'secondary'}
        >
          {t('ui.TRANSACTION.screen.Transaction.removeProxy.cancel')}
        </Button>

        <Button
          disabled={!isBalanceReady}
          icon={(
            <Icon
              phosphorIcon={CheckCircle}
              weight='fill'
            />
          )}
          loading={loading}
          onClick={onPreCheck(onClickSubmit, extrinsicType)}
        >
          {t('ui.TRANSACTION.screen.Transaction.removeProxy.continue')}
        </Button>
      </TransactionFooter>

      <ProxyAccountListModal proxyAddresses={proxyAddressRemovedFiltered.addressUnique} />
    </>
  );
};

const RemoveProxy = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

    '&.-transaction-content': {
      display: 'flex',
      gap: token.sizeSM,
      flexDirection: 'column'
    },

    '.proxy-address-removed': {
      '.__value': {
        display: 'flex',
        alignItems: 'center'
      },

      '.proxy-address-removed-info': {
        height: 'fit-content !important',
        width: 'fit-content !important',
        minWidth: 'unset',
        color: token.colorTextLight4,
        transform: 'all 0.3s ease-in-out',

        '&:hover': {
          color: token.colorTextLight2
        }
      }
    },

    '.free-balance-block': {
      marginTop: token.marginXXS
    },

    '&.-transaction-footer': {
      gap: token.sizeSM,
      marginBottom: 0,
      padding: token.padding,
      paddingBottom: token.paddingXL
    }
  };
});

export default RemoveProxy;
