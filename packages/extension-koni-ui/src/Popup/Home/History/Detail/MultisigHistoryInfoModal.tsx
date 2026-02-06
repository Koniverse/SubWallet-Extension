// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicStatus, ExtrinsicType, NotificationType, TransactionHistoryItem } from '@subwallet/extension-base/background/KoniTypes';
import { MultisigTxType, PendingMultisigTx } from '@subwallet/extension-base/services/multisig-service';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { AccountProxyType } from '@subwallet/extension-base/types';
import { ApprovePendingTxRequest, CancelPendingTxRequest, ExecutePendingTxRequest } from '@subwallet/extension-base/types/multisig';
import { AlertModal } from '@subwallet/extension-koni-ui/components';
import { MULTISIG_HISTORY_INFO_MODAL } from '@subwallet/extension-koni-ui/constants';
import { MultisigTxToTitleMap } from '@subwallet/extension-koni-ui/constants/multisig';
import { useAlert, useGetAccountProxyByAddress, useGetBalance, useHandleSubmitTransaction, usePreCheckAction } from '@subwallet/extension-koni-ui/hooks';
import { approvePendingTx, cancelPendingTx, executePendingTx } from '@subwallet/extension-koni-ui/messaging';
import HistoryMultisigLayout from '@subwallet/extension-koni-ui/Popup/Home/History/Detail/parts/MultisigLayout';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { openInNewTab, reformatAddress } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, SwModal } from '@subwallet/react-ui';
import { ArrowCircleUpRight } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps & {
  onCancel: () => void,
  data: PendingMultisigTx,
  historyList?: TransactionHistoryItem[]
}
const alertModalId = 'multisig-confirmation-alert-modal';

function Component ({ className = '', data, historyList = [], onCancel }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [loading, setLoading] = useState(false);
  const checkAction = usePreCheckAction({ address: data?.currentSigner });
  const { onError, onSuccess } = useHandleSubmitTransaction();
  const { alertProps, closeAlert, openAlert } = useAlert(alertModalId);
  const accountSigner = useGetAccountProxyByAddress(data.currentSigner);
  const { error, isLoading: isBalanceLoading } = useGetBalance(data.chain, data.currentSigner);
  const originChainInfo = useMemo(() => data && chainInfoMap[data.chain], [chainInfoMap, data]);

  const isMultisigProcessing = useMemo(() => {
    if (!data || !historyList.length) {
      return false;
    }

    // TODO: Improve the algorithm later
    return historyList.some((tx) => {
      const isProcessing = tx.status === ExtrinsicStatus.PROCESSING ||
        tx.status === ExtrinsicStatus.SUBMITTING ||
        tx.status === ExtrinsicStatus.QUEUED;

      if (!isProcessing) {
        return false;
      }

      const type = tx.type;
      const isMultisigAction =
        type === ExtrinsicType.MULTISIG_APPROVE_TX ||
        type === ExtrinsicType.MULTISIG_EXECUTE_TX ||
        type === ExtrinsicType.MULTISIG_CANCEL_TX;

      if (!isMultisigAction) {
        return false;
      }

      const txCallHash = (tx.additionalInfo as { callHash?: string })?.callHash;
      const isMatchCallHash = txCallHash === data.callHash;
      const isMyAction = reformatAddress(tx.address) === reformatAddress(data.currentSigner);

      return isMatchCallHash && isMyAction && isMultisigAction;
    });
  }, [data, historyList]);

  const validateSignerAndExecute = useCallback((action: () => void) => {
    return () => {
      const signerIsMultisig = !!accountSigner?.accountType && accountSigner?.accountType === AccountProxyType.MULTISIG;

      if (signerIsMultisig) {
        openAlert({
          type: NotificationType.ERROR,
          content: t('ui.HISTORY.screen.HistoryDetail.MultisigHistoryInfoModal.selectedSignatoryIsMultisigWarning'),
          title: t('ui.HISTORY.screen.HistoryDetail.MultisigHistoryInfoModal.unableToSign'),
          okButton: {
            text: t('ui.HISTORY.screen.HistoryDetail.MultisigHistoryInfoModal.goToPolkadotJs'),
            onClick: () => {
              openInNewTab('https://polkadot.js.org/apps/')();
              closeAlert();
              onCancel();
            }
          },
          cancelButton: {
            text: t('ui.HISTORY.screen.HistoryDetail.MultisigHistoryInfoModal.dismiss'),
            onClick: () => {
              closeAlert();
              onCancel();
            }
          }
        });

        return;
      }

      action();
    };
  }, [accountSigner, openAlert, t, closeAlert, onCancel]);

  const handleAction = useCallback(
    async (action: () => Promise<SWTransactionResponse>) => {
      try {
        setLoading(true);
        const result = await action();

        if (result) {
          onSuccess(result);

          if (result.id) {
            navigate(`/transaction-done/${data.currentSigner}/${data.chain}/${result.id}`, { replace: true });
          }

          onCancel();
        }
      } catch (e) {
        onError(e as Error);
      } finally {
        setLoading(false);
      }
    },
    [data.chain, data.currentSigner, navigate, onCancel, onError, onSuccess]
  );

  const onReject = useCallback(() => {
    const cancelRequest: CancelPendingTxRequest = {
      address: data?.currentSigner,
      chain: data?.chain,
      multisigMetadata: {
        multisigAddress: data.multisigAddress,
        threshold: data.threshold,
        signers: data?.signerAddresses || []
      },
      timepoint: {
        height: data?.blockHeight,
        index: data?.extrinsicIndex
      },
      type: data?.multisigTxType,
      decodedCallData: data.decodedCallData,
      callHash: data?.callHash
    };

    return cancelPendingTx(cancelRequest);
  }, [data?.blockHeight, data?.callHash, data?.chain, data?.currentSigner, data.decodedCallData, data?.extrinsicIndex, data.multisigAddress, data?.multisigTxType, data?.signerAddresses, data.threshold]);

  const onApprove = useCallback(() => {
    const approveRequest: ApprovePendingTxRequest = {
      address: data?.currentSigner,
      chain: data?.chain,
      multisigMetadata: {
        multisigAddress: data.multisigAddress,
        threshold: data.threshold,
        signers: data?.signerAddresses || []
      },
      decodedCallData: data.decodedCallData,
      callHash: data?.callHash || '',
      timepoint: {
        height: data?.blockHeight,
        index: data?.extrinsicIndex
      },
      type: data?.multisigTxType
    };

    return approvePendingTx(approveRequest);
  }, [data?.blockHeight, data?.callHash, data?.chain, data?.currentSigner, data.decodedCallData, data?.extrinsicIndex, data.multisigAddress, data?.multisigTxType, data?.signerAddresses, data.threshold]);

  const onExecute = useCallback(() => {
    const executeRequest: ExecutePendingTxRequest = {
      address: data?.currentSigner,
      chain: data?.chain,
      multisigMetadata: {
        multisigAddress: data.multisigAddress,
        threshold: data.threshold,
        signers: data?.signerAddresses || []
      },
      timepoint: {
        height: data?.blockHeight,
        index: data?.extrinsicIndex
      },
      decodedCallData: data.decodedCallData,
      callHash: data?.callHash || '',
      call: data?.callData || '',
      type: data?.multisigTxType
    };

    return executePendingTx(executeRequest);
  }, [data?.blockHeight, data?.callData, data?.callHash, data?.chain, data?.currentSigner, data.decodedCallData, data?.extrinsicIndex, data.multisigAddress, data?.multisigTxType, data?.signerAddresses, data.threshold]);

  const _onReject = useCallback(() => {
    handleAction(onReject).catch(console.error);
  }, [handleAction, onReject]);
  const _onApprove = useCallback(() => {
    handleAction(onApprove).catch(console.error);
  }, [handleAction, onApprove]);
  const _onExecute = useCallback(() => {
    handleAction(onExecute).catch(console.error);
  }, [handleAction, onExecute]);

  const openBlockExplorer = useCallback(
    (link: string) => {
      return () => {
        window.open(link, '_blank');
      };
    },
    []
  );

  const formattedApprovals = useMemo(() => {
    if (!data?.approvals) {
      return [];
    }

    return data.approvals.map((address) => reformatAddress(address));
  }, [data?.approvals]);

  const getMultisigFooter = useMemo(() => {
    const currentSigner = reformatAddress(data?.currentSigner);
    const isInitiator = reformatAddress(data.depositor) === currentSigner;
    const isApproved = formattedApprovals.includes(currentSigner);
    const threshold = data?.threshold;
    const approvalCount = data.approvals.length;
    const thresholdReached = approvalCount >= threshold;
    const isLastSigner = approvalCount + 1 === threshold;
    const buttonLoading = loading || isBalanceLoading || isMultisigProcessing;
    const buttonDisabled = buttonLoading || !!error;

    return (
      <div className={'multisig-footer'}>
        {/* Cases 1 & 2: Transaction Initiator */}
        {isInitiator && (
          <>
            <Button
              block
              danger
              disabled={buttonDisabled}
              loading={buttonLoading}
              onClick={validateSignerAndExecute(checkAction(_onReject, ExtrinsicType.MULTISIG_CANCEL_TX))}
            >{t('ui.HISTORY.screen.HistoryDetail.MultisigHistoryInfoModal.reject')}</Button>
            {thresholdReached && (
              <Button
                block
                disabled={buttonDisabled}
                loading={buttonLoading}
                onClick={validateSignerAndExecute(checkAction(_onExecute, ExtrinsicType.MULTISIG_EXECUTE_TX))}
              >{t('ui.HISTORY.screen.HistoryDetail.MultisigHistoryInfoModal.execute')}</Button>
            )}
          </>
        )}

        {/* Handling for Signatories */}
        {!isInitiator && (
          <>
            {/* Cases 3 & 4: Not yet signed and threshold not reached */}
            {!isApproved && !thresholdReached && (
              <Button
                block
                disabled={buttonDisabled}
                loading={buttonLoading}
                onClick={isLastSigner ? validateSignerAndExecute(checkAction(_onExecute, ExtrinsicType.MULTISIG_EXECUTE_TX)) : validateSignerAndExecute(checkAction(_onApprove, ExtrinsicType.MULTISIG_APPROVE_TX))}
              >
                {isLastSigner ? t('ui.HISTORY.screen.HistoryDetail.MultisigHistoryInfoModal.approveAndExecute') : t('ui.HISTORY.screen.HistoryDetail.MultisigHistoryInfoModal.approve')}
              </Button>
            )}

            {/* Case 7: Signatory already approved but threshold not reached */}
            {isApproved && !thresholdReached && (
              <Button
                block
                disabled
              >{t('ui.HISTORY.screen.HistoryDetail.MultisigHistoryInfoModal.approved')}</Button>
            )}

            {/* Cases 5 & 6: Threshold reached but not yet executed */}
            {thresholdReached && (
              <Button
                block
                disabled={buttonDisabled}
                loading={buttonLoading}
                onClick={validateSignerAndExecute(checkAction(_onExecute, ExtrinsicType.MULTISIG_EXECUTE_TX))}
              >{t('ui.HISTORY.screen.HistoryDetail.MultisigHistoryInfoModal.execute')}</Button>
            )}
          </>
        )}
      </div>
    );
  }, [_onApprove, validateSignerAndExecute, isMultisigProcessing, _onExecute, _onReject, checkAction, data.approvals.length, data?.currentSigner, data.depositor, data?.threshold, error, formattedApprovals, isBalanceLoading, loading, t]);

  const modalFooter = useMemo(() => {
    if (!data) {
      return null;
    }

    const link = (data.extrinsicHash && data.extrinsicHash !== '') && getExplorerLink(originChainInfo, data.extrinsicHash, 'tx');

    return (
      <div className={'footer-container'}>
        <Button
          block
          className={'__view-explorer-button'}
          disabled={!link}
          icon={
            <Icon
              customSize={'22px'}
              phosphorIcon={ArrowCircleUpRight}
            />
          }
          onClick={openBlockExplorer(link || '')}
          size={'sm'}
          type={'ghost'}
        >
          {t('ui.HISTORY.screen.HistoryDetail.viewOnExplorer')}
        </Button>
        {getMultisigFooter}
      </div>
    );
  }, [data, originChainInfo, openBlockExplorer, t, getMultisigFooter]);

  useEffect(() => {
    if (error) {
      onError(new Error(error));
    }
  }, [error, onError]);

  return (
    <>
      <SwModal
        className={className}
        footer={modalFooter}
        id={MULTISIG_HISTORY_INFO_MODAL}
        onCancel={onCancel}
        title={t(MultisigTxToTitleMap[data?.multisigTxType || MultisigTxType.UNKNOWN])}
      >
        <div className={'__layout-container'}>
          {data && <HistoryMultisigLayout data={data} />}
        </div>
      </SwModal>
      {
        !!alertProps && (
          <AlertModal
            modalId={alertModalId}
            {...alertProps}
          />
        )
      }
    </>
  );
}

export const MultisigHistoryInfoModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-body': {
      marginBottom: 0,
      paddingBottom: 0
    },

    '.ant-sw-modal-footer': {
      border: 0
    },

    '.multisig-footer': {
      display: 'flex',
      gap: 8
    },

    '.footer-container': {
      '.__view-explorer-button': {
        height: 40,
        lineHeight: '40px',
        marginBottom: 16,
        '.ant-btn-content-wrapper': {
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          fontWeight: token.fontWeightStrong
        }
      }
    }
  });
});
