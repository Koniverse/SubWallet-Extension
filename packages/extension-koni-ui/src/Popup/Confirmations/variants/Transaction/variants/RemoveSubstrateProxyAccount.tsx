// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestRemoveSubstrateProxyAccount } from '@subwallet/extension-base/types';
import { CommonTransactionInfo, SubstrateProxyAccountListModal } from '@subwallet/extension-koni-ui/components';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { SUBSTRATE_PROXY_ACCOUNT_LIST_MODAL } from '@subwallet/extension-koni-ui/constants';
import useGetNativeTokenBasicInfo from '@subwallet/extension-koni-ui/hooks/common/useGetNativeTokenBasicInfo';
import { isSignerDifferentFromSender } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { Info } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;
const modalId = SUBSTRATE_PROXY_ACCOUNT_LIST_MODAL;

const Component: React.FC<Props> = (props: Props) => {
  const { className, transaction } = props;
  const { t } = useTranslation();
  const data = transaction.data as RequestRemoveSubstrateProxyAccount;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const { activeModal } = useContext(ModalContext);
  const substrateProxyAccounts = useMemo(() => data.selectedSubstrateProxyAccounts, [data.selectedSubstrateProxyAccounts]);

  const onClickDetail = useCallback(() => {
    activeModal(modalId);
  }, [activeModal]);

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
        {!!transaction.signerSubstrateProxyAddress && isSignerDifferentFromSender(transaction.address, transaction.signerSubstrateProxyAddress) &&
          <MetaInfo.Account
            address={transaction.signerSubstrateProxyAddress}
            chainSlug={transaction.chain}
            label={t('ui.TRANSACTION.Confirmations.RemoveSubstrateProxyAccount.signWith')}
          />
        }

        <MetaInfo.Default
          className={'proxy-address-removed'}
          label={t('ui.TRANSACTION.Confirmations.RemoveSubstrateProxyAccount.proxyAccount')}
        >
          {substrateProxyAccounts.length} {substrateProxyAccounts.length === 1 ? t('ui.TRANSACTION.Confirmations.RemoveSubstrateProxyAccount.account') : t('ui.TRANSACTION.Confirmations.RemoveSubstrateProxyAccount.accounts')}
          <Button
            className={'proxy-address-removed-info'}
            icon={
              <Icon
                className={'proxy-address-remove-detail'}
                customSize={'20px'}
                phosphorIcon={Info}
                weight={'bold'}
              />
            }
            onClick={onClickDetail}
            size={'xs'}
            type={'ghost'}
          />
        </MetaInfo.Default>

        <MetaInfo.Number
          decimals={decimals}
          label={t('ui.TRANSACTION.Confirmations.RemoveSubstrateProxyAccount.networkFee')}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>
      <SubstrateProxyAccountListModal
        substrateProxyAccounts={substrateProxyAccounts}
      />
    </div>
  );
};

const RemoveSubstrateProxyAccountTransactionConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__account-field .__value': {
      display: 'flex',
      overflow: 'hidden',
      gap: token.sizeXS
    },

    '.address-field': {
      whiteSpace: 'nowrap'
    },

    '.proxy-address-removed': {
      '.__value': {
        display: 'flex',
        alignItems: 'center'
      },

      '.proxy-address-removed-info': {
        height: 'fit-content !important',
        width: 'fit-content !important',
        minWidth: 'unset',
        color: token.colorTextLight4,
        transform: 'all 0.3s ease-in-out',

        '&:hover': {
          color: token.colorTextLight2
        }
      }
    }
  };
});

export default RemoveSubstrateProxyAccountTransactionConfirmation;
