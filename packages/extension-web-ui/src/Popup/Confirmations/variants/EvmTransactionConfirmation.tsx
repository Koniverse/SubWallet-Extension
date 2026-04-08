// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ConfirmationsQueueItem, EvmSendTransactionRequest } from '@subwallet/extension-base/background/KoniTypes';
import { AlertBox, ConfirmationGeneralInfo, MetaInfo, ViewDetailIcon } from '@subwallet/extension-web-ui/components';
import { useGetAccountByAddress, useGetChainInfoByChainId, useOpenDetailModal } from '@subwallet/extension-web-ui/hooks';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { EvmSignatureSupportType, ThemeProps } from '@subwallet/extension-web-ui/types';
import { Button } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { BaseDetailModal, EvmSignArea, EvmTransactionDetail } from '../parts';

interface Props extends ThemeProps {
  type: EvmSignatureSupportType
  request: ConfirmationsQueueItem<EvmSendTransactionRequest>
}

const convertToBigN = (num: EvmSendTransactionRequest['value']): string | number | undefined => {
  if (typeof num === 'object') {
    return num.toNumber();
  } else {
    return num;
  }
};

function Component ({ className, request, type }: Props) {
  const { id, payload: { address, chainId, errors, to } } = request;
  const { t } = useTranslation();
  const account = useGetAccountByAddress(address);

  const { transactionRequest } = useSelector((state: RootState) => state.requestState);

  const transaction = useMemo(() => transactionRequest[id], [transactionRequest, id]);

  const chainInfo = useGetChainInfoByChainId(chainId);
  const recipientAddress = to;
  const recipient = useGetAccountByAddress(recipientAddress);
  const onClickDetail = useOpenDetailModal();

  const amount = useMemo((): number => {
    return new BigN(convertToBigN(request.payload.value) || 0).toNumber();
  }, [request.payload.value]);

  return (
    <>
      <div className={CN('confirmation-content', className)}>
        <ConfirmationGeneralInfo request={request} />
        <div className='title'>
          {t('ui.EVM_TRANSACTION_CONFIRMATION.Popup.Confirmations.variants.EvmTransactionConfirmation.transactionRequest')}
        </div>
        <MetaInfo>
          {
            (!request.payload.isToContract || amount !== 0) &&
            (
              <MetaInfo.Number
                decimals={chainInfo?.evmInfo?.decimals}
                label={t('ui.EVM_TRANSACTION_CONFIRMATION.Popup.Confirmations.variants.EvmTransactionConfirmation.amount')}
                suffix={chainInfo?.evmInfo?.symbol}
                value={amount}
              />
            )
          }
          <MetaInfo.Account
            address={address}
            className={'account-info-item'}
            label={t('ui.EVM_TRANSACTION_CONFIRMATION.Popup.Confirmations.variants.EvmTransactionConfirmation.fromAccount')}
            name={account?.name || ''}
          />
          {(recipientAddress || recipient?.address) && <MetaInfo.Account
            address={recipient?.address || recipientAddress || ''}
            className='to-account'
            label={request.payload.isToContract ? t('ui.EVM_TRANSACTION_CONFIRMATION.Popup.Confirmations.variants.EvmTransactionConfirmation.toContract') : t('ui.EVM_TRANSACTION_CONFIRMATION.Popup.Confirmations.variants.EvmTransactionConfirmation.toAccount')}
            name={recipient?.name}
          />}
          {request.payload.estimateGas &&
              <MetaInfo.Number
                decimals={chainInfo?.evmInfo?.decimals}
                label={t('ui.EVM_TRANSACTION_CONFIRMATION.Popup.Confirmations.variants.EvmTransactionConfirmation.estimatedGas')}
                suffix={chainInfo?.evmInfo?.symbol}
                value={request.payload.estimateGas || '0'}
              />}
        </MetaInfo>
        {!!transaction?.estimateFee?.tooHigh && (
          <AlertBox
            className='network-box'
            description={t('ui.EVM_TRANSACTION_CONFIRMATION.Popup.Confirmations.variants.EvmTransactionConfirmation.gasFeesOnAreHighDueToHighDemandsSoGasEstimatesAreLessAccurate', { replace: { networkName: chainInfo?.name } })}
            title={t('ui.EVM_TRANSACTION_CONFIRMATION.Popup.Confirmations.variants.EvmTransactionConfirmation.payAttention')}
            type='warning'
          />
        )}
        {(!errors || errors.length === 0) && <div>
          <Button
            icon={<ViewDetailIcon />}
            onClick={onClickDetail}
            size='xs'
            type='ghost'
          >
            {t('ui.EVM_TRANSACTION_CONFIRMATION.Popup.Confirmations.variants.EvmTransactionConfirmation.viewDetails')}
          </Button>
        </div>
        }
      </div>
      <EvmSignArea
        id={id}
        payload={request}
        type={type}
      />
      {(!errors || errors.length === 0) &&
        <BaseDetailModal
          title={t('ui.EVM_TRANSACTION_CONFIRMATION.Popup.Confirmations.variants.EvmTransactionConfirmation.transactionDetails')}
        >
          <EvmTransactionDetail
            accountName={account?.name}
            address={address}
            request={request.payload}
          />
        </BaseDetailModal>
      }
    </>
  );
}

const EvmTransactionConfirmation = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
  '.account-list': {
    '.__prop-label': {
      marginRight: token.marginMD,
      width: '50%',
      float: 'left'
    }
  },

  '.to-account': {
    marginTop: token.margin - 2
  },

  '.__label': {
    textAlign: 'left'
  },

  '.account-info-item, .to-account': {
    '.__account-item-address': {
      textAlign: 'right'
    }
  }
}));

export default EvmTransactionConfirmation;
