// Copyright 2019-2022 @polkadot/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Resolver } from '@subwallet/extension-base/background/types';
import { _getOriginChainOfAsset, _isChainCompatibleLedgerEvm } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountChainType, AccountProxy, AccountProxyType, AccountSignMode, BuyServiceInfo, BuyTokenInfo, SupportService } from '@subwallet/extension-base/types';
import { detectTranslate, isAccountAll, isSubstrateEcdsaLedgerAssetSupported } from '@subwallet/extension-base/utils';
import { AccountAddressSelector, BaseModal, baseServiceItems, Layout, PageWrapper, ServiceItem } from '@subwallet/extension-web-ui/components';
import { ServiceSelector } from '@subwallet/extension-web-ui/components/Field/BuyTokens/ServiceSelector';
import { TokenSelector } from '@subwallet/extension-web-ui/components/Field/TokenSelector';
import { SELL_TOKEN_TAB } from '@subwallet/extension-web-ui/constants';
import { useAssetChecker, useCoreCreateReformatAddress, useDefaultNavigate, useGetAccountTokenBalance, useGetChainAndExcludedTokenByCurrentAccountProxy, useNotification, useTranslation } from '@subwallet/extension-web-ui/hooks';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { AccountAddressItemType, CreateBuyOrderFunction, ThemeProps, TokenSelectorItemType } from '@subwallet/extension-web-ui/types';
import { BuyTokensParam } from '@subwallet/extension-web-ui/types/navigation';
import { createBanxaOrder, createCoinbaseOrder, createMeldOrder, createTransakOrder, getSignModeByAccountProxy, noop, openInNewTab, SortableTokenItem, sortTokensByBalanceInSelector } from '@subwallet/extension-web-ui/utils';
import reformatAddress from '@subwallet/extension-web-ui/utils/account/reformatAddress';
import { Button, Form, Icon, ModalContext, SwSubHeader } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, ShoppingCartSimple, Tag, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type SharedProps = {
  modalContent?: boolean;
  slug?: string;
  className?: string;
};

type WrapperProps = ThemeProps & SharedProps;

type Props = SharedProps & {
  currentAccountProxy: AccountProxy;
};

type BuyTokensFormProps = {
  address: string;
  tokenSlug: string;
  service: SupportService;
}

interface LinkUrlProps {
  url: string;
  content: string;
}

type SortableTokenSelectorItemType = TokenSelectorItemType & SortableTokenItem;

const LinkUrl: React.FC<LinkUrlProps> = (props: LinkUrlProps) => {
  if (props.url) {
    return (
      <a
        href={props.url}
        target='_blank'
        rel="noopener noreferrer"
      >
        {props.content}
      </a>
    );
  } else {
    return <span>{props.content}</span>;
  }
};

const modalId = 'disclaimer-modal';

function Component ({ className, currentAccountProxy, modalContent, slug }: Props) {
  const locationState = useLocation().state as BuyTokensParam;
  const [_currentSymbol] = useState<string | undefined>(locationState?.symbol);
  const [buyTokenTab, setBuyTokenModalTab] = useLocalStorage(SELL_TOKEN_TAB, '');

  const [buyForm, setBuyForm] = useState(buyTokenTab !== 'SELL');

  const currentSymbol = slug || _currentSymbol;

  const notify = useNotification();

  const { activeModal, inactiveModal } = useContext(ModalContext);

  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);

  const { chainInfoMap, chainStateMap, priorityTokens } = useSelector((root: RootState) => root.chainStore);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { walletReference } = useSelector((state: RootState) => state.settings);
  const { services, tokens } = useSelector((state: RootState) => state.buyService);

  const getAccountTokenBalance = useGetAccountTokenBalance();

  const checkAsset = useAssetChecker();
  const { allowedChains, excludedTokens } = useGetChainAndExcludedTokenByCurrentAccountProxy();
  const getReformatAddress = useCoreCreateReformatAddress();

  const fixedTokenSlug = useMemo((): string | undefined => {
    if (currentSymbol) {
      return Object.values(tokens).filter((value) => value.slug === currentSymbol || value.symbol === currentSymbol)[0]?.slug;
    } else {
      return undefined;
    }
  }, [currentSymbol, tokens]);

  const { t } = useTranslation();
  const { goHome } = useDefaultNavigate();
  const [form] = Form.useForm<BuyTokensFormProps>();
  const formDefault = useMemo((): BuyTokensFormProps => ({
    address: '',
    tokenSlug: fixedTokenSlug || '',
    service: '' as SupportService
  }), [fixedTokenSlug]);

  const promiseRef = useRef<Resolver<void>>({ resolve: noop, reject: noop });

  const [loading, setLoading] = useState(false);
  const [disclaimerAgree, setDisclaimerAgree] = useState<Record<SupportService, boolean>>({
    transak: false,
    banxa: false,
    onramper: false,
    moonpay: false,
    coinbase: false,
    meld: false
  });

  const selectedAddress = Form.useWatch('address', form);
  const selectedTokenSlug = Form.useWatch('tokenSlug', form);
  const selectedService = Form.useWatch('service', form);

  const { contactUrl, name: serviceName, policyUrl, termUrl, url } = useMemo((): BuyServiceInfo => {
    return services[selectedService] || { name: '', url: '', contactUrl: '', policyUrl: '', termUrl: '' };
  }, [selectedService, services]);
  const getServiceItems = useCallback((tokenSlug: string): ServiceItem[] => {
    const buyInfo = tokens[tokenSlug];
    const result: ServiceItem[] = [];

    for (const serviceItem of baseServiceItems) {
      const temp: ServiceItem = {
        ...serviceItem,
        disabled: buyInfo
          ? !buyInfo.services.includes(serviceItem.key) || (!buyForm && !buyInfo.serviceInfo[serviceItem.key]?.supportSell)
          : true
      };

      result.push(temp);
    }

    return result;
  }, [tokens, buyForm]);

  const onConfirm = useCallback((): Promise<void> => {
    activeModal(modalId);

    return new Promise((resolve, reject) => {
      promiseRef.current = {
        resolve: () => {
          inactiveModal(modalId);
          resolve();
        },
        reject: (e) => {
          inactiveModal(modalId);
          reject(e);
        }
      };
    });
  }, [activeModal, inactiveModal]);

  const onApprove = useCallback(() => {
    promiseRef.current.resolve();
  }, []);

  const onReject = useCallback(() => {
    promiseRef.current.reject(new Error('User reject'));
  }, []);

  const tokenBalanceMap = useMemo(() => {
    return getAccountTokenBalance(Object.keys(tokens), currentAccountProxy.id);
  }, [currentAccountProxy.id, getAccountTokenBalance, tokens]);

  const buyTokenItems = useMemo<SortableTokenSelectorItemType[]>(() => {
    const result: SortableTokenSelectorItemType[] = [];

    const convertToItem = (info: BuyTokenInfo): SortableTokenSelectorItemType => {
      const tokenBalanceInfo = tokenBalanceMap[info.slug];
      const balanceInfo = tokenBalanceInfo && chainStateMap[info.network]?.active
        ? {
          isReady: tokenBalanceInfo.isReady,
          isNotSupport: tokenBalanceInfo.isNotSupport,
          free: tokenBalanceInfo.free,
          locked: tokenBalanceInfo.locked,
          total: tokenBalanceInfo.total,
          currency: tokenBalanceInfo.currency,
          isTestnet: tokenBalanceInfo.isTestnet
        }
        : undefined;

      return {
        name: assetRegistry[info.slug]?.name || info.symbol,
        slug: info.slug,
        symbol: info.symbol,
        originChain: info.network,
        balanceInfo,
        isTestnet: !!balanceInfo?.isTestnet,
        total: balanceInfo?.isReady && !balanceInfo?.isNotSupport ? balanceInfo?.free : undefined
      };
    };

    Object.values(tokens).forEach((item) => {
      if (!allowedChains.includes(item.network)) {
        return;
      }

      if (excludedTokens.includes(item.slug)) {
        return;
      }

      if (!currentSymbol || (item.slug === currentSymbol || item.symbol === currentSymbol)) {
        result.push(convertToItem(item));
      }
    });

    sortTokensByBalanceInSelector(result, priorityTokens);

    return result;
  }, [allowedChains, assetRegistry, chainStateMap, currentSymbol, excludedTokens, priorityTokens, tokenBalanceMap, tokens]);

  const sellTokenItems = useMemo<SortableTokenSelectorItemType[]>(() => {
    const result: SortableTokenSelectorItemType[] = [];

    const convertToItem = (info: BuyTokenInfo): SortableTokenSelectorItemType => {
      const tokenBalanceInfo = tokenBalanceMap[info.slug];
      const balanceInfo = tokenBalanceInfo && chainStateMap[info.network]?.active
        ? {
          isReady: tokenBalanceInfo.isReady,
          isNotSupport: tokenBalanceInfo.isNotSupport,
          free: tokenBalanceInfo.free,
          locked: tokenBalanceInfo.locked,
          total: tokenBalanceInfo.total,
          currency: tokenBalanceInfo.currency,
          isTestnet: tokenBalanceInfo.isTestnet
        }
        : undefined;

      return {
        name: assetRegistry[info.slug]?.name || info.symbol,
        slug: info.slug,
        symbol: info.symbol,
        originChain: info.network,
        balanceInfo,
        isTestnet: !!balanceInfo?.isTestnet,
        total: balanceInfo?.isReady && !balanceInfo?.isNotSupport ? balanceInfo?.free : undefined
      };
    };

    const sellList = [...Object.values(tokens)].filter((token) => token.supportSell);

    const filtered = currentSymbol
      ? sellList.filter((value) => value.slug === currentSymbol || value.symbol === currentSymbol)
      : sellList;

    Object.values(filtered).forEach((item) => {
      if (!allowedChains.includes(item.network)) {
        return;
      }

      result.push(convertToItem(item));
    });

    sortTokensByBalanceInSelector(result, priorityTokens);

    return result;
  }, [allowedChains, assetRegistry, chainStateMap, currentSymbol, priorityTokens, tokenBalanceMap, tokens]);

  const tokenItems = buyForm ? buyTokenItems : sellTokenItems;

  const serviceItems = useMemo(() => getServiceItems(selectedTokenSlug), [getServiceItems, selectedTokenSlug]);

  const isSellTabDisabled = useMemo(() => {
    if (sellTokenItems.length > 1) {
      return false;
    }

    const tokenInfo = sellTokenItems[0]?.slug ? tokens[sellTokenItems[0].slug] : undefined;

    for (const serviceItem of baseServiceItems) {
      if (tokenInfo?.serviceInfo[serviceItem.key]?.supportSell) {
        return false;
      }
    }

    return true;
  }, [sellTokenItems, tokens]);

  const handleForm = useCallback((mode: string) => {
    setBuyForm(mode === 'BUY');
  }, []);

  const handleBuyForm = useCallback(() => handleForm('BUY'), [handleForm]);
  const handleSellForm = useCallback(() => {
    if (isSellTabDisabled) {
      return;
    }

    handleForm('SELL');
  }, [handleForm, isSellTabDisabled]);

  const accountAddressItems = useMemo(() => {
    const chainSlug = selectedTokenSlug ? _getOriginChainOfAsset(selectedTokenSlug) : undefined;
    const chainInfo = chainSlug ? chainInfoMap[chainSlug] : undefined;
    const tokenInfo = selectedTokenSlug ? assetRegistry[selectedTokenSlug] : undefined;

    if (!chainInfo || !tokenInfo) {
      return [];
    }

    const isIgnoreSubstrateEcdsaLedger = !isSubstrateEcdsaLedgerAssetSupported(tokenInfo, chainInfo);
    const isIgnoreEvmLedger = !_isChainCompatibleLedgerEvm(chainInfo);

    const result: AccountAddressItemType[] = [];

    const updateResult = (ap: AccountProxy) => {
      ap.accounts.forEach((a) => {
        const address = getReformatAddress(a, chainInfo);

        if (address) {
          result.push({
            accountName: ap.name,
            accountProxyId: ap.id,
            accountProxyType: ap.accountType,
            accountType: a.type,
            address
          });
        }
      });
    };

    if (isAccountAll(currentAccountProxy.id)) {
      accountProxies.forEach((ap) => {
        if (isAccountAll(ap.id)) {
          return;
        }

        const signMode = getSignModeByAccountProxy(ap);

        if (signMode === AccountSignMode.ECDSA_SUBSTRATE_LEDGER && isIgnoreSubstrateEcdsaLedger) {
          return;
        }

        if (signMode === AccountSignMode.GENERIC_LEDGER) {
          if (ap.chainTypes.includes(AccountChainType.ETHEREUM) && isIgnoreEvmLedger) {
            return;
          }
        }

        updateResult(ap);
      });
    } else {
      updateResult(currentAccountProxy);
    }

    return result;
  }, [accountProxies, assetRegistry, chainInfoMap, currentAccountProxy, getReformatAddress, selectedTokenSlug]);

  const isSupportBuyTokens = useMemo(() => {
    if (selectedService && selectedAddress && selectedTokenSlug) {
      const buyInfo = tokens[selectedTokenSlug];

      return buyInfo && buyInfo.services.includes(selectedService) && tokenItems.find((item) => item.slug === selectedTokenSlug);
    }

    return false;
  }, [selectedService, selectedAddress, selectedTokenSlug, tokens, tokenItems]);

  const onClickNext = useCallback((action: 'BUY' | 'SELL') => {
    if (action === 'SELL') {
      if (currentAccountProxy && currentAccountProxy.accountType === AccountProxyType.READ_ONLY) {
        notify({
          message: t('Feature not available for watch-only account'),
          type: 'info',
          duration: 3
        });

        setLoading(false);

        return;
      }
    }

    setLoading(true);

    const { address, service, tokenSlug } = form.getFieldsValue();

    let urlPromise: CreateBuyOrderFunction | undefined;

    const buyInfo = tokens[tokenSlug];
    const { network } = buyInfo;

    const serviceInfo = buyInfo.serviceInfo[service];
    const networkPrefix = chainInfoMap[network].substrateInfo?.addressPrefix;

    const walletAddress = reformatAddress(address, networkPrefix === undefined ? -1 : networkPrefix);

    switch (service) {
      case 'transak':
        urlPromise = createTransakOrder;
        break;
      case 'banxa':
        urlPromise = createBanxaOrder;
        break;
      case 'coinbase':
        urlPromise = createCoinbaseOrder;
        break;
      case 'meld':
        urlPromise = createMeldOrder;
        break;
    }

    if (urlPromise && serviceInfo && buyInfo.services.includes(service)) {
      const { network: serviceNetwork, symbol } = serviceInfo;
      const slug = buyInfo.slug;
      const disclaimerPromise = new Promise<void>((resolve, reject) => {
        if (!disclaimerAgree[service]) {
          onConfirm().then(() => {
            setDisclaimerAgree((oldState) => ({ ...oldState, [service]: true }));
            resolve();
          }).catch((e) => {
            reject(e);
          });
        } else {
          resolve();
        }
      });

      disclaimerPromise.then(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return urlPromise!({ symbol, address: walletAddress, network: serviceNetwork, slug, walletReference, action });
      })
        .then((url) => {
          openInNewTab(url)();
        })
        .catch((e: Error) => {
          if (e.message !== 'User reject') {
            console.error(e);

            notify({
              message: t('Unable to redirect you to the selected supplier at the moment. Try again later'),
              type: 'error',
            });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [form, tokens, chainInfoMap, currentAccountProxy, notify, t, disclaimerAgree, onConfirm, walletReference]);

  useEffect(() => {
    if (!fixedTokenSlug && tokenItems.length) {
      const { tokenSlug } = form.getFieldsValue();

      if (!tokenSlug) {
        form.setFieldsValue({ tokenSlug: tokenItems[0].slug });
      } else {
        const isSelectedTokenInList = tokenItems.some((i) => i.slug === tokenSlug);

        if (!isSelectedTokenInList) {
          form.setFieldsValue({ tokenSlug: tokenItems[0].slug });
        }
      }
    } else if (fixedTokenSlug) {
      setTimeout(() => {
        form.setFieldsValue({ tokenSlug: fixedTokenSlug });
      }, 100);
    }
  }, [tokenItems, fixedTokenSlug, form]);

  useEffect(() => {
    selectedTokenSlug && checkAsset(selectedTokenSlug);
  }, [checkAsset, selectedTokenSlug]);

  useEffect(() => {
    const updateFromValue = () => {
      if (!accountAddressItems.length) {
        return;
      }

      if (accountAddressItems.length === 1) {
        if (!selectedAddress || accountAddressItems[0].address !== selectedAddress) {
          form.setFieldValue('address', accountAddressItems[0].address);
        }
      } else {
        if (selectedAddress && !accountAddressItems.some((i) => i.address === selectedAddress)) {
          form.setFieldValue('address', '');
        }
      }
    };

    updateFromValue();
  }, [accountAddressItems, form, selectedAddress]);

  useEffect(() => {
    if (selectedTokenSlug) {
      const services = getServiceItems(selectedTokenSlug);
      const filtered = services.filter((service) => !service.disabled);

      if (filtered.length > 1) {
        form.setFieldValue('service', '');
      } else {
        form.setFieldValue('service', filtered[0]?.key || '');
      }
    }
  }, [selectedTokenSlug, form, getServiceItems]);

  useEffect(() => {
    setBuyTokenModalTab('');
  }, [setBuyTokenModalTab]);

  return (
    <PageWrapper className={CN(className, 'transaction-wrapper', {
      '__web-wrapper': modalContent
    })}
    >
      {!modalContent && (
        <SwSubHeader
          background={'transparent'}
          center
          className={'transaction-header'}
          onBack={goHome}
          paddingVertical
          showBackButton
          title={t('Buy & sell tokens')}
        />
      )}
      <div className={'__scroll-container'}>
        <div className='form-row __service-container'>
          <div style={{
            position: 'absolute',
            top: '0.25rem',
            left: buyForm ? '0.25rem' : 'calc(50% + 0.25rem)',
            width: 'calc(50% - 0.5rem)',
            height: 'calc(100% - 0.5rem)',
            backgroundColor: '#252525',
            borderRadius: '0.5rem',
            transition: 'left 0.3s ease-in-out'
          }}
          ></div>

          <div
            className='__service-selector'
            onClick={handleBuyForm}
          >
              Buy
          </div>
          <div
            className={CN('__service-selector', {
              '-disabled': isSellTabDisabled
            })}
            onClick={handleSellForm}
          >
              Sell
          </div>
        </div>
        <div className='__buy-icon-wrapper'>
          <Icon
            className={'__buy-icon'}
            phosphorIcon={buyForm ? ShoppingCartSimple : Tag}
            weight={'fill'}
          />
        </div>

        <Form
          className='__form-container form-space-sm'
          form={form}
          initialValues={formDefault}
        >
          <div className='form-row'>
            <Form.Item name={'tokenSlug'}>
              <TokenSelector
                disabled={tokenItems.length < 2}
                items={tokenItems}
                showChainInSelected={false}
              />
            </Form.Item>

            <Form.Item name={'service'}>
              <ServiceSelector
                disabled={!selectedTokenSlug}
                items={serviceItems}
                placeholder={t('Select supplier')}
                title={t('Select supplier')}
              />
            </Form.Item>
          </div>

          <Form.Item
            // className={CN({
            //   hidden: !isAllAccount && accountAddressItems.length <= 1
            // })}
            name={'address'}
          >
            <AccountAddressSelector
              items={accountAddressItems}
              label={`${t('To')}:`}
              labelStyle={'horizontal'}
            />
          </Form.Item>
        </Form>

        <div className={'common-text __note'}>
          {t('You will be directed to the chosen supplier to complete this transaction')}
        </div>
      </div>

      <div className={'__layout-footer'}>
        <Button
          disabled={!isSupportBuyTokens}
          icon={(
            <Icon
              phosphorIcon={buyForm ? ShoppingCartSimple : Tag}
              weight={'fill'}
            />
          )}
          loading={loading}
          // eslint-disable-next-line react/jsx-no-bind
          onClick={() => onClickNext(buyForm ? 'BUY' : 'SELL')}
        >
          {buyForm ? t('Buy now') : t('Sell now')}
        </Button>
      </div>
      <BaseModal
        center={true}
        className={CN(className)}
        footer={(
          <>
            <Button
              block={true}
              icon={(
                <Icon
                  phosphorIcon={XCircle}
                  weight='fill'
                />
              )}
              onClick={onReject}
              schema={'secondary'}
            >
              {t('Cancel')}
            </Button>
            <Button
              block={true}
              icon={(
                <Icon
                  phosphorIcon={CheckCircle}
                  weight='fill'
                />
              )}
              onClick={onApprove}
            >
              {t('Agree')}
            </Button>
          </>
        )}
        id={modalId}
        onCancel={onReject}
        title={t('Disclaimer')}
      >
        <Trans
          components={{
            mainUrl: (
              <LinkUrl
                content={serviceName}
                url={url}
              />
            ),
            termUrl: (
              <LinkUrl
                content={t('Terms of Service')}
                url={termUrl}
              />
            ),
            policyUrl: (
              <LinkUrl
                content={t('Privacy Policy')}
                url={policyUrl}
              />
            ),
            contactUrl: (
              <LinkUrl
                content={t('support site')}
                url={contactUrl}
              />
            )
          }}
          i18nKey={detectTranslate('You are now leaving SubWallet for <mainUrl/>. Services related to card payments are provided by {{service}}, a separate third-party platform. By proceeding and procuring services from {{service}}, you acknowledge that you have read and agreed to {{service}}\'s <termUrl/> and <policyUrl/>. For any question related to {{service}}\'s services, please visit {{service}}\'s <contactUrl/>.')}
          values={{
            service: serviceName
          }}
        />
        <br />
        <Trans
          i18nKey={detectTranslate('Note that some tokens may not be available for {{action}} depending on your region. Review your chosen token & region before proceeding with the transaction via {{service}}')}
          values={{
            service: serviceName,
            action: t('buying')
          }}
        />
      </BaseModal>
    </PageWrapper>
  );
}

const Wrapper: React.FC<WrapperProps> = (props: WrapperProps) => {
  const { modalContent } = props;
  const { goHome } = useDefaultNavigate();
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);

  useEffect(() => {
    if (!currentAccountProxy) {
      goHome();
    }
  }, [goHome, currentAccountProxy]);

  if (!currentAccountProxy) {
    return (
      <></>
    );
  }

  if (modalContent) {
    return (
      <Component
        {...props}
        currentAccountProxy={currentAccountProxy}
        modalContent={true}
      />
    );
  }

  return (
    <Layout.Home
      showFilterIcon
      showTabBar={false}
    >
      <Component
        {...props}
        currentAccountProxy={currentAccountProxy}
      />
    </Layout.Home>
  );
};

const BuyTokens = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return ({
    display: 'flex',
    flexDirection: 'column',

    '&.__web-wrapper': {
      '.__scroll-container': {
        padding: 0
      },
      '.__layout-footer': {
        padding: 0,
        margin: 0,

        '.ant-btn': {
          width: '100%',
          margin: '16px 0 0'
        }
      }
    },

    '.ant-sw-modal-footer': {
      display: 'flex'
    },

    '.ant-sw-modal-body': {
      color: token.colorTextSecondary
    },

    '.__scroll-container': {
      flex: 1,
      overflow: 'auto',
      paddingLeft: token.padding,
      paddingRight: token.padding
    },

    '.__service-container': {
      backgroundColor: token.colorBgSecondary,
      borderRadius: '0.5rem',
      padding: '0.25rem',
      height: '2.5rem',
      position: 'relative',
      display: 'flex',
      overflow: 'hidden'
    },

    '.__service-selector': {
      cursor: 'pointer',
      width: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      zIndex: 1
    },

    '.__service-selector.-disabled': {
      cursor: 'not-allowed'
    },

    '.__buy-icon-wrapper': {
      position: 'relative',
      width: 112,
      height: 112,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: token.margin,
      marginBottom: token.marginLG,

      '&:before': {
        content: '""',
        backgroundColor: token.colorSuccess,
        inset: 0,
        position: 'absolute',
        display: 'block',
        borderRadius: '100%',
        opacity: '0.1'
      }
    },

    '.__buy-icon': {
      fontSize: 64,
      color: token.colorSuccess
    },

    '.__note': {
      paddingTop: token.paddingXXS,
      paddingBottom: token.padding,
      color: token.colorTextLight5,
      textAlign: 'center'
    },

    '.__layout-footer': {
      display: 'flex',
      padding: token.paddingMD,
      paddingBottom: token.paddingLG,
      gap: token.paddingXS,

      '.ant-btn': {
        flex: 1
      },

      '.full-width': {
        minWidth: '100%'
      }
    }
  });
});

export default BuyTokens;
