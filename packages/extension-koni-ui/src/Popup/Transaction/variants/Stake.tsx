// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NominationPoolInfo, NominatorMetadata, StakingType, ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { _getOriginChainOfAsset } from '@subwallet/extension-base/services/chain-service/utils';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { AccountSelector, AmountInput, MetaInfo, MultiValidatorSelector, PageWrapper, PoolSelector, RadioGroup, StakingNetworkDetailModal, TokenSelector } from '@subwallet/extension-koni-ui/components';
import { ALL_KEY } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useFetchChainState, useGetBalance, useGetChainStakingMetadata, useGetNativeTokenBasicInfo, useGetNativeTokenSlug, useGetNominatorInfo, useGetSupportedStakingTokens, useHandleSubmitTransaction, usePreCheckReadOnly, useSelector } from '@subwallet/extension-koni-ui/hooks';
import useFetchChainAssetInfo from '@subwallet/extension-koni-ui/hooks/screen/common/useFetchChainAssetInfo';
import { submitBonding, submitPoolBonding } from '@subwallet/extension-koni-ui/messaging';
import { FormCallbacks, FormFieldData, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertFieldToObject, isAccountAll, parseNominations, reformatAddress, simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { Button, Divider, Form, Icon } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import { PlusCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import styled from 'styled-components';

import { isEthereumAddress } from '@polkadot/util-crypto';

import { accountFilterFunc, fetchChainValidators } from '../helper';
import { FreeBalance, TransactionContent, TransactionFooter } from '../parts';
import { TransactionContext, TransactionFormBaseProps } from '../Transaction';

type Props = ThemeProps

enum FormFieldName {
  VALUE = 'amount',
  NOMINATE = 'nominate',
  POOL = 'pool',
  TYPE = 'type',
}

interface StakeFormProps extends TransactionFormBaseProps {
  [FormFieldName.VALUE]: string;
  [FormFieldName.NOMINATE]: string;
  [FormFieldName.POOL]: string;
  [FormFieldName.TYPE]: StakingType;
}

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;

  const { t } = useTranslation();
  const { chain: stakingChain, type: _stakingType } = useParams();

  const dataContext = useContext(DataContext);
  const { asset,
    chain,
    from,
    onDone,
    setAsset,
    setChain,
    setDisabledRightBtn,
    setFrom,
    setShowRightBtn } = useContext(TransactionContext);

  // TODO: should do better to get validators info
  const { nominationPoolInfoMap, validatorInfoMap } = useSelector((state) => state.bonding);

  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const chainState = useFetchChainState(chain);
  const currentAccount = useSelector((state) => state.accountState.currentAccount);
  const assetInfo = useFetchChainAssetInfo(asset);

  const isEthAdr = isEthereumAddress(currentAccount?.address);

  const defaultStakingType: StakingType = useMemo(() => {
    if (isEthAdr) {
      return StakingType.NOMINATED;
    }

    switch (_stakingType) {
      case StakingType.POOLED:
        return StakingType.POOLED;
      case StakingType.NOMINATED:
        return StakingType.NOMINATED;
      default:
        return StakingType.POOLED;
    }
  }, [_stakingType, isEthAdr]);

  const [form] = Form.useForm<StakeFormProps>();

  const [isDisable, setIsDisable] = useState(true);

  const stakingType = Form.useWatch(FormFieldName.TYPE, form);

  const chainStakingMetadata = useGetChainStakingMetadata(chain);
  const nominatorMetadataList = useGetNominatorInfo(chain, stakingType, from);

  const nominatorMetadata: NominatorMetadata | undefined = useMemo(() => nominatorMetadataList[0], [nominatorMetadataList]);

  const { nativeTokenBalance } = useGetBalance(chain, from);
  const tokenList = useGetSupportedStakingTokens(stakingType, from, stakingChain);

  const isRelayChain = useMemo(() => _STAKING_CHAIN_GROUP.relay.includes(chain), [chain]);

  const [loading, setLoading] = useState(false);
  const [poolLoading, setPoolLoading] = useState(false);
  const [validatorLoading, setValidatorLoading] = useState(false);
  const [isBalanceReady, setIsBalanceReady] = useState(true);
  const [valueChange, setValueChange] = useState(false);
  const [, update] = useState({});

  const existentialDeposit = useMemo(() => {
    if (assetInfo) {
      return assetInfo.minAmount || '0';
    }

    return '0';
  }, [assetInfo]);

  const maxValue = useMemo(() => {
    const balance = new BigN(nativeTokenBalance.value);
    const ed = new BigN(existentialDeposit);

    if (ed.gte(balance)) {
      return '0';
    } else {
      return balance.minus(ed).toString();
    }
  }, [existentialDeposit, nativeTokenBalance.value]);

  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);

  const isAllAccount = isAccountAll(currentAccount?.address || '');

  const defaultSlug = useGetNativeTokenSlug(stakingChain || '');

  const formDefault: StakeFormProps = useMemo(() => {
    return {
      asset: defaultSlug,
      from: from,
      chain: chain,
      [FormFieldName.VALUE]: '0',
      [FormFieldName.POOL]: '',
      [FormFieldName.NOMINATE]: '',
      [FormFieldName.TYPE]: defaultStakingType
    };
  }, [defaultSlug, from, defaultStakingType, chain]);

  const minStake = useMemo(() =>
    stakingType === StakingType.POOLED ? chainStakingMetadata?.minJoinNominationPool || '0' : chainStakingMetadata?.minStake || '0'
  , [chainStakingMetadata?.minJoinNominationPool, chainStakingMetadata?.minStake, stakingType]
  );

  const { onError, onSuccess } = useHandleSubmitTransaction(onDone);

  const onFieldsChange: FormCallbacks<StakeFormProps>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    const { error } = simpleCheckForm(allFields);

    const allMap = convertFieldToObject<StakeFormProps>(allFields);
    const changesMap = convertFieldToObject<StakeFormProps>(changedFields);

    const { amount: value, asset, from } = changesMap;

    if (value) {
      setValueChange(true);
    }

    if (from) {
      setFrom(from);
    }

    if (asset !== undefined) {
      const chain = _getOriginChainOfAsset(asset);

      setAsset(asset);
      setChain(chain);
    }

    const checkEmpty: Record<string, boolean> = {};

    const stakingType = allMap[FormFieldName.TYPE];

    for (const [key, value] of Object.entries(allMap)) {
      checkEmpty[key] = !!value;
    }

    if (stakingType === StakingType.NOMINATED) {
      checkEmpty.pool = true;
    } else if (stakingType === StakingType.POOLED) {
      checkEmpty.nominate = true;
    }

    setIsDisable(error || Object.values(checkEmpty).some((value) => !value));
  }, [setAsset, setChain, setFrom]);

  const getSelectedValidators = useCallback((nominations: string[]) => {
    const validatorList = validatorInfoMap[chain];

    if (!validatorList) {
      return [];
    }

    const result: ValidatorInfo[] = [];

    validatorList.forEach((validator) => {
      if (nominations.includes(reformatAddress(validator.address, 42))) { // remember the format of the address
        result.push(validator);
      }
    });

    return result;
  }, [chain, validatorInfoMap]);

  const getSelectedPool = useCallback((poolId?: string) => {
    const nominationPoolList = nominationPoolInfoMap[chain];

    for (const pool of nominationPoolList) {
      if (String(pool.id) === poolId) {
        return pool;
      }
    }

    return undefined;
  }, [nominationPoolInfoMap, chain]);

  const onSubmit: FormCallbacks<StakeFormProps>['onFinish'] = useCallback((values: StakeFormProps) => {
    setLoading(true);
    const { from,
      [FormFieldName.NOMINATE]: nominate,
      [FormFieldName.POOL]: pool,
      [FormFieldName.VALUE]: value,
      [FormFieldName.TYPE]: type } = values;
    let bondingPromise: Promise<SWTransactionResponse>;

    if (pool && type === StakingType.POOLED) {
      const selectedPool = getSelectedPool(pool);

      bondingPromise = submitPoolBonding({
        amount: value,
        chain: chain,
        nominatorMetadata: nominatorMetadata,
        selectedPool: selectedPool as NominationPoolInfo,
        address: from
      });
    } else {
      const selectedValidators = getSelectedValidators(parseNominations(nominate));

      bondingPromise = submitBonding({
        amount: value,
        chain: chain,
        nominatorMetadata: nominatorMetadata,
        selectedValidators,
        address: from,
        type: StakingType.NOMINATED
      });
    }

    setTimeout(() => {
      bondingPromise
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [getSelectedPool, chain, nominatorMetadata, getSelectedValidators, onSuccess, onError]);

  const getMetaInfo = useCallback(() => {
    if (chainStakingMetadata) {
      return (
        <MetaInfo
          className={'meta-info'}
          labelColorScheme={'gray'}
          spaceSize={'xs'}
          valueColorScheme={'light'}
        >
          {
            chainStakingMetadata.expectedReturn &&
            (
              <MetaInfo.Number
                label={t('Estimated earnings:')}
                suffix={'% / year'}
                value={chainStakingMetadata.expectedReturn}
              />
            )
          }

          {
            chainStakingMetadata.minStake &&
            (
              <MetaInfo.Number
                decimals={decimals}
                label={t('Minimum active:')}
                suffix={symbol}
                value={minStake}
                valueColorSchema={'success'}
              />
            )
          }
        </MetaInfo>
      );
    }

    return null;
  }, [chainStakingMetadata, decimals, symbol, t, minStake]);

  const onPreCheckReadOnly = usePreCheckReadOnly(from);

  useEffect(() => {
    const address = currentAccount?.address || '';

    if (address) {
      if (!isAccountAll(address)) {
        setFrom(address);
      }
    }
  }, [currentAccount?.address, setFrom]);

  useEffect(() => {
    if (stakingChain && stakingChain !== ALL_KEY) {
      setChain(stakingChain);
    }
  }, [setChain, stakingChain]);

  useEffect(() => {
    setAsset(defaultSlug);
  }, [defaultSlug, setAsset]);

  useEffect(() => {
    setShowRightBtn(true);
  }, [setShowRightBtn]);

  useEffect(() => {
    setDisabledRightBtn(!chainStakingMetadata);
  }, [chainStakingMetadata, setDisabledRightBtn]);

  useEffect(() => {
    let unmount = false;

    // fetch validators when change chain
    // _stakingType is predefined form start
    if (!!chain && !!from && chainState?.active) {
      fetchChainValidators(chain, _stakingType || ALL_KEY, unmount, setPoolLoading, setValidatorLoading);
    }

    return () => {
      unmount = true;
    };
  }, [from, _stakingType, chain, chainState?.active]);

  useEffect(() => {
    let cancel = false;

    if (valueChange) {
      if (!cancel) {
        setTimeout(() => {
          form.validateFields([FormFieldName.VALUE]).finally(() => update({}));
        }, 100);
      }
    }

    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, nativeTokenBalance.value]);

  return (
    <>
      <TransactionContent>
        <PageWrapper
          className={className}
          resolve={dataContext.awaitStores(['staking'])}
        >
          <Form
            className={'form-container form-space-sm'}
            form={form}
            initialValues={formDefault}
            onFieldsChange={onFieldsChange}
            onFinish={onSubmit}
          >
            <Form.Item
              className='staking-type'
              hidden={_stakingType !== ALL_KEY}
              name={FormFieldName.TYPE}
            >
              <RadioGroup
                optionType='button'
                options={[
                  {
                    label: 'Pools',
                    value: StakingType.POOLED,
                    disabled: isEthAdr
                  },
                  {
                    label: 'Nominate',
                    value: StakingType.NOMINATED
                  }
                ]}
              />
            </Form.Item>
            <Form.Item
              hidden={!isAllAccount}
              name={'from'}
            >
              <AccountSelector filter={accountFilterFunc(chainInfoMap, stakingType, stakingChain)} />
            </Form.Item>

            {
              !isAllAccount &&
              (
                <Form.Item name={'asset'}>
                  <TokenSelector
                    disabled={stakingChain !== ALL_KEY || !from}
                    items={tokenList}
                    prefixShape='circle'
                  />
                </Form.Item>
              )
            }

            <FreeBalance
              address={from}
              chain={chain}
              className={'account-free-balance'}
              label={t('Available balance:')}
              onBalanceReady={setIsBalanceReady}
            />

            <div className={'form-row'}>
              {
                isAllAccount &&
                (
                  <Form.Item name={'asset'}>
                    <TokenSelector
                      disabled={stakingChain !== ALL_KEY || !from}
                      items={tokenList}
                      prefixShape='circle'
                    />
                  </Form.Item>
                )
              }

              <Form.Item
                name={FormFieldName.VALUE}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator: (_, value: string) => {
                      const type = getFieldValue(FormFieldName.TYPE) as StakingType;
                      const val = new BigN(value);

                      if (type === StakingType.POOLED) {
                        if (val.lte(0)) {
                          return Promise.reject(new Error('Amount must be greater than 0'));
                        }
                      } else {
                        if (!nominatorMetadata?.isBondedBefore || !isRelayChain) {
                          if (val.lte(0)) {
                            return Promise.reject(new Error('Amount must be greater than 0'));
                          }
                        }
                      }

                      if (val.gt(nativeTokenBalance.value)) {
                        return Promise.reject(t('Amount cannot exceed your balance'));
                      }

                      return Promise.resolve();
                    }
                  })
                ]}
                statusHelpAsTooltip={true}
              >
                <AmountInput
                  decimals={(chain && from) ? decimals : -1}
                  maxValue={maxValue}
                  showMaxButton={false}
                />
              </Form.Item>
            </div>

            <Form.Item
              hidden={stakingType !== StakingType.POOLED}
              name={FormFieldName.POOL}
            >
              <PoolSelector
                chain={chain}
                from={from}
                label={t('Select pool')}
                loading={poolLoading}
              />
            </Form.Item>

            <Form.Item
              hidden={stakingType !== StakingType.NOMINATED}
              name={FormFieldName.NOMINATE}
            >
              <MultiValidatorSelector
                chain={asset ? chain : ''}
                from={asset ? from : ''}
                loading={validatorLoading}
              />
            </Form.Item>
          </Form>
          {
            chainStakingMetadata && (
              <>
                <Divider className='staking-divider' />
                {getMetaInfo()}
              </>
            )
          }
        </PageWrapper>
      </TransactionContent>

      <TransactionFooter
        errors={[]}
        warnings={[]}
      >
        <Button
          disabled={isDisable || !isBalanceReady}
          icon={(
            <Icon
              phosphorIcon={PlusCircle}
              weight={'fill'}
            />
          )}
          loading={loading}
          onClick={onPreCheckReadOnly(form.submit)}
        >
          {t('Stake')}
        </Button>
      </TransactionFooter>

      {
        chainStakingMetadata &&
        (
          <StakingNetworkDetailModal
            activeNominators={chainStakingMetadata.nominatorCount}
            estimatedEarning={chainStakingMetadata.expectedReturn}
            inflation={chainStakingMetadata.inflation}
            maxValidatorPerNominator={chainStakingMetadata.maxValidatorPerNominator}
            minimumActive={{ decimals, value: minStake, symbol }}
            stakingType={stakingType}
            unstakingPeriod={chainStakingMetadata.unstakingPeriod}
          />
        )
      }
    </>
  );
};

const Stake = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.staking-type': {
      marginBottom: token.margin
    },

    '.account-free-balance': {
      marginBottom: token.marginXS
    },

    '.meta-info': {
      marginTop: token.paddingSM
    },

    '.react-tabs__tab-list': {
      marginLeft: 0,
      marginRight: 0
    },

    '.staking-divider': {
      marginTop: token.margin + 2,
      marginBottom: token.marginSM
    }
  };
});

export default Stake;
