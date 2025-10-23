// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestAddProxy } from '@subwallet/extension-base/types';
import { AccountProxyAvatar } from '@subwallet/extension-koni-ui/components';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { useGetAccountByAddress } from '@subwallet/extension-koni-ui/hooks';
import useGetNativeTokenBasicInfo from '@subwallet/extension-koni-ui/hooks/common/useGetNativeTokenBasicInfo';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import CN from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className, transaction } = props;
  const { t } = useTranslation();
  const data = transaction.data as RequestAddProxy;
  const accountFrom = useGetAccountByAddress(transaction.address);
  const proxyAccount = useGetAccountByAddress(data.proxyAddress);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  return (
    <div className={CN(className)}>
      <MetaInfo
        className={'meta-info'}
        hasBackgroundWrapper
      >
        <MetaInfo.Default
          className={'__account-field'}
          label={t('Account')}
        >
          <AccountProxyAvatar
            className={'__account-avatar'}
            size={24}
            value={accountFrom?.proxyId || transaction.address}
          />
          <div className={'__account-item-label'}>{accountFrom?.name || toShort(transaction.address)}</div>
        </MetaInfo.Default>

        {!!accountFrom?.name && <MetaInfo.Default
          className={'__address-field'}
          label={t('Address')}
        >
          {toShort(transaction.address)}
        </MetaInfo.Default>}

        <MetaInfo.Chain
          chain={transaction.chain}
          label={t('Network')}
        />
      </MetaInfo>
      <MetaInfo
        className={'meta-info'}
        hasBackgroundWrapper
      >

        <MetaInfo.Default
          className={'__account-field'}
          label={t('Proxy account')}
        >
          <AccountProxyAvatar
            className={'__account-avatar'}
            size={24}
            value={proxyAccount?.proxyId || data.proxyAddress}
          />
          <div className={'__account-item-label'}>{proxyAccount?.name || toShort(data.proxyAddress)}</div>
        </MetaInfo.Default>

        {!!proxyAccount?.name && <MetaInfo.Default
          className={'__address-field'}
          label={t('Address')}
        >
          {toShort(data.proxyAddress)}
        </MetaInfo.Default>}

        <MetaInfo.Number
          decimals={decimals}
          label={t('Estimated fee')}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>
    </div>
  );
};

const AddProxyTransactionConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__account-field .__value': {
      display: 'flex',
      overflow: 'hidden',
      gap: token.sizeXS
    },

    '.address-field': {
      whiteSpace: 'nowrap'
    }
  };
});

export default AddProxyTransactionConfirmation;
