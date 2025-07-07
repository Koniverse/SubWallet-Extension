// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { _getAssetOriginChain, _getMultiChainAsset, _isChainBitcoinCompatible, _isChainInfoCompatibleWithAccountInfo } from '@subwallet/extension-base/services/chain-service/utils';
import { TON_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import { AccountActions, AccountChainType, AccountJson, AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { RECEIVE_MODAL_ACCOUNT_SELECTOR, RECEIVE_MODAL_TOKEN_SELECTOR } from '@subwallet/extension-koni-ui/constants';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useCoreCreateReformatAddress, useGetBitcoinAccounts, useGetChainAndExcludedTokenByCurrentAccountProxy, useHandleLedgerAccountWarning, useHandleLedgerGenericAccountWarning, useHandleTonAccountWarning, useIsPolkadotUnifiedChain } from '@subwallet/extension-koni-ui/hooks';
import { useChainAssets } from '@subwallet/extension-koni-ui/hooks/assets';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AccountAddressItemType, AccountTokenAddress, ReceiveModalProps } from '@subwallet/extension-koni-ui/types';
import { runMultiWarningHandleModal } from '@subwallet/extension-koni-ui/utils';
import { BitcoinMainnetKeypairTypes, BitcoinTestnetKeypairTypes, KeypairType } from '@subwallet/keyring/types';
import { ModalContext } from '@subwallet/react-ui';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

type HookType = {
  onOpenReceive: VoidFunction;
  receiveModalProps: ReceiveModalProps;
};

type SelectedTokenInfo = {
  tokenSlug: string;
  chainSlug: string;
}

const tokenSelectorModalId = RECEIVE_MODAL_TOKEN_SELECTOR;
const accountSelectorModalId = RECEIVE_MODAL_ACCOUNT_SELECTOR;

export default function useCoreReceiveModalHelper (tokenGroupSlug?: string): HookType {
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { chainAssets } = useChainAssets();

  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const isAllAccount = useSelector((state: RootState) => state.accountState.isAllAccount);
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [selectedTokenInfo, setSelectedTokenInfo] = useState<SelectedTokenInfo | undefined>();
  const [selectedAccountAddressItem, setSelectedAccountAddressItem] = useState<AccountAddressItemType | undefined>();
  const { accountTokenAddressModal, addressQrModal, selectAddressFormatModal } = useContext(WalletModalContext);
  const { allowedChains: chainSupported } = useGetChainAndExcludedTokenByCurrentAccountProxy();
  const onHandleLedgerAccountWarning = useHandleLedgerAccountWarning();
  const onHandleTonAccountWarning = useHandleTonAccountWarning();
  const onHandleLedgerGenericAccountWarning = useHandleLedgerGenericAccountWarning();
  const getReformatAddress = useCoreCreateReformatAddress();
  const checkIsPolkadotUnifiedChain = useIsPolkadotUnifiedChain();
  const getBitcoinAccounts = useGetBitcoinAccounts();

  // token info related to tokenGroupSlug, if it is token slug
  const specificSelectedTokenInfo = useMemo<SelectedTokenInfo | undefined>(() => {
    if (tokenGroupSlug && assetRegistryMap[tokenGroupSlug]) {
      return {
        tokenSlug: tokenGroupSlug,
        chainSlug: _getAssetOriginChain(assetRegistryMap[tokenGroupSlug])
      };
    }

    return undefined;
  }, [assetRegistryMap, tokenGroupSlug]);

  const openAddressQrModal = useCallback((address: string, accountType: KeypairType, accountProxyId: string, chainSlug: string, tokenSlug: string, closeCallback?: VoidCallback, showQrBack = true) => {
    const processFunction = () => {
      addressQrModal.open({
        address,
        chainSlug,
        onBack: showQrBack ? addressQrModal.close : undefined,
        onCancel: () => {
          addressQrModal.close();
          closeCallback?.();
        }
      });
    };

    const accountProxy = accountProxies.find((ap) => ap.id === accountProxyId);

    runMultiWarningHandleModal([
      [onHandleTonAccountWarning, accountType],
      [onHandleLedgerGenericAccountWarning, { accountProxy, chainSlug }],
      [onHandleLedgerAccountWarning, { accountProxy, targetSlug: tokenSlug, context: 'useToken' }]
    ], processFunction);
  }, [accountProxies, addressQrModal, onHandleLedgerAccountWarning, onHandleLedgerGenericAccountWarning, onHandleTonAccountWarning]);

  const openAddressFormatModal = useCallback((name: string, address: string, chainSlug: string, closeCallback?: VoidCallback) => {
    const processFunction = () => {
      selectAddressFormatModal.open({
        name: name,
        address: address,
        chainSlug: chainSlug,
        onBack: selectAddressFormatModal.close,
        onCancel: () => {
          selectAddressFormatModal.close();
          closeCallback?.();
        }
      });
    };

    processFunction();
  }, [selectAddressFormatModal]);

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

  /* --- token Selector */

  const tokenSelectorItems = useMemo<_ChainAsset[]>(() => {
    const rawAssets = chainAssets.filter((asset) => chainSupported.includes(asset.originChain));

    if (tokenGroupSlug) {
      return rawAssets.filter((asset) => asset.slug === tokenGroupSlug || _getMultiChainAsset(asset) === tokenGroupSlug);
    }

    return rawAssets;
  }, [chainAssets, tokenGroupSlug, chainSupported]);

  const onCloseTokenSelector = useCallback(() => {
    inactiveModal(tokenSelectorModalId);
  }, [inactiveModal]);

  const onSelectTokenSelector = useCallback((item: _ChainAsset) => {
    // do not need the logic to check if item is compatible with currentAccountProxy here, it's already in tokenSelectorItems code block

    if (!currentAccountProxy) {
      return;
    }

    const chainSlug = _getAssetOriginChain(item);
    const chainInfo = chainInfoMap[chainSlug];

    if (!chainInfo) {
      console.warn(`Missing chainInfo with slug ${chainSlug}`);

      return;
    }

    setSelectedTokenInfo({
      tokenSlug: item.slug,
      chainSlug
    });

    if (isAllAccount) {
      setTimeout(() => {
        activeModal(accountSelectorModalId);
      }, 100);

      return;
    }

    const isBitcoinChain = _isChainBitcoinCompatible(chainInfo);

    if (isBitcoinChain) {
      const accountTokenAddressList = getBitcoinAccounts(chainSlug, item.slug, chainInfo, currentAccountProxy.accounts);

      if (accountTokenAddressList.length > 1) {
        openAccountTokenAddressModal(accountTokenAddressList, () => {
          inactiveModal(tokenSelectorModalId);
          setSelectedAccountAddressItem(undefined);
        });
      } else if (accountTokenAddressList.length === 1) {
        openAddressQrModal(accountTokenAddressList[0].accountInfo.address, accountTokenAddressList[0].accountInfo.type, currentAccountProxy.id, chainSlug, item.slug, () => {
          inactiveModal(tokenSelectorModalId);
          setSelectedAccountAddressItem(undefined);
        });
      }

      return;
    }

    const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(chainSlug);

    for (const accountJson of currentAccountProxy.accounts) {
      const reformatedAddress = getReformatAddress(accountJson, chainInfo);

      if (reformatedAddress) {
        const accountAddressItem: AccountAddressItemType = {
          accountName: accountJson.name || '',
          accountProxyId: accountJson.proxyId || '',
          accountProxyType: currentAccountProxy.accountType,
          accountType: accountJson.type,
          address: reformatedAddress
        };

        setSelectedAccountAddressItem(accountAddressItem);

        if (isPolkadotUnifiedChain) {
          openAddressFormatModal(chainInfo.name, reformatedAddress, chainSlug, () => {
            inactiveModal(tokenSelectorModalId);
            setSelectedAccountAddressItem(undefined);
          });
        } else {
          openAddressQrModal(reformatedAddress, accountJson.type, currentAccountProxy.id, chainSlug, item.slug, () => {
            inactiveModal(tokenSelectorModalId);
            setSelectedAccountAddressItem(undefined);
          });
        }

        break;
      }
    }
  }, [currentAccountProxy, chainInfoMap, isAllAccount, checkIsPolkadotUnifiedChain, activeModal, getBitcoinAccounts, openAccountTokenAddressModal, inactiveModal, openAddressQrModal, getReformatAddress, openAddressFormatModal]);

  /* token Selector --- */

  /* --- account Selector */

  const accountSelectorItems = useMemo<AccountAddressItemType[]>(() => {
    const targetTokenInfo = specificSelectedTokenInfo || selectedTokenInfo;
    const chainInfo = targetTokenInfo ? chainInfoMap[targetTokenInfo.chainSlug] : undefined;

    if (!chainInfo) {
      return [];
    }

    const result: AccountAddressItemType[] = [];

    const updateResult = (ap: AccountProxy, a: AccountJson, chainInfo: _ChainInfo) => {
      const reformatedAddress = getReformatAddress(a, chainInfo);

      if (reformatedAddress) {
        result.push({
          accountName: ap.name,
          accountProxyId: ap.id,
          accountProxyType: ap.accountType,
          accountType: a.type,
          address: reformatedAddress,
          accountActions: ap.accountActions
        });
      }
    };

    const getPreferredBitcoinAccount = (accounts: AccountJson[]) => {
      const bitcoinAccounts = accounts.filter((a) => a.chainType === AccountChainType.BITCOIN && _isChainInfoCompatibleWithAccountInfo(chainInfo, a));

      return bitcoinAccounts.find((a) => a.type === 'bitcoin-84' || a.type === 'bittest-84') || bitcoinAccounts[0];
    };

    accountProxies.forEach((ap) => {
      // case bitcoin accounts
      if (ap.chainTypes.includes(AccountChainType.BITCOIN)) {
        const preferredBitcoinAccount = getPreferredBitcoinAccount(ap.accounts);

        preferredBitcoinAccount && updateResult(ap, preferredBitcoinAccount, chainInfo);
      }

      // case non-bitcoin accounts
      ap.accounts.forEach((a) => {
        if (a.chainType === AccountChainType.BITCOIN) {
          return;
        }

        updateResult(ap, a, chainInfo);
      });
    });

    return result;
  }, [accountProxies, chainInfoMap, getReformatAddress, selectedTokenInfo, specificSelectedTokenInfo]);

  const onBackAccountSelector = useMemo(() => {
    // if specificChain has value, it means tokenSelector does not show up, so accountSelector does not have back action
    if (specificSelectedTokenInfo) {
      return undefined;
    }

    return () => {
      inactiveModal(accountSelectorModalId);
    };
  }, [inactiveModal, specificSelectedTokenInfo]);

  const onCloseAccountSelector = useCallback(() => {
    inactiveModal(accountSelectorModalId);
    inactiveModal(tokenSelectorModalId);
    setSelectedTokenInfo(undefined);
    setSelectedAccountAddressItem(undefined);
  }, [inactiveModal]);

  const onSelectAccountSelector = useCallback((item: AccountAddressItemType) => {
    const targetTokenInfo = specificSelectedTokenInfo || selectedTokenInfo;

    if (!targetTokenInfo) {
      return;
    }

    const targetChain = targetTokenInfo.chainSlug;

    const chainInfo = chainInfoMap[targetChain];

    if (!chainInfo) {
      return;
    }

    const isBitcoinAccountItem = [...BitcoinMainnetKeypairTypes, ...BitcoinTestnetKeypairTypes].includes(item.accountType);

    if (isBitcoinAccountItem) {
      const targetAccountProxy = accountProxies.find((ap) => ap.id === item.accountProxyId);

      if (!targetAccountProxy) {
        return;
      }

      const accountTokenAddressList = getBitcoinAccounts(targetChain, targetTokenInfo.tokenSlug, chainInfo, targetAccountProxy.accounts);

      if (accountTokenAddressList.length > 1) {
        openAccountTokenAddressModal(accountTokenAddressList, onCloseAccountSelector);
      } else {
        openAddressQrModal(item.address, item.accountType, item.accountProxyId, targetChain, targetTokenInfo.tokenSlug, onCloseAccountSelector);
      }

      return;
    }

    setSelectedAccountAddressItem(item);
    const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(targetChain);

    if (isPolkadotUnifiedChain) {
      openAddressFormatModal(chainInfo.name, item.address, targetChain, onCloseAccountSelector);
    } else {
      openAddressQrModal(item.address, item.accountType, item.accountProxyId, targetChain, targetTokenInfo.tokenSlug, onCloseAccountSelector);
    }
  }, [accountProxies, chainInfoMap, checkIsPolkadotUnifiedChain, getBitcoinAccounts, onCloseAccountSelector, openAccountTokenAddressModal, openAddressFormatModal, openAddressQrModal, selectedTokenInfo, specificSelectedTokenInfo]);

  /* account Selector --- */

  const onOpenReceive = useCallback(() => {
    if (!currentAccountProxy) {
      return;
    }

    const handleShowQrModal = (chainSlug: string, tokenSlug: string) => {
      const chainInfo = chainInfoMap[chainSlug];

      if (!chainInfo) {
        return;
      }

      const isBitcoinChain = _isChainBitcoinCompatible(chainInfo);

      if (isBitcoinChain) {
        const accountTokenAddressList = getBitcoinAccounts(chainSlug, tokenSlug, chainInfo, currentAccountProxy.accounts);

        if (accountTokenAddressList.length > 1) {
          openAccountTokenAddressModal(accountTokenAddressList, () => {
            inactiveModal(tokenSelectorModalId);
            setSelectedAccountAddressItem(undefined);
          });
        } else if (accountTokenAddressList.length === 1) {
          openAddressQrModal(accountTokenAddressList[0].accountInfo.address, accountTokenAddressList[0].accountInfo.type, currentAccountProxy.id, chainSlug, () => {
            inactiveModal(tokenSelectorModalId);
            setSelectedAccountAddressItem(undefined);
          });
        }

        return;
      }

      const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(chainSlug);

      for (const accountJson of currentAccountProxy.accounts) {
        const reformatedAddress = getReformatAddress(accountJson, chainInfo);

        if (reformatedAddress) {
          const accountAddressItem: AccountAddressItemType = {
            accountName: accountJson.name || '',
            accountProxyId: accountJson.proxyId || '',
            accountProxyType: currentAccountProxy.accountType,
            accountType: accountJson.type,
            address: reformatedAddress
          };

          setSelectedAccountAddressItem(accountAddressItem);

          if (isPolkadotUnifiedChain) {
            openAddressFormatModal(chainInfo.name, reformatedAddress, chainSlug, () => {
              setSelectedAccountAddressItem(undefined);
            });
          } else {
            openAddressQrModal(reformatedAddress, accountJson.type, currentAccountProxy.id, chainSlug, tokenSlug, () => {
              setSelectedAccountAddressItem(undefined);
            }, false);
          }

          break;
        }
      }
    };

    if (specificSelectedTokenInfo) {
      if (!chainSupported.includes(specificSelectedTokenInfo.chainSlug)) {
        console.warn('tokenGroupSlug does not work with current account');

        return;
      }

      // current account is All
      if (isAllAccount) {
        activeModal(accountSelectorModalId);

        return;
      }

      // current account is not All, just do show QR logic

      handleShowQrModal(specificSelectedTokenInfo.chainSlug, specificSelectedTokenInfo.tokenSlug);

      return;
    }

    if (tokenSelectorItems.length === 1 && tokenGroupSlug) {
      if (isAllAccount) {
        setSelectedTokenInfo({
          tokenSlug: tokenSelectorItems[0].slug,
          chainSlug: tokenSelectorItems[0].originChain
        });
        activeModal(accountSelectorModalId);

        return;
      }

      handleShowQrModal(tokenSelectorItems[0].originChain, tokenSelectorItems[0].slug);

      return;
    }

    activeModal(tokenSelectorModalId);
  }, [activeModal, chainInfoMap, chainSupported, checkIsPolkadotUnifiedChain, currentAccountProxy, excludedTokens, getBitcoinAccounts, getReformatAddress, inactiveModal, isAllAccount, openAccountTokenAddressModal, openAddressFormatModal, openAddressQrModal, specificSelectedTokenInfo, tokenGroupSlug, tokenSelectorItems]);

  useEffect(() => {
    if (addressQrModal.checkActive() && selectedAccountAddressItem) {
      addressQrModal.update((prev) => {
        if (!prev || !TON_CHAINS.includes(prev.chainSlug)) {
          return prev;
        }

        const targetAddress = accountSelectorItems.find((i) => i.accountProxyId === selectedAccountAddressItem.accountProxyId)?.address;

        if (targetAddress) {
          return {
            ...prev,
            address: targetAddress
          };
        }

        const selectedAccount = accountSelectorItems.find((item) => item.accountName === selectedAccountAddressItem.accountName);
        const isSoloAccount = selectedAccount?.accountProxyType === AccountProxyType.SOLO;
        const hasTonChangeWalletContractVersion = selectedAccount?.accountActions?.includes(AccountActions.TON_CHANGE_WALLET_CONTRACT_VERSION);
        const latestAddress = selectedAccount?.address;

        if (isSoloAccount && hasTonChangeWalletContractVersion && latestAddress) {
          setSelectedAccountAddressItem(selectedAccount);

          return {
            ...prev,
            address: latestAddress
          };
        }

        return prev;
      });
    }
  }, [accountSelectorItems, addressQrModal, selectedAccountAddressItem]);

  return useMemo(() => ({
    onOpenReceive,
    receiveModalProps: {
      tokenSelectorItems,
      onCloseTokenSelector,
      onSelectTokenSelector,
      accountSelectorItems,
      onBackAccountSelector,
      onCloseAccountSelector,
      onSelectAccountSelector
    }
  }), [accountSelectorItems, onBackAccountSelector, onCloseAccountSelector, onCloseTokenSelector, onOpenReceive, onSelectAccountSelector, onSelectTokenSelector, tokenSelectorItems]);
}
