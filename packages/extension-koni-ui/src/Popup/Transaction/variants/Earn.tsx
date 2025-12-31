// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { ExtrinsicType, NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { _handleDisplayForEarningError, _handleDisplayInsufficientEarningError } from '@subwallet/extension-base/core/logic-validation/earning';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { isLendingPool, isLiquidPool } from '@subwallet/extension-base/services/earning-service/utils';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { BalanceType, NominationPoolInfo, OptimalYieldPath, OptimalYieldPathParams, ProcessType, SlippageType, SubmitJoinNativeStaking, SubmitJoinNominationPool, SubmitYieldJoinData, ValidatorInfo, YieldPoolType, YieldStepType } from '@subwallet/extension-base/types';
import { createLogger } from '@subwallet/extension-base/utils/logger';
import { addLazy } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
import { AccountAddressSelector, AlertBox, AmountInput, EarningPoolSelector, EarningValidatorSelector, HiddenInput, InfoIcon, LoadingScreen, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { EarningProcessItem } from '@subwallet/extension-koni-ui/components/Earning';
import { getInputValuesFromString } from '@subwallet/extension-koni-ui/components/Field/AmountInput';
import { EarningInstructionModal } from '@subwallet/extension-koni-ui/components/Modal/Earning';
import { SlippageModal } from '@subwallet/extension-koni-ui/components/Modal/Swap';
import { EARNING_INSTRUCTION_MODAL, EARNING_SLIPPAGE_MODAL, STAKE_ALERT_DATA } from '@subwallet/extension-koni-ui/constants';
import { MktCampaignModalContext } from '@subwallet/extension-koni-ui/contexts/MktCampaignModalContext';
import { useChainConnection, useCoreCreateReformatAddress, useCreateGetSubnetStakingTokenName, useExtensionDisplayModes, useFetchChainState, useGetBalance, useGetNativeTokenSlug, useGetYieldPositionForSpecificAccount, useInitValidateTransaction, useNotification, useOneSignProcess, usePreCheckAction, useRestoreTransaction, useSelector, useSidePanelUtils, useTransactionContext, useWatchTransaction, useYieldPositionDetail } from '@subwallet/extension-koni-ui/hooks';
import useGetConfirmationByScreen from '@subwallet/extension-koni-ui/hooks/campaign/useGetConfirmationByScreen';
import { useTaoStakingFee } from '@subwallet/extension-koni-ui/hooks/earning/useTaoStakingFee';
import { fetchPoolTarget, getOptimalYieldPath, submitJoinYieldPool, submitProcess, validateYieldProcess, windowOpen } from '@subwallet/extension-koni-ui/messaging';
import { DEFAULT_YIELD_PROCESS, EarningActionType, earningReducer } from '@subwallet/extension-koni-ui/reducer';
import { store } from '@subwallet/extension-koni-ui/stores';
import { AccountAddressItemType, EarnParams, FormCallbacks, FormFieldData, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertFieldToObject, getExtrinsicTypeByPoolInfo, parseNominations, reformatAddress, simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { ActivityIndicator, Button, ButtonProps, Form, Icon, Logo, ModalContext, Number, Tooltip } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';

const logger = createLogger('Earn');
import { CheckCircle, Info, PencilSimpleLine, PlusCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { getJoinYieldParams } from '../helper';
import { EarnOutlet, FreeBalance, FreeBalanceToEarn, TransactionContent, TransactionFooter } from '../parts';

type Props = ThemeProps;

const hideFields: Array<keyof EarnParams> = ['slug', 'chain', 'asset', 'fromAccountProxy'];
const validateFields: Array<keyof EarnParams> = ['from'];
const loadingStepPromiseKey = 'earning.step.loading';

const instructionModalId = EARNING_INSTRUCTION_MODAL;

// Not enough balance to xcm;
export const insufficientXCMMessages = ['You can only enter a maximum'];

const Component = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const navigate = useNavigate();
  const { closeSidePanel } = useSidePanelUtils();
  const { isExpanseMode, isSidePanelMode } = useExtensionDisplayModes();
  const mktCampaignModalContext = useContext(MktCampaignModalContext);
  const { closeAlert, defaultData, goBack, onDone,
    openAlert, persistData,
    setBackProps, setIsDisableHeader, setSubHeaderRightButtons } = useTransactionContext<EarnParams>();

  const { fromAccountProxy, slug } = defaultData;

  const { accountProxies, isAllAccount } = useSelector((state) => state.accountState);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const poolInfoMap = useSelector((state) => state.earning.poolInfoMap);
  const poolTargetsMap = useSelector((state) => state.earning.poolTargetsMap);
  const chainAsset = useSelector((state) => state.assetRegistry.assetRegistry);
  const priceMap = useSelector((state) => state.price.priceMap);
  const { currencyData } = useSelector((state) => state.price);

  const [form] = Form.useForm<EarnParams>();
  const formDefault = useMemo((): EarnParams => ({ ...defaultData }), [defaultData]);
  const { getCurrentConfirmation, renderConfirmationButtons } = useGetConfirmationByScreen('stake');
  const fromValue = useWatchTransaction('from', form, defaultData);
  const amountValue = useWatchTransaction('value', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);
  const poolTargetValue = useWatchTransaction('target', form, defaultData);

  const getSubnetStakingTokenName = useCreateGetSubnetStakingTokenName();
  const oneSign = useOneSignProcess(fromValue);
  const nativeTokenSlug = useGetNativeTokenSlug(chainValue);
  const getReformatAddress = useCoreCreateReformatAddress();

  const isClickInfoButtonRef = useRef<boolean>(false);

  const [processState, dispatchProcessState] = useReducer(earningReducer, DEFAULT_YIELD_PROCESS);

  const currentStep = processState.currentStep;
  const firstStep = currentStep === 0;
  const submitStepType = processState.steps?.[!currentStep ? currentStep + 1 : currentStep]?.type;

  const { compound } = useYieldPositionDetail(slug);
  const specificList = useGetYieldPositionForSpecificAccount(fromValue);

  const { nativeTokenBalance } = useGetBalance(chainValue, fromValue);
  const { checkChainConnected, turnOnChain } = useChainConnection();
  const [isConnectingChainSuccess, setIsConnectingChainSuccess] = useState<boolean>(false);
  const [isLoadingChainConnection, setIsLoadingChainConnection] = useState<boolean>(false);

  const poolInfo = poolInfoMap[slug];
  const poolType = poolInfo?.type || '';
  const poolChain = poolInfo?.chain || '';

  const [isBalanceReady, setIsBalanceReady] = useState<boolean>(true);
  const [forceFetchValidator, setForceFetchValidator] = useState(false);
  const [targetLoading, setTargetLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState<boolean>(true);
  const [screenLoading, setScreenLoading] = useState(true);
  const [submitString, setSubmitString] = useState<string | undefined>();
  const [connectionError, setConnectionError] = useState<string>();
  // const [, setCanMint] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  // const [checkMintLoading, setCheckMintLoading] = useState(false);
  const [isFormInvalid, setIsFormInvalid] = useState(true);
  const [maxSlippage, setMaxSlippage] = useState<SlippageType>({ slippage: new BigN(0.005), isCustomType: true });

  const chainState = useFetchChainState(poolInfo?.chain || '');

  const onHandleOneSignConfirmation = useCallback((transactionProcessId: string) => {
    if (!isExpanseMode) {
      windowOpen({
        allowedPath: '/transaction-submission',
        params: {
          'transaction-process-id': transactionProcessId
        }
      }).then(window.close).catch((error) => logger.error('Failed to open window', error));

      isSidePanelMode && closeSidePanel();
    } else {
      navigate(`/transaction-submission?transaction-process-id=${transactionProcessId}`);
    }
  }, [closeSidePanel, isExpanseMode, isSidePanelMode, navigate]);

  const currentConfirmation = useMemo(() => {
    if (slug) {
      return getCurrentConfirmation([slug]);
    } else {
      return undefined;
    }
  }, [slug, getCurrentConfirmation]);

  const mustChooseTarget = useMemo(
    () => [YieldPoolType.NATIVE_STAKING, YieldPoolType.SUBNET_STAKING, YieldPoolType.NOMINATION_POOL].includes(poolType),
    [poolType]
  );

  const balanceTypeForPool = useMemo(() => {
    if ([YieldPoolType.NATIVE_STAKING, YieldPoolType.NOMINATION_POOL].includes(poolType)) {
      return BalanceType.TOTAL_MINUS_RESERVED;
    }

    return undefined;
  }, [poolType]);

  const chainStakingBoth = useMemo(() => {
    const hasNativeStaking = (chain: string) => specificList.some((item) => item.chain === chain && item.type === YieldPoolType.NATIVE_STAKING);
    const hasNominationPool = (chain: string) => specificList.some((item) => item.chain === chain && item.type === YieldPoolType.NOMINATION_POOL);

    const chains = ['polkadot', 'kusama'];
    let chainStakingInBoth;

    for (const chain of chains) {
      if (hasNativeStaking(chain) && hasNominationPool(chain) && [YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING].includes(poolType) && chain === chainValue) {
        chainStakingInBoth = chain;
        break;
      } else if (((hasNativeStaking(chain) && poolType === YieldPoolType.NOMINATION_POOL) || (hasNominationPool(chain) && poolType === YieldPoolType.NATIVE_STAKING)) && chain === chainValue) {
        chainStakingInBoth = chain;
        break;
      }
    }

    return chainStakingInBoth;
  }, [specificList, poolType, chainValue]);

  const balanceTokens = useMemo(() => {
    const result: Array<{ chain: string; token: string }> = [];

    if (!poolInfo) {
      return [];
    }

    const _chain = poolInfo?.chain;

    result.push({
      token: poolInfo?.metadata.inputAsset,
      chain: _chain
    });

    if (poolInfo?.type === YieldPoolType.LENDING || poolInfo?.type === YieldPoolType.LIQUID_STAKING) {
      const altAsset = poolInfo?.metadata?.altInputAssets;
      const asset = chainAsset[altAsset || ''];

      if (asset) {
        result.push({
          token: asset.slug,
          chain: asset.originChain
        });
      }
    }

    return result;
  }, [chainAsset, poolInfo]);

  const inputAsset = useMemo(
    () => chainAsset[poolInfo?.metadata?.inputAsset],
    [chainAsset, poolInfo?.metadata?.inputAsset]
  );

  const nativeAsset: _ChainAsset | undefined = useMemo(() => chainAsset[nativeTokenSlug], [chainAsset, nativeTokenSlug]);

  const assetDecimals = inputAsset ? _getAssetDecimals(inputAsset) : 0;
  const priceValue = priceMap[inputAsset.priceId || ''] || 0;
  const convertValue = amountValue ? parseFloat(amountValue) / 10 ** assetDecimals : 0;
  const transformAmount = convertValue * priceValue;

  const estimatedFee = useMemo(() => {
    let _totalFee = 0;

    if (processState.feeStructure) {
      processState.feeStructure.forEach((fee) => {
        if (fee.slug !== '') {
          const asset = chainAsset[fee.slug];
          const feeDecimals = _getAssetDecimals(asset);
          const _priceValue = asset.priceId ? (priceMap[asset.priceId] ?? 0) : 0;
          const feeNumb = _priceValue * (fee.amount ? parseFloat(fee.amount) / 10 ** feeDecimals : 0);

          _totalFee += feeNumb;
        }
      });
    }

    return _totalFee;
  }, [chainAsset, priceMap, processState.feeStructure]);

  const maintainString = useMemo(() => {
    if (!poolInfo) {
      return '';
    }

    const maintainAsset = chainAsset[poolInfo?.metadata?.maintainAsset];
    const maintainBalance = poolInfo?.metadata?.maintainBalance;

    return `${getInputValuesFromString(maintainBalance, maintainAsset.decimals || 0)} ${maintainAsset.symbol}`;
  }, [poolInfo, chainAsset]);

  const poolTargets = useMemo(() => {
    const _poolTargets = poolTargetsMap[slug];

    if (!_poolTargets) {
      return [];
    } else {
      if (YieldPoolType.NOMINATION_POOL === poolType) {
        const poolTargets = _poolTargets as NominationPoolInfo[];

        for (const pool of poolTargets) {
          if (String(pool.id) === poolTargetValue) {
            return [pool];
          }
        }

        return [];
      } else if (YieldPoolType.NATIVE_STAKING === poolType || YieldPoolType.SUBNET_STAKING === poolType) {
        const validatorList = _poolTargets as ValidatorInfo[];

        if (!validatorList) {
          return [];
        }

        const result: ValidatorInfo[] = [];
        const nominations = parseNominations(poolTargetValue);
        const newValidatorList: { [address: string]: ValidatorInfo } = {};

        validatorList.forEach((validator) => {
          newValidatorList[reformatAddress(validator.address)] = validator;
        });
        nominations.forEach((nomination) => {
          if (newValidatorList?.[reformatAddress(nomination)]) {
            // remember the format of the address
            result.push(newValidatorList[reformatAddress(nomination)]);
          }
        });

        return result;
      } else {
        return [];
      }
    }
  }, [poolTargetValue, poolTargetsMap, poolType, slug]);

  // todo: will convert logic to util if is necessary
  const accountAddressItems = useMemo(() => {
    const chainInfo = poolChain ? chainInfoMap[poolChain] : undefined;

    if (!chainInfo) {
      return [];
    }

    const result: AccountAddressItemType[] = [];

    accountProxies.forEach((ap) => {
      if (!(!fromAccountProxy || ap.id === fromAccountProxy)) {
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
  }, [accountProxies, chainInfoMap, fromAccountProxy, getReformatAddress, poolChain]);

  const onFieldsChange: FormCallbacks<EarnParams>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    // TODO: field change
    const { empty, error } = simpleCheckForm(allFields, ['--asset', '--fromAccountProxy']);

    const values = convertFieldToObject<EarnParams>(allFields);

    const isFromChanged = changedFields.some((field) => field.name.toString() === 'from');

    if (isFromChanged && (poolType === YieldPoolType.NOMINATION_POOL || poolType === YieldPoolType.NATIVE_STAKING)) {
      form.resetFields(['target']);
    }

    setIsFormInvalid(empty || error);
    persistData(values);
  }, [form, persistData, poolType]);

  const handleDataForInsufficientAlert = useCallback(() => {
    const _assetDecimals = nativeAsset?.decimals || 0;

    return {
      minJoinPool: getInputValuesFromString(poolInfo?.statistic?.earningThreshold.join || '0', _assetDecimals),
      symbol: nativeAsset?.symbol || '',
      chain: chainInfoMap[poolChain].name,
      isXCM: poolInfo?.type === YieldPoolType.LENDING || poolInfo?.type === YieldPoolType.LIQUID_STAKING
    };
  }, [chainInfoMap, nativeAsset?.decimals, nativeAsset?.symbol, poolChain, poolInfo?.statistic?.earningThreshold.join, poolInfo?.type]);

  const onError = useCallback(
    (error: Error) => {
      const { chain, isXCM, minJoinPool, symbol } = handleDataForInsufficientAlert();
      const balanceDisplayInfo = _handleDisplayInsufficientEarningError(error, isXCM, nativeTokenBalance.value || '0', amountValue || '0', minJoinPool);

      if (balanceDisplayInfo) {
        openAlert({
          title: t(balanceDisplayInfo.title),
          type: NotificationType.ERROR,
          content: t(balanceDisplayInfo.message, { replace: { minJoinPool, symbol, chain } }),
          okButton: {
            text: t('ui.TRANSACTION.screen.Transaction.Earn.iUnderstand'),
            onClick: closeAlert,
            icon: CheckCircle
          }
        });

        dispatchProcessState({
          type: EarningActionType.STEP_ERROR_ROLLBACK,
          payload: error
        });

        return;
      } else if (insufficientXCMMessages.some((v) => error.message.includes(v))) {
        openAlert({
          title: t('ui.TRANSACTION.screen.Transaction.Earn.insufficientBalance'),
          type: NotificationType.ERROR,
          content: error.message,
          okButton: {
            text: t('ui.TRANSACTION.screen.Transaction.Earn.iUnderstand'),
            onClick: closeAlert,
            icon: CheckCircle
          }
        });

        dispatchProcessState({
          type: EarningActionType.STEP_ERROR_ROLLBACK,
          payload: error
        });

        return;
      }

      notify({
        message: error.message,
        type: 'error',
        duration: 8
      });

      dispatchProcessState({
        type: EarningActionType.STEP_ERROR_ROLLBACK,
        payload: error
      });
    },
    [amountValue, closeAlert, handleDataForInsufficientAlert, nativeTokenBalance.value, notify, openAlert, t]
  );

  const onSuccess = useCallback(
    (lastStep: boolean, needRollback: boolean): ((rs: SWTransactionResponse) => boolean) => {
      return (rs: SWTransactionResponse): boolean => {
        const { errors: _errors, id, processId, warnings } = rs;

        if (_errors.length || warnings.length) {
          const error = _errors[0]; // we only handle the first error for now

          if (error.message !== 'Rejected by user') {
            const displayInfo = _handleDisplayForEarningError(error);

            if (displayInfo) {
              notify({
                message: t(displayInfo.message),
                type: 'error',
                duration: 8
              });

              return false;
            }

            // hideAll();
            onError(error);

            return false;
          } else {
            dispatchProcessState({
              type: needRollback ? EarningActionType.STEP_ERROR_ROLLBACK : EarningActionType.STEP_ERROR,
              payload: error
            });

            return false;
          }
        } else if (id) {
          dispatchProcessState({
            type: EarningActionType.STEP_COMPLETE,
            payload: rs
          });

          if (lastStep) {
            processId ? onHandleOneSignConfirmation(processId) : onDone(id);

            return false;
          }

          return true;
        } else {
          return false;
        }
      };
    },
    [notify, onDone, onError, onHandleOneSignConfirmation, t]
  );

  const { earningRate, earningSlippage, stakingFee } = useTaoStakingFee(
    poolInfo,
    amountValue,
    assetDecimals,
    poolInfo.metadata.subnetData?.netuid || 0,
    ExtrinsicType.STAKING_BOND,
    setSubmitLoading
  );

  const netuid = useMemo(() => poolInfo.metadata.subnetData?.netuid, [poolInfo.metadata.subnetData]);
  const onSubmit: FormCallbacks<EarnParams>['onFinish'] = useCallback((values: EarnParams) => {
    const transactionBlockProcess = () => {
      setSubmitLoading(true);
      setIsDisableHeader(true);
      const { from, slug, target, value: _currentAmount } = values;
      let processId = processState.processId;

      const getData = (submitStep: number): SubmitYieldJoinData => {
        if ([YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING, YieldPoolType.SUBNET_STAKING].includes(poolInfo.type) && target) {
          const targets = poolTargets;

          if (poolInfo.type === YieldPoolType.NOMINATION_POOL) {
            const selectedPool = targets[0];

            return {
              slug: slug,
              address: from,
              amount: _currentAmount,
              selectedPool,
              selectedValidators: targets
            } as SubmitJoinNominationPool;
          } else {
            return {
              slug: slug,
              address: from,
              amount: _currentAmount,
              selectedValidators: targets,
              subnetData: {
                netuid: netuid,
                slippage: maxSlippage?.slippage.toNumber(),
                stakingFee: stakingFee
              }
            } as SubmitJoinNativeStaking;
          }
        } else {
          return getJoinYieldParams(poolInfo, from, _currentAmount, processState.feeStructure[submitStep]);
        }
      };

      const path: OptimalYieldPath = {
        steps: processState.steps,
        totalFee: processState.feeStructure
      };

      const submitData = async (step: number): Promise<boolean> => {
        const isFirstStep = step === 0;
        const isLastStep = step === processState.steps.length - 1;
        const needRollback = step === 1;
        const data = getData(step);

        if (isFirstStep) {
          processId = getId();
        }

        dispatchProcessState({
          type: EarningActionType.STEP_SUBMIT,
          payload: isFirstStep ? { processId } : null
        });

        try {
          if (isFirstStep) {
            const validatePromise = validateYieldProcess({
              path: path,
              data: data
            });

            const _errors = await validatePromise;

            if (_errors.length) {
              onError(_errors[0]);

              return false;
            } else {
              dispatchProcessState({
                type: EarningActionType.STEP_COMPLETE,
                payload: true
              });
              dispatchProcessState({
                type: EarningActionType.STEP_SUBMIT,
                payload: null
              });

              return await submitData(step + 1);
            }
          } else {
            if (oneSign && path.steps.length > 2) {
              const submitPromise: Promise<SWTransactionResponse> = submitProcess({
                address: from,
                id: processId,
                type: ProcessType.EARNING,
                request: {
                  path: path,
                  data: data,
                  currentStep: step
                }
              });

              const rs = await submitPromise;

              onSuccess(true, needRollback)(rs);

              return true;
            } else {
              const submitPromise: Promise<SWTransactionResponse> = submitJoinYieldPool({
                path: path,
                data: data,
                currentStep: step
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
        submitData(currentStep)
          .catch(onError)
          .finally(() => {
            setSubmitLoading(false);
            setIsDisableHeader(false);
          });
      }, 300);
    };

    if (chainStakingBoth) {
      const chainInfo = chainStakingBoth && chainInfoMap[chainStakingBoth];

      const symbol = (!!chainInfo && chainInfo?.substrateInfo?.symbol) || '';
      const originChain = (!!chainInfo && chainInfo?.name) || '';

      openAlert({
        type: NotificationType.WARNING,
        content:
          (<>
            <div className={'earning-alert-content'}>
              {t('ui.TRANSACTION.screen.Transaction.Earn.dualStakingFreezeWarning', { replace: { symbol: symbol, originChain: originChain } })}
            </div>
          </>),
        title: t('ui.TRANSACTION.screen.Transaction.Earn.continueStaking'),
        okButton: {
          text: t('ui.TRANSACTION.screen.Transaction.Earn.continue'),
          onClick: () => {
            closeAlert();
            transactionBlockProcess();
          }
        },
        cancelButton: {
          text: t('ui.TRANSACTION.screen.Transaction.Earn.cancel'),
          onClick: closeAlert
        }
      });
    } else {
      transactionBlockProcess();
    }
  }, [chainInfoMap, chainStakingBoth, closeAlert, currentStep, maxSlippage?.slippage, netuid, onError, onSuccess, oneSign, openAlert, poolInfo, poolTargets, processState.feeStructure, processState.processId, processState.steps, setIsDisableHeader, setSubmitLoading, stakingFee, t]);

  const onClickSubmit = useCallback((values: EarnParams) => {
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

  const isSubnetStaking = useMemo(() => [YieldPoolType.SUBNET_STAKING].includes(poolType), [poolType]);
  const subnetToken = useMemo(() => {
    return getSubnetStakingTokenName(poolInfo.chain, poolInfo.metadata.subnetData?.netuid || 0);
  }, [getSubnetStakingTokenName, poolInfo.chain, poolInfo.metadata.subnetData?.netuid]);

  // For subnet staking
  const [isSlippageModalVisible, setIsSlippageModalVisible] = useState<boolean>(false);

  const isDisabledSubnetContent = useMemo(
    () =>
      !isSubnetStaking ||
      !amountValue ||
      (mustChooseTarget && !poolTargetValue),

    [isSubnetStaking, amountValue, mustChooseTarget, poolTargetValue]
  );
  const alertBoxRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);

  const isSlippageAcceptable = useMemo(() => {
    if (earningSlippage === null || !amountValue) {
      return true;
    }

    return earningSlippage <= maxSlippage.slippage.toNumber();
  }, [earningSlippage, maxSlippage, amountValue]);

  useEffect(() => {
    if (!isSlippageAcceptable && !hasScrolled && alertBoxRef.current) {
      alertBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHasScrolled(true);
    }
  }, [isSlippageAcceptable, hasScrolled]);

  const onSelectSlippage = useCallback((slippage: SlippageType) => {
    setMaxSlippage(slippage);
  }, []);

  const closeSlippageModal = useCallback(() => {
    inactiveModal(EARNING_SLIPPAGE_MODAL);
    setIsSlippageModalVisible(false);
  }, [inactiveModal]);

  const onOpenSlippageModal = useCallback(() => {
    setIsSlippageModalVisible(true);
    activeModal(EARNING_SLIPPAGE_MODAL);
  }, [activeModal]);

  const renderSubnetStaking = useCallback(() => {
    return (
      <>
        <MetaInfo.Default
          className='__label-bottom'
          label={t('ui.TRANSACTION.screen.Transaction.Earn.subnet')}
        >
          <div className='__subnet-wrapper'>
            <Logo
              className='__item-logo'
              isShowSubLogo={false}
              network={poolChain}
              shape='circle'
              size={24}
              token={subnetToken}
            />
            <span
              className='chain-name'
              style={{ color: '#A6A6A6' }}
            >
              {poolInfo.metadata.shortName}
            </span>
          </div>
        </MetaInfo.Default>

        {!isDisabledSubnetContent && earningRate > 0 && (
          <>
            <MetaInfo.Number
              className='__label-bottom'
              decimals={assetDecimals}
              label={t('ui.TRANSACTION.screen.Transaction.Earn.expectedAlphaAmount')}
              suffix={poolInfo.metadata?.subnetData?.subnetSymbol || ''}
              value={BigN(amountValue).multipliedBy(1 / earningRate)}
            />
            <MetaInfo.Default
              className='__label-bottom'
              label={t('ui.TRANSACTION.screen.Transaction.Earn.conversionRate')}
            >
              <div className='__subnet-rate'>
                <span
                  className='chain-name'
                  style={{ color: '#A6A6A6' }}
                >
                  {`1 ${inputAsset.symbol} = `}
                </span>
                <Number
                  className='__label-bottom'
                  decimal={assetDecimals}
                  suffix={poolInfo.metadata?.subnetData?.subnetSymbol || ''}
                  value={BigN(1).multipliedBy(10 ** assetDecimals).multipliedBy(1 / earningRate)}
                />
              </div>
            </MetaInfo.Default>
          </>
        )}

        <MetaInfo.Default
          label={
            <Tooltip
              placement={'topLeft'}
              title={'Transaction will not be executed if the price changes more than this slippage'}
            >
              <div className={'__max-slippage'}>
                <div className='__label-bottom'>{t('ui.TRANSACTION.screen.Transaction.Earn.slippage')}</div>
                <Icon
                  className='__label-bottom'
                  customSize={'16px'}
                  phosphorIcon={Info}
                  size='sm'
                />
              </div>
            </Tooltip>
          }
        >
          <div className='__slippage-wrapper'>
            <span
              className='chain-name'
              style={{ color: isSlippageAcceptable ? '#A6A6A6' : '#BF1616' }}
            >
              {+(maxSlippage.slippage.toNumber() * 100).toFixed(10)}%
            </span>
            <div
              className='__slippage-editor-button'
              onClick={onOpenSlippageModal}
            >
              <Icon
                className='__slippage-editor-button-icon'
                phosphorIcon={PencilSimpleLine}
                size='xs'
              />
            </div>
          </div>
        </MetaInfo.Default>
      </>
    );
  }, [amountValue, assetDecimals, earningRate, inputAsset.symbol, isDisabledSubnetContent, isSlippageAcceptable, maxSlippage.slippage, onOpenSlippageModal, poolChain, poolInfo.metadata.shortName, poolInfo.metadata?.subnetData?.subnetSymbol, subnetToken, t]);

  // For subnet staking

  const isDisabledButton = useMemo(
    () =>
      // checkMintLoading ||
      stepLoading ||
      !!connectionError ||
      !amountValue ||
      !isBalanceReady ||
      isFormInvalid ||
      submitLoading ||
      targetLoading ||
      !isSlippageAcceptable ||
      (mustChooseTarget && !poolTargetValue),

    [stepLoading, connectionError, amountValue, isBalanceReady, isFormInvalid, submitLoading, targetLoading, isSlippageAcceptable, mustChooseTarget, poolTargetValue]
  );

  const renderMetaInfo = useCallback(() => {
    const value = amountValue ? parseFloat(amountValue) / 10 ** assetDecimals : 0;
    const assetSymbol = inputAsset.symbol;

    const assetEarnings =
      poolInfo?.statistic && 'assetEarning' in poolInfo.statistic ? poolInfo.statistic.assetEarning : [];
    const derivativeAssets = poolInfo?.metadata && 'derivativeAssets' in poolInfo.metadata ? poolInfo.metadata.derivativeAssets : [];
    const showFee = [YieldPoolType.LENDING, YieldPoolType.LIQUID_STAKING].includes(poolInfo?.type);

    let minJoinPool: string | undefined;

    if (poolInfo?.statistic) {
      const minPoolJoin = poolInfo.statistic.earningThreshold.join;
      const targeted = poolTargets[0];

      if (targeted) {
        if ('minBond' in targeted) {
          const minTargetJoin = new BigN(targeted.minBond || '0');

          minJoinPool = minTargetJoin.gt(minPoolJoin || '0') ? minTargetJoin.toString() : minPoolJoin;
        } else {
          minJoinPool = minPoolJoin;
        }
      } else {
        minJoinPool = minPoolJoin;
      }
    }

    return (
      <MetaInfo
        labelColorScheme={'gray'}
        spaceSize={'sm'}
        valueColorScheme={'gray'}
      >
        {!!assetEarnings.length &&
          assetEarnings.map((item) => {
            if (item.exchangeRate === undefined || !derivativeAssets.length) {
              return null;
            }

            const derivativeAssetSlug = derivativeAssets[0];
            const derivativeAssetInfo = chainAsset[derivativeAssetSlug];

            return (
              <MetaInfo.Number
                decimals={0}
                key={item.slug}
                label={t('ui.TRANSACTION.screen.Transaction.Earn.youllReceive')}
                suffix={_getAssetSymbol(derivativeAssetInfo)}
                value={value / item.exchangeRate}
              />
            );
          })}
        {(
          <MetaInfo.Number
            className='__label-bottom'
            decimals={assetDecimals}
            label={t('ui.TRANSACTION.screen.Transaction.Earn.minimumActiveStake')}
            suffix={assetSymbol}
            value={minJoinPool || 0}
          />
        )}

        {!isSubnetStaking
          ? (
            <MetaInfo.Chain
              chain={chainValue}
              label={t('ui.TRANSACTION.screen.Transaction.Earn.network')}
            />
          )
          : (renderSubnetStaking())
        }
        {showFee && (
          <MetaInfo.Number
            className='__label-bottom'
            decimals={0}
            label={t('ui.TRANSACTION.screen.Transaction.Earn.estimatedFee')}
            prefix={(currencyData?.isPrefix && currencyData.symbol) || ''}
            suffix={(!currencyData?.isPrefix && currencyData?.symbol) || ''}
            value={estimatedFee}
          />
        )}
      </MetaInfo>
    );
  }, [amountValue, assetDecimals, chainAsset, chainValue, currencyData?.isPrefix, currencyData.symbol, estimatedFee, inputAsset.symbol, isSubnetStaking, poolInfo.metadata, poolInfo.statistic, poolInfo?.type, poolTargets, renderSubnetStaking, t]);

  const onPreCheck = usePreCheckAction(fromValue);

  const exType = useMemo(() => getExtrinsicTypeByPoolInfo({ chain: chainValue, type: poolType, slug }), [poolType, chainValue, slug]);

  useRestoreTransaction(form);
  useInitValidateTransaction(validateFields, form, defaultData);

  const onBack = useCallback(() => {
    if (firstStep) {
      goBack();
    } else {
      openAlert({
        title: t('ui.TRANSACTION.screen.Transaction.Earn.cancelEarningProcess'),
        type: NotificationType.WARNING,
        content: t('ui.TRANSACTION.screen.Transaction.Earn.confirmCancelEarningProcess'),
        okButton: {
          text: t('ui.TRANSACTION.screen.Transaction.Earn.cancelEarning'),
          onClick: goBack,
          schema: 'warning'
        },
        cancelButton: {
          text: t('ui.TRANSACTION.screen.Transaction.Earn.notNow'),
          onClick: closeAlert
        }
      });
    }
  }, [closeAlert, firstStep, goBack, openAlert, t]);

  const onCancelInstructionModal = useCallback(() => {
    if (!isClickInfoButtonRef.current) {
      goBack();
    }
  }, [goBack]);

  const altChain = useMemo(() => {
    if (poolInfo && (isLiquidPool(poolInfo) || isLendingPool(poolInfo))) {
      const asset = chainAsset[poolInfo.metadata.altInputAssets || ''];

      return asset ? asset.originChain : '';
    }

    return '';
  }, [chainAsset, poolInfo]);

  useEffect(() => {
    if (poolChain) {
      if (altChain) {
        if (checkChainConnected(poolChain) && checkChainConnected(altChain)) {
          setScreenLoading(false);
        } else if (!checkChainConnected(altChain)) {
          turnOnChain(altChain);
          setIsLoadingChainConnection(true);
        } else {
          setIsLoadingChainConnection(true);
        }
      } else {
        if (checkChainConnected(poolChain)) {
          setScreenLoading(false);
        } else {
          setIsLoadingChainConnection(true);
        }
      }
    }
  }, [altChain, poolChain, checkChainConnected, turnOnChain]);

  const { altChainName, poolChainName } = useMemo(() => ({
    poolChainName: poolChain ? chainInfoMap[poolChain]?.name : '',
    altChainName: altChain ? chainInfoMap[altChain]?.name : ''
  }), [altChain, chainInfoMap, poolChain]);

  useEffect(() => {
    let timer: NodeJS.Timer;
    let timeout: NodeJS.Timeout;

    if (isLoadingChainConnection && poolChain) {
      const checkConnection = () => {
        if (altChain) {
          if (checkChainConnected(poolChain) && checkChainConnected(altChain)) {
            setIsConnectingChainSuccess(true);
            setIsLoadingChainConnection(false);
            clearTimeout(timeout);
            setScreenLoading(false);
          }
        } else {
          if (checkChainConnected(poolChain)) {
            setIsConnectingChainSuccess(true);
            clearInterval(timer);
            clearTimeout(timeout);
            setScreenLoading(false);
          }
        }
      };

      // Check network connection every 0.5 second
      timer = setInterval(checkConnection, 500);

      // Set timeout for 3 seconds
      timeout = setTimeout(() => {
        clearInterval(timer);

        if (!isConnectingChainSuccess) {
          setIsLoadingChainConnection(false);
          openAlert({
            title: t('ui.TRANSACTION.screen.Transaction.Earn.connectionLost'),
            type: NotificationType.ERROR,
            content: altChain
              ? t('ui.TRANSACTION.screen.Transaction.Earn.dualNetworkConnectionLost', { replace: { poolChainName: poolChainName, altChainName: altChainName } })
              : t('ui.TRANSACTION.screen.Transaction.Earn.networkConnectionLost', { replace: { poolChainName: poolChainName } }),
            okButton: {
              text: t('ui.TRANSACTION.screen.Transaction.Earn.iUnderstand'),
              onClick: closeAlert,
              icon: CheckCircle
            }
          });
        }
      }, 3000);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [altChain, poolChain, checkChainConnected, closeAlert, isConnectingChainSuccess, isLoadingChainConnection, openAlert, t, poolChainName, altChainName]);

  useEffect(() => {
    form.setFieldValue('asset', inputAsset.slug || '');
  }, [form, inputAsset.slug]);

  useEffect(() => {
    if (!fromValue && accountAddressItems.length === 1) {
      form.setFieldValue('from', accountAddressItems[0].address);
    }
  }, [accountAddressItems, form, fromValue]);

  useEffect(() => {
    if (currentStep === 0) {
      const submitData: OptimalYieldPathParams = {
        address: fromValue,
        amount: amountValue,
        slug: slug,
        targets: poolTargetValue ? poolTargets : undefined,
        netuid: netuid
      };

      const newData = JSON.stringify(submitData);

      if (newData !== submitString) {
        setSubmitString(newData);

        setStepLoading(true);

        addLazy(
          loadingStepPromiseKey,
          () => {
            getOptimalYieldPath(submitData)
              .then((res) => {
                dispatchProcessState({
                  payload: {
                    steps: res.steps,
                    feeStructure: res.totalFee
                  },
                  type: EarningActionType.STEP_CREATE
                });

                const errorNetwork = res.connectionError;

                if (errorNetwork) {
                  const networkName = chainInfoMap[errorNetwork].name;
                  const text = 'Please enable {{networkName}} network'.replace('{{networkName}}', networkName);

                  notify({
                    message: text,
                    type: 'error',
                    duration: 8
                  });
                }

                setConnectionError(errorNetwork);
              })
              .catch((error) => logger.error('Failed to validate yield process', error))
              .finally(() => setStepLoading(false));
          },
          1000,
          5000,
          false
        );
      }
    }
  }, [submitString, currentStep, chainInfoMap, slug, fromValue, amountValue, notify, poolTargetValue, poolTargets, netuid]);

  // useEffect(() => {
  //   setCheckMintLoading(true);
  //
  //   unlockDotCheckCanMint({
  //     slug: poolInfo?.slug || '',
  //     address: fromValue,
  //     network: poolInfo?.chain || ''
  //   })
  //     .then((value) => {
  //       setCanMint(value);
  //     })
  //     .finally(() => {
  //       setCheckMintLoading(false);
  //     });
  //
  //   return () => {
  //     setCanMint(false);
  //   };
  // }, [fromValue, poolInfo?.chain, poolInfo?.slug]);

  useEffect(() => {
    let unmount = false;

    if ((!!chainValue && !!fromValue && chainState?.active) || forceFetchValidator) {
      setTargetLoading(true);
      fetchPoolTarget({ slug })
        .then((result) => {
          if (!unmount) {
            store.dispatch({ type: 'earning/updatePoolTargets', payload: result });
          }
        })
        .catch((error) => logger.error('Failed to fetch pool target', error))
        .finally(() => {
          if (!unmount) {
            setTargetLoading(false);
            setForceFetchValidator(false);
          }
        });
    }

    return () => {
      unmount = true;
    };
  }, [chainState?.active, forceFetchValidator, slug, chainValue, fromValue]);

  useEffect(() => {
    if (!compound && !screenLoading) {
      isClickInfoButtonRef.current = false;
      activeModal(instructionModalId);
    }
  }, [activeModal, compound, screenLoading]);

  const subHeaderButtons: ButtonProps[] = useMemo(() => {
    return [
      {
        icon: <InfoIcon />,
        disabled: screenLoading || submitLoading,
        onClick: () => {
          if (screenLoading || submitLoading) {
            return;
          }

          isClickInfoButtonRef.current = true;
          activeModal(instructionModalId);
        }
      }
    ];
  }, [activeModal, screenLoading, submitLoading]);

  useEffect(() => {
    setSubHeaderRightButtons(subHeaderButtons);

    return () => {
      setSubHeaderRightButtons(undefined);
    };
  }, [setSubHeaderRightButtons, subHeaderButtons]);

  useEffect(() => {
    setBackProps((prev) => ({
      ...prev,
      disabled: submitLoading
    }));
  }, [setBackProps, submitLoading]);

  useEffect(() => {
    setBackProps((prev) => ({
      ...prev,
      onClick: onBack
    }));
  }, [onBack, setBackProps]);

  return (
    <>
      {
        screenLoading && (
          <LoadingScreen />
        )
      }
      {
        !screenLoading && (
          <>
            <TransactionContent>
              {processState.steps && (
                <>
                  <div className={'__process-item-wrapper'}>
                    {stepLoading
                      ? (
                        <div className={'__process-item-loading'}>
                          <ActivityIndicator size={24} />
                        </div>
                      )
                      : (
                        <EarningProcessItem
                          index={processState.currentStep}
                          stepName={processState.steps[processState.currentStep]?.name}
                          stepStatus={processState.stepResults[processState.currentStep]?.status}
                        />
                      )}
                  </div>
                </>
              )}

              <Form
                className={'form-container form-space-sm'}
                form={form}
                initialValues={formDefault}
                onFieldsChange={onFieldsChange}
                onFinish={onClickSubmit}
              >
                <HiddenInput fields={hideFields} />

                <Form.Item
                  name={'from'}
                >
                  <AccountAddressSelector
                    disabled={!isAllAccount}
                    items={accountAddressItems}
                  />
                </Form.Item>

                <div className={'__balance-display-area'}>
                  <FreeBalanceToEarn
                    address={fromValue}
                    balanceType={balanceTypeForPool}
                    hidden={submitStepType !== YieldStepType.XCM}
                    label={`${t('ui.TRANSACTION.screen.Transaction.Earn.availableBalance')}`}
                    onBalanceReady={setIsBalanceReady}
                    tokens={balanceTokens}
                  />

                  <FreeBalance
                    address={fromValue}
                    balanceType={balanceTypeForPool}
                    chain={poolInfo.chain}
                    hidden={[YieldStepType.XCM].includes(submitStepType)}
                    isSubscribe={true}
                    label={`${t('ui.TRANSACTION.screen.Transaction.Earn.availableBalance')}:`}
                    tokenSlug={inputAsset.slug}
                  />
                </div>

                <Form.Item
                  name={'value'}
                >
                  <AmountInput
                    decimals={assetDecimals}
                    disabled={processState.currentStep !== 0}
                    maxValue={'1'} // todo: no maxValue, this is just temporary solution
                    showMaxButton={false}
                  />
                </Form.Item>

                <div className={'__transformed-amount-value'}>
                  <Number
                    decimal={0}
                    prefix={(currencyData?.isPrefix && currencyData.symbol) || ''}
                    suffix={(!currencyData?.isPrefix && currencyData?.symbol) || ''}
                    value={transformAmount}
                  />
                </div>

                {poolType === YieldPoolType.NOMINATION_POOL && (
                  <Form.Item
                    name={'target'}
                  >
                    <EarningPoolSelector
                      chain={poolChain}
                      defaultValue={defaultData.target}
                      disabled={submitLoading}
                      from={fromValue}
                      label={t('ui.TRANSACTION.screen.Transaction.Earn.pool')}
                      loading={targetLoading}
                      setForceFetchValidator={setForceFetchValidator}
                      slug={slug}
                    />
                  </Form.Item>
                )}

                {(poolType === YieldPoolType.NATIVE_STAKING || poolType === YieldPoolType.SUBNET_STAKING) && (
                  <Form.Item
                    name={'target'}
                  >
                    <EarningValidatorSelector
                      chain={chainValue}
                      disabled={submitLoading}
                      from={fromValue}
                      loading={targetLoading}
                      setForceFetchValidator={setForceFetchValidator}
                      slug={slug}
                    />
                  </Form.Item>
                )}
              </Form>

              {renderMetaInfo()}

              <AlertBox
                className='__alert-box'
                description={STAKE_ALERT_DATA.description.replace('{tokenAmount}', maintainString)}
                title={STAKE_ALERT_DATA.title}
                type='warning'
              />

              {!isSlippageAcceptable && (
                <div ref={alertBoxRef}>
                  <AlertBox
                    className='__alert-box'
                    description={t('ui.TRANSACTION.screen.Transaction.Earn.stakeSlippageExceeded', { replace: { slippage: (earningSlippage * 100).toFixed(2) } })}
                    title='Slippage too high!'
                    type='error'
                  />
                </div>
              )}
            </TransactionContent>
            <TransactionFooter>
              <Button
                disabled={isDisabledButton}
                icon={(
                  <Icon
                    phosphorIcon={PlusCircle}
                    weight={'fill'}
                  />
                )}
                loading={submitLoading}
                onClick={onPreCheck(form.submit, exType)}
              >
                {t('ui.TRANSACTION.screen.Transaction.Earn.stake')}
              </Button>
            </TransactionFooter>
          </>
        )
      }

      <EarningInstructionModal
        closeAlert={closeAlert}
        isShowStakeMoreButton={!isClickInfoButtonRef.current}
        onCancel={onCancelInstructionModal}
        openAlert={openAlert}
        slug={slug}
      />
      {isSlippageModalVisible && (
        <SlippageModal
          modalId={EARNING_SLIPPAGE_MODAL}
          onApplySlippage={onSelectSlippage}
          onCancel={closeSlippageModal}
          slippageValue={maxSlippage}
        />
      )}
    </>
  );
};

const Wrapper: React.FC<Props> = (props: Props) => {
  const { className } = props;

  return (
    <EarnOutlet
      className={CN(className)}
      path={'/transaction/earn'}
      stores={['price', 'chainStore', 'assetRegistry', 'earning']}
    >
      <Component />
    </EarnOutlet>
  );
};

const Earn = styled(Wrapper)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__process-item-wrapper': {
      paddingBottom: token.paddingSM,
      borderBottom: '2px solid',
      borderBottomColor: 'rgba(33, 33, 33, 0.80)',
      marginBottom: token.marginSM
    },

    '.__process-item-loading': {
      height: 32,
      display: 'flex',
      alignItems: 'center'
    },

    '.__balance-display-area': {
      marginBottom: token.marginSM
    },

    '.__transformed-amount-value': {
      color: token.colorTextLight4,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      marginBottom: token.marginSM,

      '.ant-number, .ant-typography': {
        color: 'inherit !important',
        fontSize: 'inherit !important',
        fontWeight: 'inherit !important',
        lineHeight: 'inherit'
      }
    },

    '.__alert-box': {
      marginTop: token.marginSM
    },

    // For subnet
    '.__subnet-wrapper': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXS,
      minWidth: 0
    },

    '.__subnet-rate': {
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem'
    },

    '.__slippage-wrapper': {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      minWidth: 0
    },

    '.__slippage-editor-button': {
      cursor: 'pointer'
    },

    // TODO: recheck with other UI
    '.__max-slippage': {
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem'
    },
    '.__label-bottom, .__label-bottom *': {
      color: `${token['gray-5']} !important`
    },
    '.__label-bottom, .__value': {
      color: `${token['gray-5']} !important`
    }
  };
});

export default Earn;
