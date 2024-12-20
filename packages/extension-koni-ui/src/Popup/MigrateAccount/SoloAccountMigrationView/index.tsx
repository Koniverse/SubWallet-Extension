// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { ProcessViewItem } from './ProcessViewItem';

type Props = ThemeProps & {
  totalToBeMigratedAccounts: number;
  onApprove: () => Promise<void>;
  onCompleteMigrationProcess: VoidFunction;
};

function Component ({ className = '', onApprove, onCompleteMigrationProcess, totalToBeMigratedAccounts }: Props) {
  const [currentProcessOrdinal, setCurrentProcessOrdinal] = useState<number>(1);

  const performNextProcess = useCallback(() => {
    if (currentProcessOrdinal >= totalToBeMigratedAccounts) {
      return;
    }

    if (currentProcessOrdinal + 1 === totalToBeMigratedAccounts) {
      onCompleteMigrationProcess();

      return;
    }

    setCurrentProcessOrdinal((prev) => prev + 1);
  }, [currentProcessOrdinal, onCompleteMigrationProcess, totalToBeMigratedAccounts]);

  const onSkip = useCallback(() => {
    performNextProcess();
  }, [performNextProcess]);

  const _onApprove = useCallback(async () => {
    await onApprove();

    performNextProcess();
  }, [onApprove, performNextProcess]);

  useEffect(() => {
    // ping here
  }, []);

  // useEffect(() => {
  //   onCompleteMigrationProcess();
  // }, [onCompleteMigrationProcess]);

  return (
    <ProcessViewItem
      currentProcessOrdinal={currentProcessOrdinal}
      key={`ProcessViewItem-${currentProcessOrdinal}`}
      onApprove={_onApprove}
      onSkip={onSkip}
      totalToBeMigratedAccounts={totalToBeMigratedAccounts}
    />
  );
}

export const SoloAccountMigrationView = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({

  });
});
