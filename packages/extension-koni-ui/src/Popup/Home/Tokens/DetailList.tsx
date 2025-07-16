// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetPriceId, _getMultiChainAssetPriceId } from '@subwallet/extension-base/services/chain-service/utils';
import { TON_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import { AccountChainType, AccountProxy, AccountProxyType, BuyTokenInfo } from '@subwallet/extension-base/types';
import { AccountSelectorModal, AlertBox, CloseIcon, LoadingScreen, ReceiveModal, TonWalletContractSelectorModal } from '@subwallet/extension-koni-ui/components';
import PageWrapper from '@subwallet/extension-koni-ui/components/Layout/PageWrapper';
import BannerGenerator from '@subwallet/extension-koni-ui/components/StaticContent/BannerGenerator';
import { TokenBalanceDetailItem } from '@subwallet/extension-koni-ui/components/TokenItem/TokenBalanceDetailItem';
import { DEFAULT_SWAP_PARAMS, DEFAULT_TRANSFER_PARAMS, IS_SHOW_TON_CONTRACT_VERSION_WARNING, SWAP_TRANSACTION, TON_ACCOUNT_SELECTOR_MODAL, TON_WALLET_CONTRACT_SELECTOR_MODAL, TRANSFER_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useCoreReceiveModalHelper, useDefaultNavigate, useGetBannerByScreen, useGetChainSlugsByCurrentAccountProxy, useNavigateOnChangeAccount, useNotification, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { canShowChart } from '@subwallet/extension-koni-ui/messaging';
import { DetailModal } from '@subwallet/extension-koni-ui/Popup/Home/Tokens/DetailModal';
import { DetailUpperBlock } from '@subwallet/extension-koni-ui/Popup/Home/Tokens/DetailUpperBlock';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AccountAddressItemType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { TokenBalanceItemType } from '@subwallet/extension-koni-ui/types/balance';
import { getTransactionFromAccountProxyValue, isAccountAll, sortTokensByStandard } from '@subwallet/extension-koni-ui/utils';
import { isTonAddress } from '@subwallet/keyring';
import { KeypairType } from '@subwallet/keyring/types';
import { ModalContext } from '@subwallet/react-ui';
import { SwNumberProps } from '@subwallet/react-ui/es/number';
import classNames from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';
import {detectTranslate} from "@subwallet/extension-base/utils";

type Props = ThemeProps;

type CurrentSelectToken = {
  symbol: string;
  slug: string;
}

function WrapperComponent ({ className = '' }: ThemeProps): React.ReactElement<Props> {
  const dataContext = useContext(DataContext);

  return (
    <PageWrapper
      className={`tokens ${className}`}
      resolve={dataContext.awaitStores(['price', 'chainStore', 'assetRegistry', 'balance', 'swap'])}
    >
      <Component />
    </PageWrapper>
  );
}

const tonAccountSelectorModalId = TON_ACCOUNT_SELECTOR_MODAL;
const tonWalletContractSelectorModalId = TON_WALLET_CONTRACT_SELECTOR_MODAL;
const TokenDetailModalId = 'tokenDetailModalId';

function Component (): React.ReactElement {
  const { slug: tokenGroupSlug } = useParams();

  const notify = useNotification();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goHome } = useDefaultNavigate();

  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);
  const { accountBalance: { tokenBalanceMap, tokenGroupBalanceMap }, tokenGroupStructure: { tokenGroupMap } } = useContext(HomeContext);

  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const multiChainAssetMap = useSelector((state: RootState) => state.assetRegistry.multiChainAssetMap);
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);
  const isAllAccount = useSelector((state: RootState) => state.accountState.isAllAccount);
  const { tokens } = useSelector((state: RootState) => state.buyService);
  const priorityTokens = useSelector((root: RootState) => root.chainStore.priorityTokens);
  const [, setStorage] = useLocalStorage(TRANSFER_TRANSACTION, DEFAULT_TRANSFER_PARAMS);
  const [, setSwapStorage] = useLocalStorage(SWAP_TRANSACTION, DEFAULT_SWAP_PARAMS);
  const { banners, dismissBanner, onClickBanner } = useGetBannerByScreen('token_detail', tokenGroupSlug);
  const allowedChains = useGetChainSlugsByCurrentAccountProxy();
  const isTonWalletContactSelectorModalActive = checkActive(tonWalletContractSelectorModalId);
  const [isShowTonWarning, setIsShowTonWarning] = useLocalStorage(IS_SHOW_TON_CONTRACT_VERSION_WARNING, true);
  const tonAddress = useMemo(() => {
    return currentAccountProxy?.accounts.find((acc) => isTonAddress(acc.address))?.address;
  }, [currentAccountProxy]);
  const [currentTonAddress, setCurrentTonAddress] = useState(isAllAccount ? undefined : tonAddress);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChartSupported, setIsChartSupported] = useState(false);

  const filteredAccountList: AccountAddressItemType[] = useMemo(() => {
    return accountProxies.filter((acc) => {
      const isTonSoloAcc = acc.accountType === AccountProxyType.SOLO && acc.chainTypes.includes(AccountChainType.TON);

      return acc.accountType === AccountProxyType.UNIFIED || isTonSoloAcc;
    }).map((item) => {
      const tonAcc = item.accounts.find((a) => isTonAddress(a.address));

      return {
        accountName: item.name,
        accountProxyId: item.id,
        accountProxyType: item.accountType,
        accountType: tonAcc?.type as KeypairType,
        address: tonAcc?.address || '',
        accountActions: item.accountActions
      };
    });
  }, [accountProxies]);

  const containerRef = useRef<HTMLDivElement>(null);
  const topBlockRef = useRef<HTMLDivElement>(null);

  const { onOpenReceive, receiveModalProps } = useCoreReceiveModalHelper(tokenGroupSlug);

  useNavigateOnChangeAccount('/home/tokens');

  const symbol = useMemo<string>(() => {
    if (tokenGroupSlug) {
      if (multiChainAssetMap[tokenGroupSlug]) {
        return multiChainAssetMap[tokenGroupSlug].symbol;
      }

      if (assetRegistryMap[tokenGroupSlug]) {
        return assetRegistryMap[tokenGroupSlug].symbol;
      }
    }

    return '';
  }, [tokenGroupSlug, assetRegistryMap, multiChainAssetMap]);

  const priceId = useMemo<string | undefined>(() => {
    if (!tokenGroupSlug) {
      return;
    }

    if (assetRegistryMap[tokenGroupSlug]) {
      return _getAssetPriceId(assetRegistryMap[tokenGroupSlug]);
    } else if (multiChainAssetMap[tokenGroupSlug]) {
      return _getMultiChainAssetPriceId(multiChainAssetMap[tokenGroupSlug]);
    }

    return undefined;
  }, [assetRegistryMap, multiChainAssetMap, tokenGroupSlug]);

  const buyInfos = useMemo(() => {
    const slug = tokenGroupSlug || '';
    const slugs = tokenGroupMap[slug] ? tokenGroupMap[slug] : [slug];
    const result: BuyTokenInfo[] = [];

    Object.values(tokens).forEach((item) => {
      if (!allowedChains.includes(item.network) || !slugs.includes(item.slug)) {
        return;
      }

      result.push(item);
    });

    return result;
  }, [allowedChains, tokenGroupMap, tokenGroupSlug, tokens]);

  const tokenBalanceValue = useMemo<SwNumberProps['value']>(() => {
    if (tokenGroupSlug) {
      if (tokenGroupBalanceMap[tokenGroupSlug]) {
        return tokenGroupBalanceMap[tokenGroupSlug].total.convertedValue;
      }

      if (tokenBalanceMap[tokenGroupSlug]) {
        return tokenBalanceMap[tokenGroupSlug].total.convertedValue;
      }
    }

    return '0';
  }, [tokenGroupSlug, tokenBalanceMap, tokenGroupBalanceMap]);

  const tokenBalanceItems = useMemo<TokenBalanceItemType[]>(() => {
    if (tokenGroupSlug) {
      if (tokenGroupMap[tokenGroupSlug]) {
        const items: TokenBalanceItemType[] = [];

        tokenGroupMap[tokenGroupSlug].forEach((tokenSlug) => {
          if (tokenBalanceMap[tokenSlug]) {
            items.push(tokenBalanceMap[tokenSlug]);
          }
        });

        sortTokensByStandard(items, priorityTokens);

        return items;
      }

      if (tokenBalanceMap[tokenGroupSlug]) {
        return [tokenBalanceMap[tokenGroupSlug]];
      }
    }

    return [] as TokenBalanceItemType[];
  }, [tokenGroupSlug, tokenGroupMap, tokenBalanceMap, priorityTokens]);

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

  const isReadonlyAccount = useMemo(() => {
    return currentAccountProxy && currentAccountProxy.accountType === AccountProxyType.READ_ONLY;
  }, [currentAccountProxy]);

  const isIncludesTonToken = useMemo(() => {
    return !!TON_CHAINS.length && tokenBalanceItems.some((item) => item.chain && TON_CHAINS.includes(item.chain));
  }, [tokenBalanceItems]);

  const [currentTokenInfo, setCurrentTokenInfo] = useState<CurrentSelectToken| undefined>(undefined);
  const [isShrink, setIsShrink] = useState<boolean>(false);

  const upperBlockHeight = priceId ? 486 : 272;

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    const topPosition = event.currentTarget.scrollTop;

    if (topPosition > upperBlockHeight) {
      setIsShrink((value) => {
        if (!value && topBlockRef.current && containerRef.current) {
          const containerProps = containerRef.current.getBoundingClientRect();

          topBlockRef.current.style.position = 'fixed';
          topBlockRef.current.style.opacity = '0';
          topBlockRef.current.style.paddingTop = '0';
          topBlockRef.current.style.top = `${Math.floor(containerProps.top)}px`;
          topBlockRef.current.style.left = `${containerProps.left}px`;
          topBlockRef.current.style.right = `${containerProps.right}px`;
          topBlockRef.current.style.width = `${containerProps.width}px`;

          setTimeout(() => {
            if (topBlockRef.current) {
              topBlockRef.current.style.paddingTop = '8px';
              topBlockRef.current.style.opacity = '1';
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

          setTimeout(() => {
            if (topBlockRef.current) {
              topBlockRef.current.style.opacity = '1';
            }
          }, 100);
        }

        return false;
      });
    }
  }, [upperBlockHeight]);

  const handleResize = useCallback(() => {
    const topPosition = containerRef.current?.scrollTop || 0;

    if (topPosition > upperBlockHeight) {
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
  }, [upperBlockHeight]);

  const onCloseDetail = useCallback(() => {
    setCurrentTokenInfo(undefined);
  }, []);

  const onClickItem = useCallback((item: TokenBalanceItemType) => {
    return () => {
      if (item.isReady) {
        setCurrentTokenInfo({
          slug: item.slug,
          symbol: item.symbol
        });
      }
    };
  }, []);

  const onOpenSendFund = useCallback(() => {
    if (!currentAccountProxy) {
      return;
    }

    if (currentAccountProxy.accountType === AccountProxyType.READ_ONLY) {
      notify({
        message: t('ui.Tokens.DetailList.accountIsWatchOnlyCannotSend'),
        type: 'info',
        duration: 3
      });

      return;
    }

    setStorage({
      ...DEFAULT_TRANSFER_PARAMS,
      fromAccountProxy: getTransactionFromAccountProxyValue(currentAccountProxy),
      defaultSlug: tokenGroupSlug || ''
    });

    navigate('/transaction/send-fund');
  },
  [currentAccountProxy, navigate, notify, setStorage, t, tokenGroupSlug]
  );

  const onOpenBuyTokens = useCallback(() => {
    let symbol = '';

    if (buyInfos.length) {
      if (buyInfos.length === 1) {
        symbol = buyInfos[0].slug;
      } else {
        symbol = buyInfos[0].symbol;
      }
    }

    navigate('/buy-tokens', { state: { symbol } });
  },
  [buyInfos, navigate]
  );

  const onOpenSwap = useCallback(() => {
    if (!currentAccountProxy) {
      return;
    }

    if (currentAccountProxy.accountType === AccountProxyType.READ_ONLY) {
      notify({
        message: t('ui.Tokens.DetailList.accountIsWatchOnlyCannotSend'),
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
      fromAccountProxy: getTransactionFromAccountProxyValue(currentAccountProxy),
      defaultSlug: tokenGroupSlug || ''
    });
    navigate('/transaction/swap');
  }, [accountProxies, currentAccountProxy, navigate, notify, setSwapStorage, t, tokenGroupSlug]);

  const onCloseAccountSelector = useCallback(() => {
    setIsShowTonWarning(false);
    inactiveModal(tonAccountSelectorModalId);
  }, [inactiveModal, setIsShowTonWarning]);

  const onSelectAccountSelector = useCallback((item: AccountAddressItemType) => {
    setCurrentTonAddress(item.address);
    activeModal(tonWalletContractSelectorModalId);
  }, [activeModal]);

  useEffect(() => {
    let sync = true;

    setIsLoading(true);

    if (priceId) {
      canShowChart(priceId).then((result) => {
        if (sync) {
          setIsChartSupported(result);
          setIsLoading(false);
        }
      }).catch(() => {
        if (sync) {
          setIsChartSupported(false);
          setIsLoading(false);
        }
      });
    } else {
      setIsChartSupported(false);
      setIsLoading(false);
    }

    return () => {
      sync = false;
    };
  }, [priceId]);

  useEffect(() => {
    if (currentTokenInfo) {
      activeModal(TokenDetailModalId);
    } else {
      inactiveModal(TokenDetailModalId);
    }
  }, [activeModal, currentTokenInfo, inactiveModal]);

  useEffect(() => {
    setIsShrink(false);
  }, [tokenGroupSlug]);

  // This useEffect triggers when the wallet version changes, causing tokenBalanceItems to temporarily be empty

  // useEffect(() => {
  //   if (!tokenBalanceItems.length) {
  //     goHome();
  //   }
  // }, [goHome, tokenBalanceItems.length]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const onBackTonWalletContactModal = useCallback(() => {
    inactiveModal(tonWalletContractSelectorModalId);
  }, [inactiveModal]);

  const onCloseTonWalletContactModal = useCallback(() => {
    setIsShowTonWarning(false);
    inactiveModal(tonAccountSelectorModalId);
    inactiveModal(tonWalletContractSelectorModalId);
  }, [inactiveModal, setIsShowTonWarning]);

  const onOpenTonWalletContactModal = useCallback(() => {
    if (isAllAccount) {
      activeModal(tonAccountSelectorModalId);
    } else {
      setCurrentTonAddress(tonAddress);
      activeModal(tonWalletContractSelectorModalId);
    }
  }, [activeModal, isAllAccount, tonAddress]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div
      className={classNames('token-detail-container', {
        '-no-chart': !isChartSupported
      })}
      onScroll={handleScroll}
      ref={containerRef}
    >
      <div className={'__upper-block-placeholder'}></div>

      <div
        className={classNames('__upper-block-wrapper', {
          '-is-shrink': isShrink
        })}
        ref={topBlockRef}
      >
        <DetailUpperBlock
          balanceValue={tokenBalanceValue}
          className={'__static-block'}
          isChartSupported={isChartSupported}
          isShrink={isShrink}
          isSupportBuyTokens={!!buyInfos.length}
          isSupportSwap={true}
          onClickBack={goHome}
          onOpenBuyTokens={onOpenBuyTokens}
          onOpenReceive={onOpenReceive}
          onOpenSendFund={onOpenSendFund}
          onOpenSwap={onOpenSwap}
          priceId={priceId}
          symbol={symbol}
        />
      </div>
      <div
        className={'__scroll-container'}
      >
        {!!banners.length && (
          <div className={'token-detail-banner-wrapper'}>
            <BannerGenerator
              banners={banners}
              dismissBanner={dismissBanner}
              onClickBanner={onClickBanner}
            />
          </div>
        )}

        {
          tokenBalanceItems.map((item) => (
            <TokenBalanceDetailItem
              key={item.slug}
              {...item}
              onClick={onClickItem(item)}
            />
          ))
        }
        {
          !isHaveOnlyTonSoloAcc && !isReadonlyAccount && isIncludesTonToken && isShowTonWarning && (
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
                  i18nKey={detectTranslate('ui.Tokens.DetailList.tonWalletVersionInfo')}
                />}
                title={t('ui.Tokens.DetailList.changeWalletAddressAndVersion')}
                type={'warning'}
              />
              {!!filteredAccountList.length && (
                <AccountSelectorModal
                  items={filteredAccountList}
                  modalId={tonAccountSelectorModalId}
                  onCancel={onCloseAccountSelector}
                  onSelectItem={onSelectAccountSelector}
                />
              )}
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
      </div>
      <DetailModal
        currentTokenInfo={currentTokenInfo}
        id={TokenDetailModalId}
        onCancel={onCloseDetail}
        tokenBalanceMap={tokenBalanceMap}
      />

      <ReceiveModal
        {...receiveModalProps}
      />
    </div>
  );
}

const Tokens = styled(WrapperComponent)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return ({
    overflow: 'hidden',

    '.token-detail-container': {
      height: '100%',
      overflow: 'auto',
      color: token.colorTextLight1,
      fontSize: token.fontSizeLG,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },

    '.__upper-block-placeholder': {
      paddingTop: 486
    },

    '.__upper-block-wrapper': {
      position: 'absolute',
      backgroundColor: token.colorBgDefault,
      zIndex: 10,
      height: 486,
      paddingTop: 8,
      top: 0,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      transition: 'opacity, height 0.2s ease',

      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 180,
        backgroundImage: extendToken.tokensScreenInfoBackgroundColor,
        display: 'block',
        zIndex: 1
      }
    },

    '.token-detail-container.-no-chart': {
      '.__upper-block-placeholder': {
        paddingTop: 272
      },

      '.__upper-block-wrapper': {
        height: 272
      }
    },

    '.__upper-block-wrapper.__upper-block-wrapper.-is-shrink': {
      height: 128,

      '&:before': {
        height: 80
      }
    },

    '.__scroll-container': {
      flex: 1,
      paddingLeft: token.size,
      paddingRight: token.size
    },

    '.tokens-upper-block': {
      flex: 1,
      position: 'relative',
      zIndex: 5
    },

    '.__scrolling-block': {
      display: 'none'
    },

    '.token-balance-detail-item, .token-detail-banner-wrapper, .ton-solo-acc-alert-area': {
      marginBottom: token.sizeXS
    }
  });
});

export default Tokens;
