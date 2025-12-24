// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { _Address } from '@subwallet/extension-base/background/KoniTypes';
import { getERC20Allowance } from '@subwallet/extension-base/koni/api/contract-handler/evm/web3';
import { getSnowBridgeGatewayContract } from '@subwallet/extension-base/koni/api/contract-handler/utils';
import { _EvmApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getContractAddressOfToken } from '@subwallet/extension-base/services/chain-service/utils';
import { CommonOptimalTransferPath, CommonStepType, DEFAULT_FIRST_STEP, MOCK_STEP_FEE } from '@subwallet/extension-base/types/service-base';

export interface RequestOptimalTransferProcess {
  originChain: string,
  destChain?: string,
  tokenSlug: string,
  address: _Address,
  amount: string
}

export function getDefaultTransferProcess (): CommonOptimalTransferPath {
  return {
    totalFee: [MOCK_STEP_FEE, MOCK_STEP_FEE],
    steps: [
      DEFAULT_FIRST_STEP,
      {
        id: 1,
        type: CommonStepType.TRANSFER,
        name: 'Transfer'
      }
    ]
  };
}

export async function getSnowbridgeTransferProcessFromEvm (address: string, evmApi: _EvmApi, tokenInfo: _ChainAsset, amount: string): Promise<CommonOptimalTransferPath> { // todo: refactor, AvailBridge also go into this function
  if (![COMMON_CHAIN_SLUGS.ETHEREUM as string, COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA as string].includes(tokenInfo.originChain)) {
    throw new Error('Snowbridge or AvailBridge only has support for Ethereum');
  }

  const result: CommonOptimalTransferPath = {
    totalFee: [MOCK_STEP_FEE],
    steps: [DEFAULT_FIRST_STEP]
  };

  try {
    const allowance = await getERC20Allowance(getSnowBridgeGatewayContract(evmApi.chainSlug), address, _getContractAddressOfToken(tokenInfo), evmApi);

    if (!allowance || BigInt(allowance) < BigInt(amount)) {
      result.steps.push({
        id: result.steps.length,
        type: CommonStepType.TOKEN_APPROVAL,
        name: 'Approve spending'
      });
      result.totalFee.push(MOCK_STEP_FEE);
    } else {
      return Promise.reject(new Error('Unable to perform this transaction at the moment. Try again later'));
    }
  } catch (e) {
    return Promise.reject(new Error('Unable to perform this transaction at the moment. Try again later'));
  }

  result.steps.push({
    id: result.steps.length,
    type: CommonStepType.TRANSFER,
    name: 'Transfer'
  });
  result.totalFee.push(MOCK_STEP_FEE);

  return Promise.resolve(result);
}

export async function getAcrossbridgeTransferProcessFromEvm (SpokePoolAddress: string, address: string, tokenInfo: _ChainAsset, evmApi: _EvmApi, amount: string): Promise<CommonOptimalTransferPath> {
  const result: CommonOptimalTransferPath = {
    totalFee: [MOCK_STEP_FEE],
    steps: [DEFAULT_FIRST_STEP]
  };

  try {
    const allowance = await getERC20Allowance(getSnowBridgeGatewayContract(evmApi.chainSlug), address, _getContractAddressOfToken(tokenInfo), evmApi);

    console.log('allowance', allowance, !allowance, !allowance || BigInt(allowance) < BigInt(amount));

    if (!allowance || BigInt(allowance) < BigInt(amount)) {
      result.steps.push({
        id: result.steps.length,
        type: CommonStepType.TOKEN_APPROVAL,
        name: 'Approve spending',
        metadata: { SpokePoolAddress }
      });
      result.totalFee.push(MOCK_STEP_FEE);
    } else {
      return Promise.reject(new Error('Unable to perform this transaction at the moment. Try again later'));
    }
  } catch (e) {
    return Promise.reject(new Error('Unable to perform this transaction at the moment. Try again later'));
  }

  result.steps.push({
    id: result.steps.length,
    type: CommonStepType.TRANSFER,
    name: 'Transfer'
  });
  result.totalFee.push(MOCK_STEP_FEE);

  return Promise.resolve(result);
}
