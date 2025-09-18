// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { parseUri } from '@walletconnect/utils';
import { TFunction } from 'i18next';

export const validWalletConnectUri = (data: string, t: TFunction): string | null => {
  try {
    const parameters = parseUri(data);
    const { topic, version } = parameters;

    if (version === 1) {
      return t('ui.WALLET_CONNECT.util.scanner.walletConnect.failToConnectUseWcV2');
    }

    if (data.startsWith('wc:') && !topic) {
      return t('ui.WALLET_CONNECT.util.scanner.walletConnect.invalidUri');
    }
  } catch (e) {
    console.error({ error: e });

    return (e as Error).message;
  }

  return null;
};
