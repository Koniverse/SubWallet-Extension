// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { sendMessage } from '../base';

export const checkLightClient = async (): Promise<null> => {
  return sendMessage('pri(avail.lightClient)', null);
}
