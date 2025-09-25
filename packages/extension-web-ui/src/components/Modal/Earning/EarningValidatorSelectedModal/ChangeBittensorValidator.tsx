// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ExtrinsicType, NotificationType, ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { isActionFromValidator } from '@subwallet/extension-base/services/earning-service/utils';
import { NominationInfo, SubmitBittensorChangeValidatorStaking, YieldPoolType } from '@subwallet/extension-base/types';
import { BaseModal, MetaInfo } from '@subwallet/extension-web-ui/components';
import { BasicInputWrapper } from '@subwallet/extension-web-ui/components/Field/Base';
import { WalletModalContext } from '@subwallet/extension-web-ui/contexts/WalletModalContextProvider';
import { useChainChecker, useCreateGetSubnetStakingTokenName, useGetChainAssetInfo, useHandleSubmitTransaction, useNotification, usePreCheckAction, useSelector, useSelectValidators, useTransactionContext, useWatchTransaction, useYieldPositionDetail } from '@subwallet/extension-web-ui/hooks';
import { useTaoStakingFee } from '@subwallet/extension-web-ui/hooks/earning/useTaoStakingFee';
import { changeEarningValidator } from '@subwallet/extension-web-ui/messaging';
import { ChangeValidatorParams, FormCallbacks, ThemeProps, ValidatorDataType } from '@subwallet/extension-web-ui/types';
import { findAccountByAddress, formatBalance, noop, parseNominations, reformatAddress } from '@subwallet/extension-web-ui/utils';
import { Button, Form, Icon, InputRef, Logo, ModalContext, Number, Switch, Tooltip, useExcludeModal } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import { CaretLeft, CheckCircle, Info } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, SyntheticEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { AccountItemWithName } from '../../../Account';
import AmountInput from '../../../Field/AmountInput';
import EarningValidatorSelector from '../../../Field/Earning/EarningValidatorSelector';
import NominationSelector from '../../../Field/NominationSelector';

interface Props extends ThemeProps, BasicInputWrapper {
  modalId: string;
  chain: string;
  from: string;
  slug: string;
  items: ValidatorDataType[];
  nominations: NominationInfo[]
  onClickBookButton?: (e: SyntheticEvent) => void;
  onClickLightningButton?: (e: SyntheticEvent) => void;
  isSingleSelect?: boolean;
  setForceFetchValidator: (val: boolean) => void;
  onCancel?: VoidFunction,
}

const Component = (props: Props, ref: ForwardedRef<InputRef>) => {
  const { chain, className = '', from, isSingleSelect: _isSingleSelect = false,
    modalId, nominations, onCancel, onChange, setForceFetchValidator, slug } = props;

  const [amountChange, setAmountChange] = useState(false);
  const [isChangeData, setIsChangeData] = useState(false);
  const [isShowAmountChange, setIsShowAmountChange] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { accounts } = useSelector((state) => state.accountState);
  const { poolInfoMap } = useSelector((state) => state.earning);
  const { poolTargetsMap } = useSelector((state) => state.earning);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const getSubnetStakingTokenName = useCreateGetSubnetStakingTokenName();

  const { t } = useTranslation();
  const notify = useNotification();
  const { checkActive } = useContext(ModalContext);
  const isActive = checkActive(modalId);

  const { alertModal: { close: closeAlert, open: openAlert } } = useContext(WalletModalContext);
  const { defaultData } = useTransactionContext<ChangeValidatorParams>();
  const { onError, onSuccess } = useHandleSubmitTransaction();

  const account = findAccountByAddress(accounts, from);
  const [form] = Form.useForm<ChangeValidatorParams>();
  const originValidator = useWatchTransaction('originValidator', form, defaultData);
  const toTarget = useWatchTransaction('target', form, defaultData);
  const value = useWatchTransaction('value', form, defaultData);

  const poolInfo = poolInfoMap[slug];

  const formDefault = useMemo(() => ({ ...defaultData }), [defaultData]);
  const isRelayChain = useMemo(() => _STAKING_CHAIN_GROUP.relay.includes(chain), [chain]);
  const isSingleSelect = useMemo(() => _isSingleSelect || !isRelayChain, [_isSingleSelect, isRelayChain]);

  const maxCount = useMemo(() => poolInfo?.statistic?.maxCandidatePerFarmer || 1, [poolInfo]);
  const networkPrefix = useMemo(() => chainInfoMap[poolInfo.chain]?.substrateInfo?.addressPrefix, [chainInfoMap, poolInfo]);
  const poolType = useMemo(() => poolInfo.type, [poolInfo]);
  const poolChain = useMemo(() => poolInfo.chain, [poolInfo]);

  const bondedSlug = useMemo(() => {
    switch (poolInfo.type) {
      case YieldPoolType.LIQUID_STAKING:
        return poolInfo.metadata.derivativeAssets[0];
      case YieldPoolType.LENDING:
      case YieldPoolType.NATIVE_STAKING:
      case YieldPoolType.NOMINATION_POOL:
      default:
        return poolInfo.metadata.inputAsset;
    }
  }, [poolInfo]);

  const bondedAsset = useGetChainAssetInfo(bondedSlug || poolInfo.metadata.inputAsset);
  const symbol = poolInfo.metadata.subnetData?.subnetSymbol || bondedAsset?.symbol;

  const decimals = useMemo(() => bondedAsset?.decimals || 0, [bondedAsset]);
  const { compound: positionInfo } = useYieldPositionDetail(slug, from);

  const selectedValidator = useMemo(() => {
    return positionInfo?.nominations.find((item) => item.validatorAddress === originValidator);
  }, [originValidator, positionInfo]);

  const mustChooseValidator = useMemo(() => isActionFromValidator(poolType, poolChain || ''), [poolChain, poolType]);
  const persistValidator = useMemo(() => {
    if (from === defaultData.from && !isChangeData) {
      return defaultData.target;
    }

    return '';
  }, [defaultData.from, defaultData.target, from, isChangeData]);

  const bondedValue = useMemo(() => {
    switch (poolInfo.type) {
      case YieldPoolType.NATIVE_STAKING:
      case YieldPoolType.SUBNET_STAKING:
        if (!mustChooseValidator) {
          return positionInfo?.activeStake || '0';
        }

        return selectedValidator?.activeStake || '0';

      case YieldPoolType.LENDING: {
        const input = poolInfo.metadata.inputAsset;
        const exchangeRate = poolInfo.statistic?.assetEarning.find((item) => item.slug === input)?.exchangeRate || 1;

        return new BigN(positionInfo?.activeStake || '0').multipliedBy(exchangeRate).toFixed(0);
      }

      case YieldPoolType.LIQUID_STAKING:
      case YieldPoolType.NOMINATION_POOL:
      default:
        return positionInfo?.activeStake || '0';
    }
  }, [mustChooseValidator, poolInfo.metadata.inputAsset, poolInfo.statistic?.assetEarning, poolInfo.type, positionInfo?.activeStake, selectedValidator?.activeStake]);

  const poolTargets = useMemo(() => {
    const _poolTargets = poolTargetsMap[slug];

    if (!_poolTargets) {
      return [];
    }

    if (poolType === YieldPoolType.NATIVE_STAKING || poolType === YieldPoolType.SUBNET_STAKING) {
      const validatorList = _poolTargets as ValidatorInfo[];

      if (!validatorList) {
        return [];
      }

      const result: ValidatorInfo[] = [];
      const nominations = parseNominations(toTarget);
      const newValidatorList: { [address: string]: ValidatorInfo } = {};

      validatorList.forEach((validator) => {
        newValidatorList[reformatAddress(validator.address)] = validator;
      });
      nominations.forEach((nomination) => {
        if (newValidatorList?.[reformatAddress(nomination)]) {
          result.push(newValidatorList[reformatAddress(nomination)]);
        }
      });

      return result;
    }

    return [];
  }, [toTarget, poolTargetsMap, poolType, slug]);

  const netuid = useMemo(() => poolInfo.metadata.subnetData?.netuid, [poolInfo.metadata.subnetData]);
  const isDisabled = useMemo(() =>
    !originValidator || !toTarget || (isShowAmountChange && !value),
  [originValidator, toTarget, isShowAmountChange, value]
  );

  const isSubnetStaking = useMemo(() => [YieldPoolType.SUBNET_STAKING].includes(poolType), [poolType]);

  const subnetToken = useMemo(() => {
    return getSubnetStakingTokenName(poolInfo.chain, poolInfo.metadata.subnetData?.netuid || 0);
  }, [getSubnetStakingTokenName, poolInfo.chain, poolInfo.metadata.subnetData?.netuid]);

  const renderSubnetStaking = useCallback(() => {
    return (
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
            {poolInfo.metadata.shortName}
          </span>
        </div>
      </MetaInfo.Default>
    );
  }, [poolChain, poolInfo.metadata.shortName, subnetToken, t]);

  const showAmountChangeInput = useCallback(() => {
    setIsShowAmountChange(!isShowAmountChange);
  }, [isShowAmountChange]);

  const onValuesChange: FormCallbacks<ChangeValidatorParams>['onValuesChange'] = useCallback(
    (changes: Partial<ChangeValidatorParams>, values: ChangeValidatorParams) => {
      const { from, originValidator, target, value } = changes;

      if (from) {
        setIsChangeData(true);
      }

      if (originValidator && originValidator !== form.getFieldValue('originValidator')) {
        form.setFieldsValue({
          target: undefined
        });
      }

      if ((from || originValidator || target) && (amountChange || defaultData.value)) {
        form.validateFields(['value']).finally(noop);
      }

      if (value !== undefined) {
        setAmountChange(true);
      }
    },
    [amountChange, defaultData.value, form]
  );

  const notifyTooHighAmount = useCallback(() => {
    notify({
      message: t(`Amount too high. Lower your amount to no more than ${formatBalance(bondedValue, decimals)} ${symbol || ''} and try again`),
      type: 'error',
      duration: 5
    });
  }, [bondedValue, decimals, notify, symbol, t]);

  const { earningRate, stakingFee } = useTaoStakingFee(
    poolInfo,
    value || bondedValue,
    decimals,
    poolInfo.metadata.subnetData?.netuid || 0,
    ExtrinsicType.STAKING_UNBOND,
    setSubmitLoading
  );

  const onClickSubmit = useCallback(
    (values: ChangeValidatorParams) => {
      const { originValidator, value } = values;

      if (isShowAmountChange && new BigN(value).gt(bondedValue)) {
        notifyTooHighAmount();

        return;
      }

      const isMovePartialStake = new BigN(value).lt(bondedValue);

      const baseData = {
        slug: poolInfo.slug,
        address: from,
        selectedValidators: poolTargets,
        originValidator,
        metadata: {
          subnetSymbol: symbol as string
        },
        isMovePartialStake,
        maxAmount: bondedValue,
        ...(netuid !== undefined && {
          subnetData: {
            netuid,
            slippage: 0,
            stakingFee
          }
        })
      };

      const send = (amount: string): void => {
        setSubmitLoading(true);

        const submitData: SubmitBittensorChangeValidatorStaking = {
          ...baseData,
          amount
        };

        (changeEarningValidator(submitData))
          .then(onSuccess)
          .catch((error: TransactionError) => {
            if (error.message.includes('remaining')) {
              openAlert({
                type: NotificationType.WARNING,
                title: t('Pay attention!'),
                content: error.message,
                okButton: {
                  text: t('Move all'),
                  onClick: () => {
                    closeAlert();
                    send(bondedValue);
                  }
                },
                cancelButton: {
                  text: t('Cancel'),
                  onClick: () => {
                    closeAlert();
                    setSubmitLoading(false);
                  }
                }
              });
            } else {
              onError(error);
              setSubmitLoading(false);
            }
          })
          .finally(() => {
            setSubmitLoading(false);
          });
      };

      send(isShowAmountChange ? value : bondedValue);
    },
    [bondedValue, closeAlert, from, isShowAmountChange, netuid, notifyTooHighAmount, onError, onSuccess, openAlert, poolInfo.slug, poolTargets, stakingFee, symbol, t]
  );
  const { onCancelSelectValidator } = useSelectValidators([], modalId, chain, maxCount, onChange, isSingleSelect);

  const handleCancel = useCallback(() => {
    onCancelSelectValidator();

    onCancel?.();
  }, [onCancelSelectValidator, onCancel]);

  useEffect(() => {
    if (!isActive) {
      form.resetFields();
      setIsChangeData(false);
      setAmountChange(false);
      setIsShowAmountChange(false);
    }
  }, [isActive, form]);

  const checkChain = useChainChecker();

  useEffect(() => {
    chain && checkChain(chain);
  }, [chain, checkChain]);

  const onPreCheck = usePreCheckAction(from);

  useExcludeModal(modalId);

  return (
    <BaseModal
      className={className}
      closeIcon={
        <Icon
          phosphorIcon={CaretLeft}
          size='md'
        />
      }
      footer={
        <Button
          block
          disabled={isDisabled}
          icon={
            <Icon
              phosphorIcon={CheckCircle}
              weight={'fill'}
            />
          }
          loading={submitLoading}
          onClick={onPreCheck(form.submit, ExtrinsicType.CHANGE_EARNING_VALIDATOR)}
        >
          {t('Update validator')}
        </Button>
      }
      fullSizeOnMobile={true}
      id={modalId}
      onCancel={handleCancel}
      title={t('Change validator')}
    >
      <Form
        className={'form-container form-space-sm'}
        form={form}
        initialValues={formDefault}
        name='change-validator-form'
        onFinish={onClickSubmit}
        onValuesChange={onValuesChange}
      >
        <Form.Item name={'from'}>
          <AccountItemWithName
            accountName={account?.name}
            address={from}
            avatarSize={20}
          />
          <div className={'staked-balance__info'}>
            <span>
              {t('Staked balance:')}
            </span>
            <span>
                  &nbsp;{formatBalance(bondedValue, decimals)}&nbsp;
            </span>
            <span>{ symbol }</span>
          </div>
        </Form.Item>

        <Form.Item name={'originValidator'}>
          <NominationSelector
            chain={chain}
            defaultValue={persistValidator}
            disabled={!from}
            isChangeValidator={true}
            label={t('From')}
            networkPrefix={networkPrefix}
            nominators={nominations}
            poolInfo={poolInfo}
          />
        </Form.Item>

        <Form.Item name={'target'}>
          <EarningValidatorSelector
            chain={chain}
            disabled={!from}
            from={from}
            label={t('Change to')}
            originValidator={originValidator}
            setForceFetchValidator={setForceFetchValidator}
            slug={slug}
          />
        </Form.Item>

        <MetaInfo className='custom-label'>
          {!isSubnetStaking
            ? (
              <MetaInfo.Chain
                chain={chain}
                label={t('Network')}
              />

            )
            : (renderSubnetStaking())
          }
        </MetaInfo>

        <div className='__amount-part'>
          <Tooltip
            placement={'topRight'}
            title={t('Amount you want to move from the selected validator to the new validator')}
          >
            <div className='__item-left-part'>{t('Change staking amount')}
              <Icon
                className='__validator-info'
                iconColor='white'
                phosphorIcon={Info}
                size='sm'
                weight='fill'
              />
            </div>
          </Tooltip>
          <div className='__item-right-part'>
            <Switch
              checked={isShowAmountChange}
              onClick={showAmountChangeInput}
            />
          </div>
        </div>

        {isShowAmountChange && (
          <div className='__amount-input'>
            <Form.Item
              name={'value'}
              statusHelpAsTooltip={true}
            >
              <AmountInput
                decimals={decimals}
                maxValue={bondedValue}
                prefix={ <Logo
                  className='__item-logo'
                  isShowSubLogo={false}
                  network={poolChain}
                  shape='squircle'
                  size={28}
                  token={subnetToken}
                />}
                showMaxButton={true}
              />
            </Form.Item>
            <div className={'minimum-stake__info'}>
              <div className={'minimum-stake__label'}>
                {t('Minimum active stake')}
              </div>
              <Number
                className='minimum-stake__value'
                decimal={decimals}
                suffix={ earningRate > 0 ? symbol : bondedAsset?.symbol}
                value={
                  earningRate > 0
                    ? BigN(poolInfo.statistic?.earningThreshold.join || 0).div(earningRate)
                    : BigN(poolInfo.statistic?.earningThreshold.join || 0)
                }
              />
            </div>
          </div>
        )}
      </Form>
    </BaseModal>
  );
};

const ChangeBittensorValidator = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-header': {

    },

    '.ant-sw-modal-body': {
      padding: '0px 16px'
    },

    '.ant-sw-modal-footer': {
      borderTop: 0
    },

    '.__amount-part': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0px 12px',
      borderRadius: token.borderRadiusLG,
      backgroundColor: token.colorBgSecondary,
      marginTop: token.sizeSM,
      fontSize: token.fontSizeHeading6,
      minHeight: '53px'
    },

    '.ant-account-item': {
      minHeight: '48px'
    },

    '.account-item-content-wrapper': {
      fontWeight: 500
    },

    '.__amount-input': {
      marginTop: token.sizeSM
    },

    '.ant-input-wrapper': {
      minHeight: '52px'
    },

    '.ant-switch': {
      minWidth: '52px'
    },

    '.staked-balance__info': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token['gray-4'],
      marginTop: token.marginXXS
    },

    '.__subnet-wrapper': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXS,
      minWidth: 0
    },

    '.custom-label .__label': {
      color: token.colorTextLight3
    },

    '.__subnet-wrapper .chain-name': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXS,
      minWidth: 0
    },

    '.minimum-stake__info': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      display: 'flex',
      justifyContent: 'space-between'
    },

    '.minimum-stake__label': {
      color: token['gray-4']
    },

    '.__item-left-part': {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer',
      fontWeight: 600,
      color: token.colorWhite
    }
  };
});

export default ChangeBittensorValidator;
