// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _getAssetOriginChain, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { SwapTxData } from '@subwallet/extension-base/types/swap';
import { AlertBox, MetaInfo } from '@subwallet/extension-web-ui/components';
import SwapRoute from '@subwallet/extension-web-ui/components/Swap/SwapRoute';
import { BN_TEN } from '@subwallet/extension-web-ui/constants';
import { useGetAccountByAddress, useGetChainPrefixBySlug, useSelector } from '@subwallet/extension-web-ui/hooks';
import { Icon, Logo, Number } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { ArrowRight } from 'phosphor-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

function getSymbol (assetInfo?: _ChainAsset) {
  return assetInfo ? _getAssetSymbol(assetInfo) : '';
}

function getOriginChain (assetInfo?: _ChainAsset) {
  return assetInfo ? _getAssetOriginChain(assetInfo) : '';
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, transaction } = props;
  const assetRegistryMap = useSelector((state) => state.assetRegistry.assetRegistry);
  const [isShowAlert, setIsShowAlert] = useState<boolean>(false);
  const { t } = useTranslation();
  // @ts-ignore
  const data = transaction.data as SwapTxData;

  const account = useGetAccountByAddress(data.recipient);
  const networkPrefix = useGetChainPrefixBySlug(transaction.chain);

  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[data.quote.pair.to] || undefined;
  }, [assetRegistryMap, data.quote.pair.to]);
  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[data.quote.pair.from] || undefined;
  }, [assetRegistryMap, data.quote.pair.from]);

  const destinationValue = new BigN(data.quote.fromAmount).div(BN_TEN.pow(transaction.estimateFee?.decimals || 0)).multipliedBy(data.quote.rate).multipliedBy(1 - data.slippage);

  const renderRateConfirmInfo = () => {
    return (
      <div className={'__quote-estimate-swap-confirm-value'}>
        <Number
          decimal={0}
          suffix={transaction.estimateFee?.symbol}
          value={1}
        />
        <span>&nbsp;~&nbsp;</span>
        <Number
          decimal={0}
          suffix={getSymbol(toAssetInfo)}
          value={data.quote.rate}
        />
      </div>
    );
  };

  useEffect(() => {
    let timer: NodeJS.Timer;

    if (data.quote.aliveUntil) {
      timer = setInterval(() => {
        if (Date.now() > data.quote.aliveUntil) {
          setIsShowAlert(true);
          clearInterval(timer);
        }
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [data.quote.aliveUntil]);

  return (
    <div className={CN(className, 'swap-confirmation-container')}>
      <div className={'__summary-quote'}>
        <div className={'__summary-from'}>
          <Logo
            className='token-logo'
            isShowSubLogo={true}
            shape='circle'
            size={24}
            subNetwork={getOriginChain(fromAssetInfo)}
            token={data.quote.pair.from.toLowerCase()}
          />
          <Number
            className={'__amount-destination'}
            decimal={transaction.estimateFee?.decimals || 0}
            suffix={getSymbol(fromAssetInfo)}
            value={data.quote.fromAmount}
          />
          <span className={'__quote-footer-label'}>Swap</span>
        </div>
        <Icon
          className={'middle-icon'}
          phosphorIcon={ArrowRight}
          size={'md'}
        />
        <div className={'__summary-to'}>
          <Logo
            className='token-logo'
            isShowSubLogo={true}
            shape='circle'
            size={24}
            subNetwork={getOriginChain(toAssetInfo)}
            token={data.quote.pair.to.toLowerCase()}
          />
          <Number
            className={'__amount-destination'}
            decimal={0}
            suffix={getSymbol(toAssetInfo)}
            value={destinationValue}
          />
          <span className={'__quote-footer-label'}>Min receive</span>
        </div>
      </div>
      <MetaInfo
        className={CN(className)}
        hasBackgroundWrapper={false}
      >
        <MetaInfo.Account
          address={data.recipient || ''}
          className={'__recipient-item'}
          label={t('Recipient')}
          name={account?.name}
          networkPrefix={networkPrefix}
        />
        <MetaInfo.Default
          className={'__quote-rate-confirm'}
          label={t('Quote rate')}
          valueColorSchema={'gray'}
        >
          {renderRateConfirmInfo()}
        </MetaInfo.Default>
        <MetaInfo.Number
          className={'__estimate-transaction-fee'}
          decimals={transaction.estimateFee?.decimals}
          label={'Estimated transaction fee'}
          prefix={'$'}
          value={transaction.estimateFee?.value || 0}
        />
        <MetaInfo.Default
          className={'-d-column'}
          label={t('Swap route')}
        >
        </MetaInfo.Default>
        <SwapRoute swapRoute={data.quote.route} />
        {isShowAlert &&
          (
            <AlertBox
              className={'__swap-quote-expired'}
              description={t('The swap quote has expired.')}
              title={t('Swap Quote Expired')}
              type='warning'
            />)
        }

      </MetaInfo>
    </div>
  );
};

const SwapTransactionConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__quote-estimate-swap-confirm-value': {
      display: 'flex'
    },
    '&.swap-confirmation-container': {
      marginTop: 10
    },
    '.__summary-quote': {
      display: 'flex',
      justifyContent: 'space-between',
      backgroundColor: token.colorBgSecondary,
      gap: 12,
      paddingLeft: 12,
      paddingRight: 12,
      paddingTop: 16,
      paddingBottom: 16,
      borderRadius: 8,
      marginBottom: 20
    },
    '.__summary-to, .__summary-from': {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      flex: 1
    },
    '.__swap-quote-expired': {
      marginBottom: 20,
      marginTop: -8
    },
    '.__quote-footer-label': {
      color: token.colorTextTertiary,
      fontSize: 12,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeightSM
    },
    '.__amount-destination': {
      color: token.colorTextLight2,
      fontSize: token.fontSizeLG,
      fontWeight: token.fontWeightStrong,
      lineHeight: token.lineHeightLG
    },
    '.__recipient-item .__label': {
      fontSize: 14,
      color: token.colorTextTertiary,
      fontWeight: token.fontWeightStrong,
      lineHeight: token.lineHeight
    },
    '.__recipient-item .__account-name': {
      fontSize: 14,
      color: token.colorWhite,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },
    '.__quote-rate-confirm .__value': {
      fontSize: 14,
      color: token.colorWhite,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },
    '.__estimate-transaction-fee .__value': {
      fontSize: 14,
      color: token.colorWhite,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },
    '.__quote-rate-confirm.__quote-rate-confirm, .__estimate-transaction-fee.__estimate-transaction-fee, .-d-column.-d-column': {
      marginTop: 12
    },
    '&.swap-confirmation-container .__swap-route-container': {
      marginBottom: 20
    },
    '.__quote-rate-confirm .__label': {
      fontSize: 14,
      color: token.colorTextTertiary,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },
    '.__estimate-transaction-fee .__label': {
      fontSize: 14,
      color: token.colorTextTertiary,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },
    '.-d-column .__label': {
      fontSize: 14,
      color: token.colorTextTertiary,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    }
  };
});

export default SwapTransactionConfirmation;