// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { BitcoinSignPsbtRequest, ConfirmationsQueueItem, PsbtTransactionArg } from '@subwallet/extension-base/background/KoniTypes';
import { AccountItemWithName, ConfirmationGeneralInfo, MetaInfo, ViewDetailIcon } from '@subwallet/extension-koni-ui/components';
import { useOpenDetailModal } from '@subwallet/extension-koni-ui/hooks';
import { BitcoinSignArea } from '@subwallet/extension-koni-ui/Popup/Confirmations/parts';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { BitcoinSignatureSupportType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { findAccountByAddress } from '@subwallet/extension-koni-ui/utils';
import { Button, Number } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { BaseDetailModal } from '../parts';

interface Props extends ThemeProps {
  type: BitcoinSignatureSupportType
  request: ConfirmationsQueueItem<BitcoinSignPsbtRequest>
}

function Component ({ className, request, type }: Props) {
  const { id, payload } = request;
  const { t } = useTranslation();
  const { account } = payload;
  const { tokenSlug, txInput, txOutput } = request.payload.payload;
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const assetRegistry = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const onClickDetail = useOpenDetailModal();
  const assetInfo: _ChainAsset | undefined = useMemo(() => {
    return assetRegistry[tokenSlug];
  }, [assetRegistry, tokenSlug]);
  const renderAccount = useCallback((accountsPsbt: PsbtTransactionArg[]) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {
          accountsPsbt.map(({ address, amount }) => {
            const account = findAccountByAddress(accounts, address);

            return (<AccountItemWithName
              accountName={account?.name}
              address={address || ''}
              key={address}
              rightItem={amount
                ? <Number
                  decimal={assetInfo.decimals || 0}
                  suffix={assetInfo.symbol || ''}
                  value={amount}
                />
                : <></>}
            />);
          }
          )
        }

      </div>
    );
  }, [accounts, assetInfo.decimals, assetInfo.symbol]);

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
        <AccountItemWithName
          accountName={account.name}
          address={account.address}
          avatarSize={24}
          className='account-item'
          isSelected={true}
          key={account.address}
          proxyId={account.proxyId}
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
      <BitcoinSignArea
        id={id}
        payload={request}
        type={type}
      />
      <BaseDetailModal
        title={t('Message details')}
      >
        <MetaInfo>
          <MetaInfo.Data label={t('Input')}>
            {renderAccount(txInput)}
          </MetaInfo.Data>
          <MetaInfo.Data label={t('Output')}>
            {renderAccount(txOutput)}
          </MetaInfo.Data>

        </MetaInfo>
      </BaseDetailModal>
    </>
  );
}

const BitcoinSignPsbtConfirmation = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
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

export default BitcoinSignPsbtConfirmation;
