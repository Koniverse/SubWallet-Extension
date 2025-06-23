// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ApiRequest, ApiRequestContext } from '../api-request-strategy/types';

export interface ApiRequestStrategyV2 {
  addRequest: <T> (run: ApiRequestV2<T>['run'], groupId: number, ordinal: number) => Promise<T>;
  setContext: (context: ApiRequestContext) => void;
  stop: (groupId?: number) => void;
  cancelGroupRequest: (groupId: number) => void;
}

export interface ApiRequestV2<T> extends ApiRequest<T> {
  groupId: number;
}
