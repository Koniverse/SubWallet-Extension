// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button } from '@subwallet/react-ui';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  currentProcessOrdinal: number;
  totalToBeMigratedAccounts: number;
  onSkip: VoidFunction;
  onApprove: () => Promise<void>;
};

// name here
// list account
// header

function Component ({ className = '', currentProcessOrdinal, onApprove, onSkip, totalToBeMigratedAccounts }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const headerContent = useMemo(() => {
    return `${currentProcessOrdinal}/${totalToBeMigratedAccounts}`;
  }, [currentProcessOrdinal, totalToBeMigratedAccounts]);

  const _onApprove = useCallback(() => {
    setLoading(true);

    onApprove().finally(() => {
      setLoading(false);
    });
  }, [onApprove]);

  return (
    <div className={className}>
      {headerContent}

      <Button
        block={true}
        disabled={loading}
        loading={loading}
        onClick={onSkip}
      >
        {t('Skip')}
      </Button>
      <Button
        block={true}
        disabled={loading}
        loading={loading}
        onClick={_onApprove}
      >
        {t('Approve')}
      </Button>
    </div>
  );
}

export const ProcessViewItem = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({

  });
});
