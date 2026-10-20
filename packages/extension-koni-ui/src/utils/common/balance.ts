// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _getAssetPriceId } from '@subwallet/extension-base/services/chain-service/utils';
import { CommonFeeComponent } from '@subwallet/extension-base/types';
import { BN_TEN, BN_ZERO } from '@subwallet/extension-koni-ui/constants';
import BigN from 'bignumber.js';

export const getCurrentCurrencyTotalFee = (feeComponents: CommonFeeComponent[], assetRegistryMap: Record<string, _ChainAsset>, priceMap: Record<string, number>) => {
  let result = BN_ZERO;

  feeComponents.forEach((feeItem) => {
    const asset = assetRegistryMap[feeItem.tokenSlug];

    if (asset) {
      const { decimals } = asset;
      const price = priceMap[_getAssetPriceId(asset)] || 0;

      result = result.plus(new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price));
    }
  });

  return result;
};
