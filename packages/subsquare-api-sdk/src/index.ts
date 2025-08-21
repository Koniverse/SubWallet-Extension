// Copyright 2017-2022 @subwallet/subwallet-api-sdk authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './detectPackage';

import { getSubsquareApi } from './bundle';

export * from './bundle';

export default getSubsquareApi;
export type { ReferendaResponse } from './interface';
