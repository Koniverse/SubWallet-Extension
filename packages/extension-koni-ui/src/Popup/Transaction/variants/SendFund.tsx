// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _AssetRef, _AssetType, _ChainAsset, _ChainInfo, _ChainStatus } from '@subwallet/chain-list/types';
import { ExtrinsicType, NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { TransactionWarning } from '@subwallet/extension-base/background/warnings/TransactionWarning';
import { validateRecipientAddress } from '@subwallet/extension-base/core/logic-validation/recipientAddress';
import { _getXcmUnstableWarning, _isMythosFromHydrationToMythos, _isXcmTransferUnstable } from '@subwallet/extension-base/core/substrate/xcm-parser';
import { ActionType } from '@subwallet/extension-base/core/types';
import { getAvailBridgeGatewayContract, getSnowBridgeGatewayContract } from '@subwallet/extension-base/koni/api/contract-handler/utils';
import { _isAcrossChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/acrossBridge';
import { isAvailChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/availBridge';
import { _isPolygonChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/polygonBridge';
import { _isPosChainBridge, _isPosChainL2Bridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/posBridge';
import { _getAssetDecimals, _getAssetName, _getAssetOriginChain, _getAssetSymbol, _getChainNativeTokenSlug, _getContractAddressOfToken, _getEvmChainId, _getMultiChainAsset, _getOriginChainOfAsset, _getTokenMinAmount, _isChainBitcoinCompatible, _isChainCardanoCompatible, _isChainCompatibleLedgerEvm, _isChainEvmCompatible, _isNativeToken, _isTokenTransferredByEvm } from '@subwallet/extension-base/services/chain-service/utils';
import { TON_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import { TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { AccountChainType, AccountProxy, AccountProxyType, AccountSignMode, AnalyzedGroup, BasicTxWarningCode, FeeChainType, TransactionFee } from '@subwallet/extension-base/types';
import { ResponseSubscribeTransfer } from '@subwallet/extension-base/types/balance/transfer';
import { CommonStepType } from '@subwallet/extension-base/types/service-base';
import { _reformatAddressWithChain, isAccountAll, isSubstrateEcdsaLedgerAssetSupported } from '@subwallet/extension-base/utils';
import { AccountAddressSelector, AddressInputNew, AddressInputRef, AlertBox, AlertBoxInstant, AlertModal, AmountInput, ChainSelector, FeeEditor, HiddenInput, TokenSelector } from '@subwallet/extension-koni-ui/components';
import { ADDRESS_INPUT_AUTO_FORMAT_VALUE } from '@subwallet/extension-koni-ui/constants';
import { MktCampaignModalContext } from '@subwallet/extension-koni-ui/contexts/MktCampaignModalContext';
import { useAlert, useCoreCreateReformatAddress, useCreateGetChainAndExcludedTokenByAccountProxy, useDefaultNavigate, useFetchChainAssetInfo, useGetAccountTokenBalance, useGetBalance, useHandleSubmitMultiTransaction, useIsPolkadotUnifiedChain, useNotification, usePreCheckAction, useRestoreTransaction, useSelector, useSetCurrentPage, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import useGetConfirmationByScreen from '@subwallet/extension-koni-ui/hooks/campaign/useGetConfirmationByScreen';
import useLazyWatchTransaction from '@subwallet/extension-koni-ui/hooks/transaction/useWatchTransactionLazy';
import { approveSpending, cancelSubscription, getOptimalTransferProcess, getTokensCanPayFee, isTonBounceableAddress, makeCrossChainTransfer, makeTransfer, subscribeMaxTransfer } from '@subwallet/extension-koni-ui/messaging';
import { CommonActionType, commonProcessReducer, DEFAULT_COMMON_PROCESS } from '@subwallet/extension-koni-ui/reducer';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AccountAddressItemType, ChainItemType, FormCallbacks, Theme, ThemeProps, TransferParams } from '@subwallet/extension-koni-ui/types';
import { TokenSelectorItemType } from '@subwallet/extension-koni-ui/types/field';
import { findAccountByAddress, formatBalance, getSignModeByAccountProxy, noop, SortableTokenItem, sortTokensByBalanceInSelector } from '@subwallet/extension-koni-ui/utils';
import { Button, Form, Icon } from '@subwallet/react-ui';
import { Rule } from '@subwallet/react-ui/es/form';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { PaperPlaneRight, PaperPlaneTilt } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useIsFirstRender, useLocalStorage } from 'usehooks-ts';

import { BN, BN_ZERO } from '@polkadot/util';

import { FreeBalance, TransactionContent, TransactionFooter } from '../parts';

type WrapperProps = ThemeProps;

type ComponentProps = {
  className?: string;
  targetAccountProxy: AccountProxy;
  isAllAccount?: boolean
};

interface TransferOptions {
  isTransferAll: boolean;
  isTransferBounceable: boolean;
}

type SortableTokenSelectorItemType = TokenSelectorItemType & SortableTokenItem;

function getTokenAvailableDestinations (tokenSlug: string, xcmRefMap: Record<string, _AssetRef>, chainInfoMap: Record<string, _ChainInfo>): ChainItemType[] {
  if (!tokenSlug) {
    return [];
  }

  const result: ChainItemType[] = [];
  const originChain = chainInfoMap[_getOriginChainOfAsset(tokenSlug)];

  // Firstly, push the originChain of token
  result.push({
    name: originChain.name,
    slug: originChain.slug
  });

  Object.values(xcmRefMap).forEach((xcmRef) => {
    if (xcmRef.srcAsset === tokenSlug) {
      const destinationChain = chainInfoMap[xcmRef.destChain];

      if (destinationChain?.chainStatus === _ChainStatus.ACTIVE) {
        result.push({
          name: destinationChain.name,
          slug: destinationChain.slug
        });
      }
    }
  });

  return result;
}

const determineHideMaxButton = (chain: string, destChain: string, assetInfo: _ChainAsset, chainInfoMap: Record<string, _ChainInfo>) => {
  const chainInfo = chainInfoMap[chain];

  if (_isPolygonChainBridge(chain, destChain) || _isPosChainBridge(chain, destChain)) {
    return true;
  }

  return (
    !!chainInfo &&
    !!assetInfo &&
    destChain === chain &&
    _isNativeToken(assetInfo) &&
    (_isChainEvmCompatible(chainInfo) ||
      _isChainCardanoCompatible(chainInfo) ||
      _isChainBitcoinCompatible(chainInfo))
  );
};

const hiddenFields: Array<keyof TransferParams> = ['chain', 'fromAccountProxy', 'defaultSlug'];
const alertModalId = 'confirmation-alert-modal';
const defaultAddressInputRenderKey = 'address-input-render-key';
const defaultAmountInputRenderKey = 'amount-input-render-key';

const FEE_SHOW_TYPES: Array<FeeChainType | undefined> = ['substrate', 'evm'];

const Component = ({ className = '', isAllAccount, targetAccountProxy }: ComponentProps): React.ReactElement<ComponentProps> => {
  useSetCurrentPage('/transaction/send-fund');
  const { t } = useTranslation();
  const notification = useNotification();
  const mktCampaignModalContext = useContext(MktCampaignModalContext);

  const { defaultData, persistData } = useTransactionContext<TransferParams>();
  const { defaultSlug: sendFundSlug } = defaultData;
  const isFirstRender = useIsFirstRender();

  const [form] = Form.useForm<TransferParams>();
  const formDefault = useMemo((): TransferParams => {
    return {
      ...defaultData
    };
  }, [defaultData]);

  const toValue = useWatchTransaction('to', form, defaultData);
  const destChainValue = useWatchTransaction('destChain', form, defaultData);
  const transferAmountValue = useLazyWatchTransaction('value', form, defaultData, 600);
  const fromValue = useWatchTransaction('from', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);
  const assetValue = useWatchTransaction('asset', form, defaultData);

  const { nativeTokenBalance } = useGetBalance(chainValue, fromValue);
  const assetInfo = useFetchChainAssetInfo(assetValue);
  const getReformatAddress = useCoreCreateReformatAddress();
  const { alertProps, closeAlert, openAlert } = useAlert(alertModalId);

  const { chainInfoMap, chainStateMap, chainStatusMap, ledgerGenericAllowNetworks, priorityTokens } = useSelector((root) => root.chainStore);
  const { assetRegistry, xcmRefMap } = useSelector((root) => root.assetRegistry);
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const { accountProxies } = useSelector((state: RootState) => state.accountState);
  const [autoFormatValue] = useLocalStorage(ADDRESS_INPUT_AUTO_FORMAT_VALUE, false);
  const [listTokensCanPayFee, setListTokensCanPayFee] = useState<TokenHasBalanceInfo[]>([]);
  const [defaultTokenPayFee, setDefaultTokenPayFee] = useState<string | undefined>(undefined);
  const [currentTokenPayFee, setCurrentTokenPayFee] = useState<string | undefined>(undefined);
  const checkIsPolkadotUnifiedChain = useIsPolkadotUnifiedChain();
  const isShowAddressFormatInfoBox = checkIsPolkadotUnifiedChain(chainValue);
  const getAccountTokenBalance = useGetAccountTokenBalance();
  const getChainAndExcludedTokenByAccountProxy = useCreateGetChainAndExcludedTokenByAccountProxy();

  const [selectedTransactionFee, setSelectedTransactionFee] = useState<TransactionFee | undefined>();
  const { getCurrentConfirmation, renderConfirmationButtons } = useGetConfirmationByScreen('send-fund');
  const checkAction = usePreCheckAction(fromValue, true, t('ui.TRANSACTION.screen.Transaction.SendFund.cannotSendWithAccountType'));

  const currentConfirmation = useMemo(() => {
    if (chainValue && destChainValue) {
      return getCurrentConfirmation([chainValue, destChainValue]);
    } else {
      return undefined;
    }
  }, [chainValue, destChainValue, getCurrentConfirmation]);

  const hideMaxButton = useMemo(() => {
    return determineHideMaxButton(chainValue, destChainValue, assetInfo, chainInfoMap);
  }, [chainInfoMap, chainValue, destChainValue, assetInfo]);

  const disabledToAddressInput = useMemo(() => {
    return _isPosChainL2Bridge(chainValue, destChainValue);
  }, [chainValue, destChainValue]);

  const [loading, setLoading] = useState(false);
  const [isTransferAll, setIsTransferAll] = useState(false);

  // use this to reinit AddressInput component
  const [addressInputRenderKey, setAddressInputRenderKey] = useState<string>(defaultAddressInputRenderKey);
  const [amountInputRenderKey, setAmountInputRenderKey] = useState<string>(defaultAmountInputRenderKey);

  const [, update] = useState({});
  const [isBalanceReady, setIsBalanceReady] = useState(true);
  const [transferInfo, setTransferInfo] = useState<ResponseSubscribeTransfer | undefined>();
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [isFetchingListFeeToken, setIsFetchingListFeeToken] = useState(false);
  const chainStatus = useMemo(() => chainStatusMap[chainValue]?.connectionStatus, [chainValue, chainStatusMap]);
  const estimatedNativeFee = useMemo((): string => transferInfo?.feeOptions.estimatedFee || '0', [transferInfo]);

  const [processState, dispatchProcessState] = useReducer(commonProcessReducer, DEFAULT_COMMON_PROCESS);

  const handleWarning = useCallback((warnings: TransactionWarning[]) => {
    if (warnings.some((w) => w.warningType === BasicTxWarningCode.NOT_ENOUGH_EXISTENTIAL_DEPOSIT)) {
      setIsTransferAll(true);
    }
  }, []);

  const { onError, onSuccess } = useHandleSubmitMultiTransaction(dispatchProcessState, handleWarning);

  const destChainItems = useMemo<ChainItemType[]>(() => {
    return getTokenAvailableDestinations(assetValue, xcmRefMap, chainInfoMap);
  }, [chainInfoMap, assetValue, xcmRefMap]);

  const currentChainAsset = useMemo(() => {
    const _asset = isFirstRender ? defaultData.asset : assetValue;

    return _asset ? assetRegistry[_asset] : undefined;
  }, [isFirstRender, defaultData.asset, assetValue, assetRegistry]);

  // `destAssetInfo` is the asset sent to the recipient address. For regular transactions,
  // the received asset is the same as the sent asset. For XCM transactions,
  // need to check the `xcmRefMap` channel to get the correct destination asset.
  const destAssetInfo = useMemo(() => {
    if (chainValue === destChainValue) {
      return assetInfo;
    }

    const destChainXCMAsset = Object.values(xcmRefMap).find(
      (xcm) => xcm.destChain === destChainValue && xcm.srcChain === chainValue && xcm.path === 'XCM'
    );

    return destChainXCMAsset ? assetRegistry[destChainXCMAsset.destAsset] : assetInfo;
  }, [assetInfo, assetRegistry, chainValue, destChainValue, xcmRefMap]);

  const decimals = useMemo(() => {
    return currentChainAsset ? _getAssetDecimals(currentChainAsset) : 0;
  }, [currentChainAsset]);

  const nativeTokenSlug = useMemo(() => {
    const chainInfo = chainInfoMap[chainValue];

    return chainInfo && _getChainNativeTokenSlug(chainInfo);
  }, [chainInfoMap, chainValue]);

  const extrinsicType = useMemo((): ExtrinsicType => {
    if (!currentChainAsset) {
      return ExtrinsicType.UNKNOWN;
    } else {
      if (chainValue !== destChainValue) {
        return ExtrinsicType.TRANSFER_XCM;
      } else {
        if (currentChainAsset.assetType === _AssetType.NATIVE) {
          return ExtrinsicType.TRANSFER_BALANCE;
        } else {
          return ExtrinsicType.TRANSFER_TOKEN;
        }
      }
    }
  }, [chainValue, currentChainAsset, destChainValue]);

  const accountAddressItems = useMemo(() => {
    const chainInfo = chainValue ? chainInfoMap[chainValue] : undefined;

    if (!chainInfo) {
      return [];
    }

    const isIgnoreSubstrateEcdsaLedger = !isSubstrateEcdsaLedgerAssetSupported(assetInfo, chainInfo);
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

    if (isAccountAll(targetAccountProxy.id)) {
      accountProxies.forEach((ap) => {
        if (isAccountAll(ap.id)) {
          return;
        }

        if ([AccountProxyType.READ_ONLY].includes(ap.accountType)) {
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
      updateResult(targetAccountProxy);
    }

    return result;
  }, [accountProxies, assetInfo, chainInfoMap, chainValue, getReformatAddress, targetAccountProxy]);

  const targetAccountProxyIdForGetBalance = useMemo(() => {
    if (!isAccountAll(targetAccountProxy.id) || !fromValue) {
      return targetAccountProxy.id;
    }

    const accountProxyByFromValue = accountAddressItems.find((a) => a.address === fromValue);

    return accountProxyByFromValue?.accountProxyId || targetAccountProxy.id;
  }, [accountAddressItems, fromValue, targetAccountProxy.id]);

  const tokenItems = useMemo<SortableTokenSelectorItemType[]>(() => {
    const items = (() => {
      const { allowedChains, excludedTokens } = getChainAndExcludedTokenByAccountProxy(targetAccountProxy);

      const result: TokenSelectorItemType[] = [];

      Object.values(assetRegistry).forEach((chainAsset) => {
        const originChain = _getAssetOriginChain(chainAsset);

        if (!allowedChains.includes(originChain)) {
          return;
        }

        if (excludedTokens.includes(chainAsset.slug)) {
          return;
        }

        if (!sendFundSlug || (chainAsset.slug === sendFundSlug || _getMultiChainAsset(chainAsset) === sendFundSlug)) {
          result.push({
            slug: chainAsset.slug,
            name: _getAssetName(chainAsset),
            symbol: _getAssetSymbol(chainAsset),
            originChain
          });
        }
      });

      return result;
    })();

    const tokenBalanceMap = getAccountTokenBalance(
      items.map((item) => item.slug),
      targetAccountProxyIdForGetBalance
    );

    const tokenItemsSorted = items.map<SortableTokenSelectorItemType>((item) => {
      const tokenBalanceInfo = tokenBalanceMap[item.slug];
      const balanceInfo = tokenBalanceInfo && chainStateMap[item.originChain]?.active
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
        ...item,
        balanceInfo,
        isTestnet: !!balanceInfo?.isTestnet,
        total: balanceInfo?.isReady && !balanceInfo?.isNotSupport ? balanceInfo?.free : undefined
      };
    });

    sortTokensByBalanceInSelector(tokenItemsSorted, priorityTokens);

    return tokenItemsSorted;
  }, [assetRegistry, chainStateMap, getAccountTokenBalance, getChainAndExcludedTokenByAccountProxy, priorityTokens, sendFundSlug, targetAccountProxy, targetAccountProxyIdForGetBalance]);

  const isNotShowAccountSelector = !isAllAccount && accountAddressItems.length < 2;

  const addressInputRef = useRef<AddressInputRef>(null);
  const addressInputCurrent = addressInputRef.current;

  const updateAddressInputValue = useCallback((value: string) => {
    addressInputCurrent?.setInputValue(value);
    addressInputCurrent?.setSelectedOption((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        formatedAddress: value
      };
    });
  }, [addressInputCurrent]);

  const validateRecipient = useCallback((rule: Rule, _recipientAddress: string): Promise<void> => {
    const { chain, destChain, from } = form.getFieldsValue();
    const destChainInfo = chainInfoMap[destChain];
    const account = findAccountByAddress(accounts, _recipientAddress);

    return validateRecipientAddress({ srcChain: chain,
      destChainInfo,
      assetInfo: destAssetInfo,
      fromAddress: from,
      toAddress: _recipientAddress,
      account,
      actionType: ActionType.SEND_FUND,
      autoFormatValue,
      allowLedgerGenerics: ledgerGenericAllowNetworks });
  }, [accounts, autoFormatValue, chainInfoMap, destAssetInfo, form, ledgerGenericAllowNetworks]);

  const validateAmount = useCallback((rule: Rule, amount: string): Promise<void> => {
    const maxTransfer = transferInfo?.maxTransferable || '0';

    if (!amount) {
      return Promise.reject(t('ui.TRANSACTION.screen.Transaction.SendFund.amountIsRequired'));
    }

    if ((new BN(maxTransfer)).lte(BN_ZERO)) {
      return Promise.reject(t('ui.TRANSACTION.screen.Transaction.SendFund.notEnoughTokensToProceed'));
    }

    if ((new BigN(amount)).eq(new BigN(0))) {
      return Promise.reject(t('ui.TRANSACTION.screen.Transaction.SendFund.amountMustBeGreaterThanZero'));
    }

    if ((new BigN(amount)).gt(new BigN(maxTransfer))) {
      const maxString = formatBalance(maxTransfer, decimals);

      return Promise.reject(t('ui.TRANSACTION.screen.Transaction.SendFund.amountMaxError', { replace: { number: maxString } }));
    }

    return Promise.resolve();
  }, [decimals, t, transferInfo?.maxTransferable]);

  const onValuesChange: FormCallbacks<TransferParams>['onValuesChange'] = useCallback(
    (part: Partial<TransferParams>, values: TransferParams) => {
      const validateField: Set<string> = new Set();

      const timestamp = Date.now();

      const resetValueField = () => {
        setIsTransferAll(false);
        form.setFieldValue('value', undefined);
        setAmountInputRenderKey(`${defaultAmountInputRenderKey}-${timestamp}`);
      };

      const resetToFieldErrors = () => {
        form.setFields([{ name: 'to', errors: [] }]);
      };

      const resetValueFieldErrors = () => {
        form.setFields([{ name: 'value', errors: [] }]);
      };

      const resetTransactionFee = () => {
        setCurrentTokenPayFee(defaultTokenPayFee);
        setSelectedTransactionFee(undefined);
      };

      if (part.asset) {
        const chain = assetRegistry[part.asset].originChain;

        form.setFieldsValue({
          chain: chain,
          destChain: chain,
          to: ''
        });
        const newAssetInfo = assetRegistry[part.asset];
        const newHideMaxButton = determineHideMaxButton(chain, chain, newAssetInfo, chainInfoMap);

        if (newHideMaxButton && isTransferAll) {
          resetValueField();
        }

        setAddressInputRenderKey(`${defaultAddressInputRenderKey}-${Date.now()}`);
        setSelectedTransactionFee(undefined);
        setCurrentTokenPayFee(values.chain === chain ? defaultTokenPayFee : undefined);
        setTransferInfo(undefined);
      }

      if (part.destChain) {
        const chain = values.chain;
        const destChain = part.destChain;
        const assetInfo = assetRegistry[values.asset];
        const newHideMaxButton = determineHideMaxButton(chain, destChain, assetInfo, chainInfoMap);

        if (newHideMaxButton && isTransferAll) {
          resetValueField();
        }

        form.resetFields(['to']);
        resetTransactionFee();
      }

      if (part.destChain || part.chain || part.value || part.asset) {
        resetToFieldErrors();
        resetValueFieldErrors();
      }

      if (part.to) {
        resetToFieldErrors();
      }

      if (validateField.size) {
        form.validateFields([...validateField]).catch(noop);
      }

      persistData(form.getFieldsValue());
    },
    [persistData, form, assetRegistry, chainInfoMap, isTransferAll, defaultTokenPayFee]
  );

  const isShowWarningOnSubmit = useCallback((values: TransferParams): boolean => {
    setLoading(true);
    const { asset, chain, destChain, from: _from } = values;

    const account = findAccountByAddress(accounts, _from);

    if (!account) {
      setLoading(false);
      notification({
        message: t('ui.TRANSACTION.screen.Transaction.SendFund.cantFindAccount'),
        type: 'error'
      });

      return true;
    }

    const chainAsset = assetRegistry[asset];

    if (chain === destChain) {
      if (account.signMode === AccountSignMode.GENERIC_LEDGER && account.chainType === 'ethereum') {
        if (!_isTokenTransferredByEvm(chainAsset)) {
          setLoading(false);
          notification({
            message: t('ui.TRANSACTION.screen.Transaction.SendFund.ledgerNotSupportTransfer'),
            type: 'warning'
          });

          return true;
        }
      }
    }

    return false;
  }, [accounts, assetRegistry, notification, t]);

  const handleBasicSubmit = useCallback((values: TransferParams, options: TransferOptions): Promise<SWTransactionResponse> => {
    const { asset, chain, destChain, from, to, value } = values;
    let sendPromise: Promise<SWTransactionResponse>;

    if (chain === destChain) {
      // Transfer token or send fund
      sendPromise = makeTransfer({
        from,
        chain,
        to: to,
        tokenSlug: asset,
        value: value,
        transferAll: options.isTransferAll,
        transferBounceable: options.isTransferBounceable,
        feeOption: selectedTransactionFee?.feeOption,
        feeCustom: selectedTransactionFee?.feeCustom,
        tokenPayFeeSlug: currentTokenPayFee
      });
    } else {
      // Make cross chain transfer
      sendPromise = makeCrossChainTransfer({
        destinationNetworkKey: destChain,
        from,
        originNetworkKey: chain,
        tokenSlug: asset,
        to,
        value,
        transferAll: options.isTransferAll,
        transferBounceable: options.isTransferBounceable,
        feeOption: selectedTransactionFee?.feeOption,
        feeCustom: selectedTransactionFee?.feeCustom,
        tokenPayFeeSlug: undefined // todo: support pay local fee for xcm later
      });
    }

    return sendPromise;
  }, [selectedTransactionFee?.feeOption, selectedTransactionFee?.feeCustom, currentTokenPayFee]);

  // todo: must refactor later, temporary solution to support SnowBridge
  const handleBridgeSpendingApproval = useCallback((values: TransferParams): Promise<SWTransactionResponse> => {
    const isAvailBridge = isAvailChainBridge(values.destChain);
    const isAcrossBridge = _isAcrossChainBridge(values.chain, values.destChain);
    const tokenInfo = assetRegistry[values.asset];

    if (isAcrossBridge) {
      const chainInfo = chainInfoMap[values.chain];
      const chainId = _getEvmChainId(chainInfo);

      if (chainId) {
        const tokenApprovalStep = processState.steps.find((step) => step.type === CommonStepType.TOKEN_APPROVAL); // Maybe can add index
        const metadata = tokenApprovalStep?.metadata;
        const SpokePoolAddress = metadata?.SpokePoolAddress as string;

        return approveSpending({
          amount: values.value,
          contractAddress: _getContractAddressOfToken(tokenInfo),
          spenderAddress: SpokePoolAddress,
          chain: values.chain,
          owner: values.from
        });
      }
    }

    return approveSpending({
      amount: values.value,
      contractAddress: _getContractAddressOfToken(tokenInfo),
      spenderAddress: isAvailBridge ? getAvailBridgeGatewayContract(values.chain) : getSnowBridgeGatewayContract(values.chain),
      chain: values.chain,
      owner: values.from
    });
  }, [assetRegistry, chainInfoMap, processState.steps]);

  // Submit transaction
  const doSubmit = useCallback((values: TransferParams, options: TransferOptions) => {
    if (isShowWarningOnSubmit(values)) {
      return;
    }

    const submitData = async (step: number): Promise<boolean> => {
      dispatchProcessState({
        type: CommonActionType.STEP_SUBMIT,
        payload: null
      });

      const isFirstStep = step === 0;
      const isLastStep = step === processState.steps.length - 1;
      const needRollback = step === 1;

      try {
        if (isFirstStep) {
          // todo: validate process
          dispatchProcessState({
            type: CommonActionType.STEP_COMPLETE,
            payload: true
          });
          dispatchProcessState({
            type: CommonActionType.STEP_SUBMIT,
            payload: null
          });

          return await submitData(step + 1);
        } else {
          const stepType = processState.steps[step].type;
          const submitPromise: Promise<SWTransactionResponse> | undefined = stepType === CommonStepType.TOKEN_APPROVAL ? handleBridgeSpendingApproval(values) : handleBasicSubmit(values, options);

          const rs = await submitPromise;
          const success = onSuccess(isLastStep, needRollback)(rs);

          if (success) {
            return await submitData(step + 1);
          } else {
            return false;
          }
        }
      } catch (e) {
        onError(e as Error);

        return false;
      }
    };

    setTimeout(() => {
      // Handle transfer action
      submitData(processState.currentStep)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [handleBasicSubmit, handleBridgeSpendingApproval, isShowWarningOnSubmit, onError, onSuccess, processState]);

  const onSetMaxTransferable = useCallback((value: boolean) => {
    const bnMaxTransfer = new BN(transferInfo?.maxTransferable || '0');

    if (!bnMaxTransfer.isZero()) {
      setIsTransferAll(value);
    }
  }, [transferInfo?.maxTransferable]);

  const onSetTokenPayFee = useCallback((slug: string) => {
    setCurrentTokenPayFee(slug);
  }, [setCurrentTokenPayFee]);

  const onSubmit: FormCallbacks<TransferParams>['onFinish'] = useCallback((values: TransferParams) => {
    const options: TransferOptions = {
      isTransferAll: isTransferAll,
      isTransferBounceable: false
    };

    let checkTransferAll = false;

    const _doSubmit = async () => {
      if (values.chain !== values.destChain) {
        const originChainInfo = chainInfoMap[values.chain];
        const destChainInfo = chainInfoMap[values.destChain];
        const assetSlug = values.asset;
        const isMythosFromHydrationToMythos = _isMythosFromHydrationToMythos(originChainInfo, destChainInfo, assetSlug);

        if (_isXcmTransferUnstable(originChainInfo, destChainInfo, assetSlug)) {
          openAlert({
            type: NotificationType.WARNING,
            content: t(_getXcmUnstableWarning(originChainInfo, destChainInfo, assetSlug)),
            title: isMythosFromHydrationToMythos ? t('ui.TRANSACTION.screen.Transaction.SendFund.highFeeAlert') : t('ui.TRANSACTION.screen.Transaction.SendFund.payAttentionExclamation'),
            okButton: {
              text: t('ui.TRANSACTION.screen.Transaction.SendFund.continue'),
              onClick: () => {
                closeAlert();
                setLoading(true);
                doSubmit(values, options);
              }
            },
            cancelButton: {
              text: t('ui.TRANSACTION.screen.Transaction.SendFund.cancel'),
              onClick: () => {
                closeAlert();
                setLoading(false);
              }
            }
          });

          return;
        }
      }

      if (TON_CHAINS.includes(values.chain)) {
        const isShowTonBouncealbeModal = await isTonBounceableAddress({ address: values.to, chain: values.chain });
        const chainInfo = chainInfoMap[values.destChain];

        if (isShowTonBouncealbeModal && !options.isTransferBounceable) {
          const bounceableAddressPrefix = values.to.substring(0, 2);
          const formattedAddress = _reformatAddressWithChain(values.to, chainInfo);
          const formattedAddressPrefix = formattedAddress.substring(0, 2);

          openAlert({
            type: NotificationType.WARNING,
            content: t('ui.TRANSACTION.screen.Transaction.SendFund.bounceableAddressNotSupported', { replace: { bounceableAddressPrefix: bounceableAddressPrefix, formattedAddressPrefix: formattedAddressPrefix } }),
            title: t('ui.TRANSACTION.screen.Transaction.SendFund.unsupportedAddress'),
            okButton: {
              text: t('ui.TRANSACTION.screen.Transaction.SendFund.continue'),
              onClick: () => {
                form.setFieldValue('to', formattedAddress);
                updateAddressInputValue(formattedAddress);
                closeAlert();
                setLoading(true);
                options.isTransferBounceable = true;
                _doSubmit().catch((error) => {
                  console.error('Error during submit:', error);
                });
              }
            },
            cancelButton: {
              text: t('ui.TRANSACTION.screen.Transaction.SendFund.cancel'),
              onClick: () => {
                closeAlert();
                setLoading(false);
              }
            }
          });

          return;
        }
      }

      if (_isNativeToken(assetInfo)) {
        const minAmount = _getTokenMinAmount(assetInfo);
        const bnMinAmount = new BN(minAmount);

        if (bnMinAmount.gt(BN_ZERO) && isTransferAll && values.chain === values.destChain && !checkTransferAll) {
          openAlert({
            type: NotificationType.WARNING,
            content: t('ui.TRANSACTION.screen.Transaction.SendFund.transferAllWarning'),
            title: t('ui.TRANSACTION.screen.Transaction.SendFund.payAttentionExclamation'),
            okButton: {
              text: t('ui.TRANSACTION.screen.Transaction.SendFund.transfer'),
              onClick: () => {
                closeAlert();
                setLoading(true);
                checkTransferAll = true;
                _doSubmit().catch((error) => {
                  console.error('Error during submit:', error);
                });
              }
            },
            cancelButton: {
              text: t('ui.TRANSACTION.screen.Transaction.SendFund.cancel'),
              onClick: () => {
                closeAlert();
                setLoading(false);
              }
            }
          });

          return;
        }
      }

      const latestValue = form.getFieldsValue();

      doSubmit(latestValue, options);
    };

    _doSubmit().catch((error) => {
      console.error('Error during submit:', error);
    });
  }, [assetInfo, chainInfoMap, closeAlert, doSubmit, form, isTransferAll, openAlert, t, updateAddressInputValue]);

  const onClickSubmit = useCallback((values: TransferParams) => {
    if (currentConfirmation) {
      mktCampaignModalContext.openModal({
        type: 'confirmation',
        title: currentConfirmation.name,
        message: currentConfirmation.content,
        externalButtons: renderConfirmationButtons(mktCampaignModalContext.hideModal, () => {
          onSubmit(values);
          mktCampaignModalContext.hideModal();
        })
      });
    } else {
      onSubmit(values);
    }
  }, [currentConfirmation, mktCampaignModalContext, onSubmit, renderConfirmationButtons]);

  const isDataReady = !isFetchingInfo && !isFetchingListFeeToken && !!transferInfo?.feeOptions;

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
  }, [accountAddressItems, disabledToAddressInput, form, fromValue]);

  // Get max transfer value
  useEffect(() => {
    let cancel = false;

    // setIsFetchingMaxValue(false);

    let id = '';

    setIsFetchingInfo(true);

    const validate = () => {
      const value = form.getFieldValue('value') as string;

      if (value) {
        setTimeout(() => {
          form.validateFields(['value']).finally(() => update({}));
        }, 100);
      }
    };

    const callback = (transferInfo: ResponseSubscribeTransfer) => {
      if (!cancel) {
        setTransferInfo(transferInfo);

        id = transferInfo.id;

        validate();
      } else {
        cancelSubscription(transferInfo.id).catch(console.error);
      }
    };

    if (fromValue && assetValue) {
      subscribeMaxTransfer({
        address: fromValue,
        to: toValue,
        chain: assetRegistry[assetValue].originChain,
        token: assetValue,
        value: transferAmountValue,
        destChain: destChainValue,
        feeOption: selectedTransactionFee?.feeOption,
        feeCustom: selectedTransactionFee?.feeCustom,
        tokenPayFeeSlug: currentTokenPayFee,
        transferAll: isTransferAll
      }, callback)
        .then((callback))
        .catch((e) => {
          console.error('Error in subscribeMaxTransfer:', e);

          setTransferInfo(undefined);
          validate();
        })
        .finally(() => {
          setIsFetchingInfo(false);
        });
    }

    return () => {
      cancel = true;
      id && cancelSubscription(id).catch(console.error);
    };
  }, [assetValue, assetRegistry, chainValue, chainStatus, form, fromValue, destChainValue, selectedTransactionFee, nativeTokenSlug, currentTokenPayFee, transferAmountValue, toValue, isTransferAll]);

  useEffect(() => {
    if (isTransferAll && transferInfo?.maxTransferable && !hideMaxButton) {
      form.setFieldsValue({
        value: transferInfo?.maxTransferable
      });
      setAmountInputRenderKey(`${defaultAmountInputRenderKey}-${Date.now()}`);
    }
  }, [form, hideMaxButton, isTransferAll, transferInfo]);

  useEffect(() => {
    const bnTransferAmount = new BN(transferAmountValue || '0');
    const bnMaxTransfer = new BN(transferInfo?.maxTransferable || '0');

    if (bnTransferAmount.gt(BN_ZERO) && bnTransferAmount.eq(bnMaxTransfer)) {
      setIsTransferAll(true);
    }
  }, [transferAmountValue, transferInfo?.maxTransferable]);

  useEffect(() => {
    getOptimalTransferProcess({
      amount: transferAmountValue,
      address: fromValue,
      originChain: chainValue,
      tokenSlug: assetValue,
      destChain: destChainValue
    })
      .then((result) => {
        dispatchProcessState({
          payload: {
            steps: result.steps,
            feeStructure: result.totalFee
          },
          type: CommonActionType.STEP_CREATE
        });
      })
      .catch((e) => {
        console.log('error', e);
      });
  }, [assetValue, chainValue, destChainValue, fromValue, transferAmountValue]);

  useEffect(() => {
    if (disabledToAddressInput) {
      const selectedItem = accountAddressItems.find((i) => i.address === fromValue);
      const chainInfo = chainInfoMap[chainValue];
      const reformatedInputValue = _reformatAddressWithChain(fromValue, chainInfo);

      addressInputCurrent?.setInputValue?.(selectedItem?.address);
      addressInputCurrent?.setSelectedOption?.({
        address: selectedItem?.address || '',
        formatedAddress: reformatedInputValue,
        analyzedGroup: AnalyzedGroup.RECENT,
        displayName: selectedItem?.accountName
      });
      form.setFieldValue('to', fromValue);
    }
  }, [accountAddressItems, addressInputCurrent, chainInfoMap, chainValue, disabledToAddressInput, form, fromValue]);

  useEffect(() => {
    let cancel = false;

    const fetchTokens = async () => {
      setIsFetchingListFeeToken(true);
      setListTokensCanPayFee([]);

      try {
        const _response = await getTokensCanPayFee({
          chain: chainValue,
          address: fromValue
        });

        const tokensCanPayFee = _response.tokensCanPayFee.filter((item) => item !== null && item !== undefined);
        const defaultTokenSlug = _response.defaultTokenSlug;

        if (!cancel) {
          setDefaultTokenPayFee(defaultTokenSlug);
          setCurrentTokenPayFee(defaultTokenSlug);
          setListTokensCanPayFee(tokensCanPayFee);
          setIsFetchingListFeeToken(false);
        }
      } catch (error) {
        if (!cancel) {
          setListTokensCanPayFee([]);
          setIsFetchingListFeeToken(false);
        }

        console.error('Error fetching tokens:', error);
      }
    };

    fetchTokens().catch((error) => {
      console.error('Unhandled error in fetchTokens:', error);
    });

    return () => {
      cancel = true;
    };
  }, [chainValue, fromValue, nativeTokenBalance, nativeTokenSlug]);

  useEffect(() => {
    console.log('transferInfo', transferInfo);
  }, [transferInfo]);

  useRestoreTransaction(form);

  return (
    <>
      <TransactionContent className={CN(`${className} -transaction-content`)}>
        <div className={'__brief common-text text-light-4 text-center'}>
          {t('ui.TRANSACTION.screen.Transaction.SendFund.transferringFungibleToken')}
        </div>

        <Form
          className={'form-container form-space-sm'}
          form={form}
          initialValues={formDefault}
          onFinish={onClickSubmit}
          onValuesChange={onValuesChange}
        >
          <HiddenInput fields={hiddenFields} />

          <div className={'form-row'}>
            <Form.Item name={'asset'}>
              <TokenSelector
                disabled={!tokenItems.length}
                items={tokenItems}
                placeholder={t('ui.TRANSACTION.screen.Transaction.SendFund.selectToken')}
                showChainInSelected
                tooltip={t('ui.TRANSACTION.screen.Transaction.SendFund.selectToken')}
              />
            </Form.Item>

            <Icon
              className={'middle-item'}
              phosphorIcon={PaperPlaneRight}
              size={'md'}
            />

            <Form.Item name={'destChain'}>
              <ChainSelector
                disabled={!destChainItems.length}
                items={destChainItems}
                title={t('ui.TRANSACTION.screen.Transaction.SendFund.selectDestinationChain')}
                tooltip={t('ui.TRANSACTION.screen.Transaction.SendFund.selectDestinationChain')}
              />
            </Form.Item>
          </div>

          <Form.Item
            className={CN({ hidden: isNotShowAccountSelector })}
            name={'from'}
            statusHelpAsTooltip={true}
          >
            <AccountAddressSelector
              items={accountAddressItems}
              label={`${t('ui.TRANSACTION.screen.Transaction.SendFund.from')}:`}
              labelStyle={'horizontal'}
            />
          </Form.Item>

          <Form.Item
            name={'to'}
            rules={[
              {
                validator: validateRecipient
              }
            ]}
            statusHelpAsTooltip={true}
            validateTrigger={false}
          >
            <AddressInputNew
              actionType={ActionType.SEND_FUND}
              chainSlug={destChainValue}
              disabled={disabledToAddressInput}
              dropdownHeight={isNotShowAccountSelector ? 317 : 257}
              key={addressInputRenderKey}
              label={`${t('ui.TRANSACTION.screen.Transaction.SendFund.to')}:`}
              labelStyle={'horizontal'}
              placeholder={t('ui.TRANSACTION.screen.Transaction.SendFund.enterAddress')}
              ref={addressInputRef}
              saveAddress={true}
              showAddressBook={true}
              showScanner={true}
              tokenSlug={destAssetInfo?.slug}
            />
          </Form.Item>

          <FreeBalance
            address={fromValue}
            chain={chainValue}
            className={'free-balance-block'}
            extrinsicType={extrinsicType}
            onBalanceReady={setIsBalanceReady}
            tokenSlug={assetValue}
          />

          <Form.Item
            name={'value'}
            rules={[
              {
                validator: validateAmount
              }
            ]}
            statusHelpAsTooltip={true}
            validateTrigger={false}
          >
            <AmountInput
              decimals={decimals}
              disabled={decimals === 0}
              key={amountInputRenderKey}
              maxValue={transferInfo?.maxTransferable || '0'}
              onSetMax={onSetMaxTransferable}
              showMaxButton={!hideMaxButton}
              tooltip={t('ui.TRANSACTION.screen.Transaction.SendFund.amount')}
            />
          </Form.Item>
        </Form>

        {FEE_SHOW_TYPES.includes(transferInfo?.feeType) && !!toValue && !!transferAmountValue && nativeTokenSlug && (
          <FeeEditor
            chainValue={chainValue}
            currentTokenPayFee={currentTokenPayFee}
            destChainValue={destChainValue}
            estimateFee={estimatedNativeFee}
            feeOptionsInfo={transferInfo?.feeOptions}
            feePercentageSpecialCase={transferInfo?.feePercentageSpecialCase}
            feeType={transferInfo?.feeType}
            isLoadingFee={isFetchingInfo}
            isLoadingToken={isFetchingListFeeToken}
            listTokensCanPayFee={listTokensCanPayFee}
            nativeTokenSlug={nativeTokenSlug}
            onSelect={setSelectedTransactionFee}
            onSetTokenPayFee={onSetTokenPayFee}
            selectedFeeOption={selectedTransactionFee}
            tokenPayFeeSlug={currentTokenPayFee || nativeTokenSlug}
            tokenSlug={assetValue}
          />
        )}
        {
          chainValue !== destChainValue && (
            <div className={'__warning_message_cross_chain'}>
              <AlertBox
                description={t('ui.TRANSACTION.screen.Transaction.SendFund.crossChainCexWarning')}
                title={t('ui.TRANSACTION.screen.Transaction.SendFund.payAttentionExclamation')}
                type={'warning'}
              />
            </div>
          )
        }
        {
          !(chainValue !== destChainValue) && isShowAddressFormatInfoBox && (
            <div className={'__warning_message_cross_chain'}>
              <AlertBoxInstant type={'new-address-format'} />
            </div>
          )
        }
        {
          !!alertProps && (
            <AlertModal
              modalId={alertModalId}
              {...alertProps}
            />
          )
        }
      </TransactionContent>
      <TransactionFooter
        className={`${className} -transaction-footer`}
      >
        <Button
          disabled={!isBalanceReady || isFetchingListFeeToken || (isTransferAll ? isFetchingInfo : false) || !isDataReady || transferInfo?.isEvmRpcError}
          icon={(
            <Icon
              phosphorIcon={PaperPlaneTilt}
              weight={'fill'}
            />
          )}
          loading={loading}
          onClick={checkAction(form.submit, extrinsicType)}
          schema={isTransferAll ? 'warning' : undefined}
        >
          {isTransferAll ? t('ui.TRANSACTION.screen.Transaction.SendFund.transferAll') : t('ui.TRANSACTION.screen.Transaction.SendFund.transfer')}
        </Button>
      </TransactionFooter>
    </>
  );
};

const Wrapper: React.FC<WrapperProps> = (props: WrapperProps) => {
  const { className } = props;
  const { defaultData } = useTransactionContext<TransferParams>();
  const { goHome } = useDefaultNavigate();
  const { accountProxies, isAllAccount } = useSelector((state) => state.accountState);

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
    <Component
      className={className}
      isAllAccount={isAllAccount}
      targetAccountProxy={targetAccountProxy}
    />
  );
};

const SendFund = styled(Wrapper)(({ theme }) => {
  const token = (theme as Theme).token;

  return ({
    '.__brief': {
      paddingLeft: token.padding,
      paddingRight: token.padding,
      marginBottom: token.marginMD
    },

    '.form-row': {
      gap: 8
    },

    '.middle-item': {
      marginBottom: token.marginSM
    },

    '.__warning_message_cross_chain': {
      marginTop: token.marginXS
    },

    '.free-balance-block': {
      marginBottom: token.marginSM,
      justifyContent: 'end'
    },

    '&.-transaction-content.-is-zero-balance': {
      '.free-balance .ant-number': {
        '.ant-number-integer, .ant-number-decimal': {
          color: `${token.colorError} !important`
        }
      }
    }
  });
});

export default SendFund;
