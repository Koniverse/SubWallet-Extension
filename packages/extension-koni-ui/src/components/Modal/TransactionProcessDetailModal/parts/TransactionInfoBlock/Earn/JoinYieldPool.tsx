// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { CommonFeeComponent, SubmitYieldStepData, SummaryEarningProcessData } from '@subwallet/extension-base/types';
import { CommonTransactionInfo, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { getCurrentCurrencyTotalFee } from '@subwallet/extension-koni-ui/utils';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { TransactionInfoBlockProps } from '../types';

type Props = TransactionInfoBlockProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className, processData } = props;
  const { t } = useTranslation();

  const combineInfo = useMemo(() => (processData.combineInfo as SummaryEarningProcessData), [processData.combineInfo]);
  const txParams = useMemo(() => (combineInfo.data as unknown as SubmitYieldStepData), [combineInfo.data]);

  const assetRegistryMap = useSelector((state) => state.assetRegistry.assetRegistry);
  const { currencyData, priceMap } = useSelector((state) => state.price);

  const { inputTokenDecimals, inputTokenSymbol } = useMemo(() => {
    const inputTokenInfo = assetRegistryMap[txParams.inputTokenSlug];

    return {
      inputTokenSymbol: _getAssetSymbol(inputTokenInfo),
      inputTokenDecimals: _getAssetDecimals(inputTokenInfo)
    };
  }, [assetRegistryMap, txParams.inputTokenSlug]);

  const derivativeTokenBasicInfo = useMemo(() => {
    if (!txParams.derivativeTokenSlug) {
      return;
    }

    const derivativeTokenInfo = assetRegistryMap[txParams.derivativeTokenSlug];

    return {
      symbol: _getAssetSymbol(derivativeTokenInfo),
      decimals: _getAssetDecimals(derivativeTokenInfo)
    };
  }, [txParams.derivativeTokenSlug, assetRegistryMap]);

  const estimatedReceivables = useMemo(() => {
    return Math.floor(parseInt(txParams.amount) / txParams.exchangeRate);
  }, [txParams.amount, txParams.exchangeRate]);

  const estimatedFeeValue = useMemo(() => {
    const feeComponents: CommonFeeComponent[] = processData.steps.reduce((previousValue, currentStep) => {
      return [
        ...previousValue,
        ...currentStep.fee.feeComponent
      ];
    }, [] as CommonFeeComponent[]);

    return getCurrentCurrencyTotalFee(feeComponents, assetRegistryMap, priceMap);
  }, [assetRegistryMap, priceMap, processData.steps]);

  return (
    <div className={CN(className)}>
      <MetaInfo
        className={'__meta-info-wrapper'}
        hasBackgroundWrapper
        spaceSize={'xs'}
      >
        <CommonTransactionInfo
          address={txParams.address}
          network={combineInfo.brief.chain}
          onlyReturnInnerContent
        />

        <MetaInfo.Number
          decimals={inputTokenDecimals}
          label={t('Amount')}
          suffix={inputTokenSymbol}
          value={txParams.amount}
        />

        {!!derivativeTokenBasicInfo && (
          <MetaInfo.Number
            decimals={derivativeTokenBasicInfo.decimals}
            label={t('Estimated receivables')}
            suffix={derivativeTokenBasicInfo.symbol}
            value={estimatedReceivables.toString()}
          />
        )}

        <MetaInfo.Number
          decimals={0}
          label={'Estimated fee'}
          prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
          suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
          value={estimatedFeeValue}
        />
      </MetaInfo>
    </div>
  );
};

export const YieldProcessConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__meta-info-wrapper.__meta-info-wrapper': {
      paddingTop: token.padding,
      paddingBottom: token.padding
    }
  };
});
