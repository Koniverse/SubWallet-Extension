// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {PendingMultisigTx} from '@subwallet/extension-base/services/multisig-service';
import {MULTISIG_HISTORY_INFO_MODAL} from '@subwallet/extension-koni-ui/constants';
import HistoryMultisigLayout from '@subwallet/extension-koni-ui/Popup/Home/History/Detail/parts/MultisigLayout';
import {ThemeProps} from '@subwallet/extension-koni-ui/types';
import {Button, Icon, SwModal} from '@subwallet/react-ui';
import React, {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {reformatAddress} from "@subwallet/extension-base/utils";
import {ArrowCircleUpRight} from "phosphor-react";
import {getExplorerLink} from "@subwallet/extension-base/services/transaction-service/utils";
import {approvePendingTx, cancelPendingTx, executePendingTx} from "@subwallet/extension-koni-ui/messaging";
import {useSelector} from "react-redux";
import {RootState} from "@subwallet/extension-koni-ui/stores";

type Props = ThemeProps & {
  onCancel: () => void,
  data: PendingMultisigTx
}

function Component ({ className = '', data, onCancel }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [loading, setLoading] = useState(false);

  const otherSignatories = useMemo(() => {
    if (!data?.signerAddresses || !data?.currentSigner) {
      return [];
    }

    return data?.signerAddresses.filter(
      (signer) => reformatAddress(signer) !== reformatAddress(data.currentSigner)
    );
  }, [data?.signerAddresses, data?.currentSigner]);

  const handleAction = useCallback(async (action: () => Promise<any>) => {
    try {
      setLoading(true);
      const result = await action();
      if (result) {
        onCancel();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [onCancel]);

  const onReject = useCallback(() => {
    return cancelPendingTx({
      address: data?.currentSigner,
      chain: data?.chain,
      threshold: data.threshold,
      otherSignatories: otherSignatories,
      timepoint:  {
        height: data?.blockHeight,
        index: data?.extrinsicIndex
      },
      callHash: data?.callHash
    })
  }, []);

  const onApprove = useCallback(() => {
    return approvePendingTx({
      address: data?.currentSigner,
      chain: data?.chain,
      threshold: data.threshold,
      otherSignatories: otherSignatories,
      // todo: Why is the returned data marked as optional, but when it’s passed down it becomes required?
      // Should we recheck the callData interface?
      callHash: data?.callHash || '',
      timepoint: {
        height: data?.blockHeight,
        index: data?.extrinsicIndex
      },
      maxWeight: {}
    })
  }, []);

  const onExecute = useCallback(() => {
    return executePendingTx({
      address: data?.currentSigner,
      chain: data?.chain,
      threshold: data.threshold,
      otherSignatories: otherSignatories,
      timepoint: {
        height: data?.blockHeight,
        index: data?.extrinsicIndex
      },
      call: data?.callData || '',
      maxWeight: {}
    })
  }, []);

  const _onReject = useCallback(() => handleAction(onReject), [handleAction, onReject]);
  const _onApprove = useCallback(() => handleAction(onApprove), [handleAction, onApprove]);
  const _onExecute = useCallback(() => handleAction(onExecute), [handleAction, onExecute]);

  const openBlockExplorer = useCallback(
    (link: string) => {
      return () => {
        window.open(link, '_blank');
      };
    },
    []
  );

  const formattedApprovals = useMemo(() => {
    if (!data?.approvals) return [];
    return data.approvals.map((address) => reformatAddress(address));
  }, [data?.approvals]);

  const getMultisigFooter = (data: PendingMultisigTx) => {
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
              onClick={_onReject}
              loading={loading}
            >{t('Reject')}</Button>
            {thresholdReached && (
              <Button
                block
                loading={loading}
                disabled={loading}
                onClick={_onExecute}
              >{t('Execute')}</Button>
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
                onClick={_onApprove}
                loading={loading}
                disabled={loading}
              >
                {isLastSigner ? t('Approve & Execute') : t('Approve')}
              </Button>
            )}

            {/* Case 7: Signatory already approved but threshold not reached */}
            {isApproved && !thresholdReached && (
              <Button
                block
                disabled
              >{t('Approved')}</Button>
            )}

            {/* Cases 5 & 6: Threshold reached but not yet executed */}
            {thresholdReached && (
              <Button
                block
                onClick={_onExecute}
                disabled={loading}
              >{t('Execute')}</Button>
            )}
          </>
        )}
      </div>
    );
  };

  const modalFooter = useMemo(() => {
    if (!data) {
      return null;
    }
    let originChainInfo = chainInfoMap[data.chain];

    let link = (data.extrinsicHash && data.extrinsicHash !== '') && getExplorerLink(originChainInfo, data.extrinsicHash, 'tx');

    {/* Explorer Button: Always available if link exists */}
    return (
      <div className={'footer-container'}>
        <Button
          block
          disabled={!link}
          icon={
            <Icon
              phosphorIcon={ArrowCircleUpRight}
              customSize={'22px'}
            />
          }
          className={'__view-explorer-button'}
          type={'ghost'}
          onClick={openBlockExplorer(link || '')}
          size={'sm'}
        >
          {t('ui.HISTORY.screen.HistoryDetail.viewOnExplorer')}
        </Button>
        {getMultisigFooter(data)}
      </div>
      )
  }, [data, t, onCancel, loading]);

  return (
    <SwModal
      className={className}
      footer={modalFooter}
      id={MULTISIG_HISTORY_INFO_MODAL}
      onCancel={onCancel}
      title={'Send token'}
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
      marginBottom: 0
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
