// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const MELD_API_KEY = process.env.MELD_API_KEY || '';
export const MELD_WIZARD_KEY = process.env.MELD_WIZARD_KEY || '';
export const MELD_TEST_MODE = process.env.MELD_TEST_MODE !== undefined ? !!process.env.MELD_TEST_MODE : true;

export const MELD_URL = MELD_TEST_MODE ? 'https://sb.meldcrypto.com/' : 'https://meldcrypto.com/';
