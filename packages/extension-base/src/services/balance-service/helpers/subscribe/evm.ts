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
 * A balance read that failed is `undefined`, never '0': callers skip it so the
 * last known balance stays instead of an RPC error showing up as a zero balance.
 */
type BalanceResult = string | undefined;

function decodeUint256 (evmApi: _EvmApi, returnData: string): string {
  if (returnData === '0x' || returnData === '0x0') {
    return '0';
  }

  try {
    return evmApi.api.eth.abi.decodeParameter('uint256', returnData) as unknown as string;
  } catch {
    return '0';
  }
}

async function fetchERC20BalanceOf (contract: Contract | undefined, address: string, tokenSlug: string): Promise<BalanceResult> {
  if (!contract) {
    return undefined;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    return await contract.methods.balanceOf(address).call() as string;
  } catch (e) {
    console.error(`[ERC20 fallback] balanceOf failed: address=${address} token=${tokenSlug}`, e);

    return undefined;
  }
}

/**
 * Fetches ERC-20 balances for all (token, address) pairs in a single
 * Multicall3 call (or multiple batched calls if the pair count exceeds
 * MULTICALL_BATCH_SIZE). Pairs whose batch failed or whose call reverted are
 * retried with individual calls.
 *
 * Returns a nested map:  tokenSlug → address → rawBalance (decimal string).
 * Pairs that still fail are left out.
 */
async function fetchERC20BalancesViaMulticall (addresses: string[], tokenList: Record<string, ReturnType<typeof filterAssetsByChainAndType>[string]>, multicall3Address: string, evmApi: _EvmApi, erc20ContractMap: Record<string, Contract>): Promise<Record<string, Record<string, string>>> {
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
  const failedEntries: CallEntry[] = [];

  const setBalance = ({ address, tokenSlug }: CallEntry, balance: string) => {
    if (!balanceMap[tokenSlug]) {
      balanceMap[tokenSlug] = {};
    }

    balanceMap[tokenSlug][address] = balance;
  };

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
      console.error('[Multicall3] ERC-20 batch failed, falling back to individual calls', err);
      failedEntries.push(...entryBatch);

      continue;
    }

    results.forEach((result, idx) => {
      if (result.success) {
        setBalance(entryBatch[idx], decodeUint256(evmApi, result.returnData));
      } else {
        failedEntries.push(entryBatch[idx]);
      }
    });
  }

  await processInChunks(failedEntries, async (chunk) => {
    await Promise.all(chunk.map(async (entry) => {
      const balance = await fetchERC20BalanceOf(erc20ContractMap[entry.tokenSlug], entry.address, entry.tokenSlug);

      if (balance !== undefined) {
        setBalance(entry, balance);
      }
    }));
  }, FALLBACK_ADDRESS_CHUNK, FALLBACK_CHUNK_DELAY_MS);

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
              addrChunk.map((address) => fetchERC20BalanceOf(contract, address, tokenInfo.slug))
            );

            const items: BalanceItem[] = [];

            balances.forEach((balance, i) => {
              if (balance !== undefined) {
                items.push({
                  address: addrChunk[i],
                  tokenSlug: tokenInfo.slug,
                  free: new BN(balance || 0).toString(),
                  locked: '0',
                  state: APIItemState.READY
                });
              }
            });

            items.length && callback(items);
          }, FALLBACK_ADDRESS_CHUNK, FALLBACK_CHUNK_DELAY_MS);
        } catch (err) {
          console.error(`[ERC20 fallback] token=${tokenInfo.slug}`, err);
        }
      })
      );
    }, FALLBACK_TOKEN_CHUNK, FALLBACK_CHUNK_DELAY_MS);
}

/**
 * Throws when the batch call itself fails so the caller can fall back to
 * individual calls; addresses whose call failed inside the batch are `undefined`.
 */
async function fetchEVMNativeBalancesViaMulticall (addresses: string[], multicall3Address: string, evmApi: _EvmApi): Promise<BalanceResult[]> {
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

  // Single RPC call for all addresses
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const results = await multicall.methods.aggregate3(calls).call() as Multicall3Result[];

  return addresses.map((_, index) => {
    const result = results[index];

    return result?.success ? decodeUint256(evmApi, result.returnData) : undefined;
  });
}

async function fetchEVMNativeBalancesViaChunks (addresses: string[], evmApi: _EvmApi): Promise<BalanceResult[]> {
  const results = new Array<BalanceResult>(addresses.length).fill(undefined);

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
  const alphaTokens = Object.values(filterAssetsByChainAndType(assetMap, chain, [_AssetType.ERC20]))
    .filter((tokenInfo) => tokenInfo.metadata?.isAlphaToken);

  let cancelled = false;

  const getTokenBalances = async () => {
    if (cancelled || !alphaTokens.length || !substrateApiMap) {
      return;
    }

    try {
      // Map EVM addresses → SS58 for the substrate call
      const ss58ToEvmMap: Record<string, string> = {};
      const subtensorEvmSs58Addresses: string[] = [];

      addresses.forEach((address) => {
        const ss58Address = evmToSs58(address);

        subtensorEvmSs58Addresses.push(ss58Address);
        ss58ToEvmMap[ss58Address] = address;
      });

      // One stake query per refresh for every alpha token, then split by netuid
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

      const items: BalanceItem[] = alphaTokens.flatMap((tokenInfo) => {
        const netuid = _getAssetNetuid(tokenInfo);

        return Object.entries(converted).map(([address, stakeMap]): BalanceItem => {
          const value = stakeMap[netuid] || BigN(0);

          return {
            address,
            tokenSlug: tokenInfo.slug,
            state: APIItemState.READY,
            free: value.toFixed(0),
            locked: '0'
          };
        });
      });

      if (!cancelled && items.length > 0) {
        callback(items);
      }
    } catch (err) {
      console.error(`[subscribeERC20IntervalForSubtensorEvm] chain=${chain}`, err);
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

async function fetchEVMNativeBalances (addresses: string[], chainInfo: SubscribeEvmPalletBalance['chainInfo'], evmApi: _EvmApi): Promise<BalanceResult[]> {
  if (!addresses.length) {
    return [];
  }

  const multicall3Address = chainInfo.evmInfo?.multicall3 ?? null;

  if (!multicall3Address) {
    return fetchEVMNativeBalancesViaChunks(addresses, evmApi);
  }

  let balances: BalanceResult[];

  try {
    balances = await fetchEVMNativeBalancesViaMulticall(addresses, multicall3Address, evmApi);
  } catch (e) {
    console.error('[Multicall3] native balance batch failed, fallback to individual calls', e);

    return fetchEVMNativeBalancesViaChunks(addresses, evmApi);
  }

  // Retry only the addresses whose call failed inside the batch
  const failedIndexes = balances.flatMap((balance, index) => balance === undefined ? [index] : []);

  if (failedIndexes.length) {
    const retried = await fetchEVMNativeBalancesViaChunks(failedIndexes.map((index) => addresses[index]), evmApi);

    failedIndexes.forEach((addressIndex, i) => {
      balances[addressIndex] = retried[i];
    });
  }

  return balances;
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

      const items: BalanceItem[] = [];

      // Failed reads are skipped so the last known balance stays instead of becoming 0
      balances.forEach((balance, index) => {
        if (balance !== undefined) {
          items.push({
            address: addresses[index],
            tokenSlug: nativeTokenSlug,
            state: APIItemState.READY,
            free: new BN(balance || '0').toString(),
            locked: '0'
          });
        }
      });

      items.length && callback(items);
    } catch (e) {
      console.error(`[subscribeEVMBalance] native token=${nativeTokenSlug}`, e);
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
