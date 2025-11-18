// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { BITCOIN_CACHE_TIMEOUT } from '@subwallet/extension-base/services/chain-service/constants';
import fetch from 'cross-fetch';

// Apply cache to get requests only if needed
const cacheMap: Record<string, any> = {};

export async function postRequest<T = string> (url: string, { body, headers, isJson, isJsonResponse, onError }: {
  body: any,
  headers?: Record<string, string>,
  isJson?: boolean,
  isJsonResponse?: boolean,
  onError?: (res: Response) => void
}): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: headers || {
      'Content-Type': 'application/json'
    },
    body: isJson ? JSON.stringify(body) : (body as string)
  });

  if (!res.ok) {
    onError && onError(res);
  }

  return (isJsonResponse ? await res.text() : await res.json()) as T;
}

export async function getRequest<T> (url: string, { headers, onError, params }: {
  params?: Record<string, string>,
  headers?: Record<string, string>,
  onError?: (res?: Response) => void
} = {}): Promise<T> {
  const q = new URLSearchParams(params);

  const _url = `${url}?${q.toString()}`;
  const cacheData = cacheMap[_url] as T | undefined;

  if (cacheData) {
    // If the request is cached, return the cached response
    // Note: This does not return a promise, so the caller must handle it accordingly
    // It is assumed that the caller will handle the response correctly
    // e.g., by calling .json() or .text() on the cached response
    console.debug('Cache hit for:', _url);

    return Promise.resolve(cacheData);
  }

  // Create a new request promise and store it in the requesting map
  const res = await fetch(_url, {
    method: 'GET',
    headers: headers || {
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    onError && onError(res);
  }

  const data = await res.json() as T;

  // Cache the response for future use
  cacheMap[_url] = data; // Cache the response

  setTimeout(() => {
    delete cacheMap[_url]; // Remove from cache after timeout
  }, BITCOIN_CACHE_TIMEOUT);

  return data;
}
