// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createLogger } from '@subwallet/extension-base/utils/logger';
import { parseUri } from '@walletconnect/utils';
import { TFunction } from 'i18next';

const logger = createLogger('WalletConnectScanner');

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
    logger.error('Failed to parse wallet connect URI', e);

    return (e as Error).message;
  }

  return null;
};
