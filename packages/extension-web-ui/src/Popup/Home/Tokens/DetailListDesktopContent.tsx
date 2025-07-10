// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { balanceNoPrefixFormater, formatNumber } from '@subwallet/extension-base/utils';
import { NumberDisplay, TokenBalance, TokenItem } from '@subwallet/extension-web-ui/components';
import NoContent, { PAGE_TYPE } from '@subwallet/extension-web-ui/components/NoContent';
import { useSelector } from '@subwallet/extension-web-ui/hooks';
import { PriceChartAreaDesktop } from '@subwallet/extension-web-ui/Popup/Home/Tokens/PriceChartAreaDesktop';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { TokenBalanceItemType } from '@subwallet/extension-web-ui/types/balance';
import { SwNumberProps, Tooltip } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import DetailTable from './DetailTable';

type Props = ThemeProps & {
  onClickItem: (item: TokenBalanceItemType) => () => void;
  priceId: string | undefined;
  tokenGroupSlug: string | undefined;
  isChartSupported: boolean;
  tokenBalanceItems: TokenBalanceItemType[];
  tokenBalanceValue: SwNumberProps['value'];
};

function Component ({ className = '',
  isChartSupported,
  onClickItem, priceId,
  tokenBalanceItems, tokenBalanceValue,
  tokenGroupSlug }: Props): React.ReactElement {
  const { t } = useTranslation();
  const currencyData = useSelector((state: RootState) => state.price.currencyData);
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);

  const onClickRow = useCallback((item: TokenBalanceItemType) => {
    return onClickItem(item)();
  }, [onClickItem]);

  return (
    <div
      className={className}
    >
      <PriceChartAreaDesktop
        className={'__price-chart-area'}
        isChartSupported={isChartSupported}
        priceId={priceId}
      />

      <div className={'__token-balance-area'}>
        <div className={'__your-balance-container'}>
          <div className='__your-balance-label'>
            {t('Your balance')}
          </div>

          <Tooltip
            overlayClassName={CN('__currency-value-detail-tooltip', {
              'ant-tooltip-hidden': !isShowBalance
            })}
            placement={'top'}
            title={currencyData.symbol + ' ' + formatNumber(tokenBalanceValue, 0, balanceNoPrefixFormater)}
          >
            <div
              className='__balance-value-wrapper'
            >
              <NumberDisplay
                className={'__balance-value'}
                decimal={0}
                hide={!isShowBalance}
                prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
                size={20}
                suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                value={tokenBalanceValue}
              />
            </div>
          </Tooltip>
        </div>

        {!tokenBalanceItems.length
          ? (
            <NoContent pageType={PAGE_TYPE.TOKEN} />
          )
          : (
            <DetailTable
              className={'__table'}
              columns={[
                {
                  title: 'Token name',
                  dataIndex: 'name',
                  key: 'name',
                  render: (_, row) => {
                    return (
                      <TokenItem
                        chain={row.chain}
                        logoKey={row.logoKey}
                        slug={row.slug}
                        subTitle={row.chainDisplayName?.replace(' Relay Chain', '') || ''}
                        symbol={row.symbol}
                        tokenGroupSlug={tokenGroupSlug}
                      />
                    );
                  }
                },
                {
                  title: 'Transferable',
                  dataIndex: 'percentage',
                  key: 'percentage',
                  render: (_, row) => {
                    return (
                      <TokenBalance
                        convertedValue={row.free.convertedValue}
                        symbol={row.symbol}
                        value={row.free.value}
                      />
                    );
                  }
                },
                {
                  title: 'Locked',
                  dataIndex: 'price',
                  key: 'price',
                  render: (_, row) => {
                    return (
                      <TokenBalance
                        convertedValue={row.locked.convertedValue}
                        symbol={row.symbol}
                        value={row.locked.value}
                      />
                    );
                  }
                },
                {
                  title: 'Balance',
                  dataIndex: 'balance',
                  key: 'balance',
                  render: (_, row) => {
                    return (
                      <TokenBalance
                        convertedValue={row.total.convertedValue}
                        symbol={row.symbol}
                        value={row.total.value}
                      />
                    );
                  }
                }
              ]}
              dataSource={tokenBalanceItems}
              onClick={onClickRow}
            />
          )
        }
      </div>
    </div>
  );
}

export const DetailListDesktopContent = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return ({
    display: 'flex',
    gap: 20,
    alignItems: 'flex-start',

    '.__price-chart-area': {
      maxWidth: 480,
      flex: 1,
    },

    '.__token-balance-area': {
      minHeight: 430,
      borderRadius: 12,
      flex: 1,
      paddingInline: 36,
      paddingBlock: 24,
      backgroundColor: token.colorBgSecondary
    },

    '.__your-balance-container': {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 24
    },

    '.__your-balance-label': {
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      fontWeight: token.headingFontWeight,
      color: token.colorTextLight1
    },

    '.__table': {
      flex: 1,

      table: {

      },

      td: {
        backgroundColor: 'transparent !important'
      },

      '.ant-table-row': {
        cursor: 'pointer'
      },

      '.ant-table-cell.ant-table-cell.ant-table-cell': {
        '&:first-child': {
          paddingLeft: 0
        },

        '&:last-child': {
          paddingRight: 0
        }
      }
    },

    '@media (max-width: 1599px)': {
      display: 'block',

      '.__price-chart-area': {
        marginBottom: 20,
        maxWidth: 'none'
      }
    }
  });
});
