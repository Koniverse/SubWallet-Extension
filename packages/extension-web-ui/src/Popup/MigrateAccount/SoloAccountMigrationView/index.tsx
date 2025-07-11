// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestMigrateSoloAccount, SoloAccountToBeMigrated } from '@subwallet/extension-base/background/KoniTypes';
import { SESSION_TIMEOUT } from '@subwallet/extension-base/services/keyring-service/context/handlers/Migration';
import { pingSession } from '@subwallet/extension-web-ui/messaging/migrate-unified-account';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { ProcessViewItem } from './ProcessViewItem';

type Props = ThemeProps & {
  soloAccountToBeMigratedGroups: SoloAccountToBeMigrated[][];
  onApprove: (request: RequestMigrateSoloAccount) => Promise<void>;
  sessionId?: string;
  onCompleteMigrationProcess: VoidFunction;
};

function Component ({ onApprove, onCompleteMigrationProcess, sessionId, soloAccountToBeMigratedGroups }: Props) {
  const [currentProcessOrdinal, setCurrentProcessOrdinal] = useState<number>(1);
  const [currentToBeMigratedGroupIndex, setCurrentToBeMigratedGroupIndex] = useState<number>(0);
  const [totalProcessSteps, setTotalProcessSteps] = useState<number>(soloAccountToBeMigratedGroups.length);

  const performNextProcess = useCallback((increaseProcessOrdinal = true) => {
    if (currentProcessOrdinal === totalProcessSteps) {
      onCompleteMigrationProcess();

      return;
    }

    setCurrentToBeMigratedGroupIndex((prev) => prev + 1);

    if (increaseProcessOrdinal) {
      setCurrentProcessOrdinal((prev) => prev + 1);
    }
  }, [currentProcessOrdinal, onCompleteMigrationProcess, totalProcessSteps]);

  const onSkip = useCallback(() => {
    setTotalProcessSteps((prev) => {
      if (prev > 0) {
        return prev - 1;
      }

      return prev;
    });

    performNextProcess(false);
  }, [performNextProcess]);

  const _onApprove = useCallback(async (soloAccounts: SoloAccountToBeMigrated[], accountName: string) => {
    if (!sessionId) {
      return;
    }

    await onApprove({
      soloAccounts,
      sessionId,
      accountName
    });

    performNextProcess();
  }, [onApprove, performNextProcess, sessionId]);

  const currentSoloAccountToBeMigratedGroup = soloAccountToBeMigratedGroups[currentToBeMigratedGroupIndex];

  useEffect(() => {
    // keep the session alive while in this view

    let timer: NodeJS.Timer;

    if (sessionId) {
      const doPing = () => {
        pingSession({ sessionId }).catch(console.error);
      };

      timer = setInterval(() => {
        doPing();
      }, SESSION_TIMEOUT / 2);

      doPing();
    }

    return () => {
      clearInterval(timer);
    };
  }, [sessionId]);

  return (
    <>
      {
        !!currentSoloAccountToBeMigratedGroup && (
          <ProcessViewItem
            currentProcessOrdinal={currentProcessOrdinal}
            currentSoloAccountToBeMigratedGroup={currentSoloAccountToBeMigratedGroup}
            key={`ProcessViewItem-${currentToBeMigratedGroupIndex}`}
            onApprove={_onApprove}
            onSkip={onSkip}
            totalProcessSteps={totalProcessSteps}
          />
        )
      }
    </>
  );
}

export const SoloAccountMigrationView = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({

  });
});
