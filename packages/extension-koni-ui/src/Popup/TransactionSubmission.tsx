// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProcessTransactionData, ResponseSubscribeProcessById } from '@subwallet/extension-base/types';
import { CloseIcon, Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { useDefaultNavigate } from '@subwallet/extension-koni-ui/hooks';
import { cancelSubscription, subscribeProcess } from '@subwallet/extension-koni-ui/messaging';
import { NotificationScreenParam, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isStepCompleted, isStepFailed } from '@subwallet/extension-koni-ui/utils';
import { PageIcon } from '@subwallet/react-ui';
import { SwIconProps } from '@subwallet/react-ui/es/icon';
import CN from 'classnames';
import { CheckCircle, ProhibitInset, SpinnerGap } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import reformatAddress from '../utils/account/reformatAddress';

type Props = ThemeProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;
  const [searchParams] = useSearchParams();
  const transactionProcessId = searchParams.get('transaction-process-id') || '';
  const [processData, setProcessData] = useState<ProcessTransactionData | undefined>();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goHome } = useDefaultNavigate();

  const viewProgress = useCallback(
    () => {
      navigate('/settings/notification', {
        state: {
          transactionProcess: {
            processId: transactionProcessId,
            triggerTime: `${Date.now()}`
          }
        } as NotificationScreenParam
      });
    },
    [navigate, transactionProcessId]
  );

  const viewInHistory = useCallback(
    () => {
      if (processData?.address && processData?.lastTransactionChain && processData?.lastTransactionId) {
        navigate(`/home/history/${reformatAddress(processData?.address)}/${processData?.lastTransactionChain}/${processData?.lastTransactionId}`, { state: { from: 'ignoreRemind' } });
      } else {
        navigate('/home/history');
      }
    },
    [processData?.address, processData?.lastTransactionChain, processData?.lastTransactionId, navigate]
  );

  const isFinal = useMemo(() => {
    return isStepCompleted(processData?.status) || isStepFailed(processData?.status);
  }, [processData]);

  const icon = useMemo<SwIconProps['phosphorIcon']>(() => {
    if (isStepCompleted(processData?.status)) {
      return CheckCircle;
    }

    if (isStepFailed(processData?.status)) {
      return ProhibitInset;
    }

    return SpinnerGap;
  }, [processData?.status]);

  useEffect(() => {
    let cancel = false;
    let id = '';

    const onCancel = () => {
      if (id) {
        cancelSubscription(id).catch(console.error);
      }
    };

    if (transactionProcessId) {
      const updateProcess = (data: ResponseSubscribeProcessById) => {
        if (!cancel) {
          id = data.id;
          setProcessData(data.process);
        } else {
          onCancel();
        }
      };

      subscribeProcess({ processId: transactionProcessId }, updateProcess)
        .then(updateProcess)
        .catch(console.error);
    }

    return () => {
      cancel = true;
      onCancel();
    };
  }, [transactionProcessId]);

  return (
    <PageWrapper className={CN(className, {
      '-processing': !processData || !isFinal,
      '-complete': isStepCompleted(processData?.status),
      '-failed': isStepFailed(processData?.status)
    })}
    >
      <Layout.WithSubHeaderOnly
        leftFooterButton={{
          block: true,
          onClick: goHome,
          children: t('Back to home')
        }}
        rightFooterButton={{
          block: true,
          onClick: isFinal ? viewInHistory : viewProgress,
          children: isFinal ? t('View transaction') : t('View progress')
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
                phosphorIcon: icon
              }}
            />
          </div>
          <div className='title'>
            {t('Transaction submitted!')}
          </div>
          <div className='description'>
            {isFinal ? t('View transaction progress in the History tab or go back to home') : t('View transaction progress in the Notifications screen or go back to home')}
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
      marginBottom: 40
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
    },

    '&.-processing': {
      '--page-icon-color': '#D9A33E'
    },

    '&.-complete': {
      '--page-icon-color': token.colorSuccess
    },

    '&.-failed': {
      '--page-icon-color': token.colorError
    }
  };
});

export default TransactionSubmission;
