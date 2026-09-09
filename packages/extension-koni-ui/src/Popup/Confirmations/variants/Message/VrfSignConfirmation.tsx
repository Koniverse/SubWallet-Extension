// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SigningRequest } from '@subwallet/extension-base/background/types';
import { getDomainFromUrl } from '@subwallet/extension-base/utils';
import { AccountItemWithProxyAvatar, AlertBox, ConfirmationGeneralInfo, ViewDetailIcon } from '@subwallet/extension-koni-ui/components';
import { useGetAccountByAddress, useOpenDetailModal } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { SignerPayloadRaw } from '@polkadot/types/types';

import { BaseDetailModal, SubstrateSignArea, VrfDetail } from '../../parts';

interface Props extends ThemeProps {
  request: SigningRequest;
}

/**
 * Confirmation for `signer.signVrf`. Deliberately separate from `SignConfirmation`: a VRF request
 * carries a `type: 'bytes'` payload and would otherwise render as an ordinary message signature,
 * hiding from the user that they are handing the site a permanent, non-rotatable derived key.
 */
function Component ({ className, request }: Props) {
  const { address } = request;
  const { t } = useTranslation();
  const account = useGetAccountByAddress(address);
  const onClickDetail = useOpenDetailModal();

  const domain = useMemo(() => getDomainFromUrl(request.url), [request.url]);
  const data = useMemo(() => (request.request.payload as SignerPayloadRaw).data, [request.request.payload]);

  return (
    <>
      <div className={CN('confirmation-content', className)}>
        <ConfirmationGeneralInfo request={request} />
        <div className='title'>
          {t('ui.DAPP.Confirmations.Message.Vrf.keyDerivationRequest')}
        </div>
        <div className='description'>
          {t('ui.DAPP.Confirmations.Message.Vrf.approvingRequestWithAccount', { domain })}
        </div>

        <AccountItemWithProxyAvatar
          account={account}
          accountAddress={address}
          className='account-item'
          isSelected={true}
        />

        <AlertBox
          className='vrf-alert'
          description={t('ui.DAPP.Confirmations.Message.Vrf.permanentKeyWarning', { domain })}
          title={t('ui.DAPP.Confirmations.Message.Vrf.permanentKeyWarningTitle')}
          type='info'
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
      </div>
      <SubstrateSignArea
        id={request.id}
        isInternal={request.isInternal}
        request={request.request}
      />
      <BaseDetailModal
        title={t('ui.DAPP.Confirmations.Message.Vrf.derivationDetails')}
      >
        <VrfDetail
          context={request.request.vrfContext}
          data={data}
          url={request.url}
        />
      </BaseDetailModal>
    </>
  );
}

const VrfSignConfirmation = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
  '.vrf-alert': {
    marginTop: token.marginSM,
    marginBottom: token.marginSM,
    textAlign: 'left'
  }
}));

export default VrfSignConfirmation;
