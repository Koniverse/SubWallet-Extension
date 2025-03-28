// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { _getXcmDestWeight, _getXcmMultiAssets, _getXcmMultiLocation } from '@subwallet/extension-base/core/substrate/xcm-parser';
import { getBuyExecution, getClearOrigin, getDepositAsset, getWithdrawAsset } from '@subwallet/extension-base/services/balance-service/transfer/xcm/instruction/utils';
import { STABLE_XCM_VERSION } from '@subwallet/extension-base/services/balance-service/transfer/xcm/utils';
import { _getTokenOnChainAssetId, _getTokenOnChainInfo, _getXcmAssetId, _getXcmAssetMultilocation, _getXcmAssetType } from '@subwallet/extension-base/services/chain-service/utils';

import { ApiPromise } from '@polkadot/api';

function getCurrencyId (tokenInfo: _ChainAsset): unknown {
  if (['moonbeam', 'moonbase', 'moonriver'].includes(tokenInfo.originChain)) {
    const tokenType = _getXcmAssetType(tokenInfo);
    const assetId = _getXcmAssetId(tokenInfo);

    return { [tokenType]: assetId };
  }

  return _getTokenOnChainInfo(tokenInfo) || _getTokenOnChainAssetId(tokenInfo);
}

export function getExtrinsicByXtokensPallet (tokenInfo: _ChainAsset, originChainInfo: _ChainInfo, destinationChainInfo: _ChainInfo, recipientAddress: string, value: string, api: ApiPromise) {
  const version = STABLE_XCM_VERSION;
  const destination = _getXcmMultiLocation(originChainInfo, destinationChainInfo, version, recipientAddress);

  dlvFeeTransfer(tokenInfo, originChainInfo, destinationChainInfo, recipientAddress, value, api)
    .then((rs) => console.log('rs', rs)).catch(console.error);

  if (!_getXcmAssetMultilocation(tokenInfo)) {
    const tokenCurrencyId = getCurrencyId(tokenInfo);

    return api.tx.xTokens.transfer(
      tokenCurrencyId,
      value,
      destination,
      _getXcmDestWeight(originChainInfo)
    );
  }

  const tokenMultiAsset = _getXcmMultiAssets(tokenInfo, value, version);

  return api.tx.xTokens.transferMultiassets(
    tokenMultiAsset,
    0,
    destination,
    _getXcmDestWeight(originChainInfo)
  );
}

// @ts-ignore
async function dlvFeeTransferMultiassets (tokenInfo: _ChainAsset, originChainInfo: _ChainInfo, destinationChainInfo: _ChainInfo, recipientAddress: string, value: string, api: ApiPromise) { // todo: convert params with interface
  const version = STABLE_XCM_VERSION;
  const destination = _getXcmMultiLocation(originChainInfo, destinationChainInfo, version);
  const message = msgTransferMultiassets(tokenInfo, originChainInfo, destinationChainInfo, recipientAddress, value, version);
  // `value` affect to delivery fee. Parsing mock value makes the fee a bit different.

  const dlvFeeInfo = (await api.call.xcmPaymentApi.queryDeliveryFees(
    destination,
    message
  )).toPrimitive();

  return dlvFeeInfo;
}

// @ts-ignore
async function dlvFeeTransfer (tokenInfo: _ChainAsset, originChainInfo: _ChainInfo, destinationChainInfo: _ChainInfo, recipientAddress: string, value: string, api: ApiPromise) {
  const version = STABLE_XCM_VERSION;
  const destination = _getXcmMultiLocation(originChainInfo, destinationChainInfo, version);
  const message = msgTransfer(tokenInfo, originChainInfo, destinationChainInfo, recipientAddress, value, version);

  console.log('message', message);

  const dlvFeeInfo = (await api.call.xcmPaymentApi.queryDeliveryFees(
    destination,
    message
  )).toPrimitive();

  return dlvFeeInfo;
}

function msgTransferMultiassets (tokenInfo: _ChainAsset, originChainInfo: _ChainInfo, destinationChainInfo: _ChainInfo, recipientAddress: string, value: string, version: number) {
  return {
    [`V${version}`]: [
      getWithdrawAsset(tokenInfo, value, version),
      getClearOrigin(),
      getBuyExecution(tokenInfo, originChainInfo, value, version),
      getDepositAsset(destinationChainInfo, recipientAddress, version)
      // getSetTopic()
    ]
  };
}

// currently, same as msgTransferMultiassets
function msgTransfer (tokenInfo: _ChainAsset, originChainInfo: _ChainInfo, destinationChainInfo: _ChainInfo, recipientAddress: string, value: string, version: number) {
  return {
    [`V${version}`]: [
      getWithdrawAsset(tokenInfo, value, version),
      getClearOrigin(),
      getBuyExecution(tokenInfo, originChainInfo, value, version),
      getDepositAsset(destinationChainInfo, recipientAddress, version)
      // getSetTopic()
    ]
  };
}
