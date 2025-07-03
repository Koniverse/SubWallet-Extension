// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CardanoSignatureRequest, ConfirmationsQueueItem } from '@subwallet/extension-base/background/KoniTypes';
import { AccountItemWithProxyAvatar, ConfirmationGeneralInfo, ViewDetailIcon } from '@subwallet/extension-web-ui/components';
import { useGetAccountByAddress, useOpenDetailModal } from '@subwallet/extension-web-ui/hooks';
import { CardanoMessageDetail } from '@subwallet/extension-web-ui/Popup/Confirmations/parts';
import { CardanoSignatureSupportType, ThemeProps } from '@subwallet/extension-web-ui/types';
import { Button } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseDetailModal, CardanoSignArea } from '../../parts';

interface Props extends ThemeProps {
  type: CardanoSignatureSupportType
  request: ConfirmationsQueueItem<CardanoSignatureRequest>
}

function Component ({ className, request, type }: Props) {
  const { id, payload } = request;
  const { t } = useTranslation();
  const { address: addressToSign, currentAddress, errors } = payload;
  const account = useGetAccountByAddress(currentAddress);
  const onClickDetail = useOpenDetailModal();

  return (
    <>
      <div className={CN('confirmation-content', className)}>
        <ConfirmationGeneralInfo request={request} />
        <div className='title'>
          {t('Signature required')}
        </div>
        <div className='description'>
          {t('You are approving a request with the following account')}
        </div>
        <AccountItemWithProxyAvatar
          account={account}
          accountAddress={addressToSign}
          className='account-item'
          isSelected={true}
        />
        {(!errors || errors.length === 0) && <div>
          <Button
            icon={<ViewDetailIcon />}
            onClick={onClickDetail}
            size='xs'
            type='ghost'
          >
            {t('View details')}
          </Button>
        </div>
        }
      </div>
      <CardanoSignArea
        id={id}
        payload={request}
        type={type}
      />
      {(!errors || errors.length === 0) && <BaseDetailModal
        title={t('Message details')}
      >
        <CardanoMessageDetail bytes={payload.hashPayload} />
      </BaseDetailModal>}
    </>
  );
}

const CardanoSignatureConfirmation = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
  '.account-list': {
    '.__prop-label': {
      marginRight: token.marginMD,
      width: '50%',
      float: 'left'
    }
  },

  '.__label': {
    textAlign: 'left'
  }
}));

export default CardanoSignatureConfirmation;
