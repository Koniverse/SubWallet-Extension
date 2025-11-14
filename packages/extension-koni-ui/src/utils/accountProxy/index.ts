// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { PhosphorIcon } from '@subwallet/extension-koni-ui/types';
import { Eye, GitCommit, Needle, QrCode, Question, Strategy, Swatches } from 'phosphor-react';
import { IconWeight } from 'phosphor-react/src/lib';

type AccountProxyTypeIcon = {
  className?: string;
  value: PhosphorIcon,
  weight?: IconWeight
}

export const getAccountProxyTypeIcon = (accountProxy: AccountProxy): AccountProxyTypeIcon | null => {
  if (accountProxy.accountType === AccountProxyType.UNIFIED) {
    return {
      className: '-is-unified',
      value: Strategy,
      weight: 'fill'
    };
  }

  if (accountProxy.accountType === AccountProxyType.SOLO) {
    return {
      className: '-is-solo',
      value: GitCommit,
      weight: 'fill'
    };
  }

  if (accountProxy.accountType === AccountProxyType.QR) {
    return {
      value: QrCode,
      weight: 'fill'
    };
  }

  if (accountProxy.accountType === AccountProxyType.READ_ONLY) {
    return {
      value: Eye,
      weight: 'fill'
    };
  }

  if (accountProxy.accountType === AccountProxyType.LEDGER) {
    return {
      value: Swatches,
      weight: 'fill'
    };
  }

  if (accountProxy.accountType === AccountProxyType.INJECTED) {
    return {
      value: Needle,
      weight: 'fill'
    };
  }

  if (accountProxy.accountType === AccountProxyType.UNKNOWN) {
    return {
      value: Question,
      weight: 'fill'
    };
  }

  return null;
};

export * from './authorizeAccountProxy';
