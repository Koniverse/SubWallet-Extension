// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { BitcoinSendTransactionRequest, ConfirmationsQueueItem } from '@subwallet/extension-base/background/KoniTypes';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { ResponseSubscribeTransferConfirmation } from '@subwallet/extension-base/types/balance/transfer';
import { BN_ZERO, getDomainFromUrl } from '@subwallet/extension-base/utils';
import { MetaInfo } from '@subwallet/extension-web-ui/components';
import { useGetAccountByAddress, useNotification } from '@subwallet/extension-web-ui/hooks';
import { cancelSubscription, subscribeTransferWhenConfirmation } from '@subwallet/extension-web-ui/messaging';
import { BitcoinSignArea } from '@subwallet/extension-web-ui/Popup/Confirmations/parts';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { BitcoinSignatureSupportType, ThemeProps } from '@subwallet/extension-web-ui/types';
import { ActivityIndicator, Number } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
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
  const { id, payload: { address, errors, networkKey, to, tokenSlug, value } } = request;
  const { t } = useTranslation();
  const account = useGetAccountByAddress(address);
  const transferAmountValue = useMemo(() => value?.toString() as string, [value]);
  const fromValue = useMemo(() => address, [address]);
  const toValue = useMemo(() => to ? to[0].address : '', [to]);
  const chainValue = useMemo(() => networkKey as string, [networkKey]);
  const assetValue = useMemo(() => tokenSlug as string, [tokenSlug]);
  const [transactionFeeValue, setTransactionFeeValue] = useState<BigN>(BN_ZERO);
  const transactionInfo = useMemo(() => ({
    id,
    chain: networkKey as string,
    from: address,
    to: toValue,
    tokenSlug: tokenSlug as string,
    transferAll: false,
    value: value?.toString() || '0'
  }), [id, networkKey, address, toValue, tokenSlug, value]);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [transferInfo, setTransferInfo] = useState<ResponseSubscribeTransferConfirmation | undefined>();
  const [isErrorTransaction, setIsErrorTransaction] = useState(false);
  const notify = useNotification();
  const assetRegistry = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const tokenAsset = useMemo(() => {
    return (tokenSlug && assetRegistry[tokenSlug]) || undefined;
  }, [assetRegistry, tokenSlug]);

  const decimals = useMemo(() => _getAssetDecimals(tokenAsset), [tokenAsset]);
  const symbol = useMemo(() => _getAssetSymbol(tokenAsset), [tokenAsset]);

  const assetInfo: _ChainAsset | undefined = useMemo(() => {
    return assetRegistry[assetValue];
  }, [assetRegistry, assetValue]);

  const recipient = useGetAccountByAddress(toValue);
  const amount = useMemo((): number => {
    return new BigN(convertToBigN(request.payload.value) || 0).toNumber();
  }, [request.payload.value]);

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
        setTransferInfo(transferInfo);
        cancelSubscription(transferInfo.id).catch(console.error);
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
          // feeOption: transactionFeeInfo?.feeOption,
          // feeCustom: transactionFeeInfo?.feeCustom,
          value: transferAmountValue || '0',
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
            clearTimeout(timeout);
            id && cancelSubscription(id).catch(console.error);
            setIsFetchingInfo(false);
          });
      }, 100);
    }

    return () => {
      cancel = true;
      clearTimeout(timeout);
      id && cancelSubscription(id).catch(console.error);
    };
  }, [assetRegistry, assetValue, chainValue, fromValue, toValue, transferAmountValue, notify, t]);

  useEffect(() => {
    if (transferInfo) {
      setTransactionFeeValue(new BigN(transferInfo.feeOptions.estimatedFee));
    }
  }, [transferInfo]);

  return (
    <>
      <div className={CN('confirmation-content', className)}>
        <div className={'__origin-url'}>{getDomainFromUrl(request.url)}</div>

        <MetaInfo hasBackgroundWrapper>
          <MetaInfo.Account
            address={address}
            label={t('From account')}
            name={account?.name}
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

          <MetaInfo.Default
            className='__fee-editor'
            label={t('Estimated fee')}
          >
            {isFetchingInfo || !transferInfo
              ? (
                <div className={'__fee-editor-loading-wrapper'}>
                  <ActivityIndicator size={20} />
                </div>
              )
              : (
                <div className={'__fee-editor-value-wrapper'}>
                  <Number
                    className={'__fee-editor-value'}
                    decimal={decimals}
                    size={14}
                    suffix={symbol}
                    value={transactionFeeValue}
                  />
                  {/* <Button */}
                  {/*   disabled={params.disableEdit} */}
                  {/*   icon={ */}
                  {/*     <Icon */}
                  {/*       phosphorIcon={PencilSimpleLine} */}
                  {/*       size='sm' */}
                  {/*     /> */}
                  {/*   } */}
                  {/*   onClick={params.onClickEdit} */}
                  {/*   size='xs' */}
                  {/*   type='ghost' */}
                  {/* /> */}
                </div>
              )}
          </MetaInfo.Default>
        </MetaInfo>
      </div>
      <BitcoinSignArea
        canSign={!isFetchingInfo && !isErrorTransaction && !errors?.length}
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

  '.__account-item-address': {
    textAlign: 'right'
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
