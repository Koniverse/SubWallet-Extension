// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { AccountChainType, AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { AccountSelectorModal, AlertBox, CloseIcon, EmptyList, NftCollectionModal, PageWrapper, ReceiveModal, TonWalletContractSelectorModal } from '@subwallet/extension-koni-ui/components';
import { FilterTabItemType, FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import BannerGenerator from '@subwallet/extension-koni-ui/components/StaticContent/BannerGenerator';
import { TokenGroupBalanceItem } from '@subwallet/extension-koni-ui/components/TokenItem/TokenGroupBalanceItem';
import { CUSTOMIZE_MODAL, DEFAULT_SWAP_PARAMS, DEFAULT_TRANSFER_PARAMS, IS_SHOW_TON_CONTRACT_VERSION_WARNING, SWAP_TRANSACTION, TON_ACCOUNT_SELECTOR_MODAL, TON_WALLET_CONTRACT_SELECTOR_MODAL, TRANSFER_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useCoreReceiveModalHelper, useDebouncedValue, useGetBannerByScreen, useGetChainAndExcludedTokenByCurrentAccountProxy, useGetNftByAccount, useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { reloadCron } from '@subwallet/extension-koni-ui/messaging';
import { GlobalSearchTokenGroupModalId } from '@subwallet/extension-koni-ui/Popup/Home';
import { INftCollectionDetail } from '@subwallet/extension-koni-ui/Popup/Home/Nfts';
import { NftGalleryWrapper } from '@subwallet/extension-koni-ui/Popup/Home/Nfts/component/NftGalleryWrapper';
import { UpperBlock } from '@subwallet/extension-koni-ui/Popup/Home/Tokens/UpperBlock';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AccountAddressItemType, ThemeProps, TransferParams } from '@subwallet/extension-koni-ui/types';
import { TokenBalanceItemType } from '@subwallet/extension-koni-ui/types/balance';
import { getTransactionFromAccountProxyValue, isAccountAll, sortTokensByStandard } from '@subwallet/extension-koni-ui/utils';
import { isTonAddress } from '@subwallet/keyring';
import { ActivityIndicator, Button, ButtonProps, Dropdown, Icon, ModalContext, SwAlert, SwList } from '@subwallet/react-ui';
import classNames from 'classnames';
import { ArrowClockwise, Coins, DotsThree, FadersHorizontal, MagnifyingGlass, Plus, PlusCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps;

const tonWalletContractSelectorModalId = TON_WALLET_CONTRACT_SELECTOR_MODAL;
const tonAccountSelectorModalId = TON_ACCOUNT_SELECTOR_MODAL;

export enum AssetsTab {
  TOKENS = 'tokens',
  NFTS = 'nfts'
}

export interface LocationState {
  from?: string;
}

const NFT_COLLECTION_MODAL_ID = 'nft_collection_modal_id';

const Component = (): React.ReactElement => {
  useSetCurrentPage('/home/tokens');
  const { t } = useTranslation();
  const [isShrink, setIsShrink] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation() as unknown as { state?: LocationState };
  const originScreen = location.state?.from ?? '';
  const containerRef = useRef<HTMLDivElement>(null);
  const topBlockRef = useRef<HTMLDivElement>(null);
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);
  const isAllAccount = useSelector((state: RootState) => state.accountState.isAllAccount);
  const { accountBalance: { tokenGroupBalanceMap,
    totalBalanceInfo }, tokenGroupStructure: { tokenGroups } } = useContext(HomeContext);
  const notify = useNotification();
  const { onOpenReceive, receiveModalProps } = useCoreReceiveModalHelper();
  const { nftCollections, nftItems } = useGetNftByAccount();
  const priorityTokens = useSelector((state: RootState) => state.chainStore.priorityTokens);
  const [loading, setLoading] = React.useState<boolean>(false);
  const isZkModeSyncing = useSelector((state: RootState) => state.mantaPay.isSyncing);
  const zkModeSyncProgress = useSelector((state: RootState) => state.mantaPay.progress);
  const [, setStorage] = useLocalStorage<TransferParams>(TRANSFER_TRANSACTION, DEFAULT_TRANSFER_PARAMS);
  const [, setSwapStorage] = useLocalStorage(SWAP_TRANSACTION, DEFAULT_SWAP_PARAMS);
  const { banners, dismissBanner, onClickBanner } = useGetBannerByScreen('token');
  const { allowedChains } = useGetChainAndExcludedTokenByCurrentAccountProxy();
  const buyTokenInfos = useSelector((state: RootState) => state.buyService.tokens);
  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);
  const isTonWalletContactSelectorModalActive = checkActive(tonWalletContractSelectorModalId);
  const [isShowTonWarning, setIsShowTonWarning] = useLocalStorage(IS_SHOW_TON_CONTRACT_VERSION_WARNING, true);
  const tonAddress = useMemo(() => {
    return currentAccountProxy?.accounts.find((acc) => isTonAddress(acc.address))?.address;
  }, [currentAccountProxy]);
  const [currentTonAddress, setCurrentTonAddress] = useState(isAllAccount ? undefined : tonAddress);
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(AssetsTab.TOKENS);

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    const topPosition = event.currentTarget.scrollTop;

    if (topPosition > 80) {
      setIsShrink((value) => {
        if (!value && topBlockRef.current && containerRef.current) {
          const containerProps = containerRef.current.getBoundingClientRect();

          topBlockRef.current.style.position = 'fixed';
          topBlockRef.current.style.top = `${Math.floor(containerProps.top)}px`;
          topBlockRef.current.style.left = `${containerProps.left}px`;
          topBlockRef.current.style.right = `${containerProps.right}px`;
          topBlockRef.current.style.width = `${containerProps.width}px`;
          topBlockRef.current.style.opacity = '0';
          topBlockRef.current.style.paddingTop = '0';

          setTimeout(() => {
            if (topBlockRef.current) {
              topBlockRef.current.style.opacity = '1';
              topBlockRef.current.style.paddingTop = '32px';
            }
          }, 100);
        }

        return true;
      });
    } else {
      setIsShrink((value) => {
        if (value && topBlockRef.current) {
          topBlockRef.current.style.position = 'absolute';
          topBlockRef.current.style.top = '0';
          topBlockRef.current.style.left = '0';
          topBlockRef.current.style.right = '0';
          topBlockRef.current.style.width = '100%';
          topBlockRef.current.style.opacity = '0';
          topBlockRef.current.style.paddingTop = '0';

          setTimeout(() => {
            if (topBlockRef.current) {
              topBlockRef.current.style.opacity = '1';
              topBlockRef.current.style.paddingTop = '32px';
            }
          }, 100);
        }

        return false;
      });
    }
  }, []);

  const handleResize = useCallback(() => {
    const topPosition = containerRef.current?.scrollTop || 0;

    if (topPosition > 80) {
      if (topBlockRef.current && containerRef.current) {
        const containerProps = containerRef.current.getBoundingClientRect();

        topBlockRef.current.style.top = `${Math.floor(containerProps.top)}px`;
        topBlockRef.current.style.left = `${containerProps.left}px`;
        topBlockRef.current.style.right = `${containerProps.right}px`;
        topBlockRef.current.style.width = `${containerProps.width}px`;
      }
    } else {
      if (topBlockRef.current) {
        topBlockRef.current.style.top = '0';
        topBlockRef.current.style.left = '0';
        topBlockRef.current.style.right = '0';
        topBlockRef.current.style.width = '100%';
      }
    }
  }, []);

  const isTotalBalanceDecrease = totalBalanceInfo.change.status === 'decrease';

  const isSupportBuyTokens = useMemo(() => {
    return Object.values(buyTokenInfos).some((item) => allowedChains.includes(item.network));
  }, [allowedChains, buyTokenInfos]);

  const isHaveOnlyTonSoloAcc = useMemo(() => {
    const checkValidAcc = (currentAcc: AccountProxy) => {
      return currentAcc?.accountType === AccountProxyType.SOLO && currentAcc?.chainTypes.includes(AccountChainType.TON);
    };

    if (isAllAccount) {
      return accountProxies.filter((a) => a.accountType !== AccountProxyType.ALL_ACCOUNT).every((acc) => checkValidAcc(acc));
    } else {
      return currentAccountProxy && checkValidAcc(currentAccountProxy);
    }
  }, [accountProxies, currentAccountProxy, isAllAccount]);

  const isSwapSupported = useMemo(() => {
    const isSupportAccount = (currentAcc: AccountProxy) => {
      const isReadOnlyAccount = currentAcc.accountType === AccountProxyType.READ_ONLY;
      const isLedgerAccount = currentAcc.accountType === AccountProxyType.LEDGER;
      const isSoloAccount = currentAcc.accountType === AccountProxyType.SOLO;
      const validEcosystem = [AccountChainType.ETHEREUM, AccountChainType.SUBSTRATE, AccountChainType.BITCOIN].includes(currentAcc.chainTypes[0]);
      const invalidSoloAccount = isSoloAccount && !validEcosystem;

      return !invalidSoloAccount && !isLedgerAccount && !isReadOnlyAccount;
    };

    const isSupportAllAccount = (accountProxies: AccountProxy[]) => {
      return accountProxies.filter((account) => account.accountType !== AccountProxyType.ALL_ACCOUNT).some((account) => isSupportAccount(account));
    };

    if (!currentAccountProxy || currentAccountProxy.chainTypes.length <= 0) {
      return false;
    }

    if (isAllAccount) {
      return isSupportAllAccount(accountProxies);
    } else {
      return isSupportAccount(currentAccountProxy);
    }
  }, [accountProxies, currentAccountProxy, isAllAccount]);

  const tonAccountList: AccountAddressItemType[] = useMemo(() => {
    return accountProxies.filter((acc) => acc?.accountType === AccountProxyType.SOLO && acc?.chainTypes.includes(AccountChainType.TON)).map((item) => ({
      accountName: item.name,
      accountProxyId: item.id,
      accountProxyType: item.accountType,
      accountType: item.accounts[0].type,
      address: item.accounts[0].address,
      accountActions: item.accountActions
    }));
  }, [accountProxies]);

  const onCloseAccountSelector = useCallback(() => {
    setIsShowTonWarning(false);
    inactiveModal(tonAccountSelectorModalId);
  }, [inactiveModal, setIsShowTonWarning]);

  const onSelectAccountSelector = useCallback((item: AccountAddressItemType) => {
    setCurrentTonAddress(item.address);
    activeModal(tonWalletContractSelectorModalId);
  }, [activeModal]);

  const onBackTonWalletContactModal = useCallback(() => {
    inactiveModal(tonWalletContractSelectorModalId);
  }, [inactiveModal]);

  const onCloseTonWalletContactModal = useCallback(() => {
    setIsShowTonWarning(false);
    setTimeout(() => {
      inactiveModal(tonAccountSelectorModalId);
      inactiveModal(tonWalletContractSelectorModalId);
    }, 200);
  }, [inactiveModal, setIsShowTonWarning]);

  const onOpenTonWalletContactModal = useCallback(() => {
    if (isAllAccount) {
      activeModal(tonAccountSelectorModalId);
    } else {
      setCurrentTonAddress(tonAddress);
      activeModal(tonWalletContractSelectorModalId);
    }
  }, [activeModal, isAllAccount, tonAddress]);

  const onClickItem = useCallback((item: TokenBalanceItemType) => {
    return () => {
      navigate(`/home/tokens/detail/${item.slug}`);
    };
  }, [navigate]);

  const onClickManageToken = useCallback(() => {
    navigate('/settings/tokens/manage');
  }, [navigate]);

  const onOpenSendFund = useCallback(() => {
    if (!currentAccountProxy) {
      return;
    }

    if (currentAccountProxy.accountType === AccountProxyType.READ_ONLY) {
      notify({
        message: t('ui.BALANCE.screen.Tokens.accountIsWatchOnlyCannotSend'),
        type: 'info',
        duration: 3
      });

      return;
    }

    setStorage({
      ...DEFAULT_TRANSFER_PARAMS,
      fromAccountProxy: getTransactionFromAccountProxyValue(currentAccountProxy)
    });
    navigate('/transaction/send-fund');
  }, [currentAccountProxy, setStorage, navigate, notify, t]
  );

  const onOpenBuyTokens = useCallback(() => {
    navigate('/buy-tokens');
  }, [navigate]
  );

  const onOpenSwap = useCallback(() => {
    if (!currentAccountProxy) {
      return;
    }

    if (currentAccountProxy.accountType === AccountProxyType.READ_ONLY) {
      notify({
        message: t('ui.BALANCE.screen.Tokens.accountIsWatchOnlyCannotSend'),
        type: 'info',
        duration: 3
      });

      return;
    }

    const filteredAccounts = accountProxies.filter((ap) => !isAccountAll(ap.id));

    const isAllLedger = currentAccountProxy.accountType === AccountProxyType.LEDGER || (filteredAccounts.length > 0 && filteredAccounts.every((ap) => ap.accountType === AccountProxyType.LEDGER));

    if (isAllLedger) {
      notify({
        message: 'The account you are using is Ledger account, you cannot use this feature with it',
        type: 'error',
        duration: 3
      });

      return;
    }

    setSwapStorage({
      ...DEFAULT_SWAP_PARAMS,
      fromAccountProxy: getTransactionFromAccountProxyValue(currentAccountProxy)
    });
    navigate('/transaction/swap');
  }, [accountProxies, currentAccountProxy, navigate, notify, setSwapStorage, t]);

  const debouncedTokenGroupBalanceMap = useDebouncedValue<Record<string, TokenBalanceItemType>>(tokenGroupBalanceMap, 300);

  const tokenGroupBalanceItems = useMemo((): TokenBalanceItemType[] => {
    const result: TokenBalanceItemType[] = [];

    tokenGroups.forEach((tokenGroupSlug) => {
      if (debouncedTokenGroupBalanceMap[tokenGroupSlug]) {
        result.push(debouncedTokenGroupBalanceMap[tokenGroupSlug]);
      }
    });

    sortTokensByStandard(result, priorityTokens, true);

    return result;
  }, [tokenGroups, debouncedTokenGroupBalanceMap, priorityTokens]);

  const filterTabItems = useMemo<FilterTabItemType[]>(() => {
    return [
      {
        label: t('Tokens'),
        value: AssetsTab.TOKENS
      },
      {
        label: t('NFTs'),
        value: AssetsTab.NFTS
      }
    ];
  }, [t]);

  const onSelectFilterTab = useCallback((value: string) => {
    setSelectedFilterTab(value);
  }, []);

  const searchCollection = useCallback((collection: NftCollection, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();

    return (
      collection.collectionName?.toLowerCase().includes(searchTextLowerCase) ||
      collection.collectionId.toLowerCase().includes(searchTextLowerCase)
    );
  }, []);

  const emptyButtonProps = useMemo((): ButtonProps => {
    return {
      icon: (
        <Icon
          phosphorIcon={PlusCircle}
          weight='fill'
        />
      ),
      children: t('Import NFT'),
      shape: 'circle',
      size: 'xs',
      onClick: () => {
        navigate('/settings/tokens/import-nft', { state: { assetsTab: AssetsTab.NFTS } });
      }
    };
  }, [navigate, t]);

  const emptyNft = useCallback(() => {
    return (
      <EmptyList
        buttonProps={emptyButtonProps}
        emptyMessage={t('Click [+] on the top right corner to import your NFT')}
        emptyTitle={t('ui.NFT.screen.NftsCollections.noNftsFound')}
      />
    );
  }, [emptyButtonProps, t]);

  const handleOnClickCollection = useCallback((state: INftCollectionDetail) => {
    navigate('/home/nfts/collection-detail', { state });
  }, [navigate]);

  const handleImportNft = useCallback(() => {
    navigate('/settings/tokens/import-nft', { state: { assetsTab: AssetsTab.NFTS } });
  }, [navigate]);

  const onOpenNftModal = useCallback(() => {
    activeModal(NFT_COLLECTION_MODAL_ID);
  }, [activeModal]);

  const onCloseNftModal = useCallback(() => {
    inactiveModal(NFT_COLLECTION_MODAL_ID);
  }, [inactiveModal]);

  const getNftsByCollection = useCallback((nftCollection: NftCollection) => {
    const nftList: NftItem[] = [];

    nftItems.forEach((nftItem) => {
      if (nftItem.collectionId === nftCollection.collectionId && nftItem.chain === nftCollection.chain) {
        nftList.push(nftItem);
      }
    });

    return nftList;
  }, [nftItems]);

  const renderNftCollection = useCallback((nftCollection: NftCollection) => {
    const nftList = getNftsByCollection(nftCollection);

    let fallbackImage: string | undefined;

    for (const nft of nftList) { // fallback to any nft image
      if (nft.image) {
        fallbackImage = nft.image;
        break;
      }
    }

    const state: INftCollectionDetail = { collectionInfo: nftCollection, nftList };

    return (
      <NftGalleryWrapper
        fallbackImage={fallbackImage}
        handleOnClick={handleOnClickCollection}
        image={nftCollection.image}
        itemCount={nftList.length}
        key={`${nftCollection.collectionId}_${nftCollection.chain}`}
        routingParams={state}
        title={nftCollection.collectionName || nftCollection.collectionId}
      />
    );
  }, [getNftsByCollection, handleOnClickCollection]);

  const onOpenGlobalSearchTokenGroup = useCallback(() => {
    activeModal(GlobalSearchTokenGroupModalId);
  }, [activeModal]);

  const onOpenCustomizeModal = useCallback(() => {
    activeModal(CUSTOMIZE_MODAL);
  }, [activeModal]);

  const onCronReloadNfts = useCallback(() => {
    setLoading(true);
    notify({
      icon: <ActivityIndicator size={32} />,
      style: { top: 210 },
      direction: 'vertical',
      duration: 1.8,
      closable: false,
      message: t('ui.NFT.screen.NftsCollections.reloading', 'Reloading NFTs...')
    });

    reloadCron({ data: 'nft' })
      .then(() => {
        setLoading(false);
      })
      .catch(console.error);
  }, [notify, t]);

  const tokenActions = useMemo(() => (
    <>
      <Button
        icon={<Icon
          phosphorIcon={MagnifyingGlass}
          size='sm'
        />}
        onClick={onOpenGlobalSearchTokenGroup}
        size='sm'
        type='ghost'
      />
      <Button
        icon={<Icon
          phosphorIcon={FadersHorizontal}
          size='sm'
          weight='bold'
        />}
        onClick={onOpenCustomizeModal}
        size='sm'
        tooltip={t('Customize networks')}
        type='ghost'
      />
    </>
  ), [onOpenCustomizeModal, onOpenGlobalSearchTokenGroup, t]);

  const nftActions = useMemo(() => (
    !isShrink
      ? (
        <>
          <Button
            icon={<Icon
              phosphorIcon={MagnifyingGlass}
              size='sm'
            />}
            onClick={onOpenNftModal}
            size='sm'
            type='ghost'
          />
          <Button
            icon={<Icon
              phosphorIcon={Plus}
              size='sm'
              weight='bold'
            />}
            onClick={handleImportNft}
            size='sm'
            type='ghost'
          />
          <Button
            disabled={loading}
            icon={<Icon
              phosphorIcon={ArrowClockwise}
              size='sm'
              weight='bold'
            />}
            onClick={onCronReloadNfts}
            size='sm'
            type='ghost'
          />
        </>
      )
      : (
        <Dropdown
          arrow={false}
          menu={{
            items: [
              { key: 'import', label: t('Import NFT'), icon: <Icon phosphorIcon={Plus} />, onClick: handleImportNft },
              { key: 'search', label: t('Search NFTs'), icon: <Icon phosphorIcon={MagnifyingGlass} />, onClick: onOpenNftModal },
              { key: 'reload', label: t('Reload NFT list'), icon: <Icon phosphorIcon={ArrowClockwise} />, onClick: onCronReloadNfts }
            ]
          }}
          overlayClassName='sw-dropdown-menu'
          placement='bottomRight'
          trigger={['click']}
        >
          <Button
            icon={<Icon
              phosphorIcon={DotsThree}
              size='sm'
              weight='bold'
            />}
            size='sm'
            type='ghost'
          />
        </Dropdown>
      )
  ), [isShrink, handleImportNft, loading, onCronReloadNfts, t, onOpenNftModal]);

  useEffect(() => {
    if (originScreen === 'nfts') {
      setSelectedFilterTab(AssetsTab.NFTS);
    } else if (originScreen === 'tokenImport') {
      onOpenCustomizeModal();
    }
  }, [onOpenCustomizeModal, originScreen]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return (
    <div
      className={'tokens-screen-container'}
      onScroll={handleScroll}
      ref={containerRef}
    >
      <div
        className={classNames('__upper-block-wrapper', {
          '-is-shrink': isShrink,
          '-decrease': isTotalBalanceDecrease
        })}
        ref={topBlockRef}
      >
        <UpperBlock
          className={'__upper-block'}
          isPriceDecrease={isTotalBalanceDecrease}
          isShrink={isShrink}
          isSupportBuyTokens={isSupportBuyTokens}
          isSupportSwap={isSwapSupported}
          onOpenBuyTokens={onOpenBuyTokens}
          onOpenReceive={onOpenReceive}
          onOpenSendFund={onOpenSendFund}
          onOpenSwap={onOpenSwap}
          totalChangePercent={totalBalanceInfo.change.percent}
          totalChangeValue={totalBalanceInfo.change.value}
          totalValue={totalBalanceInfo.convertedValue}
        />
        <div className={'option-tab-wrapper'}>
          <div className={'left-block'}>
            <FilterTabs
              className={'filter-tabs-container'}
              items={filterTabItems}
              onSelect={onSelectFilterTab}
              selectedItem={selectedFilterTab}
            />
          </div>
          <div className='right-block'>
            {selectedFilterTab === AssetsTab.TOKENS && tokenActions}
            {selectedFilterTab === AssetsTab.NFTS && nftActions}
          </div>

        </div>

      </div>
      <div
        className={'__scroll-container'}
      >
        {
          isZkModeSyncing && (
            <SwAlert
              className={classNames('zk-mode-alert-area')}
              description={t('ui.BALANCE.screen.Tokens.refreshBalanceInfo')}
              title={t('ui.BALANCE.screen.Tokens.zkModeSyncing', { replace: { percent: zkModeSyncProgress || '0' } })}
              type={'warning'}
            />
          )
        }
        {
          isHaveOnlyTonSoloAcc && isShowTonWarning && (
            <>
              <AlertBox
                className={classNames('ton-solo-acc-alert-area')}
                description={<Trans
                  components={{
                    highlight: (
                      <a
                        className='link'
                        onClick={onOpenTonWalletContactModal}
                      />
                    )
                  }}
                  i18nKey={detectTranslate('ui.BALANCE.screen.Tokens.tonWalletVersionInfo')}
                />}
                title={t('ui.BALANCE.screen.Tokens.changeWalletAddressAndVersion')}
                type={'warning'}
              />
              <AccountSelectorModal
                items={tonAccountList}
                modalId={tonAccountSelectorModalId}
                onCancel={onCloseAccountSelector}
                onSelectItem={onSelectAccountSelector}
              />
              {currentTonAddress && isTonWalletContactSelectorModalActive &&
                <TonWalletContractSelectorModal
                  address={currentTonAddress}
                  chainSlug={'ton'}
                  id={tonWalletContractSelectorModalId}
                  isShowBackButton={isAllAccount}
                  onBack={onBackTonWalletContactModal}
                  onCancel={onCloseTonWalletContactModal}
                  rightIconProps={{
                    icon: <CloseIcon />,
                    onClick: onCloseTonWalletContactModal
                  }}
                />
              }
            </>
          )
        }
        {!!banners.length && (
          <div className={'token-banner-wrapper'}>
            <BannerGenerator
              banners={banners}
              dismissBanner={dismissBanner}
              onClickBanner={onClickBanner}
            />
          </div>
        )}

        {selectedFilterTab === AssetsTab.TOKENS && (
          <>
            {tokenGroupBalanceItems.length > 0
              ? (
                tokenGroupBalanceItems.map((item) => (
                  <TokenGroupBalanceItem
                    key={item.slug}
                    {...item}
                    onPressItem={onClickItem(item)}
                  />
                ))
              )
              : (
                <EmptyList
                  className='__empty-list'
                  emptyMessage={t('ui.BALANCE.screen.Tokens.trySearchingOrImporting')}
                  emptyTitle={t('ui.BALANCE.screen.Tokens.noTokensFound')}
                  phosphorIcon={Coins}
                />
              )}

            <div className='__scroll-footer'>
              <Button
                icon={<Icon phosphorIcon={FadersHorizontal} />}
                onClick={onClickManageToken}
                size='xs'
                type='ghost'
              >
                {t('ui.BALANCE.screen.Tokens.manageTokens')}
              </Button>
            </div>
          </>
        )}

        {selectedFilterTab === AssetsTab.NFTS && (
          <>
            <SwList
              className={classNames('nft_collection_list__container')}
              displayGrid={true}
              enableSearchInput={true}
              gridGap={'14px'}
              list={nftCollections}
              minColumnWidth={'160px'}
              renderItem={renderNftCollection}
              renderOnScroll={true}
              renderWhenEmpty={emptyNft}
              searchFunction={searchCollection}
              searchMinCharactersCount={2}
              searchPlaceholder={t<string>('ui.NFT.screen.NftsCollections.searchCollectionName')}
            />
          </>
        )}

      </div>

      <ReceiveModal
        {...receiveModalProps}
      />

      <NftCollectionModal
        id={NFT_COLLECTION_MODAL_ID}
        nftCollections={nftCollections}
        nftItems={nftItems}
        onCancel={onCloseNftModal}
      />
    </div>
  );
};

const WrapperComponent = ({ className = '' }: ThemeProps): React.ReactElement<Props> => {
  const dataContext = useContext(DataContext);

  return (
    <PageWrapper
      className={`tokens ${className}`}
      hideLoading={true}
      resolve={dataContext.awaitStores(['price', 'chainStore', 'assetRegistry', 'balance', 'mantaPay', 'swap', 'nft', 'balance'])}
    >
      <Component />
    </PageWrapper>
  );
};

const Tokens = styled(WrapperComponent)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return ({
    overflow: 'hidden',

    '.__empty-list': {
      marginTop: token.marginSM,
      marginBottom: token.marginSM
    },

    '.tokens-screen-container': {
      height: '100%',
      color: token.colorTextLight1,
      fontSize: token.fontSizeLG,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingTop: 246
    },

    '.option-tab-wrapper': {
      paddingLeft: token.padding,
      paddingRight: token.padding,
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between'
    },

    '.__scroll-container': {
      paddingLeft: token.size,
      paddingRight: token.size
    },

    '.__upper-block-wrapper': {
      backgroundColor: token.colorBgDefault,
      paddingBottom: 12,
      position: 'absolute',
      paddingTop: '32px',
      height: 246,
      zIndex: 10,
      top: 0,
      left: 0,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      transition: 'opacity, padding-top 0.27s ease',
      flexDirection: 'column',

      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 180,
        backgroundImage: extendToken.tokensScreenSuccessBackgroundColor,
        display: 'block',
        zIndex: 1
      },

      '&.-decrease:before': {
        backgroundImage: extendToken.tokensScreenDangerBackgroundColor
      },

      '&.-is-shrink': {
        height: 144,

        '&:before': {
          height: 80
        }
      }
    },

    '.tokens-upper-block': {
      flex: 1,
      position: 'relative',
      zIndex: 5,
      paddingBottom: 12
    },

    '.__scroll-footer': {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: token.size
    },

    '.token-group-balance-item': {
      marginBottom: token.sizeXS
    },

    '.__upper-block-wrapper.-is-shrink': {
      '.__static-block': {
        display: 'none'
      },

      '.__scrolling-block': {
        display: 'flex'
      }
    },

    '.zk-mode-alert-area, .ton-solo-acc-alert-area': {
      marginBottom: token.marginXS
    },

    '.token-banner-wrapper': {
      marginBottom: token.sizeXS
    }
  });
});

export default Tokens;
