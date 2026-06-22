// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
import { TON_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import { AccountProxy } from '@subwallet/extension-base/types';
import { AccountChainAddressItem, GeneralEmptyList } from '@subwallet/extension-koni-ui/components';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useGetAccountChainAddresses, useGetBitcoinAccounts, useHandleLedgerAccountWarning, useHandleLedgerGenericAccountWarning, useHandleTonAccountWarning, useIsPolkadotUnifiedChain, useNotification, useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { AccountChainAddress, AccountInfoType, AccountTokenAddress, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard, runPriorityWarningModalHandlers } from '@subwallet/extension-koni-ui/utils';
import { isBitcoinAddress } from '@subwallet/keyring';
import { BitcoinAddressType } from '@subwallet/keyring/types';
import { getBitcoinAddressInfo } from '@subwallet/keyring/utils/address/validate';
import { SwList } from '@subwallet/react-ui';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  accountProxy: AccountProxy;
  isInModal?: boolean;
  modalProps?: {
    onCancel: VoidFunction;
  }
};

interface BitcoinAccountsByNetwork {
  mainnet: AccountInfoType[];
  testnet: AccountInfoType[];
}

function Component ({ accountProxy, className, isInModal, modalProps }: Props) {
  const { t } = useTranslation();
  const items: AccountChainAddress[] = useGetAccountChainAddresses(accountProxy);
  const getBitcoinAccounts = useGetBitcoinAccounts();
  const notify = useNotification();
  const onHandleTonAccountWarning = useHandleTonAccountWarning();
  const onHandleLedgerAccountWarning = useHandleLedgerAccountWarning();
  const onHandleLedgerGenericAccountWarning = useHandleLedgerGenericAccountWarning();
  const { accountTokenAddressModal, addressQrModal, selectAddressFormatModal } = useContext(WalletModalContext);
  const checkIsPolkadotUnifiedChain = useIsPolkadotUnifiedChain();
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);

  const bitcoinAccountList: AccountInfoType[] = useMemo(() => {
    if (!items) {
      return [];
    }

    return items
      .filter((item) => isBitcoinAddress(item.address))
      .map((item) => ({
        address: item.address,
        type: item.accountType
      }));
  }, [items]);

  const soloBitcoinAccount = useMemo((): BitcoinAccountsByNetwork => {
    if (!bitcoinAccountList || bitcoinAccountList.length === 0) {
      return { mainnet: [], testnet: [] };
    }

    const mainnet: AccountInfoType[] = [];
    const testnet: AccountInfoType[] = [];

    bitcoinAccountList.forEach((account) => {
      const bitcoinAddressInfo = getBitcoinAddressInfo(account.address);

      if (bitcoinAddressInfo.network === 'mainnet') {
        mainnet.push(account);
      } else {
        testnet.push(account);
      }
    });

    return { mainnet, testnet };
  }, [bitcoinAccountList]);

  const filteredItems = useMemo(() => {
    if (!items) {
      return [];
    }

    return items.filter((item) => {
      if (isBitcoinAddress(item.address)) {
        const addressInfo = getBitcoinAddressInfo(item.address);

        if (addressInfo.network === 'mainnet' && soloBitcoinAccount.mainnet.length > 1) {
          return [BitcoinAddressType.p2wpkh, BitcoinAddressType.p2wsh].includes(addressInfo.type);
        } else if (addressInfo.network === 'testnet' && soloBitcoinAccount.testnet.length > 1) {
          return [BitcoinAddressType.p2wpkh, BitcoinAddressType.p2wsh].includes(addressInfo.type);
        }

        return true;
      }

      return true;
    });
  }, [items, soloBitcoinAccount.mainnet.length, soloBitcoinAccount.testnet.length]);

  const getBitcoinTokenAddresses = useCallback(
    (slug: string, bitcoinAccounts: AccountInfoType[]): AccountTokenAddress[] => {
      const chainInfo = chainInfoMap[slug];

      if (!chainInfo) {
        return [];
      }

      const nativeTokenSlug = _getChainNativeTokenSlug(chainInfo);

      return getBitcoinAccounts(slug, nativeTokenSlug, chainInfo, bitcoinAccounts);
    },
    [chainInfoMap, getBitcoinAccounts]
  );

  const openSelectAddressFormatModal = useCallback((item: AccountChainAddress) => {
    selectAddressFormatModal.open({
      name: item.name,
      address: item.address,
      chainSlug: item.slug,
      onBack: isInModal ? selectAddressFormatModal.close : undefined,
      onCancel: () => {
        selectAddressFormatModal.close();

        if (isInModal) {
          modalProps?.onCancel();
        }
      }
    });
  }, [isInModal, modalProps, selectAddressFormatModal]);

  const openAccountTokenAddressModal = useCallback((accounts: AccountTokenAddress[], closeCallback?: VoidCallback) => {
    const processFunction = () => {
      accountTokenAddressModal.open({
        items: accounts,
        onBack: accountTokenAddressModal.close,
        onCancel: () => {
          accountTokenAddressModal.close();
          closeCallback?.();
        }
      });
    };

    processFunction();
  }, [accountTokenAddressModal]);

  const onShowQr = useCallback((item: AccountChainAddress) => {
    return () => {
      const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);
      const isBitcoinChain = isBitcoinAddress(item.address);

      const processFunction = () => {
        addressQrModal.open({
          address: item.address,
          chainSlug: item.slug,
          onBack: isInModal ? addressQrModal.close : undefined,
          onCancel: () => {
            addressQrModal.close();

            if (isInModal) {
              modalProps?.onCancel();
            }
          }
        });
      };

      if (isPolkadotUnifiedChain) {
        openSelectAddressFormatModal(item);

        return;
      }

      if (isBitcoinChain) {
        // TODO: Currently, only supports Bitcoin native token.
        const accountTokenAddressList = getBitcoinTokenAddresses(item.slug, bitcoinAccountList);

        if (accountTokenAddressList.length > 1) {
          openAccountTokenAddressModal(accountTokenAddressList);

          return;
        }
      }

      runPriorityWarningModalHandlers([
        [onHandleTonAccountWarning, item.accountType],
        [onHandleLedgerGenericAccountWarning, { accountProxy, chainSlug: item.slug }],
        [onHandleLedgerAccountWarning, { accountProxy, targetSlug: item.slug, context: 'useNetwork' }]
      ], processFunction);
    };
  }, [accountProxy, addressQrModal, bitcoinAccountList, checkIsPolkadotUnifiedChain, getBitcoinTokenAddresses, isInModal, modalProps, onHandleLedgerAccountWarning, onHandleLedgerGenericAccountWarning, onHandleTonAccountWarning, openAccountTokenAddressModal, openSelectAddressFormatModal]);

  const onCopyAddress = useCallback((item: AccountChainAddress) => {
    return () => {
      const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);
      const isBitcoinChain = isBitcoinAddress(item.address);

      const processFunction = () => {
        copyToClipboard(item.address || '');
        notify({
          message: t('ui.ACCOUNT.components.AccountProxy.list.ChainAddress.copiedToClipboard')
        });
      };

      if (isPolkadotUnifiedChain) {
        openSelectAddressFormatModal(item);

        return;
      }

      if (isBitcoinChain) {
        // TODO: Currently, only supports Bitcoin native token.

        const accountTokenAddressList = getBitcoinTokenAddresses(item.slug, bitcoinAccountList);

        if (accountTokenAddressList.length > 1) {
          openAccountTokenAddressModal(accountTokenAddressList);

          return;
        }
      }

      runPriorityWarningModalHandlers([
        [onHandleTonAccountWarning, item.accountType],
        [onHandleLedgerGenericAccountWarning, { accountProxy, chainSlug: item.slug }],
        [onHandleLedgerAccountWarning, { accountProxy, targetSlug: item.slug, context: 'useNetwork' }]
      ], processFunction);
    };
  }, [accountProxy, bitcoinAccountList, checkIsPolkadotUnifiedChain, getBitcoinTokenAddresses, notify, onHandleLedgerAccountWarning, onHandleLedgerGenericAccountWarning, onHandleTonAccountWarning, openAccountTokenAddressModal, openSelectAddressFormatModal, t]);

  const onClickInfoButton = useCallback((item: AccountChainAddress) => {
    return () => {
      const isBitcoinChain = isBitcoinAddress(item.address);

      if (isBitcoinChain) {
        // TODO: Currently, only supports Bitcoin native token.
        const accountTokenAddressList = getBitcoinTokenAddresses(item.slug, bitcoinAccountList);

        if (accountTokenAddressList.length > 1) {
          openAccountTokenAddressModal(accountTokenAddressList);

          return;
        }
      }

      openSelectAddressFormatModal(item);
    };
  }, [bitcoinAccountList, getBitcoinTokenAddresses, openAccountTokenAddressModal, openSelectAddressFormatModal]);

  const renderItem = useCallback(
    (item: AccountChainAddress) => {
      const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);
      const isBitcoinChain = isBitcoinAddress(item.address);
      let tooltip = '';

      if (isPolkadotUnifiedChain) {
        tooltip = 'This network has two address formats';
      } else if (isBitcoinChain) {
        tooltip = 'This network has three address types';
      }

      let isShowBitcoinInfoButton = false;

      if (isBitcoinChain) {
        const accountTokenAddressList = getBitcoinTokenAddresses(item.slug, bitcoinAccountList);

        isShowBitcoinInfoButton = accountTokenAddressList.length > 1;
      }

      return (
        <AccountChainAddressItem
          className={'address-item'}
          infoButtonTooltip={tooltip}
          isShowInfoButton={isPolkadotUnifiedChain || isShowBitcoinInfoButton}
          item={item}
          key={`${item.slug}_${item.address}`}
          onClick={onShowQr(item)}
          onClickCopyButton={onCopyAddress(item)}
          onClickInfoButton={onClickInfoButton(item)}
          onClickQrButton={onShowQr(item)}
        />
      );
    },
    [bitcoinAccountList, checkIsPolkadotUnifiedChain, getBitcoinTokenAddresses, onClickInfoButton, onCopyAddress, onShowQr]
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

        const targetAddress = filteredItems.find((i) => i.slug === prev.chainSlug)?.address;

        if (!targetAddress) {
          return prev;
        }

        return {
          ...prev,
          address: targetAddress
        };
      });
    }
  }, [addressQrModal, filteredItems]);

  return (
    <SwList.Section
      className={className}
      enableSearchInput
      list={filteredItems}
      renderItem={renderItem}
      renderWhenEmpty={emptyList}
      searchFunction={searchFunction}
      searchMinCharactersCount={2}
      searchPlaceholder={t<string>('ui.ACCOUNT.components.AccountProxy.list.ChainAddress.enterNetworkNameOrAddress')}
    />
  );
}

export const AccountAddressList = styled(Component)<Props>(({ theme: { token } }: Props) => ({
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

export default AccountAddressList;
