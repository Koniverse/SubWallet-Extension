// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fetch from 'cross-fetch';

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
    results: Array<any>;
}

interface BRC20 {
    ticker: string,
    available_balance: string,
    transferrable_balance: string,
    overall_balance: string
}

export class BitcoinService {
    // const TEST_ADDRESS = 'bc1psu0gqjuyzc5dtcrqu6ewkfe9y94cnm3pjn4vhgem9nr0hzl6w3hqj24zq9';
    // TEST_ADDRESS = 'bc1p5zy5mrjfz00lr7nvy3vzvusdws85ldxzrqxacgajqwurc70wqsqsdx5ye6';
    // const TEST_ADDRESS = 'bc1q8cpn3zl6lz5xrxdqgx7j68ggcpjm7ctzyds82c';
    
    constructor() {
    }

    async getBalances(address: string, callback: any) {
            const pageSize = 50;
            let offset = 0;
        
            try {
                while (true) {
                    const response = await fetch(
                            `https://api.hiro.so/ordinals/v1/inscriptions?address=${address}&limit=${pageSize}&offset=${offset}`, {
                                    method: 'GET',
                                    headers: {
                                    'Accept': 'application/json'
                                    }
                            }
                    );
        
                    if (!response.ok) {
                            throw new Error(`Failed to fetch data. Status: ${response.status}`);
                    }
    
                    const data: Data = await response.json() as Data;
                    if (data['results'].length !== 0) {
                        callback(data['results']);
                        offset += data['limit'];
                    } else {
                        break;
                    }
                }
            } catch (error) {
                console.error(`Failed to get ${address} balances`, error);
            }
    }

    async getInscriptionContent(id: string) {
        try {
            const response = await fetch(
                `https://api.hiro.so/ordinals/v1/inscriptions/${id}/content`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
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

    async fetchInscriptions(address: string) {
        return new Promise<Inscription[]>(async (resolve, reject) => {
            const allInscriptions: Inscription[] = [];
    
            this.getBalances(address, async (data: any) => {
                try {
                    if (data) {
                        const InscriptionsPromises: Promise<Inscription | undefined>[] = data.map(async (insc: { id: string; number: any; address: any; genesis_block_height: string; genesis_block_hash: any; genesis_timestamp: any; genesis_tx_id: any; location: any; output: any; value: string; genesis_fee: string; sat_ordinal: string; sat_rarity: any; content_type: any; content_length: any; }) => {
                            if (insc.content_type === 'text/plain') {
                                return undefined;
                            }
                            const content = await this.getInscriptionContent(insc.id);
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
                                content: content,
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

    async getBRC20Balances(address: string, callback: any) {
        const pageSize = 50;
        let offset = 0;

        try {
            while (true) {
                const response = await fetch(
                        `https://api.hiro.so/ordinals/v1/brc-20/balances/${address}?offset=${offset}&limit=${pageSize}`, {
                                method: 'GET',
                                headers: {
                                'Accept': 'application/json'
                                }
                        }
                );

                if (!response.ok) {
                        throw new Error(`Failed to fetch data. Status: ${response.status}`);
                }

                // return await response.json();
                
                const data: Data = await response.json() as Data;
                
                if (data['results'].length !== 0) {
                    callback(data['results']);
                    offset += data['limit'];
                } else {
                    break;
                }
            }
        } catch (error) {
            console.error(`Failed to get brc-20 balances of address: ${address}`, error);
          }
    }

    // async handleBRC20() {
    //     try {
    //         const balances = await this.getBRC20Balances(this.TEST_ADDRESS);
    //         if (balances) {
    //             const BRC20_list: BRC20[] = balances.map((brc20: { ticker: string; available_balance: string; transferrable_balance: string; overall_balance: string; }) => {
    //               return {
    //                 ticker: brc20.ticker,
    //                 available_balance: brc20.available_balance,
    //                 transferrable_balance: brc20.transferrable_balance,
    //                 overall_balance: brc20.overall_balance,
    //               };
    //         });

    //             console.log(BRC20_list);
    //         }
    
    //     } catch (error) {
    //     console.error(`Failed to fetch brc20`, error);
    //     }
    // }
}