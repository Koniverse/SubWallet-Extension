// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _AssetType, _ChainAsset } from '@subwallet/chain-list/types';

export type ChainInfo = {
  slug: string;
  name: string;
}

export interface ChainItemType {
  name: string;
  slug: string;
  disabled?: boolean;
}

export interface TokenTypeItem {
  label: string;
  value: _AssetType;
}

export interface ChainAssetDisplay extends _ChainAsset {
  displayName: string;
}
