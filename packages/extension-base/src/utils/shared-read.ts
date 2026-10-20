// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

/**
 * One chain read shared by every caller asking for the same key within `ttl` ms, including callers that
 * arrive while it is in flight. A failed read is dropped, so the next caller asks the chain again.
 */
export class SharedRead<T> {
  private readonly entries = new Map<string, { at: number, value: Promise<T> }>();
  private readonly ttl: number;

  constructor (ttl: number) {
    this.ttl = ttl;
  }

  public get (key: string, read: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const entry = this.entries.get(key);

    if (entry && now - entry.at < this.ttl) {
      return entry.value;
    }

    // Expired reads are dropped as new ones come in, so keys like amounts do not pile up
    this.entries.forEach((item, itemKey) => {
      if (now - item.at >= this.ttl) {
        this.entries.delete(itemKey);
      }
    });

    // `read` may throw before it returns a promise, as a call the runtime no longer has does
    const value = Promise.resolve().then(read);

    this.entries.set(key, { at: now, value });
    value.catch(() => {
      if (this.entries.get(key)?.value === value) {
        this.entries.delete(key);
      }
    });

    return value;
  }
}
