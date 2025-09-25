// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { ExtrinsicType, NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { _handleDisplayInsufficientEarningError } from '@subwallet/extension-base/core/logic-validation/earning';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { _getAssetDecimals, _getAssetSymbol, _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { isLendingPool, isLiquidPool } from '@subwallet/extension-base/services/earning-service/utils';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { EarningStatus, NominationPoolInfo, OptimalYieldPath, OptimalYieldPathParams, ProcessType, SlippageType, SubmitJoinNativeStaking, SubmitJoinNominationPool, SubmitYieldJoinData, ValidatorInfo, YieldPoolType, YieldStepType } from '@subwallet/extension-base/types';
import { addLazy } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
import { AccountAddressSelector, AlertBox, AmountInput, EarningPoolSelector, EarningValidatorSelector, HiddenInput, InfoIcon, LoadingScreen, MetaInfo, SlippageModal } from '@subwallet/extension-web-ui/components';
import { EarningProcessItem } from '@subwallet/extension-web-ui/components/Earning';
import { getInputValuesFromString } from '@subwallet/extension-web-ui/components/Field/AmountInput';
import { EarningInstructionModal } from '@subwallet/extension-web-ui/components/Modal/Earning';
import { CREATE_RETURN, DEFAULT_ROUTER_PATH, EARNING_INSTRUCTION_MODAL, EARNING_SLIPPAGE_MODAL, EVM_ACCOUNT_TYPE, STAKE_ALERT_DATA, SUBSTRATE_ACCOUNT_TYPE } from '@subwallet/extension-web-ui/constants';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { WebUIContext } from '@subwallet/extension-web-ui/contexts/WebUIContext';
import { useChainConnection, useCoreCreateReformatAddress, useCreateGetSubnetStakingTokenName, useFetchChainState, useGetBalance, useGetNativeTokenSlug, useInitValidateTransaction, useOneSignProcess, usePreCheckAction, useRestoreTransaction, useSelector, useSetSelectedAccountTypes, useTransactionContext, useWatchTransaction, useYieldPositionDetail } from '@subwallet/extension-web-ui/hooks';
import { useTaoStakingFee } from '@subwallet/extension-web-ui/hooks/earning/useTaoStakingFee';
import { fetchPoolTarget, getOptimalYieldPath, submitJoinYieldPool, submitProcess, validateYieldProcess } from '@subwallet/extension-web-ui/messaging';
import { DEFAULT_YIELD_PROCESS, EarningActionType, earningReducer } from '@subwallet/extension-web-ui/reducer';
import { store } from '@subwallet/extension-web-ui/stores';
import { AccountAddressItemType, EarnParams, FormCallbacks, FormFieldData, Theme, ThemeProps } from '@subwallet/extension-web-ui/types';
import { convertFieldToObject, getExtrinsicTypeByPoolInfo, getValidatorKey, parseNominations, reformatAddress, simpleCheckForm } from '@subwallet/extension-web-ui/utils';
import { ActivityIndicator, Button, ButtonProps, Form, Icon, Logo, ModalContext, Number, Tooltip, Typography } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { CheckCircle, Info, PencilSimpleLine, PlusCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Divider } from 'semantic-ui-react';
import styled, { useTheme } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import useNotification from '../../../hooks/common/useNotification';
import { getJoinYieldParams } from '../helper';
import { EarnOutlet, FreeBalance, FreeBalanceToEarn, TransactionContent, TransactionFooter } from '../parts';

type Props = ThemeProps;
type ComponentProps = { className?: string; }

const hideFields: Array<keyof EarnParams> = ['slug', 'chain', 'asset', 'fromAccountProxy'];
const validateFields: Array<keyof EarnParams> = ['from'];
const loadingStepPromiseKey = 'earning.step.loading';

const instructionModalId = EARNING_INSTRUCTION_MODAL;

// Not enough balance to xcm;
export const insufficientXCMMessages = ['You can only enter a maximum'];

const earningTypeLabelMap = {
  [YieldPoolType.NATIVE_STAKING]: 'Direct nomination',
  [YieldPoolType.NOMINATION_POOL]: 'Nomination pool',
  [YieldPoolType.LENDING]: 'Lending',
  [YieldPoolType.LIQUID_STAKING]: 'Liquid staking',
  [YieldPoolType.PARACHAIN_STAKING]: 'Direct nomination',
  [YieldPoolType.SINGLE_FARMING]: 'Single farming',
  [YieldPoolType.SUBNET_STAKING]: 'Subnet staking'
};

type LocationStateRW = {
  from?: string
}

const Component = ({ className }: ComponentProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { isWebUI } = useContext(ScreenContext);
  const { token } = useTheme() as Theme;
  const { setOnBack } = useContext(WebUIContext);
  const { currencyData } = useSelector((state) => state.price);
  const stateLocation = useLocation().state as LocationStateRW;
  const navigate = useNavigate();

  const { closeAlert, defaultData, goBack, onDone,
    openAlert, persistData,
    setBackProps, setSubHeaderRightButtons } = useTransactionContext<EarnParams>();

  const { fromAccountProxy, hasPreSelectTarget, redirectFromPreview, slug, target } = defaultData;
  const defaultTarget = useRef<string>(target);
  const autoCheckValidatorGetFromPreview = useRef<boolean>(true);
  const autoCheckCompoundRef = useRef<boolean>(true);
  const isReadyToShowAlertRef = useRef<boolean>(true);
  const { accountProxies, isAllAccount } = useSelector((state) => state.accountState);
  const [, setReturnPath] = useLocalStorage(CREATE_RETURN, DEFAULT_ROUTER_PATH);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const poolInfoMap = useSelector((state) => state.earning.poolInfoMap);
  const poolTargetsMap = useSelector((state) => state.earning.poolTargetsMap);
  const chainAsset = useSelector((state) => state.assetRegistry.assetRegistry);
  const priceMap = useSelector((state) => state.price.priceMap);

  const [form] = Form.useForm<EarnParams>();
  const [isFromStakingRW, setIsFromStakingRW] = useState(false);
  const formDefault = useMemo((): EarnParams => ({ ...defaultData }), [defaultData]);

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
  const { nativeTokenBalance } = useGetBalance(chainValue, fromValue);
  const { checkChainConnected, turnOnChain } = useChainConnection();
  const [isConnectingChainSuccess, setIsConnectingChainSuccess] = useState<boolean>(false);
  const [isLoadingChainConnection, setIsLoadingChainConnection] = useState<boolean>(false);
  const [useParamValidator, setUseParamValidator] = useState<boolean>(hasPreSelectTarget);
  const setSelectedAccountTypes = useSetSelectedAccountTypes(false);

  const poolInfo = poolInfoMap[slug];
  const poolType = poolInfo?.type || '' as YieldPoolType;
  const poolChain = poolInfo?.chain || '';

  const [isBalanceReady, setIsBalanceReady] = useState<boolean>(true);
  const [forceFetchValidator, setForceFetchValidator] = useState(false);
  const [targetLoading, setTargetLoading] = useState(true);
  const [stepLoading, setStepLoading] = useState<boolean>(true);
  const [screenLoading, setScreenLoading] = useState(true);
  const [checkValidAccountLoading, setCheckValidAccountLoading] = useState(true);
  const [checkCompoundLoading, setCheckCompoundLoading] = useState(true);
  const [submitString, setSubmitString] = useState<string | undefined>();
  const [connectionError, setConnectionError] = useState<string>();
  // const [, setCanMint] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  // const [checkMintLoading, setCheckMintLoading] = useState(false);
  const [isFormInvalid, setIsFormInvalid] = useState(true);
  const [maxSlippage, setMaxSlippage] = useState<SlippageType>({ slippage: new BigN(0.005), isCustomType: true });

  const chainState = useFetchChainState(poolInfo?.chain || '');

  const mustChooseTarget = useMemo(
    () => !!poolType && [YieldPoolType.NATIVE_STAKING, YieldPoolType.SUBNET_STAKING, YieldPoolType.NOMINATION_POOL].includes(poolType),
    [poolType]
  );

  const balanceTokens = useMemo(() => {
    const result: Array<{ chain: string; token: string }> = [];

    if (!poolInfo) {
      return [];
    }

    const _chain = poolInfo.chain;

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

  const inputAsset = useMemo<_ChainAsset | undefined>(
    () => chainAsset[poolInfo?.metadata?.inputAsset || ''],
    [chainAsset, poolInfo?.metadata?.inputAsset]
  );

  const nativeAsset: _ChainAsset | undefined = useMemo(() => chainAsset[nativeTokenSlug], [chainAsset, nativeTokenSlug]);

  const assetDecimals = inputAsset ? _getAssetDecimals(inputAsset) : 0;
  const priceValue = priceMap[inputAsset?.priceId || ''] || 0;
  const convertValue = amountValue ? parseFloat(amountValue) / 10 ** assetDecimals : 0;
  const transformAmount = convertValue * priceValue;

  const estimatedFee = useMemo(() => {
    let _totalFee = 0;

    if (processState.feeStructure) {
      processState.feeStructure.forEach((fee) => {
        if (fee.slug !== '') {
          const asset = chainAsset[fee.slug];
          const feeDecimals = _getAssetDecimals(asset);
          const _priceValue = asset.priceId ? priceMap[asset.priceId] : 0;
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
            text: t('I understand'),
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
          title: t('Insufficient balance'),
          type: NotificationType.ERROR,
          content: error.message,
          okButton: {
            text: t('I understand'),
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

  const onHandleOneSignConfirmation = useCallback((transactionProcessId: string) => {
    navigate(`/transaction-submission?transaction-process-id=${transactionProcessId}`);
  }, [navigate]);

  const onSuccess = useCallback(
    (lastStep: boolean, needRollback: boolean): ((rs: SWTransactionResponse) => boolean) => {
      return (rs: SWTransactionResponse): boolean => {
        const { errors: _errors, id, processId, warnings } = rs;

        if (_errors.length || warnings.length) {
          if (_errors[0]?.message !== 'Rejected by user') {
            if (
              _errors[0]?.message.startsWith('UnknownError Connection to Indexed DataBase server lost') ||
              _errors[0]?.message.startsWith('Provided address is invalid, the capitalization checksum test failed') ||
              _errors[0]?.message.startsWith('connection not open on send()')
            ) {
              notify({
                message: t('Your selected network has lost connection. Update it by re-enabling it or changing network provider'),
                type: 'error',
                duration: 8
              });

              return false;
            }

            // hideAll();
            onError(_errors[0]);

            return false;
          } else {
            dispatchProcessState({
              type: needRollback ? EarningActionType.STEP_ERROR_ROLLBACK : EarningActionType.STEP_ERROR,
              payload: _errors[0]
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

  const netuid = useMemo(() => poolInfo?.metadata.subnetData?.netuid, [poolInfo?.metadata.subnetData]);
  const onSubmit: FormCallbacks<EarnParams>['onFinish'] = useCallback((values: EarnParams) => {
    if (!poolInfo) {
      return;
    }

    setSubmitLoading(true);
    const { from, slug, target, value: _currentAmount } = values;
    let processId = processState.processId;

    const getData = (submitStep: number): SubmitYieldJoinData => {
      if ([YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING, YieldPoolType.SUBNET_STAKING].includes(poolInfo.type) && target) {
        const targets = poolTargets;

        if (poolInfo?.type === YieldPoolType.NOMINATION_POOL) {
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

    const checkValidatorConfirmationModal = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        const maxCount = poolInfo?.statistic?.maxCandidatePerFarmer ?? 1;
        const userSelectedPoolCount = poolTargetValue?.split(',').length ?? 1;
        const label = getValidatorLabel(chainValue);
        const isRelayChain = _STAKING_CHAIN_GROUP.relay.includes(chainValue);

        if (isRelayChain && (userSelectedPoolCount < maxCount && label === 'Validator')) {
          openAlert({
            title: t('Pay attention!'),
            content: t('You are recommended to choose {{maxCount}} validators to optimize your earnings. Do you wish to continue with {{userSelectedPoolCount}} validator{{x}}?', { replace: { maxCount, userSelectedPoolCount, x: userSelectedPoolCount === 1 ? '' : 's' } }),
            okButton: {
              text: t('Continue'),
              onClick: () => {
                closeAlert();
                resolve();
              }
            },
            cancelButton: {
              text: t('Go back'),
              onClick: () => {
                // eslint-disable-next-line prefer-promise-reject-errors
                reject();
                closeAlert();
              }
            },
            closable: false
          });
        } else {
          resolve();
        }
      });
    };

    const runSequentialChecks = async () => {
      try {
        await checkValidatorConfirmationModal();
        await submitData(currentStep);
      } catch (error) {
        setSubmitLoading(false);
      } finally {
        setSubmitLoading(false);
      }
    };

    setTimeout(() => {
      runSequentialChecks().catch((error) => {
        console.error('Error occurred during sequential checks:', error);
      });
    }, 300);
  }, [chainValue, closeAlert, currentStep, maxSlippage?.slippage, netuid, onError, onSuccess, oneSign, openAlert, poolInfo, poolTargetValue, poolTargets, processState.feeStructure, processState.processId, processState.steps, stakingFee, t]);

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
    activeModal(EARNING_SLIPPAGE_MODAL);
    setIsSlippageModalVisible(true);
  }, [activeModal]);

  const renderSubnetStaking = useCallback(() => {
    return (
      <>
        <MetaInfo.Default
          className='__label-bottom'
          label={t('Subnet')}
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
              {poolInfo?.metadata.shortName}
            </span>
          </div>
        </MetaInfo.Default>

        {!isDisabledSubnetContent && earningRate > 0 && (
          <>
            <MetaInfo.Number
              className='__label-bottom'
              decimals={assetDecimals}
              label={t('Expected alpha amount')}
              suffix={poolInfo?.metadata?.subnetData?.subnetSymbol || ''}
              value={BigN(amountValue).multipliedBy(1 / earningRate)}
            />
            <MetaInfo.Default
              className='__label-bottom'
              label={t('Conversion rate')}
            >
              <div className='__subnet-rate'>
                <span
                  className='chain-name'
                  style={{ color: '#A6A6A6' }}
                >
                  {`1 ${inputAsset?.symbol || ''} = `}
                </span>
                <Number
                  className='__label-bottom'
                  decimal={assetDecimals}
                  suffix={poolInfo?.metadata?.subnetData?.subnetSymbol || ''}
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
                <div className='__label-bottom'>{t('Slippage')}</div>
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
  }, [amountValue, assetDecimals, earningRate, inputAsset?.symbol, isDisabledSubnetContent, isSlippageAcceptable, maxSlippage.slippage, onOpenSlippageModal, poolChain, poolInfo?.metadata.shortName, poolInfo?.metadata?.subnetData?.subnetSymbol, subnetToken, t]);

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
    if (!poolInfo || !inputAsset) {
      return null;
    }

    const value = amountValue ? parseFloat(amountValue) / 10 ** assetDecimals : 0;
    const assetSymbol = inputAsset.symbol;

    const assetEarnings =
      poolInfo?.statistic && 'assetEarning' in poolInfo.statistic ? poolInfo.statistic.assetEarning : [];
    const derivativeAssets = poolInfo?.metadata && 'derivativeAssets' in poolInfo.metadata ? poolInfo.metadata.derivativeAssets : [];
    const showFee = [YieldPoolType.LENDING, YieldPoolType.LIQUID_STAKING].includes(poolInfo?.type);

    let minJoinPool: string | undefined;

    if (poolInfo.statistic) {
      const minPoolJoin = poolInfo.statistic.earningThreshold.join;
      const targeted = poolTargets[0];

      if (targeted) {
        if ('minBond' in targeted) {
          const minTargetJoin = new BigN(targeted.minBond || '0');

          minJoinPool = minTargetJoin.gt(minPoolJoin || '0') ? minTargetJoin.toString() : (minPoolJoin || '0');
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
                label={t("You'll receive")}
                suffix={_getAssetSymbol(derivativeAssetInfo)}
                value={value / item.exchangeRate}
              />
            );
          })}
        {(
          <MetaInfo.Number
            className='__label-bottom'
            decimals={assetDecimals}
            label={t('Minimum active stake')}
            suffix={assetSymbol}
            value={minJoinPool || 0}
          />
        )}

        {!isSubnetStaking
          ? (
            <MetaInfo.Chain
              chain={chainValue}
              label={t('Network')}
            />
          )
          : (renderSubnetStaking())
        }

        {showFee && (
          <MetaInfo.Number
            className='__label-bottom'
            decimals={0}
            label={t('Estimated fee')}
            prefix={(currencyData?.isPrefix && currencyData.symbol) || ''}
            suffix={(!currencyData?.isPrefix && currencyData?.symbol) || ''}
            value={estimatedFee}
          />
        )}
      </MetaInfo>
    );
  }, [poolInfo, inputAsset, amountValue, assetDecimals, t, isSubnetStaking, chainValue, renderSubnetStaking, currencyData?.isPrefix, currencyData.symbol, estimatedFee, poolTargets, chainAsset]);

  const onPreCheck = usePreCheckAction(fromValue);

  const exType = useMemo(() => getExtrinsicTypeByPoolInfo({ chain: chainValue, type: poolType, slug }), [poolType, chainValue, slug]);

  useRestoreTransaction(form);
  useInitValidateTransaction(validateFields, form, defaultData);

  const onBack = useCallback(() => {
    if (firstStep) {
      goBack();
    } else {
      openAlert({
        title: t('Cancel earning process?'),
        type: NotificationType.WARNING,
        content: t('Going back will cancel the current earning process. Do you wish to cancel?'),
        okButton: {
          text: t('Cancel earning'),
          onClick: goBack,
          schema: 'warning'
        },
        cancelButton: {
          text: t('Not now'),
          onClick: closeAlert
        }
      });
    }
  }, [closeAlert, firstStep, goBack, openAlert, t]);

  const processText = (() => {
    if (!poolInfo) {
      return '';
    }

    const _shortName = poolInfo.metadata.shortName;
    const _type = t(earningTypeLabelMap[poolInfo.type]);

    return t('{{type}} process on {{shortName}} :', { replace: { shortName: _shortName, type: _type } });
  })();

  const onCancelInstructionModal = useCallback(() => {
    if (!isClickInfoButtonRef.current) {
      goBack();
    }

    setIsFromStakingRW(false);
  }, [goBack]);

  const onStakeMore = useCallback((slug: string, chain: string) => {
    inactiveModal(instructionModalId);

    setIsFromStakingRW(false);
  }, [inactiveModal]);

  const altChain = useMemo(() => {
    if (poolInfo && (isLiquidPool(poolInfo) || isLendingPool(poolInfo))) {
      const asset = chainAsset[poolInfo.metadata.altInputAssets || ''];

      return asset ? asset.originChain : '';
    }

    return '';
  }, [chainAsset, poolInfo]);

  useEffect(() => {
    let timer: NodeJS.Timer;
    let timeout: NodeJS.Timeout;

    if (checkCompoundLoading && redirectFromPreview) {
      const checkCompoundReady = () => {
        if (compound) {
          clearInterval(timer);
          clearTimeout(timeout);
          setCheckCompoundLoading(false);
        }
      };

      timer = setInterval(checkCompoundReady, 500);

      timeout = setTimeout(() => {
        clearInterval(timer);
        setCheckCompoundLoading(false);
      }, 5000);
    } else {
      setTimeout(() => setCheckCompoundLoading(false), 350);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [checkCompoundLoading, compound, redirectFromPreview]);

  useEffect(() => {
    if (redirectFromPreview && !accountAddressItems.length && checkValidAccountLoading) {
      const isChainEvm = chainInfoMap[poolChain] && _isChainEvmCompatible(chainInfoMap[poolChain]);

      // todo: Recheck what this logic do after updating unified account feature
      setSelectedAccountTypes([isChainEvm ? EVM_ACCOUNT_TYPE : SUBSTRATE_ACCOUNT_TYPE]);
      navigate('/home/earning', { state: { view: 'position', redirectFromPreview: true, chainName: chainInfoMap[poolChain]?.name || '' } });
    } else {
      setCheckValidAccountLoading(false);
    }
  }, [accountAddressItems, chainInfoMap, checkValidAccountLoading, navigate, poolChain, redirectFromPreview, setSelectedAccountTypes]);

  const checkUnrecommendedValidator = useCallback((onValid?: () => void) => {
    fetchPoolTarget({ slug }).then((rs) => {
      const isValidatorSupported = rs.targets.some((item) => {
        if (poolType === YieldPoolType.NOMINATION_POOL) {
          return (item as NominationPoolInfo).id.toString() === defaultTarget.current;
        } else if (poolType === YieldPoolType.NATIVE_STAKING) {
          const _item = item as ValidatorInfo;
          const key = getValidatorKey(_item.address, _item.identity);

          return key === defaultTarget.current;
        } else {
          return false;
        }
      });

      if (!isValidatorSupported && defaultTarget.current) {
        isReadyToShowAlertRef.current && openAlert({
          title: t('Unrecommended validator'),
          type: NotificationType.ERROR,
          content: t('Your chosen validator is not recommended by SubWallet as staking with this validator won’t accrue any rewards. Select another validator and try again.'),
          cancelButton: {
            text: t('Dismiss'),
            onClick: () => {
              isReadyToShowAlertRef.current = true;
              closeAlert();
            },
            icon: XCircle
          },
          okButton: {
            text: t('Select validators'),
            onClick: () => {
              isReadyToShowAlertRef.current = true;
              closeAlert();
              activeModal('target');
            },
            icon: CheckCircle
          }
        });
        isReadyToShowAlertRef.current = false;
      } else {
        onValid && onValid();
      }
    }).catch((e) => console.error(e));
  }, [activeModal, closeAlert, openAlert, poolType, slug, t]);

  const isUnstakeAll = useMemo(() => {
    if (compound) {
      if (compound.nominations && compound.nominations.length) {
        return compound.nominations.some((item) => item.activeStake === '0' && item.status === EarningStatus.NOT_EARNING);
      } else {
        return true;
      }
    }

    return false;
  }, [compound]);

  useEffect(() => {
    if (hasPreSelectTarget && !targetLoading && !screenLoading && !checkCompoundLoading && !isFromStakingRW) {
      if (compound) {
        if (autoCheckCompoundRef.current) {
          autoCheckCompoundRef.current = false;

          if (isUnstakeAll) {
            if (poolType === YieldPoolType.NOMINATION_POOL) {
              isReadyToShowAlertRef.current && openAlert({
                title: t('Pay attention'),
                content: t('This account is unstaking all stake and can\'t nominate validators. You can change your account on the Account tab or try again after withdrawing unstaked funds'),
                type: NotificationType.WARNING,
                okButton: {
                  text: t('I understand'),
                  onClick: () => {
                    isReadyToShowAlertRef.current = true;
                    closeAlert();
                  },
                  icon: CheckCircle
                }
              });
              isReadyToShowAlertRef.current = false;

              return;
            } else if (poolType === YieldPoolType.NATIVE_STAKING) {
              if (_STAKING_CHAIN_GROUP.para.includes(chainValue)) {
                isReadyToShowAlertRef.current && openAlert({
                  title: t('Pay attention'),
                  content: t('This account is unstaking all stake and can\'t nominate validators. You can change your account on the Account tab or try again after withdrawing unstaked funds'),
                  type: NotificationType.WARNING,
                  okButton: {
                    text: t('I understand'),
                    onClick: () => {
                      isReadyToShowAlertRef.current = true;
                      closeAlert();
                    },
                    icon: CheckCircle
                  }
                });
                isReadyToShowAlertRef.current = false;

                return;
              } else {
                return;
              }
            }
          }

          const content = poolType === YieldPoolType.NATIVE_STAKING
            ? t('This account is currently nominating {{number}} validators. You can change validators or change your account on the Account tab', { number: compound.nominations.length })
            : poolType === YieldPoolType.NOMINATION_POOL
              ? t('This account is currently a member of a nomination pool. You can continue using nomination pool, explore other Earning options or change your account on the Account tab', { x: compound?.nominations[0]?.validatorIdentity || compound?.nominations[0]?.validatorAddress || '' })
              : '';

          const onPressContinue = () => {
            isReadyToShowAlertRef.current = true;

            if (poolType === YieldPoolType.NATIVE_STAKING) {
              checkUnrecommendedValidator(() => form.setFieldValue('target', defaultTarget.current));
            }

            closeAlert();
          };

          const onPressCancel = () => {
            if (poolType === YieldPoolType.NOMINATION_POOL) {
              goBack();
            }

            setUseParamValidator(false);
            closeAlert();
          };

          isReadyToShowAlertRef.current && openAlert({
            title: t('Pay attention'),
            content: content,
            className: CN(className, 'earning-alert-modal'),
            type: NotificationType.WARNING,
            cancelButton: {
              text: poolType === YieldPoolType.NATIVE_STAKING ? t('Keep current validators') : poolType === YieldPoolType.NOMINATION_POOL ? t('Explore Earning options') : '',
              onClick: onPressCancel
            },
            okButton: {
              text: poolType === YieldPoolType.NATIVE_STAKING ? t('Change validators') : poolType === YieldPoolType.NOMINATION_POOL ? t('Use nomination pool') : '',
              onClick: onPressContinue
            }
          });
          isReadyToShowAlertRef.current = false;
        }
      } else {
        if (autoCheckValidatorGetFromPreview.current) {
          autoCheckValidatorGetFromPreview.current = false;
          checkUnrecommendedValidator();
        }
      }
    }
  }, [isUnstakeAll, checkUnrecommendedValidator, className, closeAlert, compound, form, goBack, openAlert, poolType, hasPreSelectTarget, t, targetLoading, chainValue, screenLoading, checkCompoundLoading, isFromStakingRW]);

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

  useEffect(() => {
    if (stateLocation?.from && stateLocation.from === '/transaction/earn') {
      setIsFromStakingRW(true);
      activeModal(instructionModalId);
      setReturnPath(DEFAULT_ROUTER_PATH);
    } else {
      setIsFromStakingRW(false);
    }
  }, [activeModal, setReturnPath, stateLocation]);

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
      timeout = setTimeout(() => {
        clearInterval(timer);

        if (!isConnectingChainSuccess) {
          setIsLoadingChainConnection(false);
          openAlert({
            title: t('Connection lost'),
            type: NotificationType.ERROR,
            content: altChain
              ? t(`${poolChainName} network or ${altChainName} network has lost connection. Re-enable the network and try again`)
              : t(`${poolChainName} network has lost connection. Re-enable the network and try again`),
            okButton: {
              text: t('I understand'),
              onClick: closeAlert,
              icon: CheckCircle
            }
          });
        }
      }, 9000);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [altChain, poolChain, checkChainConnected, closeAlert, isConnectingChainSuccess, isLoadingChainConnection, openAlert, t, poolChainName, altChainName]);

  useEffect(() => {
    form.setFieldValue('asset', inputAsset?.slug || '');
  }, [form, inputAsset?.slug]);

  useEffect(() => {
    if (!fromValue && (isAllAccount || accountAddressItems.length === 1)) {
      if ((hasPreSelectTarget && accountAddressItems.length >= 1) || accountAddressItems.length === 1) {
        form.setFieldValue('from', accountAddressItems[0].address);
      }
    }
  }, [accountAddressItems, form, fromValue, isAllAccount, hasPreSelectTarget]);

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
              .catch(console.error)
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
        .catch(console.error)
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
    if (!redirectFromPreview && !isWebUI && !compound && !screenLoading) {
      isClickInfoButtonRef.current = false;
      activeModal(instructionModalId);
    }
  }, [activeModal, compound, isWebUI, redirectFromPreview, screenLoading]);

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

  useEffect(() => {
    setOnBack(onBack);

    return () => {
      setOnBack(undefined);
    };
  }, [onBack, setOnBack]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const amountInputRef = form.getFieldInstance('value');

  useEffect(() => {
    if (hasPreSelectTarget) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      amountInputRef?.focus?.();
    }
  }, [amountInputRef, hasPreSelectTarget]);

  const validatorDefaultValue = (() => {
    if (useParamValidator) {
      return defaultData.target === 'not-support' ? '' : defaultTarget.current;
    } else {
      if (defaultData.target === 'not-support' || !!compound) {
        return undefined;
      } else {
        return defaultTarget.current;
      }
    }
  })();

  return (
    <>
      {
        (screenLoading || checkValidAccountLoading) && (
          <LoadingScreen />
        )
      }

      {
        (!screenLoading && !checkValidAccountLoading) && (
          <>
            <div className={'__transaction-block'}>
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
                  onFinish={onSubmit}
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
                      hidden={submitStepType !== YieldStepType.XCM}
                      label={`${t('Available balance')}`}
                      onBalanceReady={setIsBalanceReady}
                      tokens={balanceTokens}
                    />

                    <FreeBalance
                      address={fromValue}
                      chain={poolInfo?.chain || ''}
                      hidden={[YieldStepType.XCM].includes(submitStepType)}
                      isSubscribe={true}
                      label={`${t('Available balance')}`}
                      tokenSlug={inputAsset?.slug}
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

                  {(poolType === YieldPoolType.NOMINATION_POOL) && (
                    <Form.Item
                      name={'target'}
                    >
                      <EarningPoolSelector
                        chain={poolChain}
                        defaultValue={defaultData.target === 'not-support' || !!compound ? '' : defaultData.target}
                        disabled={submitLoading}
                        from={fromValue}
                        label={t('Pool')}
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
                        defaultValue={validatorDefaultValue}
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
                      description={t(
                        'Unable to stake due to a slippage of {{slippage}}%, which exceeds the current slippage set for this transaction. Lower your stake amount or increase slippage and try again',
                        { replace: { slippage: (earningSlippage * 100).toFixed(2) } }
                      )}
                      title='Slippage too high!'
                      type='error'
                    />
                  </div>
                )}
              </TransactionContent>
              <TransactionFooter>
                <Button
                  block={true}
                  className={'__start-earning-button'}
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
                  {processState.currentStep === 0 ? t('Stake') : t('Continue')}
                </Button>
              </TransactionFooter>
            </div>

            {isWebUI && (
              <div className={'__transaction-process'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: token.paddingSM, paddingTop: token.paddingXS }}>

                  <Typography.Text className={'earning-calculator-message'}>{processText}</Typography.Text>

                  {!stepLoading && processState.steps.map((item, index) => {
                    return (
                      <EarningProcessItem
                        index={index}
                        key={index}
                        stepName={item.name}
                        stepStatus={processState.stepResults[index]?.status}
                      />
                    );
                  })}

                  {
                    stepLoading && (
                      <ActivityIndicator
                        prefixCls={'ant'}
                        size={'32px'}
                      />
                    )
                  }
                  <Divider style={{ backgroundColor: token.colorBgDivider, marginTop: token.marginSM, marginBottom: token.marginSM, height: 2 }} />

                  <Typography.Text style={{ color: token.colorTextLight4 }}>
                    {t('All steps in the process are designed based on your available multi-chain assets to optimize fee structure and enhance your overall experience.')}
                  </Typography.Text>
                </div>
              </div>
            )}
          </>
        )
      }

      {
        (!isWebUI || isFromStakingRW) && (
          <EarningInstructionModal
            assetRegistry={chainAsset}
            closeAlert={closeAlert}
            isShowStakeMoreButton={!isClickInfoButtonRef.current}
            onCancel={onCancelInstructionModal}
            onStakeMore={onStakeMore}
            openAlert={openAlert}
            poolInfo={poolInfo}
          />
        )
      }

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
  const { defaultData } = useTransactionContext<EarnParams>();
  const { setWebBaseClassName } = useContext(WebUIContext);

  const { className } = props;

  useEffect(() => {
    setWebBaseClassName(`${className || ''}-web-base-container`);

    return () => {
      setWebBaseClassName('');
    };
  }, [className, setWebBaseClassName]);

  return (
    <EarnOutlet
      autoEnableChain={defaultData.redirectFromPreview}
      className={CN(className)}
      path={'/transaction/earn'}
      stores={['price', 'chainStore', 'assetRegistry', 'earning']}
    >
      <Component className={className} />
    </EarnOutlet>
  );
};

const Earn = styled(Wrapper)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'flex',
    flexDirection: 'row',
    maxWidth: 784,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    gap: token.size,

    '&.earning-alert-modal': {
      alignItems: 'center',

      '.ant-sw-modal-body': {
        paddingBottom: token.padding
      },

      '.ant-sw-modal-footer': {
        flexWrap: 'wrap',
        gap: token.paddingSM
      },

      '.ant-btn.ant-btn.ant-btn': {
        marginInlineStart: 0,
        order: 2
      },

      '.ant-btn.ant-btn.ant-btn:last-child': {
        order: 1
      }
    },

    '.__process-item-wrapper': {
      paddingBottom: token.paddingSM,
      borderBottom: '2px solid',
      borderBottomColor: 'rgba(33, 33, 33, 0.80)',
      marginBottom: token.marginSM
    },

    '.__col': {
      flex: '0 1 auto'
    },

    '.__chain-name': {
      'white-space': 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'

    },

    '.__chain-item': {
      paddingLeft: 8
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
    '.__transaction-block': {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
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
    },

    '.earning-wrapper': {
      display: 'flex',
      flex: 1
    },

    '.web-ui-enable &': {
      '.__transaction-block, .__transaction-process': {
        flex: 1
      },

      '.__transaction-block': {
        display: 'block'
      },

      '.transaction-content, .transaction-footer': {
        paddingRight: 0,
        paddingLeft: 0
      },

      '.meta-info': {
        marginBottom: token.marginSM
      }
    },

    '&-web-base-container': {
      '.web-layout-content': {
        position: 'relative'
      },

      '.common-pages': {
        height: 'auto'
      },

      '.web-layout-content .loading-layer': {
        position: 'absolute',
        inset: 0
      }
    }
  };
});

export default Earn;
