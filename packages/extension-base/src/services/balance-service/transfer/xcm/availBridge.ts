// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { getWeb3Contract } from '@subwallet/extension-base/koni/api/contract-handler/evm/web3';
import { _AVAILBRIDGE_GATEWAY_ABI, getAvailBridgeGatewayContract } from '@subwallet/extension-base/koni/api/contract-handler/utils';
import { _EvmApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getContractAddressOfToken } from '@subwallet/extension-base/services/chain-service/utils';
import { calculateGasFeeParams } from '@subwallet/extension-base/services/fee-service/utils';
import { decodeAddress } from '@subwallet/keyring';
import { TransactionConfig } from 'web3-core';

import { u8aToHex } from '@polkadot/util';

export async function getAvailBridgeTxFromEvm (originChainInfo: _ChainInfo, sender: string, value: string, evmApi: _EvmApi): Promise<TransactionConfig> {
  const availBridgeContractAddress = getAvailBridgeGatewayContract(originChainInfo.slug);
  const availBridgeContract = getWeb3Contract(availBridgeContractAddress, evmApi, _AVAILBRIDGE_GATEWAY_ABI);
  const transferData = availBridgeContract.methods.sendAVAIL(u8aToHex(decodeAddress(sender)), value).encodeABI() as string;
  const priority = await calculateGasFeeParams(evmApi, evmApi.chainSlug);
  const gasLimit = availBridgeContract.methods.sendAVAIL(u8aToHex(decodeAddress(sender)), value).estimateGas({ from: sender }) as number;

  return {
    from: sender,
    to: availBridgeContractAddress,
    value, // todo
    data: transferData,
    gasPrice: priority.gasPrice,
    maxFeePerGas: priority.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: priority.maxPriorityFeePerGas?.toString(),
    gas: gasLimit
  } as TransactionConfig;
}

export function isAvailChainBridge (chainSlug: string) {
  return ['avail_mainnet', 'availTuringTest'].includes(chainSlug);
}
