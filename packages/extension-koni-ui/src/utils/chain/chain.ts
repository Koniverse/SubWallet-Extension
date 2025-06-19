// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo, _ChainStatus } from '@subwallet/chain-list/types';
import { _getSubstrateGenesisHash, _isChainBitcoinCompatible, _isChainCardanoCompatible, _isChainEvmCompatible, _isChainTonCompatible, _isPureSubstrateChain, _isSubstrateEvmCompatibleChain } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountChainType, AccountProxy } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { BitcoinMainnetKeypairTypes, BitcoinTestnetKeypairTypes, KeypairType } from '@subwallet/keyring/types';

export const findChainInfoByGenesisHash = (chainMap: Record<string, _ChainInfo>, genesisHash?: string): _ChainInfo | null => {
  if (!genesisHash) {
    return null;
  }

  for (const chainInfo of Object.values(chainMap)) {
    if (_getSubstrateGenesisHash(chainInfo)?.toLowerCase() === genesisHash.toLowerCase()) {
      return chainInfo;
    }
  }

  return null;
};

export const findChainInfoByChainId = (chainMap: Record<string, _ChainInfo>, chainId?: number): _ChainInfo | null => {
  if (!chainId) {
    return null;
  }

  for (const chainInfo of Object.values(chainMap)) {
    if (chainInfo.evmInfo?.evmChainId === chainId) {
      return chainInfo;
    }
  }

  return null;
};

/**
 * @deprecated Use `_isChainInfoCompatibleWithAccountInfo` instead.
 */
export const isChainInfoAccordantAccountChainType = (chainInfo: _ChainInfo, chainType: AccountChainType): boolean => {
  if (chainType === AccountChainType.SUBSTRATE) {
    return _isPureSubstrateChain(chainInfo);
  }

  if (chainType === AccountChainType.ETHEREUM) {
    return _isChainEvmCompatible(chainInfo);
  }

  if (chainType === AccountChainType.TON) {
    return _isChainTonCompatible(chainInfo);
  }

  if (chainType === AccountChainType.BITCOIN) {
    return _isChainBitcoinCompatible(chainInfo);
  }

  if (chainType === AccountChainType.CARDANO) {
    return _isChainCardanoCompatible(chainInfo);
  }

  return false;
};

/**
 * @deprecated
 */
export const isChainCompatibleWithAccountChainTypes = (chainInfo: _ChainInfo, chainTypes: AccountChainType[]): boolean => {
  return chainTypes.some((chainType) => isChainInfoAccordantAccountChainType(chainInfo, chainType));
};

/**
 * @deprecated Use hook `useCoreCreateGetChainSlugsByAccountProxy` instead.
 */
export const getChainsByAccountType = (_chainInfoMap: Record<string, _ChainInfo>, chainTypes: AccountChainType[], accountTypes: KeypairType[] = [], specialChain?: string): string[] => {
  const chainInfoMap = Object.fromEntries(Object.entries(_chainInfoMap).filter(([, chainInfo]) => chainInfo.chainStatus === _ChainStatus.ACTIVE));

  if (specialChain) {
    return Object.keys(chainInfoMap).filter((chain) => specialChain === chain);
  } else {
    const result: string[] = [];

    const bitcoinAccountTypes = accountTypes.filter((type) => BitcoinMainnetKeypairTypes.includes(type) || BitcoinTestnetKeypairTypes.includes(type));
    const isOnlyBitcoinMainnet = bitcoinAccountTypes.every((type) => BitcoinMainnetKeypairTypes.includes(type));
    const isOnlyBitcoinTestnet = bitcoinAccountTypes.every((type) => BitcoinTestnetKeypairTypes.includes(type));

    for (const chainInfo of Object.values(chainInfoMap)) {
      if (isChainCompatibleWithAccountChainTypes(chainInfo, chainTypes)) {
        const isBitcoinChain = !!chainInfo && _isChainBitcoinCompatible(chainInfo);

        if (isBitcoinChain) {
          if (isOnlyBitcoinMainnet && chainInfo.bitcoinInfo?.bitcoinNetwork === 'mainnet') {
            result.push(chainInfo.slug);
          } else if (isOnlyBitcoinTestnet && chainInfo.bitcoinInfo?.bitcoinNetwork === 'testnet') {
            result.push(chainInfo.slug);
          } else if (!isOnlyBitcoinMainnet && !isOnlyBitcoinTestnet) {
            result.push(chainInfo.slug);
          }
        } else {
          result.push(chainInfo.slug);
        }
      }
    }

    return result;
  }
};

/**
 * @deprecated Use hook `useCoreCreateGetChainSlugsByAccountProxy` instead.
 */
// Note : The function filters the chain slug list by account All, where all accounts case may include only Ledger accounts.
export const getChainsByAccountAll = (accountAllProxy: AccountProxy, accountProxies: AccountProxy[], _chainInfoMap: Record<string, _ChainInfo>, accountTypes: KeypairType[] = []): string[] => {
  const specialChainRecord: Record<AccountChainType, string[]> = {} as Record<AccountChainType, string[]>;
  const { chainTypes, specialChain } = accountAllProxy;
  const chainInfoMap = Object.fromEntries(Object.entries(_chainInfoMap).filter(([, chainInfo]) => chainInfo.chainStatus === _ChainStatus.ACTIVE));
  /*
    Special chain List
    *: All network
  */

  for (const proxy of accountProxies) {
    if (proxy.specialChain) {
      specialChainRecord[proxy.chainTypes[0]] = [...specialChainRecord[proxy.chainTypes[0]] || [], proxy.specialChain];
    } else if (!isAccountAll(proxy.id)) {
      proxy.chainTypes.forEach((chainType) => {
        specialChainRecord[chainType] = ['*'];
      });
    }
  }

  const result: string[] = [];

  if (!specialChain) {
    Object.values(chainInfoMap).forEach((chainInfo) => {
      const isAllowed = chainTypes.some((chainType) => {
        const specialChains = specialChainRecord[chainType];

        return (specialChains.includes('*') || specialChains.includes(chainInfo.slug)) && isChainInfoAccordantAccountChainType(chainInfo, chainType);
      });

      if (isAllowed) {
        const bitcoinAccountTypes = accountTypes.filter((type) => BitcoinMainnetKeypairTypes.includes(type) || BitcoinTestnetKeypairTypes.includes(type));
        const isOnlyBitcoinMainnet = bitcoinAccountTypes.every((type) => BitcoinMainnetKeypairTypes.includes(type));
        const isOnlyBitcoinTestnet = bitcoinAccountTypes.every((type) => BitcoinTestnetKeypairTypes.includes(type));
        const isBitcoinChain = !!chainInfo && _isChainBitcoinCompatible(chainInfo);

        if (isBitcoinChain) {
          if (isOnlyBitcoinMainnet && chainInfo.bitcoinInfo?.bitcoinNetwork === 'mainnet') {
            result.push(chainInfo.slug);
          } else if (isOnlyBitcoinTestnet && chainInfo.bitcoinInfo?.bitcoinNetwork === 'testnet') {
            result.push(chainInfo.slug);
          } else if (!isOnlyBitcoinMainnet && !isOnlyBitcoinTestnet) {
            result.push(chainInfo.slug);
          }
        } else {
          result.push(chainInfo.slug);
        }
      }
    });
  } else {
    return Object.keys(chainInfoMap).filter((chain) => specialChain === chain);
  }

  return result;
};
