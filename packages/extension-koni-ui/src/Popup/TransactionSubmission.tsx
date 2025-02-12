// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CloseIcon, Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { useDefaultNavigate } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { PageIcon } from '@subwallet/react-ui';
import { SpinnerGap } from 'phosphor-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;
  const [searchParams] = useSearchParams();
  const transactionProgressId = searchParams.get('transaction-progress-id') || '';

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goHome } = useDefaultNavigate();

  const viewProgress = useCallback(
    () => {
      navigate(`/settings/notification?transaction-progress-id=${transactionProgressId}`);
    },
    [navigate, transactionProgressId]
  );

  return (
    <PageWrapper className={className}>
      <Layout.WithSubHeaderOnly
        leftFooterButton={{
          block: true,
          onClick: goHome,
          children: t('Back to home')
        }}
        rightFooterButton={{
          block: true,
          onClick: viewProgress,
          children: t('View progress')
        }}
        subHeaderLeft={<CloseIcon />}
        title={t('Submitted')}
      >
        <div className='container'>
          <div className='page-icon'>
            <PageIcon
              color='var(--page-icon-color)'
              iconProps={{
                weight: 'fill',
                phosphorIcon: SpinnerGap
              }}
            />
          </div>
          <div className='title'>
            {t('Transaction submitted!')}
          </div>
          <div className='description'>
            {t('View transaction progress in the Notifications screen or go back to home')}
          </div>
        </div>
      </Layout.WithSubHeaderOnly>
    </PageWrapper>
  );
};

const TransactionSubmission = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    textAlign: 'center',

    '.page-icon': {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 48,
      marginBottom: 40,
      '--page-icon-color': '#D9A33E' // todo: add this color to theme token map
    },

    '.title': {
      marginBottom: token.margin,
      fontWeight: token.fontWeightStrong,
      fontSize: token.fontSizeHeading3,
      lineHeight: token.lineHeightHeading3,
      color: token.colorTextBase
    },

    '.description': {
      padding: '0 36px',
      marginBottom: token.margin * 2,
      fontSize: token.fontSizeHeading5,
      lineHeight: token.lineHeightHeading5,
      color: token.colorTextLight5,
      textAlign: 'center'
    }
  };
});

export default TransactionSubmission;
