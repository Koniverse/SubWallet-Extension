// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

export interface ApiRequestContextProps {
  limitRate: number; // max rate per interval check
  intervalCheck: number; // interval check in ms
  maxRetry: number; // interval check in ms
}

export interface ApiRequestContext extends ApiRequestContextProps {
  callRate: number; // limit per interval check
  reduceLimitRate: () => void;
}

export interface ApiRequestStrategy {
  addRequest: <T> (run: ApiRequest<T>['run'], ordinal: number) => Promise<T>;
  setContext: (context: ApiRequestContext) => void;
  stop: () => void;
}

export interface ApiRequest<T> {
  id: number;
  retry: number; // retry < 1 not start, retry === 0 start, retry > 0 number of retry
  /** Serve smaller first  */
  ordinal: number;
  status: 'pending' | 'running';
  run: () => Promise<any>;
  resolve: (value: any) => T;
  reject: (error?: any) => void;
}
