// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { SubnetYieldPositionInfo, YieldPoolInfo } from '@subwallet/extension-base/types';
import { AccountAddressSelector, AddressInputNew, AddressInputRef, AmountInput, EarningValidatorSelector, NominationSelector } from '@subwallet/extension-koni-ui/components';
import { useGetChainPrefixBySlug, useTranslation, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { fetchPoolTarget } from '@subwallet/extension-koni-ui/messaging';
import { store } from '@subwallet/extension-koni-ui/stores';
import { Theme, ThemeProps, TransferParams } from '@subwallet/extension-koni-ui/types';
import { formatBalance } from '@subwallet/extension-koni-ui/utils';
import { Form, FormInstance } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

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
  accountAddressItems: any[],
  validateRecipient: (rule: any, value: any) => Promise<void>,
  positionInfo?: SubnetYieldPositionInfo,
  poolInfo: YieldPoolInfo,
  amountInputRenderKey: string;
  isNotShowAccountSelector?: boolean;
  setIsTransferAll: (v: boolean) => void;
};

const Component = ({ accountAddressItems, addressInputRef, addressInputRenderKey, amountInputRenderKey, assetInfo, chainValue, decimals, defaultData, destAssetInfo,
  destChainValue, disabledToAddressInput, form, fromValue, isNotShowAccountSelector, poolInfo, positionInfo, setIsTransferAll, setTargetLoading, validateRecipient }: Props) => {
  const networkPrefix = useGetChainPrefixBySlug(chainValue);
  const { t } = useTranslation();
  const originValidator = useWatchTransaction('fromValidator', form, defaultData);

  const [forceFetchValidator, setForceFetchValidator] = useState(false);

  const selectedValidator = useMemo(() => {
    return positionInfo?.nominations.find((item) => item.validatorAddress === originValidator);
  }, [originValidator, positionInfo]);

  const bondedValue = useMemo(() => {
    return selectedValidator?.activeStake || '0';
  }, [selectedValidator]);

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

  return (
    <>
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

      <Form.Item name={'fromValidator'}>
        <NominationSelector
          chain={chainValue}
          isChangeValidator={true}
          label={t('Select validator')}
          networkPrefix={networkPrefix}
          nominators={positionInfo?.nominations || []}
          poolInfo={poolInfo}
        />
      </Form.Item>

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
          label={t('ui.TRANSACTION.screen.Transaction.SendFund.to')}
          labelStyle={'horizontal'}
          placeholder={t('ui.TRANSACTION.screen.Transaction.SendFund.enterAddress')}
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
          label={t('Select validator')}
          setForceFetchValidator={setForceFetchValidator}
          slug={poolInfo.slug}
        />
      </Form.Item>

      <div className={'free-balance-block'}>
        <span>{t('Sender available balance:')}</span>
        <span>&nbsp;{formatBalance(bondedValue, decimals)}&nbsp;</span>
        <span>{assetInfo.symbol}</span>
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
          tooltip={t('ui.TRANSACTION.screen.Transaction.SendFund.amount')}
        />
      </Form.Item>
    </>
  );
};

export const AlphaTokenTransferSection = styled(Component)(({ theme }) => {
  const token = (theme as Theme).token;

  return {
    '.free-balance-block': {
      display: 'flex !important',
      marginBottom: `${token.marginSM} !important`,
      justifyContent: 'end !important',
      color: `${token.colorTextTertiary} !important`
    }
  };
});
