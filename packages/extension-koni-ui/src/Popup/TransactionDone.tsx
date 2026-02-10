// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { CloseIcon, Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { useDefaultNavigate } from '@subwallet/extension-koni-ui/hooks';
import { saveCurrentAccountAddress } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { findAccountByAddress } from '@subwallet/extension-koni-ui/utils';
import { PageIcon } from '@subwallet/react-ui';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import reformatAddress from '../utils/account/reformatAddress';

type Props = ThemeProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;
  const { address, chain, transactionId } = useParams<{address: string, chain: string, transactionId: string}>();
  const { transactionRequest } = useSelector((state: RootState) => state.requestState);
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goHome } = useDefaultNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const viewInHistory = useCallback(
    () => {
      (async () => {
        if (address && chain && transactionId) {
          let storedAddressesHistory = address;

          if (transactionRequest) {
            const transaction = transactionRequest[transactionId];

            if (transaction?.address && !isSameAddress(transaction.address, address)) {
              storedAddressesHistory = transaction.address;
            }
          }

          setIsLoading(true);
          const account = findAccountByAddress(accounts, storedAddressesHistory);

          if (account) {
            await saveCurrentAccountAddress({ address: account.proxyId || ALL_ACCOUNT_KEY }).catch(console.error);
          }

          setIsLoading(false);

          navigate(`/home/history/${reformatAddress(storedAddressesHistory)}/${chain}/${transactionId}`, { state: { from: 'ignoreRemind' } });
        } else {
          navigate('/home/history');
        }
      })().catch(console.error);
    },
    [address, chain, transactionId, transactionRequest, navigate, accounts]
  );

  return (
    <PageWrapper className={className}>
      <Layout.WithSubHeaderOnly
        leftFooterButton={{
          block: true,
          loading: isLoading,
          onClick: viewInHistory,
          children: t('ui.TRANSACTION.screen.TransactionDone.viewTransaction')
        }}
        rightFooterButton={{
          block: true,
          loading: isLoading,
          onClick: goHome,
          children: t('ui.TRANSACTION.screen.TransactionDone.backToHome')
        }}
        subHeaderLeft={<CloseIcon />}
        title={t('ui.TRANSACTION.screen.TransactionDone.submitted')}
      >
        <div className='container'>
          <div className='page-icon'>
            <PageIcon
              color='var(--page-icon-color)'
              iconProps={{
                weight: 'fill',
                phosphorIcon: CheckCircle
              }}
            />
          </div>
          <div className='title'>
            {t('ui.TRANSACTION.screen.TransactionDone.transactionSubmitted')}
          </div>
          <div className='description'>
            {t('ui.TRANSACTION.screen.TransactionDone.trackTransactionInHistory')}
          </div>
        </div>
      </Layout.WithSubHeaderOnly>
    </PageWrapper>
  );
};

const TransactionDone = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    textAlign: 'center',

    '.page-icon': {
      display: 'flex',
      justifyContent: 'center',
      marginTop: token.controlHeightLG,
      marginBottom: token.margin,
      '--page-icon-color': token.colorSecondary
    },

    '.title': {
      marginTop: token.margin,
      marginBottom: token.margin,
      fontWeight: token.fontWeightStrong,
      fontSize: token.fontSizeHeading3,
      lineHeight: token.lineHeightHeading3,
      color: token.colorTextBase
    },

    '.description': {
      padding: `0 ${token.controlHeightLG - token.padding}px`,
      marginTop: token.margin,
      marginBottom: token.margin * 2,
      fontSize: token.fontSizeHeading5,
      lineHeight: token.lineHeightHeading5,
      color: token.colorTextDescription,
      textAlign: 'center'
    },

    '.and-more': {
      fontSize: token.fontSizeHeading5,
      lineHeight: token.lineHeightHeading5,
      color: token.colorTextDescription,

      '.highlight': {
        color: token.colorTextBase
      }
    },

    '.ant-sw-screen-layout-footer-button-container': {
      flexDirection: 'column',
      padding: `0 ${token.padding}px`,
      gap: token.size,

      '.ant-btn': {
        margin: 0
      }
    }
  };
});

export default TransactionDone;
