// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TON_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import { AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { AccountChainAddressItem, GeneralEmptyList } from '@subwallet/extension-koni-ui/components';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useGetAccountChainAddresses, useHandleLedgerGenericAccountWarning, useHandleTonAccountWarning, useIsPolkadotUnifiedChain, useNotification, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { AccountChainAddress, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, SwList } from '@subwallet/react-ui';
import { Strategy } from 'phosphor-react';
import React, { useCallback, useContext, useEffect } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  accountProxy: AccountProxy;
};

const isNotHide = false;

function Component ({ accountProxy, className }: Props) {
  const { t } = useTranslation();
  const items: AccountChainAddress[] = useGetAccountChainAddresses(accountProxy);
  const notify = useNotification();
  const onHandleTonAccountWarning = useHandleTonAccountWarning();
  const onHandleLedgerGenericAccountWarning = useHandleLedgerGenericAccountWarning();
  const { addressQrModal, selectAddressFormatModal } = useContext(WalletModalContext);
  const checkIsPolkadotUnifiedChain = useIsPolkadotUnifiedChain();

  const openSelectAddressFormatModal = useCallback((item: AccountChainAddress) => {
    selectAddressFormatModal.open({
      name: item.name,
      address: item.address,
      chainSlug: item.slug,
      onBack: selectAddressFormatModal.close,
      onCancel: () => {
        selectAddressFormatModal.close();
      }
    });
  }, [selectAddressFormatModal]);

  const onShowQr = useCallback((item: AccountChainAddress) => {
    return () => {
      const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);

      const processFunction = () => {
        addressQrModal.open({
          address: item.address,
          chainSlug: item.slug,
          onCancel: () => {
            addressQrModal.close();
          }
        });
      };

      if (isPolkadotUnifiedChain) {
        openSelectAddressFormatModal(item);
      } else {
        onHandleTonAccountWarning(item.accountType, () => {
          onHandleLedgerGenericAccountWarning({
            accountProxy: accountProxy,
            chainSlug: item.slug
          }, processFunction);
        });
      }
    };
  }, [accountProxy, addressQrModal, checkIsPolkadotUnifiedChain, onHandleLedgerGenericAccountWarning, onHandleTonAccountWarning, openSelectAddressFormatModal]);

  const onCopyAddress = useCallback((item: AccountChainAddress) => {
    return () => {
      const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);

      const processFunction = () => {
        copyToClipboard(item.address || '');
        notify({
          message: t('Copied to clipboard')
        });
      };

      if (isPolkadotUnifiedChain) {
        openSelectAddressFormatModal(item);
      } else {
        onHandleTonAccountWarning(item.accountType, () => {
          onHandleLedgerGenericAccountWarning({
            accountProxy: accountProxy,
            chainSlug: item.slug
          }, processFunction);
        });
      }
    };
  }, [accountProxy, checkIsPolkadotUnifiedChain, notify, onHandleLedgerGenericAccountWarning, onHandleTonAccountWarning, openSelectAddressFormatModal, t]);

  const onClickInfoButton = useCallback((item: AccountChainAddress) => {
    return () => {
      openSelectAddressFormatModal(item);
    };
  }, [openSelectAddressFormatModal]);

  const renderItem = useCallback(
    (item: AccountChainAddress) => {
      const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);

      return (
        <AccountChainAddressItem
          className={'address-item'}
          isShowInfoButton={isPolkadotUnifiedChain}
          item={item}
          key={item.slug}
          onClick={onShowQr(item)}
          onClickCopyButton={onCopyAddress(item)}
          onClickInfoButton={onClickInfoButton(item)}
          onClickQrButton={onShowQr(item)}
        />
      );
    },
    [checkIsPolkadotUnifiedChain, onClickInfoButton, onCopyAddress, onShowQr]
  );

  const emptyList = useCallback(() => {
    return <GeneralEmptyList />;
  }, []);

  const searchFunction = useCallback(
    (item: AccountChainAddress, searchText: string) => {
      return item.name.toLowerCase().includes(searchText.toLowerCase()) || item.address.toLowerCase().includes(searchText.toLowerCase());
    },
    []
  );

  useEffect(() => {
    if (addressQrModal.checkActive()) {
      addressQrModal.update((prev) => {
        if (!prev || !TON_CHAINS.includes(prev.chainSlug)) {
          return prev;
        }

        const targetAddress = items.find((i) => i.slug === prev.chainSlug)?.address;

        if (!targetAddress) {
          return prev;
        }

        return {
          ...prev,
          address: targetAddress
        };
      });
    }
  }, [addressQrModal, items]);

  return (
    <div className={className}>
      <SwList.Section
        enableSearchInput
        list={items}
        renderItem={renderItem}
        renderWhenEmpty={emptyList}
        searchFunction={searchFunction}
        searchMinCharactersCount={2}
        searchPlaceholder={t<string>('Enter network name or address ')}
      />

      {
        isNotHide && accountProxy.accountType === AccountProxyType.SOLO && (
          <div className={'update-unified-account-button-wrapper'}>
            <Button
              block={true}
              className={'update-unified-account-button'}
              icon={(
                <Icon
                  phosphorIcon={Strategy}
                  weight='fill'
                />
              )}
            >
              {t('Upgrade to Unified account')}
            </Button>
          </div>
        )
      }
    </div>
  );
}

export const AccountAddressList = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  display: 'flex',
  overflow: 'hidden',
  flexDirection: 'column',

  '.ant-sw-list-section': {
    flex: 1
  },

  '.ant-sw-list': {
    paddingBottom: 0
  },

  '.address-item + .address-item': {
    marginTop: token.marginXS
  },

  '.update-unified-account-button-wrapper': {
    paddingLeft: token.padding,
    paddingRight: token.padding,
    paddingTop: token.paddingSM,
    paddingBottom: token.paddingXXS
  }

}));
