// Copyright 2019-2022 @subwallet/web-runner authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWHandler } from '@subwallet/extension-base/koni/background/handlers';
import { isWebRunnerDataReset } from '@subwallet/extension-base/koni/background/handlers/Mobile';
import { createLogger } from '@subwallet/extension-base/utils/logger';

import { PageStatus, responseMessage } from './messageHandle';

const logger = createLogger('CheckRestore');

export async function checkRestore (): Promise<void> {
  const needRestore = await isWebRunnerDataReset();

  if (needRestore) {
    responseMessage({ id: '0', response: { status: 'require_restore' } } as PageStatus);

    try {
      await SWHandler.instance.mobileHandler.waitRestore();
    } catch (e) {
      logger.error('Failed to wait for restore', e);
    }
  }
}
