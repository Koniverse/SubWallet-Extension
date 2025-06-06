// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AnalyzeAddress } from '@subwallet/extension-base/types';
import { getBitcoinAccountDetails } from '@subwallet/extension-koni-ui/utils';
import { getKeypairTypeByAddress, isBitcoinAddress } from '@subwallet/keyring';

export const sortFuncAnalyzeAddress = (a: AnalyzeAddress, b: AnalyzeAddress) => {
  const _isABitcoin = isBitcoinAddress(a.address);
  const _isBBitcoin = isBitcoinAddress(b.address);
  const _isSameProxyId = a.proxyId === b.proxyId;

  if (_isABitcoin && _isBBitcoin && _isSameProxyId) {
    const aKeyPairType = getKeypairTypeByAddress(a.address);
    const bKeyPairType = getKeypairTypeByAddress(b.address);

    const aDetails = getBitcoinAccountDetails(aKeyPairType);
    const bDetails = getBitcoinAccountDetails(bKeyPairType);

    return aDetails.order - bDetails.order;
  }

  return ((a?.displayName || '').toLowerCase() > (b?.displayName || '').toLowerCase()) ? 1 : -1;
};
