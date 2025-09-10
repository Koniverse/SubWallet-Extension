// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { SubmitYieldStepData, SummaryEarningProcessData } from '@subwallet/extension-base/types';
import { CommonTransactionInfo, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { useGetTransactionProcessSteps, useSelector } from '@subwallet/extension-koni-ui/hooks';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseProcessConfirmationProps } from '../Base';

type Props = BaseProcessConfirmationProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className, process } = props;
  const { t } = useTranslation();

  const combinedInfo = useMemo(() => process.combineInfo as SummaryEarningProcessData, [process.combineInfo]);
  const chain = useMemo(() => combinedInfo.brief.chain, [combinedInfo.brief.chain]);
  const txParams = useMemo(() => combinedInfo.data as unknown as SubmitYieldStepData, [combinedInfo]);

  const { assetRegistry: tokenInfoMap } = useSelector((state) => state.assetRegistry);

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

  const { feeTokenDecimals, feeTokenSymbol } = useMemo(() => {
    const feeTokenInfo = tokenInfoMap[txParams.feeTokenSlug];

    return {
      feeTokenSymbol: _getAssetSymbol(feeTokenInfo),
      feeTokenDecimals: _getAssetDecimals(feeTokenInfo)
    };
  }, [txParams.feeTokenSlug, tokenInfoMap]);

  const estimatedReceivables = useMemo(() => {
    return Math.floor(parseInt(txParams.amount) / txParams.exchangeRate);
  }, [txParams.amount, txParams.exchangeRate]);

  const getTransactionProcessSteps = useGetTransactionProcessSteps();

  const stepItems = useMemo(() => {
    return getTransactionProcessSteps(process.steps, process.combineInfo, false);
  }, [getTransactionProcessSteps, process.steps, process.combineInfo]);

  return (
    <div className={CN(className)}>
      <CommonTransactionInfo
        address={process.address}
        network={chain}
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

        {
          /**
           * TODO: Convert value from steps' fee
           * */
        }
        <MetaInfo.Number
          decimals={feeTokenDecimals}
          label={t('ui.TRANSACTION.Confirmations.Process.Earn.JoinYieldPool.estimatedFee')}
          suffix={feeTokenSymbol}
          value={0}
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
