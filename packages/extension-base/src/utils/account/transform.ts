// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _AssetType, _ChainInfo } from '@subwallet/chain-list/types';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { _getSubstrateGenesisHash } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountActions, AccountChainType, AccountJson, AccountMetadataData, AccountProxy, AccountProxyMap, AccountProxyStoreData, AccountProxyType, AccountSignMode, AddressJson, ModifyPairStoreData } from '@subwallet/extension-base/types';
import { getKeypairTypeByAddress, tonMnemonicToEntropy } from '@subwallet/keyring';
import { BitcoinKeypairTypes, EthereumKeypairTypes, KeypairType, KeyringPair, KeyringPair$Meta, TonKeypairTypes } from '@subwallet/keyring/types';
import { tonMnemonicValidate } from '@subwallet/keyring/utils';
import { SingleAddress, SubjectInfo } from '@subwallet/ui-keyring/observable/types';

import { hexStripPrefix, u8aToHex } from '@polkadot/util';
import { blake2AsHex, mnemonicToEntropy, mnemonicValidate } from '@polkadot/util-crypto';

export const createAccountProxyId = (_suri: string, derivationPath?: string) => {
  let data: string = _suri;

  if (mnemonicValidate(_suri)) {
    const entropy = mnemonicToEntropy(_suri);

    data = u8aToHex(entropy);

    if (derivationPath) {
      data = blake2AsHex(data, 256);
    }
  } else if (tonMnemonicValidate(_suri)) {
    const entropy = tonMnemonicToEntropy(_suri);

    data = u8aToHex(entropy);

    if (derivationPath) {
      data = blake2AsHex(data, 256);
    }
  }

  if (derivationPath) {
    data = hexStripPrefix(data).concat(derivationPath);
  }

  return blake2AsHex(data, 256);
};

export const getAccountChainType = (type: KeypairType): AccountChainType => {
  return type
    ? EthereumKeypairTypes.includes(type)
      ? AccountChainType.ETHEREUM
      : TonKeypairTypes.includes(type)
        ? AccountChainType.TON
        : BitcoinKeypairTypes.includes(type)
          ? AccountChainType.BITCOIN
          : AccountChainType.SUBSTRATE
    : AccountChainType.SUBSTRATE;
};

export const getAccountSignMode = (address: string, _meta?: KeyringPair$Meta): AccountSignMode => {
  const meta = _meta as AccountMetadataData;

  if (!address || !meta) {
    return AccountSignMode.UNKNOWN;
  } else {
    if (address === ALL_ACCOUNT_KEY) {
      return AccountSignMode.ALL_ACCOUNT;
    } else {
      if (meta.isInjected) {
        return AccountSignMode.INJECTED;
      }

      if (meta.isExternal) {
        if (meta.isHardware) {
          if (meta.isGeneric) {
            return AccountSignMode.GENERIC_LEDGER;
          } else {
            return AccountSignMode.LEGACY_LEDGER;
          }
        } else if (meta.isReadOnly) {
          return AccountSignMode.READ_ONLY;
        } else {
          return AccountSignMode.QR;
        }
      } else {
        return AccountSignMode.PASSWORD;
      }
    }
  }
};

export const getAccountActions = (signMode: AccountSignMode, networkType: AccountChainType, type?: KeypairType, _meta?: KeyringPair$Meta): AccountActions[] => {
  const result: AccountActions[] = [];
  const meta = _meta as AccountMetadataData;

  // JSON
  if (signMode === AccountSignMode.PASSWORD) {
    result.push(AccountActions.EXPORT_JSON);
  }

  // Mnemonic
  if (meta && meta.isMasterAccount) {
    result.push(AccountActions.EXPORT_MNEMONIC);
  }

  // Private key
  if (signMode === AccountSignMode.PASSWORD) {
    if (networkType === AccountChainType.ETHEREUM || networkType === AccountChainType.TON) {
      result.push(AccountActions.EXPORT_PRIVATE_KEY);
    }
  }

  // QR
  if (signMode === AccountSignMode.PASSWORD && networkType === AccountChainType.SUBSTRATE) {
    result.push(AccountActions.EXPORT_QR);
  }

  // Derive
  if (signMode === AccountSignMode.PASSWORD) {
    if (networkType === AccountChainType.SUBSTRATE) {
      result.push(AccountActions.DERIVE);
    } else if (type !== 'ton-native') {
      if (meta && meta.isMasterAccount) {
        result.push(AccountActions.DERIVE);
      }
    }
  }

  return result;
};

const BASE_TRANSFER_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.TRANSFER_BALANCE,
  ExtrinsicType.TRANSFER_TOKEN
];

const NATIVE_STAKE_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.STAKING_BOND,
  ExtrinsicType.STAKING_UNBOND,
  ExtrinsicType.STAKING_WITHDRAW,
  // ExtrinsicType.STAKING_COMPOUNDING,
  // ExtrinsicType.STAKING_CANCEL_COMPOUNDING,
  ExtrinsicType.STAKING_CANCEL_UNSTAKE
];

const POOL_STAKE_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.STAKING_JOIN_POOL,
  ExtrinsicType.STAKING_LEAVE_POOL,
  ExtrinsicType.STAKING_POOL_WITHDRAW,
  ExtrinsicType.STAKING_CLAIM_REWARD,
  ExtrinsicType.JOIN_YIELD_POOL
];

const EARN_VDOT_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.MINT_VDOT,
  ExtrinsicType.REDEEM_VDOT,
  ExtrinsicType.UNSTAKE_VDOT
];

const EARN_LDOT_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.MINT_LDOT,
  ExtrinsicType.REDEEM_LDOT,
  ExtrinsicType.UNSTAKE_LDOT
];

const EARN_SDOT_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.MINT_SDOT,
  ExtrinsicType.REDEEM_SDOT,
  ExtrinsicType.UNSTAKE_SDOT
];

const EARN_QDOT_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.MINT_QDOT,
  ExtrinsicType.REDEEM_QDOT,
  ExtrinsicType.UNSTAKE_QDOT
];

const EARN_STDOT_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.MINT_STDOT,
  ExtrinsicType.REDEEM_STDOT,
  ExtrinsicType.UNSTAKE_STDOT
];

const EARN_VMANTA_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.MINT_VMANTA,
  ExtrinsicType.REDEEM_VMANTA,
  ExtrinsicType.UNSTAKE_VMANTA
];

const EVM_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.TOKEN_SPENDING_APPROVAL,
  ExtrinsicType.EVM_EXECUTE
];

const OTHER_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.TRANSFER_XCM,
  ExtrinsicType.SEND_NFT,
  ExtrinsicType.SWAP,
  ExtrinsicType.CROWDLOAN
];

export const getAccountTransactionActions = (signMode: AccountSignMode, networkType: AccountChainType, type?: KeypairType, _meta?: KeyringPair$Meta, _specialNetwork?: string): ExtrinsicType[] => {
  if ([AccountSignMode.PASSWORD, AccountSignMode.INJECTED].includes(signMode)) {
    switch (networkType) {
      case AccountChainType.SUBSTRATE:
        return [
          ...BASE_TRANSFER_ACTIONS,
          ...NATIVE_STAKE_ACTIONS,
          ...POOL_STAKE_ACTIONS,
          ...EARN_VDOT_ACTIONS,
          ...EARN_LDOT_ACTIONS,
          ...EARN_SDOT_ACTIONS,
          ...EARN_QDOT_ACTIONS,
          ...EARN_VMANTA_ACTIONS,
          ...OTHER_ACTIONS
        ];
      case AccountChainType.ETHEREUM:
        return [
          ...BASE_TRANSFER_ACTIONS,
          ...NATIVE_STAKE_ACTIONS,
          ...POOL_STAKE_ACTIONS,
          ...EARN_STDOT_ACTIONS,
          ...OTHER_ACTIONS,
          ...EVM_ACTIONS
        ];
      case AccountChainType.TON:
        return [
          ...BASE_TRANSFER_ACTIONS
        ];
    }
  } else if (signMode === AccountSignMode.QR || signMode === AccountSignMode.GENERIC_LEDGER) {
    switch (networkType) {
      case AccountChainType.SUBSTRATE:
        return [
          ...BASE_TRANSFER_ACTIONS,
          ...NATIVE_STAKE_ACTIONS,
          ...POOL_STAKE_ACTIONS,
          ...EARN_VDOT_ACTIONS,
          ...EARN_LDOT_ACTIONS,
          ...EARN_SDOT_ACTIONS,
          ...EARN_QDOT_ACTIONS,
          ...EARN_VMANTA_ACTIONS,
          ...OTHER_ACTIONS
        ];
      case AccountChainType.ETHEREUM:
        return [
          ...BASE_TRANSFER_ACTIONS,
          ...EARN_STDOT_ACTIONS,
          ...EVM_ACTIONS,
          ExtrinsicType.SEND_NFT,
          ExtrinsicType.SWAP
        ];
      case AccountChainType.TON:
        return [
          ...BASE_TRANSFER_ACTIONS
        ];
    }
  } else if (signMode === AccountSignMode.LEGACY_LEDGER) { // Only for Substrate
    const result: ExtrinsicType[] = [];
    const specialNetwork = _specialNetwork || '';

    result.push(...BASE_TRANSFER_ACTIONS, ...NATIVE_STAKE_ACTIONS, ...POOL_STAKE_ACTIONS, ExtrinsicType.SWAP, ExtrinsicType.CROWDLOAN);

    // NFT
    if (!['astar', 'avail_mainnet'].includes(specialNetwork)) {
      result.push(ExtrinsicType.SEND_NFT);
    }

    // Earning
    if (specialNetwork === 'bifrost') {
      result.push(...EARN_VDOT_ACTIONS, ...EARN_VMANTA_ACTIONS);
    }

    if (specialNetwork === 'acala') {
      result.push(...EARN_LDOT_ACTIONS);
    }

    if (specialNetwork === 'parallel') {
      result.push(...EARN_SDOT_ACTIONS);
    }

    if (specialNetwork === 'interlay') {
      result.push(...EARN_QDOT_ACTIONS);
    }

    return result;
  }

  return [];
};

export const getAccountTokenTypes = (type: KeypairType): _AssetType[] => {
  switch (type) {
    case 'ethereum':
      return [_AssetType.NATIVE, _AssetType.LOCAL, _AssetType.ERC20, _AssetType.ERC721];
    case 'sr25519':
    case 'ed25519':
    case 'ecdsa':
      return [_AssetType.NATIVE, _AssetType.LOCAL, _AssetType.PSP22, _AssetType.PSP34, _AssetType.GRC20, _AssetType.ERC721, _AssetType.VFT];
    case 'ton':
    case 'ton-native':
      return [_AssetType.NATIVE, _AssetType.TEP74];
    case 'bitcoin-44':
    case 'bittest-44':
    case 'bitcoin-84':
    case 'bittest-84':
      return [_AssetType.NATIVE];
    case 'bitcoin-86':
    case 'bittest-86':
      return [_AssetType.NATIVE, _AssetType.RUNE, _AssetType.BRC20];
    default:
      return [];
  }
};

/**
 * Transforms account data into an `AccountJson` object.
 *
 * @param {string} address - The address of the account.
 * @param {KeypairType} [_type] - The type of the keypair (optional).
 * @param {KeyringPair$Meta} [meta] - Metadata associated with the keyring pair (optional).
 * @param {Record<string, _ChainInfo>} [chainInfoMap] - A map of chain information (optional).
 * If chain information is provided, add full data to account.
 * @returns {AccountJson} The transformed account data.
 *
 * This function performs the following steps:
 * 1. Determines the sign mode of the account based on the address and metadata.
 * 2. Determines the network type of the account based on the keypair type.
 * 3. If chain information is provided, add full data (accountActions, transactionActions) to account.
 * 4. Returns an `AccountJson` object containing the transformed account data.
 */
export const transformAccount = (address: string, _type?: KeypairType, meta?: KeyringPair$Meta, chainInfoMap?: Record<string, _ChainInfo>): AccountJson => {
  const signMode = getAccountSignMode(address, meta);
  const type = _type || getKeypairTypeByAddress(address);
  const chainType: AccountChainType = getAccountChainType(type);
  let specialChain: string | undefined;

  if (!chainInfoMap) {
    return {
      address,
      ...meta,
      type,
      accountActions: [],
      transactionActions: [],
      tokenTypes: [],
      signMode,
      chainType
    };
  }

  const genesisHash = meta?.genesisHash;

  if (chainInfoMap && signMode === AccountSignMode.LEGACY_LEDGER && genesisHash) {
    const chainInfo = Object.values(chainInfoMap).find((info) => _getSubstrateGenesisHash(info) === genesisHash);

    if (chainInfo) {
      specialChain = chainInfo.slug;
    }
  }

  const accountActions = getAccountActions(signMode, chainType, type, meta);
  const transactionActions = getAccountTransactionActions(signMode, chainType, type, meta, specialChain);
  const tokenTypes = getAccountTokenTypes(type);

  /* Account actions */

  return {
    address,
    ...meta,
    type,
    accountActions,
    transactionActions,
    signMode,
    chainType,
    specialChain,
    tokenTypes
  };
};

export const singleAddressToAccount = ({ json: { address, meta },
  type }: SingleAddress, chainInfoMap?: Record<string, _ChainInfo>): AccountJson => transformAccount(address, type, meta, chainInfoMap);

export const pairToAccount = ({ address,
  meta,
  type }: KeyringPair, chainInfoMap?: Record<string, _ChainInfo>): AccountJson => transformAccount(address, type, meta, chainInfoMap);

export const transformAccounts = (accounts: SubjectInfo): AccountJson[] => Object.values(accounts).map((data) => singleAddressToAccount(data));

export const transformAddress = (address: string, meta?: KeyringPair$Meta): AddressJson => {
  const type = getKeypairTypeByAddress(address);
  const chainType: AccountChainType = getAccountChainType(type);

  return {
    address,
    ...meta,
    chainType
  };
};

export const transformAddresses = (addresses: SubjectInfo): AddressJson[] => Object.values(addresses).map(({ json: { address, meta } }) => transformAddress(address, meta));

export const convertAccountProxyType = (accountSignMode: AccountSignMode): AccountProxyType => {
  switch (accountSignMode) {
    case AccountSignMode.GENERIC_LEDGER:
    case AccountSignMode.LEGACY_LEDGER:
      return AccountProxyType.LEDGER;
    case AccountSignMode.QR:
      return AccountProxyType.QR;
    case AccountSignMode.READ_ONLY:
      return AccountProxyType.READ_ONLY;
    case AccountSignMode.INJECTED:
      return AccountProxyType.INJECTED;
    case AccountSignMode.PASSWORD:
      return AccountProxyType.SOLO;
    case AccountSignMode.ALL_ACCOUNT:
      return AccountProxyType.ALL_ACCOUNT;
    case AccountSignMode.UNKNOWN:
      return AccountProxyType.UNKNOWN;
  }

  return AccountProxyType.UNKNOWN;
};

export const _combineAccounts = (accounts: AccountJson[], modifyPairs: ModifyPairStoreData, accountProxies: AccountProxyStoreData) => {
  const temp: Record<string, Omit<AccountProxy, 'accountType'>> = {};

  for (const account of accounts) {
    const address = account.address;
    const modifyPair = modifyPairs[address];

    if (modifyPair && modifyPair.accountProxyId) {
      const accountGroup = accountProxies[modifyPair.accountProxyId];

      if (accountGroup) {
        if (!temp[accountGroup.id]) {
          temp[accountGroup.id] = { ...accountGroup, accounts: [], chainTypes: [], tokenTypes: [], accountActions: [] };
        }

        account.proxyId = accountGroup.id;

        temp[accountGroup.id].accounts.push(account);
        continue;
      }
    }

    temp[address] = {
      id: address,
      name: account.name || account.address,
      accounts: [account],
      chainTypes: [account.chainType],
      parentId: account.parentAddress,
      suri: account.suri,
      tokenTypes: account.tokenTypes,
      accountActions: []
    };
  }

  const result: AccountProxyMap = Object.fromEntries(
    Object.entries(temp)
      .map(([key, value]): [string, AccountProxy] => {
        let accountType: AccountProxyType = AccountProxyType.UNKNOWN;
        let chainTypes: AccountChainType[] = [];
        let tokenTypes: _AssetType[] = [];
        let accountActions: AccountActions[] = [];
        let specialChain: string | undefined;

        if (value.accounts.length > 1) {
          accountType = AccountProxyType.UNIFIED;
          chainTypes = Array.from(value.accounts.reduce<Set<AccountChainType>>((rs, account) => rs.add(account.chainType), new Set()));
          tokenTypes = Array.from(value.accounts.reduce<Set<_AssetType>>((rs, account) => {
            for (const tokenType of account.tokenTypes) {
              rs.add(tokenType);
            }

            return rs;
          }, new Set()));

          /* Account actions */

          // Mnemonic
          if (value.accounts.every((account) => account.accountActions.includes(AccountActions.EXPORT_MNEMONIC))) {
            accountActions.push(AccountActions.EXPORT_MNEMONIC);
          }

          // Derive
          if (value.accounts.every((account) => account.accountActions.includes(AccountActions.DERIVE))) {
            accountActions.push(AccountActions.DERIVE);
          }
        } else if (value.accounts.length === 1) {
          const account = value.accounts[0];

          chainTypes = [account.chainType];
          tokenTypes = account.tokenTypes;
          accountType = convertAccountProxyType(account.signMode);
          accountActions = account.accountActions;

          switch (account.signMode) {
            case AccountSignMode.GENERIC_LEDGER:
            case AccountSignMode.LEGACY_LEDGER:
              specialChain = account.specialChain;
              break;
          }
        }

        return [key, { ...value, accountType, chainTypes, specialChain, tokenTypes, accountActions }];
      })
  );

  const deepSearchParentId = (parentId: string): string => {
    const parent = result[parentId];

    if (parent && parent.parentId) {
      return deepSearchParentId(parent.parentId);
    }

    return parentId;
  };

  for (const value of Object.values(result)) {
    if (value.parentId) {
      value.parentId = deepSearchParentId(value.parentId);
    }
  }

  const deepSearchChildren = (id: string): string[] => {
    const rs: string[] = [];

    for (const accountProxy of Object.values(result)) {
      if (accountProxy.parentId === id) {
        rs.push(accountProxy.id);
      }
    }

    return rs;
  };

  for (const value of Object.values(result)) {
    value.children = deepSearchChildren(value.id);
  }

  return result;
};

export const combineAccountsWithSubjectInfo = (pairs: SubjectInfo, modifyPairs: ModifyPairStoreData, accountProxies: AccountProxyStoreData, chainInfoMap?: Record<string, _ChainInfo>) => {
  const accounts = Object.values(pairs).map((data) => singleAddressToAccount(data, chainInfoMap));

  return _combineAccounts(accounts, modifyPairs, accountProxies);
};

export const combineAccountsWithKeyPair = (pairs: KeyringPair[], modifyPairs?: ModifyPairStoreData, accountProxies?: AccountProxyStoreData, chainInfoMap?: Record<string, _ChainInfo>) => {
  const accounts = Object.values(pairs).map((data) => pairToAccount(data, chainInfoMap));

  return _combineAccounts(accounts, modifyPairs || {}, accountProxies || {});
};

export const combineAllAccountProxy = (accountProxies: AccountProxy[]): AccountProxy => {
  const chainTypes = new Set<AccountChainType>();
  const tokenTypes = new Set<_AssetType>();
  const specialChain: string | undefined = accountProxies.length === 1 ? accountProxies[0].specialChain : undefined;

  for (const accountProxy of accountProxies) {
    // Have 4 network types, but at the moment, we only support 3 network types
    if (chainTypes.size === 3) {
      break;
    }

    for (const chainType of accountProxy.chainTypes) {
      chainTypes.add(chainType);
    }
  }

  for (const accountProxy of accountProxies) {
    for (const tokenType of accountProxy.tokenTypes) {
      tokenTypes.add(tokenType);
    }
  }

  return {
    id: ALL_ACCOUNT_KEY,
    name: 'All',
    accounts: [],
    accountActions: [],
    accountType: AccountProxyType.ALL_ACCOUNT,
    chainTypes: Array.from(chainTypes),
    tokenTypes: Array.from(tokenTypes),
    specialChain
  };
};