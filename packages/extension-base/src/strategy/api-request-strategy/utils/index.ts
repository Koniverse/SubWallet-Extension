// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import fetch from 'cross-fetch';

export const postRequest = (url: string, body: any, headers?: Record<string, string>, jsonBody = true) => {
  return fetch(url, {
    method: 'POST',
    headers: headers || {
      'Content-Type': 'application/json'
    },
    body: jsonBody ? JSON.stringify(body) : (body as string)
  });
};

export const getRequest = (url: string, params?: Record<string, string>, headers?: Record<string, string>) => {
  const queryString = params
    ? Object.keys(params)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')
    : '';

  const _url = `${url}?${queryString}`;

  return fetch(_url, {
    method: 'GET',
    headers: headers || {
      'Content-Type': 'application/json'
    }
  });
};
