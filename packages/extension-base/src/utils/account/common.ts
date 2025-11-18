// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { ChainType } from '@subwallet/extension-base/background/KoniTypes';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { _chainInfoToAccountChainType, _getChainSubstrateAddressPrefix, _getSubstrateGenesisHash, _isChainBitcoinCompatible, _isChainCardanoCompatible, _isChainEvmCompatible, _isChainTonCompatible, _isSubstrateEvmCompatibleChain } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountChainType, AccountJson } from '@subwallet/extension-base/types';
import { getAccountChainTypeFromKeypairType, pairToAccount } from '@subwallet/extension-base/utils';
import { decodeAddress, encodeAddress, getKeypairTypeByAddress, isAddress, isBitcoinAddress, isCardanoAddress, isTonAddress } from '@subwallet/keyring';
import { KeypairType } from '@subwallet/keyring/types';
import { getBitcoinAddressInfo } from '@subwallet/keyring/utils/address/validate';
import { keyring } from '@subwallet/ui-keyring';

import { ethereumEncode, isEthereumAddress } from '@polkadot/util-crypto';

export function isAccountAll (address?: string): boolean {
  return address === ALL_ACCOUNT_KEY;
}

export function reformatAddress (address: string, networkPrefix = 42, isEthereum = false, ignoreError = true): string {
  try {
    if (!address || address === '') {
      return '';
    }

    if (isEthereumAddress(address)) {
      return address;
    }

    if (isAccountAll(address)) {
      return address;
    }

    const publicKey = decodeAddress(address);

    if (isEthereum) {
      return ethereumEncode(publicKey);
    }

    const type: KeypairType = getKeypairTypeByAddress(address);

    if (networkPrefix < 0) {
      return address;
    }

    return encodeAddress(publicKey, networkPrefix, type);
  } catch (e) {
    console.warn('Get error while reformat address', address, e);

    if (!ignoreError) {
      return '';
    }

    return address;
  }
}

/**
 * @private
 * Reformats a wallet address based on the provided chain information.
 *
 * This function checks the chain type (Substrate, TON, Cardano, or others)
 * and applies the corresponding formatting logic:
 * 1. **Substrate**: Reformats the Substrate address using the chain's specific prefix.
 * If the current `address` is an EVM address, it attempts to use the `alternativeAddress`
 * (which is currently **always** expected to be the Substrate address) for Substrate
 * formatting, as direct EVM-to-Substrate reformatting is not possible here.
 * 2. **TON/Cardano**: Uses a simple prefix logic based on whether the chain is a testnet or a mainnet.
 * 3. **Default (EVM/Others)**: Returns the original address without reformatting.
 *
 * @param address The current wallet address string.
 * @param chainInfo An object containing chain details (e.g., chain type, testnet status, prefix).
 * @param alternativeAddress An optional alternative address, which is currently expected to be the Substrate
 * address associated with the account. It is used as a fallback for Substrate formatting when the main `address` is EVM.
 * @returns The reformatted wallet address, or the original address if no reformatting is needed or possible.
 *
 * @todo This function currently lacks logic to reformat a Substrate address into an EVM address format.
 */
export const _reformatAddressWithChain = (address: string, chainInfo: _ChainInfo, alternativeAddress?: string): string => {
  const chainType = _chainInfoToAccountChainType(chainInfo);

  if (chainType === AccountChainType.SUBSTRATE) {
    const addressPrefix = _getChainSubstrateAddressPrefix(chainInfo);

    if (addressPrefix < 0) {
      // not a valid address prefix for substrate chain type
      return address;
    }

    if (isEthereumAddress(address)) {
      if (alternativeAddress) {
        // reformat using alternativeAddress of that account. Because can not reformat from evm address to substrate address
        return reformatAddress(alternativeAddress, addressPrefix);
      }

      // can not reformat without substrateAddress info
      return address;
    }

    // reformat as usual with substrate address
    return reformatAddress(address, addressPrefix);
  }

  if (chainType === AccountChainType.TON || chainType === AccountChainType.CARDANO) {
    return reformatAddress(address, chainInfo.isTestnet ? 0 : 1);
  }

  return address;
};

export const getAccountChainTypeForAddress = (address: string): AccountChainType => {
  const type = getKeypairTypeByAddress(address);

  return getAccountChainTypeFromKeypairType(type);
};

type AddressesByChainType = {
  [key in ChainType]: string[]
}

interface ExtendAddressesByChainType extends AddressesByChainType {
  _bitcoin: string[];
}

// TODO: Recheck the usage of this function for Bitcoin; it is currently applied to history.
export function getAddressesByChainType (addresses: string[], chainTypes: ChainType[], chainInfo?: _ChainInfo): string[] {
  const addressByChainTypeMap = getAddressesByChainTypeMap(addresses, chainInfo);

  return chainTypes.map((chainType) => {
    return addressByChainTypeMap[chainType];
  }).flat(); // todo: recheck
}

export function getAddressesByChainTypeMap (addresses: string[], chainInfo?: _ChainInfo): ExtendAddressesByChainType {
  const addressByChainType: ExtendAddressesByChainType = {
    substrate: [],
    evm: [],
    bitcoin: [],
    ton: [],
    cardano: [],
    _bitcoin: []
  };

  addresses.forEach((address) => {
    if (isEthereumAddress(address)) {
      addressByChainType.evm.push(address);
    } else if (isTonAddress(address)) {
      addressByChainType.ton.push(address);
    } else if (isBitcoinAddress(address)) {
      const addressInfo = getBitcoinAddressInfo(address);

      if (chainInfo?.bitcoinInfo) {
        const isNetworkMatch = addressInfo.network === chainInfo.bitcoinInfo.bitcoinNetwork;

        if (isNetworkMatch) {
          addressByChainType.bitcoin.push(address);
        } else {
          addressByChainType._bitcoin.push(address);
        }
      }
    } else if (isCardanoAddress(address)) {
      addressByChainType.cardano.push(address);
    } else {
      addressByChainType.substrate.push(address);
    }
  });

  return addressByChainType;
}

export function quickFormatAddressToCompare (address?: string) {
  if (!isAddress(address)) {
    return address;
  }

  return reformatAddress(address, 42).toLowerCase();
}

/** @deprecated */
export const modifyAccountName = (type: KeypairType, name: string, modify: boolean) => {
  if (!modify) {
    return name;
  }

  let network = '';

  switch (type) {
    case 'sr25519':
    case 'ed25519':
    case 'ecdsa':
      network = 'Substrate';
      break;
    case 'ethereum':
      network = 'EVM';
      break;
    case 'ton':
    case 'ton-native':
      network = 'Ton';
      break;
  }

  return network ? [name, network].join(' - ') : name;
};

/**
 * @function getAccountJsonByAddress
 * @desc Get account info by address
 * <p>
 *   Note: Use on the background only
 * </p>
 * @param {string} address - Address
 * @returns {AccountJson|null}  - Account info or null if not found
 */
export const getAccountJsonByAddress = (address: string): AccountJson | null => {
  try {
    const pair = keyring.getPair(address);

    if (pair) {
      return pairToAccount(pair);
    } else {
      return null;
    }
  } catch (e) {
    console.warn(e);

    return null;
  }
};

/** Filter addresses to subscribe by chain info */
export const filterAddressByChainInfo = (addresses: string[], chainInfo: _ChainInfo): [string[], string[]] => {
  const { _bitcoin, bitcoin, cardano, evm, substrate, ton } = getAddressesByChainTypeMap(addresses, chainInfo);

  if (_isChainEvmCompatible(chainInfo)) {
    const [fetchList, unFetchList] = processEvmAndSubstrateAddresses(evm, chainInfo);

    return [fetchList, [...unFetchList, ...bitcoin, ...ton, ...substrate, ...cardano, ..._bitcoin].flat()];
  } else if (_isChainBitcoinCompatible(chainInfo)) {
    return [bitcoin, [...evm, ...substrate, ...ton, ...cardano, ..._bitcoin].flat()];
  } else if (_isChainTonCompatible(chainInfo)) {
    return [ton, [...bitcoin, ...evm, ...substrate, ...cardano, ..._bitcoin].flat()];
  } else if (_isChainCardanoCompatible(chainInfo)) {
    return [cardano, [...bitcoin, ...evm, ...substrate, ...ton, ..._bitcoin].flat()];
  } else {
    const [fetchList, unFetchList] = processEvmAndSubstrateAddresses(substrate, chainInfo);

    return [fetchList, [...unFetchList, ...bitcoin, ...evm, ...ton, ...cardano, ..._bitcoin].flat()];
  }
};

const processEvmAndSubstrateAddresses = (addressList: string[], chainInfo: _ChainInfo): [string[], string[]] => {
  const fetchList: string[] = [];
  const unFetchList: string[] = [];
  const isEvm = isEthereumAddress(addressList[0]);

  addressList.forEach((address) => {
    const account = getAccountJsonByAddress(address);

    if (account) {
      if (account.isHardware) {
        if (isEvm) {
          if (account.isGeneric && account.isSubstrateECDSA) {
            if (_isSubstrateEvmCompatibleChain(chainInfo)) {
              fetchList.push(address);
            } else {
              unFetchList.push(address);
            }
          } else {
            fetchList.push(address);
          }
        } else {
          if (account.isGeneric) {
            fetchList.push(address);
          } else {
            const availGen = account.availableGenesisHashes || [];
            const gen = _getSubstrateGenesisHash(chainInfo);

            if (availGen.includes(gen)) {
              fetchList.push(address);
            } else {
              unFetchList.push(address);
            }
          }
        }
      } else {
        fetchList.push(address);
      }
    } else {
      fetchList.push(address);
    }
  });

  return [fetchList, unFetchList];
};
