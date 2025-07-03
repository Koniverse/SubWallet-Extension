// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { StepStatus } from '@subwallet/extension-base/types';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { AlertBox } from '@subwallet/extension-web-ui/components';
import { FeatureModalContext } from '@subwallet/extension-web-ui/contexts/FeatureModalContextProvider';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { NotificationScreenParam, ThemeProps } from '@subwallet/extension-web-ui/types';
import CN from 'classnames';
import React, { useCallback, useContext, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;
  const aliveProcessMap = useSelector((state: RootState) => state.requestState.aliveProcess);
  const navigate = useNavigate();
  const { isWebUI } = useContext(ScreenContext);
  const { notificationModal: { open: openNotificationModal } } = useContext(FeatureModalContext);

  const processIds = useMemo(() => {
    const aliveProcesses = Object.values(aliveProcessMap).filter((p) => ![StepStatus.QUEUED].includes(p.status));

    return aliveProcesses.map((p) => p.id);
  }, [aliveProcessMap]);

  const lastProcessId = useMemo<string | undefined>(() => {
    return processIds.sort((a, b) => b.localeCompare(a))[0];
  }, [processIds]);

  const navigateToNotification = useCallback((processId: string) => {
    return () => {
      if (!isWebUI) {
        navigate('/settings/notification', {
          state: {
            transactionProcess: {
              processId,
              triggerTime: `${Date.now()}`
            }
          } as NotificationScreenParam
        });
      } else {
        openNotificationModal({
          transactionProcess: {
            processId,
            triggerTime: `${Date.now()}`
          }
        });
      }
    };
  }, [isWebUI, navigate, openNotificationModal]);

  if (!lastProcessId) {
    return null;
  }

  return (
    <div className={CN(className, 'transaction-process-warning-container')}>
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
            i18nKey={detectTranslate('Transaction is in progress. Go to <highlight>Notifications</highlight> to view progress and keep SubWallet open until the transaction is completed')}
          />
        )}
        title={'Do not close SubWallet!'}
        type={'warning'}
      />
    </div>
  );
};

export const TransactionProcessWarning = styled(Component)<ThemeProps>(({ theme: { token } }: ThemeProps) => ({
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
