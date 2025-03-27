// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

// --- INSTRUCTIONS --- //

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { _Address } from '@subwallet/extension-base/background/KoniTypes';
import { _getAssetIdentifier, _getRecipientLocation, _getXcmDestWeight } from '@subwallet/extension-base/core/substrate/xcm-parser';

export function getReceiveTeleportedAsset (tokenInfo: _ChainAsset, value: string, version: number) {
  return {
    ReceiveTeleportedAsset: [
      {
        id: _getAssetIdentifier(tokenInfo, version),
        fun: {
          Fungible: value
        }
      }
    ]
  };
}

export function getReserveAssetDeposited (tokenInfo: _ChainAsset, value: string, version: number) {
  return {
    ReserveAssetDeposited: [
      {
        id: _getAssetIdentifier(tokenInfo, version),
        fun: {
          Fungible: value
        }
      }
    ]
  };
}

export function getClearOrigin () {
  return {
    ClearOrigin: null
  };
}

export function getBuyExecution (tokenInfo: _ChainAsset, originChainInfo: _ChainInfo, value: string, version: number) {
  return {
    BuyExecution: {
      fees: {
        id: _getAssetIdentifier(tokenInfo, version),
        fun: {
          Fungible: value
        }
      },
      weightLimit: _getXcmDestWeight(originChainInfo)
    }
  };
}

export function getDepositAsset (destChainInfo: _ChainInfo, recipient: _Address, version: number) {
  return {
    DepositAsset: {
      assets: {
        Wild: {
          AllCounted: 1
        }
      },
      beneficiary: {
        parent: 0,
        interior: {
          X1: _getRecipientLocation(destChainInfo, recipient, version)
        }
      }
    }
  };
}

export function getSetTopic () {
  return {
    SetTopic: '0x4fb7993181588941a128241eaa9297c36155c02cfd070676ddbff83f37511f96'
  };
}

// todo
export function getWithdrawAsset (value: string) {
  return {
    WithdrawAsset: [
      {
        id: {
          Concrete: {
            parents: 1,
            interior: 'Here'
          }
        },
        fun: {
          Fungible: value
        }
      }
    ]
  };
}

// todo
export function getSetAppendix () {
  return {
    SetAppendix: [
      {
        DepositAsset: { // todo: use getDepositAsset
          assets: {
            Wild: {
              AllCounted: 1
            }
          },
          beneficiary: {
            parent: 1,
            interior: {
              X1: {
                Parachain: 1000
              }
            }
          }
        }
      }
    ]
  };
}

// todo
export function getExportMessage () {
  return {
    ExportMessage: {
      xcm: [
        {
          // WithdrawAsset: getWithdrawAsset(),
          // ClearOrigin: getClearOrigin(),
          // BuyExecution: getBuyExecution(),
          // DepositAsset: getDepositAsset()
          // SetTopic: getSetTopic()
        }
      ]
    }
  };
}

// --- INSTRUCTIONS --- //

// --- OTHERS --- //

// --- OTHERS --- //
