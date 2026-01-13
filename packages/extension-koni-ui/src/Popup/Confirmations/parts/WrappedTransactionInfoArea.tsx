// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { ExcludedSubstrateProxyAccounts, RequestRemoveSubstrateProxyAccount } from '@subwallet/extension-base/types';
import { InitMultisigTxRequest, InitMultisigTxResponse } from '@subwallet/extension-base/types/multisig';
import { SignableAccountProxySelectorModal } from '@subwallet/extension-koni-ui/components';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { SIGNABLE_ACCOUNT_PROXY_SELECTOR_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetAccountByAddress, useOpenDetailModal } from '@subwallet/extension-koni-ui/hooks';
import { useCreateGetSignableAccountProxy, useGetNativeTokenBasicInfo } from '@subwallet/extension-koni-ui/hooks/';
import { initMultisigTx } from '@subwallet/extension-koni-ui/messaging/transaction/multisig';
import { BaseDetailModal } from '@subwallet/extension-koni-ui/Popup/Confirmations/parts/Detail';
import { SignableAccountProxyItem, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext, Typography } from '@subwallet/react-ui';
import { useQuery } from '@tanstack/react-query';
import CN from 'classnames';
import { CircleNotch, Info, PencilSimpleLine } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  transaction: SWTransactionResult;
}

const modalId = SIGNABLE_ACCOUNT_PROXY_SELECTOR_MODAL;

function Component ({ className, transaction }: Props) {
  const { t } = useTranslation();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const account = useGetAccountByAddress(transaction.address);
  const selectSignableAccountProxy = useCreateGetSignableAccountProxy();
  const [signerSelected, setSignerSelected] = React.useState<SignableAccountProxyItem | null>(null);
  const [wrapTransactionInfo, setWrapTransactionInfo] = React.useState<InitMultisigTxResponse | null>(null);
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
    if (!!transaction.wrappingStatus && account?.isMultisig && signerAccount) {
      return t('ui.Confirmations.WrappedTransactionInfoArea.multisigInitiationDescription', { replace: { name: signerAccount.name } });
    }

    if (transaction.extrinsicType === ExtrinsicType.MULTISIG_EXECUTE_TX) {
      return t('ui.Confirmations.WrappedTransactionInfoArea.multisigExecutionDescription');
    }

    if (transaction.extrinsicType === ExtrinsicType.MULTISIG_CANCEL_TX) {
      return t('ui.Confirmations.WrappedTransactionInfoArea.multisigCancelDescription');
    }

    return null;
  }, [account?.isMultisig, signerAccount, t, transaction.extrinsicType, transaction.wrappingStatus]);

  const { data: signableAccountProxyItems, isLoading: isGetSignableLoading } = useQuery<SignableAccountProxyItem[]>({
    queryKey: ['non-direct-signing', transaction.id],
    queryFn: async () => {
      return await selectSignableAccountProxy({
        ...transaction,
        excludedSubstrateProxyAccounts
      });
    },
    staleTime: 30_000,
    enabled: !!transaction && !!account && !!transaction.wrappingStatus
  });

  const onSelectSigner = useCallback((selected: SignableAccountProxyItem) => {
    setSignerSelected(selected);
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onCancelSelectSigner = useCallback(() => {
    setSignerSelected(null);
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onOpenSelectSignerModal = useCallback(() => {
    activeModal(modalId);
  }, [activeModal]);

  useEffect(() => {
    if (!signerSelected || !account) {
      return;
    }

    let cancelled = false;

    const prepareTransaction = async (params: InitMultisigTxRequest) => {
      try {
        setIsWrapTransactionLoading(true);

        const wrappedTransaction = await initMultisigTx(params);

        if (!cancelled) {
          setWrapTransactionInfo(wrappedTransaction.data as InitMultisigTxResponse);
        }
      } catch (e) {
        if (!cancelled) {
          setIsWrapTransactionLoading(false);
        }
      }
    };

    prepareTransaction({
      transactionId: transaction.id,
      signer: signerSelected.address,
      multisigMetadata: {
        threshold: account?.threshold || 0,
        signers: account?.signers || []
      },
      chain: transaction.chain
    }).finally(() => {
      if (!cancelled) {
        setIsWrapTransactionLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [account, signerSelected, transaction]);

  if (!signableAccountProxyItems?.length || !transaction.wrappingStatus) {
    return <></>;
  }

  if (isGetSignableLoading) {
    return <MetaInfo
      className={CN(className, 'container-loading')}
      hasBackgroundWrapper
    >
      <Icon
        className={'loading-icon'}
        phosphorIcon={CircleNotch}
        weight='fill'
      />
    </MetaInfo>;
  }

  return (
    <>
      <MetaInfo
        className={CN('wrapped-transaction-container', className)}
        hasBackgroundWrapper
      >
        <MetaInfo.Account
          address={signerSelected?.address || ''}
          chainSlug={transaction.chain}
          className={CN(className, 'signatory-address-info')}
          label={t('ui.Confirmations.WrappedTransactionInfoArea.signer')}
          leftItem={(
            <Button
              className={'__fee-editor-button'}
              disabled={isGetSignableLoading || isWrapTransactionLoading}
              icon={
                <Icon
                  phosphorIcon={PencilSimpleLine}
                  size='sm'
                />
              }
              onClick={onOpenSelectSignerModal}
              size='xs'
              type='ghost'
            />
          )}
        />

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
          !!wrapTransactionInfo && !isWrapTransactionLoading && (
            <>
              <MetaInfo.Number
                className={CN(className, 'multisig-deposit-info')}
                decimals={decimals}
                label={t('ui.Confirmations.WrappedTransactionInfoArea.multisigDeposit')}
                suffix={symbol}
                value={wrapTransactionInfo.depositAmount}
              />

              <MetaInfo.Number
                decimals={decimals}
                label={t('ui.Confirmations.WrappedTransactionInfoArea.networkFee')}
                suffix={symbol}
                value={wrapTransactionInfo?.networkFee || transaction.estimateFee?.value || 0}
              />

              <MetaInfo.Default
                className={className}
                label={t('ui.Confirmations.Detail.CallDataDetail.callData')}
              >
                {toShort(wrapTransactionInfo.callData, 5, 5)}
                <Button
                  className={'call-data-info-button'}
                  icon={ <Icon
                    customSize={'18px'}
                    phosphorIcon={Info}
                  />}
                  onClick={openDetailModal}
                  type={'ghost'}
                />
              </MetaInfo.Default>
            </>
          )
        }
      </MetaInfo>

      <Typography.Text className={CN(className, 'description-text')}>
        {descriptionContent}
      </Typography.Text>

      {<BaseDetailModal
        className={CN(className, 'call-data-detail-modal')}
        showFooter={false}
        title={t('ui.Confirmations.Detail.CallDataDetail.transactionDetails')}
      >
        <pre className='json'>
          {JSON.stringify(wrapTransactionInfo?.decodedCallData || '', null, 2)}
        </pre>
      </BaseDetailModal>}

      <SignableAccountProxySelectorModal
        accountItems={signableAccountProxyItems}
        address={transaction.address}
        chain={transaction.chain}
        onApply={onSelectSigner}
        onCancel={onCancelSelectSigner}
      />
    </>

  );
}

const WrappedTransactionInfoArea = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => {
  return {

    '&.wrapped-transaction-container': {
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

      '.__fee-editor-button': {
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
      }
    },

    '&.description-text': {
      fontSize: token.fontSize,
      marginTop: token.marginSM,
      color: token.colorTextLight4,
      textAlign: 'left'
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
    },

    '&.container-loading': {
      height: 188,
      '.loading-icon': {
        position: 'relative',
        top: '25%',
        fontSize: token.fontSizeSuper1 + 7,
        animation: 'spinner-loading 1s infinite linear'
      }
    }

  };
});

export default WrappedTransactionInfoArea;
