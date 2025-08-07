// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { Context, contextConfigFor, toPolkadotV2 } from '@snowbridge/api';
import { assetRegistryFor } from '@snowbridge/registry';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { _Address } from '@subwallet/extension-base/background/KoniTypes';
import { getWeb3Contract } from '@subwallet/extension-base/koni/api/contract-handler/evm/web3';
import { _SNOWBRIDGE_GATEWAY_ABI, getSnowBridgeGatewayContract } from '@subwallet/extension-base/koni/api/contract-handler/utils';
import { _EvmApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getContractAddressOfToken, _getSubstrateParaId, _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { EvmEIP1559FeeOption, EvmFeeInfo, FeeCustom, FeeInfo, FeeOption } from '@subwallet/extension-base/types';
import { combineEthFee } from '@subwallet/extension-base/utils';
import { TransactionConfig } from 'web3-core';
import { Contract } from 'web3-eth-contract';

import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';

async function getSendFeeToken (contract: Contract, tokenContract: _Address, destChainParaId: number, destinationFee: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
  const quoteSendTokenFee = contract.methods.quoteSendTokenFee(tokenContract, destChainParaId, destinationFee);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  return (await quoteSendTokenFee.call()) as string;
}

export async function getSnowBridgeEvmTransfer (tokenInfo: _ChainAsset, originChainInfo: _ChainInfo, destinationChainInfo: _ChainInfo, sender: string, recipientAddress: string, value: string, evmApi: _EvmApi, _feeInfo: FeeInfo, feeCustom?: FeeCustom, feeOption?: FeeOption): Promise<TransactionConfig> {
  const snowBridgeContractAddress = getSnowBridgeGatewayContract(originChainInfo.slug);
  const snowBridgeContract = getWeb3Contract(snowBridgeContractAddress, evmApi, _SNOWBRIDGE_GATEWAY_ABI);
  const tokenContract = _getContractAddressOfToken(tokenInfo);
  const destinationChainParaId = _getSubstrateParaId(destinationChainInfo);
  const recipient = {
    kind: 1,
    data: _isChainEvmCompatible(destinationChainInfo) ? recipientAddress : u8aToHex(decodeAddress(recipientAddress))
  };
  const environment = 'polkadot_mainnet';
  const context = new Context(contextConfigFor(environment));
  const registry = assetRegistryFor(environment);

  const deliveryFee = await toPolkadotV2.getDeliveryFee(
    context,
    registry,
    tokenContract,
    destinationChainParaId
  );

  console.log('deliveryFee', deliveryFee);
  console.log('tokenContract', tokenContract);
  console.log('destinationChainParaId', destinationChainParaId);
  console.log('deliveryFee', deliveryFee);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
  const totalFee = await snowBridgeContract.methods.quoteSendTokenFee(tokenContract, destinationChainParaId, deliveryFee.destinationDeliveryFeeDOT).call();

  console.log('totalFee', totalFee);

  const destinationFee = deliveryFee.destinationDeliveryFeeDOT.toString();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
  const transferCall = snowBridgeContract.methods.sendToken(tokenContract, destinationChainParaId, recipient, destinationFee, value);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
  const transferEncodedCall = transferCall.encodeABI() as string;

  const feeInfo = _feeInfo as EvmFeeInfo;
  const _feeCustom = feeCustom as EvmEIP1559FeeOption;
  const feeCombine = combineEthFee(feeInfo, feeOption, _feeCustom);

  const sendTokenFee = await getSendFeeToken(snowBridgeContract, tokenContract, destinationChainParaId, destinationFee);

  const transactionConfig = {
    from: sender,
    to: snowBridgeContractAddress,
    value: sendTokenFee,
    data: transferEncodedCall,
    ...feeCombine
  } as TransactionConfig;

  let gasLimit;

  try {
    gasLimit = await evmApi.api.eth.estimateGas(transactionConfig);
  } catch (e) {
    gasLimit = 200000; // todo: handle this better
  }

  transactionConfig.gas = gasLimit;

  return transactionConfig;
}
