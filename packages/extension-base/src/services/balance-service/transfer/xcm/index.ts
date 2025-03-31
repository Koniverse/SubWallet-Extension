// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { _isPolygonBridgeXcm, _isPosBridgeXcm, _isSnowBridgeXcm } from '@subwallet/extension-base/core/substrate/xcm-parser';
import { getAvailBridgeExtrinsicFromAvail, getAvailBridgeTxFromEth } from '@subwallet/extension-base/services/balance-service/transfer/xcm/availBridge';
import { getExtrinsicByPolkadotXcmPallet } from '@subwallet/extension-base/services/balance-service/transfer/xcm/polkadotXcm';
import { _createPolygonBridgeL1toL2Extrinsic, _createPolygonBridgeL2toL1Extrinsic } from '@subwallet/extension-base/services/balance-service/transfer/xcm/polygonBridge';
import { getSnowBridgeEvmTransfer } from '@subwallet/extension-base/services/balance-service/transfer/xcm/snowBridge';
import { lightSpellChainMapping, paraSpellApi, paraSpellKey, XCM_VERSION } from '@subwallet/extension-base/services/balance-service/transfer/xcm/utils';
import { getExtrinsicByXcmPalletPallet } from '@subwallet/extension-base/services/balance-service/transfer/xcm/xcmPallet';
import { getExtrinsicByXtokensPallet } from '@subwallet/extension-base/services/balance-service/transfer/xcm/xTokens';
import { _XCM_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { _EvmApi, _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import { FeeInfo, TransactionFee } from '@subwallet/extension-base/types';
import { TransactionConfig } from 'web3-core';

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Call, ExtrinsicPayload } from '@polkadot/types/interfaces';
import { assert, compactToU8a, isHex, u8aConcat, u8aEq } from '@polkadot/util';

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

export type FunctionCreateXcmExtrinsic = (props: CreateXcmExtrinsicProps) => Promise<SubmittableExtrinsic<'promise'> | TransactionConfig>;

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

export const createXcmExtrinsicV2 = async ({ destinationChain,
  originChain,
  originTokenInfo,
  recipient,
  sendingValue,
  substrateApi }: CreateXcmExtrinsicProps): Promise<SubmittableExtrinsic<'promise'>> => {
  if (!substrateApi) {
    throw Error('Substrate API is not available');
  }

  const bodyData = {
    from: lightSpellChainMapping[originChain.slug], // add each time support new xcm chain
    to: lightSpellChainMapping[destinationChain.slug],
    address: recipient,
    currency: {
      symbol: originTokenInfo.symbol, // todo: MUST check symbol is created exactly
      amount: sendingValue
    },
    xcmVersion: XCM_VERSION.V3
  };

  const response = await fetch(paraSpellApi.buildXcm, {
    method: 'POST',
    body: JSON.stringify(bodyData),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-KEY': paraSpellKey
    }
  });

  const extrinsicHex = await response.text();
  const chainApi = await substrateApi.isReady;
  const extrinsic = txHexToSubmittableExtrinsic(chainApi.api, extrinsicHex);

  if (!extrinsic) {
    throw new Error('No extrinsic'); // todo: content?
  }

  return extrinsic;
};

export function txHexToSubmittableExtrinsic (api: ApiPromise, hex: string): SubmittableExtrinsic<'promise'> | undefined {
  try {
    assert(isHex(hex), 'Expected a hex-encoded call');

    let extrinsicCall: Call;
    let extrinsicPayload: ExtrinsicPayload | null = null;
    let decoded: SubmittableExtrinsic<'promise'> | null = null;

    try {
      // attempt to decode with api.tx
      const tx = api.tx(hex);

      // ensure that the full data matches here
      assert(tx.toHex() === hex, 'Cannot decode data as extrinsic, length mismatch');

      decoded = tx;
      extrinsicCall = api.createType('Call', decoded.method);
    } catch {
      try {
        // attempt to decode as Call
        extrinsicCall = api.createType('Call', hex);

        const callHex = extrinsicCall.toHex();

        if (callHex === hex) {
          // ok
        } else if (hex.startsWith(callHex)) {
          // this could be an un-prefixed payload...
          const prefixed = u8aConcat(compactToU8a(extrinsicCall.encodedLength), hex);

          extrinsicPayload = api.createType('ExtrinsicPayload', prefixed);

          assert(u8aEq(extrinsicPayload.toU8a(), prefixed), 'Unable to decode data as un-prefixed ExtrinsicPayload');

          extrinsicCall = api.createType('Call', extrinsicPayload.method.toHex());
        } else {
          console.error('Unable to decode data as Call, length mismatch in supplied data');
        }
      } catch {
        // final attempt, we try this as-is as a (prefixed) payload
        extrinsicPayload = api.createType('ExtrinsicPayload', hex);

        assert(extrinsicPayload.toHex() === hex, 'Unable to decode input data as Call, Extrinsic or ExtrinsicPayload');

        extrinsicCall = api.createType('Call', extrinsicPayload.method.toHex());
      }
    }

    const { method, section } = api.registry.findMetaCall(extrinsicCall.callIndex);
    const extrinsicFn = api.tx[section][method];

    if (!decoded) {
      decoded = extrinsicFn(...extrinsicCall.args);
    }

    return decoded;
  } catch (e) {
    console.error('Unable to decode tx hex', e);

    return undefined;
  }
}
