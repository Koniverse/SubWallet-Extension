// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SigningRequest } from '@subwallet/extension-base/background/types';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { AccountItemWithProxyAvatar, ConfirmationGeneralInfo, ViewDetailIcon } from '@subwallet/extension-koni-ui/components';
import { useGetAccountByAddress, useGetNativeTokenBasicInfo, useMetadata, useOpenDetailModal, useParseSubstrateRequestPayload } from '@subwallet/extension-koni-ui/hooks';
import { enableChain } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isRawPayload, isSubstrateMessage, noop } from '@subwallet/extension-koni-ui/utils';
import { Button } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import { SignerPayloadJSON } from '@polkadot/types/types';

import useGetChainInfoByGenesisHash from '../../../../hooks/chain/useGetChainInfoByGenesisHash';
import { BaseDetailModal, SubstrateExtrinsic, SubstrateMessageDetail, SubstrateSignArea } from '../../parts';
import { MultisigSignerSelector } from '../Selector';

interface Props extends ThemeProps {
  request: SigningRequest;
}

function Component ({ className, request }: Props) {
  const { address } = request;
  const { t } = useTranslation();
  const account = useGetAccountByAddress(address);
  const [disableMultisigApproval, setDisableMultisigApproval] = useState(true);

  const { chainInfoMap, chainStateMap } = useSelector((root: RootState) => root.chainStore);

  const genesisHash = useMemo(() => {
    const _payload = request.request.payload;

    return isRawPayload(_payload)
      ? (account?.genesisHash || chainInfoMap.polkadot.substrateInfo?.genesisHash || '')
      : _payload.genesisHash;
  }, [account, chainInfoMap, request]);

  const { chain } = useMetadata(genesisHash);
  const chainInfo = useGetChainInfoByGenesisHash(genesisHash);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chainInfo?.slug || '');
  const { payload, payloadError } = useParseSubstrateRequestPayload(chain, request.request);
  const onClickDetail = useOpenDetailModal();

  const isMessage = useMemo(() => !payloadError && isSubstrateMessage(payload), [payload, payloadError]);
  // True when current account is a multisig account.
  const isMultisigAccount = useMemo(() => !!account?.isMultisig, [account?.isMultisig]);
  // Multisig does not support direct message signing.
  const isMultisigMessageSigning = useMemo(() => isMultisigAccount && isMessage, [isMessage, isMultisigAccount]);
  // Multisig transaction signing must be wrapped before approval.
  const isMultisigWrappedTransactionSigning = useMemo(() => isMultisigAccount && !isMessage && !payloadError, [isMessage, isMultisigAccount, payloadError]);
  const chainSlug = useMemo(() => chainInfo?.slug || '', [chainInfo?.slug]);
  const accountTitle = useMemo(() => t('ui.ACCOUNT.components.AccountProxy.TypeTag.multisigAccount'), [t]);

  const disableApproval = useMemo(() => {
    if (isMultisigMessageSigning) {
      return true;
    }

    if (!isMultisigAccount) {
      return false;
    }

    return disableMultisigApproval;
  }, [disableMultisigApproval, isMultisigMessageSigning, isMultisigAccount]);

  const initialCallData = useMemo(() => {
    if (isRawPayload(request.request.payload)) {
      return null;
    }

    return request.request.payload.method || null;
  }, [request.request.payload]);

  useEffect(() => {
    if (!isMessage && chainInfo) {
      const chainState = chainStateMap[chainInfo.slug];

      !chainState.active && enableChain(chainInfo.slug, false)
        .then(noop)
        .catch(console.error);
    }
  }, [chainStateMap, chainInfo, isMessage]);

  useEffect(() => {
    if (isMultisigAccount) {
      setDisableMultisigApproval(true);
    }
  }, [isMultisigAccount, request.id]);

  const confirmationAccountNode = useMemo(() => {
    if (payloadError) {
      return (
        <AccountItemWithProxyAvatar
          account={account}
          accountAddress={address}
          className='account-item'
          isSelected={true}
        />
      );
    }

    if (isMultisigAccount && !isMessage) {
      return (
        <MultisigSignerSelector
          chainSlug={chainSlug}
          decimals={decimals}
          initialCallData={initialCallData}
          onDisableApprovalChange={setDisableMultisigApproval}
          onOpenCallDataDetail={onClickDetail}
          requestId={request.id}
          symbol={symbol}
          targetAddress={address}
        />
      );
    }

    return (
      <>
        <AccountItemWithProxyAvatar
          account={account}
          accountAddress={address}
          className={CN('account-item', { '-unsupported': isMultisigMessageSigning })}
          isSelected={true}
          showUnselectIcon={isMultisigMessageSigning}
        />

        <div>
          <Button
            icon={<ViewDetailIcon />}
            onClick={onClickDetail}
            size='xs'
            type='ghost'
          >
            {t('ui.DAPP.Confirmations.Message.Sign.viewDetails')}
          </Button>
        </div>
      </>
    );
  }, [account, address, chainSlug, decimals, initialCallData, isMessage, isMultisigAccount, isMultisigMessageSigning, onClickDetail, payloadError, request.id, symbol, t]);

  return (
    <>
      <div className={CN('confirmation-content', className)}>
        <ConfirmationGeneralInfo request={request} />
        <div className='title'>
          {t('ui.DAPP.Confirmations.Message.Sign.signatureRequest')}
        </div>
        <div className='description'>
          {isMultisigMessageSigning
            ? (
              <Trans
                components={{
                  highlight: (
                    <span className='highlight' />
                  )
                }}
                i18nKey={detectTranslate('ui.DAPP.Confirmations.Message.NotSupport.featureNotAvailableForAccountType')}
                values={{ accountTitle }}
              />
            )
            : !isMultisigAccount
              ? t('ui.DAPP.Confirmations.Message.Sign.approvingRequestWithAccount')
              : t('ui.DAPP.Confirmations.Message.Sign.selectSignatory')}
        </div>
        {confirmationAccountNode}

      </div>
      <SubstrateSignArea
        disableApproval={disableApproval}
        id={request.id}
        isInternal={request.isInternal}
        isWrapTransaction={isMultisigWrappedTransactionSigning}
        request={request.request}
      />
      {!payloadError && (
        <BaseDetailModal
          title={isMessage ? t('ui.DAPP.Confirmations.Message.Sign.messageDetails') : t('ui.DAPP.Confirmations.Message.Sign.transactionDetails')}
        >
          {isMessage
            ? (
              <SubstrateMessageDetail bytes={payload as string} />
            )
            : (
              <SubstrateExtrinsic
                accountName={account?.name}
                address={address}
                payload={payload as ExtrinsicPayload}
                request={request.request.payload as SignerPayloadJSON}
              />
            )
          }
        </BaseDetailModal>
      )}
    </>
  );
}

const SignConfirmation = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
  '.highlight': {
    color: token.colorWarning
  },

  '.account-item.-unsupported': {
    cursor: 'not-allowed',
    opacity: token.opacityDisable,
    background: token.colorBgSecondary,

    '&:hover': {
      cursor: 'not-allowed'
    }
  },

  '.account-list': {
    '.__prop-label': {
      marginRight: token.marginMD,
      width: '50%',
      float: 'left'
    }
  }
}));

export default SignConfirmation;
