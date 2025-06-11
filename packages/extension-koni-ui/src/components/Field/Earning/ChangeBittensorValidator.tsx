// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType, ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { isActionFromValidator } from '@subwallet/extension-base/services/earning-service/utils';
import { NominationInfo, SubmitChangeValidatorStaking, YieldPoolType } from '@subwallet/extension-base/types';
import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field/Base';
import { useGetChainAssetInfo, useHandleSubmitTransaction, usePreCheckAction, useSelector, useSelectValidators, useTransactionContext, useWatchTransaction, useYieldPositionDetail } from '@subwallet/extension-koni-ui/hooks';
import { changeEarningValidator } from '@subwallet/extension-koni-ui/messaging';
import { ChangeValidatorParams, FormCallbacks, ThemeProps, ValidatorDataType } from '@subwallet/extension-koni-ui/types';
import { findAccountByAddress, formatBalance, noop, parseNominations, reformatAddress } from '@subwallet/extension-koni-ui/utils';
import { Button, Form, Icon, InputRef, Logo, ModalContext, Switch, SwModal, Tooltip, useExcludeModal } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import { CaretLeft, CheckCircle, Info } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, SyntheticEvent, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { AccountItemWithName } from '../../Account';
import AmountInput from '../AmountInput';
import NominationSelector from '../NominationSelector';
import EarningValidatorSelector from './EarningValidatorSelector';

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
}

const Component = (props: Props, ref: ForwardedRef<InputRef>) => {
  const { chain, className = '', from, isSingleSelect: _isSingleSelect = false,
    modalId, nominations, onChange, setForceFetchValidator, slug } = props;

  const [amountChange, setAmountChange] = useState(false);
  const [isChangeData, setIsChangeData] = useState(false);
  const [isShowAmountChange, setIsShowAmountChange] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { accounts } = useSelector((state) => state.accountState);
  const { poolInfoMap } = useSelector((state) => state.earning);
  const { poolTargetsMap } = useSelector((state) => state.earning);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);

  const { t } = useTranslation();
  const { inactiveAll } = useContext(ModalContext);
  const { defaultData } = useTransactionContext<ChangeValidatorParams>();
  const { onError, onSuccess } = useHandleSubmitTransaction();

  const account = findAccountByAddress(accounts, from);
  const [form] = Form.useForm<ChangeValidatorParams>();
  const fromTarget = useWatchTransaction('fromTarget', form, defaultData);
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
  const decimals = useMemo(() => bondedAsset?.decimals || 0, [bondedAsset]);
  const { compound: positionInfo } = useYieldPositionDetail(slug, from);

  const selectedValidator = useMemo(() => {
    return positionInfo?.nominations.find((item) => item.validatorAddress === fromTarget);
  }, [fromTarget, positionInfo]);

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
    !fromTarget || !toTarget || (isShowAmountChange && !value),
  [fromTarget, toTarget, isShowAmountChange, value]
  );

  const isSubnetStaking = useMemo(() => [YieldPoolType.SUBNET_STAKING].includes(poolType), [poolType]);

  const networkKey = useMemo(() => {
    const netuid = poolInfo.metadata.subnetData?.netuid || 0;

    return DefaultLogosMap[`subnet-${netuid}`] ? `subnet-${netuid}` : 'subnet-0';
  }, [poolInfo.metadata.subnetData?.netuid]);

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
            network={networkKey}
            shape='circle'
            size={24}
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
  }, [networkKey, poolInfo.metadata.shortName, t]);

  const showAmountChangeInput = useCallback(() => {
    setIsShowAmountChange(!isShowAmountChange);
  }, [isShowAmountChange]);

  const onValuesChange: FormCallbacks<ChangeValidatorParams>['onValuesChange'] = useCallback(
    (changes: Partial<ChangeValidatorParams>, values: ChangeValidatorParams) => {
      const { from, fromTarget, target, value } = changes;

      if (from) {
        setIsChangeData(true);
      }

      if ((from || fromTarget || target) && (amountChange || defaultData.value)) {
        form.validateFields(['value']).finally(noop);
      }

      if (value !== undefined) {
        setAmountChange(true);
      }
    },
    [amountChange, form, defaultData.value]
  );

  const onClickSubmit = useCallback(
    (values: ChangeValidatorParams) => {
      setSubmitLoading(true);
      const { fromTarget, value } = values;
      const submitData: SubmitChangeValidatorStaking = {
        slug: poolInfo.slug,
        address: from,
        amount: isShowAmountChange ? value : bondedValue,
        selectedValidators: poolTargets,
        fromValidator: fromTarget,
        ...(netuid !== undefined && {
          subnetData: {
            netuid,
            slippage: 0
          }
        })
      };

      setTimeout(() => {
        changeEarningValidator(submitData)
          .then((res) => {
            onSuccess(res);
            inactiveAll();
          })
          .catch(onError)
          .finally(() => {
            setSubmitLoading(false);
          });
      }, 300);
    },
    [poolInfo.slug, from, isShowAmountChange, bondedValue, poolTargets, netuid, onSuccess, onError, inactiveAll]
  );

  const onPreCheck = usePreCheckAction(from);
  const { onCancelSelectValidator } = useSelectValidators(modalId, chain, maxCount, onChange, isSingleSelect);

  useExcludeModal(modalId);

  return (
    <Form
      className={'form-container form-space-sm'}
      form={form}
      initialValues={formDefault}
      name='change-validator-form'
      onFinish={onClickSubmit}
      onValuesChange={onValuesChange}
    >
      <SwModal
        className={`${className} modal-full`}
        closeIcon={<Icon
          phosphorIcon={CaretLeft}
          size='md'
        />}
        footer={
          <Button
            block
            disabled={isDisabled}
            icon={<Icon
              phosphorIcon={CheckCircle}
              weight={'fill'}
            />}
            loading={submitLoading}
            onClick={onPreCheck(form.submit, ExtrinsicType.CHANGE_EARNING_VALIDATOR)}
          >
            {t('Update validator')}
          </Button>
        }
        id={modalId}
        onCancel={onCancelSelectValidator}
        title={t('Change validator')}
      >
        <Form.Item name={'from'}>
          <AccountItemWithName
            accountName={account?.name}
            address={from}
            avatarSize={24}
          />
          <div className={'staked-balance__info'}>
            <span>
              {t('Staked balance:')}
            </span>
            <span>
                  &nbsp;{formatBalance(bondedValue, decimals)}&nbsp;
            </span>
            <span>{ poolInfo.metadata.subnetData?.subnetSymbol || bondedAsset?.symbol }</span>
          </div>
        </Form.Item>

        <Form.Item name={'fromTarget'}>
          <NominationSelector
            chain={chain}
            defaultValue={persistValidator}
            disabled={!from}
            label={t('Select validator')}
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
            setForceFetchValidator={setForceFetchValidator}
            slug={slug}
          />
        </Form.Item>

        <MetaInfo>
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
            <Switch onClick={showAmountChangeInput} />
          </div>
        </div>

        {isShowAmountChange && (<>
          <Form.Item
            name={'value'}
            statusHelpAsTooltip={true}
          >
            <AmountInput
              decimals={decimals}
              maxValue={bondedValue}
              showMaxButton={true}
            />
          </Form.Item>
          <div className={'minimum-stake__info'}>
            <div className={'minimum-stake__label'}>
              {t('Minimum active stake')}
            </div>
            <div className={'minimum-stake__value'}>
              <span>
                  &nbsp;{formatBalance(poolInfo.statistic?.earningThreshold.join || 0, decimals)}&nbsp;
              </span>
              <span>{ bondedAsset?.symbol }</span>
            </div>
          </div>
        </>
        )}
      </SwModal>
    </Form>
  );
};

const ChangeBittensorValidator = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-header': {
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingLG
    },

    '.ant-sw-modal-footer': {
      margin: 0,
      marginTop: token.marginXS,
      borderTop: 0,
      marginBottom: token.margin
    },

    '.ant-sw-modal-body': {
      padding: '0px 16px'
    },

    '.__amount-part': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 12px',
      borderRadius: token.borderRadiusLG,
      backgroundColor: token.colorBgSecondary,
      marginBottom: token.sizeSM,
      marginTop: token.sizeSM,
      fontSize: token.fontSizeHeading6
    },

    '.staked-balance__info': {
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightSM,
      color: token['gray-4'],
      marginTop: token.marginXXS
    },

    '.__subnet-wrapper': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXS,
      minWidth: 0
    },

    '.minimum-stake__info': {
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightSM,
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
      cursor: 'pointer'
    }
  };
});

export default ChangeBittensorValidator;
