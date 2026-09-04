// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';

import { ApiRequest, ApiRequestContext, ApiRequestStrategy } from './types';

export abstract class BaseApiRequestStrategy implements ApiRequestStrategy {
  private nextId = 0;
  private isRunning = false;
  private requestMap: Record<number, ApiRequest<any>> = {};
  private context: ApiRequestContext;
  private processInterval: NodeJS.Timeout | undefined = undefined;

  private getId () {
    return this.nextId++;
  }

  protected constructor (context: ApiRequestContext) {
    this.context = context;
  }

  addRequest<T> (run: ApiRequest<T>['run'], ordinal: number) {
    const newId = this.getId();

    return new Promise<T>((resolve, reject) => {
      this.requestMap[newId] = {
        id: newId,
        status: 'pending',
        retry: -1,
        ordinal,
        run,
        resolve,
        reject
      };

      if (!this.isRunning) {
        this.process();
      }
    });
  }

  abstract isRateLimited (error: Error): boolean;

  private process () {
    this.stop();

    this.isRunning = true;
    const maxRetry = this.context.maxRetry;

    const interval = setInterval(() => {
      const remainingRequests = Object.values(this.requestMap);

      if (remainingRequests.length === 0) {
        this.isRunning = false;
        clearInterval(interval);

        return;
      }

      // Get first this.limit requests base on id
      const requests = remainingRequests
        .filter((request) => request.status !== 'running')
        .sort((a, b) => a.id - b.id)
        .sort((a, b) => a.ordinal - b.ordinal)
        .slice(0, this.context.callRate);

      // Start requests
      requests.forEach((request) => {
        request.status = 'running';
        request.run().then((rs) => {
          request.resolve(rs);

          delete this.requestMap[request.id];
        }).catch((e: Error) => {
          // A subclass parsing the error must never take the caller down with
          // it - a throw here would leave the request promise unsettled forever.
          let isRateLimited: boolean;

          try {
            isRateLimited = this.isRateLimited(e);
          } catch (parseError) {
            isRateLimited = false;
          }

          // Limit rate
          if (isRateLimited && request.retry < maxRetry) {
            request.status = 'pending';
            request.retry++;
            this.context.reduceLimitRate();

            return;
          }

          request.reject(new SWError(isRateLimited ? 'MAX_RETRY' : 'UNKNOWN', String(e)));

          // Drop it, or the request sits in the map as 'running' forever and
          // keeps the processing interval alive for the rest of the session.
          delete this.requestMap[request.id];
        });
      });
    }, this.context.intervalCheck);

    this.processInterval = interval;
  }

  stop () {
    clearInterval(this.processInterval);
    this.processInterval = undefined;
  }

  setContext (context: ApiRequestContext): void {
    this.stop();

    this.context = context;

    this.process();
  }
}
