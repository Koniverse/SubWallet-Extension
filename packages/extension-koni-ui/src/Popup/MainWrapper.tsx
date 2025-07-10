// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { StepStatus } from '@subwallet/extension-base/types';
import { AlertBox, BackgroundExpandView } from '@subwallet/extension-koni-ui/components';
import {useExtensionDisplayModes, useTranslation} from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { NotificationScreenParam, ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps & {
  children?: React.ReactNode;
};

const Component: React.FC<Props> = (props: Props) => {
  const { children, className } = props;
  const aliveProcessMap = useSelector((state: RootState) => state.requestState.aliveProcess);
  const { isExpanseMode } = useExtensionDisplayModes();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const processIds = useMemo(() => {
    const aliveProcesses = Object.values(aliveProcessMap).filter((p) => ![StepStatus.QUEUED].includes(p.status));

    return aliveProcesses.map((p) => p.id);
  }, [aliveProcessMap]);

  const lastProcessId = useMemo<string | undefined>(() => {
    return processIds.sort((a, b) => b.localeCompare(a))[0];
  }, [processIds]);

  const navigateToNotification = useCallback((processId: string) => {
    return () => {
      navigate('/settings/notification', {
        state: {
          transactionProcess: {
            processId,
            triggerTime: `${Date.now()}`
          }
        } as NotificationScreenParam
      });
    };
  }, [navigate]);

  return (
    <div className={className}>
      {
        !!lastProcessId && isExpanseMode && (
          <div className={'transaction-process-warning-container'}>
            <AlertBox
              className={'transaction-process-warning-item'}
              description={(
                <Trans
                  components={{
                    highlight: (
                      <span
                        className='link'
                        onClick={navigateToNotification(lastProcessId)}
                      />
                    )
                  }}
                  i18nKey={('ui.MainWrapper.viewTransactionProgressInNotifications')}
                />
              )}
              title={t('ui.MainWrapper.doNotCloseSubWallet')}
              type={'warning'}
            />
          </div>
        )
      }

      {!!children && (
        <div className={'main-layout-content'}>
          {children}
        </div>
      )}
      <BackgroundExpandView />
    </div>
  );
};

export const MainWrapper = styled(Component)<ThemeProps>(({ theme: { token } }: ThemeProps) => ({
  overflow: 'auto',

  '.transaction-process-warning-container': {
    maxWidth: 452,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 34,
    position: 'relative',
    zIndex: 1,

    '@media (max-height: 797px)': {
      display: 'none'
    }
  },

  '.transaction-process-warning-item + .transaction-process-warning-item': {
    marginTop: token.marginSM
  },

  '.transaction-process-warning-item': {
    border: '1px solid',
    borderColor: token.colorWarning,

    '.link': {
      color: token.colorLink,
      textDecoration: 'underline',
      cursor: 'pointer'
    }
  }
}));
