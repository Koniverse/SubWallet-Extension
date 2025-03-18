// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';

export interface XcmApiResponse {
  data: {
    sender: string;
    to: string;
    transferEncodedCall: string;
    value: string;
  };
  status: string;
}

export function _isAcrossChainBridge (srcChain: string, destChain: string): boolean {
  if (srcChain === 'base_sepolia' && destChain === COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA) {
    return true;
  } else if (srcChain === COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA && destChain === 'base_sepolia') {
    return true;
  }

  return false;
}
