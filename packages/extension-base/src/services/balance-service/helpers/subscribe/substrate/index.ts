// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _AssetType, _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { APIItemState, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { CRON_REFRESH_PRICE_INTERVAL, SUB_TOKEN_REFRESH_BALANCE_INTERVAL } from '@subwallet/extension-base/constants';
import { _getAssetsPalletLocked, _getAssetsPalletTransferable } from '@subwallet/extension-base/core/substrate/assets-pallet';
import { _getForeignAssetPalletLockedBalance, _getForeignAssetPalletTransferable } from '@subwallet/extension-base/core/substrate/foreign-asset-pallet';
import { _getTotalStakeInNominationPool } from '@subwallet/extension-base/core/substrate/nominationpools-pallet';
import { _getOrmlTokensPalletLockedBalance, _getOrmlTokensPalletTransferable } from '@subwallet/extension-base/core/substrate/ormlTokens-pallet';
import { _getSystemPalletReservedBalance, _getSystemPalletTotalBalance, _getSystemPalletTransferable } from '@subwallet/extension-base/core/substrate/system-pallet';
import { _getTokensPalletLocked, _getTokensPalletTransferable } from '@subwallet/extension-base/core/substrate/tokens-pallet';
import { FrameBalancesFreezesInfo, FrameBalancesHoldsInfo, FrameBalancesLocksInfo, FrameSystemAccountInfo, OrmlTokensAccountData, PalletAssetsAssetAccount, PalletAssetsAssetAccountWithStatus, PalletNominationPoolsPoolMember } from '@subwallet/extension-base/core/substrate/types';
import { _adaptX1Interior } from '@subwallet/extension-base/core/substrate/xcm-parser';
import { getPSP22ContractPromise } from '@subwallet/extension-base/koni/api/contract-handler/wasm';
import { getDefaultWeightV2 } from '@subwallet/extension-base/koni/api/contract-handler/wasm/utils';
import { _BALANCE_CHAIN_GROUP, _BALANCE_LOCKED_ID_GROUP, _MANTA_ZK_CHAIN_GROUP, _ZK_ASSET_PREFIX } from '@subwallet/extension-base/services/chain-service/constants';
import { _EvmApi, _SubstrateAdapterSubscriptionArgs, _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _checkSmartContractSupportByChain, _getAssetExistentialDeposit, _getAssetNetuid, _getChainExistentialDeposit, _getChainNativeTokenSlug, _getContractAddressOfToken, _getTokenOnChainAssetId, _getTokenOnChainInfo, _getTokenTypesSupportedByChain, _getXcmAssetMultilocation, _isBridgedToken, _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { TaoStakeInfo } from '@subwallet/extension-base/services/earning-service/handlers/native-staking/tao';
import { BalanceItem, LockedBalanceDetails, SubscribeBasePalletBalance, SubscribeSubstratePalletBalance } from '@subwallet/extension-base/types';
import { filterAlphaAssetsByChain, filterAssetsByChainAndType } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { timer } from 'rxjs';

import { ContractPromise } from '@polkadot/api-contract';

import { subscribeERC20Interval } from '../evm';
import { subscribeEquilibriumTokenBalance } from './equilibrium';
import { subscribeGRC20Balance, subscribeVftBalance } from './gear';

export const subscribeSubstrateBalance = async (addresses: string[], chainInfo: _ChainInfo, assetMap: Record<string, _ChainAsset>, substrateApi: _SubstrateApi, evmApi: _EvmApi, callback: (rs: BalanceItem[]) => void, extrinsicType?: ExtrinsicType) => {
  let unsubNativeToken: () => void;
  let unsubLocalToken: () => void;
  let unsubEvmContractToken: () => void;
  let unsubWasmContractToken: () => void;
  let unsubBridgedToken: () => void;
  let unsubGrcToken: () => void;
  let unsubVftToken: () => void;
  let unsubSubnetAlphaToken: () => void;

  const chain = chainInfo.slug;
  const baseParams: SubscribeBasePalletBalance = {
    addresses,
    chainInfo,
    assetMap,
    callback,
    extrinsicType
  };

  const substrateParams: SubscribeSubstratePalletBalance = {
    ...baseParams,
    substrateApi
  };

  if (!_BALANCE_CHAIN_GROUP.kintsugi.includes(chain) && !_BALANCE_CHAIN_GROUP.genshiro.includes(chain) && !_BALANCE_CHAIN_GROUP.equilibrium_parachain.includes(chain)) {
    unsubNativeToken = await subscribeWithSystemAccountPallet(substrateParams);
  }

  try {
    if (_BALANCE_CHAIN_GROUP.bifrost.includes(chain)) {
      unsubLocalToken = await subscribeTokensAccountsPallet(substrateParams);
    } else if (_BALANCE_CHAIN_GROUP.kintsugi.includes(chain)) {
      unsubLocalToken = await subscribeTokensAccountsPallet({
        ...substrateParams,
        includeNativeToken: true
      });
    } else if (_BALANCE_CHAIN_GROUP.statemine.includes(chain)) {
      unsubLocalToken = await subscribeAssetsAccountPallet(substrateParams);
    } else if (_BALANCE_CHAIN_GROUP.genshiro.includes(chain) || _BALANCE_CHAIN_GROUP.equilibrium_parachain.includes(chain)) {
      unsubLocalToken = await subscribeEquilibriumTokenBalance({
        ...substrateParams,
        includeNativeToken: true
      });
    } else if (_BALANCE_CHAIN_GROUP.centrifuge.includes(chain)) {
      unsubLocalToken = await subscribeOrmlTokensPallet(substrateParams);
    }

    if (_BALANCE_CHAIN_GROUP.supportBridged.includes(chain)) {
      unsubBridgedToken = await subscribeForeignAssetBalance(substrateParams);
    }

    if (_BALANCE_CHAIN_GROUP.bittensor.includes(chain)) {
      unsubSubnetAlphaToken = await subscribeSubnetAlphaPallet(substrateParams);
    }

    /**
     * Some substrate chain use evm account format but not have evm connection and support ERC20 contract,
     * so we need to check if the chain is compatible with EVM and support ERC20
     * */
    if (_isChainEvmCompatible(chainInfo) && _getTokenTypesSupportedByChain(chainInfo).includes(_AssetType.ERC20)) { // Get sub-token for EVM-compatible chains
      unsubEvmContractToken = subscribeERC20Interval({
        ...baseParams,
        evmApi: evmApi
      });
    }

    if (_checkSmartContractSupportByChain(chainInfo, _AssetType.PSP22)) { // Get sub-token for substrate-based chains
      unsubWasmContractToken = subscribePSP22Balance(substrateParams);
    }

    if (_checkSmartContractSupportByChain(chainInfo, _AssetType.GRC20)) { // Get sub-token for substrate-based chains
      unsubGrcToken = subscribeGRC20Balance(substrateParams);
    }

    if (_checkSmartContractSupportByChain(chainInfo, _AssetType.VFT)) { // Get sub-token for substrate-based chains
      unsubVftToken = subscribeVftBalance(substrateParams);
    }
  } catch (err) {
    console.warn(err);
  }

  return () => {
    unsubNativeToken && unsubNativeToken();
    unsubLocalToken && unsubLocalToken();
    unsubEvmContractToken && unsubEvmContractToken();
    unsubWasmContractToken && unsubWasmContractToken();
    unsubBridgedToken && unsubBridgedToken();
    unsubGrcToken?.();
    unsubVftToken?.();
    unsubSubnetAlphaToken?.();
  };
};

// handler according to different logic
const extractId = (id: string | Record<string, unknown> | undefined): string => {
  if (!id) {
    return '';
  }

  if (typeof id === 'string') {
    return id.replace(/\0/g, '').trim();
  }

  const keys = Object.keys(id);

  return keys.length ? keys[0] : '';
};

// eslint-disable-next-line @typescript-eslint/require-await
const subscribeWithSystemAccountPallet = async ({ addresses, callback, chainInfo, extrinsicType, substrateApi }: SubscribeSubstratePalletBalance) => {
  const systemAccountKey = 'query_system_account';
  const poolMembersKey = 'query_nominationPools_poolMembers';

  const isNominationPoolMigrated = await checkNominationPoolCompleteMigrated(substrateApi);

  const params: _SubstrateAdapterSubscriptionArgs[] = [
    {
      section: 'query',
      module: systemAccountKey.split('_')[1],
      method: systemAccountKey.split('_')[2],
      args: addresses
    }
  ];

  if (!isNominationPoolMigrated) {
    params.push(
      {
        section: 'query',
        module: poolMembersKey.split('_')[1],
        method: poolMembersKey.split('_')[2],
        args: addresses
      }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const subscription = substrateApi.subscribeDataWithMulti(params, async (rs) => {
    // TEMP FIX: Delay to allow locks/holds to sync with system.account
    // TODO: Replace this with a proper sync mechanism
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const balances = rs[systemAccountKey];
    const poolMemberInfos = rs[poolMembersKey];

    let bittensorStakingBalances: BigN[] = new Array<BigN>(addresses.length).fill(new BigN(0));

    if (_BALANCE_CHAIN_GROUP.bittensor.includes(chainInfo.slug)) {
      const rawData = await substrateApi.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkeys(addresses);
      const values: Array<[string, TaoStakeInfo[]]> = rawData.toPrimitive() as Array<[string, TaoStakeInfo[]]>;

      bittensorStakingBalances = values.map(([, stakes]) =>
        stakes.filter((i) => i.netuid === 0).reduce((prev, curr) => prev.plus(curr.stake), BigN(0))
      );
    }

    // Precompute totalLockedFromTransfer for each account to decide if need fetch locks/holds
    const preItems = balances.map((_balance, index) => {
      const balanceInfo = _balance as unknown as FrameSystemAccountInfo;
      const transferableBalance = _getSystemPalletTransferable(balanceInfo, _getChainExistentialDeposit(chainInfo), extrinsicType);
      const totalBalance = _getSystemPalletTotalBalance(balanceInfo);
      let totalLockedFromTransfer = totalBalance - transferableBalance;

      if (!isNominationPoolMigrated) {
        const poolMemberInfo = poolMemberInfos[index] as unknown as PalletNominationPoolsPoolMember;
        const nominationPoolBalance = poolMemberInfo ? _getTotalStakeInNominationPool(poolMemberInfo) : BigInt(0);

        totalLockedFromTransfer += nominationPoolBalance;
      }

      totalLockedFromTransfer += BigInt(bittensorStakingBalances[index].toString());

      return { index, totalLockedFromTransfer, balanceInfo };
    });

    // Filter account's locked > 0
    const accountsWithLocks = preItems.filter((i) => i.totalLockedFromTransfer > 0).map((i) => addresses[i.index]);

    let locks: FrameBalancesLocksInfo[][] = [];
    let holds: FrameBalancesHoldsInfo[][] = [];
    let freezes: FrameBalancesFreezesInfo[][] = [];

    // Fetch locks/holds only for accounts that have locked balances
    if (accountsWithLocks.length > 0) {
      // Fetch locks
      const rawLocks = await substrateApi.api.query.balances.locks.multi(accountsWithLocks);

      locks = rawLocks.map((lockArr) =>
        (lockArr).map((l) => ({
          id: (l.id).toPrimitive(),
          amount: l.amount.toString()
        }))
      ) as FrameBalancesLocksInfo[][];

      // Fetch holds
      const rawHolds = await substrateApi.api.query.balances.holds.multi(accountsWithLocks);

      holds = rawHolds.map((holdArr) =>
        (holdArr).map((h) => ({
          id: (h.id).toPrimitive(),
          amount: h.amount.toString()
        }))
      ) as FrameBalancesHoldsInfo[][];

      const rawFreezes = (await substrateApi.api.query.balances.freezes.multi(accountsWithLocks));

      freezes = rawFreezes.map((freezeArr) =>
        freezeArr.map((f) => ({
          id: f.id.toPrimitive(),
          amount: f.amount.toString()
        }))
      ) as FrameBalancesFreezesInfo[][];
    }

    // Map locks/holds back to original index
    const items: BalanceItem[] = preItems.map(({ balanceInfo, index, totalLockedFromTransfer }) => {
      const lockIndex = accountsWithLocks.indexOf(addresses[index]);
      const lockItems = lockIndex >= 0 ? locks[lockIndex] || [] : [];
      const holdItems = lockIndex >= 0 ? holds[lockIndex] || [] : [];
      const freezeItems = lockIndex >= 0 ? freezes[lockIndex] || [] : [];

      let stakingBalance = new BigN(bittensorStakingBalances[index].toString());
      let govBalance = new BigN(0);
      let democracyBalance = new BigN(0);

      const allLockEntries = [...lockItems, ...holdItems, ...freezeItems];

      for (const entry of allLockEntries) {
        const id = extractId(entry.id);
        const amount = new BigN(String(entry.amount || 0));

        if (_BALANCE_LOCKED_ID_GROUP.staking.includes(id)) {
          stakingBalance = stakingBalance.plus(amount);
        } else if (_BALANCE_LOCKED_ID_GROUP.gov.includes(id)) {
          govBalance = govBalance.plus(amount);
        } else if (_BALANCE_LOCKED_ID_GROUP.democracy.includes(id)) {
          democracyBalance = democracyBalance.plus(amount);
        }
      }

      // others = total locked - max(staking, governance, democracy)
      const reservedBalance = _getSystemPalletReservedBalance(balanceInfo);
      const reservedBalanceBN = new BigN(reservedBalance.toString());

      const maxMainLock = BigN.max(stakingBalance, govBalance, democracyBalance, reservedBalanceBN);
      const othersLockedBalance = new BigN(totalLockedFromTransfer.toString()).minus(maxMainLock);

      const lockedDetails: LockedBalanceDetails = {
        staking: stakingBalance.toFixed(),
        governance: govBalance.toFixed(),
        democracy: democracyBalance.toFixed(),
        reserved: reservedBalanceBN.toFixed(),
        others: othersLockedBalance.gt(0) ? othersLockedBalance.toFixed() : '0'
      };

      const transferableBalance = _getSystemPalletTransferable(balanceInfo, _getChainExistentialDeposit(chainInfo), extrinsicType);

      return {
        address: addresses[index],
        tokenSlug: _getChainNativeTokenSlug(chainInfo),
        free: transferableBalance.toString(),
        locked: totalLockedFromTransfer.toString(),
        state: APIItemState.READY,
        lockedDetails,
        metadata: balanceInfo
      };
    });

    callback(items);
  });

  return () => {
    subscription.unsubscribe();
  };
};

const checkNominationPoolCompleteMigrated = async (substrateApi: _SubstrateApi) => {
  if (!substrateApi.api.tx.nominationPools || !substrateApi.api.query.staking) {
    return false;
  }

  const isNominationPoolMigrated =
    !!substrateApi.api.tx.nominationPools.migrateDelegation &&
    !!substrateApi.api.query.staking.counterForVirtualStakers &&
    !!substrateApi.api.query.staking.virtualStakers;

  if (!isNominationPoolMigrated) {
    return false;
  }

  const [nominationPoolCounterRaw, nominationPoolInfoRaw] = await Promise.all([
    substrateApi.api.query.staking.counterForVirtualStakers(),
    substrateApi.api.query.staking.virtualStakers.entries()
  ]);

  const nominationPoolCounter = nominationPoolCounterRaw.toPrimitive() as number;
  const nominationPoolInfoLength = nominationPoolInfoRaw.length;

  return nominationPoolCounter !== 0 && nominationPoolInfoLength !== 0;
};

const subscribeForeignAssetBalance = async ({ addresses, assetMap, callback, chainInfo, extrinsicType, substrateApi }: SubscribeSubstratePalletBalance) => {
  const foreignAssetsAccountKey = 'query_foreignAssets_account';
  const tokenMap = filterAssetsByChainAndType(assetMap, chainInfo.slug, [_AssetType.LOCAL]);

  const unsubList = await Promise.all(Object.values(tokenMap).map((tokenInfo) => {
    try {
      if (_isBridgedToken(tokenInfo)) {
        const version: number = ['statemint', 'statemine', 'westend_assethub'].includes(chainInfo.slug) ? 4 : 3;
        const params: _SubstrateAdapterSubscriptionArgs[] = [
          {
            section: 'query',
            module: foreignAssetsAccountKey.split('_')[1],
            method: foreignAssetsAccountKey.split('_')[2],
            args: addresses.map((address) => [_getTokenOnChainInfo(tokenInfo) || _adaptX1Interior(_getXcmAssetMultilocation(tokenInfo), version), address])
          }
        ];

        return substrateApi.subscribeDataWithMulti(params, (rs) => {
          const balances = rs[foreignAssetsAccountKey];
          const items: BalanceItem[] = balances.map((_balance, index): BalanceItem => {
            const balanceInfo = _balance as unknown as PalletAssetsAssetAccountWithStatus | undefined;

            if (!balanceInfo) { // no balance info response
              return {
                address: addresses[index],
                tokenSlug: tokenInfo.slug,
                free: '0',
                locked: '0',
                state: APIItemState.READY
              };
            }

            const transferableBalance = _getForeignAssetPalletTransferable(balanceInfo, _getAssetExistentialDeposit(tokenInfo), extrinsicType);
            const totalLockedFromTransfer = _getForeignAssetPalletLockedBalance(balanceInfo);

            return {
              address: addresses[index],
              tokenSlug: tokenInfo.slug,
              free: transferableBalance.toString(),
              locked: totalLockedFromTransfer.toString(),
              state: APIItemState.READY
            };
          });

          callback(items);
        });
      }
    } catch (err) {
      console.warn(err);
    }

    return undefined;
  }));

  return () => {
    unsubList.forEach((unsub) => {
      unsub && unsub.unsubscribe();
    });
  };
};

function extractOkResponse<T> (response: Record<string, T>): T | undefined {
  if ('ok' in response) {
    return response.ok;
  }

  if ('Ok' in response) {
    return response.Ok;
  }

  return undefined;
}

const subscribePSP22Balance = ({ addresses, assetMap, callback, chainInfo, substrateApi }: SubscribeSubstratePalletBalance) => {
  const chain = chainInfo.slug;
  const psp22ContractMap = {} as Record<string, ContractPromise>;
  const tokenList = filterAssetsByChainAndType(assetMap, chain, [_AssetType.PSP22]);

  Object.entries(tokenList).forEach(([slug, tokenInfo]) => {
    psp22ContractMap[slug] = getPSP22ContractPromise(substrateApi.api, _getContractAddressOfToken(tokenInfo));
  });

  const getTokenBalances = () => {
    Object.values(tokenList).map(async (tokenInfo) => {
      try {
        const contract = psp22ContractMap[tokenInfo.slug];
        const balances: BalanceItem[] = await Promise.all(addresses.map(async (address): Promise<BalanceItem> => {
          try {
            const _balanceOf = await contract.query['psp22::balanceOf'](address, { gasLimit: getDefaultWeightV2(substrateApi.api) }, address);
            const balanceObj = _balanceOf?.output?.toPrimitive() as Record<string, any>;
            const freeResponse = extractOkResponse(balanceObj) as number | string;
            const free: string = freeResponse ? new BigN(freeResponse).toString() : '0';

            return {
              address: address,
              tokenSlug: tokenInfo.slug,
              free,
              locked: '0',
              state: APIItemState.READY
            };
          } catch (err) {
            console.error(`Error on get balance of account ${address} for token ${tokenInfo.slug}`, err);

            return {
              address: address,
              tokenSlug: tokenInfo.slug,
              free: '0',
              locked: '0',
              state: APIItemState.READY
            };
          }
        }));

        callback(balances);
      } catch (err) {
        console.warn(tokenInfo.slug, err); // TODO: error createType
      }
    });
  };

  getTokenBalances();

  const interval = setInterval(getTokenBalances, SUB_TOKEN_REFRESH_BALANCE_INTERVAL);

  return () => {
    clearInterval(interval);
  };
};

const subscribeTokensAccountsPallet = async ({ addresses, assetMap, callback, chainInfo, extrinsicType, includeNativeToken, substrateApi }: SubscribeSubstratePalletBalance) => {
  const tokensAccountsKey = 'query_tokens_accounts';

  const tokenTypes = includeNativeToken ? [_AssetType.NATIVE, _AssetType.LOCAL] : [_AssetType.LOCAL];
  const tokenMap = filterAssetsByChainAndType(assetMap, chainInfo.slug, tokenTypes);

  const unsubList = await Promise.all(Object.values(tokenMap).map((tokenInfo) => {
    if (tokenInfo.metadata?.isGigaToken) {
      return timer(0, CRON_REFRESH_PRICE_INTERVAL).subscribe(() => {
        const getGigaTokenBalance = async () => {
          const gigaTokenBalances = await queryGigaTokenBalance(substrateApi, addresses, assetMap[tokenInfo.slug], extrinsicType);

          callback(gigaTokenBalances);
        };

        getGigaTokenBalance().catch(console.error);
      });
    }

    try {
      const params: _SubstrateAdapterSubscriptionArgs[] = [
        {
          section: 'query',
          module: tokensAccountsKey.split('_')[1],
          method: tokensAccountsKey.split('_')[2],
          args: addresses.map((address) => [address, _getTokenOnChainInfo(tokenInfo) || _getTokenOnChainAssetId(tokenInfo)])
        }
      ];

      return substrateApi.subscribeDataWithMulti(params, (rs) => {
        const balances = rs[tokensAccountsKey];
        const items: BalanceItem[] = balances.map((_balance, index): BalanceItem => {
          const balanceInfo = _balance as unknown as OrmlTokensAccountData;
          const transferableBalance = _getTokensPalletTransferable(balanceInfo, _getAssetExistentialDeposit(tokenInfo), extrinsicType);
          const totalLockedFromTransfer = _getTokensPalletLocked(balanceInfo);

          return {
            address: addresses[index],
            tokenSlug: tokenInfo.slug,
            state: APIItemState.READY,
            free: transferableBalance.toString(),
            locked: totalLockedFromTransfer.toString()
          };
        });

        callback(items);
      });
    } catch (err) {
      console.warn(err);
    }

    return undefined;
  }));

  return () => {
    unsubList.forEach((unsub) => {
      unsub && unsub.unsubscribe();
    });
  };
};

const subscribeAssetsAccountPallet = async ({ addresses, assetMap, callback, chainInfo, extrinsicType, substrateApi }: SubscribeSubstratePalletBalance) => {
  const assetsAccountKey = 'query_assets_account';

  const tokenMap = filterAssetsByChainAndType(assetMap, chainInfo.slug, [_AssetType.LOCAL]);

  Object.values(tokenMap).forEach((token) => {
    if (_MANTA_ZK_CHAIN_GROUP.includes(token.originChain) && token.symbol.startsWith(_ZK_ASSET_PREFIX)) {
      delete tokenMap[token.slug];
    }
  });

  const unsubList = await Promise.all(Object.values(tokenMap).map((tokenInfo) => {
    try {
      const assetIndex = _getTokenOnChainAssetId(tokenInfo);

      if (assetIndex === '-1') {
        return undefined;
      }

      const params: _SubstrateAdapterSubscriptionArgs[] = [
        {
          section: 'query',
          module: assetsAccountKey.split('_')[1],
          method: assetsAccountKey.split('_')[2],
          args: addresses.map((address) => [assetIndex, address])
        }
      ];

      // Get Token Balance
      return substrateApi.subscribeDataWithMulti(params, (rs) => {
        const balances = rs[assetsAccountKey];
        const items: BalanceItem[] = balances.map((_balance, index): BalanceItem => {
          const balanceInfo = _balance as unknown as PalletAssetsAssetAccount | undefined;

          if (!balanceInfo) { // no balance info response
            return {
              address: addresses[index],
              tokenSlug: tokenInfo.slug,
              free: '0',
              locked: '0',
              state: APIItemState.READY
            };
          }

          const transferableBalance = _getAssetsPalletTransferable(balanceInfo, _getAssetExistentialDeposit(tokenInfo), extrinsicType);
          const totalLockedFromTransfer = _getAssetsPalletLocked(balanceInfo);

          return {
            address: addresses[index],
            tokenSlug: tokenInfo.slug,
            free: transferableBalance.toString(),
            locked: totalLockedFromTransfer.toString(),
            state: APIItemState.READY
          };
        });

        callback(items);
      });
    } catch (err) {
      console.warn(err);
    }

    return undefined;
  }));

  return () => {
    unsubList.forEach((unsub) => {
      unsub && unsub.unsubscribe();
    });
  };
};

// eslint-disable-next-line @typescript-eslint/require-await
const subscribeOrmlTokensPallet = async ({ addresses, assetMap, callback, chainInfo, extrinsicType, substrateApi }: SubscribeSubstratePalletBalance): Promise<() => void> => {
  const ormlTokensAccountsKey = 'query_ormlTokens_accounts';
  const tokenMap = filterAssetsByChainAndType(assetMap, chainInfo.slug, [_AssetType.LOCAL]);

  const unsubList = Object.values(tokenMap).map((tokenInfo) => {
    try {
      const params: _SubstrateAdapterSubscriptionArgs[] = [
        {
          section: 'query',
          module: ormlTokensAccountsKey.split('_')[1],
          method: ormlTokensAccountsKey.split('_')[2],
          args: addresses.map((address) => [address, _getTokenOnChainInfo(tokenInfo)])
        }
      ];

      // @ts-ignore
      return substrateApi.subscribeDataWithMulti(params, (rs) => {
        const balances = rs[ormlTokensAccountsKey];
        const items: BalanceItem[] = balances.map((_balance, index): BalanceItem => {
          const balanceInfo = _balance as unknown as OrmlTokensAccountData;
          const transferableBalance = _getOrmlTokensPalletTransferable(balanceInfo, _getAssetExistentialDeposit(tokenInfo), extrinsicType);
          const totalLockedFromTransfer = _getOrmlTokensPalletLockedBalance(balanceInfo);

          return {
            address: addresses[index],
            tokenSlug: tokenInfo.slug,
            state: APIItemState.READY,
            free: transferableBalance.toString(),
            locked: totalLockedFromTransfer.toString()
          };
        });

        callback(items);
      });
    } catch (err) {
      console.warn(err);

      return undefined;
    }
  });

  return () => {
    unsubList.forEach((unsub) => {
      unsub && unsub.unsubscribe();
    });
  };
};

// eslint-disable-next-line @typescript-eslint/require-await
const subscribeSubnetAlphaPallet = async ({ addresses, assetMap, callback, chainInfo, substrateApi }: SubscribeSubstratePalletBalance): Promise<() => void> => {
  let cancel = false;
  const tokenMap = filterAlphaAssetsByChain(assetMap, chainInfo.slug);

  const getTokenBalances = async () => {
    if (cancel) {
      return;
    }

    const rawData = await substrateApi.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkeys(addresses);
    const values: Array<[string, TaoStakeInfo[]]> = rawData.toPrimitive() as Array<[string, TaoStakeInfo[]]>;
    const converted: Record<string, Record<number, BigN>> = {};

    for (let i = 0; i < values.length; i++) {
      const [, stakes] = values[i];
      const address = addresses[i];

      converted[address] = {};

      stakes.forEach((stakeInfo) => {
        const { netuid, stake } = stakeInfo;

        const currentValue = converted[address][netuid] || BigN(0);

        converted[address][netuid] = currentValue.plus(stake);
      });
    }

    for (const chainAsset of Object.values(tokenMap)) {
      const netuid = _getAssetNetuid(chainAsset);
      const items: BalanceItem[] = Object.entries(converted).map(([address, stakeMap]): BalanceItem => {
        const value = stakeMap[netuid] || BigN(0);

        return {
          address: address,
          tokenSlug: chainAsset.slug,
          state: APIItemState.READY,
          free: value.toFixed(0),
          locked: '0'
        };
      });

      if (!cancel) {
        callback(items);
      }
    }
  };

  getTokenBalances().catch(console.error);

  const interval = setInterval(() => {
    getTokenBalances().catch(console.error);
  }, SUB_TOKEN_REFRESH_BALANCE_INTERVAL);

  return () => {
    cancel = true;
    clearInterval(interval);
  };
};

async function queryGigaTokenBalance (substrateApi: _SubstrateApi, addresses: string[], tokenInfo: _ChainAsset, extrinsicType: ExtrinsicType | undefined): Promise<BalanceItem[]> {
  return await Promise.all(addresses.map(async (address) => {
    const _balanceInfo = await substrateApi.api.call.currenciesApi.account(_getTokenOnChainAssetId(tokenInfo), address);
    const balanceInfo = _balanceInfo.toPrimitive() as OrmlTokensAccountData;

    const transferableBalance = _getTokensPalletTransferable(balanceInfo, _getAssetExistentialDeposit(tokenInfo), extrinsicType);
    const totalLockedFromTransfer = _getTokensPalletLocked(balanceInfo);

    return {
      address,
      tokenSlug: tokenInfo.slug,
      state: APIItemState.READY,
      free: transferableBalance.toString(),
      locked: totalLockedFromTransfer.toString()
    } as unknown as BalanceItem;
  }));
}
