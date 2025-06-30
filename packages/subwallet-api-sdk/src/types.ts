// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type ApiStatusValue = 'error' | 'success' | 'fail';

export interface SWApiResponse<T> {
  status: ApiStatusValue,
  data: T,
  error?: {
    message: string;
    code: number;
  }
}
