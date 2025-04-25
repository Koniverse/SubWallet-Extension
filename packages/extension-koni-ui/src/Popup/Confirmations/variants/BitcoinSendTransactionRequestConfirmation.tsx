// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { BitcoinSendTransactionRequest, ConfirmationsQueueItem } from '@subwallet/extension-base/background/KoniTypes';
import { BitcoinFeeDetail, RequestSubmitTransferWithId, ResponseSubscribeTransferConfirmation, TransactionFee } from '@subwallet/extension-base/types';
import { getDomainFromUrl } from '@subwallet/extension-base/utils';
import { BitcoinFeeSelector, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { RenderFieldNodeParams } from '@subwallet/extension-koni-ui/components/Field/TransactionFee/BitcoinFeeSelector';
import { useGetAccountByAddress, useNotification } from '@subwallet/extension-koni-ui/hooks';
import { cancelSubscription, subscribeTransferWhenConfirmation } from '@subwallet/extension-koni-ui/messaging';
import { BitcoinSignArea } from '@subwallet/extension-koni-ui/Popup/Confirmations/parts';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { BitcoinSignatureSupportType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ActivityIndicator, Button, Icon, Number } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { PencilSimpleLine } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

interface Props extends ThemeProps {
  type: BitcoinSignatureSupportType
  request: ConfirmationsQueueItem<BitcoinSendTransactionRequest>
}

const convertToBigN = (num: BitcoinSendTransactionRequest['value']): string | number | undefined => {
  if (typeof num === 'object') {
    return num.toNumber();
  } else {
    return num;
  }
};

function Component ({ className, request, type }: Props) {
  const { id, payload: { account, networkKey, to, tokenSlug, value } } = request;
  const { t } = useTranslation();
  const transferAmountValue = useMemo(() => value?.toString() as string, [value]);
  const fromValue = useMemo(() => account.address, [account.address]);
  const toValue = useMemo(() => to ? to[0].address : '', [to]);
  const chainValue = useMemo(() => networkKey as string, [networkKey]);
  const assetValue = useMemo(() => tokenSlug as string, [tokenSlug]);

  const [transactionInfo, setTransactionInfo] = useState<RequestSubmitTransferWithId>({
    id,
    chain: networkKey as string,
    from: account.address,
    to: toValue,
    tokenSlug: tokenSlug as string,
    transferAll: false,
    value: value?.toString() || '0'
  });
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [transferInfo, setTransferInfo] = useState<ResponseSubscribeTransferConfirmation | undefined>();
  const [transactionFeeInfo, setTransactionFeeInfo] = useState<TransactionFee | undefined>(undefined);
  const [isErrorTransaction, setIsErrorTransaction] = useState(false);
  const notify = useNotification();
  const assetRegistry = useSelector((root: RootState) => root.assetRegistry.assetRegistry);

  const assetInfo: _ChainAsset | undefined = useMemo(() => {
    return assetRegistry[assetValue];
  }, [assetRegistry, assetValue]);

  const recipient = useGetAccountByAddress(toValue);

  // console.log(transactionRequest);
  const amount = useMemo((): number => {
    return new BigN(convertToBigN(request.payload.value) || 0).toNumber();
  }, [request.payload.value]);

  const renderFeeSelectorNode = useCallback((params: RenderFieldNodeParams) => {
    return (
      <MetaInfo.Default
        className='__fee-editor'
        label={t('Estimated fee')}
      >
        {params.isLoading
          ? (
            <div className={'__fee-editor-loading-wrapper'}>
              <ActivityIndicator size={20} />
            </div>
          )
          : (
            <div className={'__fee-editor-value-wrapper'}>
              <Number
                className={'__fee-editor-value'}
                decimal={params.feeInfo.decimals}
                size={14}
                suffix={params.feeInfo.symbol}
                value={params.feeInfo.value}
              />
              <Button
                disabled={params.disableEdit}
                icon={
                  <Icon
                    phosphorIcon={PencilSimpleLine}
                    size='sm'
                  />
                }
                onClick={params.onClickEdit}
                size='xs'
                type='ghost'
              />
            </div>
          )}
      </MetaInfo.Default>
    );
  }, [t]);

  useEffect(() => {
    setTransactionInfo((prevState) => ({ ...prevState, ...transactionFeeInfo }));
  }, [transactionFeeInfo]);

  useEffect(() => {
    let cancel = false;
    let id = '';
    let timeout: NodeJS.Timeout;

    setIsFetchingInfo(true);

    const callback = (transferInfo: ResponseSubscribeTransferConfirmation) => {
      if (transferInfo.error) {
        notify({
          message: t(transferInfo.error),
          type: 'error',
          duration: 8
        });
        setIsErrorTransaction(true);
      } else if (!cancel) {
        setTransferInfo(transferInfo);
        id = transferInfo.id;
      } else {
        cancelSubscription(transferInfo.id).catch(console.error);
      }
    };

    if (fromValue && assetValue) {
      timeout = setTimeout(() => {
        subscribeTransferWhenConfirmation({
          address: fromValue,
          chain: chainValue,
          token: assetValue,
          destChain: chainValue,
          feeOption: transactionFeeInfo?.feeOption,
          feeCustom: transactionFeeInfo?.feeCustom,
          value: transferAmountValue || '0',
          transferAll: false,
          to: toValue
        }, callback)
          .then(callback)
          .catch((e) => {
            console.error(e);
            notify({
              message: t(e),
              type: 'error',
              duration: 8
            });
            setIsErrorTransaction(true);
            setTransferInfo(undefined);
          })
          .finally(() => {
            setIsFetchingInfo(false);
          });
      }, 100);
    }

    return () => {
      cancel = true;
      clearTimeout(timeout);
      id && cancelSubscription(id).catch(console.error);
    };
  }, [assetRegistry, assetValue, chainValue, fromValue, toValue, transactionFeeInfo, transferAmountValue, notify, t]);

  return (
    <>
      <div className={CN('confirmation-content', className)}>
        <div className={'__origin-url'}>{getDomainFromUrl(request.url)}</div>

        <MetaInfo hasBackgroundWrapper>
          <MetaInfo.Account
            address={account.address}
            label={t('From account')}
            name={account.name}
          />
          <MetaInfo.Account
            address={recipient?.address || toValue || ''}
            className='to-account'
            label={t('To account')}
            name={recipient?.name}
          />

          <MetaInfo.Chain
            chain={chainValue}
            label={t('Network')}
          />
        </MetaInfo>

        <MetaInfo hasBackgroundWrapper>
          <MetaInfo.Number
            decimals={assetInfo?.decimals || 0}
            label={t('Amount')}
            suffix={assetInfo?.symbol || ''}
            value={amount}
          />

          {!isErrorTransaction && <BitcoinFeeSelector
            className={'__bitcoin-fee-selector'}
            feeDetail={transferInfo?.feeOptions as BitcoinFeeDetail | undefined}
            isLoading={isFetchingInfo}
            onSelect={setTransactionFeeInfo}
            renderFieldNode={renderFeeSelectorNode}
            tokenSlug={assetValue}
          />}
        </MetaInfo>

        {/* {!!transaction.estimateFee?.tooHigh && ( */}
        {/*  <AlertBox */}
        {/*    className='network-box' */}
        {/*    description={t('Gas fees on {{networkName}} are high due to high demands, so gas estimates are less accurate.', { replace: { networkName: chainInfo?.name } })} */}
        {/*    title={t('Pay attention!')} */}
        {/*    type='warning' */}
        {/*  /> */}
        {/* )} */}
      </div>
      <BitcoinSignArea
        canSign={!isFetchingInfo && !isErrorTransaction}
        editedPayload={transactionInfo}
        id={id}
        payload={request}
        type={type}
      />
    </>
  );
}

const BitcoinSendTransactionRequestConfirmation = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
  '&.confirmation-content.confirmation-content': {
    display: 'block'
  },

  '.__origin-url': {
    marginBottom: token.margin
  },

  '.__fee-editor-loading-wrapper': {
    minWidth: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  '.__fee-editor.__fee-editor.__fee-editor': {
    marginTop: 4,
    marginRight: -10
  },

  '.__fee-editor-value-wrapper': {
    display: 'flex',
    alignItems: 'center'
  },

  '.account-list': {
    '.__prop-label': {
      marginRight: token.marginMD,
      width: '50%',
      float: 'left'
    }
  },

  '.network-box': {
    marginTop: token.margin
  },

  '.to-account': {
    marginTop: token.margin - 2
  },

  '.__label': {
    textAlign: 'left'
  }
}));

export default BitcoinSendTransactionRequestConfirmation;
