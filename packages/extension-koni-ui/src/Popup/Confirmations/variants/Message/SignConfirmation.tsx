// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SigningRequest } from '@subwallet/extension-base/background/types';
import { AccountItemWithProxyAvatar, ConfirmationGeneralInfo, ViewDetailIcon } from '@subwallet/extension-koni-ui/components';
import { useGetAccountByAddress, useMetadata, useOpenDetailModal, useParseSubstrateRequestPayload } from '@subwallet/extension-koni-ui/hooks';
import { enableChain } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isRawPayload, isSubstrateMessage, noop } from '@subwallet/extension-koni-ui/utils';
import { Button } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import { SignerPayloadJSON } from '@polkadot/types/types';

import useGetChainInfoByGenesisHash from '../../../../hooks/chain/useGetChainInfoByGenesisHash';
import { BaseDetailModal, SubstrateExtrinsic, SubstrateMessageDetail, SubstrateSignArea } from '../../parts';

interface Props extends ThemeProps {
  request: SigningRequest;
}

function Component ({ className, request }: Props) {
  const { address } = request;
  const { t } = useTranslation();
  const account = useGetAccountByAddress(address);

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
          {t('Signature request')}
        </div>
        <div className='description'>
          {t('You are approving a request with the following account')}
        </div>
        <AccountItemWithProxyAvatar
          account={account}
          accountAddress={address}
          className='account-item'
          isSelected={true}
        />
        <div>
          <Button
            icon={<ViewDetailIcon />}
            onClick={onClickDetail}
            size='xs'
            type='ghost'
          >
            {t('View details')}
          </Button>
        </div>
      </div>
      <SubstrateSignArea
        id={request.id}
        isInternal={request.isInternal}
        request={request.request}
      />
      <BaseDetailModal
        title={isMessage ? t('Message details') : t('Transaction details')}
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
