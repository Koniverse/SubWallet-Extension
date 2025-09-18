// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { _isAcrossBridgeXcm, _isPolygonBridgeXcm, _isPosBridgeXcm, _isSnowBridgeXcm } from '@subwallet/extension-base/core/substrate/xcm-parser';
import { getAvailBridgeExtrinsicFromAvail, getAvailBridgeTxFromEth } from '@subwallet/extension-base/services/balance-service/transfer/xcm/availBridge';
import { getExtrinsicByPolkadotXcmPallet } from '@subwallet/extension-base/services/balance-service/transfer/xcm/polkadotXcm';
import { _createPolygonBridgeL1toL2Extrinsic, _createPolygonBridgeL2toL1Extrinsic } from '@subwallet/extension-base/services/balance-service/transfer/xcm/polygonBridge';
import { getSnowBridgeEvmTransfer } from '@subwallet/extension-base/services/balance-service/transfer/xcm/snowBridge';
import { buildXcm, dryRunXcm, isChainNotSupportDryRun, isChainNotSupportPolkadotApi } from '@subwallet/extension-base/services/balance-service/transfer/xcm/utils';
import { getExtrinsicByXcmPalletPallet } from '@subwallet/extension-base/services/balance-service/transfer/xcm/xcmPallet';
import { getExtrinsicByXtokensPallet } from '@subwallet/extension-base/services/balance-service/transfer/xcm/xTokens';
import { _XCM_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { _EvmApi, _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import { EvmEIP1559FeeOption, EvmFeeInfo, FeeInfo, TransactionFee } from '@subwallet/extension-base/types';
import { combineEthFee } from '@subwallet/extension-base/utils';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';
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

// Q&A: Summary of XCM Bridge Extrinsic creation methods, which XCM chains are using APIs, at what level are APIs applied? Which are on-chain transactions.
// XCM Polkadot: PolkadotXcm => ParaSpell (createXcmExtrinsicV2)
// Avail Bridge: AVAIL on Ethereum (Contract) <=> AVAIL on Avail (pallet)
// Polygon Bridge: Polygon, Ethereum, PolygonZk (ETH, WETH, POL)
// Snow Bridge: Support for Mythos
// Across Bridge: Similar to Chainflip swap sent to a vault
// Some XCM types require manual claiming
// XCM channel determination is updated at KoniExtension.makeCrossChainTransfer
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

// deprecated
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

    return undefined;
  }
};

export const dryRunXcmExtrinsicV2 = async (request: CreateXcmExtrinsicProps): Promise<boolean> => {
  try {
    const dryRunResult = await dryRunXcm(request);
    const originDryRunRs = dryRunResult.origin;

    if (originDryRunRs.success) {
      const { assetHub, bridgeHub, destination, hops } = dryRunResult;

      for (const hop of hops) {
        if (!hop.result.success) {
          return false;
        }
      }

      if (assetHub?.success === false || bridgeHub?.success === false || destination?.success === false) {
        if (destination?.success === false) {
          // pass dry-run in these cases
          return isChainNotSupportDryRun(destination.failureReason) || isChainNotSupportPolkadotApi(destination.failureReason);
        }

        return false;
      }

      return true;
    }

    // pass dry-run in these cases
    return isChainNotSupportDryRun(originDryRunRs.failureReason) || isChainNotSupportPolkadotApi(originDryRunRs.failureReason);
  } catch (e) {
    return false;
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
    const data = await subwalletApiSdk.xcmApi.fetchXcmData({
      address: sender,
      from: originTokenInfo.slug,
      to: destinationTokenInfo.slug,
      recipient,
      value: sendingValue
    });

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
    if (error instanceof SyntaxError) {
      return Promise.reject(new Error('Unable to perform this transaction at the moment. Try again later'));
    }

    return Promise.reject(new Error((error as Error)?.message || 'Unable to perform this transaction at the moment. Try again later'));
  }
};
