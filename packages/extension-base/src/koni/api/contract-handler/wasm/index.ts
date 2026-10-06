// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _AZERO_DOMAIN_REGISTRY_ABI, _BITTENSOR_PSP22_TUSDT_ABI, _NEUROGUNS_PSP34_ABI, _PINK_PSP34_ABI, _PSP22_ABI, _PSP34_ABI } from '@subwallet/extension-base/koni/api/contract-handler/utils';
import { _BALANCE_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';

import { ApiPromise } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';

export function isBittensorChain (chainSlug: string) {
  return _BALANCE_CHAIN_GROUP.bittensor.includes(chainSlug);
}

export function getPSP22ContractPromise (apiPromise: ApiPromise, contractAddress: string, chainSlug: string) {
  if (isBittensorChain(chainSlug)) {
    return new ContractPromise(apiPromise, _BITTENSOR_PSP22_TUSDT_ABI, contractAddress);
  }

  return new ContractPromise(apiPromise, _PSP22_ABI, contractAddress);
}

export function getPSP22BalanceOfMethod (chainSlug: string) {
  return isBittensorChain(chainSlug) ? 'balanceOf' : 'psp22::balanceOf';
}

export function getPSP22TransferMethod (chainSlug: string) {
  return isBittensorChain(chainSlug) ? 'transfer' : 'psp22::transfer';
}

export function isPinkRoboNft (contractAddress: string) {
  return ['XoywUxTTtNKPRrRN7V5KXCqz2QLMFeK7DxhpSniqZHps5Xq'].includes(contractAddress);
}

export function isNeurogunNft (contractAddress: string) {
  return ['aZ9bd2tHeGKrs3FnJv5oe7kgVrP5GQvdJMhC2GxjXA2Yqbd'].includes(contractAddress);
}

export function isAzeroDomainNft (contractAddress: string) {
  return ['5FsB91tXSEuMj6akzdPczAtmBaVKToqHmtAwSUzXh49AYzaD', '5CTQBfBC9SfdrCDBJdfLiyW2pg9z5W6C6Es8sK313BLnFgDf'].includes(contractAddress);
}

export function getPSP34ContractPromise (apiPromise: ApiPromise, contractAddress: string) {
  if (isPinkRoboNft(contractAddress)) {
    return new ContractPromise(apiPromise, _PINK_PSP34_ABI, contractAddress);
  }

  if (isNeurogunNft(contractAddress)) {
    return new ContractPromise(apiPromise, _NEUROGUNS_PSP34_ABI, contractAddress);
  }

  if (isAzeroDomainNft(contractAddress)) {
    return new ContractPromise(apiPromise, _AZERO_DOMAIN_REGISTRY_ABI, contractAddress);
  }

  return new ContractPromise(apiPromise, _PSP34_ABI, contractAddress);
}

export function getTokenUriMethod (contractAddress: string): string {
  if (isPinkRoboNft(contractAddress)) {
    return 'pinkMint::tokenUri';
  }

  if (isNeurogunNft(contractAddress)) {
    return 'tokenUri';
  }

  return 'psp34Traits::tokenUri';
}
