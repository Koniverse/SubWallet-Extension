// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestRemoveSubstrateProxyAccount } from '@subwallet/extension-base/types';
import { AccountProxyAvatar, SubstrateProxyAccountListModal } from '@subwallet/extension-koni-ui/components';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { SUBSTRATE_PROXY_ACCOUNT_LIST_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetAccountByAddress } from '@subwallet/extension-koni-ui/hooks';
import useGetNativeTokenBasicInfo from '@subwallet/extension-koni-ui/hooks/common/useGetNativeTokenBasicInfo';
import { toShort } from '@subwallet/extension-koni-ui/utils';
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
  const accountFrom = useGetAccountByAddress(transaction.address);
  const firstSubstrateProxyAccount = useGetAccountByAddress(data.selectedSubstrateProxyAccounts[0]?.substrateProxyAddress);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const { activeModal } = useContext(ModalContext);
  const substrateProxyAddresses = useMemo<string[]>(() => {
    return Array.from(
      new Set(
        data.selectedSubstrateProxyAccounts.map((item) => item.substrateProxyAddress)
      )
    );
  }, [data.selectedSubstrateProxyAccounts]);

  const onClickDetail = useCallback(() => {
    activeModal(modalId);
  }, [activeModal]);

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
        {
          substrateProxyAddresses.length === 1

            ? <>
              <MetaInfo.Default
                className={'__account-field'}
                label={t('Proxy account')}
              >
                <AccountProxyAvatar
                  className={'__account-avatar'}
                  size={24}
                  value={firstSubstrateProxyAccount?.proxyId || data.substrateProxyAddress}
                />
                <div className={'__account-item-label'}>
                  {firstSubstrateProxyAccount?.name || toShort(substrateProxyAddresses[0])}
                </div>
              </MetaInfo.Default>

              {!!firstSubstrateProxyAccount?.name && <MetaInfo.Default
                className={'__address-field'}
                label={t('Address')}
              >
                {toShort(substrateProxyAddresses[0])}
              </MetaInfo.Default>}
            </>

            : <MetaInfo.Default
              className={'proxy-address-removed'}
              label={t('Proxy account')}
            >
              {substrateProxyAddresses.length} {t('accounts')}
              <Button
                className={'proxy-address-removed-info'}
                icon={<Icon
                  className={'proxy-address-remove-detail'}
                  customSize={'20px'}
                  phosphorIcon={Info}
                  weight={'bold'}
                />}
                onClick={onClickDetail}
                size={'xs'}
                type={'ghost'}
              />
            </MetaInfo.Default>
        }

        <MetaInfo.Number
          decimals={decimals}
          label={t('Estimated fee')}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>SubstrateProxyAccountListModal
      <SubstrateProxyAccountListModal substrateProxyAddresses={substrateProxyAddresses} />
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
