// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetDecimals, _getAssetPriceId, _getAssetSymbol, _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
import { BN_ZERO } from '@subwallet/extension-base/utils';
import { NumberDisplay } from '@subwallet/extension-koni-ui/components';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useGetGovLockedInfos, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { getConvertedBalanceValue } from '@subwallet/extension-koni-ui/hooks/screen/home/useAccountBalance';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import { BigNumber } from 'bignumber.js';
import { CaretLeft } from 'phosphor-react';
import React, { Context, useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { ThemeContext } from 'styled-components';

import { ViewBaseType } from '../../types';
import { LockedAccountInfoPart } from './LockedAccountInfoPart';

type Props = ThemeProps & ViewBaseType & {
  goOverview: VoidFunction;
};

const Component = ({ chainSlug, className, goOverview }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const onBack = useCallback(() => {
    goOverview();
  }, [goOverview]);
  const govLockedInfos = useGetGovLockedInfos(chainSlug);
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const assetRegistry = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const { currencyData, priceMap } = useSelector((state: RootState) => state.price);
  const { uiState: { setShowTabBar } } = useContext(HomeContext);
  const assetInfo = useMemo(() => {
    const assetSlug = _getChainNativeTokenSlug(chainInfoMap[chainSlug]);

    return assetRegistry[assetSlug];
  }, [assetRegistry, chainInfoMap, chainSlug]);

  const decimals = _getAssetDecimals(assetInfo);
  const symbol = _getAssetSymbol(assetInfo);

  const totalLocked = useMemo(() => {
    return govLockedInfos.reduce<BigNumber>((total, { summary: { totalLocked } }) => {
      return total.plus(totalLocked);
    }, BN_ZERO);
  }, [govLockedInfos]);

  const totalLockedConverted = useMemo(() => {
    const priceId = _getAssetPriceId(assetInfo);

    return getConvertedBalanceValue(totalLocked.shiftedBy(-decimals), priceMap[priceId] || 0);
  }, [assetInfo, decimals, priceMap, totalLocked]);

  useEffect(() => {
    setShowTabBar(false);

    return () => {
      setShowTabBar(true);
    };
  }, [setShowTabBar]);

  return (
    <div className={className}>
      <div className='__top-part'>
        <Button
          className={'__back-button'}
          icon={
            <Icon
              customSize={'24px'}
              phosphorIcon={CaretLeft}
            />
          }
          onClick={onBack}
          size={'xs'}
          type={'ghost'}
        />
        <div className={'__top-part-title'}>{t('Locked detail')}</div>
      </div>

      <div className='__middle-part'>
        <div className={'__total-locked-container'}>
          <div className={'__total-locked-label'}>
            {t('Total locked')}
          </div>
          <NumberDisplay
            className={'__total-locked-value'}
            decimal={decimals}
            decimalColor={token.colorTextLight1}
            intColor={token.colorTextLight1}
            size={30}
            suffix={symbol}
            unitColor={token.colorTextLight1}
            value={totalLocked}
            weight={600}
          />

          <NumberDisplay
            decimal={0}
            decimalOpacity={0.45}
            intOpacity={0.45}
            prefix={(currencyData?.isPrefix && currencyData.symbol) || ''}
            size={16}
            suffix={(!currencyData?.isPrefix && currencyData?.symbol) || ''}
            unitOpacity={0.45}
            value={totalLockedConverted}
            weight={500}
          />
        </div>

        <LockedAccountInfoPart
          chain={chainSlug}
          govLockedInfos={govLockedInfos}
        />
      </div>
    </div>
  );
};

export const UnlockTokenView = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    paddingBottom: 20,

    '.__top-part': {
      display: 'flex',
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      marginBottom: token.marginXXS,
      alignItems: 'center'
    },

    '.__top-part-title': {
      textAlign: 'center',
      flex: 1,
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      marginRight: 40
    },

    '.__back-button': {
      color: token.colorTextLight1,

      '&:hover': {
        color: token.colorTextLight3
      },

      '&:active': {
        color: token.colorTextLight4
      }
    },

    '.__middle-part': {
      paddingInline: token.padding
    },

    '.__total-locked-container': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: token.marginMD,
      backgroundColor: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      gap: token.sizeXS,
      padding: token.padding,
      paddingTop: token.paddingSM
    },

    '.__total-locked-label': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      fontWeight: token.bodyFontWeight,
      color: token.colorTextLight4
    },

    '.__total-locked-value': {
      '.ant-number-suffix': {
        fontSize: `${token.fontSizeHeading3}px !important`,
        lineHeight: `${token.lineHeightHeading3} !important`,
        color: `${token.colorTextLight3} !important`
      }
    }
  };
});
