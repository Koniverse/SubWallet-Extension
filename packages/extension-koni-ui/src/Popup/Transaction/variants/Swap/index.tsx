// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainStatus } from '@subwallet/chain-list/types';
import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { ExtrinsicType, NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { validateRecipientAddress } from '@subwallet/extension-base/core/logic-validation/recipientAddress';
import { ActionType } from '@subwallet/extension-base/core/types';
import { AcrossErrorMsg } from '@subwallet/extension-base/services/balance-service/transfer/xcm/acrossBridge';
import { _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { _getAssetDecimals, _getAssetOriginChain, _getAssetSymbol, _getChainName, _getMultiChainAsset, _getOriginChainOfAsset, _isAssetFungibleToken, _isChainEvmCompatible, _isChainInfoCompatibleWithAccountInfo, _parseAssetRefKey } from '@subwallet/extension-base/services/chain-service/utils';
import { KyberSwapQuoteMetadata } from '@subwallet/extension-base/services/swap-service/handler/kyber-handler';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { AccountChainType, AccountProxy, AccountProxyType, AnalyzedGroup, CommonOptimalSwapPath, ProcessType, SwapRequestResult, SwapRequestV2 } from '@subwallet/extension-base/types';
import { CHAINFLIP_SLIPPAGE, SIMPLE_SWAP_SLIPPAGE, SlippageType, SwapProviderId, SwapQuote } from '@subwallet/extension-base/types/swap';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
import { AccountAddressSelector, AddressInputNew, AddressInputRef, AlertBox, EmptyList, HiddenInput, LoadingScreen, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { SwapFromField, SwapToField } from '@subwallet/extension-koni-ui/components/Field/Swap';
import { ChooseFeeTokenModal, SlippageModal, SwapIdleWarningModal, SwapQuotesSelectorModal, SwapTermsOfServiceModal } from '@subwallet/extension-koni-ui/components/Modal/Swap';
import { ADDRESS_INPUT_AUTO_FORMAT_VALUE, BN_TEN, BN_ZERO, CONFIRM_SWAP_TERM, SWAP_ALL_QUOTES_MODAL, SWAP_CHOOSE_FEE_TOKEN_MODAL, SWAP_IDLE_WARNING_MODAL, SWAP_SLIPPAGE_MODAL, SWAP_TERMS_OF_SERVICE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useChainConnection, useCoreCreateReformatAddress, useCreateGetChainAndExcludedTokenByAccountProxy, useDefaultNavigate, useGetAccountTokenBalance, useGetBalance, useHandleSubmitMultiTransaction, useNotification, useOneSignProcess, usePreCheckAction, useSelector, useSetCurrentPage, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { ChainAndExcludedTokenInfo } from '@subwallet/extension-koni-ui/hooks/chain/useCreateGetChainAndExcludedTokenByAccountProxy';
import { submitProcess } from '@subwallet/extension-koni-ui/messaging';
import { handleSwapRequestV2, handleSwapStep, validateSwapProcess } from '@subwallet/extension-koni-ui/messaging/transaction/swap';
import { FreeBalance, TransactionContent, TransactionFooter } from '@subwallet/extension-koni-ui/Popup/Transaction/parts';
import EmptySwapPairs from '@subwallet/extension-koni-ui/Popup/Transaction/variants/Swap/EmptySwapPairs';
import { CommonActionType, commonProcessReducer, DEFAULT_COMMON_PROCESS } from '@subwallet/extension-koni-ui/reducer';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AccountAddressItemType, FormCallbacks, FormFieldData, SwapParams, ThemeProps, TokenBalanceItemType } from '@subwallet/extension-koni-ui/types';
import { TokenSelectorItemType } from '@subwallet/extension-koni-ui/types/field';
import { convertFieldToObject, findAccountByAddress, isAccountAll, SortableTokenItem, sortTokensByBalanceInSelector } from '@subwallet/extension-koni-ui/utils';
import { Button, Form, Icon, ModalContext } from '@subwallet/react-ui';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { ArrowsDownUp, Book, CheckCircle, MagnifyingGlass } from 'phosphor-react';
import { Rule } from 'rc-field-form/lib/interface';
import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIdleTimer } from 'react-idle-timer';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { isEthereumAddress } from '@polkadot/util-crypto';

import { QuoteInfoArea } from './QuoteInfoArea';

type WrapperProps = ThemeProps;

type ComponentProps = {
  targetAccountProxy: AccountProxy;
  pairMap: Record<string, string[]>;
  defaultSlug: string;
  swappableSlugsSet: Set<string>;
  allowedChainAndExcludedTokenForTargetAccountProxy: ChainAndExcludedTokenInfo;
};

type SortableTokenSelectorItemType = TokenSelectorItemType & SortableTokenItem;

const hideFields: Array<keyof SwapParams> = ['fromAmount', 'fromTokenSlug', 'toTokenSlug', 'chain', 'fromAccountProxy'];

function getTokenSelectorItem (
  assetItem: _ChainAsset[],
  tokenBalanceMap: Record<string, TokenBalanceItemType | undefined>,
  chainState: Record<string, _ChainState>
): SortableTokenSelectorItemType[] {
  const result: SortableTokenSelectorItemType[] = [];

  assetItem.forEach((asset) => {
    const slug = asset.slug;
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
        currency: tokenBalanceInfo.currency,
        isTestnet: tokenBalanceInfo.isTestnet
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

// todo: recheck validation logic, especially recipientAddress

const Component = ({ allowedChainAndExcludedTokenForTargetAccountProxy, defaultSlug, pairMap, swappableSlugsSet, targetAccountProxy }: ComponentProps) => {
  useSetCurrentPage('/transaction/swap');
  const { t } = useTranslation();
  const notify = useNotification();
  const { closeAlert, defaultData, openAlert, persistData } = useTransactionContext<SwapParams>();

  const { activeModal, inactiveAll, inactiveModal } = useContext(ModalContext);

  const { accountProxies, accounts, isAllAccount } = useSelector((state) => state.accountState);
  const assetRegistryMap = useSelector((state) => state.assetRegistry.assetRegistry);
  const { priceMap } = useSelector((state) => state.price);
  const { chainInfoMap, chainStateMap, ledgerGenericAllowNetworks } = useSelector((root) => root.chainStore);
  const hasInternalConfirmations = useSelector((state: RootState) => state.requestState.hasInternalConfirmations);
  const priorityTokens = useSelector((root: RootState) => root.chainStore.priorityTokens);
  const [form] = Form.useForm<SwapParams>();
  const formDefault = useMemo((): SwapParams => ({ ...defaultData }), [defaultData]);

  const [quoteOptions, setQuoteOptions] = useState<SwapQuote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<SwapQuote | undefined>(undefined);
  const [isSwapQuotesSelectorModalVisible, setIsSwapQuotesSelectorModalVisible] = useState<boolean>(false);
  const [isSlippageModalVisible, setIsSlippageModalVisible] = useState<boolean>(false);

  const [quoteAliveUntil, setQuoteAliveUntil] = useState<number | undefined>(undefined);
  const [currentQuoteRequest, setCurrentQuoteRequest] = useState<SwapRequestV2 | undefined>(undefined);
  const [feeOptions, setFeeOptions] = useState<string[] | undefined>([]);
  const [currentFeeOption, setCurrentFeeOption] = useState<string | undefined>(undefined);
  const [currentSlippage, setCurrentSlippage] = useState<SlippageType>({ slippage: new BigN(0.01), isCustomType: true });
  const [preferredProvider, setPreferredProvider] = useState<SwapProviderId | undefined>(undefined);

  const [swapError, setSwapError] = useState<SwapError|undefined>(undefined);
  const [isFormInvalid, setIsFormInvalid] = useState<boolean>(false);
  const [currentOptimalSwapPath, setOptimalSwapPath] = useState<CommonOptimalSwapPath | undefined>(undefined);

  const [confirmedTerm, setConfirmedTerm] = useLocalStorage(CONFIRM_SWAP_TERM, '');
  const [showQuoteArea, setShowQuoteArea] = useState<boolean>(false);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [handleRequestLoading, setHandleRequestLoading] = useState(true);
  const [requestUserInteractToContinue, setRequestUserInteractToContinue] = useState<boolean>(false);
  const [isRecipientFieldManuallyVisible, setIsRecipientFieldManuallyVisible] = useState<boolean>(false);

  const continueRefreshQuoteRef = useRef<boolean>(false);

  const [autoFormatValue] = useLocalStorage(ADDRESS_INPUT_AUTO_FORMAT_VALUE, false);

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

  const addressInputRef = useRef<AddressInputRef>(null);
  const isAddressInputReady = !!addressInputRef.current?.ready;

  // @ts-ignore
  const fromValue = useWatchTransaction('from', form, defaultData);
  const fromAmountValue = useWatchTransaction('fromAmount', form, defaultData);
  const fromTokenSlugValue = useWatchTransaction('fromTokenSlug', form, defaultData);
  const toTokenSlugValue = useWatchTransaction('toTokenSlug', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);
  const recipientValue = useWatchTransaction('recipient', form, defaultData);

  const availableBalanceHookResult = useGetBalance(chainValue, fromValue, fromTokenSlugValue, true, ExtrinsicType.SWAP);

  const [swapFromFieldRenderKey, setSwapFromFieldRenderKey] = useState<string>('SwapFromField');

  const currentFromTokenAvailableBalance = useMemo(() => {
    if (!fromTokenSlugValue || availableBalanceHookResult.isLoading || !availableBalanceHookResult.nativeTokenSlug) {
      return undefined;
    }

    if (availableBalanceHookResult.nativeTokenSlug !== fromTokenSlugValue) {
      return availableBalanceHookResult.tokenBalance;
    }

    return availableBalanceHookResult.nativeTokenBalance;
  }, [availableBalanceHookResult.isLoading, availableBalanceHookResult.nativeTokenBalance, availableBalanceHookResult.nativeTokenSlug, availableBalanceHookResult.tokenBalance, fromTokenSlugValue]);

  const { checkChainConnected, turnOnChain } = useChainConnection();

  const preCheckMessage = useMemo(() => {
    if (!fromTokenSlugValue) {
      return undefined;
    }

    const chainAsset = assetRegistryMap[fromTokenSlugValue];
    const chainSlug = _getAssetOriginChain(chainAsset);
    const chainName = _getChainName(chainInfoMap[chainSlug]);

    return t('ui.TRANSACTION.screen.Transaction.Swap.tokenNotSupportedForSwap', { replace: {
      symbol: _getAssetSymbol(chainAsset),
      chainName
    } });
  }, [assetRegistryMap, chainInfoMap, fromTokenSlugValue, t]);

  const onPreCheck = usePreCheckAction(fromValue, undefined, preCheckMessage);
  const oneSign = useOneSignProcess(fromValue);
  const getReformatAddress = useCoreCreateReformatAddress();

  const [processState, dispatchProcessState] = useReducer(commonProcessReducer, DEFAULT_COMMON_PROCESS);
  const { onError, onSuccess } = useHandleSubmitMultiTransaction(dispatchProcessState);

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

  // todo: Optimize assetItems filtering for improved performance. Utilize swappableSlugsSet or pairMap instead of using the whole assetRegistryMap
  const assetItems = useMemo<_ChainAsset[]>(() => {
    const result: _ChainAsset[] = [];

    Object.values(assetRegistryMap).forEach((chainAsset) => {
      if (!_isAssetFungibleToken(chainAsset)) {
        return;
      }

      const chainSlug = chainAsset.originChain;

      if (chainInfoMap[chainSlug]?.chainStatus === _ChainStatus.ACTIVE) {
        result.push(chainAsset);
      }
    });

    return result;
  }, [assetRegistryMap, chainInfoMap]);

  const getAccountTokenBalance = useGetAccountTokenBalance();

  const tokenSelectorItems = useMemo<TokenSelectorItemType[]>(() => {
    const result = getTokenSelectorItem(assetItems, getAccountTokenBalance(assetItems, targetAccountProxyIdForGetBalance), chainStateMap);

    sortTokensByBalanceInSelector(result, priorityTokens);

    return result;
  }, [assetItems, chainStateMap, getAccountTokenBalance, priorityTokens, targetAccountProxyIdForGetBalance]);

  const isTokenCompatibleWithTargetAccountProxy = useCallback((tokenSlug: string): boolean => {
    if (!tokenSlug) {
      return false;
    }

    const chainSlug = _getOriginChainOfAsset(tokenSlug);

    const { allowedChains, excludedTokens } = allowedChainAndExcludedTokenForTargetAccountProxy;

    return allowedChains.includes(chainSlug) && !excludedTokens.includes(tokenSlug);
  }, [allowedChainAndExcludedTokenForTargetAccountProxy]);

  const fromTokenItems = useMemo<TokenSelectorItemType[]>(() => {
    return tokenSelectorItems.filter((item) => {
      const slug = item.slug;
      const assetInfo = assetRegistryMap[slug];

      if (!swappableSlugsSet.has(slug) || !assetInfo || !isTokenCompatibleWithTargetAccountProxy(slug)) {
        return false;
      }

      // todo: improve by checking once and returning the list
      if (!defaultSlug) {
        return true;
      }

      return defaultSlug === slug || _getMultiChainAsset(assetInfo) === defaultSlug;
    });
  }, [assetRegistryMap, defaultSlug, swappableSlugsSet, isTokenCompatibleWithTargetAccountProxy, tokenSelectorItems]);

  const toTokenItems = useMemo(() => {
    const destinationSlugs = pairMap[fromTokenSlugValue] || [];

    if (destinationSlugs.length === 0) {
      return [];
    }

    const destinationSlugSet = new Set(destinationSlugs);

    return tokenSelectorItems.filter((item) => destinationSlugSet.has(item.slug));
  }, [fromTokenSlugValue, tokenSelectorItems, pairMap]);

  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[fromTokenSlugValue] || undefined;
  }, [assetRegistryMap, fromTokenSlugValue]);

  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[toTokenSlugValue] || undefined;
  }, [assetRegistryMap, toTokenSlugValue]);

  const destChainValue = _getAssetOriginChain(toAssetInfo);

  const isSwitchable = useMemo(() => {
    return isTokenCompatibleWithTargetAccountProxy(toTokenSlugValue);
  }, [isTokenCompatibleWithTargetAccountProxy, toTokenSlugValue]);

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

  const toggleAddressInputManually = useCallback(() => {
    setIsRecipientFieldManuallyVisible(true);
  }, []);

  const isNotShowAccountSelector = !isAllAccount && accountAddressItems.length < 2;

  const isRecipientFieldAllowed = useMemo(() => {
    if (!fromValue || !destChainValue || !chainInfoMap[destChainValue]) {
      return false;
    }

    // todo: convert this find logic to util
    const fromAccountJson = accounts.find((account) => isSameAddress(account.address, fromValue));

    if (!fromAccountJson) {
      return false;
    }

    return !_isChainInfoCompatibleWithAccountInfo(chainInfoMap[destChainValue], fromAccountJson);
  }, [accounts, chainInfoMap, destChainValue, fromValue]);

  const recipientAddressValidator = useCallback((rule: Rule, _recipientAddress: string): Promise<void> => {
    if (!isRecipientFieldAllowed) {
      return Promise.resolve();
    }

    const { chain, from, toTokenSlug } = form.getFieldsValue();
    const destChain = assetRegistryMap[toTokenSlug].originChain;
    const destChainInfo = chainInfoMap[destChain];
    const account = findAccountByAddress(accounts, _recipientAddress);

    return validateRecipientAddress({ srcChain: chain,
      destChainInfo,
      fromAddress: from,
      assetInfo: toAssetInfo,
      toAddress: _recipientAddress,
      account,
      actionType: ActionType.SWAP,
      autoFormatValue,
      allowLedgerGenerics: ledgerGenericAllowNetworks });
  }, [accounts, assetRegistryMap, autoFormatValue, chainInfoMap, form, isRecipientFieldAllowed, ledgerGenericAllowNetworks, toAssetInfo]);

  const onSelectFromToken = useCallback((tokenSlug: string) => {
    form.setFieldValue('fromTokenSlug', tokenSlug);
  }, [form]);

  const onSelectToToken = useCallback((tokenSlug: string) => {
    form.setFieldValue('toTokenSlug', tokenSlug);
  }, [form]);

  const updateSwapStates = useCallback((rs: SwapRequestResult) => {
    setOptimalSwapPath(rs.process);
    setQuoteOptions(rs.quote.quotes);
    setCurrentQuote(rs.quote.optimalQuote);
    setQuoteAliveUntil(rs.quote.aliveUntil);
    setFeeOptions(rs.quote.optimalQuote?.feeInfo?.feeOptions || []);
    setCurrentFeeOption(rs.quote.optimalQuote?.feeInfo?.feeOptions?.[0]);
    setSwapError(rs.quote.error);
  }, []);

  const notifyNoQuote = useCallback(() => {
    notify({
      message: t('ui.TRANSACTION.screen.Transaction.Swap.swapPairNotSupportedTryAnother'),
      type: 'error',
      duration: 5
    });
  }, [notify, t]);

  const notifyTooLowAmount = useCallback(() => {
    notify({
      message: t('ui.TRANSACTION.screen.Transaction.Swap.amountTooLow'),
      type: 'error',
      duration: 5
    });
  }, [notify, t]);

  const notifyTooHighAmount = useCallback(() => {
    notify({
      message: t('ui.TRANSACTION.screen.Transaction.Swap.amountTooHigh'),
      type: 'error',
      duration: 5
    });
  }, [notify, t]);

  const onConfirmSelectedQuote = useCallback(
    async (quote: SwapQuote) => {
      setPreferredProvider(quote.provider.id);

      return Promise.resolve();
    },
    []
  );

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

  const canShowAvailableBalance = useMemo(() => {
    if (fromValue && chainValue && chainInfoMap[chainValue]) {
      return isEthereumAddress(fromValue) === _isChainEvmCompatible(chainInfoMap[chainValue]);
    }

    return false;
  }, [fromValue, chainValue, chainInfoMap]);

  const onConfirmStillThere = useCallback(() => {
    inactiveModal(SWAP_IDLE_WARNING_MODAL);
    setHandleRequestLoading(true);
    setRequestUserInteractToContinue(false);
    continueRefreshQuoteRef.current = true;
  }, [inactiveModal]);

  const isChainConnected = useMemo(() => {
    return checkChainConnected(chainValue);
  }, [chainValue, checkChainConnected]);

  const onSubmit: FormCallbacks<SwapParams>['onFinish'] = useCallback((values: SwapParams) => {
    if (chainValue && !checkChainConnected(chainValue)) {
      openAlert({
        title: t('ui.TRANSACTION.screen.Transaction.Swap.payAttentionExclamation'),
        type: NotificationType.ERROR,
        content: t('ui.TRANSACTION.screen.Transaction.Swap.selectedNetworkMightLostConnection'),
        okButton: {
          text: t('ui.TRANSACTION.screen.Transaction.Swap.iUnderstand'),
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
      notifyNoQuote();

      return;
    }

    const account = findAccountByAddress(accounts, values.from);

    if (account?.isHardware) {
      notify({
        message: t('ui.TRANSACTION.screen.Transaction.Swap.featureNotAvailableForLedger'),
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
              currentStep: 0,
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
            if (oneSign && currentOptimalSwapPath.steps.length > 2) {
              const submitPromise: Promise<SWTransactionResponse> = submitProcess({
                address: from,
                id: processId,
                type: ProcessType.SWAP,
                request: {
                  cacheProcessId: processId,
                  process: currentOptimalSwapPath,
                  currentStep: step,
                  quote: currentQuote,
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
                quote: currentQuote,
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
      const metadata = currentQuote.metadata as KyberSwapQuoteMetadata;
      const isHighPriceImpact = metadata?.priceImpact;

      openAlert({
        title: isHighPriceImpact ? t('ui.TRANSACTION.screen.Transaction.Swap.highPriceImpact') : t('ui.TRANSACTION.screen.Transaction.Swap.payAttentionExclamation'),
        type: NotificationType.WARNING,
        content: isHighPriceImpact && metadata.priceImpact
          ? t('ui.TRANSACTION.screen.Transaction.Swap.highPriceImpactWarning', { replace: { priceImpact: metadata.priceImpact } })
          : t('ui.TRANSACTION.screen.Transaction.Swap.lowLiquidityWarning'),
        okButton: {
          text: t('ui.TRANSACTION.screen.Transaction.Swap.continue'),
          onClick: () => {
            closeAlert();
            transactionBlockProcess();
          },
          icon: CheckCircle
        },
        cancelButton: {
          text: t('ui.TRANSACTION.screen.Transaction.Swap.cancel'),
          schema: 'secondary',
          onClick: closeAlert
        }
      });
    } else {
      transactionBlockProcess();
    }
  }, [accounts, chainValue, checkChainConnected, closeAlert, currentOptimalSwapPath, currentQuote, isChainConnected, notify, notifyNoQuote, onError, onSuccess, oneSign, openAlert, processState.currentStep, processState.processId, processState.steps.length, slippage, swapError, t]);

  const onAfterConfirmTermModal = useCallback(() => {
    return setConfirmedTerm('swap-term-confirmed');
  }, [setConfirmedTerm]);

  const openSwapQuotesModal = useCallback(() => {
    setIsSwapQuotesSelectorModalVisible(true);
    activeModal(SWAP_ALL_QUOTES_MODAL);
  }, [activeModal]);

  const closeSwapQuotesModal = useCallback(() => {
    inactiveModal(SWAP_ALL_QUOTES_MODAL);
    setIsSwapQuotesSelectorModalVisible(false);
  }, [inactiveModal]);

  const openSlippageModal = useCallback(() => {
    setIsSlippageModalVisible(true);
    activeModal(SWAP_SLIPPAGE_MODAL);
  }, [activeModal]);

  const closeSlippageModal = useCallback(() => {
    inactiveModal(SWAP_SLIPPAGE_MODAL);
    setIsSlippageModalVisible(false);
  }, [inactiveModal]);

  const onSelectFeeOption = useCallback((slug: string) => {
    setCurrentFeeOption(slug);
  }, []);

  const onSelectSlippage = useCallback((slippage: SlippageType) => {
    setCurrentSlippage(slippage);
  }, []);

  const onClickMaxAmountButton = useCallback(() => {
    if (!currentFromTokenAvailableBalance) {
      return;
    }

    const result = new BigN(currentFromTokenAvailableBalance.value).multipliedBy(92).dividedToIntegerBy(100).toFixed();

    onChangeAmount(result);
    setSwapFromFieldRenderKey(`SwapFromField-${Date.now()}`);
  }, [currentFromTokenAvailableBalance, onChangeAmount]);

  const renderWhenEmpty = useCallback(() => {
    return (
      <EmptyList
        emptyMessage={t('ui.TRANSACTION.screen.Transaction.Swap.noAccountsForSwapPair')}
        emptyTitle={t('ui.TRANSACTION.screen.Transaction.Swap.noAccountsFound')}
        phosphorIcon={MagnifyingGlass}
      />
    );
  }, [t]);

  const onClickHaftAmountButton = useCallback(() => {
    if (!currentFromTokenAvailableBalance) {
      return;
    }

    const result = new BigN(currentFromTokenAvailableBalance.value).dividedToIntegerBy(2).toFixed();

    onChangeAmount(result);
    setSwapFromFieldRenderKey(`SwapFromField-${Date.now()}`);
  }, [currentFromTokenAvailableBalance, onChangeAmount]);

  useEffect(() => {
    if (!currentQuote) {
      setIsSwapQuotesSelectorModalVisible(false);
    }
  }, [currentQuote]);

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

  const recipientAutoFilledInfo: string | undefined = useMemo(() => {
    if (!isRecipientFieldAllowed || targetAccountProxy.accountType !== AccountProxyType.UNIFIED) {
      return undefined;
    }

    const destChainInfo = chainInfoMap[destChainValue];

    if (!destChainInfo) {
      return undefined;
    }

    const accountJsonForRecipientAutoFilled = targetAccountProxy.accounts.find((accountInfo) => {
      if (accountInfo.chainType === AccountChainType.BITCOIN) {
        const isSegWit = accountInfo.type === 'bitcoin-84' || accountInfo.type === 'bittest-84';

        return isSegWit && _isChainInfoCompatibleWithAccountInfo(destChainInfo, accountInfo);
      }

      return _isChainInfoCompatibleWithAccountInfo(destChainInfo, accountInfo);
    });

    if (!accountJsonForRecipientAutoFilled) {
      return undefined;
    }

    const formatedAddress = getReformatAddress(accountJsonForRecipientAutoFilled, destChainInfo);

    if (!formatedAddress) {
      return undefined;
    }

    return JSON.stringify({
      address: formatedAddress,
      name: accountJsonForRecipientAutoFilled.name
    });
  }, [chainInfoMap, destChainValue, getReformatAddress, isRecipientFieldAllowed, targetAccountProxy.accountType, targetAccountProxy.accounts]);

  useEffect(() => {
    if (fromTokenSlugValue && toTokenSlugValue && isAddressInputReady) {
      const addressInputCurrent = addressInputRef.current;

      // The following code automatically fills the recipient field in specific cases
      if (recipientAutoFilledInfo) {
        try {
          setIsRecipientFieldManuallyVisible(false);
          const { address, name } = JSON.parse(recipientAutoFilledInfo) as {
            address: string,
            name: string
          };

          addressInputCurrent?.setInputValue?.(address);
          addressInputCurrent?.setSelectedOption?.({
            address,
            formatedAddress: address,
            analyzedGroup: AnalyzedGroup.RECENT,
            displayName: name
          });
          form.setFieldValue('recipient', address);
        } catch (e) {
          console.log('Parse recipientAutoFilledInfo error', e);
        }
      } else {
        addressInputCurrent?.setInputValue?.('');
        addressInputCurrent?.setSelectedOption?.(undefined);
        form.setFieldValue('recipient', undefined);
        form.setFields([
          {
            name: 'recipient',
            errors: []
          }
        ]);
      }
    }
  }, [recipientAutoFilledInfo, form, fromTokenSlugValue, toTokenSlugValue, isAddressInputReady]);

  useEffect(() => {
    const timeout: NodeJS.Timeout = setTimeout(() => {
      if (recipientValue && toAssetInfo && isRecipientFieldAllowed) {
        form.validateFields(['recipient']).catch((e) => {
          console.log('Error when validating', e);
        });
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [form, isRecipientFieldAllowed, recipientValue, toAssetInfo]);

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
        const fieldsToBeValidated: string[] = ['from'];

        if (isRecipientFieldAllowed) {
          fieldsToBeValidated.push('recipient');
        }

        form.validateFields(fieldsToBeValidated).then(() => {
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

          const currentRequest: SwapRequestV2 = {
            address: fromValue,
            pair: {
              slug: _parseAssetRefKey(fromTokenSlugValue, toTokenSlugValue),
              from: fromTokenSlugValue,
              to: toTokenSlugValue
            },
            fromAmount: fromAmountValue,
            slippage: currentSlippage.slippage.toNumber(),
            recipient: recipientValue || undefined,
            preferredProvider: preferredProvider
          };

          handleSwapRequestV2(currentRequest).then((result) => {
            if (sync) {
              setCurrentQuoteRequest(currentRequest);

              dispatchProcessState({
                payload: {
                  steps: result.process.steps,
                  feeStructure: result.process.totalFee
                },
                type: CommonActionType.STEP_CREATE
              });

              updateSwapStates(result);
              setHandleRequestLoading(false);
            }
          }).catch((e: Error) => {
            console.log('handleSwapRequest error', e);

            if (sync) {
              if (e.message.toLowerCase().startsWith('swap pair is not found')) {
                notifyNoQuote();
              }

              if (e.message.toLowerCase().startsWith(AcrossErrorMsg.AMOUNT_TOO_LOW)) {
                notifyTooLowAmount();
              }

              if (e.message.toLowerCase().startsWith(AcrossErrorMsg.AMOUNT_TOO_HIGH)) {
                notifyTooHighAmount();
              }

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
  }, [currentSlippage.slippage, form, fromAmountValue, fromTokenSlugValue, fromValue, isRecipientFieldAllowed, notifyTooHighAmount, notifyTooLowAmount, notifyNoQuote, preferredProvider, recipientValue, toTokenSlugValue, updateSwapStates]);

  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let timer: NodeJS.Timer | undefined;
    let sync = true;

    const refreshSwapRequestResult = () => {
      if (currentQuoteRequest) {
        if (sync) {
          setHandleRequestLoading(true);
        }

        handleSwapRequestV2(currentQuoteRequest).then((rs) => {
          if (sync) {
            updateSwapStates(rs);
          }
        }).catch((e: Error) => {
          console.log('Error when doing refreshSwapRequestResult', e);

          if (e.message.toLowerCase().startsWith('swap pair is not found')) {
            notifyNoQuote();
          }

          if (e.message.toLowerCase().startsWith(AcrossErrorMsg.AMOUNT_TOO_LOW)) {
            notifyTooLowAmount();
          }

          if (e.message.toLowerCase().startsWith(AcrossErrorMsg.AMOUNT_TOO_HIGH)) {
            notifyTooHighAmount();
          }
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
          refreshSwapRequestResult();
        }
      } else {
        if (continueRefreshQuoteRef.current) {
          continueRefreshQuoteRef.current = false;

          refreshSwapRequestResult();
        }
      }
    };

    timer = setInterval(updateQuoteHandler, 1000);

    updateQuoteHandler();

    return () => {
      sync = false;
      clearInterval(timer);
    };
  }, [currentQuoteRequest, hasInternalConfirmations, notifyTooHighAmount, notifyTooLowAmount, notifyNoQuote, quoteAliveUntil, requestUserInteractToContinue, updateSwapStates]);

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
      if (!fromTokenSlugValue || !fromTokenItems.some((i) => i.slug === fromTokenSlugValue)) {
        form.setFieldValue('fromTokenSlug', fromTokenItems[0].slug);
      }
    } else {
      form.setFieldValue('fromTokenSlug', '');
    }
  }, [form, fromTokenItems, fromTokenSlugValue]);

  useEffect(() => {
    const updateToTokenSlug = () => {
      if (!fromTokenSlugValue) {
        return;
      }

      if (toTokenItems.length) {
        if (!toTokenSlugValue || !toTokenItems.some((t) => t.slug === toTokenSlugValue)) {
          const nextValue = toTokenItems[0].slug;

          if (nextValue !== fromTokenSlugValue) {
            form.setFieldValue('toTokenSlug', nextValue);
          }
        }
      } else {
        form.setFieldValue('toTokenSlug', '');
      }
    };

    const timeout = setTimeout(updateToTokenSlug, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [form, fromTokenSlugValue, toTokenItems, toTokenSlugValue]);

  const altChain = useMemo(() => {
    // todo: fill logic to get altChain here

    return undefined;
  }, []);

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
        <TransactionContent>
          <div
            className={'__transaction-swap-wrapper'}
          >
            <Form
              className={'form-container form-space-xs'}
              form={form}
              initialValues={formDefault}
              onFieldsChange={onFieldsChange}
              onFinish={onSubmit}
            >
              <HiddenInput fields={hideFields} />

              <div className={'__swap-field-area'}>
                {
                  !!currentFromTokenAvailableBalance && (
                    <div className={'__quick-amount-buttons-area'}>
                      <Button
                        className={'__max-amount-button __quick-amount-button'}
                        onClick={onClickMaxAmountButton}
                        size='xs'
                        type={'ghost'}
                      >
                        {t('ui.TRANSACTION.screen.Transaction.Swap.max')}
                      </Button>

                      <Button
                        className={'__half-amount-button __quick-amount-button'}
                        onClick={onClickHaftAmountButton}
                        size='xs'
                        type={'ghost'}
                      >
                        50%
                      </Button>
                    </div>
                  )
                }

                <SwapFromField
                  amountValue={fromAmountValue}
                  className={'__swap-from-field'}
                  fromAsset={fromAssetInfo}
                  key={swapFromFieldRenderKey}
                  label={t('ui.TRANSACTION.screen.Transaction.Swap.from')}
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

                {
                  !!recipientAutoFilledInfo && !isRecipientFieldManuallyVisible && (
                    <div className='__address-input-toggle-container'>
                      <Button
                        className={'__address-input-toggle'}
                        icon={(
                          <Icon
                            customSize={'16px'}
                            phosphorIcon={Book}
                          />
                        )}
                        onClick={toggleAddressInputManually}
                        size='xs'
                        type={'ghost'}
                      >
                      </Button>
                    </div>
                  )
                }

                <SwapToField
                  className={'__swap-to-field'}
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
                  label={`${t('ui.TRANSACTION.screen.Transaction.Swap.from')}:`}
                  labelStyle={'horizontal'}
                  renderWhenEmpty={renderWhenEmpty}
                />
              </Form.Item>

              {defaultSlug && !fromAssetInfo && (
                <AlertBox
                  description={`No swap pair for this token found. Switch to ${networkName} account to see available swap pairs`}
                  title={'Pay attention!'}
                  type={'warning'}
                />
              )}

              <Form.Item
                hidden={!isRecipientFieldAllowed || (!!recipientAutoFilledInfo && !isRecipientFieldManuallyVisible)}
                name={'recipient'}
                rules={[
                  {
                    validator: recipientAddressValidator
                  }
                ]}
                statusHelpAsTooltip={true}
              >
                <AddressInputNew
                  actionType={ActionType.SWAP}
                  chainSlug={destChainValue}
                  dropdownHeight={isNotShowAccountSelector ? 227 : 167}
                  label={`${t('ui.TRANSACTION.screen.Transaction.Swap.to')}:`}
                  labelStyle={'horizontal'}
                  placeholder={t('ui.TRANSACTION.screen.Transaction.Swap.inputYourRecipientAccount')}
                  ref={addressInputRef}
                  showAddressBook={true}
                  showScanner={true}
                  tokenSlug={toTokenSlugValue}
                />
              </Form.Item>

              <div className={'__balance-display-area'}>
                <FreeBalance
                  address={fromValue}
                  chain={chainValue}
                  className={'__balance-display'}
                  extrinsicType={ExtrinsicType.SWAP}
                  hidden={!canShowAvailableBalance}
                  isSubscribe={true}
                  label={`${t('ui.TRANSACTION.screen.Transaction.Swap.availableBalance')}`}
                  labelTooltip={'Available balance for swap'}
                  tokenSlug={fromTokenSlugValue}
                />
              </div>
            </Form>

            {
              showQuoteArea && (
                <QuoteInfoArea
                  className={'__quote-info-area'}
                  currentOptimalSwapPath={currentOptimalSwapPath}
                  currentQuote={currentQuote}
                  estimatedFeeValue={estimatedFeeValue}
                  fromAssetInfo={fromAssetInfo}
                  handleRequestLoading={handleRequestLoading}
                  isFormInvalid={isFormInvalid}
                  openSlippageModal={openSlippageModal}
                  openSwapQuotesModal={openSwapQuotesModal}
                  quoteAliveUntil={quoteAliveUntil}
                  quoteOptions={quoteOptions}
                  slippage={slippage}
                  swapError={swapError}
                  toAssetInfo={toAssetInfo}
                />
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
            {t('ui.TRANSACTION.screen.Transaction.Swap.swap')}
          </Button>
        </TransactionFooter>
      </>

      <ChooseFeeTokenModal
        estimatedFee={estimatedFeeValue}
        items={feeOptions}
        modalId={SWAP_CHOOSE_FEE_TOKEN_MODAL}
        onSelectItem={onSelectFeeOption}
        selectedItem={currentFeeOption}
      />

      {isSlippageModalVisible && (
        <SlippageModal
          modalId={SWAP_SLIPPAGE_MODAL}
          onApplySlippage={onSelectSlippage}
          onCancel={closeSlippageModal}
          slippageValue={currentSlippage}
        />
      )}

      {
        isSwapQuotesSelectorModalVisible && (
          <SwapQuotesSelectorModal
            applyQuote={onConfirmSelectedQuote}
            disableConfirmButton={handleRequestLoading}
            items={quoteOptions}
            modalId={SWAP_ALL_QUOTES_MODAL}
            onCancel={closeSwapQuotesModal}
            quoteAliveUntil={quoteAliveUntil}
            selectedItem={currentQuote}
          />
        )
      }

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
  const assetRegistryMap = useSelector((state) => state.assetRegistry.assetRegistry);
  const [pairMap, setPairMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [isSkipDefaultSlug, setIsSkipDefaultSlug] = useState<boolean>(false);
  const getChainAndExcludedTokenByAccountProxy = useCreateGetChainAndExcludedTokenByAccountProxy();

  const targetAccountProxy = useMemo(() => {
    return accountProxies.find((ap) => {
      if (!defaultData.fromAccountProxy) {
        return isAccountAll(ap.id);
      }

      return ap.id === defaultData.fromAccountProxy;
    });
  }, [accountProxies, defaultData.fromAccountProxy]);

  const swappableSlugsSet: Set<string> = useMemo(() => new Set(Object.keys(pairMap).filter((key) => pairMap[key].length !== 0)), [pairMap]);
  const finalDefaultSlug = isSkipDefaultSlug ? '' : defaultData.defaultSlug;
  const allowedChainAndExcludedTokenForTargetAccountProxy = useMemo(() => {
    if (!targetAccountProxy) {
      return { allowedChains: [], excludedTokens: [] };
    }

    return getChainAndExcludedTokenByAccountProxy(targetAccountProxy);
  }, [getChainAndExcludedTokenByAccountProxy, targetAccountProxy]);

  const multiAssetOfAccountSwappable = useMemo(() => {
    const { allowedChains, excludedTokens } = allowedChainAndExcludedTokenForTargetAccountProxy;

    return Array.from(swappableSlugsSet).some((slug) => {
      const assetInfo = assetRegistryMap[slug];
      const multiChainAsset = _getMultiChainAsset(assetInfo);
      const originChain = _getAssetOriginChain(assetInfo);

      return (
        multiChainAsset === finalDefaultSlug &&
        allowedChains.includes(originChain) &&
        !excludedTokens.includes(slug)
      );
    });
  }, [allowedChainAndExcludedTokenForTargetAccountProxy, assetRegistryMap, finalDefaultSlug, swappableSlugsSet]);

  const isUnsupportedDefaultSlug = useMemo(() => {
    return (!!finalDefaultSlug &&
      !swappableSlugsSet.has(finalDefaultSlug) &&
      !multiAssetOfAccountSwappable);
  }, [finalDefaultSlug, multiAssetOfAccountSwappable, swappableSlugsSet]);

  const fetchDestinationsMap = useCallback(() => {
    setLoading(true);

    // todo: handle timeout
    subwalletApiSdk.swapApi.fetchDestinationsMap()
      .then((response) => {
        // simple validate
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format');
        }

        setPairMap(response);
        setFetchError(false);
        setLoading(false);
      })
      .catch((error: Error) => {
        console.error(`Error while fetching swap destinations: ${error.message}`);

        setFetchError(true);
        setLoading(false);
      });
  }, []);

  const handleReloadNotSupportDefault = useCallback(() => {
    setIsSkipDefaultSlug(true);
  }, []);

  useEffect(() => {
    if (!targetAccountProxy) {
      goHome();
    }
  }, [goHome, targetAccountProxy]);

  useEffect(() => {
    fetchDestinationsMap();
  }, [fetchDestinationsMap]);

  if (!targetAccountProxy) {
    return (
      <></>
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (fetchError) {
    return (
      <EmptySwapPairs
        onClickReload={fetchDestinationsMap}
      />
    );
  }

  if (isUnsupportedDefaultSlug) {
    return (
      <EmptySwapPairs
        onClickReload={handleReloadNotSupportDefault}
      />
    );
  }

  return (
    <PageWrapper
      className={CN(className)}
      resolve={dataContext.awaitStores(['price'])}
    >
      <Component
        allowedChainAndExcludedTokenForTargetAccountProxy={allowedChainAndExcludedTokenForTargetAccountProxy}
        defaultSlug={finalDefaultSlug}
        pairMap={pairMap}
        swappableSlugsSet={swappableSlugsSet}
        targetAccountProxy={targetAccountProxy}
      />
    </PageWrapper>
  );
};

const Swap = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return {
    flex: 1,
    overflowX: 'auto',
    display: 'flex',
    flexDirection: 'column',

    '.__transaction-form-area .ant-form-item': {
      marginBottom: 12
    },

    '.__quick-amount-buttons-area': {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'flex-end',
      height: 0,
      paddingRight: token.paddingXS
    },

    '.__quick-amount-button': {
      height: '36px',
      lineHeight: '36px',
      fontSize: token.fontSizeSM,
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      fontWeight: token.bodyFontWeight
    },

    '.__quick-amount-button.__quick-amount-button .ant-btn-content-wrapper': {
      fontSize: token.fontSizeSM
    },

    '.__swap-from-field': {
      marginBottom: token.marginXXS
    },

    '.__swap-field-area': {
      marginBottom: token.marginXS
    },

    '.__balance-display': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM
    },

    '.__quote-info-area': {
      marginTop: token.marginXS
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

    '.__address-input-toggle-container': {
      position: 'relative'
    },

    '.__address-input-toggle': {
      position: 'absolute',
      top: -2,
      right: 4
    },

    '.__address-input-toggle.-active': {
      color: token.colorTextLight1,
      cursor: 'not-allowed'
    }
  };
});

export default Swap;
