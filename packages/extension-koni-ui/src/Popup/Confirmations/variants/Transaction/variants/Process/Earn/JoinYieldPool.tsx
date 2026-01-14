// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { ProcessTransactionData, SubmitYieldStepData, SummaryEarningProcessData } from '@subwallet/extension-base/types';
import { CommonTransactionInfo, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { useGetTransactionProcessSteps, useSelector } from '@subwallet/extension-koni-ui/hooks';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseProcessConfirmationProps } from '../Base';

type Props = BaseProcessConfirmationProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className, transaction } = props;
  const { t } = useTranslation();

  const process = useMemo(() => transaction.process as ProcessTransactionData, [transaction.process]);
  const txParams = useMemo(() => (process.combineInfo as SummaryEarningProcessData).data as unknown as SubmitYieldStepData, [process.combineInfo]);

  const { assetRegistry: tokenInfoMap } = useSelector((state) => state.assetRegistry);
  const { currencyData } = useSelector((state) => state.price);
  const priceMap = useSelector((state) => state.price.priceMap);

  const { inputTokenDecimals, inputTokenSymbol } = useMemo(() => {
    const inputTokenInfo = tokenInfoMap[txParams.inputTokenSlug];

    return {
      inputTokenSymbol: _getAssetSymbol(inputTokenInfo),
      inputTokenDecimals: _getAssetDecimals(inputTokenInfo)
    };
  }, [tokenInfoMap, txParams.inputTokenSlug]);

  const derivativeTokenBasicInfo = useMemo(() => {
    if (!txParams.derivativeTokenSlug) {
      return;
    }

    const derivativeTokenInfo = tokenInfoMap[txParams.derivativeTokenSlug];

    return {
      symbol: _getAssetSymbol(derivativeTokenInfo),
      decimals: _getAssetDecimals(derivativeTokenInfo)
    };
  }, [txParams.derivativeTokenSlug, tokenInfoMap]);

  const estimatedReceivables = useMemo(() => {
    return Math.floor(parseInt(txParams.amount) / txParams.exchangeRate);
  }, [txParams.amount, txParams.exchangeRate]);

  const getTransactionProcessSteps = useGetTransactionProcessSteps();

  const estimatedFee = useMemo(() => {
    let _totalFee = 0;

    if (process.steps) {
      process.steps.forEach((step) => {
        if (step.fee.defaultFeeToken !== '') {
          const asset = tokenInfoMap[step.fee.defaultFeeToken];
          const feeDecimals = _getAssetDecimals(asset);
          const _priceValue = asset.priceId ? (priceMap[asset.priceId] ?? 0) : 0;
          const feeValue = step.fee.feeComponent[0].amount;
          const feeNumb = _priceValue * (feeValue ? parseFloat(feeValue) / 10 ** feeDecimals : 0);

          _totalFee += feeNumb;
        }
      });
    }

    return _totalFee;
  }, [tokenInfoMap, priceMap, process.steps]);

  const stepItems = useMemo(() => {
    return getTransactionProcessSteps(process.steps, process.combineInfo, false);
  }, [getTransactionProcessSteps, process.steps, process.combineInfo]);

  return (
    <div className={CN(className)}>
      <CommonTransactionInfo
        address={transaction.address}
        network={transaction.chain}
      />
      <MetaInfo
        className={'meta-info'}
        hasBackgroundWrapper
      >
        <MetaInfo.Number
          decimals={inputTokenDecimals}
          label={t('ui.TRANSACTION.Confirmations.Process.Earn.JoinYieldPool.amount')}
          suffix={inputTokenSymbol}
          value={txParams.amount}
        />

        {!!derivativeTokenBasicInfo && (
          <MetaInfo.Number
            decimals={derivativeTokenBasicInfo.decimals}
            label={t('ui.TRANSACTION.Confirmations.Process.Earn.JoinYieldPool.estimatedReceivables')}
            suffix={derivativeTokenBasicInfo.symbol}
            value={estimatedReceivables.toString()}
          />
        )}

        <MetaInfo.Number
          decimals={0}
          label={t('ui.TRANSACTION.Confirmations.Process.Earn.JoinYieldPool.estimatedFee')}
          prefix={(currencyData?.isPrefix && currencyData.symbol) || ''}
          suffix={(!currencyData?.isPrefix && currencyData?.symbol) || ''}
          value={estimatedFee || 0}
        />

        <MetaInfo.TransactionProcess
          items={stepItems}
          type={process.type}
        />
      </MetaInfo>
    </div>
  );
};

const YieldProcessConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});

export default YieldProcessConfirmation;
