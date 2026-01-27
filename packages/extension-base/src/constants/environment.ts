// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

const PRODUCTION_BRANCHES = ['master', 'webapp', 'webapp-dev'];
const branchName = process.env.BRANCH_NAME || 'subwallet-dev';

export const APP_VERSION = process.env.PKG_VERSION || '';
export const isProductionMode = PRODUCTION_BRANCHES.indexOf(branchName) > -1;
export const BACKEND_API_URL = process.env.SUBWALLET_API || (isProductionMode ? 'https://sw-services.subwallet.app/api' : 'https://be-dev-06.subwallet.app/api');
export const SW_EXTERNAL_SERVICES_API = process.env.SW_EXTERNAL_SERVICES_API || (isProductionMode ? 'https://external-services.subwallet.app' : 'https://external-services-dev.subwallet.app');
