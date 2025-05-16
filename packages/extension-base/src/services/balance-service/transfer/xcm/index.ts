// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { XCM_MIN_AMOUNT_RATIO } from '@subwallet/extension-base/constants';
import { _isAcrossBridgeXcm, _isPolygonBridgeXcm, _isPosBridgeXcm, _isSnowBridgeXcm } from '@subwallet/extension-base/core/substrate/xcm-parser';
import { getAvailBridgeExtrinsicFromAvail, getAvailBridgeTxFromEth } from '@subwallet/extension-base/services/balance-service/transfer/xcm/availBridge';
import { getExtrinsicByPolkadotXcmPallet } from '@subwallet/extension-base/services/balance-service/transfer/xcm/polkadotXcm';
import { _createPolygonBridgeL1toL2Extrinsic, _createPolygonBridgeL2toL1Extrinsic } from '@subwallet/extension-base/services/balance-service/transfer/xcm/polygonBridge';
import { getSnowBridgeEvmTransfer } from '@subwallet/extension-base/services/balance-service/transfer/xcm/snowBridge';
import { buildXcm, DryRunInfo, dryRunXcmV2, isChainNotSupportDryRun, isChainNotSupportPolkadotApi } from '@subwallet/extension-base/services/balance-service/transfer/xcm/utils';
import { getExtrinsicByXcmPalletPallet } from '@subwallet/extension-base/services/balance-service/transfer/xcm/xcmPallet';
import { getExtrinsicByXtokensPallet } from '@subwallet/extension-base/services/balance-service/transfer/xcm/xTokens';
import { _XCM_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { _EvmApi, _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import { EvmEIP1559FeeOption, EvmFeeInfo, FeeInfo, RuntimeDispatchInfo, TransactionFee } from '@subwallet/extension-base/types';
import { combineEthFee } from '@subwallet/extension-base/utils';
import subwalletApiSdk from '@subwallet/subwallet-api-sdk';
import { TransactionConfig } from 'web3-core';

import { SubmittableExtrinsic } from '@polkadot/api/types';

import { _createPosBridgeL1toL2Extrinsic, _createPosBridgeL2toL1Extrinsic } from './posBridge';

export type CreateXcmExtrinsicProps = {
  destinationChain: _ChainInfo;
  destinationTokenInfo: _ChainAsset;
  evmApi?: _EvmApi;
  originChain: _ChainInfo;
  originTokenInfo: _ChainAsset;
  recipient: string;
  sender: string;
  sendingValue: string;
  substrateApi?: _SubstrateApi;
  feeInfo: FeeInfo;
} & TransactionFee;

export type FunctionCreateXcmExtrinsic = (props: CreateXcmExtrinsicProps) => Promise<SubmittableExtrinsic<'promise'> | TransactionConfig | undefined>;

// SnowBridge
export const createSnowBridgeExtrinsic = async ({ destinationChain,
  evmApi,
  feeCustom,
  feeInfo,
  feeOption,
  originChain,
  originTokenInfo,
  recipient,
  sender,
  sendingValue }: CreateXcmExtrinsicProps): Promise<TransactionConfig> => {
  if (!_isSnowBridgeXcm(originChain, destinationChain)) {
    throw new Error('This is not a valid SnowBridge transfer');
  }

  if (!evmApi) {
    throw Error('Evm API is not available');
  }

  if (!sender) {
    throw Error('Sender is required');
  }

  return getSnowBridgeEvmTransfer(originTokenInfo, originChain, destinationChain, sender, recipient, sendingValue, evmApi, feeInfo, feeCustom, feeOption);
};

export const createXcmExtrinsic = async ({ destinationChain,
  originChain,
  originTokenInfo,
  recipient,
  sendingValue,
  substrateApi }: CreateXcmExtrinsicProps): Promise<SubmittableExtrinsic<'promise'>> => {
  if (!substrateApi) {
    throw Error('Substrate API is not available');
  }

  const chainApi = await substrateApi.isReady;
  const api = chainApi.api;

  const polkadotXcmSpecialCases = _XCM_CHAIN_GROUP.polkadotXcmSpecialCases.includes(originChain.slug) && _isNativeToken(originTokenInfo);

  if (_XCM_CHAIN_GROUP.polkadotXcm.includes(originTokenInfo.originChain) || polkadotXcmSpecialCases) {
    return getExtrinsicByPolkadotXcmPallet(originTokenInfo, originChain, destinationChain, recipient, sendingValue, api);
  }

  if (_XCM_CHAIN_GROUP.xcmPallet.includes(originTokenInfo.originChain)) {
    return getExtrinsicByXcmPalletPallet(originTokenInfo, originChain, destinationChain, recipient, sendingValue, api);
  }

  return getExtrinsicByXtokensPallet(originTokenInfo, originChain, destinationChain, recipient, sendingValue, api);
};

export const createAvailBridgeTxFromEth = ({ evmApi,
  feeCustom,
  feeInfo,
  feeOption,
  originChain,
  recipient,
  sender,
  sendingValue }: CreateXcmExtrinsicProps): Promise<TransactionConfig> => {
  if (!evmApi) {
    throw Error('Evm API is not available');
  }

  if (!sender) {
    throw Error('Sender is required');
  }

  return getAvailBridgeTxFromEth(originChain, sender, recipient, sendingValue, evmApi, feeInfo, feeCustom, feeOption);
};

export const createAvailBridgeExtrinsicFromAvail = async ({ recipient, sendingValue, substrateApi }: CreateXcmExtrinsicProps): Promise<SubmittableExtrinsic<'promise'>> => {
  if (!substrateApi) {
    throw Error('Substrate API is not available');
  }

  return await getAvailBridgeExtrinsicFromAvail(recipient, sendingValue, substrateApi);
};

export const createPolygonBridgeExtrinsic = async ({ destinationChain,
  evmApi,
  feeCustom,
  feeInfo,
  feeOption,
  originChain,
  originTokenInfo,
  recipient,
  sender,
  sendingValue }: CreateXcmExtrinsicProps): Promise<TransactionConfig> => {
  const isPolygonBridgeXcm = _isPolygonBridgeXcm(originChain, destinationChain);

  const isValidBridge = isPolygonBridgeXcm || _isPosBridgeXcm(originChain, destinationChain);

  if (!isValidBridge) {
    throw new Error('This is not a valid PolygonBridge transfer');
  }

  if (!evmApi) {
    throw Error('Evm API is not available');
  }

  if (!sender) {
    throw Error('Sender is required');
  }

  const sourceChain = originChain.slug;

  const createExtrinsic = isPolygonBridgeXcm
    ? (sourceChain === 'polygonzkEvm_cardona' || sourceChain === 'polygonZkEvm')
      ? _createPolygonBridgeL2toL1Extrinsic
      : _createPolygonBridgeL1toL2Extrinsic
    : (sourceChain === 'polygon_amoy' || sourceChain === 'polygon')
      ? _createPosBridgeL2toL1Extrinsic
      : _createPosBridgeL1toL2Extrinsic;

  return createExtrinsic(originTokenInfo, originChain, sender, recipient, sendingValue, evmApi, feeInfo, feeCustom, feeOption);
};

export const createXcmExtrinsicV2 = async (request: CreateXcmExtrinsicProps): Promise<SubmittableExtrinsic<'promise'> | undefined> => {
  try {
    return await buildXcm(request);
  } catch (e) {
    console.log('createXcmExtrinsicV2 error: ', e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';

    if (isChainNotSupportPolkadotApi(errorMessage)) {
      return createXcmExtrinsic(request);
    }

    return undefined;
  }
};

export const dryRunXcmExtrinsicV2 = async (request: CreateXcmExtrinsicProps): Promise<DryRunInfo> => {
  try {
    return await dryRunXcmV2(request);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';

    if (isChainNotSupportDryRun(errorMessage) || isChainNotSupportPolkadotApi(errorMessage)) {
      const xcmTransfer = await createXcmExtrinsicV2(request);

      if (!xcmTransfer) {
        return {
          success: false
        };
      }

      const _xcmFeeInfo = await xcmTransfer.paymentInfo(request.sender);
      const xcmFeeInfo = _xcmFeeInfo.toPrimitive() as unknown as RuntimeDispatchInfo;

      // skip dry run in this case
      return {
        success: true,
        fee: Math.round(xcmFeeInfo.partialFee * XCM_MIN_AMOUNT_RATIO).toString()
      };
    }

    return {
      success: false
    };
  }
};

export const createAcrossBridgeExtrinsic = async ({ destinationChain,
  destinationTokenInfo,
  evmApi,
  feeCustom,
  feeInfo,
  feeOption,
  originChain,
  originTokenInfo,
  recipient,
  sender,
  sendingValue }: CreateXcmExtrinsicProps): Promise<TransactionConfig> => {
  const isAcrossBridgeXcm = _isAcrossBridgeXcm(originChain, destinationChain);

  if (!isAcrossBridgeXcm) {
    throw new Error('This is not a valid AcrossBridge transfer');
  }

  if (!evmApi) {
    throw new Error('Evm API is not available');
  }

  if (!sender) {
    throw new Error('Sender is required');
  }

  try {
    const data = await subwalletApiSdk.xcmApi?.fetchXcmData(sender, originTokenInfo.slug, destinationTokenInfo.slug, recipient, sendingValue);

    const _feeCustom = feeCustom as EvmEIP1559FeeOption;
    const feeCombine = combineEthFee(feeInfo as EvmFeeInfo, feeOption, _feeCustom);

    if (!data) {
      throw new Error('Failed to fetch Across Bridge Data. Please try again later');
    }

    const transactionConfig: TransactionConfig = {
      from: data.sender,
      to: data.to,
      value: data.value,
      data: data.transferEncodedCall,
      ...feeCombine
    };

    const gasLimit = await evmApi.api.eth.estimateGas(transactionConfig).catch(() => 200000);

    transactionConfig.gas = gasLimit.toString();

    return transactionConfig;
  } catch (error) {
    return Promise.reject(error);
  }
};
