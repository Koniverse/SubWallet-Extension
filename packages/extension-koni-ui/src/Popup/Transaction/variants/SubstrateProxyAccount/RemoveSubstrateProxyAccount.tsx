// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { SubstrateProxyAccountItem } from '@subwallet/extension-base/types';
import { MetaInfo, SubstrateProxyAccountItemExtended, SubstrateProxyAccountListModal, SubstrateProxyAccountSelectorItem } from '@subwallet/extension-koni-ui/components';
import { SUBSTRATE_PROXY_ACCOUNT_LIST_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetAccountProxyByAddress, useGetNativeTokenSlug, useHandleSubmitTransaction, usePreCheckAction, useSetCurrentPage, useTransactionContext } from '@subwallet/extension-koni-ui/hooks';
import { useGetSubstrateProxyAccountGroupByAddress } from '@subwallet/extension-koni-ui/hooks/substrateProxyAccount/useGetSubstrateProxyAccountGroupByAddress';
import { handleRemoveSubstrateProxyAccount } from '@subwallet/extension-koni-ui/messaging/transaction/substrateProxy';
import { FreeBalance, TransactionContent, TransactionFooter } from '@subwallet/extension-koni-ui/Popup/Transaction/parts';
import { RemoveSubstrateProxyAccountParams, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getSubstrateProxyAddressKey } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, Info, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

const modalId = SUBSTRATE_PROXY_ACCOUNT_LIST_MODAL;

interface SubstrateProxyAddressRemovedState {
  substrateProxyItems: SubstrateProxyAccountItem[];
  uniqueAddresses: string[];
}

const extrinsicType = ExtrinsicType.REMOVE_SUBSTRATE_PROXY_ACCOUNT;

const Component = ({ className }: Props): React.ReactElement<Props> => {
  useSetCurrentPage('/transaction/remove-proxy');
  const { defaultData: { chain, from, substrateProxyAddressKeys }, goBack, selectSubstrateProxyAccountsToSign, setBackProps } = useTransactionContext<RemoveSubstrateProxyAccountParams>();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isBalanceReady, setIsBalanceReady] = useState(true);
  const nativeTokenSlug = useGetNativeTokenSlug(chain);
  const { activeModal } = useContext(ModalContext);
  const navigate = useNavigate();
  const { onError, onSuccess } = useHandleSubmitTransaction();
  const substrateProxyAccountGroup = useGetSubstrateProxyAccountGroupByAddress(from, chain);
  const onPreCheck = usePreCheckAction(from);

  const accountProxy = useGetAccountProxyByAddress(from);

  /**
   * Builds a filtered, deduplicated list of Substrate proxy accounts.
   *
   * - Matches accounts from `substrateProxyAccountGroup` with `substrateProxyAddressKeys`.
   * - Removes duplicates by proxy address.
   * - Returns unique proxy addresses (for signing exclusion)
   *   and corresponding account items (for removal processing).
   *
   * Memoized to prevent unnecessary recomputation.
   */

  const substrateProxyAddressRemovedFiltered = useMemo<SubstrateProxyAddressRemovedState>(() => {
    const substrateProxyItems: SubstrateProxyAccountItem[] = [];
    const uniqueAddresses = new Set<string>();
    const substrateProxyAccountsRecord = substrateProxyAccountGroup.substrateProxyAccounts.reduce<Record<string, SubstrateProxyAccountItem>>((acc, substrateProxyAccount) => {
      const key = getSubstrateProxyAddressKey(substrateProxyAccount.substrateProxyAddress, substrateProxyAccount.substrateProxyType);

      acc[key] = substrateProxyAccount;

      return acc;
    }, {});

    substrateProxyAddressKeys.forEach((key) => {
      if (substrateProxyAccountsRecord[key]?.substrateProxyAddress) {
        substrateProxyItems.push(substrateProxyAccountsRecord[key]);
        uniqueAddresses.add(substrateProxyAccountsRecord[key].substrateProxyAddress);
      }
    });

    return {
      uniqueAddresses: Array.from(uniqueAddresses),
      substrateProxyItems
    };
  }, [substrateProxyAccountGroup.substrateProxyAccounts, substrateProxyAddressKeys]);

  const isRemoveAll = substrateProxyAddressRemovedFiltered.substrateProxyItems.length === substrateProxyAccountGroup.substrateProxyAccounts.length;

  const onClickDetail = useCallback(() => {
    activeModal(modalId);
  }, [activeModal]);

  const onClickSubmit = useCallback(() => {
    // Function to send the remove substrate proxy account transaction
    const sendPromise = (signerSubstrateProxyAddress?: string) => {
      return handleRemoveSubstrateProxyAccount({
        chain,
        address: from,
        selectedSubstrateProxyAccounts: substrateProxyAddressRemovedFiltered.substrateProxyItems,
        isRemoveAll,
        signerSubstrateProxyAddress
      });
    };

    const excludedSubstrateProxyAccounts = substrateProxyAddressRemovedFiltered.substrateProxyItems.map(
      (item) => ({
        address: item.substrateProxyAddress,
        substrateProxyType: item.substrateProxyType
      })
    );

    setLoading(true);
    // Select substrate proxy account to sign the transaction
    selectSubstrateProxyAccountsToSign({
      chain,
      address: from,
      type: extrinsicType,
      excludedSubstrateProxyAccounts
    }).then(sendPromise)
      .then(onSuccess)
      .catch(onError)
      .finally(() => setLoading(false));
  }, [selectSubstrateProxyAccountsToSign, chain, from, substrateProxyAddressRemovedFiltered.substrateProxyItems, onSuccess, onError, isRemoveAll]);

  const onCancelRemove = useCallback(() => {
    if (accountProxy?.id) {
      navigate(`/accounts/detail/${accountProxy?.id}`, {
        state: { requestViewManageProxiesTab: true }
      });
    } else {
      goBack();
    }
  }, [accountProxy?.id, goBack, navigate]);

  const substrateProxiedAccount = useMemo<SubstrateProxyAccountItemExtended | null>(() => {
    if (!accountProxy) {
      return null;
    }

    return ({
      proxyId: accountProxy.id,
      substrateProxyAddress: from,
      substrateProxyType: 'Any',
      delay: 0,
      isMain: true
    });
  }, [accountProxy, from]);

  const substrateProxyAddressCount = substrateProxyAddressRemovedFiltered.uniqueAddresses.length;

  // Set up back button to navigate to account detail page
  useEffect(() => {
    if (accountProxy?.id) {
      setBackProps((prevState) => ({
        ...prevState,
        onClick: () => {
          navigate(`/accounts/detail/${accountProxy?.id}`, {
            state: { requestViewManageProxiesTab: true }
          });
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

  if (!substrateProxyAddressRemovedFiltered.substrateProxyItems?.length) {
    return <></>;
  }

  return (
    <>
      <TransactionContent className={CN(className, '-transaction-content')}>
        <div>
          {!!substrateProxiedAccount && <SubstrateProxyAccountSelectorItem
            className={'__proxy-account'}
            showCheckedIcon={false}
            substrateProxyAccount={substrateProxiedAccount}
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
          {substrateProxyAddressCount === 1
            ? <MetaInfo.Account
              address={substrateProxyAddressRemovedFiltered.uniqueAddresses[0]}
              chainSlug={chain}
              label={t('ui.TRANSACTION.screen.Transaction.RemoveSubstrateProxyAccount.substrateProxyAccount')}
            />
            : <MetaInfo.Default
              className={'proxy-address-removed'}
              label={t('ui.TRANSACTION.screen.Transaction.RemoveSubstrateProxyAccount.substrateProxyAccount')}
            >
              {substrateProxyAddressCount} {t('ui.TRANSACTION.screen.Transaction.RemoveSubstrateProxyAccount.numberAccounts')}
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
            label={t('ui.TRANSACTION.screen.Transaction.RemoveSubstrateProxyAccount.network')}
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
          {t('ui.TRANSACTION.screen.Transaction.RemoveSubstrateProxyAccount.cancel')}
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
          {t('ui.TRANSACTION.screen.Transaction.RemoveSubstrateProxyAccount.continue')}
        </Button>
      </TransactionFooter>

      <SubstrateProxyAccountListModal substrateProxyAddresses={substrateProxyAddressRemovedFiltered.uniqueAddresses} />
    </>
  );
};

const RemoveSubstrateProxyAccount = styled(Component)<Props>(({ theme: { token } }: Props) => {
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

export default RemoveSubstrateProxyAccount;
