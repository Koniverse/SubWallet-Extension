// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { AmountData, ExtrinsicType, NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { isActionFromValidator } from '@subwallet/extension-base/services/earning-service/utils';
import { AccountJson, RequestYieldLeave, SlippageType, SpecialYieldPoolMetadata, SubnetYieldPositionInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { AccountSelector, AlertBox, AmountInput, HiddenInput, InstructionItem, MetaInfo, NominationSelector } from '@subwallet/extension-koni-ui/components';
import { BN_ZERO, UNSTAKE_ALERT_DATA, UNSTAKE_BIFROST_ALERT_DATA, UNSTAKE_BITTENSOR_ALERT_DATA } from '@subwallet/extension-koni-ui/constants';
import { MktCampaignModalContext } from '@subwallet/extension-koni-ui/contexts/MktCampaignModalContext';
import { useHandleSubmitTransaction, useInitValidateTransaction, usePreCheckAction, useRestoreTransaction, useSelector, useTransactionContext, useWatchTransaction, useYieldPositionDetail } from '@subwallet/extension-koni-ui/hooks';
import useGetConfirmationByScreen from '@subwallet/extension-koni-ui/hooks/campaign/useGetConfirmationByScreen';
import { getEarningSlippage, yieldSubmitLeavePool } from '@subwallet/extension-koni-ui/messaging';
import { FormCallbacks, FormFieldData, ThemeProps, UnStakeParams } from '@subwallet/extension-koni-ui/types';
import { convertFieldToObject, getBannerButtonIcon, getEarningTimeText, noop, simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { BackgroundIcon, Button, Checkbox, Form, Icon } from '@subwallet/react-ui';
import { getAlphaColor } from '@subwallet/react-ui/lib/theme/themes/default/colorAlgorithm';
import BigN, { BigNumber } from 'bignumber.js';
import CN from 'classnames';
import { MinusCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import useGetChainAssetInfo from '../../../hooks/screen/common/useGetChainAssetInfo';
import { accountFilterFunc } from '../helper';
import { BondedBalance, EarnOutlet, FreeBalance, TransactionContent, TransactionFooter } from '../parts';

type Props = ThemeProps;

const filterAccount = (
  positionInfos: YieldPositionInfo[],
  chainInfoMap: Record<string, _ChainInfo>,
  poolType: YieldPoolType,
  poolChain?: string
): ((account: AccountJson) => boolean) => {
  return (account: AccountJson): boolean => {
    const nominator = positionInfos.find((item) => item.address.toLowerCase() === account.address.toLowerCase());

    return (
      new BigN(nominator?.activeStake || BN_ZERO).gt(BN_ZERO) &&
      accountFilterFunc(chainInfoMap, poolType, poolChain)(account)
    );
  };
};

const hideFields: Array<keyof UnStakeParams> = ['chain', 'asset', 'slug'];
const validateFields: Array<keyof UnStakeParams> = ['value'];

const Component: React.FC = () => {
  const { t } = useTranslation();
  const mktCampaignModalContext = useContext(MktCampaignModalContext);
  const { defaultData, persistData, setCustomScreenTitle } = useTransactionContext<UnStakeParams>();
  const { slug } = defaultData;
  const { getCurrentConfirmation, renderConfirmationButtons } = useGetConfirmationByScreen('unstake');
  const { accounts, isAllAccount } = useSelector((state) => state.accountState);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const { poolInfoMap } = useSelector((state) => state.earning);
  const poolInfo = poolInfoMap[slug];
  const poolType = poolInfo.type;
  const poolChain = poolInfo.chain;
  const networkPrefix = chainInfoMap[poolChain]?.substrateInfo?.addressPrefix;
  const isMythosStaking = useMemo(() => _STAKING_CHAIN_GROUP.mythos.includes(poolChain), [poolChain]);

  const [form] = Form.useForm<UnStakeParams>();
  const [isBalanceReady, setIsBalanceReady] = useState(true);
  const [amountChange, setAmountChange] = useState(false);

  const formDefault = useMemo((): UnStakeParams => ({
    ...defaultData
  }), [defaultData]);

  const fromValue = useWatchTransaction('from', form, defaultData);
  const currentValidator = useWatchTransaction('validator', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);
  const fastLeaveValue = useWatchTransaction('fastLeave', form, defaultData);
  const amountValue = useWatchTransaction('value', form, defaultData);

  const { list: allPositions } = useYieldPositionDetail(slug);
  const { compound: positionInfo } = useYieldPositionDetail(slug, fromValue);

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
  const decimals = bondedAsset?.decimals || 0;
  const symbol = (positionInfo as SubnetYieldPositionInfo).subnetData?.subnetSymbol || bondedAsset?.symbol || '';
  const altAsset = useGetChainAssetInfo((poolInfo?.metadata as SpecialYieldPoolMetadata)?.altInputAssets);
  const altSymbol = altAsset?.symbol || '';

  // For subnet staking

  const isSubnetStaking = useMemo(() => [YieldPoolType.SUBNET_STAKING].includes(poolType), [poolType]);
  const [earningSlippage, setEarningSlippage] = useState<number>(0);
  const [maxSlippage, setMaxSlippage] = useState<SlippageType>({ slippage: new BigN(0.005), isCustomType: true });
  const [earningRate, setEarningRate] = useState<number>(0);
  const debounce = useRef<NodeJS.Timeout | null>(null);

  const isDisabledSubnetContent = useMemo(
    () =>
      !isSubnetStaking ||
      !amountValue,

    [isSubnetStaking, amountValue]
  );

  useEffect(() => {
    if (isDisabledSubnetContent) {
      return;
    }

    setLoading(true);

    if (debounce.current) {
      clearTimeout(debounce.current);
    }

    debounce.current = setTimeout(() => {
      const netuid = poolInfo.metadata.subnetData?.netuid || 0;
      const data = {
        slug: poolInfo.slug,
        value: amountValue,
        netuid: netuid,
        type: ExtrinsicType.STAKING_UNBOND
      };

      getEarningSlippage(data)
        .then((result) => {
          console.log('Actual stake slippage:', result.slippage * 100);
          setEarningSlippage(result.slippage);
          setEarningRate(result.rate);
        })
        .catch((error) => {
          console.error('Error fetching earning slippage:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 200);

    return () => {
      if (debounce.current) {
        clearTimeout(debounce.current);
      }
    };
  }, [amountValue, isDisabledSubnetContent, poolInfo.metadata.subnetData?.netuid, poolInfo.slug]);

  const isSlippageAcceptable = useMemo(() => {
    if (earningSlippage === null || !amountValue) {
      return true;
    }

    return earningSlippage <= maxSlippage.slippage.toNumber();
  }, [amountValue, earningSlippage, maxSlippage]);

  const alertBoxRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);

  useEffect(() => {
    if (!isSlippageAcceptable && !hasScrolled && alertBoxRef.current) {
      alertBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHasScrolled(true);
    }
  }, [isSlippageAcceptable, hasScrolled]);

  const renderRate = useCallback(() => {
    return (
      <MetaInfo
        className='__rate-wrapper'
        labelColorScheme={'gray'}
        spaceSize={'sm'}
        valueColorScheme={'gray'}
      >
        <MetaInfo.Number
          className='__label-bottom'
          decimals={decimals}
          label={t('ui.Transaction.Unbond.expectedTaoToReceive')}
          suffix={bondedAsset?.symbol || ''}
          value={BigNumber(amountValue).multipliedBy(earningRate)}
        />
        <MetaInfo.Default
          className='__label-bottom'
          label={t('ui.Transaction.Unbond.conversionRate')}
        >
          <div className='__subnet-rate'>
            <span
              className='chain-name'
              style={{ color: '#A6A6A6' }}
            >
              {`1 ${bondedAsset?.symbol || ''} = `}
            </span>
            <MetaInfo.Number
              className='__label-bottom'
              decimals={decimals}
              suffix={poolInfo.metadata?.subnetData?.subnetSymbol || ''}
              value={BigN(1).multipliedBy(10 ** decimals).multipliedBy(1 / earningRate)}
            />
          </div>
        </MetaInfo.Default>
      </MetaInfo>
    );
  }, [t, poolInfo.metadata?.subnetData?.subnetSymbol, amountValue, earningRate, decimals, bondedAsset?.symbol]);

  // For subnet staking

  const selectedValidator = useMemo((): NominationInfo | undefined => {
    if (positionInfo) {
      return positionInfo.nominations.find((item) => item.validatorAddress === currentValidator);
    } else {
      return undefined;
    }
  }, [currentValidator, positionInfo]);

  // @ts-ignore
  const showFastLeave = useMemo(() => {
    return poolInfo.metadata.availableMethod.defaultUnstake && poolInfo.metadata.availableMethod.fastUnstake;
  }, [poolInfo.metadata]);

  const mustChooseValidator = useMemo(() => {
    return isActionFromValidator(poolType, poolChain || '');
  }, [poolChain, poolType]);

  const bondedValue = useMemo((): string => {
    switch (poolInfo.type) {
      case YieldPoolType.NATIVE_STAKING:
        if (!mustChooseValidator) {
          return positionInfo?.activeStake || '0';
        } else {
          return selectedValidator?.activeStake || '0';
        }

      case YieldPoolType.LENDING: {
        const input = poolInfo.metadata.inputAsset;
        const exchaneRate = poolInfo.statistic?.assetEarning.find((item) => item.slug === input)?.exchangeRate || 1;

        return new BigN(positionInfo?.activeStake || '0').multipliedBy(exchaneRate).toFixed(0);
      }

      case YieldPoolType.SUBNET_STAKING: {
        return selectedValidator?.activeStake || '0';
      }

      case YieldPoolType.LIQUID_STAKING:
      case YieldPoolType.NOMINATION_POOL:
      default:
        return positionInfo?.activeStake || '0';
    }
  }, [mustChooseValidator, poolInfo.metadata.inputAsset, poolInfo.statistic?.assetEarning, poolInfo.type, positionInfo?.activeStake, selectedValidator?.activeStake]);

  const [isChangeData, setIsChangeData] = useState(false);

  const persistValidator = useMemo(() => {
    if (fromValue === defaultData.from && !isChangeData) {
      return defaultData.validator;
    } else {
      return '';
    }
  }, [defaultData.from, defaultData.validator, fromValue, isChangeData]);

  const unBondedTime = useMemo((): string => {
    if (
      poolInfo.statistic &&
      'unstakingPeriod' in poolInfo.statistic &&
      poolInfo.statistic.unstakingPeriod !== undefined
    ) {
      const time = poolInfo.statistic.unstakingPeriod;

      return getEarningTimeText(time);
    } else {
      return t('ui.Transaction.Unbond.unknownTime');
    }
  }, [poolInfo.statistic, t]);

  const currentConfirmation = useMemo(() => {
    if (slug) {
      return getCurrentConfirmation([slug]);
    } else {
      return undefined;
    }
  }, [getCurrentConfirmation, slug]);

  const handleDataForInsufficientAlert = useCallback(
    (estimateFee: AmountData) => {
      return {
        chainName: chainInfoMap[chainValue]?.name || '',
        symbol: estimateFee.symbol
      };
    },
    [chainInfoMap, chainValue]
  );

  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const { onError, onSuccess } = useHandleSubmitTransaction(undefined, handleDataForInsufficientAlert);

  const onValuesChange: FormCallbacks<UnStakeParams>['onValuesChange'] = useCallback((changes: Partial<UnStakeParams>, values: UnStakeParams) => {
    const { from, validator, value } = changes;

    if (from) {
      setIsChangeData(true);
    }

    if ((from || validator) && (amountChange || defaultData.value)) {
      form.validateFields(['value']).finally(noop);
    }

    if (value !== undefined) {
      setAmountChange(true);
    }
  }, [amountChange, form, defaultData.value]);

  const onFieldsChange: FormCallbacks<UnStakeParams>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    // TODO: field change
    const { error } = simpleCheckForm(allFields, ['--asset']);

    const allMap = convertFieldToObject<UnStakeParams>(allFields);

    const checkEmpty: Record<string, boolean> = {};

    for (const [key, value] of Object.entries(allMap)) {
      checkEmpty[key] = !(value === '' || value === undefined || value === null);
    }

    checkEmpty.asset = true;

    if (!mustChooseValidator) {
      checkEmpty.validator = true;
    }

    setIsDisable(error || Object.values(checkEmpty).some((value) => !value));
    persistData(form.getFieldsValue());
  }, [form, mustChooseValidator, persistData]);

  const onSubmit: FormCallbacks<UnStakeParams>['onFinish'] = useCallback((values: UnStakeParams) => {
    if (!positionInfo) {
      return;
    }

    const { fastLeave, from, slug, value } = values;

    const request: RequestYieldLeave = {
      address: from,
      amount: value,
      fastLeave,
      slug,
      poolInfo: poolInfo,
      slippage: maxSlippage.slippage.toNumber()
    };

    if (mustChooseValidator) {
      request.selectedTarget = currentValidator || '';
    }

    const unbondingPromise = yieldSubmitLeavePool(request);

    setLoading(true);

    setTimeout(() => {
      unbondingPromise
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [currentValidator, maxSlippage.slippage, mustChooseValidator, onError, onSuccess, poolInfo, positionInfo]);

  const onClickSubmit = useCallback((values: UnStakeParams) => {
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

  const renderBounded = useCallback(() => {
    return (
      <BondedBalance
        bondedBalance={bondedValue}
        className={'bonded-balance'}
        decimals={decimals}
        isSlippageAcceptable={isSlippageAcceptable}
        isSubnetStaking={isSubnetStaking}
        maxSlippage={maxSlippage}
        setMaxSlippage={setMaxSlippage}
        symbol={symbol}
      />
    );
  }, [bondedValue, decimals, symbol, isSlippageAcceptable, isSubnetStaking, maxSlippage, setMaxSlippage]);

  const onPreCheck = usePreCheckAction(fromValue);

  useRestoreTransaction(form);
  useInitValidateTransaction(validateFields, form, defaultData);

  const accountList = useMemo(() => {
    return accounts.filter(filterAccount(allPositions, chainInfoMap, poolType, poolChain));
  }, [accounts, allPositions, chainInfoMap, poolChain, poolType]);

  const nominators = useMemo(() => {
    if (fromValue && positionInfo?.nominations && positionInfo.nominations.length) {
      return positionInfo.nominations.filter((n) => new BigN(n.activeStake || '0').gt(BN_ZERO));
    }

    return [];
  }, [fromValue, positionInfo?.nominations]);

  useEffect(() => {
    if (poolInfo.metadata.availableMethod.defaultUnstake && poolInfo.metadata.availableMethod.fastUnstake) {
      //
    } else {
      if (poolInfo.metadata.availableMethod.defaultUnstake) {
        form.setFieldValue('fastLeave', false);
      } else {
        form.setFieldValue('fastLeave', true);
      }
    }
  }, [form, poolInfo.metadata]);

  useEffect(() => {
    form.setFieldValue('chain', poolChain || '');
  }, [poolChain, form]);

  useEffect(() => {
    if (isMythosStaking) {
      form.setFieldValue('value', bondedValue);
    }
  }, [poolChain, form, isMythosStaking, bondedValue]);

  useEffect(() => {
    if (!fromValue && accountList.length === 1) {
      form.setFieldValue('from', accountList[0].address);
    }
  }, [accountList, form, fromValue]);

  useEffect(() => {
    if (poolType === YieldPoolType.LENDING) {
      setCustomScreenTitle(t('ui.Transaction.Unbond.withdraw'));
    }

    return () => {
      setCustomScreenTitle(undefined);
    };
  }, [poolType, setCustomScreenTitle, t]);

  const exType = useMemo(() => {
    if (poolType === YieldPoolType.NOMINATION_POOL || poolType === YieldPoolType.NATIVE_STAKING || poolType === YieldPoolType.SUBNET_STAKING) {
      return ExtrinsicType.STAKING_UNBOND;
    }

    if (poolType === YieldPoolType.LIQUID_STAKING) {
      if (chainValue === 'moonbeam') {
        return ExtrinsicType.UNSTAKE_STDOT;
      }

      if (chainValue === 'bifrost_dot') {
        if (slug === 'MANTA___liquid_staking___bifrost_dot') {
          return ExtrinsicType.UNSTAKE_VMANTA;
        }

        return ExtrinsicType.UNSTAKE_VDOT;
      }

      if (chainValue === 'parallel') {
        return ExtrinsicType.UNSTAKE_SDOT;
      }

      if (chainValue === 'acala') {
        return ExtrinsicType.UNSTAKE_LDOT;
      }
    }

    if (poolType === YieldPoolType.LENDING) {
      if (chainValue === 'interlay') {
        return ExtrinsicType.UNSTAKE_QDOT;
      }
    }

    return ExtrinsicType.STAKING_UNBOND;
  }, [poolType, chainValue, slug]);

  const handleValidatorLabel = useMemo(() => {
    const label = getValidatorLabel(chainValue);

    return label !== 'dApp' ? label.toLowerCase() : label;
  }, [chainValue]);

  const unstakeAlertData = poolChain === 'bifrost_dot'
    ? UNSTAKE_BIFROST_ALERT_DATA
    : poolChain.startsWith('bittensor') ? UNSTAKE_BITTENSOR_ALERT_DATA : UNSTAKE_ALERT_DATA;

  return (
    <>
      <TransactionContent>
        <Form
          className={CN('form-container', 'form-space-xxs')}
          form={form}
          initialValues={formDefault}
          name='unstake-form'
          onFieldsChange={onFieldsChange}
          onFinish={onClickSubmit}
          onValuesChange={onValuesChange}
        >
          <HiddenInput fields={hideFields} />
          <Form.Item
            name={'from'}
          >
            <AccountSelector
              addressPrefix={networkPrefix}
              disabled={!isAllAccount}
              doFilter={false}
              externalAccounts={accountList}
              label={poolInfo.type === YieldPoolType.LENDING ? t('ui.Transaction.Unbond.withdrawFromAccount') : t('ui.Transaction.Unbond.unstakeFromAccount')}
            />
          </Form.Item>
          <FreeBalance
            address={fromValue}
            chain={chainValue}
            className={'free-balance'}
            label={t('ui.Transaction.Unbond.availableBalance')}
            onBalanceReady={setIsBalanceReady}
          />

          <Form.Item
            hidden={!mustChooseValidator}
            name={'validator'}
          >
            <NominationSelector
              chain={chainValue}
              defaultValue={persistValidator}
              disabled={!fromValue}
              label={t('ui.Transaction.Unbond.selectValidatorLabel', { replace: { handleValidatorLabel: handleValidatorLabel } })}
              networkPrefix={networkPrefix}
              nominators={nominators}
              poolInfo={poolInfo}
            />
          </Form.Item>

          {
            mustChooseValidator && (
              <>
                {renderBounded()}
              </>
            )
          }

          <Form.Item
            hidden={isMythosStaking}
            name={'value'}
            statusHelpAsTooltip={true}
          >
            <AmountInput
              decimals={decimals}
              maxValue={bondedValue}
              showMaxButton={true}
            />
          </Form.Item>

          {
            !isDisabledSubnetContent && earningRate > 0 && (
              <>
                {renderRate()}
              </>
            )
          }

          {!mustChooseValidator && renderBounded()}

          <Form.Item
            hidden={!showFastLeave}
            name={'fastLeave'}
            valuePropName='checked'
          >
            <Checkbox>
              <span className={'__option-label'}>{t('ui.Transaction.Unbond.fastUnstake')}</span>
            </Checkbox>
          </Form.Item>

          <div className={'__instruction-items-container'}>
            {!fastLeaveValue || !showFastLeave
              ? (
                poolInfo.type !== YieldPoolType.LENDING
                  ? (
                    <>
                      {!!unstakeAlertData.length && unstakeAlertData.map((_props, index) => {
                        return (
                          <InstructionItem
                            className={'__instruction-item'}
                            description={(
                              <div dangerouslySetInnerHTML={{ __html: (_props.description)?.replace('{unBondedTime}', unBondedTime) }}></div>
                            )}
                            iconInstruction={
                              <BackgroundIcon
                                backgroundColor={getAlphaColor(_props.iconColor, 0.1)}
                                iconColor={_props.iconColor}
                                phosphorIcon={getBannerButtonIcon(_props.icon)}
                                size='lg'
                                weight='fill'
                              />
                            }
                            key={`${_props.icon}-${index}`}
                            title={_props.title}
                          />
                        );
                      })}
                      {!isSlippageAcceptable && (
                        <div
                          className='__instruction-item'
                          ref={alertBoxRef}
                        >
                          <AlertBox
                            description={`Unable to unstake due to a slippage of ${(earningSlippage * 100).toFixed(2)}%, which exceeds the current slippage set for this transaction. Lower your unstake amount or increase slippage and try again`}
                            title='Slippage too high!'
                            type='error'
                          />
                        </div>
                      )}
                    </>
                  )
                  : (
                    <AlertBox
                      description={t('ui.Transaction.Unbond.withdrawSuppliedFundsImmediately')}
                      title={t('ui.Transaction.Unbond.withdraw')}
                      type={'info'}
                    />
                  )
              )
              : (
                <AlertBox
                  description={poolChain === 'bifrost_dot'
                    ? t('ui.Transaction.Unbond.fastExchangeModeDescription', { replace: { symbol: symbol, altSymbol: altSymbol } })
                    : t('ui.Transaction.Unbond.fastUnstakeInfo')}
                  title={t('ui.Transaction.Unbond.fastUnstake')}
                  type={'info'}
                />
              )}
          </div>
        </Form>
      </TransactionContent>
      <TransactionFooter>
        {/* todo: recheck action type, it may not work as expected any more */}
        <Button
          disabled={isDisable || !isBalanceReady || !isSlippageAcceptable}
          icon={(
            <Icon
              phosphorIcon={MinusCircle}
              weight={'fill'}
            />
          )}
          loading={loading}
          onClick={onPreCheck(form.submit, exType)}
        >
          {poolInfo.type === YieldPoolType.LENDING ? t('ui.Transaction.Unbond.withdraw') : t('ui.Transaction.Unbond.unstake')}
        </Button>
      </TransactionFooter>
    </>
  );
};

const Wrapper: React.FC<Props> = (props: Props) => {
  const { className } = props;

  return (
    <EarnOutlet
      className={CN(className)}
      path={'/transaction/unstake'}
      stores={['earning']}
    >
      <Component />
    </EarnOutlet>
  );
};

const Unbond = styled(Wrapper)<Props>(({ theme: { token } }: Props) => {
  return {
    '&.page-wrapper': {
      display: 'flex',
      flexDirection: 'column'
    },

    '.bonded-balance, .free-balance': {
      marginBottom: token.margin
    },

    '.meta-info': {
      marginTop: token.paddingSM
    },

    '.mt': {
      marginTop: token.marginSM
    },

    '.__instruction-items-container, .__instruction-item + .__instruction-item': {
      marginTop: token.marginSM
    },

    '.ant-checkbox-wrapper': {
      display: 'flex',
      alignItems: 'center',

      '.ant-checkbox': {
        top: 0
      }
    },

    // TODO: recheck with other UI
    '.__subnet-rate': {
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem'
    },

    '.__rate-wrapper': {
      marginTop: token.paddingSM
    },

    '.__label-bottom, .__label-bottom *': {
      color: `${token['gray-5']} !important`
    },

    '.__label-bottom, .__value': {
      color: `${token['gray-5']} !important`
    }
  };
});

export default Unbond;
