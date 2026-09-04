// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type fetchJsonOptions = RequestInit & {
  params?: Record<string, string>;
  data?: Record<string, unknown>;
  timeout?: number;
}

export async function fetchData (url: string, options: fetchJsonOptions = {}) {
  const { data, params, timeout, ...fetchOptions } = options;
  let timeoutId: NodeJS.Timeout | undefined;

  if (timeout) {
    const controller = new AbortController();

    timeoutId = setTimeout(() => controller.abort(), timeout);

    // Must be the signal of the controller the timer aborts, otherwise the
    // timeout never reaches the request and fetch waits forever.
    fetchOptions.signal = controller.signal;
  }

  if (params) {
    const urlParams = new URLSearchParams(params);

    url = `${url}?${urlParams.toString()}`;
  }

  if (data) {
    fetchOptions.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...fetchOptions.headers
    };
    fetchOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchJson<T = any> (url: string, options: fetchJsonOptions = {}) {
  const response = await fetchData(url, options);

  return await response.json() as T;
}

export async function fetchText<T = any> (url: string, options: fetchJsonOptions = {}) {
  const response = await fetchData(url, options);

  return await response.text() as T;
}
