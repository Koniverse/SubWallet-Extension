// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _AssetType } from '@subwallet/chain-list/types';
import { APIItemState } from '@subwallet/extension-base/background/KoniTypes';
import { ASTAR_REFRESH_BALANCE_INTERVAL, SUB_TOKEN_REFRESH_BALANCE_INTERVAL } from '@subwallet/extension-base/constants';
import { getERC20Contract, getMulticall3Contract } from '@subwallet/extension-base/koni/api/contract-handler/evm/web3';
import { evmToSs58 } from '@subwallet/extension-base/services/balance-service/transfer/xcm/bittensorBridge/utils';
import { _BALANCE_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { _EvmApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getAssetNetuid, _getContractAddressOfToken } from '@subwallet/extension-base/services/chain-service/utils';
import { TaoStakeInfo } from '@subwallet/extension-base/services/earning-service/handlers/native-staking/tao';
import { BalanceItem, SubscribeEvmPalletBalance } from '@subwallet/extension-base/types';
import { filterAssetsByChainAndType, processInChunks } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { Contract } from 'web3-eth-contract';

import { BN } from '@polkadot/util';

/** How many (token × address) pairs to include per Multicall3 batch. */
const MULTICALL_BATCH_SIZE = 100;

/** How many addresses to fetch per chunk when falling back to individual calls. */
const FALLBACK_ADDRESS_CHUNK = 10;

/** How many tokens to fetch per chunk when falling back to individual calls. */
const FALLBACK_TOKEN_CHUNK = 5;

/** Milliseconds to wait between fallback chunks to avoid rate limits. */
const FALLBACK_CHUNK_DELAY_MS = 80;

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface Multicall3Call {
  target: string;
  allowFailure: boolean;
  callData: string;
}

interface Multicall3Result {
  success: boolean;
  returnData: string;
}

interface CallEntry {
  tokenSlug: string;
  address: string;
}

interface AddressEntry {
  address: string;
  index: number;
}

// ---------------------------------------------------------------------------
// Multicall3 helpers
// ---------------------------------------------------------------------------

/**
 * Fetches ERC-20 balances for all (token, address) pairs in a single
 * Multicall3 call (or multiple batched calls if the pair count exceeds
 * MULTICALL_BATCH_SIZE).
 *
 * Returns a nested map:  tokenSlug → address → rawBalance (decimal string).
 */
async function fetchERC20BalancesViaMulticall (addresses: string[], tokenList: Record<string, ReturnType<typeof filterAssetsByChainAndType>[string]>, multicall3Address: string, evmApi: _EvmApi, erc20ContractMap: Record<string, Contract>): Promise<Record<string, Record<string, string>>> {
  const web3 = evmApi.api;
  const multicall = getMulticall3Contract(multicall3Address, evmApi);

  // Build full call + metadata list
  const allCalls: Multicall3Call[] = [];
  const allEntries: CallEntry[] = [];

  for (const tokenInfo of Object.values(tokenList)) {
    const contract = erc20ContractMap[tokenInfo.slug];

    if (!contract) {
      continue;
    }

    const contractAddress: string = contract.options.address;

    for (const address of addresses) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const callData = contract.methods.balanceOf(address).encodeABI() as string;

      allCalls.push({ target: contractAddress, allowFailure: true, callData });
      allEntries.push({ tokenSlug: tokenInfo.slug, address });
    }
  }

  const balanceMap: Record<string, Record<string, string>> = {};

  if (allCalls.length === 0) {
    return balanceMap;
  }

  // Process in batches to avoid hitting node request-size limits
  for (let i = 0; i < allCalls.length; i += MULTICALL_BATCH_SIZE) {
    const callBatch = allCalls.slice(i, i + MULTICALL_BATCH_SIZE);
    const entryBatch = allEntries.slice(i, i + MULTICALL_BATCH_SIZE);

    let results: Multicall3Result[];

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      results = await multicall.methods.aggregate3(callBatch).call() as Multicall3Result[];
    } catch (err) {
      console.error('[Multicall3] batch failed, zeroing entries', err);
      results = callBatch.map(() => ({ success: false, returnData: '0x' }));
    }

    results.forEach((result, idx) => {
      const { address, tokenSlug } = entryBatch[idx];

      if (!balanceMap[tokenSlug]) {
        balanceMap[tokenSlug] = {};
      }

      if (result.success && result.returnData !== '0x' && result.returnData !== '0x0') {
        try {
          const decoded = web3.eth.abi.decodeParameter('uint256', result.returnData) as unknown as string;

          balanceMap[tokenSlug][address] = decoded;
        } catch {
          balanceMap[tokenSlug][address] = '0';
        }
      } else {
        balanceMap[tokenSlug][address] = '0';
      }
    });
  }

  return balanceMap;
}

/**
 * Fallback path: fetches ERC-20 balances with individual calls but spreads
 * them across time using chunking to avoid burst rate-limiting.
 */
async function fetchERC20BalancesViaChunks (addresses: string[], tokenList: Record<string, ReturnType<typeof filterAssetsByChainAndType>[string]>, erc20ContractMap: Record<string, Contract>, callback: (items: BalanceItem[]) => void): Promise<void> {
  await processInChunks(
    Object.values(tokenList),
    async (tokenChunk) => {
      await Promise.all(tokenChunk.map(async (tokenInfo) => {
        try {
          const contract = erc20ContractMap[tokenInfo.slug];

          if (!contract) {
            return;
          }

          await processInChunks(addresses, async (addrChunk) => {
            const balances = await Promise.all(
              addrChunk.map(async (address): Promise<string> => {
                try {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                  return await contract.methods.balanceOf(address).call() as string;
                } catch (e) {
                  console.error(`[ERC20 fallback] balanceOf failed: address=${address} token=${tokenInfo.slug}`, e);

                  return '0';
                }
              })
            );

            const items: BalanceItem[] = balances.map((balance, i): BalanceItem => ({
              address: addrChunk[i],
              tokenSlug: tokenInfo.slug,
              free: new BN(balance || 0).toString(),
              locked: '0',
              state: APIItemState.READY
            }));

            callback(items);
          }, FALLBACK_ADDRESS_CHUNK, FALLBACK_CHUNK_DELAY_MS);
        } catch (err) {
          console.error(`[ERC20 fallback] token=${tokenInfo.slug}`, err);
        }
      })
      );
    }, FALLBACK_TOKEN_CHUNK, FALLBACK_CHUNK_DELAY_MS);
}

async function fetchEVMNativeBalancesViaMulticall (addresses: string[], multicall3Address: string, evmApi: _EvmApi): Promise<string[]> {
  const web3 = evmApi.api;
  const multicall = getMulticall3Contract(multicall3Address, evmApi);

  const calls: Multicall3Call[] = addresses.map((address) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const callData = multicall.methods.getEthBalance(address).encodeABI() as string;

    return {
      target: multicall3Address,
      allowFailure: true,
      callData
    };
  });

  let results: Multicall3Result[];

  try {
    // Single RPC call for all addresses
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    results = await multicall.methods.aggregate3(calls).call() as Multicall3Result[];
  } catch (err) {
    console.error('[Multicall3] fetchNativeBalancesViaMulticall failed, will fall back to individual calls', err);

    return [];
  }

  return results.map((result) => {
    if (result.success && result.returnData !== '0x' && result.returnData !== '0x0') {
      try {
        return web3.eth.abi.decodeParameter('uint256', result.returnData) as unknown as string;
      } catch {
        return '0';
      }
    }

    return '0';
  });
}

async function fetchEVMNativeBalancesViaChunks (addresses: string[], evmApi: _EvmApi): Promise<string[]> {
  const results: string[] = new Array<string>(addresses.length).fill('0');

  await processInChunks(addresses.map((address, index): AddressEntry => ({ address, index })), async (chunk) => {
    const settled = await Promise.allSettled(
      chunk.map(({ address }) => evmApi.api.eth.getBalance(address))
    );

    settled.forEach((outcome, i) => {
      const originalIdx = chunk[i].index;

      if (outcome.status === 'fulfilled') {
        results[originalIdx] = outcome.value;
      } else {
        console.error(`[subscribeEVMBalance] getBalance failed: address=${chunk[i].address}`, outcome.reason);
        results[originalIdx] = '0';
      }
    });
  }, FALLBACK_ADDRESS_CHUNK, FALLBACK_CHUNK_DELAY_MS);

  return results;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function subscribeERC20Interval ({ addresses, assetMap, callback, chainInfo, evmApi }: SubscribeEvmPalletBalance): () => void {
  const chain = chainInfo.slug;
  const multicall3Address = chainInfo.evmInfo?.multicall3 || null;

  let tokenList = filterAssetsByChainAndType(assetMap, chain, [_AssetType.ERC20]);

  if (_BALANCE_CHAIN_GROUP.moonbeam.includes(chain)) {
    const moonbeamLocal = filterAssetsByChainAndType(assetMap, chain, [_AssetType.LOCAL]);

    tokenList = { ...tokenList, ...moonbeamLocal };
  }

  const erc20ContractMap = {} as Record<string, Contract>;

  Object.entries(tokenList).forEach(([slug, tokenInfo]) => {
    erc20ContractMap[slug] = getERC20Contract(_getContractAddressOfToken(tokenInfo), evmApi);
  });

  let cancelled = false;

  const getTokenBalances = async (): Promise<void> => {
    if (cancelled) {
      return;
    }

    try {
      if (multicall3Address) {
        const balanceMap = await fetchERC20BalancesViaMulticall(addresses, tokenList, multicall3Address, evmApi, erc20ContractMap);

        if (cancelled) {
          return;
        }

        const items: BalanceItem[] = [];

        for (const [tokenSlug, addressMap] of Object.entries(balanceMap)) {
          for (const [address, free] of Object.entries(addressMap)) {
            items.push({
              address,
              tokenSlug,
              free: new BN(free || 0).toString(),
              locked: '0',
              state: APIItemState.READY
            });
          }
        }

        if (items.length > 0) {
          callback(items);
        }
      } else {
        await fetchERC20BalancesViaChunks(addresses, tokenList, erc20ContractMap, (items) => {
          if (!cancelled) {
            callback(items);
          }
        });
      }
    } catch (err) {
      console.error('[subscribeERC20Interval]', err);
    }
  };

  getTokenBalances().catch(console.error);

  const interval = setInterval(() => {
    getTokenBalances().catch(console.error);
  }, SUB_TOKEN_REFRESH_BALANCE_INTERVAL);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}

export function subscribeERC20IntervalForSubtensorEvm ({ addresses, assetMap, callback, chainInfo, evmApi: _evmApi, substrateApiMap }: SubscribeEvmPalletBalance): () => void {
  const chain = chainInfo.slug;
  const tokenList = filterAssetsByChainAndType(assetMap, chain, [_AssetType.ERC20]);

  let cancelled = false;

  const getTokenBalances = async () => {
    if (cancelled) {
      return;
    }

    await Promise.all(
      Object.values(tokenList).map(async (tokenInfo) => {
        try {
          if (!tokenInfo.metadata?.isAlphaToken || !substrateApiMap) {
            return;
          }

          // Map EVM addresses → SS58 for the substrate call
          const ss58ToEvmMap: Record<string, string> = {};
          const subtensorEvmSs58Addresses: string[] = [];

          addresses.forEach((address) => {
            const ss58Address = evmToSs58(address);

            subtensorEvmSs58Addresses.push(ss58Address);
            ss58ToEvmMap[ss58Address] = address;
          });

          if (cancelled) {
            return;
          }

          const substrateApi = await substrateApiMap.bittensor.isReady;
          const rawData = await substrateApi.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkeys(
            subtensorEvmSs58Addresses
          );

          if (cancelled) {
            return;
          }

          const values = rawData.toPrimitive() as Array<[string, TaoStakeInfo[]]>;
          const converted: Record<string, Record<number, BigN>> = {};

          for (let i = 0; i < values.length; i++) {
            const [, stakes] = values[i];
            const s58Address = subtensorEvmSs58Addresses[i];
            const address = ss58ToEvmMap[s58Address];

            if (!address) {
              continue;
            }

            converted[address] = {};

            stakes.forEach((stakeInfo) => {
              const { netuid, stake } = stakeInfo;
              const currentValue = converted[address][netuid] || BigN(0);

              converted[address][netuid] = currentValue.plus(stake);
            });
          }

          const netuid = _getAssetNetuid(tokenInfo);
          const items: BalanceItem[] = Object.entries(converted).map(([address, stakeMap]): BalanceItem => {
            const value = stakeMap[netuid] || BigN(0);

            return {
              address,
              tokenSlug: tokenInfo.slug,
              state: APIItemState.READY,
              free: value.toFixed(0),
              locked: '0'
            };
          });

          if (!cancelled && items.length > 0) {
            callback(items);
          }
        } catch (err) {
          console.error(`[subscribeERC20IntervalForSubtensorEvm] token=${tokenInfo.slug}`, err);
        }
      })
    );
  };

  getTokenBalances().catch(console.error);

  const interval = setInterval(() => {
    getTokenBalances().catch(console.error);
  }, SUB_TOKEN_REFRESH_BALANCE_INTERVAL);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}

async function fetchEVMNativeBalances (addresses: string[], chainInfo: SubscribeEvmPalletBalance['chainInfo'], evmApi: _EvmApi): Promise<string[]> {
  if (!addresses.length) {
    return [];
  }

  const multicall3Address = chainInfo.evmInfo?.multicall3 ?? null;

  if (!multicall3Address) {
    return fetchEVMNativeBalancesViaChunks(addresses, evmApi);
  }

  try {
    return await fetchEVMNativeBalancesViaMulticall(addresses, multicall3Address, evmApi);
  } catch (e) {
    console.error('[Multicall3] native balance batch failed, fallback to individual calls', e);

    return fetchEVMNativeBalancesViaChunks(addresses, evmApi);
  }
}

export function subscribeEVMBalance (params: SubscribeEvmPalletBalance): () => void {
  const { addresses, assetMap, callback, chainInfo, evmApi } = params;
  const chain = chainInfo.slug;
  const nativeTokenInfo = filterAssetsByChainAndType(assetMap, chain, [_AssetType.NATIVE]);
  const nativeTokenSlug = Object.values(nativeTokenInfo)[0]?.slug || '';

  let cancelled = false;

  const getBalance = async (): Promise<void> => {
    if (cancelled) {
      return;
    }

    try {
      const balances = await fetchEVMNativeBalances(addresses, chainInfo, evmApi);

      if (cancelled) {
        return;
      }

      const items: BalanceItem[] = balances.map((balance, index): BalanceItem => ({
        address: addresses[index],
        tokenSlug: nativeTokenSlug,
        state: APIItemState.READY,
        free: new BN(balance || '0').toString(),
        locked: '0'
      }));

      callback(items);
    } catch (e) {
      console.error(`[subscribeEVMBalance] native token=${nativeTokenSlug}`, e);

      if (!cancelled) {
        callback(
          addresses.map((address): BalanceItem => ({
            address,
            tokenSlug: nativeTokenSlug,
            state: APIItemState.READY,
            free: '0',
            locked: '0'
          }))
        );
      }
    }
  };

  getBalance().catch(console.error);

  const interval = setInterval(() => {
    getBalance().catch(console.error);
  }, ASTAR_REFRESH_BALANCE_INTERVAL);
  const unsubERC20 = subscribeERC20Interval(params);
  const unsubSubtensor = subscribeERC20IntervalForSubtensorEvm(params);

  return () => {
    cancelled = true;
    clearInterval(interval);
    unsubERC20();
    unsubSubtensor();
  };
}
