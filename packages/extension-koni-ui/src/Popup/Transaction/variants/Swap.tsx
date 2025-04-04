// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { ExtrinsicType, NotificationType, TokenPriorityDetails } from '@subwallet/extension-base/background/KoniTypes';
import { validateRecipientAddress } from '@subwallet/extension-base/core/logic-validation/recipientAddress';
import { ActionType } from '@subwallet/extension-base/core/types';
import { _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { _getAssetDecimals, _getAssetOriginChain, _getAssetSymbol, _getChainNativeTokenSlug, _getMultiChainAsset, _getOriginChainOfAsset, _isChainEvmCompatible, _parseAssetRefKey } from '@subwallet/extension-base/services/chain-service/utils';
import { getSwapAlternativeAsset } from '@subwallet/extension-base/services/swap-service/utils';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { AccountProxy, AccountProxyType, OptimalSwapPathParamsV2, ProcessType, SwapStepType } from '@subwallet/extension-base/types';
import { CommonFeeComponent, CommonOptimalSwapPath, CommonStepType } from '@subwallet/extension-base/types/service-base';
import { CHAINFLIP_SLIPPAGE, SIMPLE_SWAP_SLIPPAGE, SlippageType, SwapFeeType, SwapProviderId, SwapQuote, SwapRequest } from '@subwallet/extension-base/types/swap';
import { formatNumberString, isSameAddress, swapCustomFormatter } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
import { AccountAddressSelector, AddressInputNew, AlertBox, HiddenInput, MetaInfo, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { SwapFromField, SwapToField } from '@subwallet/extension-koni-ui/components/Field/Swap';
import { AddMoreBalanceModal, ChooseFeeTokenModal, SlippageModal, SwapIdleWarningModal, SwapQuotesSelectorModal, SwapTermsOfServiceModal } from '@subwallet/extension-koni-ui/components/Modal/Swap';
import { QuoteResetTime, SwapRoute } from '@subwallet/extension-koni-ui/components/Swap';
import { ADDRESS_INPUT_AUTO_FORMAT_VALUE, BN_TEN, BN_ZERO, CONFIRM_SWAP_TERM, SWAP_ALL_QUOTES_MODAL, SWAP_CHOOSE_FEE_TOKEN_MODAL, SWAP_IDLE_WARNING_MODAL, SWAP_MORE_BALANCE_MODAL, SWAP_SLIPPAGE_MODAL, SWAP_TERMS_OF_SERVICE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useChainConnection, useDefaultNavigate, useGetAccountTokenBalance, useHandleSubmitMultiTransaction, useNotification, useOneSignProcess, usePreCheckAction, useReformatAddress, useSelector, useSetCurrentPage, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { submitProcess } from '@subwallet/extension-koni-ui/messaging';
import { getLatestSwapQuote, getOptimalProcessOnSelectQuote, handleSwapRequestV2, handleSwapStep, validateSwapProcess } from '@subwallet/extension-koni-ui/messaging/transaction/swap';
import { FreeBalance, FreeBalanceToEarn, TransactionContent, TransactionFooter } from '@subwallet/extension-koni-ui/Popup/Transaction/parts';
import { CommonActionType, commonProcessReducer, DEFAULT_COMMON_PROCESS } from '@subwallet/extension-koni-ui/reducer';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { AccountAddressItemType, FormCallbacks, FormFieldData, SwapParams, ThemeProps, TokenBalanceItemType } from '@subwallet/extension-koni-ui/types';
import { TokenSelectorItemType } from '@subwallet/extension-koni-ui/types/field';
import { convertFieldToObject, findAccountByAddress, getChainsByAccountAll, isAccountAll, isChainInfoAccordantAccountChainType, isTokenCompatibleWithAccountChainTypes, SortableTokenItem, sortTokenByPriority, sortTokenByValue } from '@subwallet/extension-koni-ui/utils';
import { ActivityIndicator, BackgroundIcon, Button, Form, Icon, Logo, ModalContext, Number, Tooltip } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { ArrowsDownUp, CaretDown, CaretRight, CaretUp, CheckCircle, Info, ListBullets, PencilSimpleLine, XCircle } from 'phosphor-react';
import { Rule } from 'rc-field-form/lib/interface';
import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIdleTimer } from 'react-idle-timer';
import styled, { useTheme } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { isEthereumAddress } from '@polkadot/util-crypto';

type WrapperProps = ThemeProps;

type ComponentProps = {
  targetAccountProxy: AccountProxy;
};

interface FeeItem {
  value: BigN,
  type: SwapFeeType,
  label: string,
  prefix?: string,
  suffix?: string
}

type SortableTokenSelectorItemType = TokenSelectorItemType & SortableTokenItem;

const hideFields: Array<keyof SwapParams> = ['fromAmount', 'fromTokenSlug', 'toTokenSlug', 'chain', 'fromAccountProxy'];

function getTokenSelectorItem (
  tokenSlugs: string[],
  assetRegistryMap: Record<string, _ChainAsset>,
  tokenBalanceMap: Record<string, TokenBalanceItemType | undefined>,
  chainState: Record<string, _ChainState>
): SortableTokenSelectorItemType[] {
  const result: SortableTokenSelectorItemType[] = [];

  tokenSlugs.forEach((slug) => {
    const asset = assetRegistryMap[slug];

    if (!asset) {
      return;
    }

    const originChain = asset.originChain;

    const balanceInfo = (() => {
      if (!chainState[originChain]?.active) {
        return undefined;
      }

      const tokenBalanceInfo = tokenBalanceMap[slug];

      if (!tokenBalanceInfo) {
        return undefined;
      }

      return {
        isReady: tokenBalanceInfo.isReady,
        isNotSupport: tokenBalanceInfo.isNotSupport,
        free: tokenBalanceInfo.free,
        locked: tokenBalanceInfo.locked,
        total: tokenBalanceInfo.total,
        currency: tokenBalanceInfo.currency
      };
    })();

    result.push({
      originChain,
      slug,
      symbol: asset.symbol,
      name: asset.name,
      balanceInfo,
      showBalance: true,
      total: balanceInfo?.isReady && !balanceInfo?.isNotSupport ? balanceInfo?.free : undefined
    });
  });

  return result;
}

function sortTokens (targetTokens: SortableTokenItem[], priorityTokenGroups: TokenPriorityDetails) {
  const priorityTokenKeys = Object.keys(priorityTokenGroups.token);

  targetTokens.sort((a, b) => {
    const getTokenGroupLevel = (token: SortableTokenItem): number => {
      if (token.total) {
        const value = token.total.value.toNumber();

        if (value > 0) {
          return 1;
        } // Group 1: Has total.value > 0

        return 2; // Group 2: Has total.value == 0
      }

      return 3; // Group 3: No total
    };

    const aLevel = getTokenGroupLevel(a);
    const bLevel = getTokenGroupLevel(b);

    // Different group levels → sort by group level
    if (aLevel !== bLevel) {
      return aLevel - bLevel;
    }

    // Same group
    if (aLevel === 1) {
      return sortTokenByValue(a, b); // Group 1: sort by value
    }

    // Group 2 or 3: sort by priority
    const aSlug = a.slug;
    const bSlug = b.slug;

    const aIsPrioritized = priorityTokenKeys.includes(aSlug);
    const bIsPrioritized = priorityTokenKeys.includes(bSlug);

    const aPriority = aIsPrioritized ? priorityTokenGroups.token[aSlug] : 0;
    const bPriority = bIsPrioritized ? priorityTokenGroups.token[bSlug] : 0;

    return sortTokenByPriority(
      a.symbol,
      b.symbol,
      aIsPrioritized,
      bIsPrioritized,
      aPriority,
      bPriority
    );
  });
}

const numberMetadata = { maxNumberFormat: 8 };

// todo: recheck validation logic, especially recipientAddress

const Component = ({ targetAccountProxy }: ComponentProps) => {
  useSetCurrentPage('/transaction/swap');
  const { t } = useTranslation();
  const notify = useNotification();
  const { closeAlert, defaultData, openAlert, persistData, setBackProps, setCustomScreenTitle } = useTransactionContext<SwapParams>();

  const { activeModal, inactiveAll, inactiveModal } = useContext(ModalContext);

  const { accountProxies, accounts, isAllAccount } = useSelector((state) => state.accountState);
  const assetRegistryMap = useSelector((state) => state.assetRegistry.assetRegistry);
  const swapPairs = useSelector((state) => state.swap.swapPairs);
  const { currencyData, priceMap } = useSelector((state) => state.price);
  const { chainInfoMap, chainStateMap, ledgerGenericAllowNetworks } = useSelector((root) => root.chainStore);
  const hasInternalConfirmations = useSelector((state: RootState) => state.requestState.hasInternalConfirmations);
  const priorityTokens = useSelector((root: RootState) => root.chainStore.priorityTokens);
  const [form] = Form.useForm<SwapParams>();
  const formDefault = useMemo((): SwapParams => ({ ...defaultData }), [defaultData]);

  const [quoteOptions, setQuoteOptions] = useState<SwapQuote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<SwapQuote | undefined>(undefined);
  const [swapQuotesSelectorModalRenderKey, setSwapQuotesSelectorModalRenderKey] = useState<string>(SWAP_ALL_QUOTES_MODAL);

  const [quoteAliveUntil, setQuoteAliveUntil] = useState<number | undefined>(undefined);
  const [currentQuoteRequest, setCurrentQuoteRequest] = useState<SwapRequest | undefined>(undefined);
  const [feeOptions, setFeeOptions] = useState<string[] | undefined>([]);
  const [currentFeeOption, setCurrentFeeOption] = useState<string | undefined>(undefined);
  const [currentSlippage, setCurrentSlippage] = useState<SlippageType>({ slippage: new BigN(0.01), isCustomType: true });
  const [swapError, setSwapError] = useState<SwapError|undefined>(undefined);
  const [isFormInvalid, setIsFormInvalid] = useState<boolean>(false);
  const [currentOptimalSwapPath, setOptimalSwapPath] = useState<CommonOptimalSwapPath | undefined>(undefined);

  const [confirmedTerm, setConfirmedTerm] = useLocalStorage(CONFIRM_SWAP_TERM, '');
  const [showQuoteArea, setShowQuoteArea] = useState<boolean>(false);
  const optimalQuoteRef = useRef<SwapQuote | undefined>(undefined);

  const [isViewFeeDetails, setIsViewFeeDetails] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [handleRequestLoading, setHandleRequestLoading] = useState(true);
  const [requestUserInteractToContinue, setRequestUserInteractToContinue] = useState<boolean>(false);
  const [isScrollEnd, setIsScrollEnd] = useState<boolean>(false);

  const continueRefreshQuoteRef = useRef<boolean>(false);
  const { token } = useTheme() as Theme;

  const [autoFormatValue] = useLocalStorage(ADDRESS_INPUT_AUTO_FORMAT_VALUE, false);

  const { defaultSlug } = defaultData;
  const onIdle = useCallback(() => {
    !hasInternalConfirmations && !!confirmedTerm && showQuoteArea && setRequestUserInteractToContinue(true);
  }, [confirmedTerm, hasInternalConfirmations, showQuoteArea]);

  useIdleTimer({
    onIdle,
    timeout: 300000,
    events: [
      'keydown',
      'mousedown',
      'touchstart',
      'MSPointerDown',
      'visibilitychange'
    ],
    throttle: 0,
    eventsThrottle: 0,
    element: document,
    startOnMount: true
  });

  // mobile:
  const [showQuoteDetailOnMobile, setShowQuoteDetailOnMobile] = useState<boolean>(false);

  // @ts-ignore
  const fromValue = useWatchTransaction('from', form, defaultData);
  const fromAmountValue = useWatchTransaction('fromAmount', form, defaultData);
  const fromTokenSlugValue = useWatchTransaction('fromTokenSlug', form, defaultData);
  const toTokenSlugValue = useWatchTransaction('toTokenSlug', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);
  const recipientValue = useWatchTransaction('recipient', form, defaultData);

  const { checkChainConnected, turnOnChain } = useChainConnection();
  const onPreCheck = usePreCheckAction(fromValue);
  const oneSign = useOneSignProcess(fromValue);
  const getReformatAddress = useReformatAddress();

  const [processState, dispatchProcessState] = useReducer(commonProcessReducer, DEFAULT_COMMON_PROCESS);
  const { onError, onSuccess } = useHandleSubmitMultiTransaction(dispatchProcessState);

  const fromAndToTokenMap = useMemo<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {};

    swapPairs.forEach((pair) => {
      if (!result[pair.from]) {
        result[pair.from] = [pair.to];
      } else {
        result[pair.from].push(pair.to);
      }
    });

    return result;
  }, [swapPairs]);

  const getAccountTokenBalance = useGetAccountTokenBalance();

  const accountAddressItems = useMemo(() => {
    const chainInfo = chainValue ? chainInfoMap[chainValue] : undefined;

    if (!chainInfo) {
      return [];
    }

    const result: AccountAddressItemType[] = [];

    accountProxies.forEach((ap) => {
      if (!(isAccountAll(targetAccountProxy.id) || ap.id === targetAccountProxy.id)) {
        return;
      }

      if ([AccountProxyType.READ_ONLY, AccountProxyType.LEDGER].includes(ap.accountType)) {
        return;
      }

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
    });

    return result;
  }, [accountProxies, chainInfoMap, chainValue, getReformatAddress, targetAccountProxy]);

  const targetAccountProxyIdForGetBalance = useMemo(() => {
    if (!isAccountAll(targetAccountProxy.id) || !fromValue) {
      return targetAccountProxy.id;
    }

    const accountProxyByFromValue = accountAddressItems.find((a) => a.address === fromValue);

    return accountProxyByFromValue?.accountProxyId || targetAccountProxy.id;
  }, [accountAddressItems, fromValue, targetAccountProxy.id]);

  const fromTokenItems = useMemo<TokenSelectorItemType[]>(() => {
    const rawTokenSlugs = Object.keys(fromAndToTokenMap);
    let targetTokenSlugs: string[] = [];

    (() => {
      // defaultSlug is just TokenSlug
      if (defaultSlug && rawTokenSlugs.includes(defaultSlug)) {
        if (isTokenCompatibleWithAccountChainTypes(defaultSlug, targetAccountProxy.chainTypes, chainInfoMap)) {
          targetTokenSlugs.push(defaultSlug);
        }

        return;
      }

      rawTokenSlugs.forEach((rts) => {
        const assetInfo = assetRegistryMap[rts];

        if (!assetInfo) {
          return;
        }

        if (defaultSlug) {
          // defaultSlug is MultiChainAssetSlug
          if (_getMultiChainAsset(assetInfo) === defaultSlug && isTokenCompatibleWithAccountChainTypes(rts, targetAccountProxy.chainTypes, chainInfoMap)) {
            targetTokenSlugs.push(rts);
          }

          return;
        }

        if (isTokenCompatibleWithAccountChainTypes(rts, targetAccountProxy.chainTypes, chainInfoMap)) {
          targetTokenSlugs.push(rts);
        }

        if (isAllAccount) {
          const allowChainSlug = getChainsByAccountAll(targetAccountProxy, accountProxies, chainInfoMap);

          targetTokenSlugs = targetTokenSlugs.filter((tokenSlug) => {
            const chainSlug = _getOriginChainOfAsset(tokenSlug);

            return allowChainSlug.includes(chainSlug);
          });
        }
      });
    })();

    if (targetTokenSlugs.length) {
      const result = getTokenSelectorItem(targetTokenSlugs, assetRegistryMap, getAccountTokenBalance(targetTokenSlugs, targetAccountProxyIdForGetBalance), chainStateMap);

      sortTokens(result, priorityTokens);

      return result;
    }

    return [];
  }, [accountProxies, assetRegistryMap, chainInfoMap, chainStateMap, defaultSlug, fromAndToTokenMap, getAccountTokenBalance, isAllAccount, priorityTokens, targetAccountProxy, targetAccountProxyIdForGetBalance]);

  const toTokenItems = useMemo<TokenSelectorItemType[]>(() => {
    const targetTokenSlugs = fromAndToTokenMap[fromTokenSlugValue] || [];

    const result = getTokenSelectorItem(targetTokenSlugs, assetRegistryMap, getAccountTokenBalance(targetTokenSlugs, targetAccountProxyIdForGetBalance), chainStateMap);

    sortTokens(result, priorityTokens);

    return result;
  }, [assetRegistryMap, chainStateMap, fromAndToTokenMap, fromTokenSlugValue, getAccountTokenBalance, priorityTokens, targetAccountProxyIdForGetBalance]);

  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[fromTokenSlugValue] || undefined;
  }, [assetRegistryMap, fromTokenSlugValue]);

  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[toTokenSlugValue] || undefined;
  }, [assetRegistryMap, toTokenSlugValue]);

  const destChainValue = _getAssetOriginChain(toAssetInfo);

  const feeAssetInfo = useMemo(() => {
    return (currentFeeOption ? assetRegistryMap[currentFeeOption] : undefined);
  }, [assetRegistryMap, currentFeeOption]);

  const isSwitchable = useMemo(() => {
    if (!fromAndToTokenMap[toTokenSlugValue]) {
      return false;
    }

    return isTokenCompatibleWithAccountChainTypes(toTokenSlugValue, targetAccountProxy.chainTypes, chainInfoMap);
  }, [chainInfoMap, fromAndToTokenMap, targetAccountProxy.chainTypes, toTokenSlugValue]);

  // Unable to use useEffect due to infinity loop caused by conflict setCurrentSlippage and currentQuote
  const slippage = useMemo(() => {
    const providerId = currentQuote?.provider?.id;
    const slippageMap = {
      [SwapProviderId.CHAIN_FLIP_MAINNET]: CHAINFLIP_SLIPPAGE,
      [SwapProviderId.CHAIN_FLIP_TESTNET]: CHAINFLIP_SLIPPAGE,
      [SwapProviderId.SIMPLE_SWAP]: SIMPLE_SWAP_SLIPPAGE
    };

    return providerId && providerId in slippageMap
      ? slippageMap[providerId as keyof typeof slippageMap]
      : currentSlippage.slippage.toNumber();
  }, [currentQuote?.provider?.id, currentSlippage.slippage]);

  const onSwitchSide = useCallback(() => {
    if (fromTokenSlugValue && toTokenSlugValue) {
      form.setFieldsValue({
        fromTokenSlug: toTokenSlugValue,
        toTokenSlug: fromTokenSlugValue,
        from: '',
        recipient: undefined
      });

      setIsFormInvalid(true);
    }
  }, [form, fromTokenSlugValue, toTokenSlugValue]);

  // todo: this logic is only true with substrate, evm address. Make sure it work with ton, bitcoin, and more
  const recipientAddressValidator = useCallback((rule: Rule, _recipientAddress: string): Promise<void> => {
    const { chain, from, toTokenSlug } = form.getFieldsValue();
    const destChain = assetRegistryMap[toTokenSlug].originChain;
    const destChainInfo = chainInfoMap[destChain];
    const account = findAccountByAddress(accounts, _recipientAddress);

    return validateRecipientAddress({ srcChain: chain,
      destChainInfo,
      fromAddress: from,
      toAddress: _recipientAddress,
      account,
      actionType: ActionType.SWAP,
      autoFormatValue,
      allowLedgerGenerics: ledgerGenericAllowNetworks });
  }, [accounts, assetRegistryMap, autoFormatValue, chainInfoMap, form, ledgerGenericAllowNetworks]);

  const isNotShowAccountSelector = !isAllAccount && accountAddressItems.length < 2;

  const showRecipientField = useMemo(() => {
    if (!fromValue || !destChainValue || !chainInfoMap[destChainValue]) {
      return false;
    }

    // todo: convert this find logic to util
    const fromAccountJson = accounts.find((account) => isSameAddress(account.address, fromValue));

    if (!fromAccountJson) {
      return false;
    }

    return !isChainInfoAccordantAccountChainType(chainInfoMap[destChainValue], fromAccountJson.chainType);
  }, [accounts, chainInfoMap, destChainValue, fromValue]);

  const onSelectFromToken = useCallback((tokenSlug: string) => {
    form.setFieldValue('fromTokenSlug', tokenSlug);
  }, [form]);

  const onSelectToToken = useCallback((tokenSlug: string) => {
    form.setFieldValue('toTokenSlug', tokenSlug);
  }, [form]);

  const notSupportSlippageSelection = useMemo(() => {
    const unsupportedProviders = [
      SwapProviderId.CHAIN_FLIP_TESTNET,
      SwapProviderId.CHAIN_FLIP_MAINNET,
      SwapProviderId.SIMPLE_SWAP
    ];

    return currentQuote?.provider.id ? unsupportedProviders.includes(currentQuote.provider.id) : false;
  }, [currentQuote?.provider.id]);

  const onOpenSlippageModal = useCallback(() => {
    if (!notSupportSlippageSelection) {
      activeModal(SWAP_SLIPPAGE_MODAL);
    }
  }, [activeModal, notSupportSlippageSelection]);

  const openAllQuotesModal = useCallback(() => {
    setSwapQuotesSelectorModalRenderKey(`${SWAP_ALL_QUOTES_MODAL}_${Date.now()}`);

    setTimeout(() => {
      activeModal(SWAP_ALL_QUOTES_MODAL);
    }, 100);
  }, [activeModal]);

  const openChooseFeeToken = useCallback(() => {
    activeModal(SWAP_CHOOSE_FEE_TOKEN_MODAL);
  }, [activeModal]);

  const generateOptimalProcessOnSelectQuote = useCallback(
    async (quote: SwapQuote) => {
      try {
        const currentRequest: SwapRequest = {
          address: fromValue,
          pair: quote.pair,
          fromAmount: quote.fromAmount,
          slippage: currentSlippage.slippage.toNumber(),
          recipient: recipientValue || undefined,
          currentQuote: quote.provider
        };

        const optimalRequest: OptimalSwapPathParamsV2 = {
          request: currentRequest,
          selectedQuote: quote,
          path: [] // background will generate this
        };

        return await getOptimalProcessOnSelectQuote(optimalRequest);
      } catch (error) {
        console.error('generateOptimalProcess failed:', error);

        return null;
      }
    },
    [fromValue, currentSlippage.slippage, recipientValue]
  );

  const onConfirmSelectedQuote = useCallback(
    async (quote: SwapQuote) => {
      const processResult = await generateOptimalProcessOnSelectQuote(quote);

      if (!processResult) {
        return;
      }

      setOptimalSwapPath(processResult);
      dispatchProcessState({
        payload: {
          steps: processResult.steps,
          feeStructure: processResult.totalFee
        },
        type: CommonActionType.STEP_CREATE
      });

      setCurrentQuote(quote);
      setFeeOptions(quote.feeInfo.feeOptions);
      setCurrentFeeOption(quote.feeInfo.feeOptions?.[0]);

      setCurrentQuoteRequest((oldRequest) => {
        if (!oldRequest) {
          return undefined;
        }

        return {
          ...oldRequest,
          currentQuote: quote.provider
        };
      });
    },
    [generateOptimalProcessOnSelectQuote]
  );

  const onSelectFeeOption = useCallback((slug: string) => {
    setCurrentFeeOption(slug);
  }, []);
  const onSelectSlippage = useCallback((slippage: SlippageType) => {
    setCurrentSlippage(slippage);
  }, []);

  const onToggleFeeDetails = useCallback(() => {
    setIsViewFeeDetails((prev) => !prev);
  }, []);

  const onChangeAmount = useCallback((value: string) => {
    form.setFieldValue('fromAmount', value);
  }, [form]);

  const onFieldsChange: FormCallbacks<SwapParams>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    const values = convertFieldToObject<SwapParams>(allFields);

    persistData(values);
  }, [persistData]);

  const estimatedFeeValue = useMemo(() => {
    let totalBalance = BN_ZERO;

    currentQuote?.feeInfo.feeComponent.forEach((feeItem) => {
      const asset = assetRegistryMap[feeItem.tokenSlug];

      if (asset) {
        const { decimals, priceId } = asset;
        const price = priceMap[priceId || ''] || 0;

        totalBalance = totalBalance.plus(new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price));
      }
    });

    return totalBalance;
  }, [assetRegistryMap, currentQuote?.feeInfo.feeComponent, priceMap]);

  const getConvertedBalance = useCallback((feeItem: CommonFeeComponent) => {
    const asset = assetRegistryMap[feeItem.tokenSlug];

    if (asset) {
      const { decimals, priceId } = asset;
      const price = priceMap[priceId || ''] || 0;

      return new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price);
    }

    return BN_ZERO;
  }, [assetRegistryMap, priceMap]);

  const feeItems = useMemo(() => {
    const result: FeeItem[] = [];
    const feeTypeMap: Record<SwapFeeType, FeeItem> = {
      NETWORK_FEE: { label: 'Network fee', value: new BigN(0), prefix: `${(currencyData.isPrefix && currencyData.symbol) || ''}`, suffix: `${(!currencyData.isPrefix && currencyData.symbol) || ''}`, type: SwapFeeType.NETWORK_FEE },
      PLATFORM_FEE: { label: 'Protocol fee', value: new BigN(0), prefix: `${(currencyData.isPrefix && currencyData.symbol) || ''}`, suffix: `${(!currencyData.isPrefix && currencyData.symbol) || ''}`, type: SwapFeeType.PLATFORM_FEE },
      WALLET_FEE: { label: 'Wallet commission', value: new BigN(0), prefix: `${(currencyData.isPrefix && currencyData.symbol) || ''}`, suffix: `${(!currencyData.isPrefix && currencyData.symbol) || ''}`, type: SwapFeeType.WALLET_FEE }
    };

    currentQuote?.feeInfo.feeComponent.forEach((feeItem) => {
      const { feeType } = feeItem;

      feeTypeMap[feeType].value = feeTypeMap[feeType].value.plus(getConvertedBalance(feeItem));
    });

    Object.values(feeTypeMap).forEach((fee) => {
      if (!fee.value.lte(new BigN(0))) {
        result.push(fee);
      }
    });

    return result;
  }, [currencyData.isPrefix, currencyData.symbol, currentQuote?.feeInfo.feeComponent, getConvertedBalance]);

  const canShowAvailableBalance = useMemo(() => {
    if (fromValue && chainValue && chainInfoMap[chainValue]) {
      return isEthereumAddress(fromValue) === _isChainEvmCompatible(chainInfoMap[chainValue]);
    }

    return false;
  }, [fromValue, chainValue, chainInfoMap]);

  const renderRateInfo = () => {
    if (!currentQuote) {
      return null;
    }

    return (
      <div className={'__quote-estimate-swap-value'}>
        <Number
          decimal={0}
          suffix={_getAssetSymbol(fromAssetInfo)}
          unitOpacity={0.45}
          value={1}
        />
        <span>&nbsp;~&nbsp;</span>
        <Number
          customFormatter={swapCustomFormatter}
          decimal={0}
          formatType={'custom'}
          metadata={numberMetadata}
          suffix={_getAssetSymbol(toAssetInfo)}
          unitOpacity={0.45}
          value={currentQuote.rate}
        />
      </div>
    );
  };

  const onConfirmStillThere = useCallback(() => {
    inactiveModal(SWAP_IDLE_WARNING_MODAL);
    setHandleRequestLoading(true);
    setRequestUserInteractToContinue(false);
    continueRefreshQuoteRef.current = true;
  }, [inactiveModal]);

  const renderQuoteEmptyBlock = () => {
    const isError = !!swapError || isFormInvalid;
    let message = '';
    const _loading = handleRequestLoading && !isFormInvalid;

    if (isFormInvalid) {
      message = t('Invalid input. Re-enter information in the red field and try again');
    } else if (handleRequestLoading) {
      message = t('Loading...');
    } else {
      message = swapError ? swapError?.message : t('No swap quote found. Adjust your amount or try again later.');
    }

    return (
      <div className={CN('__quote-empty-block')}>
        <div className='__quote-empty-icon-wrapper'>
          <div className={CN('__quote-empty-icon', {
            '-error': isError && !_loading
          })}
          >
            {
              _loading
                ? (
                  <ActivityIndicator size={32} />
                )
                : (
                  <Icon
                    customSize={'36px'}
                    phosphorIcon={isError ? XCircle : ListBullets}
                    weight={isError ? 'fill' : undefined}
                  />
                )
            }
          </div>
        </div>

        <div className={CN('__quote-empty-message', {
          '-loading': _loading
        })}
        >{message}</div>
      </div>
    );
  };

  const isChainConnected = useMemo(() => {
    return checkChainConnected(chainValue);
  }, [chainValue, checkChainConnected]);

  const onSubmit: FormCallbacks<SwapParams>['onFinish'] = useCallback((values: SwapParams) => {
    if (chainValue && !checkChainConnected(chainValue)) {
      openAlert({
        title: t('Pay attention!'),
        type: NotificationType.ERROR,
        content: t('Your selected network might have lost connection. Try updating it by either re-enabling it or changing network provider'),
        okButton: {
          text: t('I understand'),
          onClick: closeAlert,
          icon: CheckCircle
        }
      });

      return;
    }

    if (isChainConnected && swapError) {
      notify({
        message: swapError?.message,
        type: 'error',
        duration: 5
      });

      return;
    }

    if (!currentQuote || !currentOptimalSwapPath) {
      return;
    }

    const account = findAccountByAddress(accounts, values.from);

    if (account?.isHardware) {
      notify({
        message: t('The account you are using is Ledger account, you cannot use this feature with it'),
        type: 'error',
        duration: 8
      });

      return;
    }

    const transactionBlockProcess = () => {
      setSubmitLoading(true);

      const { from, recipient } = values;
      let processId = processState.processId;

      const submitData = async (step: number): Promise<boolean> => {
        const isFirstStep = step === 0;
        const isLastStep = step === processState.steps.length - 1;
        const needRollback = step === 1;

        if (isFirstStep) {
          processId = getId();
        }

        dispatchProcessState({
          type: CommonActionType.STEP_SUBMIT,
          payload: isFirstStep ? { processId } : null
        });

        try {
          if (isFirstStep) {
            const validatePromise = validateSwapProcess({
              address: from,
              process: currentOptimalSwapPath,
              selectedQuote: currentQuote,
              currentStep: 1,
              recipient // Need to assign format address with toChainInfo in case there's no recipient
            });

            const _errors = await validatePromise;

            if (_errors.length) {
              onError(_errors[0]);

              return false;
            } else {
              dispatchProcessState({
                type: CommonActionType.STEP_COMPLETE,
                payload: true
              });
              dispatchProcessState({
                type: CommonActionType.STEP_SUBMIT,
                payload: null
              });

              return await submitData(step + 1);
            }
          } else {
            let latestOptimalQuote = currentQuote;
            const specialCaseForUniswap = latestOptimalQuote.provider.id === SwapProviderId.UNISWAP && !!currentOptimalSwapPath.steps.find((step) => step.type === SwapStepType.PERMIT);

            if (currentOptimalSwapPath.steps.length > 2 && isLastStep && !specialCaseForUniswap) {
              if (currentQuoteRequest) {
                const latestSwapQuote = await getLatestSwapQuote(currentQuoteRequest);

                if (latestSwapQuote.optimalQuote) {
                  latestOptimalQuote = latestSwapQuote.optimalQuote;
                  setQuoteOptions(latestSwapQuote.quotes);
                  setCurrentQuote(latestSwapQuote.optimalQuote);
                  setQuoteAliveUntil(latestSwapQuote.aliveUntil);
                  setSwapError(latestSwapQuote.error);
                }
              }
            }

            if (oneSign && currentOptimalSwapPath.steps.length > 2) {
              const submitPromise: Promise<SWTransactionResponse> = submitProcess({
                address: from,
                id: processId,
                type: ProcessType.SWAP,
                request: {
                  cacheProcessId: processId,
                  process: currentOptimalSwapPath,
                  currentStep: step,
                  quote: latestOptimalQuote,
                  address: from,
                  slippage: slippage,
                  recipient
                }
              });

              const rs = await submitPromise;

              onSuccess(true, needRollback)(rs);

              return true;
            } else {
              const submitPromise: Promise<SWTransactionResponse> = handleSwapStep({
                cacheProcessId: processId,
                process: currentOptimalSwapPath,
                currentStep: step,
                quote: latestOptimalQuote,
                address: from,
                slippage: slippage,
                recipient
              });

              const rs = await submitPromise;
              const success = onSuccess(isLastStep, needRollback)(rs);

              if (success) {
                return await submitData(step + 1);
              } else {
                return false;
              }
            }
          }
        } catch (e) {
          onError(e as Error);

          return false;
        }
      };

      setTimeout(() => {
        submitData(processState.currentStep)
          .catch(onError)
          .finally(() => {
            setSubmitLoading(false);
          });
      }, 300);
    };

    if (currentQuote.isLowLiquidity) {
      openAlert({
        title: t('Pay attention!'),
        type: NotificationType.WARNING,
        content: t('Low liquidity. Swap is available but not recommended as swap rate is unfavorable'),
        okButton: {
          text: t('Continue'),
          onClick: () => {
            closeAlert();
            transactionBlockProcess();
          },
          icon: CheckCircle
        },
        cancelButton: {
          text: t('Cancel'),
          schema: 'secondary',
          onClick: closeAlert
        }
      });
    } else {
      transactionBlockProcess();
    }
  }, [accounts, chainValue, checkChainConnected, closeAlert, currentOptimalSwapPath, currentQuote, currentQuoteRequest, isChainConnected, notify, onError, onSuccess, oneSign, openAlert, processState.currentStep, processState.processId, processState.steps.length, slippage, swapError, t]);

  const minimumReceived = useMemo(() => {
    const adjustedValue = new BigN(currentQuote?.toAmount || '0').multipliedBy(new BigN(1).minus(new BigN(slippage))).integerValue(BigN.ROUND_DOWN);

    const adjustedValueStr = adjustedValue.toString();

    return adjustedValueStr.includes('e')
      ? formatNumberString(adjustedValueStr)
      : adjustedValueStr;
  }, [slippage, currentQuote?.toAmount]);

  const onAfterConfirmTermModal = useCallback(() => {
    return setConfirmedTerm('swap-term-confirmed');
  }, [setConfirmedTerm]);

  const onViewQuoteDetail = useCallback(() => {
    setShowQuoteDetailOnMobile(true);
  }, []);

  const currentPair = useMemo(() => {
    if (fromTokenSlugValue && toTokenSlugValue) {
      const pairSlug = _parseAssetRefKey(fromTokenSlugValue, toTokenSlugValue);

      return swapPairs.find((item) => item.slug === pairSlug);
    }

    return undefined;
  }, [fromTokenSlugValue, swapPairs, toTokenSlugValue]);

  const altChain = useMemo(() => {
    if (currentPair) {
      const alternativeAssetSlug = getSwapAlternativeAsset(currentPair);

      if (alternativeAssetSlug) {
        return _getOriginChainOfAsset(alternativeAssetSlug);
      }
    }

    return undefined;
  }, [currentPair]);

  const isSimpleSwapSlippage = useMemo(() => {
    if (currentQuote?.provider.id === SwapProviderId.SIMPLE_SWAP) {
      return true;
    }

    return false;
  }, [currentQuote?.provider.id]);

  const renderSlippage = () => {
    const slippageTitle = isSimpleSwapSlippage ? 'Slippage can be up to 5% due to market conditions' : '';
    const slippageContent = isSimpleSwapSlippage ? `Up to ${((slippage * 100).toString()).toString()}%` : `${((slippage * 100).toString()).toString()}%`;

    return (
      <>
        <div className='__slippage-action-wrapper'>
          <div
            className='__slippage-action'
            onClick={onOpenSlippageModal}
          >
            <Tooltip
              placement={'topRight'}
              title={slippageTitle}
            >
              <div className='__slippage-title-wrapper'>Slippage
                <Icon
                  customSize='16px'
                  iconColor={token.colorSuccess}
                  phosphorIcon={Info}
                  size='sm'
                  weight='fill'
                />
                        : &nbsp;<span>{slippageContent}</span>
              </div>
            </Tooltip>

            {!notSupportSlippageSelection && (
              <div className='__slippage-editor-button'>
                <Icon
                  className='__slippage-editor-button-icon'
                  phosphorIcon={PencilSimpleLine}
                  size='sm'
                />
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const isSwapXCM = useMemo(() => {
    return processState.steps.some((item) => item.type === CommonStepType.XCM);
  }, [processState.steps]);

  const xcmBalanceTokens = useMemo(() => {
    if (!isSwapXCM || !fromAssetInfo || !currentPair) {
      return [];
    }

    const result: {
      token: string;
      chain: string;
    }[] = [{
      token: fromAssetInfo.slug,
      chain: fromAssetInfo.originChain
    }];

    const chainInfo = chainInfoMap[fromAssetInfo.originChain];

    if (chainInfo) {
      const _nativeSlug = _getChainNativeTokenSlug(chainInfo);

      if (_nativeSlug !== fromAssetInfo.slug) {
        result.push({
          token: _getChainNativeTokenSlug(chainInfo),
          chain: fromAssetInfo.originChain
        });
      }
    }

    const alternativeAssetSlug = getSwapAlternativeAsset(currentPair);

    if (alternativeAssetSlug) {
      result.push({
        token: alternativeAssetSlug,
        chain: _getOriginChainOfAsset(alternativeAssetSlug)
      });
    }

    return result;
  }, [chainInfoMap, currentPair, fromAssetInfo, isSwapXCM]);

  useEffect(() => {
    const updateFromValue = () => {
      if (!accountAddressItems.length) {
        return;
      }

      if (accountAddressItems.length === 1) {
        if (!fromValue || accountAddressItems[0].address !== fromValue) {
          form.setFieldValue('from', accountAddressItems[0].address);
        }
      } else {
        if (fromValue && !accountAddressItems.some((i) => i.address === fromValue)) {
          form.setFieldValue('from', '');
        }
      }
    };

    updateFromValue();
  }, [accountAddressItems, form, fromValue]);

  useEffect(() => {
    setBackProps((prev) => ({
      ...prev,
      onClick: showQuoteDetailOnMobile
        ? () => {
          setShowQuoteDetailOnMobile(false);
        }
        : null
    }));
  }, [setBackProps, showQuoteDetailOnMobile]);

  useEffect(() => {
    if (recipientValue && toAssetInfo) {
      form.validateFields(['recipient']).catch((e) => {
        console.log('Error when validating', e);
      });
    }
  }, [form, recipientValue, toAssetInfo]);

  useEffect(() => {
    setCustomScreenTitle(showQuoteDetailOnMobile ? t('Swap quote detail') : t('Swap'));
  }, [setCustomScreenTitle, showQuoteDetailOnMobile, t]);

  useEffect(() => {
    const chain = _getAssetOriginChain(fromAssetInfo);

    form.setFieldValue('chain', chain);
    persistData((prev) => ({
      ...prev,
      chain
    }));
  }, [form, fromAssetInfo, persistData]);

  useEffect(() => {
    let sync = true;
    let timeout: NodeJS.Timeout;

    // todo: simple validate before do this
    if (fromValue && fromTokenSlugValue && toTokenSlugValue && fromAmountValue) {
      timeout = setTimeout(() => {
        form.validateFields(['from', 'recipient']).then(() => {
          if (!sync) {
            return;
          }

          setHandleRequestLoading(true);
          setCurrentQuoteRequest(undefined);
          setQuoteAliveUntil(undefined);
          setCurrentQuote(undefined);
          setSwapError(undefined);
          setIsFormInvalid(false);
          setShowQuoteArea(true);

          const currentRequest: SwapRequest = {
            address: fromValue,
            pair: {
              slug: _parseAssetRefKey(fromTokenSlugValue, toTokenSlugValue),
              from: fromTokenSlugValue,
              to: toTokenSlugValue
            },
            fromAmount: fromAmountValue,
            slippage: currentSlippage.slippage.toNumber(),
            recipient: recipientValue || undefined
          };

          handleSwapRequestV2(currentRequest).then((result) => {
            if (sync) {
              setCurrentQuoteRequest(currentRequest);
              setOptimalSwapPath(result.process);

              dispatchProcessState({
                payload: {
                  steps: result.process.steps,
                  feeStructure: result.process.totalFee
                },
                type: CommonActionType.STEP_CREATE
              });

              setQuoteOptions(result.quote.quotes);
              setCurrentQuote(result.quote.optimalQuote);
              setQuoteAliveUntil(result.quote.aliveUntil);
              setFeeOptions(result.quote.optimalQuote?.feeInfo?.feeOptions || []);
              setCurrentFeeOption(result.quote.optimalQuote?.feeInfo?.feeOptions?.[0]);
              setSwapError(result.quote.error);
              optimalQuoteRef.current = result.quote.optimalQuote;
              setHandleRequestLoading(false);
            }
          }).catch((e) => {
            console.log('handleSwapRequest error', e);

            if (sync) {
              setHandleRequestLoading(false);
            }
          });
        }).catch((e) => {
          console.log('Error when validating', e);

          if (sync) {
            setIsFormInvalid(true);
          }
        });
      }, 300);
    } else {
      setIsFormInvalid(true);
    }

    return () => {
      sync = false;
      clearTimeout(timeout);
    };
  }, [currentSlippage, form, fromAmountValue, fromTokenSlugValue, fromValue, recipientValue, showRecipientField, toTokenSlugValue]);

  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let timer: NodeJS.Timer | undefined;
    let sync = true;

    const updateQuote = () => {
      if (currentQuoteRequest) {
        if (sync) {
          setHandleRequestLoading(true);
        }

        getLatestSwapQuote(currentQuoteRequest).then((rs) => {
          if (sync) {
            setQuoteOptions(rs.quotes);
            setCurrentQuote(rs.optimalQuote);
            setQuoteAliveUntil(rs.aliveUntil);
            setSwapError(rs.error);
          }
        }).catch((e) => {
          console.log('Error when getLatestSwapQuote', e);
        }).finally(() => {
          if (sync) {
            setHandleRequestLoading(false);
          }
        });
      }
    };

    const updateQuoteHandler = () => {
      if (!quoteAliveUntil) {
        clearInterval(timer);

        if (continueRefreshQuoteRef.current && sync) {
          setHandleRequestLoading(false);
        }

        return;
      }

      if (quoteAliveUntil + 2000 < Date.now() && !continueRefreshQuoteRef.current) {
        clearInterval(timer);

        if (!requestUserInteractToContinue && !hasInternalConfirmations) {
          updateQuote();
        }
      } else {
        if (continueRefreshQuoteRef.current) {
          continueRefreshQuoteRef.current = false;

          updateQuote();
        }
      }
    };

    timer = setInterval(updateQuoteHandler, 1000);

    updateQuoteHandler();

    return () => {
      sync = false;
      clearInterval(timer);
    };
  }, [currentQuoteRequest, hasInternalConfirmations, quoteAliveUntil, requestUserInteractToContinue]);

  useEffect(() => {
    if (!confirmedTerm) {
      activeModal(SWAP_TERMS_OF_SERVICE_MODAL);
    }
  }, [activeModal, confirmedTerm]);

  useEffect(() => {
    if (isFormInvalid) {
      setQuoteAliveUntil(undefined);
      setShowQuoteArea(false);
      setQuoteOptions([]);
      setCurrentQuote(undefined);
      setCurrentQuoteRequest(undefined);
    }
  }, [isFormInvalid]);

  useEffect(() => {
    if (requestUserInteractToContinue) {
      inactiveAll();
      activeModal(SWAP_IDLE_WARNING_MODAL);
    }
  }, [activeModal, inactiveAll, requestUserInteractToContinue]);

  useEffect(() => {
    if (fromTokenItems.length) {
      if (!fromTokenSlugValue) {
        form.setFieldValue('fromTokenSlug', fromTokenItems[0].slug);
      } else {
        if (!fromTokenItems.some((i) => i.slug === fromTokenSlugValue)) {
          form.setFieldValue('fromTokenSlug', fromTokenItems[0].slug);
        }
      }
    } else {
      form.setFieldValue('fromTokenSlug', '');
      form.setFieldValue('toTokenSlug', '');
    }
  }, [form, fromTokenItems, fromTokenSlugValue]);

  useEffect(() => {
    if (toTokenItems.length) {
      if (!toTokenSlugValue || !toTokenItems.some((t) => t.slug === toTokenSlugValue)) {
        form.setFieldValue('toTokenSlug', toTokenItems[0].slug);
      }
    }
  }, [form, toTokenItems, toTokenSlugValue]);

  useEffect(() => {
    if (altChain && !checkChainConnected(altChain)) {
      turnOnChain(altChain);
    }
  }, [checkChainConnected, altChain, turnOnChain]);

  const isNotConnectedAltChain = useMemo(() => {
    if (altChain && !checkChainConnected(altChain)) {
      return true;
    }

    return false;
  }, [altChain, checkChainConnected]);

  const networkName = useMemo(() => {
    return (isEthereumAddress(fromValue)) ? 'Polkadot' : 'Ethereum';
  }, [fromValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!!currentQuote && !isScrollEnd) {
        setIsScrollEnd(true);
        const id = 'transaction-swap-wrapper-id';
        const element = document.getElementById(id);

        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentQuote, isScrollEnd]);

  useEffect(() => {
    if (isChainConnected && swapError) {
      notify({
        message: swapError?.message,
        type: 'error',
        duration: 5
      });
    }
  }, [isChainConnected, notify, swapError, swapError?.message, t]);

  return (
    <>
      <>
        <div className={CN('__transaction-form-area', {
          '-init-animation': !showQuoteArea,
          hidden: showQuoteDetailOnMobile // todo: Update this logic on mobile screen
        })}
        >
          <TransactionContent>
            <div
              className={'__transaction-swap-wrapper'}
              id={'transaction-swap-wrapper-id'}
            >
              <Form
                className={'form-container'}
                form={form}
                initialValues={formDefault}
                onFieldsChange={onFieldsChange}
                onFinish={onSubmit}
              >
                <HiddenInput fields={hideFields} />

                <div className={'__swap-field-area'}>
                  <SwapFromField
                    amountValue={fromAmountValue}
                    fromAsset={fromAssetInfo}
                    label={t('From')}
                    onChangeAmount={onChangeAmount}
                    onSelectToken={onSelectFromToken}
                    tokenSelectorItems={fromTokenItems}
                    tokenSelectorValue={fromTokenSlugValue}
                  />

                  <div className='__switch-side-container'>
                    <Button
                      className={'__switch-button'}
                      disabled={!isSwitchable}
                      icon={(
                        <Icon
                          customSize={'20px'}
                          phosphorIcon={ArrowsDownUp}
                          weight='fill'
                        />
                      )}
                      onClick={onSwitchSide}
                      shape='circle'
                      size='xs'
                      type={'ghost'}
                    >
                    </Button>
                  </div>

                  <SwapToField
                    decimals={_getAssetDecimals(toAssetInfo)}
                    loading={handleRequestLoading && showQuoteArea}
                    onSelectToken={onSelectToToken}
                    swapValue={currentQuote?.toAmount || 0}
                    toAsset={toAssetInfo}
                    tokenSelectorItems={toTokenItems}
                    tokenSelectorValue={toTokenSlugValue}
                  />
                </div>

                <Form.Item
                  hidden={isNotShowAccountSelector}
                  name={'from'}
                >
                  <AccountAddressSelector
                    items={accountAddressItems}
                    label={`${t('From')}:`}
                    labelStyle={'horizontal'}
                  />
                </Form.Item>

                {defaultSlug && !fromAssetInfo && (
                  <AlertBox
                    description={`No swap pair for this token found. Switch to ${networkName} account to see available swap pairs`}
                    title={'Pay attention!'}
                    type={'warning'}
                  />
                )}

                {showRecipientField && (
                  <Form.Item
                    name={'recipient'}
                    rules={[
                      {
                        validator: recipientAddressValidator
                      }
                    ]}
                    statusHelpAsTooltip={true}
                  >
                    <AddressInputNew
                      chainSlug={destChainValue}
                      dropdownHeight={isNotShowAccountSelector ? 227 : 167}
                      label={`${t('To')}:`}
                      labelStyle={'horizontal'}
                      placeholder={t('Input your recipient account')}
                      showAddressBook={true}
                      showScanner={true}
                    />
                  </Form.Item>
                )}
                <div className={'__balance-display-area'}>
                  <FreeBalanceToEarn
                    address={fromValue}
                    hidden={!canShowAvailableBalance || !isSwapXCM}
                    label={`${t('Available balance')}`}
                    labelTooltip={'Available balance for swap'}
                    tokens={xcmBalanceTokens}
                  />

                  <FreeBalance
                    address={fromValue}
                    chain={chainValue}
                    hidden={!canShowAvailableBalance || isSwapXCM}
                    isSubscribe={true}
                    label={`${t('Available balance')}`}
                    labelTooltip={'Available balance for swap'}
                    tokenSlug={fromTokenSlugValue}
                  />
                </div>
                <div className={CN('__separator', { hidden: (!currentQuote || isFormInvalid) })}></div>
              </Form>
              {
                showQuoteArea && (
                  <>
                    {
                      !!currentQuote && !isFormInvalid && (
                        <MetaInfo
                          labelColorScheme={'gray'}
                          spaceSize={'sm'}
                          valueColorScheme={'light'}
                        >
                          <MetaInfo.Default
                            className={'__quote-rate'}
                            label={t('Quote rate')}
                            valueColorSchema={'gray'}
                          >
                            {
                              handleRequestLoading
                                ? (
                                  <ActivityIndicator />
                                )
                                : renderRateInfo()
                            }
                          </MetaInfo.Default>

                          <MetaInfo.Default
                            label={t('Estimated fee')}
                          >
                            {
                              handleRequestLoading
                                ? (
                                  <ActivityIndicator />
                                )
                                : (
                                  <Number
                                    decimal={0}
                                    prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
                                    suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                                    value={estimatedFeeValue}
                                  />
                                )
                            }
                          </MetaInfo.Default>
                        </MetaInfo>
                      )
                    }

                    {
                      !isFormInvalid && !handleRequestLoading && currentQuote && (
                        <div className='__view-quote-detail-action-wrapper'>
                          <div className={'__quote-reset-time'}>
                            <QuoteResetTime
                              quoteAliveUntilValue = {quoteAliveUntil}
                            />
                          </div>

                          <Button
                            className={'__view-quote-detail-button'}
                            onClick={onViewQuoteDetail}
                            size='xs'
                            type='ghost'
                          >
                            <span>{t('View swap quote')}</span>

                            <Icon
                              className={'__swap-quote'}
                              phosphorIcon={CaretRight}
                              size={'sm'}
                            />
                          </Button>
                        </div>
                      )
                    }
                  </>
                )
              }
            </div>
          </TransactionContent>
          <TransactionFooter>
            <Button
              block={true}
              className={'__swap-submit-button'}
              disabled={submitLoading || handleRequestLoading || isNotConnectedAltChain}
              loading={submitLoading}
              onClick={onPreCheck(form.submit, ExtrinsicType.SWAP)}
            >
              {t('Swap')}
            </Button>
          </TransactionFooter>
        </div>

        <div className={CN('__transaction-swap-quote-info-area', {
          '-init-animation': !showQuoteArea,
          hidden: (!showQuoteDetailOnMobile) // todo: Update this logic on mobile screen
        })}
        >
          <>
            <div className={'__quote-header-wrapper'}>
              <div className={'__header-left-part'}>
                <BackgroundIcon
                  backgroundColor='#004BFF'
                  className={'__quote-icon-info'}
                  iconColor='#fff'
                  phosphorIcon={Info}
                  weight={'fill'}
                />
                <div className={'__text'}>Swap quote</div>
              </div>
              <div className={'__header-right-part'}>
                <Button
                  className={'__view-quote-button'}
                  disabled={!quoteOptions.length || (handleRequestLoading || isFormInvalid)}
                  onClick={openAllQuotesModal}
                  size='xs'
                  type='ghost'
                >
                  <span>{t('View quote')}</span>

                  <Icon
                    phosphorIcon={CaretRight}
                    size={'sm'}
                  />
                </Button>
              </div>
            </div>

            {
              !!currentQuote && !handleRequestLoading && !isFormInvalid && (
                <MetaInfo
                  className={CN('__quote-info-block')}
                  hasBackgroundWrapper
                  labelColorScheme={'gray'}
                  spaceSize={'sm'}
                  valueColorScheme={'gray'}
                >
                  <MetaInfo.Default
                    className={'__quote-rate'}
                    label={t('Quote rate')}
                    valueColorSchema={'gray'}
                  >
                    {renderRateInfo()}
                  </MetaInfo.Default>

                  <MetaInfo.Default
                    className={'__swap-provider'}
                    label={t('Swap provider')}
                  >
                    <Logo
                      className='__provider-logo'
                      isShowSubLogo={false}
                      network={currentQuote.provider.id.toLowerCase()}
                      shape='squircle'
                      size={24}
                    />

                    <span className={'__provider-name'}>{currentQuote.provider.name}</span>
                  </MetaInfo.Default>

                  <MetaInfo.Default
                    className={'-d-column'}
                    label={t('Swap route')}
                  >
                  </MetaInfo.Default>
                  <SwapRoute swapRoute={currentQuote.route} />
                  <div className={'__minimum-received'}>
                    <MetaInfo.Number
                      customFormatter={swapCustomFormatter}
                      decimals={_getAssetDecimals(toAssetInfo)}
                      formatType={'custom'}
                      label={
                        <Tooltip
                          placement={'topRight'}
                          title={'The least amount of token received based on slippage tolerance. Any amount less than this will make the transaction fail.'}
                        >
                          <div className={'__minimum-received-label'}>
                            <div>{t('Minimum received')}</div>
                            <Icon
                              customSize={'16px'}
                              iconColor={token.colorTextTertiary}
                              phosphorIcon={Info}
                              size='sm'
                              weight='fill'
                            />
                          </div>
                        </Tooltip>
                      }
                      metadata={numberMetadata}
                      suffix={_getAssetSymbol(toAssetInfo)}
                      value={minimumReceived}
                    />
                  </div>
                </MetaInfo>
              )
            }

            {
              (!currentQuote || handleRequestLoading || isFormInvalid) && renderQuoteEmptyBlock()
            }
            <div className={'__quote-and-slippage'}>
              <>
                {
                  !handleRequestLoading && !isFormInvalid && !hasInternalConfirmations && !!quoteAliveUntil && (
                    <QuoteResetTime
                      quoteAliveUntilValue = {quoteAliveUntil}
                    />
                  )
                }
                {
                  !handleRequestLoading && renderSlippage()
                }
              </>
            </div>

            {
              !!currentQuote && !handleRequestLoading && !isFormInvalid && (
                <MetaInfo
                  className={CN('__quote-fee-info-block')}
                  hasBackgroundWrapper
                  labelColorScheme={'gray'}
                  spaceSize={'xs'}
                  valueColorScheme={'gray'}
                >
                  <MetaInfo.Number
                    className={'__total-fee-value'}
                    decimals={0}
                    label={t('Estimated fee')}
                    onClickValue={onToggleFeeDetails}
                    prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
                    suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                    suffixNode={
                      <Icon
                        className={'__estimated-fee-button'}
                        customSize={'20px'}
                        phosphorIcon={isViewFeeDetails ? CaretUp : CaretDown}
                      />
                    }
                    value={estimatedFeeValue}
                  />

                  {
                    isViewFeeDetails && (
                      <div className={'__quote-fee-details-block'}>
                        {feeItems.map((item) => (
                          <MetaInfo.Number
                            decimals={0}
                            key={item.type}
                            label={t(item.label)}
                            prefix={item.prefix}
                            suffix={item.suffix}
                            value={item.value}
                          />
                        ))}
                      </div>
                    )
                  }

                  <div className={'__separator'}></div>
                  <div className={'__fee-paid-wrapper'}>
                    <div className={'__fee-paid-label'}>Fee paid in</div>
                    <div
                      className={'__fee-paid-token'}
                      onClick={openChooseFeeToken}
                    >
                      <Logo
                        className='token-logo'
                        isShowSubLogo={false}
                        shape='circle'
                        size={24}
                        token={feeAssetInfo && feeAssetInfo.slug.toLowerCase()}
                      />
                      <div className={'__fee-paid-token-symbol'}>{_getAssetSymbol(feeAssetInfo)}</div>
                      <Icon
                        className={'__edit-token'}
                        customSize={'20px'}
                        phosphorIcon={PencilSimpleLine}
                      />
                    </div>
                  </div>
                </MetaInfo>
              )
            }
          </>
        </div>
      </>

      <ChooseFeeTokenModal
        estimatedFee={estimatedFeeValue}
        items={feeOptions}
        modalId={SWAP_CHOOSE_FEE_TOKEN_MODAL}
        onSelectItem={onSelectFeeOption}
        selectedItem={currentFeeOption}
      />
      <SlippageModal
        modalId={SWAP_SLIPPAGE_MODAL}
        onApplySlippage={onSelectSlippage}
        slippageValue={currentSlippage}
      />
      <AddMoreBalanceModal
        modalId={SWAP_MORE_BALANCE_MODAL}
      />
      <SwapQuotesSelectorModal
        items={quoteOptions}
        key={swapQuotesSelectorModalRenderKey} // trick to reinit this modal
        modalId={SWAP_ALL_QUOTES_MODAL}
        onConfirmItem={onConfirmSelectedQuote}
        optimalQuoteItem={optimalQuoteRef.current}
        selectedItem={currentQuote}
      />
      <SwapTermsOfServiceModal onOk={onAfterConfirmTermModal} />
      <SwapIdleWarningModal
        modalId = {SWAP_IDLE_WARNING_MODAL}
        onOk = {onConfirmStillThere}
      />
    </>
  );
};

const Wrapper: React.FC<WrapperProps> = (props: WrapperProps) => {
  const { className } = props;
  const dataContext = useContext(DataContext);
  const { defaultData } = useTransactionContext<SwapParams>();
  const { goHome } = useDefaultNavigate();
  const accountProxies = useSelector((state) => state.accountState.accountProxies);

  const targetAccountProxy = useMemo(() => {
    return accountProxies.find((ap) => {
      if (!defaultData.fromAccountProxy) {
        return isAccountAll(ap.id);
      }

      return ap.id === defaultData.fromAccountProxy;
    });
  }, [accountProxies, defaultData.fromAccountProxy]);

  useEffect(() => {
    if (!targetAccountProxy) {
      goHome();
    }
  }, [goHome, targetAccountProxy]);

  if (!targetAccountProxy) {
    return (
      <></>
    );
  }

  return (
    <PageWrapper
      className={CN(className, '-mobile')}
      resolve={dataContext.awaitStores(['swap', 'price'])}
    >
      <Component targetAccountProxy={targetAccountProxy} />
    </PageWrapper>
  );
};

const Swap = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return {
    '.__fee-paid-wrapper': {
      color: token.colorTextTertiary,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer'
    },
    '.__xcm-notification, .__assethub-notification': {
      marginBottom: token.marginSM
    },
    '.__provider-name': {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    },
    '.__quote-rate .__label-col': {
      flex: '0 1 auto'
    },
    '.__swap-quote': {
      marginRight: -8
    },
    '.__fee-paid-token': {
      display: 'flex',
      alignItems: 'center'
    },
    '.__fee-paid-token-symbol': {
      paddingLeft: 8,
      color: token.colorWhite
    },
    '.__quote-icon-info': {
      fontSize: 16,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    '.__swap-provider .__value ': {
      display: 'flex',
      gap: 8,
      justifyContent: 'flex-end',
      alignSelf: 'stretch',
      overflow: 'hidden'
    },
    '.ant-background-icon': {
      width: 24,
      height: 24
    },
    '.__view-quote-button': {
      paddingLeft: 0,
      paddingRight: 0,
      color: token.colorTextTertiary
    },
    '.__minimum-received-label': {
      display: 'flex',
      cursor: 'pointer'
    },
    '.__view-quote-button > span+.anticon': {
      marginInlineStart: 0,
      width: 40
    },

    '.__view-quote-button:hover': {
      color: token.colorWhite
    },

    '.__slippage-action-wrapper': {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      color: token.colorSuccess
    },
    '.__slippage-action': {
      cursor: 'pointer',
      alignItems: 'center',
      display: 'flex'
    },
    '.__quote-reset-time': {
      color: token.colorWarningText,
      display: 'flex',
      justifyContent: 'flex-end',
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      marginTop: token.marginXXS,
      fontSize: token.fontSize,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },
    '.__slippage-editor-button': {
      paddingLeft: token.paddingXXS
    },
    '.__estimated-fee-button': {
      paddingLeft: token.paddingXXS
    },
    '.__edit-token': {
      paddingLeft: token.paddingXXS
    },

    '.free-balance': {
      marginBottom: token.marginSM
    },

    // swap quote
    '.__quote-estimate-swap-value': {
      display: 'flex'
    },
    '.__quote-rate .__value': {
      fontSize: token.fontSize,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight,
      color: token.colorWhite
    },
    '.__swap-provider .__value': {
      fontSize: token.fontSize,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight,
      color: token.colorWhite
    },

    '.__quote-info-block, .__quote-fee-info-block': {
      paddingLeft: 24,
      paddingRight: 24,
      paddingTop: 16,
      paddingBottom: 16
    },

    '.__quote-empty-block': {
      background: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      paddingBottom: token.paddingLG,
      paddingLeft: token.paddingLG,
      paddingRight: token.paddingLG,
      paddingTop: token.paddingXL,
      textAlign: 'center',
      gap: token.size,
      minHeight: 184
    },

    '.__quote-empty-icon-wrapper': {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: token.margin
    },

    '.__quote-empty-icon': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: 64,
      height: 64,
      position: 'relative',

      '&:before': {
        content: "''",
        position: 'absolute',
        inset: 0,
        borderRadius: '100%',
        backgroundColor: token['gray-4'],
        opacity: 0.1,
        zIndex: 0
      },

      '.anticon': {
        position: 'relative',
        zIndex: 1,
        color: token.colorTextLight3
      }
    },

    '.__quote-empty-icon.-error': {
      '&:before': {
        backgroundColor: token.colorError
      },

      '.anticon': {
        color: token.colorError
      }
    },

    '.__quote-empty-message': {
      color: token.colorWhite,
      fontSize: token.fontSize,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },

    '.__quote-empty-message.-loading': {
      color: token.colorTextLight4
    },

    '.__total-fee-value': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.bodyFontWeight,
      color: token.colorTextLight2,

      '.ant-number-integer': {
        color: `${token.colorTextLight2} !important`,
        fontSize: 'inherit !important',
        fontWeight: 'inherit !important',
        lineHeight: 'inherit'
      },

      '.ant-number-decimal, .ant-number-prefix': {
        color: `${token.colorTextLight2} !important`,
        fontSize: `${token.fontSize}px !important`,
        fontWeight: 'inherit !important',
        lineHeight: token.colorTextLight2
      }
    },
    '.__quote-fee-details-block': {
      marginTop: token.marginXS,
      paddingLeft: token.paddingXS,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.bodyFontWeight,
      color: token.colorWhite,

      '.ant-number-integer': {
        color: `${token.colorWhite} !important`,
        fontSize: 'inherit !important',
        fontWeight: 'inherit !important',
        lineHeight: 'inherit'
      },

      '.ant-number-decimal, .ant-number-prefix': {
        color: `${token.colorWhite} !important`,
        fontSize: `${token.fontSize}px !important`,
        fontWeight: 'inherit !important',
        lineHeight: token.colorTextLight2
      }
    },
    '.__separator': {
      height: 2,
      opacity: 0.8,
      backgroundColor: token.colorBgBorder,
      marginTop: 12,
      marginBottom: 12
    },

    '.__quote-header-wrapper': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
      marginTop: -7
    },
    '.__header-left-part': {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    },

    '.__header-right-part': {
      display: 'flex',
      alignItems: 'center'
    },

    '.__transaction-form-area .ant-form-item': {
      marginBottom: 12
    },

    '.__token-selector-wrapper .ant-select-modal-input-wrapper': {
      color: token.colorWhite,
      paddingLeft: 16
    },
    '.__token-selector-wrapper': {
      flex: 1,
      overflow: 'hidden',
      minWidth: 160,
      maxWidth: 182
    },
    '.__minimum-received': {
      marginTop: 12
    },
    '.__minimum-received .__label-col': {
      fontSize: 14,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight,
      color: token.colorTextTertiary
    },
    '.__minimum-received .__value': {
      fontSize: 14,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight,
      color: token.colorWhite
    },
    '.__slippage-title-wrapper': {
      display: 'flex',
      alignItems: 'center'
    },

    '.__switch-side-container': {
      position: 'relative',
      '.__switch-button': {
        position: 'absolute',
        backgroundColor: token['gray-2'],
        borderRadius: '50%',
        alignItems: 'center',
        bottom: -16,
        marginLeft: -20,
        left: '50%',
        display: 'flex',
        justifyContent: 'center'
      }
    },

    // desktop

    '.web-ui-enable &': {
      // todo: use react solution, not CSS, to hide the back button
      '.title-group .ant-btn': {
        display: 'none'
      }
    },

    '&.-desktop': {
      display: 'flex',
      flexDirection: 'row',
      maxWidth: 784,
      width: '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
      gap: token.size,

      '.__transaction-form-area': {
        overflowX: 'hidden',
        flex: 1,
        transition: 'transform 0.3s ease-in-out'
      },

      '.__transaction-form-area .transaction-footer': {
        paddingTop: 0,
        paddingBottom: 0,
        paddingRight: 0,
        paddingLeft: 0
      },
      '.__transaction-form-area .transaction-content': {
        paddingRight: 0,
        paddingLeft: 0
      },

      '.__transaction-swap-quote-info-area': {
        overflowX: 'hidden',
        flex: 1,
        transition: 'transform 0.3s ease-out, opacity 0.6s ease-out',
        transitionDelay: '0.1s'
      },
      '.__transaction-swap-quote-info-area.-init-animation': {
        transform: 'translateX(-10%)',
        opacity: 0,
        zIndex: 1,
        pointerEvents: 'none'
      },
      '.__transaction-form-area.-init-animation': {
        transform: 'translateX(50%)',
        zIndex: 2
      },
      '.__slippage-action-wrapper': {
        marginBottom: 24
      },
      '.__quote-fee-info-block': {
        marginTop: token.margin
      },

      // todo: temporary CSS (need update)
      '.__request-user-interact-container': {
        alignSelf: 'flex-start',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        textAlign: 'center',
        height: 300,
        justifyContent: 'center'
      }
    },

    // mobile

    '&.-mobile': {
      overflow: 'auto',
      height: '100%',

      '.__transaction-form-area': {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      },

      '.__quote-reset-time': {
        marginBottom: 0,
        alignItems: 'center',
        marginTop: 0,
        paddingLeft: 0
      },
      '.transaction-footer': {
        paddingTop: 16
      },
      '.__slippage-action-wrapper': {
        fontSize: 14,
        fontWeight: token.bodyFontWeight,
        lineHeight: token.lineHeight
      },
      '.__view-quote-detail-action-wrapper': {
        display: 'flex',
        justifyContent: 'space-between'
      },
      '.__view-quote-detail-button': {
        paddingRight: 0
      },
      '.__swap-route.__row': {
        marginTop: 8
      },
      '.__quote-fee-info-block': {
        marginTop: 16
      },
      '.__quote-info-block': {
        marginBottom: 4
      },
      '.__error-message': {
        color: token.colorError,
        fontSize: token.fontSize,
        fontWeight: token.bodyFontWeight,
        lineHeight: token.lineHeight,
        marginTop: -token.marginXXS,
        paddingBottom: token.padding
      },
      '.__quote-and-slippage': {
        display: 'flex',
        justifyContent: 'space-between'
      },
      '.__transaction-swap-quote-info-area': {
        paddingLeft: token.padding,
        paddingRight: token.padding
      }
    }
  };
});

export default Swap;
