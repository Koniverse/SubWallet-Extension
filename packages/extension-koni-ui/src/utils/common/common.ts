// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChainLogoMap } from '@subwallet/chain-list';

export const notDef = (x: any) => x === null || typeof x === 'undefined';
export const isDef = (x: any) => !notDef(x);
export const nonEmptyArr = (x: any) => Array.isArray(x) && x.length > 0;
export const isEmptyArray = (x: any) => !Array.isArray(x) || (Array.isArray(x) && x.length === 0);

export function toShort (text: string, preLength = 6, sufLength = 6): string {
  if (!text) {
    return '';
  }

  if (text.length > (preLength + sufLength + 1)) {
    return `${text.slice(0, preLength)}…${text.slice(-sufLength)}`;
  }

  return text;
}

export const capitalize = (s: string): string => s && s[0].toUpperCase() + s.slice(1);

export const simpleDeepClone = <T>(s: T) => {
  return JSON.parse(JSON.stringify(s)) as T;
};

export function shuffle<T = any> (array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }
}

export const getLogoByNetworkKey = (networkKey: string, defaultLogo = 'default'): string => {
  return ChainLogoMap[networkKey] || ChainLogoMap[defaultLogo] || ChainLogoMap.default;
};

type WarningHandler<P> = (param: P, onComplete: VoidFunction) => boolean;

/**
 * Executes a series of warning handler functions sequentially with priority.
 *
 * Logic:
 * - Iterates through the array of warning handlers in order.
 * - Each handler receives its associated parameter and the `onComplete` callback.
 * - If a handler returns `true` (active), the chain stops immediately.
 *   The handler is responsible for calling `onComplete` when it finishes.
 * - If a handler returns `false`, processing continues to the next handler.
 * - If no handler is active, `onComplete` is called after all handlers have run.
 *
 * @param {Array} handlers - An array of tuples: [handler function, its parameter].
 * @param {VoidFunction} onComplete - Callback function to be called when processing is complete.
 */
export function runPriorityWarningModalHandlers<
  THandlers extends readonly [WarningHandler<any>, any][]
> (
  handlers: [...THandlers],
  onComplete: VoidFunction
): void {
  for (const [fn, param] of handlers) {
    // Call the handler with param and onComplete
    const handled = fn(param, onComplete);

    if (handled) {
      // If the handler is active, stop processing further handlers
      return;
    }
  }

  // If no handler was active, call onComplete at the end
  onComplete();
}
