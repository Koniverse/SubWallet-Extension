// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { balanceNoPrefixFormater, formatNumber } from '@subwallet/extension-base/utils';
import { NumberDisplay } from '@subwallet/extension-web-ui/components';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { useTranslation } from '@subwallet/extension-web-ui/hooks';
import { saveShowBalance } from '@subwallet/extension-web-ui/messaging';
import { PriceChartArea } from '@subwallet/extension-web-ui/Popup/Home/Tokens/PriceChartArea';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Button, Icon, Tooltip } from '@subwallet/react-ui';
import { SwNumberProps } from '@subwallet/react-ui/es/number';
import CN from 'classnames';
import { ArrowsLeftRight, CaretLeft, CopySimple, PaperPlaneTilt, ShoppingCartSimple } from 'phosphor-react';
import React, { useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { ActionButtonsContainer } from './ActionButtonsContainer';

type Props = ThemeProps & {
  balanceValue: SwNumberProps['value'];
  priceId?: string;
  symbol: string;
  isSupportBuyTokens: boolean;
  isSupportSwap: boolean;
  isShrink: boolean;
  isChartSupported?: boolean;
  onClickBack: () => void;
  onOpenSendFund: () => void;
  onOpenBuyTokens: () => void;
  onOpenReceive: () => void;
  onOpenSwap: () => void;
};

function Component (
  { balanceValue,
    className = '',
    isChartSupported,
    isShrink,
    isSupportBuyTokens,
    isSupportSwap,
    onClickBack,
    onOpenBuyTokens,
    onOpenReceive,
    onOpenSendFund,
    onOpenSwap,
    priceId,
    symbol }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { isShowBalance } = useSelector((state: RootState) => state.settings);
  const { isWebUI } = useContext(ScreenContext);
  const { currencyData } = useSelector((state: RootState) => state.price);
  const onChangeShowBalance = useCallback(() => {
    saveShowBalance(!isShowBalance).catch(console.error);
  }, [isShowBalance]);

  return (
    <div className={`tokens-upper-block ${className} ${isShrink ? '-shrink' : ''}`}>
      <div className='__top-part'>
        <Button
          className={'__back-button'}
          icon={
            <Icon
              customSize={'24px'}
              phosphorIcon={CaretLeft}
            />
          }
          onClick={onClickBack}
          size={'xs'}
          type={'ghost'}
        />
        <div className={'__token-display'}>{t('Token')}: {symbol}</div>
      </div>

      <div className='__middle-part'>
        <PriceChartArea
          className={'__price-chart-area'}
          isChartSupported={isChartSupported}
          priceId={priceId}
        />
      </div>

      <div className='__bottom-part'>
        <ActionButtonsContainer className={'__action-buttons-container'}>
          <Button
            icon={(
              <Icon
                phosphorIcon={CopySimple}
                size={isShrink ? 'sm' : 'md'}
                weight={'duotone'}
              />
            )}
            onClick={onOpenReceive}
            shape='squircle'
            size={isShrink ? 'xs' : 'sm'}
            tooltip={isWebUI ? t('Get address') : undefined}
          />
          <div className={'__button-space'} />
          <Button
            icon={(
              <Icon
                phosphorIcon={PaperPlaneTilt}
                size={isShrink ? 'sm' : 'md'}
                weight={'duotone'}
              />
            )}
            onClick={onOpenSendFund}
            shape='squircle'
            size={isShrink ? 'xs' : 'sm'}
            tooltip={isWebUI ? t('Send tokens') : undefined}
          />
          <div className={'__button-space hidden'} />
          <Button
            className={CN({ hidden: true })} // not support swap on mobile yet
            disabled={!isSupportSwap}
            icon={(
              <Icon
                phosphorIcon={ArrowsLeftRight}
                size={isShrink ? 'sm' : 'md'}
                weight={'duotone'}
              />
            )}
            onClick={onOpenSwap}
            shape='squircle'
            size={isShrink ? 'xs' : 'sm'}
            tooltip={isWebUI ? t('Swap') : undefined}
          />
          <div className={CN('__button-space', { hidden: isShrink })} />
          <Button
            className={CN({ hidden: isShrink })}
            disabled={!isSupportBuyTokens}
            icon={(
              <Icon
                phosphorIcon={ShoppingCartSimple}
                size={isShrink ? 'sm' : 'md'}
                weight={'duotone'}
              />
            )}
            onClick={onOpenBuyTokens}
            shape='squircle'
            size={isShrink ? 'xs' : 'sm'}
            tooltip={isWebUI ? t('Buy token') : undefined}
          />
        </ActionButtonsContainer>

        <div className={'__your-balance-container'}>
          <div className='__your-balance-label'>
            {t('Your balance')}
          </div>

          <Tooltip
            overlayClassName={CN('__currency-value-detail-tooltip', {
              'ant-tooltip-hidden': !isShowBalance
            })}
            placement={'top'}
            title={currencyData.symbol + ' ' + formatNumber(balanceValue, 0, balanceNoPrefixFormater)}
          >
            <div
              className='__balance-value-wrapper'
              onClick={onChangeShowBalance}
            >
              <NumberDisplay
                className={'__balance-value'}
                decimal={0}
                decimalOpacity={0.45}
                hide={!isShowBalance}
                prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
                size={isShrink ? 38 : 20}
                subFloatNumber={isShrink}
                suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                value={balanceValue}
              />
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export const DetailUpperBlock = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
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

    '.__token-display': {
      textAlign: 'center',
      flex: 1,
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      marginRight: 40
    },

    '.ant-btn': {
      transition: 'width, height, padding 0s'
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

    '.__action-buttons-container': {
      display: 'flex',
      justifyContent: 'center',
      padding: '24px 8px'
    },

    '.__button-space': {
      width: 36
    },

    '.__your-balance-container': {
      display: 'flex',
      justifyContent: 'space-between',
      'white-space': 'nowrap',
      paddingLeft: token.padding,
      paddingRight: token.padding,
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4
    },

    '.__your-balance-label': {
      flexShrink: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },

    '.__balance-value-wrapper': {
      cursor: 'pointer',
      width: 'fit-content'
    },

    '.__balance-value': {
      lineHeight: 'inherit',
      fontWeight: 'inherit',
      fontSize: 'inherit',
      overflow: 'hidden'
    },

    '&:not(.-shrink)': {
      '.__balance-value': {
        '.ant-typography': {
          lineHeight: 'inherit !important',
          fontWeight: 'inherit !important',
          color: 'inherit !important'
        }
      }
    },

    '&.-shrink': {
      '.__top-part': {
        marginBottom: token.marginSM
      },

      '.__middle-part, .__your-balance-label': {
        display: 'none'
      },

      '.__bottom-part': {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: token.paddingXS,
        paddingRight: token.paddingXS
      },

      '.__your-balance-container': {
        flex: 1,
        paddingRight: 0,
        order: -1
      },

      '.__balance-value-wrapper': {
        display: 'block',
        margin: 0,
        cursor: 'pointer',
        width: 'fit-content'
      },

      '.__balance-value': {
        textAlign: 'left',
        lineHeight: token.lineHeightHeading2,
        fontSize: token.fontSizeHeading2,
        cursor: 'pointer',
        width: 'fit-content',

        '.ant-number-integer, .ant-number-decimal, .ant-number-hide-content': {
          fontSize: 'inherit !important',
          lineHeight: 'inherit !important',
          fontWeight: 'inherit !important'
        },

        '.ant-number-prefix': {
          fontSize: `${token.fontSizeHeading5}px !important`,
          lineHeight: `${token.lineHeightHeading5} !important`,
          verticalAlign: 'super',
          marginRight: token.marginXXS
        }
      },

      '.__action-buttons-container': {
        paddingTop: 0,
        paddingBottom: 0
      },

      '.__button-space': {
        width: token.sizeXS
      }
    }

  });
});
