// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestAddSubstrateProxyAccount } from '@subwallet/extension-base/types';
import { CommonTransactionInfo } from '@subwallet/extension-koni-ui/components';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import useGetNativeTokenBasicInfo from '@subwallet/extension-koni-ui/hooks/common/useGetNativeTokenBasicInfo';
import CN from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className, transaction } = props;
  const { t } = useTranslation();
  const data = transaction.data as RequestAddSubstrateProxyAccount;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  return (
    <div className={CN(className)}>
      <CommonTransactionInfo
        address={transaction.address}
        network={transaction.chain}
      />
      <MetaInfo
        className={'meta-info'}
        hasBackgroundWrapper
      >
        <MetaInfo.Account
          address={data.substrateProxyAddress}
          chainSlug={transaction.chain}
          label={t('ui.TRANSACTION.Confirmations.AddSubstrateProxyAccount.proxyAccount')}
        />

        <MetaInfo.Default
          className={CN('__validator-address', className)}
          label={t('ui.TRANSACTION.Confirmations.AddSubstrateProxyAccount.proxyType')}
        >
          <span className='__selected-validator-type'>
            {data.substrateProxyType}
          </span>
        </MetaInfo.Default>

        {!transaction.isWrappedTx && <MetaInfo.Number
          decimals={decimals}
          label={t('ui.TRANSACTION.Confirmations.AddSubstrateProxyAccount.networkFee')}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />}
      </MetaInfo>
    </div>
  );
};

const AddSubstrateProxyAccountTransactionConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__account-field .__value': {
      display: 'flex',
      overflow: 'hidden',
      gap: token.sizeXS
    },

    '.address-field': {
      whiteSpace: 'nowrap'
    },

    '.__selected-validator-type': {
      color: token['magenta-6']
    }
  };
});

export default AddSubstrateProxyAccountTransactionConfirmation;
