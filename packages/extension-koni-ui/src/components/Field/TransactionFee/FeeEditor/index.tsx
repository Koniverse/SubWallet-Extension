// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _SUPPORT_TOKEN_PAY_FEE_GROUP, isChainSupportTokenPayFee } from '@subwallet/extension-base/constants';
import { _getAssetDecimals, _getAssetPriceId, _getAssetSymbol, _isNativeTokenBySlug } from '@subwallet/extension-base/services/chain-service/utils';
import { TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';
import { FeeChainType, FeeDetail, TransactionFee } from '@subwallet/extension-base/types';
import { BN_ZERO } from '@subwallet/extension-base/utils';
import ChooseFeeTokenModal from '@subwallet/extension-koni-ui/components/Field/TransactionFee/FeeEditor/ChooseFeeTokenModal';
import { BN_TEN, CHOOSE_FEE_TOKEN_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ActivityIndicator, Button, Icon, ModalContext, Number, Tooltip } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { PencilSimpleLine } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FeeEditorModal } from './FeeEditorModal';

export type RenderFieldNodeParams = {
  isLoading: boolean;
  feeInfo: {
    decimals: number,
    symbol: string,
    value: BigN,
    convertedValue: BigN
  },
  disableEdit: boolean,
  onClickEdit: VoidFunction
}

type Props = ThemeProps & {
  onSelect?: (option: TransactionFee) => void;
  isLoadingFee: boolean;
  isLoadingToken: boolean;
  tokenPayFeeSlug: string;
  tokenSlug: string;
  feePercentageSpecialCase?: number
  feeOptionsInfo?: FeeDetail;
  estimateFee: string;
  crossChainFee: string;
  renderFieldNode?: (params: RenderFieldNodeParams) => React.ReactNode;
  feeType?: FeeChainType;
  listTokensCanPayFee: TokenHasBalanceInfo[];
  onSetTokenPayFee: (slug: string) => void;
  currentTokenPayFee?: string;
  chainValue?: string;
  destChainValue?: string;
  selectedFeeOption?: TransactionFee;
  nativeTokenSlug: string;
};

// todo: will update dynamic later
const modalId = 'FeeEditorModalId';

const FEE_TYPES_CAN_SHOW: Array<FeeChainType | undefined> = ['substrate', 'evm', 'bitcoin'];

const Component = ({ chainValue, className, crossChainFee, currentTokenPayFee, destChainValue, estimateFee, feeOptionsInfo, feePercentageSpecialCase, feeType, isLoadingFee = false, isLoadingToken, listTokensCanPayFee, nativeTokenSlug, onSelect, onSetTokenPayFee, renderFieldNode, selectedFeeOption, tokenPayFeeSlug, tokenSlug }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const assetRegistry = useSelector((root) => root.assetRegistry.assetRegistry);
  // @ts-ignore
  const priceMap = useSelector((state) => state.price.priceMap);
  const [feeEditorModalRenderKey, setFeeEditorModalRenderKey] = useState<string>(modalId);
  const { currencyData } = useSelector((state: RootState) => state.price);
  const [stableIsDataReady, setStableIsDataReady] = useState(false);

  const tokenPayFeeAsset = (() => {
    return assetRegistry[tokenPayFeeSlug] || undefined;
  })();

  const transferTokenAsset = (() => {
    return assetRegistry[tokenSlug] || undefined;
  })();

  const nativeAsset = (() => {
    return assetRegistry[nativeTokenSlug] || undefined;
  })();

  const decimals = _getAssetDecimals(tokenPayFeeAsset);
  const priceId = _getAssetPriceId(tokenPayFeeAsset);
  const priceValue = priceMap[priceId] || 0;
  const symbol = _getAssetSymbol(tokenPayFeeAsset);

  const priceNativeId = _getAssetPriceId(nativeAsset);
  const priceNativeValue = priceMap[priceNativeId] || 0;
  const nativeTokenSymbol = _getAssetSymbol(nativeAsset);
  const nativeTokenDecimals = _getAssetDecimals(nativeAsset);

  const transferTokenSymbol = _getAssetSymbol(transferTokenAsset);
  const transferTokenDecimals = _getAssetDecimals(transferTokenAsset);
  const transferTokenPriceId = _getAssetPriceId(transferTokenAsset);
  const transferTokenPriceValue = priceMap[transferTokenPriceId] || 0;

  const feeValue = useMemo(() => {
    return BN_ZERO;
  }, []);

  const feePriceValue = useMemo(() => {
    return BN_ZERO;
  }, []);

  const isDataReady = !isLoadingFee && !isLoadingToken && !!feeOptionsInfo;

  // Prevent flicker by stabilizing isDataReady
  useEffect(() => {
    const timer = setTimeout(() => {
      setStableIsDataReady(isDataReady);
    }, 100);

    return () => clearTimeout(timer);
  }, [isDataReady]);

  const convertedFeeValueToUSD = useMemo(() => {
    if (!stableIsDataReady) {
      return 0;
    }

    return new BigN(estimateFee)
      .multipliedBy(priceNativeValue)
      .dividedBy(BN_TEN.pow(nativeTokenDecimals || 0))
      .toNumber();
  }, [estimateFee, nativeTokenDecimals, priceNativeValue, stableIsDataReady]);

  const convertedCrossChainFeeValueToUSD = useMemo(() => {
    if (!stableIsDataReady) {
      return 0;
    }

    return new BigN(crossChainFee)
      .multipliedBy(transferTokenPriceValue)
      .dividedBy(BN_TEN.pow(transferTokenDecimals || 0))
      .toNumber();
  }, [crossChainFee, transferTokenDecimals, transferTokenPriceValue, stableIsDataReady]);

  const onClickEdit = useCallback(() => {
    if (chainValue && (_SUPPORT_TOKEN_PAY_FEE_GROUP.assetHub.includes(chainValue) || _SUPPORT_TOKEN_PAY_FEE_GROUP.hydration.includes(chainValue))) {
      activeModal(CHOOSE_FEE_TOKEN_MODAL);
    } else {
      setFeeEditorModalRenderKey(`${modalId}_${Date.now()}`);
      setTimeout(() => {
        activeModal(modalId);
      }, 100);
    }
  }, [activeModal, chainValue]);

  const onSelectTransactionFee = useCallback((fee: TransactionFee) => {
    onSelect?.(fee);
  }, [onSelect]);

  const customFieldNode = useMemo(() => {
    if (!renderFieldNode) {
      return null;
    }

    return renderFieldNode({
      isLoading: isLoadingFee,
      feeInfo: {
        decimals,
        symbol,
        value: feeValue,
        convertedValue: feePriceValue
      },
      disableEdit: isLoadingFee,
      onClickEdit
    });
  }, [decimals, feeValue, isLoadingFee, onClickEdit, renderFieldNode, symbol, feePriceValue]);

  const isXcm = useMemo(() => {
    return chainValue && destChainValue && chainValue !== destChainValue;
  }, [chainValue, destChainValue]);

  const isEnergyWebChain = useMemo(() => {
    return chainValue === 'energy_web_chain';
  }, [chainValue]);

  const { isEditButton, isEvmButNoCustomFeeSupport } = useMemo(() => {
    const isSubstrateSupport = !!(chainValue && feeType === 'substrate' && listTokensCanPayFee.length && (isChainSupportTokenPayFee(chainValue)));
    const isEvmSupport = !!(chainValue && feeType === 'evm');
    const isEvmCustomFeeEditable = isEvmSupport && !!feeOptionsInfo && 'options' in feeOptionsInfo && feeOptionsInfo.options != null;

    const isEvmButNoCustomFeeSupport = isEvmSupport && !isEvmCustomFeeEditable;
    const isEditButton = (isSubstrateSupport || isEvmSupport) && !isXcm && !isEnergyWebChain;

    return {
      isEvmButNoCustomFeeSupport,
      isEditButton
    };
  }, [chainValue, feeType, listTokensCanPayFee.length, feeOptionsInfo, isXcm, isEnergyWebChain]);

  const rateValue = useMemo(() => {
    const selectedToken = listTokensCanPayFee.find((item) => item.slug === tokenPayFeeSlug);

    return selectedToken?.rate || 1;
  }, [listTokensCanPayFee, tokenPayFeeSlug]);

  const rateDestValue = useMemo(() => {
    const selectedToken = listTokensCanPayFee.find((item) => item.slug === tokenSlug);

    return selectedToken?.rate || 1;
  }, [listTokensCanPayFee, tokenSlug]);

  const convertedEstimatedFee = useMemo(() => {
    const rs = new BigN(estimateFee).multipliedBy(rateValue);
    const isTransferLocalTokenAndPayThatTokenAsFee = !_isNativeTokenBySlug(tokenSlug) && !_isNativeTokenBySlug(tokenPayFeeSlug) && tokenPayFeeSlug === tokenSlug;

    return isTransferLocalTokenAndPayThatTokenAsFee ? rs.multipliedBy(feePercentageSpecialCase || 100).div(100) : rs;
  }, [estimateFee, rateValue, tokenSlug, tokenPayFeeSlug, feePercentageSpecialCase]);

  const convertedCrossChainFee = useMemo(() => {
    return new BigN(crossChainFee).multipliedBy(rateDestValue);
  }, [crossChainFee, rateDestValue]);

  const isNativeTokenValue = !!(!isEditButton && isXcm);

  return (
    <>
      {
        customFieldNode || (
          <div className={CN(className, '__estimate-fee-wrapper')}>
            <div className='__field-line-1'>
              <div className='__field-label'>
                {t('ui.TRANSACTION.components.Field.FeeEditor.networkFee')}
              </div>

              {!isDataReady
                ? (
                  <ActivityIndicator size={20} />
                )
                : (FEE_TYPES_CAN_SHOW.includes(feeType) && (
                  <div
                    className='__fee-editor-area'
                  >
                    <Number
                      className={'__fee-value'}
                      decimal={isNativeTokenValue ? nativeTokenDecimals : decimals}
                      prefix={'~ '}
                      suffix={isNativeTokenValue ? nativeTokenSymbol : symbol}
                      value={isNativeTokenValue ? estimateFee : convertedEstimatedFee}
                    />

                    {isEditButton && (
                      <Tooltip
                        className={'__not-editable'}
                        placement='topLeft'
                        title={isEvmButNoCustomFeeSupport ? t('ui.TRANSACTION.components.Field.FeeEditor.feeNotEditableWithCurrentRpc') : undefined}
                      >
                        <div>
                          <Button
                            className={'__fee-editor-button'}
                            disabled={!stableIsDataReady || isEvmButNoCustomFeeSupport}
                            icon={
                              <Icon
                                phosphorIcon={PencilSimpleLine}
                                size='sm'
                              />
                            }
                            loading={isLoadingToken}
                            onClick={isEvmButNoCustomFeeSupport ? undefined : onClickEdit}
                            size='xs'
                            type='ghost'
                          />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                ))}
            </div>
            {isDataReady && (
              <div className={CN('__field-line-2', { '-is-edit-button': isEditButton })}>
                <Number
                  className={'__fee-price-value'}
                  decimal={0}
                  prefix={`~ ${(currencyData.isPrefix && currencyData.symbol) || ''}`}
                  suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                  value={convertedFeeValueToUSD}
                />
              </div>
            )}
          </div>
        )
      }

      {
        isXcm && (
          <div className={CN(className, '__cross-chain-fee-wrapper')}>
            <div className='__field-line-1'>
              <div className='__field-label'>
                {t('ui.TRANSACTION.components.Field.FeeEditor.crossChainFee')}
              </div>

              {!isDataReady
                ? (
                  <ActivityIndicator size={20} />
                )
                : (FEE_TYPES_CAN_SHOW.includes(feeType) && (
                  <div className='__fee-editor-area'>
                    <Number
                      className={'__fee-value'}
                      decimal={transferTokenDecimals}
                      prefix={'~ '}
                      suffix={transferTokenSymbol}
                      value={isNativeTokenValue ? crossChainFee : convertedCrossChainFee}
                    />
                  </div>
                ))}
            </div>
            {isDataReady && (
              <div className={CN('__field-line-2')}>
                <Number
                  className={'__fee-price-value'}
                  decimal={0}
                  prefix={`~ ${(currencyData.isPrefix && currencyData.symbol) || ''}`}
                  suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                  value={convertedCrossChainFeeValueToUSD}
                />
              </div>
            )}
          </div>
        )
      }

      <FeeEditorModal
        chainValue={chainValue}
        currentTokenPayFee={currentTokenPayFee}
        decimals={decimals}
        feeOptionsInfo={feeOptionsInfo}
        feeType={feeType}
        key={feeEditorModalRenderKey}
        listTokensCanPayFee={listTokensCanPayFee}
        modalId={modalId}
        onSelectOption={onSelectTransactionFee}
        onSetTokenPayFee={onSetTokenPayFee}
        priceValue={priceValue}
        selectedFeeOption={selectedFeeOption}
        symbol={symbol}
        tokenSlug={tokenPayFeeSlug}
      />

      <ChooseFeeTokenModal
        convertedFeeValueToUSD={convertedFeeValueToUSD}
        estimateFee={estimateFee}
        feePercentageSpecialCase={feePercentageSpecialCase}
        items={listTokensCanPayFee}
        modalId={CHOOSE_FEE_TOKEN_MODAL}
        nativeTokenDecimals={nativeTokenDecimals}
        onSelectItem={onSetTokenPayFee}
        selectedItem={currentTokenPayFee || tokenPayFeeSlug}
        tokenSlug={tokenSlug}
      />
    </>
  );
};

const FeeEditor = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    minHeight: 24,
    alignItems: 'center',

    '.ant-number': {
      '&, .ant-typography': {
        color: 'inherit !important',
        fontSize: 'inherit !important',
        fontWeight: 'inherit !important',
        lineHeight: 'inherit'
      }
    },

    '&.__estimate-fee-wrapper, &.__cross-chain-fee-wrapper': {
      backgroundColor: token.colorBgSecondary,
      padding: token.paddingSM,
      paddingRight: token.paddingXS,
      borderRadius: token.borderRadiusLG,
      display: 'flex',
      flexDirection: 'column',
      '.__edit-icon': {
        color: token['gray-5']
      }
    },

    '&.__cross-chain-fee-wrapper': {
      marginTop: token.marginSM
    },

    '.__field-line-1': {
      flex: 1,
      display: 'flex',
      gap: token.sizeXXS,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight4,
      width: '100%',
      justifyContent: 'space-between'
    },

    '.__field-line-2': {
      width: '100%',
      justifyContent: 'flex-end',
      display: 'flex',
      '.__fee-price-value': {
        fontSize: `${token.fontSizeSM}px !important`,
        lineHeight: '20px !important',
        color: `${token.colorTextTertiary} !important`
      }
    },

    '.-is-edit-button': {
      paddingRight: '28px'
    },

    '.__fee-editor-area': {
      display: 'flex',
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight1,
      alignItems: 'center'
    },

    '.__fee-editor-button.__fee-editor-button.__fee-editor-button': {
      minWidth: 28,
      width: 28,
      height: 22
    }
  });
});

export default FeeEditor;
