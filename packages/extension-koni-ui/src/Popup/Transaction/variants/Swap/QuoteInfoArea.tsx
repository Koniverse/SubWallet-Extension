// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { SwapProviderId, SwapQuote } from '@subwallet/extension-base/types';
import { swapCustomFormatter } from '@subwallet/extension-base/utils';
import { MetaInfo, TransactionProcessPreview } from '@subwallet/extension-koni-ui/components';
import { QuoteResetTime } from '@subwallet/extension-koni-ui/components/Swap';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertHexColorToRGBA } from '@subwallet/extension-koni-ui/utils';
import { ActivityIndicator, Icon, Number, Tooltip } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { CaretRight, Info, ListBullets, PencilSimpleLine, XCircle } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  currentQuote: SwapQuote | undefined
  isFormInvalid: boolean;
  estimatedFeeValue: BigN;
  handleRequestLoading: boolean;
  quoteAliveUntil: number | undefined;
  fromAssetInfo: _ChainAsset |undefined;
  toAssetInfo: _ChainAsset |undefined;
  swapError: SwapError|undefined;
  openSwapQuotesModal: VoidFunction;
  slippage: number;
  openSlippageModal: VoidFunction;
};

const numberMetadata = { maxNumberFormat: 8 };

const Component: React.FC<Props> = (props: Props) => {
  const { className, currentQuote, estimatedFeeValue, fromAssetInfo,
    handleRequestLoading, isFormInvalid, openSlippageModal,
    openSwapQuotesModal, quoteAliveUntil, slippage, swapError,
    toAssetInfo } = props;
  const { t } = useTranslation();
  const currencyData = useSelector((state) => state.price.currencyData);

  const renderRateInfo = () => {
    if (!currentQuote) {
      return null;
    }

    return (
      <div className={'__quote-estimate-swap-value'}>
        <Number
          decimal={0}
          suffix={_getAssetSymbol(fromAssetInfo)}
          unitOpacity={0.45}
          value={1}
        />
        <span>&nbsp;~&nbsp;</span>
        <Number
          customFormatter={swapCustomFormatter}
          decimal={0}
          formatType={'custom'}
          metadata={numberMetadata}
          suffix={_getAssetSymbol(toAssetInfo)}
          unitOpacity={0.45}
          value={currentQuote.rate}
        />
      </div>
    );
  };

  const _renderRateInfo = () => {
    return (
      <div
        className={'__quote-selector-trigger'}
        onClick={openSwapQuotesModal}
      >
        {renderRateInfo()}

        <div className='__best-tag'>
          {t('Best')}
        </div>

        <Icon
          className={'__caret-icon'}
          customSize={'16px'}
          phosphorIcon={CaretRight}
          size='sm'
        />
      </div>
    );
  };

  const renderQuoteEmptyBlock = () => {
    const isError = !!swapError || isFormInvalid;
    let message = '';
    const _loading = handleRequestLoading && !isFormInvalid;

    if (isFormInvalid) {
      message = t('Invalid input. Re-enter information in the red field and try again');
    } else if (handleRequestLoading) {
      message = t('Loading...');
    } else {
      message = swapError ? swapError?.message : t('No swap quote found. Adjust your amount or try again later.');
    }

    return (
      <div className={CN('__quote-empty-block')}>
        <div className='__quote-empty-icon-wrapper'>
          <div className={CN('__quote-empty-icon', {
            '-error': isError && !_loading
          })}
          >
            {
              _loading
                ? (
                  <ActivityIndicator size={32} />
                )
                : (
                  <Icon
                    customSize={'36px'}
                    phosphorIcon={isError ? XCircle : ListBullets}
                    weight={isError ? 'fill' : undefined}
                  />
                )
            }
          </div>
        </div>

        <div className={CN('__quote-empty-message', {
          '-loading': _loading
        })}
        >{message}</div>
      </div>
    );
  };

  const notSupportSlippageSelection = useMemo(() => {
    const unsupportedProviders = [
      SwapProviderId.CHAIN_FLIP_TESTNET,
      SwapProviderId.CHAIN_FLIP_MAINNET,
      SwapProviderId.SIMPLE_SWAP
    ];

    return currentQuote?.provider.id ? unsupportedProviders.includes(currentQuote.provider.id) : false;
  }, [currentQuote?.provider.id]);

  const onOpenSlippageModal = useCallback(() => {
    if (!notSupportSlippageSelection) {
      openSlippageModal();
    }
  }, [notSupportSlippageSelection, openSlippageModal]);

  const isSimpleSwapSlippage = currentQuote?.provider.id === SwapProviderId.SIMPLE_SWAP;

  const renderSlippageInfoContent = () => {
    const slippageTitle = isSimpleSwapSlippage ? 'Slippage can be up to 5% due to market conditions' : '';
    const slippageContent = isSimpleSwapSlippage ? `Up to ${((slippage * 100).toString()).toString()}%` : `${((slippage * 100).toString()).toString()}%`;

    return (
      <>
        <div
          className={CN('__slippage-action', {
            '-clickable': slippageTitle || !notSupportSlippageSelection
          })}
          onClick={onOpenSlippageModal}
        >
          <Tooltip
            open={slippageTitle ? undefined : false}
            placement={'topRight'}
            title={slippageTitle}
          >
            {
              !!slippageTitle && (
                <Icon
                  customSize='16px'
                  phosphorIcon={Info}
                  size='sm'
                  weight='fill'
                />
              )
            }

            <span>{slippageContent}</span>
          </Tooltip>

          {!notSupportSlippageSelection && (
            <div className='__slippage-editor-button'>
              <Icon
                className='__slippage-editor-button-icon'
                customSize={'16px'}
                phosphorIcon={PencilSimpleLine}
              />
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <div className={className}>
        {
          !!currentQuote && !isFormInvalid && (
            <MetaInfo
              className={'__quote-info-block'}
              hasBackgroundWrapper={true}
              labelColorScheme={'gray'}
              labelFontWeight={'regular'}
              spaceSize={'xs'}
              valueColorScheme={'light'}
            >
              <MetaInfo.Default
                className={'__quote-rate-info'}
                label={(
                  <>
                    {t('Quote rate')}

                    <QuoteResetTime
                      className={'__reset-time'}
                      quoteAliveUntilValue = {quoteAliveUntil}
                    />
                  </>
                )}
              >
                {
                  _renderRateInfo()
                }
              </MetaInfo.Default>

              <MetaInfo.Default
                className={'__swap-process-info'}
                label={t('Process')}
              >
                <div className={'__swap-process-modal-trigger'}>
                  <TransactionProcessPreview />

                  <Icon
                    className={'__caret-icon'}
                    customSize={'16px'}
                    phosphorIcon={CaretRight}
                    size='sm'
                  />
                </div>
              </MetaInfo.Default>

              <MetaInfo.Default
                label={t('Estimated fee')}
              >
                <Number
                  decimal={0}
                  prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
                  suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                  value={estimatedFeeValue}
                />
              </MetaInfo.Default>

              <MetaInfo.Default
                className={'__slippage-info'}
                label={t('Slippage')}
              >
                {renderSlippageInfoContent()}
              </MetaInfo.Default>
            </MetaInfo>
          )
        }

        {
          (!currentQuote || handleRequestLoading || isFormInvalid) && renderQuoteEmptyBlock()
        }
      </div>
    </>
  );
};

export const QuoteInfoArea = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__quote-info-block': {
      padding: '12px 16px',

      '.__label-col': {
        flex: '0 1 auto'
      },

      '.__label, .__value': {
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM
      }
    },

    '.__reset-time': {

    },

    '.__reset-time-icon': {
      marginLeft: token.marginXXS,
      marginRight: token.marginXXS
    },

    '.__reset-time-text': {
      fontSize: 10,
      lineHeight: '18px',
      fontWeight: token.headingFontWeight
    },

    '.__best-tag': {
      backgroundColor: convertHexColorToRGBA(token.colorSuccess, 0.1),
      fontSize: 10,
      lineHeight: '20px',
      borderRadius: token.borderRadiusLG,
      color: token.colorSuccess,
      fontWeight: token.headingFontWeight,
      paddingLeft: 6,
      paddingRight: 6
    },

    '.__item-rewards-value, .__item-total-staked-value': {
      '.ant-number, .ant-typography': {
        color: 'inherit !important',
        fontSize: 'inherit !important',
        fontWeight: 'inherit !important',
        lineHeight: 'inherit'
      }
    },

    '.__swap-process-modal-trigger': {
      display: 'flex',
      gap: token.sizeXXS
    },

    '.__slippage-action': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXXS
    },

    '.__slippage-action.-clickable': {
      cursor: 'pointer'
    },

    '.__slippage-editor-button-icon': {
      color: token.colorTextLight3
    },

    // quote empty block

    '.__quote-empty-block': {
      background: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      paddingBottom: token.paddingLG,
      paddingLeft: token.paddingLG,
      paddingRight: token.paddingLG,
      paddingTop: token.paddingXL,
      textAlign: 'center',
      gap: token.size,
      minHeight: 184
    },

    '.__quote-empty-icon-wrapper': {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: token.margin
    },

    '.__quote-empty-icon': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: 64,
      height: 64,
      position: 'relative',

      '&:before': {
        content: "''",
        position: 'absolute',
        inset: 0,
        borderRadius: '100%',
        backgroundColor: token['gray-4'],
        opacity: 0.1,
        zIndex: 0
      },

      '.anticon': {
        position: 'relative',
        zIndex: 1,
        color: token.colorTextLight3
      }
    },

    '.__quote-empty-icon.-error': {
      '&:before': {
        backgroundColor: token.colorError
      },

      '.anticon': {
        color: token.colorError
      }
    },

    '.__quote-empty-message': {
      color: token.colorWhite,
      fontSize: token.fontSize,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },

    '.__quote-empty-message.-loading': {
      color: token.colorTextLight4
    }

  };
});
