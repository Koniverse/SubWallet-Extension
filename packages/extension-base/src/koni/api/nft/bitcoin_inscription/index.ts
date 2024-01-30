// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { BaseNftApi, HandleNftParams } from '@subwallet/extension-base/koni/api/nft/nft';

interface Inscription {
  id: string;
  number: number;
  address: string;
  block: number;
  block_hash: string;
  timestamp: number;
  tx_id: string;
  location: string;
  output: string;
  value: number;
  fee: number;
  sat_ordinal: number;
  sat_rarity: string;
  content_type: string;
  content_length: number;
  content: any;
}

interface Data {
  limit: number;
  offset: number;
  total: number;
  results: Array<unknown>;
}

const TEST_ADDRESS = 'bc1p5zy5mrjfz00lr7nvy3vzvusdws85ldxzrqxacgajqwurc70wqsqsdx5ye6';

async function getBalances (address: string, callback: any) {
  const pageSize = 50;
  let offset = 0;

  try {
    while (true) {
      const response = await fetch(
        `https://api.hiro.so/ordinals/v1/inscriptions?address=${address}&limit=${pageSize}&offset=${offset}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const data: Data = await response.json() as Data;

      if (data.results.length !== 0) {
        (callback as (results: Array<unknown>) => void)(data.results);
        offset += data.limit;
      } else {
        break;
      }
    }
  } catch (error) {
    console.error(`Failed to get ${address} balances`, error);
  }
}

async function getInscriptionContent (id: string) {
  try {
    const response = await fetch(
      `https://api.hiro.so/ordinals/v1/inscriptions/${id}/content`, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch data. Status: ${response.status}`);
    }

    // return await response.blob(); // Display the image
    return await response.text();
  } catch (error) {
    console.error(`Failed to get content of ordinal with id: ${id}`, error);
  }

  return null;
}

async function fetchInscriptions (address: string) {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor, @typescript-eslint/require-await
  return new Promise<Inscription[]>(async (resolve, reject) => {
    const allInscriptions: Inscription[] = [];

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getBalances(TEST_ADDRESS, async (data: any) => { // TODO: need to update address
      try {
        if (data) {
          const InscriptionsPromises: Promise<Inscription | undefined>[] = data.map(async (insc: { id: string; number: number; address: string; genesis_block_height: number; genesis_block_hash: string; genesis_timestamp: number; genesis_tx_id: string; location: string; output: string; value: number; genesis_fee: number; sat_ordinal: number; sat_rarity: string; content_type: string; content_length: number; }) => {
            if (insc.content_type === 'text/plain') {
              return undefined;
            }

            const content = await getInscriptionContent(insc.id);

            return {
              id: insc.id,
              number: insc.number,
              address: insc.address,
              block: parseInt(insc.genesis_block_height),
              block_hash: insc.genesis_block_hash,
              timestamp: insc.genesis_timestamp,
              tx_id: insc.genesis_tx_id,
              location: insc.location,
              output: insc.output,
              value: parseInt(insc.value),
              fee: parseInt(insc.genesis_fee),
              sat_ordinal: parseInt(insc.sat_ordinal),
              sat_rarity: insc.sat_rarity,
              content_type: insc.content_type,
              content_length: insc.content_length,
              content: content
            };
          });

          const batchResults = (await Promise.all(InscriptionsPromises)).filter(Boolean) as Inscription[];

          allInscriptions.push(...batchResults);

          // Check if this is the last batch
          if (data.length < 50) {
            resolve(allInscriptions);
          }
        } else {
          // If there's no data, resolve with an empty array
          resolve([]);
        }
      } catch (error) {
        reject(error);
      }
    });
  });
}

export default class BitcoinInscriptionApi extends BaseNftApi {
  constructor (chain: string, addresses: string[]) {
    super(chain, undefined, addresses);
  }

  // public async getInscriptions(address: string): Inscription[] {
  //     // TODO: return inscriptions of address.
  // }
  public async handleNft (address: string, params: HandleNftParams) {
    const items = await fetchInscriptions(address);

    if (items) {
      for (const item of items) {
        const parsedNft: NftItem = {
          id: item.id,
          chain: this.chain, // need update
          owner: address, // owner: item.address,
          // name: nft.name,
          // image: item.content,
          // description: nft.description,
          collectionId: 'bitcoin_inscription'
        };

        const parsedCollection: NftCollection = {
          collectionId: 'bitcoin_inscription',
          chain: this.chain
        };

        params.updateItem(this.chain, parsedNft, address);
        params.updateCollection(this.chain, parsedCollection);
      }
    }
  }

  public async handleNfts (params: HandleNftParams) {
    await Promise.all(this.addresses.map((address) => this.handleNft(address, params)));
  }

  public async fetchNfts (params: HandleNftParams): Promise<number> {
    try {
      await this.handleNfts(params);
    } catch (e) {
      return 0;
    }

    return 1;
  }
}
