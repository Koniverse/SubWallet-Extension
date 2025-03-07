// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import init, { run } from './pkg/avail_light_web';

(async () => {
  try {
    await init();
    await run('hex', null);
  } catch (error) {
    console.error('Error:', error);
  }
})();
