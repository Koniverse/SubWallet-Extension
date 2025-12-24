// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { getWeb3Contract } from '@subwallet/extension-base/koni/api/contract-handler/evm/web3';
import { _EvmApi, _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import { EvmEIP1559FeeOption, EvmFeeInfo, FeeCustom, FeeInfo, FeeOption } from '@subwallet/extension-base/types';
import { combineEthFee } from '@subwallet/extension-base/utils';
import { TransactionConfig } from 'web3-core';
import { ContractSendMethod } from 'web3-eth-contract';

import { BN, compactToU8a, u8aConcat, u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';

import { evmToSs58 } from './utils';

export async function getBittensorToSubtensorEvmExtrinsic (recipientAddress: string, value: string, substrateApi: _SubstrateApi, transferAll?: boolean) {
  const api = substrateApi.api;

  await api.isReady;
  const subtensorEvmAddress = evmToSs58(recipientAddress);

  if (transferAll) {
    return api.tx.balances.transferAll(subtensorEvmAddress, false);
  }

  return api.tx.balances.transferKeepAlive(subtensorEvmAddress, value);
}

const NATIVE_SUBTENSOR_ABI = [
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'data',
        type: 'bytes32'
      }
    ],
    name: 'transfer',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
];

export async function getSubtensorEvmtoBittensorExtrinsic (sender: string, recipientAddress: string, sendingValue: string, evmApi: _EvmApi, _feeInfo: FeeInfo, feeCustom?: FeeCustom, feeOption?: FeeOption): Promise<TransactionConfig> {
  const nativeSubtensorEvmContractAddress = '0x0000000000000000000000000000000000000800';

  const contract = getWeb3Contract(nativeSubtensorEvmContractAddress, evmApi, NATIVE_SUBTENSOR_ABI);

  const toAccountId = decodeAddress(recipientAddress);

  const amountSubstrate = new BN(sendingValue).div(new BN(10).pow(new BN(9)));

  const amountU8a = compactToU8a(amountSubstrate);
  const scaleEncoded = u8aConcat(toAccountId, amountU8a);
  const dataU8a = scaleEncoded.slice(0, 32);
  const dataHex = u8aToHex(dataU8a);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const transferCall: ContractSendMethod = contract.methods.transfer(dataHex);

  const txData = transferCall.encodeABI();

  const feeInfo = _feeInfo as EvmFeeInfo;
  const feeCombine = combineEthFee(feeInfo, feeOption, feeCustom as EvmEIP1559FeeOption);

  const transactionConfig: TransactionConfig = {
    from: sender,
    to: nativeSubtensorEvmContractAddress,
    value: sendingValue,
    data: txData,
    ...feeCombine
  };

  transactionConfig.gas = (await evmApi.api.eth.estimateGas(transactionConfig).catch(() => 30000)).toString();

  return transactionConfig;
}

export function _isBittensorChainBridge (srcChain: string, destChain: string): boolean {
  if ((srcChain === COMMON_CHAIN_SLUGS.BITTENSOR && destChain === COMMON_CHAIN_SLUGS.SUBTENSOR_EVM) || (srcChain === COMMON_CHAIN_SLUGS.BITTENSOR_TESTNET && destChain === COMMON_CHAIN_SLUGS.SUBTENSOR_EVM_TESTNET)) {
    return true;
  }

  return false;
}

export function _isSubtensorEvmChainBridge (srcChain: string, destChain: string): boolean {
  if ((srcChain === COMMON_CHAIN_SLUGS.SUBTENSOR_EVM && destChain === COMMON_CHAIN_SLUGS.BITTENSOR) || (srcChain === COMMON_CHAIN_SLUGS.SUBTENSOR_EVM_TESTNET && destChain === COMMON_CHAIN_SLUGS.BITTENSOR_TESTNET)) {
    return true;
  }

  return false;
}
