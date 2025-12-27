// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { SubnetYieldPositionInfo, YieldPoolInfo } from '@subwallet/extension-base/types';
import { AccountAddressSelector, AddressInputNew, AddressInputRef, AmountInput, EarningValidatorSelector, NominationSelector, NumberDisplay } from '@subwallet/extension-koni-ui/components';
import { useGetBalance, useGetChainPrefixBySlug, useTranslation, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { fetchPoolTarget } from '@subwallet/extension-koni-ui/messaging';
import { store } from '@subwallet/extension-koni-ui/stores';
import { AccountAddressItemType, Theme, ThemeProps, TransferParams } from '@subwallet/extension-koni-ui/types';
import { formatBalance } from '@subwallet/extension-koni-ui/utils';
import { ActivityIndicator, Form, FormInstance, Typography } from '@subwallet/react-ui';
import { Rule } from '@subwallet/react-ui/es/form';
import BigN from 'bignumber.js';
import CN from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';

import { BN, BN_ZERO } from '@polkadot/util';

type Props = ThemeProps & {
  form: FormInstance<TransferParams>,
  chainValue: string,
  fromValue: string,
  defaultData: TransferParams,
  decimals: number,
  setTargetLoading: (v: boolean) => void;
  assetInfo: _ChainAsset,
  destChainValue: string,
  disabledToAddressInput: boolean,
  addressInputRef: React.RefObject<AddressInputRef>,
  addressInputRenderKey: string|number,
  destAssetInfo: _ChainAsset,
  accountAddressItems: AccountAddressItemType[],
  validateRecipient: (rule: Rule, value: string) => Promise<void>,
  positionInfo?: SubnetYieldPositionInfo[],
  onBalanceReady?: (rs: boolean) => void;
  poolInfo: YieldPoolInfo,
  amountInputRenderKey: string;
  isNotShowAccountSelector?: boolean;
  setIsTransferAll: (v: boolean) => void;
};

const Component = ({ accountAddressItems, addressInputRef, addressInputRenderKey, amountInputRenderKey, assetInfo, chainValue, className, decimals, defaultData, destAssetInfo,
  destChainValue, disabledToAddressInput, form, fromValue, isNotShowAccountSelector, onBalanceReady, poolInfo, positionInfo, setIsTransferAll, setTargetLoading, validateRecipient }: Props) => {
  const networkPrefix = useGetChainPrefixBySlug(chainValue);
  const { token } = useTheme() as Theme;
  const { error, isLoading, nativeTokenBalance } = useGetBalance(chainValue, fromValue, undefined, true);

  const { t } = useTranslation();
  const originValidator = useWatchTransaction('fromValidator', form, defaultData);

  const [forceFetchValidator, setForceFetchValidator] = useState(false);

  const activePosition = useMemo<SubnetYieldPositionInfo | undefined>(() => {
    if (!positionInfo || !positionInfo.length) {
      return undefined;
    }

    return (
      positionInfo.find((p) => p.nominations?.length > 0) ?? positionInfo[0]
    );
  }, [positionInfo]);

  const selectedValidator = useMemo(() => {
    return activePosition?.nominations.find((item) => item.validatorAddress === originValidator);
  }, [originValidator, activePosition]);

  const bondedValue = useMemo(() => {
    return selectedValidator?.activeStake || '0';
  }, [selectedValidator]);

  const nominators = useMemo(() => {
    if (fromValue && activePosition?.nominations?.length) {
      return activePosition.nominations.filter((n) => new BigN(n.activeStake || '0').gt(0));
    }

    return [];
  }, [fromValue, activePosition]);

  const validateAlphaAmount = useCallback((rule: any, amount: string) => {
    const maxTransfer = bondedValue;

    if (!amount) {
      return Promise.reject(t('ui.TRANSACTION.screen.Transaction.SendFund.amountIsRequired'));
    }

    if (new BN(maxTransfer).lte(BN_ZERO)) {
      return Promise.reject(t('ui.TRANSACTION.screen.Transaction.SendFund.notEnoughTokensToProceed'));
    }

    if (new BigN(amount).eq(0)) {
      return Promise.reject(t('ui.TRANSACTION.screen.Transaction.SendFund.amountMustBeGreaterThanZero'));
    }

    if (new BigN(amount).gt(new BigN(maxTransfer))) {
      const maxString = formatBalance(maxTransfer, decimals);

      return Promise.reject(
        t('ui.TRANSACTION.screen.Transaction.SendFund.amountMaxError', {
          replace: { number: maxString }
        })
      );
    }

    return Promise.resolve();
  }, [decimals, t, bondedValue]);

  const onSetMaxAlphaTokenTransferable = useCallback((value: boolean) => {
    const bnMaxTransfer = new BN(bondedValue);

    if (!bnMaxTransfer.isZero()) {
      setIsTransferAll(value);
    }
  }, [bondedValue, setIsTransferAll]);

  useEffect(() => {
    let unmount = false;

    if ((!!fromValue || forceFetchValidator)) {
      setTargetLoading(true);
      const slug = poolInfo?.slug || '';

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
  }, [fromValue, forceFetchValidator, setTargetLoading, setForceFetchValidator, poolInfo?.slug]);

  useEffect(() => {
    onBalanceReady?.(!isLoading && !error);
  }, [error, isLoading, onBalanceReady]);

  return (
    <div className={className}>
      <div className={'from-section'}>
        <Form.Item
          className={CN({ hidden: isNotShowAccountSelector })}
          name={'from'}
          statusHelpAsTooltip={true}
        >
          <AccountAddressSelector
            items={accountAddressItems}
            label={`${t('ui.TRANSACTION.screen.Transaction.AlphaTokenTransferSection.from')}:`}
            labelStyle={'horizontal'}
          />
        </Form.Item>

        <Form.Item name={'fromValidator'}>
          <NominationSelector
            chain={chainValue}
            disabled={!fromValue}
            isChangeValidator={true}
            label={t('ui.TRANSACTION.screen.Transaction.AlphaTokenTransferSection.selectFromValidator')}
            networkPrefix={networkPrefix}
            nominators={nominators}
            poolInfo={poolInfo}
          />
        </Form.Item>
      </div>

      <div className={'recipient-section'}>
        <Form.Item
          name={'to'}
          rules={[{ validator: validateRecipient }]}
          validateTrigger={false}
        >
          <AddressInputNew
            chainSlug={destChainValue}
            disabled={disabledToAddressInput}
            dropdownHeight={317}
            key={addressInputRenderKey}
            label={t('ui.TRANSACTION.screen.Transaction.AlphaTokenTransferSection.to')}
            labelStyle={'horizontal'}
            placeholder={t('ui.TRANSACTION.screen.Transaction.AlphaTokenTransferSection.enterAddress')}
            ref={addressInputRef}
            showAddressBook
            showScanner
            tokenSlug={destAssetInfo?.slug}
          />
        </Form.Item>

        <Form.Item name={'toValidator'}>
          <EarningValidatorSelector
            chain={chainValue}
            from={fromValue}
            label={t('ui.TRANSACTION.screen.Transaction.AlphaTokenTransferSection.selectToValidator')}
            setForceFetchValidator={setForceFetchValidator}
            slug={poolInfo.slug}
          />
        </Form.Item>
      </div>

      <div className={'free-balance-block'}>
        {!error && <span>{t('ui.TRANSACTION.screen.Transaction.part.AlphaTokenTransferSection.availableBalance')}:</span>}
        {isLoading && <ActivityIndicator size={14} />}
        {error && <Typography.Text className={'error-message'}>{error}</Typography.Text>}

        {!isLoading && !error && nativeTokenBalance && (
          <div className={'free-balance-value'}>
            <NumberDisplay
              className='__native-token-balance-value'
              decimal={decimals}
              decimalColor={token.colorTextTertiary}
              intColor={token.colorTextTertiary}
              size={14}
              suffix={nativeTokenBalance.symbol}
              unitColor={token.colorTextTertiary}
              value={nativeTokenBalance.value}
            />
            <span className={'__name'}>&nbsp;{t('ui.TRANSACTION.screen.Transaction.part.AlphaTokenTransferSection.and')}&nbsp;</span>
            <NumberDisplay
              className='__alpha-token-balance-value'
              decimal={decimals}
              decimalColor={token.colorTextTertiary}
              intColor={token.colorTextTertiary}
              size={14}
              suffix={assetInfo.symbol}
              unitColor={token.colorTextTertiary}
              value={bondedValue}
            />
          </div>
        )}
      </div>

      <Form.Item
        name={'value'}
        rules={[
          {
            validator: validateAlphaAmount
          }
        ]}
        statusHelpAsTooltip={true}
        validateTrigger={false}
      >
        <AmountInput
          decimals={decimals}
          disabled={decimals === 0}
          key={amountInputRenderKey}
          maxValue={bondedValue}
          onSetMax={onSetMaxAlphaTokenTransferable}
          showMaxButton={true}
          tooltip={t('ui.TRANSACTION.screen.Transaction.AlphaTokenTransferSection.amount')}
        />
      </Form.Item>
    </div>
  );
};

export const AlphaTokenTransferSection = styled(Component)(({ theme }) => {
  const token = (theme as Theme).token;

  return {
    '.from-section': {
      padding: token.paddingSM,
      backgroundColor: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,

      '.ant-form-item:last-child': {
        marginBottom: 0
      },

      '.ant-select-modal-input-container.ant-select-modal-input-bg-default': {
        backgroundColor: 'rgba(37,37,37,1)'
      },

      '.ant-field-container.ant-field-border-default.ant-field-bg-default': {
        backgroundColor: 'rgba(37,37,37,1)'
      }
    },

    '.recipient-section': {
      padding: token.paddingSM,
      backgroundColor: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      marginTop: token.marginSM,

      '.ant-form-item:last-child': {
        marginBottom: 0
      },

      '.ant-input-container': {
        backgroundColor: 'rgba(37,37,37,1)'
      },

      '.ant-form-item .select-validator-input': {
        backgroundColor: 'rgba(37,37,37,1)'
      }
    },

    '.free-balance-block': {
      display: 'flex',
      marginBottom: `${token.marginSM}`,
      justifyContent: 'end',
      color: `${token.colorTextTertiary} `,
      gap: token.marginXXS,
      marginTop: token.marginSM
    },

    '.free-balance-value': {
      display: 'flex',
      flexWrap: 'wrap',
      color: token.colorTextTertiary
    }
  };
});
