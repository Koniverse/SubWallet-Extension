// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { StepStatus } from '@subwallet/extension-base/types';
import { AlertBox, BackgroundExpandView } from '@subwallet/extension-koni-ui/components';
import { useIsPopup } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

type Props = ThemeProps & {
  children?: React.ReactNode;
};

const Component: React.FC<Props> = (props: Props) => {
  const { children, className } = props;
  const aliveProcessMap = useSelector((state: RootState) => state.requestState.aliveProcess);
  const isPopup = useIsPopup();

  const processIds = useMemo(() => {
    const aliveProcesses = Object.values(aliveProcessMap).filter((p) => ![StepStatus.QUEUED, StepStatus.PREPARE].includes(p.status));

    return aliveProcesses.map((p) => p.id);
  }, [aliveProcessMap]);

  return (
    <div className={className}>
      {
        !!processIds.length && !isPopup && (
          <div className={'transaction-process-warning-container'}>
            {processIds.map((p) => (
              <AlertBox
                className={'transaction-process-warning-item'}
                description={'Transaction is in progress. Keep SubWallet open to complete the transaction'}
                key={p}
                title={'Do not close SubWallet!'}
                type={'warning'}
              />
            ))}
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
    marginBottom: 34
  },

  '.transaction-process-warning-item': {
    border: '1px solid',
    borderColor: token.colorWarning
  },

  '.main-layout-content': {
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBgInput}`,
    height: 599,
    width: 388,
    maxWidth: '100%',
    overflow: 'hidden',
    marginLeft: 'auto',
    marginRight: 'auto'
  },

  '.web-layout-container': {
    height: '100%'
  }
}));
