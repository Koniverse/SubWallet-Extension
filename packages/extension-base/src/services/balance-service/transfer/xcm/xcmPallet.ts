// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { _getXcmBeneficiary, _getXcmDestWeight, _getXcmMultiAssets, _getXcmMultiLocation } from '@subwallet/extension-base/core/substrate/xcm-parser';
import { getBuyExecution, getClearOrigin, getDepositAsset, getReceiveTeleportedAsset } from '@subwallet/extension-base/services/balance-service/transfer/xcm/instruction/utils';
import { isUseTeleportProtocol, STABLE_XCM_VERSION } from '@subwallet/extension-base/services/balance-service/transfer/xcm/utils';

import { ApiPromise } from '@polkadot/api';

// this pallet is only used by Relaychains
export function getExtrinsicByXcmPalletPallet (tokenInfo: _ChainAsset, originChainInfo: _ChainInfo, destinationChainInfo: _ChainInfo, recipientAddress: string, value: string, api: ApiPromise) {
  const weightParam = _getXcmDestWeight(originChainInfo);
  const destination = _getXcmMultiLocation(originChainInfo, destinationChainInfo, STABLE_XCM_VERSION);
  const beneficiary = _getXcmBeneficiary(destinationChainInfo, recipientAddress, STABLE_XCM_VERSION);
  const tokenLocation = _getXcmMultiAssets(tokenInfo, value, STABLE_XCM_VERSION);

  let method = 'limitedReserveTransferAssets';

  if (isUseTeleportProtocol(originChainInfo, destinationChainInfo)) {
    method = 'limitedTeleportAssets';
  }

  return api.tx.xcmPallet[method](
    destination,
    beneficiary,
    tokenLocation,
    0,
    weightParam
  );
}

// @ts-ignore
async function getTeleportDeliveryFee (tokenInfo: _ChainAsset, originChainInfo: _ChainInfo, destinationChainInfo: _ChainInfo, recipientAddress: string, value: string, api: ApiPromise) { // todo: convert params with interface
  const destination = _getXcmMultiLocation(originChainInfo, destinationChainInfo, STABLE_XCM_VERSION);
  const message = getTeleportMessage(tokenInfo, originChainInfo, destinationChainInfo, recipientAddress, value);
  // `value` affect to delivery fee. Parsing mock value makes the fee a bit different.

  return (await api.call.xcmPaymentApi.queryDeliveryFees(
    destination,
    message
  )).toPrimitive();
}

function getTeleportMessage (tokenInfo: _ChainAsset, originChainInfo: _ChainInfo, destinationChainInfo: _ChainInfo, recipientAddress: string, value: string) {
  const version = STABLE_XCM_VERSION;

  return {
    [`V${version}`]: [
      getReceiveTeleportedAsset(tokenInfo, value, version),
      getClearOrigin(),
      getBuyExecution(tokenInfo, originChainInfo, value, version),
      getDepositAsset(destinationChainInfo, recipientAddress, version)
      // getSetTopic()
    ]
  };
}
