// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { SigningRequest } from '@subwallet/extension-base/background/types';
import { AccountItemWithProxyAvatar, ConfirmationGeneralInfo, ViewDetailIcon, WrappedTransactionSignerSelectorModal } from '@subwallet/extension-koni-ui/components';
import { WRAPPED_TRANSACTION_SIGNER_SELECTOR_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetAccountByAddress, useGetWrappedTransactionSigners, useMetadata, useOpenDetailModal, useParseSubstrateRequestPayload } from '@subwallet/extension-koni-ui/hooks';
import { enableChain } from '@subwallet/extension-koni-ui/messaging';
import { prepareMultisigSignRequest } from '@subwallet/extension-koni-ui/messaging/transaction/multisig';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps, WrappedTransactionSigner } from '@subwallet/extension-koni-ui/types';
import { isRawPayload, isSubstrateMessage, noop } from '@subwallet/extension-koni-ui/utils';
import { Button, ModalContext } from '@subwallet/react-ui';
import { useQuery } from '@tanstack/react-query';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import { SignerPayloadJSON } from '@polkadot/types/types';

import useGetChainInfoByGenesisHash from '../../../../hooks/chain/useGetChainInfoByGenesisHash';
import { BaseDetailModal, SubstrateExtrinsic, SubstrateMessageDetail, SubstrateSignArea } from '../../parts';
import MultisigSignerSelector from '../Selector/MultisigSignerSelector';

interface Props extends ThemeProps {
  request: SigningRequest;
}

function Component ({ className, request }: Props) {
  const { address } = request;
  const { t } = useTranslation();
  const account = useGetAccountByAddress(address);
  const [signerSelected, setSignerSelected] = useState<WrappedTransactionSigner | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [wrapError, setWrapError] = useState<string | null>(null);
  const { activeModal } = useContext(ModalContext);
  const getWrappedTransactionSigners = useGetWrappedTransactionSigners();
  const signerAccount = useGetAccountByAddress(signerSelected?.address || '');

  const { chainInfoMap, chainStateMap } = useSelector((root: RootState) => root.chainStore);

  const genesisHash = useMemo(() => {
    const _payload = request.request.payload;

    return isRawPayload(_payload)
      ? (account?.genesisHash || chainInfoMap.polkadot.substrateInfo?.genesisHash || '')
      : _payload.genesisHash;
  }, [account, chainInfoMap, request]);

  const { chain } = useMetadata(genesisHash);
  const chainInfo = useGetChainInfoByGenesisHash(genesisHash);
  const { payload } = useParseSubstrateRequestPayload(chain, request.request);
  const onClickDetail = useOpenDetailModal();

  const isMessage = useMemo(() => isSubstrateMessage(payload), [payload]);
  const isMultisigSignRequest = useMemo(() => !!account?.isMultisig && !isMessage, [account?.isMultisig, isMessage]);
  const chainSlug = useMemo(() => chainInfo?.slug || '', [chainInfo?.slug]);

  const { data: signerItems, isLoading: isSignerItemsLoading } = useQuery<WrappedTransactionSigner[]>({
    queryKey: ['multisig-sign-request', request.id, address],
    queryFn: async () => {
      return await getWrappedTransactionSigners({
        chainSlug,
        extrinsicType: ExtrinsicType.MULTISIG_INIT_TX,
        targetAddress: address
      });
    },
    enabled: isMultisigSignRequest && !!chainSlug
  });

  const filteredSignerItems = useMemo<WrappedTransactionSigner[]>(() => {
    if (!signerItems) {
      return [];
    }

    return signerItems.filter((item) => item.kind === 'signatory');
  }, [signerItems]);

  const onOpenSelectSignerModal = useCallback(() => {
    activeModal(WRAPPED_TRANSACTION_SIGNER_SELECTOR_MODAL);
  }, [activeModal]);

  const onSelectSigner = useCallback((selected: WrappedTransactionSigner) => {
    setSignerSelected(selected);
    setIsPreparing(true);
    setWrapError(null);

    prepareMultisigSignRequest({
      id: request.id,
      signer: selected.address
    })
      .then(noop)
      .catch((e: Error) => {
        setWrapError(e.message || t('ui.DAPP.Confirmations.MultisigSignerSelector.unableToPrepareMultisigSigningRequest'));
      })
      .finally(() => {
        setIsPreparing(false);
      });
  }, [request.id, t]);

  const disableApproval = useMemo(() => {
    if (!isMultisigSignRequest) {
      return false;
    }

    return !signerSelected || isPreparing || isSignerItemsLoading || !!wrapError;
  }, [isMultisigSignRequest, isPreparing, isSignerItemsLoading, signerSelected, wrapError]);

  useEffect(() => {
    if (!isMessage && chainInfo) {
      const chainState = chainStateMap[chainInfo.slug];

      !chainState.active && enableChain(chainInfo.slug, false)
        .then(noop)
        .catch(console.error);
    }
  }, [chainStateMap, chainInfo, isMessage]);

  return (
    <>
      <div className={CN('confirmation-content', className)}>
        <ConfirmationGeneralInfo request={request} />
        <div className='title'>
          {t('ui.DAPP.Confirmations.Message.Sign.signatureRequest')}
        </div>
        <div className='description'>
          {t('ui.DAPP.Confirmations.Message.Sign.approvingRequestWithAccount')}
        </div>
        <AccountItemWithProxyAvatar
          account={account}
          accountAddress={address}
          className='account-item'
          isSelected={true}
        />
        {isMultisigSignRequest && (
          <MultisigSignerSelector
            isPreparing={isPreparing}
            isSignerItemsLoading={isSignerItemsLoading}
            onOpenSelectSignerModal={onOpenSelectSignerModal}
            signerAccount={signerAccount}
            wrapError={wrapError}
          />
        )}
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
      </div>
      <SubstrateSignArea
        disableApproval={disableApproval}
        id={request.id}
        isInternal={request.isInternal}
        isWrapTransaction={isMultisigSignRequest}
        request={request.request}
      />
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
      {!!filteredSignerItems.length && isMultisigSignRequest && (
        <WrappedTransactionSignerSelectorModal
          chainSlug={chainSlug}
          onSelectSigner={onSelectSigner}
          selectedSigner={signerSelected}
          signerItems={filteredSignerItems}
          targetAddress={address}
        />
      )}
    </>
  );
}

const SignConfirmation = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
  '.account-list': {
    '.__prop-label': {
      marginRight: token.marginMD,
      width: '50%',
      float: 'left'
    }
  }
}));

export default SignConfirmation;
