// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';

import { ApiRequestContext } from '../api-request-strategy/types';
import { ApiRequestStrategyV2, ApiRequestV2 } from './types';

export abstract class BaseApiRequestStrategyV2 implements ApiRequestStrategyV2 {
  private nextId = 0;
  private groupId = 0;
  private isRunning = false;
  private requestMap: Record<number, ApiRequestV2<any>> = {};
  private context: ApiRequestContext;
  private processInterval: NodeJS.Timeout | undefined = undefined;
  private canceledGroupIds: Set<number> = new Set();

  private getId () {
    return this.nextId++;
  }

  protected constructor (context: ApiRequestContext) {
    this.context = context;
  }

  public getGroupId (): number {
    return this.groupId++;
  }

  addRequest<T> (run: ApiRequestV2<T>['run'], ordinal: number, _groupId?: number) {
    const newId = this.getId();
    const groupId = _groupId ?? this.getGroupId();

    if (this.canceledGroupIds.has(groupId)) {
      return Promise.reject(new SWError('CANCELED', 'Request has been canceled'));
    }

    return new Promise<T>((resolve, reject) => {
      this.requestMap[newId] = {
        id: newId,
        groupId,
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

      console.log('[ApiRequestStrategyV2] Processing requests...', remainingRequests.map((r) => r.groupId));

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
          const isRateLimited = this.isRateLimited(e);

          // Limit rate
          if (isRateLimited) {
            if (request.retry < maxRetry) {
              request.status = 'pending';
              request.retry++;
              this.context.reduceLimitRate();
            } else {
              // Reject request
              request.reject(new SWError('MAX_RETRY', String(e)));
            }
          } else {
            request.reject(new SWError('UNKNOWN', String(e)));
          }
        });
      });
    }, this.context.intervalCheck);

    this.processInterval = interval;
  }

  stop () {
    clearInterval(this.processInterval);
    this.processInterval = undefined;
  }

  cancelGroupRequest (groupId: number): void {
    Object.values(this.requestMap).forEach((request) => {
      if (request.groupId === groupId) {
        request.reject(new SWError('CANCELED', 'Request has been canceled'));
      }

      this.canceledGroupIds.add(groupId);
    });

    this.requestMap = Object.fromEntries(
      Object.entries(this.requestMap).filter(([_, request]) => request.groupId !== groupId)
    );
  }

  setContext (context: ApiRequestContext): void {
    this.stop();

    this.context = context;

    this.process();
  }
}
