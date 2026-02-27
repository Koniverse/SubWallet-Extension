// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { PrepareMultisigSignResponse } from '@subwallet/extension-base/types/multisig';
import { AccountProxyAvatar, AlertBox, WrappedTransactionSignerSelectorModal } from '@subwallet/extension-koni-ui/components';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { WRAPPED_TRANSACTION_SIGNER_SELECTOR_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetAccountByAddress, useGetWrappedTransactionSigners } from '@subwallet/extension-koni-ui/hooks';
import { prepareMultisigSignRequest } from '@subwallet/extension-koni-ui/messaging/transaction/multisig';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps, WrappedTransactionSigner } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext, Typography } from '@subwallet/react-ui';
import { useQuery } from '@tanstack/react-query';
import CN from 'classnames';
import { CaretDown, CircleNotch, Info } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

export interface MultisigSignerSelectorProps {
  className?: string;
  decimals?: number;
  initialCallData?: string | null;
  onDisableApprovalChange?: (value: boolean) => void;
  onOpenCallDataDetail?: () => void;
  requestId: string;
  symbol?: string;
  targetAddress: string;
  chainSlug: string;
}

enum MultisigSignerUiErrorType {
  UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
  UNSTABLE_NETWORK = 'UNSTABLE_NETWORK',
  NO_SIGNATORIES = 'NO_SIGNATORIES'
}

function MultisigSignerSelector ({ chainSlug, className, decimals, initialCallData, onDisableApprovalChange, onOpenCallDataDetail, requestId, symbol, targetAddress }: MultisigSignerSelectorProps) {
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const [signerSelected, setSignerSelected] = useState<WrappedTransactionSigner | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [wrapError, setWrapError] = useState<string | null>(null);
  const [multisigUiErrorType, setMultisigUiErrorType] = useState<MultisigSignerUiErrorType | null>(null);
  const [preparedInfo, setPreparedInfo] = useState<PrepareMultisigSignResponse | null>(null);
  const getWrappedTransactionSigners = useGetWrappedTransactionSigners();
  const signerAccount = useGetAccountByAddress(signerSelected?.address || '');
  const { chainInfoMap, chainStateMap } = useSelector((root: RootState) => root.chainStore);
  const chainInfo = chainInfoMap[chainSlug];

  const { data: signerItems, isLoading: isSignerItemsLoading } = useQuery<WrappedTransactionSigner[]>({
    queryKey: ['multisig-sign-request', requestId, targetAddress],
    queryFn: async () => {
      return await getWrappedTransactionSigners({
        chainSlug,
        extrinsicType: ExtrinsicType.MULTISIG_INIT_TX,
        targetAddress
      });
    },
    enabled: !!chainSlug && !!targetAddress
  });

  const filteredSignerItems = useMemo<WrappedTransactionSigner[]>(() => {
    if (!signerItems) {
      return [];
    }

    return signerItems.filter((item) => item.kind === 'signatory');
  }, [signerItems]);

  const noSignerAvailable = useMemo(() => !isSignerItemsLoading && !filteredSignerItems.length, [filteredSignerItems.length, isSignerItemsLoading]);

  const isChainActive = useMemo(() => !!(chainSlug && chainStateMap[chainSlug]?.active), [chainSlug, chainStateMap]);

  const displayMultisigErrorType = useMemo(() => {
    if (noSignerAvailable && isChainActive && chainInfo?.substrateInfo?.supportMultisig) {
      return MultisigSignerUiErrorType.NO_SIGNATORIES;
    }

    return multisigUiErrorType;
  }, [chainInfo?.substrateInfo?.supportMultisig, isChainActive, multisigUiErrorType, noSignerAvailable]);

  const multisigErrorMap = useMemo<Record<MultisigSignerUiErrorType, { description: string; title: string }>>(() => ({
    [MultisigSignerUiErrorType.UNSUPPORTED_CHAIN]: {
      title: t('ui.DAPP.Confirmations.MultisigSignerSelector.Message.Sign.unsupportedNetwork'),
      description: t('ui.DAPP.Confirmations.MultisigSignerSelector.Message.Sign.unsupportedNetworkDescription')
    },
    [MultisigSignerUiErrorType.UNSTABLE_NETWORK]: {
      title: t('ui.DAPP.Confirmations.MultisigSignerSelector.Message.Sign.unstableNetwork'),
      description: t('ui.DAPP.Confirmations.MultisigSignerSelector.Message.Sign.unstableNetworkDescription')
    },
    [MultisigSignerUiErrorType.NO_SIGNATORIES]: {
      title: t('ui.DAPP.Confirmations.MultisigSignerSelector.Message.Sign.noSignatories'),
      description: t('ui.DAPP.Confirmations.MultisigSignerSelector.Message.Sign.noSignatoriesDescription')
    }
  }), [t]);

  const mappedMultisigError = useMemo(() => {
    if (!displayMultisigErrorType) {
      return null;
    }

    return multisigErrorMap[displayMultisigErrorType];
  }, [displayMultisigErrorType, multisigErrorMap]);

  const disableApproval = useMemo(() => {
    return !signerSelected || !preparedInfo || isPreparing || isSignerItemsLoading || !!displayMultisigErrorType || !!wrapError;
  }, [displayMultisigErrorType, isPreparing, isSignerItemsLoading, preparedInfo, signerSelected, wrapError]);

  const callData = useMemo(() => {
    if (preparedInfo?.callData) {
      return preparedInfo.callData;
    }

    return initialCallData || null;
  }, [initialCallData, preparedInfo?.callData]);

  const multisigDeposit = useMemo(() => preparedInfo?.depositAmount, [preparedInfo?.depositAmount]);
  const networkFee = useMemo(() => preparedInfo?.networkFee, [preparedInfo?.networkFee]);
  const isDisabled = useMemo(() => isSignerItemsLoading || isPreparing || !!displayMultisigErrorType, [isSignerItemsLoading, isPreparing, displayMultisigErrorType]);
  const hasSigner = useMemo(() => !!signerAccount, [signerAccount]);

  const onOpenSelectSignerModal = useCallback(() => {
    activeModal(WRAPPED_TRANSACTION_SIGNER_SELECTOR_MODAL);
  }, [activeModal]);

  const onSelectSigner = useCallback((selected: WrappedTransactionSigner) => {
    setSignerSelected(selected);
    setIsPreparing(true);
    setWrapError(null);
    setMultisigUiErrorType(null);
    setPreparedInfo(null);

    prepareMultisigSignRequest({
      id: requestId,
      signer: selected.address
    })
      .then((response: PrepareMultisigSignResponse) => {
        setPreparedInfo(response);

        if (response.errors.length > 0) {
          const firstError = response.errors[0];

          setWrapError(firstError.message || null);
        }
      })
      .catch((e: Error) => {
        console.error('Error preparing multisig sign request', e);
        setMultisigUiErrorType(MultisigSignerUiErrorType.UNSTABLE_NETWORK);
      })
      .finally(() => {
        setIsPreparing(false);
      });
  }, [requestId]);

  useEffect(() => {
    onDisableApprovalChange?.(disableApproval);
  }, [disableApproval, onDisableApprovalChange]);

  useEffect(() => {
    if (!chainInfo?.substrateInfo?.supportMultisig) {
      setMultisigUiErrorType(MultisigSignerUiErrorType.UNSUPPORTED_CHAIN);
    } else if (noSignerAvailable) {
      setMultisigUiErrorType(MultisigSignerUiErrorType.NO_SIGNATORIES);
    }
  }, [chainInfo?.substrateInfo?.supportMultisig, noSignerAvailable]);

  return (
    <div className={CN('multisig-signer-container', className)}>
      {!hasSigner
        ? (
          <Button
            className={CN('signer-selection-placeholder-container')}
            disabled={isDisabled}
            onClick={onOpenSelectSignerModal}
            schema='default'
          >
            <div className='signer-selection-group-item'>
              <AccountProxyAvatar
                className='__account-avatar'
                size={24}
                value={''}
              />

              <Typography.Text className='signer-info-placeholder'>
                {t('ui.DAPP.Confirmations.MultisigSignerSelector.selectAccountToSign')}
              </Typography.Text>
            </div>

            <Button
              className='__signatory-editor-button'
              disabled={isDisabled}
              icon={
                <Icon
                  className={CN('multisig-signer-selector__icon', { '-loading': isSignerItemsLoading || isPreparing })}
                  customSize='18px'
                  phosphorIcon={(isSignerItemsLoading || isPreparing) ? CircleNotch : CaretDown}
                />
              }
              size='xs'
              type='ghost'
            />
          </Button>
        )
        : (
          <MetaInfo
            className='wrapped-transaction-container'
            hasBackgroundWrapper
          >
            <MetaInfo.Default
              className='signatory-address-info'
              label={t('ui.Confirmations.WrappedTransactionInfoArea.signWith')}
            >
              <div className='__account-item-wrapper'>
                <AccountProxyAvatar
                  className='__account-avatar'
                  size={24}
                  value={signerAccount?.proxyId || ''}
                />
                <div className='__account-item-name'>
                  {signerAccount?.name}
                </div>
              </div>
              <Button
                className='__signatory-editor-button'
                disabled={isDisabled}
                icon={
                  <Icon
                    className={CN('multisig-signer-selector__icon', { '-loading': isDisabled })}
                    customSize='18px'
                    phosphorIcon={CaretDown}
                  />
                }
                onClick={onOpenSelectSignerModal}
                size='xs'
                type='ghost'
              />
            </MetaInfo.Default>

            {isPreparing && (
              <div className='loading-icon-container'>
                <Icon
                  className='loading-icon'
                  phosphorIcon={CircleNotch}
                  weight='fill'
                />
              </div>
            )}

            {!isPreparing && (
              <>
                {!!multisigDeposit && (
                  <MetaInfo.Number
                    className='multisig-deposit-info'
                    decimals={decimals || 0}
                    label={t('ui.DAPP.Confirmations.MultisigSignerSelector.multisigDeposit')}
                    suffix={symbol}
                    value={multisigDeposit}
                  />
                )}

                <MetaInfo.Number
                  decimals={decimals || 0}
                  label={t('ui.DAPP.Confirmations.MultisigSignerSelector.networkFee')}
                  suffix={symbol}
                  value={networkFee || 0}
                />

                <MetaInfo.Default
                  className='call-data-info'
                  label={t('ui.DAPP.Confirmations.MultisigSignerSelector.CallDataDetail.callData')}
                >
                  {callData ? toShort(callData, 5, 5) : '-'}
                  {!!onOpenCallDataDetail && !!callData && (
                    <Button
                      className='call-data-info-button'
                      icon={(
                        <Icon
                          customSize='18px'
                          phosphorIcon={Info}
                        />
                      )}
                      onClick={onOpenCallDataDetail}
                      type='ghost'
                    />
                  )}
                </MetaInfo.Default>
              </>
            )}
          </MetaInfo>
        )}

      {!!mappedMultisigError?.description && (
        <AlertBox
          className='multisig-signer-error'
          description={mappedMultisigError.description}
          title={mappedMultisigError.title}
          type='error'
        />
      )}

      {!!wrapError && (
        <AlertBox
          className='multisig-signer-error'
          description={wrapError}
          title={t('ui.DAPP.Confirmations.MultisigSignerSelector.Message.Sign.unableToSignTransaction')}
          type='warning'
        />
      )}

      {!!filteredSignerItems.length && (
        <WrappedTransactionSignerSelectorModal
          chainSlug={chainSlug}
          onSelectSigner={onSelectSigner}
          selectedSigner={signerSelected}
          signerItems={filteredSignerItems}
          targetAddress={targetAddress}
        />
      )}
    </div>
  );
}

export default styled(React.memo(MultisigSignerSelector))<MultisigSignerSelectorProps>(({ theme: { token } }: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: token.sizeXS,

  '.signer-selection-placeholder-container': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: token.colorBgSecondary,
    justifyContent: 'space-between',
    borderRadius: token.borderRadiusLG,
    padding: `${token.paddingXS}px ${token.paddingSM}px`,
    height: 48,

    '.signer-selection-group-item': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXS
    },

    '.loading-icon': {
      animation: 'spinner-loading 1s infinite linear'
    },

    '.signer-info-placeholder': {
      color: token.colorTextLight4
    },

    '&[disabled], &.ant-btn-disabled': {
      cursor: 'not-allowed',

      '.signer-selection-group-item, .signer-info-placeholder, .__signatory-editor-button': {
        cursor: 'not-allowed'
      }
    }
  },

  '.wrapped-transaction-container': {
    '.call-data-info-button': {
      height: 'fit-content',
      width: 'fit-content',
      minWidth: 'unset',
      color: token.colorTextLight4,
      transform: 'all 0.3s ease-in-out',

      '.anticon': {
        height: 'fit-content',
        width: 'fit-content',
        marginLeft: token.marginXS - 2
      },

      '&:hover': {
        color: token.colorTextLight2
      }
    },

    '.__signatory-editor-button': {
      minWidth: '28px',
      width: 28,
      height: 22
    },

    '.signatory-address-info': {
      '.__value-col': {
        flexDirection: 'row',
        alignItems: 'start',
        justifyContent: 'end',
        flexWrap: 'nowrap'
      }
    },

    '.__value': {
      display: 'flex',
      alignItems: 'center'
    },

    '.loading-icon': {
      height: 120,
      marginInline: 'auto',
      fontSize: token.fontSizeSuper3,
      animation: 'spinner-loading 1s infinite linear'
    },

    '.__account-item-wrapper': {
      overflow: 'hidden',
      display: 'flex',
      gap: 8,

      '.__account-item-name': {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: 110
      }
    }
  }
}));
