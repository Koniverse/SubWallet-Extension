// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';

export function getPreferredNftServiceKey (chainInfo: _ChainInfo): string {
  switch (chainInfo.name) {
    case 'EVM':
      return 'evm';
    case 'SUBSTRATE':
      return 'substrate';
    case 'BITCOIN':
      return 'bitcoin';
    default:
      return 'evm'; // Fallback
  }
}

// export function isNftSupported (chainInfo: _ChainInfo): boolean {
//   // Logic kiểm tra chain có support NFT không
//   return chainInfo.hasNftSupport &&
//     !chainInfo.isTestnet && // Tuỳ config
//     chainInfo.chainStatus === 'ACTIVE';
// }
