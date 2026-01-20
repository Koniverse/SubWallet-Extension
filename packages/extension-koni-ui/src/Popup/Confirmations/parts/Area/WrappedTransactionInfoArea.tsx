// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { SWTransactionResponse, SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { ExcludedSubstrateProxyAccounts, RequestRemoveSubstrateProxyAccount } from '@subwallet/extension-base/types';
import { InitMultisigTxResponse } from '@subwallet/extension-base/types/multisig';
import { AccountProxyAvatar, AlertBox, WrappedTransactionSignerSelectorModal } from '@subwallet/extension-koni-ui/components';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { WRAPPED_TRANSACTION_SIGNER_SELECTOR_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetAccountByAddress, useGetNativeTokenBasicInfo, useGetWrappedTransactionSigners, useOpenDetailModal } from '@subwallet/extension-koni-ui/hooks';
import { initMultisigTx } from '@subwallet/extension-koni-ui/messaging/transaction/multisig';
import { handleSubstrateProxyWrappedTxRequest } from '@subwallet/extension-koni-ui/messaging/transaction/substrateProxy';
import { BaseDetailModal } from '@subwallet/extension-koni-ui/Popup/Confirmations/parts/Detail';
import { ThemeProps, WrappedTransactionSigner } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext, Typography } from '@subwallet/react-ui';
import { useQuery } from '@tanstack/react-query';
import CN from 'classnames';
import { CaretDown, CircleNotch, Info } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  transaction: SWTransactionResult;
  setDisable: (disabled: boolean) => void;
}

const modalId = WRAPPED_TRANSACTION_SIGNER_SELECTOR_MODAL;

function Component ({ className, setDisable, transaction }: Props) {
  const { t } = useTranslation();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const account = useGetAccountByAddress(transaction.address);
  const getWrappedTransactionSigners = useGetWrappedTransactionSigners();
  const [signerSelected, setSignerSelected] = React.useState<WrappedTransactionSigner | null>(null);
  const [wrapTransactionInfo, setWrapTransactionInfo] = React.useState<SWTransactionResponse | null>(null);
  const [transactionError, setTransactionError] = React.useState<TransactionError| null>(null);
  const [isWrapTransactionLoading, setIsWrapTransactionLoading] = React.useState(false);
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const signerAccount = useGetAccountByAddress(signerSelected?.address || '');

  const openDetailModal = useOpenDetailModal();

  const excludedSubstrateProxyAccounts = useMemo<ExcludedSubstrateProxyAccounts[] | undefined>(() => {
    if (transaction.extrinsicType === ExtrinsicType.REMOVE_SUBSTRATE_PROXY_ACCOUNT) {
      const removeSubstrateProxyTransaction = transaction.data as RequestRemoveSubstrateProxyAccount;

      return removeSubstrateProxyTransaction?.selectedSubstrateProxyAccounts;
    }

    return undefined;
  }, [transaction.data, transaction.extrinsicType]);

  const descriptionContent = useMemo(() => {
    if (!!transaction.wrappingStatus && account?.isMultisig && signerSelected?.kind === 'signatory' && signerAccount) {
      return t('ui.Confirmations.WrappedTransactionInfoArea.multisigInitiationDescription', { replace: { name: signerAccount.name } });
    }

    if (transaction.extrinsicType === ExtrinsicType.MULTISIG_EXECUTE_TX) {
      return t('ui.Confirmations.WrappedTransactionInfoArea.multisigExecutionDescription');
    }

    if (transaction.extrinsicType === ExtrinsicType.MULTISIG_CANCEL_TX) {
      return t('ui.Confirmations.WrappedTransactionInfoArea.multisigCancelDescription');
    }

    return null;
  }, [account?.isMultisig, signerAccount, signerSelected?.kind, t, transaction.extrinsicType, transaction.wrappingStatus]);

  const wrapTransactionData = useMemo(() => {
    if (!wrapTransactionInfo) {
      return null;
    }

    return wrapTransactionInfo.data as InitMultisigTxResponse;
  }, [wrapTransactionInfo]);

  const { data: signableAccountProxyItems, isLoading: isGetSignableLoading } = useQuery<WrappedTransactionSigner[]>({
    queryKey: ['non-direct-signing', transaction.id],
    queryFn: async () => {
      return await getWrappedTransactionSigners({
        ...transaction,
        chainSlug: transaction.chain,
        targetAddress: transaction.address,
        excludedSubstrateProxyAccounts
      });
    },
    staleTime: 30_000,
    enabled: !!transaction && !!account && !!transaction.wrappingStatus
  });

  const onOpenSelectSignerModal = useCallback(() => {
    activeModal(modalId);
  }, [activeModal]);

  const prepareTransaction = useCallback(async (signerSelected: WrappedTransactionSigner) => {
    try {
      setIsWrapTransactionLoading(true);
      setTransactionError(null);
      setDisable(true);

      let transactionResponse: SWTransactionResponse;

      if (signerSelected.kind === 'substrate_proxy') {
        transactionResponse = await handleSubstrateProxyWrappedTxRequest({
          transactionId: transaction.id,
          signer: signerSelected.address,
          chain: transaction.chain,
          proxyMetadata: {
            proxiedAddress: transaction.address
          }
        });
      } else {
        transactionResponse = await initMultisigTx({
          transactionId: transaction.id,
          signer: signerSelected.address,
          chain: transaction.chain,
          multisigMetadata: {
            multisigAddress: transaction.address,
            threshold: account?.threshold || 0,
            signers: account?.signers || []
          }
        });
      }

      if (transactionResponse.errors?.length) {
        setTransactionError(transactionResponse.errors[0]);
        setWrapTransactionInfo(null);
      } else {
        setDisable(false);
        setWrapTransactionInfo(transactionResponse);
      }
    } catch (e) {
      setIsWrapTransactionLoading(false);
    }
  }, [account, setDisable, transaction]);

  const onSelectSigner = useCallback((selected: WrappedTransactionSigner) => {
    setSignerSelected((prevState) => {
      if (prevState?.address !== selected.address) {
        prepareTransaction(selected)
          .finally(() => {
            setIsWrapTransactionLoading(false);
          });
      }

      return selected;
    });
    inactiveModal(modalId);
  }, [inactiveModal, prepareTransaction]);

  const isSelectorDisable = isGetSignableLoading || isWrapTransactionLoading;

  if (!transaction.wrappingStatus) {
    return <></>;
  }

  return (
    <>
      {!signerAccount
        ? (
          <Button
            className={CN(className, 'signer-selection-placeholder-container')}
            disabled={isSelectorDisable}
            onClick={onOpenSelectSignerModal}
            schema={'default'}
          >
            <div className={'signer-selection-group-item'}>
              <AccountProxyAvatar
                className={'__account-avatar'}
                size={24}
                value={''}
              />

              <Typography.Text className={CN('signer-info-placeholder')}>
                {t('ui.Confirmations.WrappedTransactionInfoArea.selectAccountToSign')}
              </Typography.Text>
            </div>

            <Button
              className={'__signatory-editor-button'}
              disabled={isSelectorDisable}
              icon={
                isSelectorDisable
                  ? <Icon
                    className={'loading-icon'}
                    phosphorIcon={CircleNotch}
                    weight='fill'
                  />
                  : <Icon
                    phosphorIcon={CaretDown}
                    size='sm'
                  />
              }
              size='xs'
              type='ghost'
            />
          </Button>
        )
        : (
          <div className={CN(className)}>
            <MetaInfo
              className={CN('wrapped-transaction-container')}
              hasBackgroundWrapper
            >

              <MetaInfo.Default
                className={CN('signatory-address-info')}
                label={t('ui.Confirmations.WrappedTransactionInfoArea.signWith')}
              >
                <div className={'__account-item-wrapper'}>
                  <AccountProxyAvatar
                    className={'__account-avatar'}
                    size={24}
                    value={signerAccount.proxyId}
                  />
                  <div className={'__account-item-name'}>{signerAccount.name}</div>
                </div>
                <Button
                  className={'__signatory-editor-button'}
                  disabled={isGetSignableLoading || isWrapTransactionLoading}
                  icon={
                    <Icon
                      customSize={'18px'}
                      phosphorIcon={CaretDown}
                    />
                  }
                  onClick={onOpenSelectSignerModal}
                  size='xs'
                  type='ghost'
                />
              </MetaInfo.Default>

              {
                isWrapTransactionLoading && (
                  <div className={'loading-icon-container'}>
                    <Icon
                      className={'loading-icon'}
                      phosphorIcon={CircleNotch}
                      weight='fill'
                    />
                  </div>
                )
              }

              {
                !!wrapTransactionData && !isWrapTransactionLoading && (
                  <>
                    {wrapTransactionData.depositAmount != null && <MetaInfo.Number
                      className={CN('multisig-deposit-info')}
                      decimals={decimals}
                      label={t('ui.Confirmations.WrappedTransactionInfoArea.multisigDeposit')}
                      suffix={symbol}
                      value={wrapTransactionData.depositAmount}
                    />}

                    <MetaInfo.Number
                      decimals={decimals}
                      label={t('ui.Confirmations.WrappedTransactionInfoArea.networkFee')}
                      suffix={symbol}
                      value={wrapTransactionData?.networkFee || transaction.estimateFee?.value || 0}
                    />

                    {wrapTransactionData.callData != null && <MetaInfo.Default
                      label={t('ui.Confirmations.Detail.CallDataDetail.callData')}
                    >
                      {toShort(wrapTransactionData.callData, 5, 5)}
                      <Button
                        className={'call-data-info-button'}
                        icon={<Icon
                          customSize={'18px'}
                          phosphorIcon={Info}
                        />}
                        onClick={openDetailModal}
                        type={'ghost'}
                      />
                    </MetaInfo.Default>}
                  </>
                )
              }
            </MetaInfo>

            <Typography.Text className={CN('description-text')}>
              {descriptionContent}
            </Typography.Text>

            {
              !!transactionError && (
                <AlertBox
                  className={CN('error-message')}
                  description={transactionError.message}
                  type={'warning'}
                />
              )
            }
          </div>
        )
      }

      {<BaseDetailModal
        className={CN(className, 'call-data-detail-modal')}
        showFooter={false}
        title={t('ui.Confirmations.Detail.CallDataDetail.transactionDetails')}
      >
        <pre className='json'>
          {JSON.stringify(wrapTransactionData?.decodedCallData || '', null, 2)}
        </pre>
      </BaseDetailModal>}

      {!!signableAccountProxyItems && (
        <WrappedTransactionSignerSelectorModal
          chainSlug={transaction.chain}
          onSelectSigner={onSelectSigner}
          selectedSigner={signerSelected}
          signerItems={signableAccountProxyItems}
          targetAddress={transaction.address}
        />
      )}
    </>
  );
}

const WrappedTransactionInfoArea = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => {
  return {
    marginTop: token.marginSM,

    '&.signer-selection-placeholder-container': {
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
      }
    },

    '.wrapped-transaction-container': {
      '.call-data-info-button': {
        height: 'fit-content !important',
        width: 'fit-content !important',
        minWidth: 'unset !important',
        color: token.colorTextLight4,
        transform: 'all 0.3s ease-in-out',

        '&:hover': {
          color: token.colorTextLight2
        }
      },

      '.__signatory-editor-button': {
        minWidth: '28px !important',
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
          overflow: 'hidden'
        }
      }
    },

    '.description-text': {
      fontSize: token.fontSize,
      marginTop: token.marginSM,
      color: token.colorTextLight4,
      textAlign: 'left',
      display: 'block'
    },

    '.error-message': {
      marginTop: token.marginSM,

      '.alert-description': {
        color: token.colorWarning
      }
    },

    '&.call-data-detail-modal': {
      '.ant-sw-modal-body': {
        height: 264,
        borderRadius: token.borderRadiusLG,
        padding: token.paddingSM,
        backgroundColor: token.colorBgSecondary,
        overflowY: 'auto',
        scrollBehavior: 'smooth',
        color: '#999999',
        margin: `${token.margin}px 0`,
        fontSize: token.fontSizeLG - 1,
        fontFamily: token.monoSpaceFontFamily
      }
    }
  };
});

export default WrappedTransactionInfoArea;
