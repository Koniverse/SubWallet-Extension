// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { ExtrinsicType, NotificationType, TokenPriorityDetails } from '@subwallet/extension-base/background/KoniTypes';
import { validateRecipientAddress } from '@subwallet/extension-base/core/logic-validation/recipientAddress';
import { ActionType } from '@subwallet/extension-base/core/types';
import { _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { _getAssetDecimals, _getAssetOriginChain, _getMultiChainAsset, _isChainEvmCompatible, _parseAssetRefKey } from '@subwallet/extension-base/services/chain-service/utils';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { AccountProxy, AccountProxyType, ProcessType, SwapStepType } from '@subwallet/extension-base/types';
import { CommonOptimalPath } from '@subwallet/extension-base/types/service-base';
import { CHAINFLIP_SLIPPAGE, SIMPLE_SWAP_SLIPPAGE, SlippageType, SwapProviderId, SwapQuote, SwapRequest } from '@subwallet/extension-base/types/swap';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
import { AccountAddressSelector, AddressInputNew, AlertBox, HiddenInput, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { SwapFromField, SwapToField } from '@subwallet/extension-koni-ui/components/Field/Swap';
import { ChooseFeeTokenModal, SlippageModal, SwapIdleWarningModal, SwapQuotesSelectorModal, SwapTermsOfServiceModal } from '@subwallet/extension-koni-ui/components/Modal/Swap';
import { ADDRESS_INPUT_AUTO_FORMAT_VALUE, BN_TEN, BN_ZERO, CONFIRM_SWAP_TERM, SWAP_ALL_QUOTES_MODAL, SWAP_CHOOSE_FEE_TOKEN_MODAL, SWAP_IDLE_WARNING_MODAL, SWAP_SLIPPAGE_MODAL, SWAP_TERMS_OF_SERVICE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useChainConnection, useDefaultNavigate, useGetAccountTokenBalance, useHandleSubmitMultiTransaction, useNotification, useOneSignProcess, usePreCheckAction, useReformatAddress, useSelector, useSetCurrentPage, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { submitProcess } from '@subwallet/extension-koni-ui/messaging';
import { generateOptimalProcess, getLatestSwapQuote, handleSwapRequestV2, handleSwapStep, validateSwapProcess } from '@subwallet/extension-koni-ui/messaging/transaction/swap';
import { FreeBalance, TransactionContent, TransactionFooter } from '@subwallet/extension-koni-ui/Popup/Transaction/parts';
import { CommonActionType, commonProcessReducer, DEFAULT_COMMON_PROCESS } from '@subwallet/extension-koni-ui/reducer';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AccountAddressItemType, FormCallbacks, FormFieldData, SwapParams, ThemeProps, TokenBalanceItemType } from '@subwallet/extension-koni-ui/types';
import { TokenSelectorItemType } from '@subwallet/extension-koni-ui/types/field';
import { convertFieldToObject, findAccountByAddress, getChainsByAccountAll, isAccountAll, isChainInfoAccordantAccountChainType, isTokenAvailable, isTokenCompatibleWithAccountChainTypes, SortableTokenItem, sortTokenByPriority, sortTokenByValue } from '@subwallet/extension-koni-ui/utils';
import { Button, Form, Icon, ModalContext } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { ArrowsDownUp, CheckCircle } from 'phosphor-react';
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

// todo: recheck validation logic, especially recipientAddress

const Component = ({ targetAccountProxy }: ComponentProps) => {
  useSetCurrentPage('/transaction/swap');
  const { t } = useTranslation();
  const notify = useNotification();
  const { closeAlert, defaultData, openAlert, persistData, setBackProps, setCustomScreenTitle } = useTransactionContext<SwapParams>();

  const { activeModal, inactiveAll, inactiveModal } = useContext(ModalContext);

  const { accountProxies, accounts, isAllAccount } = useSelector((state) => state.accountState);
  const assetRegistryMap = useSelector((state) => state.assetRegistry.assetRegistry);
  const assetSettingMap = useSelector((state) => state.assetRegistry.assetSettingMap);
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
  const [currentQuoteRequest, setCurrentQuoteRequest] = useState<SwapRequest | undefined>(undefined);
  const [feeOptions, setFeeOptions] = useState<string[] | undefined>([]);
  const [currentFeeOption, setCurrentFeeOption] = useState<string | undefined>(undefined);
  const [currentSlippage, setCurrentSlippage] = useState<SlippageType>({ slippage: new BigN(0.01), isCustomType: true });
  const [swapError, setSwapError] = useState<SwapError|undefined>(undefined);
  const [isFormInvalid, setIsFormInvalid] = useState<boolean>(false);
  const [currentOptimalSwapPath, setOptimalSwapPath] = useState<CommonOptimalPath | undefined>(undefined);

  const [confirmedTerm, setConfirmedTerm] = useLocalStorage(CONFIRM_SWAP_TERM, '');
  const [showQuoteArea, setShowQuoteArea] = useState<boolean>(false);
  const optimalQuoteRef = useRef<SwapQuote | undefined>(undefined);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [handleRequestLoading, setHandleRequestLoading] = useState(true);
  const [requestUserInteractToContinue, setRequestUserInteractToContinue] = useState<boolean>(false);

  const continueRefreshQuoteRef = useRef<boolean>(false);

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

  const assetItems = useMemo<_ChainAsset[]>(() => {
    const result: _ChainAsset[] = [];

    Object.values(assetRegistryMap).forEach((chainAsset) => {
      if (isTokenAvailable(chainAsset, assetSettingMap, {}, false)) {
        result.push(chainAsset);
      }
    });

    return result;
  }, [assetRegistryMap, assetSettingMap]);

  const getAccountTokenBalance = useGetAccountTokenBalance();

  const tokenSelectorItems = useMemo<TokenSelectorItemType[]>(() => {
    const result = getTokenSelectorItem(assetItems, getAccountTokenBalance(assetItems, targetAccountProxyIdForGetBalance), chainStateMap);

    sortTokens(result, priorityTokens);

    return result;
  }, [assetItems, chainStateMap, getAccountTokenBalance, priorityTokens, targetAccountProxyIdForGetBalance]);

  const fromTokenItems = useMemo<TokenSelectorItemType[]>(() => {
    const allowChainSlugs = isAccountAll(targetAccountProxy.id)
      ? getChainsByAccountAll(targetAccountProxy, accountProxies, chainInfoMap)
      : undefined;

    return tokenSelectorItems.filter((item) => {
      const slug = item.slug;
      const assetInfo = assetRegistryMap[slug];

      if (!assetInfo) {
        return false;
      }

      if (allowChainSlugs && !allowChainSlugs.includes(assetInfo.originChain)) {
        return false;
      }

      if (!isTokenCompatibleWithAccountChainTypes(slug, targetAccountProxy.chainTypes, chainInfoMap)) {
        return false;
      }

      if (!defaultSlug) {
        return true;
      }

      return defaultSlug === slug || _getMultiChainAsset(assetInfo) === defaultSlug;
    });
  }, [accountProxies, assetRegistryMap, chainInfoMap, defaultSlug, targetAccountProxy, tokenSelectorItems]);

  const toTokenItems = tokenSelectorItems;

  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[fromTokenSlugValue] || undefined;
  }, [assetRegistryMap, fromTokenSlugValue]);

  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[toTokenSlugValue] || undefined;
  }, [assetRegistryMap, toTokenSlugValue]);

  const destChainValue = _getAssetOriginChain(toAssetInfo);

  const isSwitchable = useMemo(() => {
    return isTokenCompatibleWithAccountChainTypes(toTokenSlugValue, targetAccountProxy.chainTypes, chainInfoMap);
  }, [chainInfoMap, targetAccountProxy.chainTypes, toTokenSlugValue]);

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

  const handleGenerateOptimalProcess = useCallback(
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

        const optimalRequest = {
          request: currentRequest,
          selectedQuote: quote
        };

        return await generateOptimalProcess(optimalRequest);
      } catch (error) {
        console.error('generateOptimalProcess failed:', error);

        return null;
      }
    },
    [fromValue, currentSlippage.slippage, recipientValue]
  );

  const onConfirmSelectedQuote = useCallback(
    async (quote: SwapQuote) => {
      const processResult = await handleGenerateOptimalProcess(quote);

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
    [handleGenerateOptimalProcess]
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
                <FreeBalance
                  address={fromValue}
                  chain={chainValue}
                  hidden={!canShowAvailableBalance}
                  isSubscribe={true}
                  label={`${t('Available balance')}:`}
                  tokenSlug={fromTokenSlugValue}
                />
              </div>
            </Form>

            {
              showQuoteArea && (
                <QuoteInfoArea
                  currentQuote={currentQuote}
                  estimatedFeeValue={estimatedFeeValue}
                  fromAssetInfo={fromAssetInfo}
                  handleRequestLoading={handleRequestLoading}
                  isFormInvalid={isFormInvalid}
                  openSlippageModal={openSlippageModal}
                  openSwapQuotesModal={openSwapQuotesModal}
                  quoteAliveUntil={quoteAliveUntil}
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
            {t('Swap')}
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
            items={quoteOptions}
            modalId={SWAP_ALL_QUOTES_MODAL}
            onCancel={closeSwapQuotesModal}
            optimalQuoteItem={optimalQuoteRef.current}
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
      className={CN(className)}
      resolve={dataContext.awaitStores(['swap', 'price'])}
    >
      <Component targetAccountProxy={targetAccountProxy} />
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
    }
  };
});

export default Swap;
