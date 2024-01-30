// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

interface Data {
  limit: number;
  offset: number;
  total: number;
  results: Array<any>;
}

interface BRC20 {
  ticker: string,
  available_balance: string,
  transferrable_balance: string,
  overall_balance?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getBRC20Balances (address: string, callback: any) {
  const pageSize = 50;
  let offset = 0;

  try {
    while (true) {
      const response = await fetch(
        `https://api.hiro.so/ordinals/v1/brc-20/balances/bc1prtawdt82wfgrujx6d0heu0smxt4yykq440t447wan88csf3mc7csm3ulcn?offset=${offset}&limit=${pageSize}`, { // TODO: update to adrress
          method: 'GET',
          headers: {
            Accept: 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      // return await response.json();

      const data: Data = await response.json() as Data;

      if (data.results.length !== 0) {
        callback(data.results);
        offset += data.limit;
      } else {
        break;
      }
    }
  } catch (error) {
    console.error(`Failed to get brc-20 balances of address: ${address}`, error);
  }
}

export async function fetchBRC20 (address: string) {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return new Promise<BRC20[]>((resolve, reject) => {
    const allBRC20: BRC20[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getBRC20Balances(address, async (data: any) => {
      try {
        if (data) {
          const BRC20Promises: Promise<BRC20>[] = data.map((brc20: {ticker: any, available_balance: any, transferrable_balance: any}) => {
            return {
              ticker: brc20.ticker,
              available_balance: brc20.available_balance,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              transferrable_balance: brc20.transferrable_balance
            };
          });

          const batchResults = (await Promise.all(BRC20Promises)).filter(Boolean);

          allBRC20.push(...batchResults);

          // Check if this is the last batch
          if (data.length < 50) {
            resolve(allBRC20);
          }
        } else {
          resolve([]);
        }
      } catch (error) {
        reject(error);
      }
    });
  });
}
