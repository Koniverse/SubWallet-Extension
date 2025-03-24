// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { CommonOptimalPath, SwapProviderId, SwapQuote } from '@subwallet/extension-base/types';
import { MetaInfo, TransactionProcessPreview } from '@subwallet/extension-koni-ui/components';
import { QuoteResetTime } from '@subwallet/extension-koni-ui/components/Swap';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertHexColorToRGBA } from '@subwallet/extension-koni-ui/utils';
import { ActivityIndicator, Icon, Number as UiNumber, Tooltip } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { CaretRight, Info, ListBullets, PencilSimpleLine, XCircle } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  currentQuote: SwapQuote | undefined;
  currentOptimalSwapPath: CommonOptimalPath | undefined;
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

type DecimalParts = {
  integerPart: string;
  subZeroCount?: number;
  fractionPart?: string;
};

function roundFraction (raw: string, digits: number): string {
  const numStr = `0.${raw}`;
  const rounded = new BigN(numStr).decimalPlaces(digits, BigN.ROUND_HALF_UP);

  return rounded.toFixed(digits).split('.')[1];
}

function analyzeDecimal (value: number): DecimalParts {
  const str = new BigN(value).toFixed();
  const [intPart, fracRaw = ''] = str.split('.');
  const intVal = +intPart;

  if (!fracRaw || /^0*$/.test(fracRaw)) {
    return { integerPart: intPart };
  }

  if (intVal > 0) {
    if (/^0{3,}$/.test(fracRaw)) {
      return { integerPart: intPart, fractionPart: '000' };
    }

    return {
      integerPart: intPart,
      fractionPart: roundFraction(fracRaw, 4)
    };
  }

  const zeroMatch = fracRaw.match(/^(0{3,})/);
  const subCount = zeroMatch?.[1].length;
  const rest = subCount ? fracRaw.slice(subCount) : fracRaw;
  const maxLen = subCount ? 2 : 4;
  const rounded = roundFraction(rest, maxLen);

  return {
    integerPart: intPart,
    subZeroCount: subCount,
    fractionPart: rounded || (subCount ? '' : undefined)
  };
}

function renderRateValue (value: number): React.ReactNode {
  const parsed = analyzeDecimal(value);

  if (parsed.fractionPart === undefined) {
    return <>{parsed.integerPart}</>;
  }

  const { fractionPart, integerPart, subZeroCount } = parsed;

  if (subZeroCount !== undefined) {
    return (
      <>
        {integerPart}.0<sub>{subZeroCount}</sub>{fractionPart}
      </>
    );
  }

  return (
    <>
      {integerPart}.{fractionPart}
    </>
  );
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, currentOptimalSwapPath, currentQuote, estimatedFeeValue,
    fromAssetInfo, handleRequestLoading, isFormInvalid,
    openSlippageModal, openSwapQuotesModal, quoteAliveUntil, slippage, swapError,
    toAssetInfo } = props;
  const { t } = useTranslation();
  const currencyData = useSelector((state) => state.price.currencyData);

  const rateValueNode = useMemo(() => {
    return currentQuote?.rate ? renderRateValue(currentQuote.rate) : 0;
  }, [currentQuote?.rate]);

  const renderRateInfo = () => {
    if (!currentQuote) {
      return null;
    }

    return (
      <div className={'__quote-estimate-swap-value'}>
        <span>
          1 {_getAssetSymbol(fromAssetInfo)}
        </span>
        <span>&nbsp;~&nbsp;</span>
        <span>
          {rateValueNode}
          {` ${_getAssetSymbol(toAssetInfo)}`}
        </span>
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
            <Icon
              className='__slippage-editor-icon'
              customSize={'16px'}
              phosphorIcon={PencilSimpleLine}
            />
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

                  {
                    currentOptimalSwapPath && (
                      <TransactionProcessPreview steps={currentOptimalSwapPath.steps} />
                    )
                  }

                  <Icon
                    className={'__caret-icon'}
                    customSize={'16px'}
                    phosphorIcon={CaretRight}
                    size='sm'
                  />
                </div>
              </MetaInfo.Default>

              <MetaInfo.Default
                className={'__swap-estimated-fee-info'}
                label={t('Estimated fee')}
              >
                <UiNumber
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

    '.__quote-selector-trigger': {
      display: 'flex',
      cursor: 'pointer',
      alignItems: 'center',
      gap: token.sizeXXS
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

    '.__swap-process-modal-trigger': {
      display: 'flex',
      cursor: 'pointer',
      alignItems: 'center',
      gap: token.sizeXXS
    },

    '.__swap-estimated-fee-info': {
      '.ant-number': {
        '&, .ant-typography': {
          color: 'inherit !important',
          fontSize: 'inherit !important',
          fontWeight: 'inherit !important',
          lineHeight: 'inherit'
        }
      }
    },

    '.__slippage-action': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXXS
    },

    '.__slippage-action.-clickable': {
      cursor: 'pointer'
    },

    '.__slippage-editor-icon': {
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
