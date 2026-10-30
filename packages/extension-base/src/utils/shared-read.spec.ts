// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SharedRead } from './shared-read';

describe('One chain read for every caller within its time', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('serves callers arriving during and after the read from one request', async () => {
    const shared = new SharedRead<number>(30000);
    const read = jest.fn(() => Promise.resolve(42));

    const [a, b] = await Promise.all([shared.get('bittensor', read), shared.get('bittensor', read)]);

    expect([a, b, await shared.get('bittensor', read)]).toEqual([42, 42, 42]);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it('reads again once the time is up, and per key', async () => {
    jest.useFakeTimers();

    const shared = new SharedRead<string>(12000);
    const read = jest.fn((key: string) => Promise.resolve(key));

    await shared.get('a', () => read('a'));
    await shared.get('b', () => read('b'));
    jest.advanceTimersByTime(12000);
    await shared.get('a', () => read('a'));

    expect(read.mock.calls.map(([key]) => key)).toEqual(['a', 'b', 'a']);
  });

  it('drops a failed read, so the next caller asks the chain again', async () => {
    const shared = new SharedRead<number>(30000);
    const read = jest.fn()
      .mockImplementationOnce(() => {
        throw new Error('Unknown runtime API');
      })
      .mockImplementationOnce(() => Promise.resolve(7));

    await expect(shared.get('bittensor', read as () => Promise<number>)).rejects.toThrow('Unknown runtime API');
    await expect(shared.get('bittensor', read as () => Promise<number>)).resolves.toBe(7);
    expect(read).toHaveBeenCalledTimes(2);
  });
});
