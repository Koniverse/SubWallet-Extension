// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { PendingMultisigTx } from '@subwallet/extension-base/services/multisig-service';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { ApprovePendingTxRequest, CancelPendingTxRequest, ExecutePendingTxRequest } from '@subwallet/extension-base/types/multisig';
import { MULTISIG_HISTORY_INFO_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useHandleSubmitTransaction, usePreCheckAction } from '@subwallet/extension-koni-ui/hooks';
import { approvePendingTx, cancelPendingTx, executePendingTx } from '@subwallet/extension-koni-ui/messaging';
import HistoryMultisigLayout from '@subwallet/extension-koni-ui/Popup/Home/History/Detail/parts/MultisigLayout';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { reformatAddress } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, SwModal } from '@subwallet/react-ui';
import { ArrowCircleUpRight } from 'phosphor-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps & {
  onCancel: () => void,
  data: PendingMultisigTx
}

function Component ({ className = '', data, onCancel }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [loading, setLoading] = useState(false);
  const checkAction = usePreCheckAction({ address: data?.currentSigner });
  const { onError, onSuccess } = useHandleSubmitTransaction();
  const handleAction = useCallback(async (promise: Promise<SWTransactionResponse>) => {
    try {
      setLoading(true);
      const result = await promise;

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
  }, [data.chain, data.currentSigner, navigate, onCancel, onError, onSuccess]);

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
    handleAction(onReject()).catch(console.error);
  }, [handleAction, onReject]);
  const _onApprove = useCallback(() => {
    handleAction(onApprove()).catch(console.error);
  }, [handleAction, onApprove]);
  const _onExecute = useCallback(() => {
    handleAction(onExecute()).catch(console.error);
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

    return (
      <div className={'multisig-footer'}>
        {/* Cases 1 & 2: Transaction Initiator */}
        {isInitiator && (
          <>
            <Button
              block
              danger
              disabled={loading}
              loading={loading}
              onClick={checkAction(_onReject, ExtrinsicType.MULTISIG_CANCEL_TX)}
            >{t('ui.HISTORY.screen.HistoryDetail.MultisigHistoryInfoModal.reject')}</Button>
            {thresholdReached && (
              <Button
                block
                disabled={loading}
                loading={loading}
                onClick={checkAction(_onExecute, ExtrinsicType.MULTISIG_EXECUTE_TX)}
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
                disabled={loading}
                loading={loading}
                onClick={isLastSigner ? checkAction(_onExecute, ExtrinsicType.MULTISIG_EXECUTE_TX) : checkAction(_onApprove, ExtrinsicType.MULTISIG_APPROVE_TX)}
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
                disabled={loading}
                onClick={checkAction(_onExecute, ExtrinsicType.MULTISIG_EXECUTE_TX)}
              >{t('ui.HISTORY.screen.HistoryDetail.MultisigHistoryInfoModal.execute')}</Button>
            )}
          </>
        )}
      </div>
    );
  }, [_onApprove, _onExecute, _onReject, checkAction, data.approvals.length, data?.currentSigner, data.depositor, data?.threshold, formattedApprovals, loading, t]);

  const modalFooter = useMemo(() => {
    if (!data) {
      return null;
    }

    const originChainInfo = chainInfoMap[data.chain];

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
  }, [data, chainInfoMap, openBlockExplorer, t, getMultisigFooter]);

  return (
    <SwModal
      className={className}
      footer={modalFooter}
      id={MULTISIG_HISTORY_INFO_MODAL}
      onCancel={onCancel}
      title={t('ui.HISTORY.screen.HistoryDetail.MultisigHistoryInfoModal.sendToken')}
    >
      <div className={'__layout-container'}>
        {data && <HistoryMultisigLayout data={data} />}
      </div>
    </SwModal>
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
