// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { getAmountAfterSlippage, getSwapChainsFromPath } from '@subwallet/extension-base/services/swap-service/utils';
import { CommonOptimalSwapPath, ProcessType, SwapProviderId, SwapQuote } from '@subwallet/extension-base/types';
import { MetaInfo, NumberDisplay, TransactionProcessPreview } from '@subwallet/extension-koni-ui/components';
import { QuoteRateDisplay, QuoteResetTime } from '@subwallet/extension-koni-ui/components/Swap';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useGetSwapProcessSteps, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps, TransactionProcessStepItemType } from '@subwallet/extension-koni-ui/types';
import { convertHexColorToRGBA } from '@subwallet/extension-koni-ui/utils';
import { ActivityIndicator, Icon, Tooltip } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { CaretRight, Info, ListBullets, PencilSimpleLine, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  currentQuote: SwapQuote | undefined;
  quoteOptions: SwapQuote[];
  currentOptimalSwapPath: CommonOptimalSwapPath | undefined;
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

const Component: React.FC<Props> = (props: Props) => {
  const { className, currentOptimalSwapPath, currentQuote, estimatedFeeValue,
    fromAssetInfo, handleRequestLoading, isFormInvalid, openSlippageModal, openSwapQuotesModal,
    quoteAliveUntil, quoteOptions, slippage, swapError,
    toAssetInfo } = props;
  const { t } = useTranslation();
  const currencyData = useSelector((state) => state.price.currencyData);

  const { swapFeesModal, transactionStepsModal } = useContext(WalletModalContext);

  const getSwapProcessSteps = useGetSwapProcessSteps();

  const openProcessModal = useCallback(() => {
    if (!currentOptimalSwapPath || !currentQuote) {
      return;
    }

    const items: TransactionProcessStepItemType[] = getSwapProcessSteps(currentOptimalSwapPath, currentQuote);

    transactionStepsModal.open({
      items,
      type: ProcessType.SWAP,
      variant: 'standard'
    });
  }, [currentOptimalSwapPath, currentQuote, getSwapProcessSteps, transactionStepsModal]);

  const openSwapFeeModal = useCallback(() => {
    if (!currentQuote) {
      return;
    }

    swapFeesModal.open({
      currentQuote,
      estimatedFeeValue
    });
  }, [currentQuote, estimatedFeeValue, swapFeesModal]);

  const renderRateInfo = () => {
    if (!currentQuote) {
      return null;
    }

    return (
      <QuoteRateDisplay
        className={'__quote-estimate-swap-value'}
        fromAssetInfo={fromAssetInfo}
        rateValue={currentQuote.rate}
        toAssetInfo={toAssetInfo}
      />
    );
  };

  const _renderRateInfo = () => {
    const recommendedQuote = quoteOptions[0];

    return (
      <div
        className={'__quote-selector-trigger'}
        onClick={openSwapQuotesModal}
      >
        {renderRateInfo()}

        {
          !!recommendedQuote?.provider.id && (recommendedQuote?.provider.id === currentQuote?.provider.id) && (
            <div className='__best-tag'>
              {t('ui.Transaction.Swap.QuoteInfo.best')}
            </div>
          )
        }

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
    const _loading = handleRequestLoading && !isFormInvalid;

    if (swapError || (!currentQuote && !_loading)) {
      return null;
    }

    const isError = isFormInvalid;
    let message = '';

    if (isFormInvalid) {
      message = t('ui.Transaction.Swap.QuoteInfo.invalidInputReEnter');
    } else if (handleRequestLoading) {
      message = t('ui.Transaction.Swap.QuoteInfo.loadingEllipsis');
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
    const slippageValueString = new BigN(slippage).multipliedBy(100).toFixed();
    const slippageContent = isSimpleSwapSlippage ? `Up to ${slippageValueString}%` : `${slippageValueString}%`;

    return (
      <>
        <div
          className={CN('__slippage-action', {
            '-clickable': slippageTitle || !notSupportSlippageSelection
          })}
          onClick={onOpenSlippageModal}
        >
          <Tooltip
            className={'__slippage-content'}
            open={slippageTitle ? undefined : false}
            placement={'topRight'}
            title={slippageTitle}
          >
            {
              !!slippageTitle && (
                <Icon
                  phosphorIcon={Info}
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

  const processChains = useMemo(() => {
    if (!currentOptimalSwapPath) {
      return [];
    }

    return getSwapChainsFromPath(currentOptimalSwapPath.path);
  }, [currentOptimalSwapPath]);

  const minReceivableValue = useMemo(() => {
    if (!currentQuote) {
      return '0';
    }

    return getAmountAfterSlippage(currentQuote.toAmount, slippage);
  }, [currentQuote, slippage]);

  const showQuoteEmptyBlock = (!currentQuote || handleRequestLoading || isFormInvalid);

  useEffect(() => {
    if (swapFeesModal.checkActive?.() && currentQuote && estimatedFeeValue) {
      swapFeesModal.update({ currentQuote, estimatedFeeValue });
    }
  }, [currentQuote, estimatedFeeValue, swapFeesModal]);

  return (
    <>
      <div className={className}>
        {
          !showQuoteEmptyBlock && (
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
                    {t('ui.Transaction.Swap.QuoteInfo.quoteRate')}

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
                label={t('ui.Transaction.Swap.QuoteInfo.process')}
              >
                <div
                  className={'__swap-process-modal-trigger'}
                  onClick={openProcessModal}
                >

                  <TransactionProcessPreview chains={processChains} />

                  <Icon
                    className={'__caret-icon'}
                    customSize={'16px'}
                    phosphorIcon={CaretRight}
                    size='sm'
                  />
                </div>
              </MetaInfo.Default>

              <MetaInfo.Default
                className={'__meta-info-number-row'}
                label={t('ui.Transaction.Swap.QuoteInfo.estimatedFee')}
              >
                <div
                  className={'__swap-fees-modal-trigger'}
                  onClick={openSwapFeeModal}
                >
                  <NumberDisplay
                    decimal={0}
                    prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
                    suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                    value={estimatedFeeValue}
                  />
                  <Icon
                    className={'__caret-icon'}
                    customSize={'16px'}
                    phosphorIcon={CaretRight}
                    size='sm'
                  />
                </div>
              </MetaInfo.Default>

              <MetaInfo.Default
                className={'__meta-info-number-row'}
                label={t('ui.Transaction.Swap.QuoteInfo.minReceivable')}
              >
                <NumberDisplay
                  decimal={_getAssetDecimals(toAssetInfo)}
                  suffix={_getAssetSymbol(toAssetInfo)}
                  value={minReceivableValue}
                />
              </MetaInfo.Default>

              <MetaInfo.Default
                className={'__slippage-info'}
                label={t('ui.Transaction.Swap.QuoteInfo.slippage')}
              >
                {renderSlippageInfoContent()}
              </MetaInfo.Default>
            </MetaInfo>
          )
        }

        {
          showQuoteEmptyBlock && renderQuoteEmptyBlock()
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

    '.__swap-process-modal-trigger, .__swap-fees-modal-trigger': {
      display: 'flex',
      cursor: 'pointer',
      alignItems: 'center',
      gap: token.sizeXXS
    },

    '.__meta-info-number-row': {
      '.ant-number': {
        '&, .ant-typography': {
          color: 'inherit !important',
          fontSize: 'inherit !important',
          fontWeight: 'inherit !important',
          lineHeight: 'inherit'
        }
      }
    },

    '.__slippage-action, .__slippage-content': {
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
