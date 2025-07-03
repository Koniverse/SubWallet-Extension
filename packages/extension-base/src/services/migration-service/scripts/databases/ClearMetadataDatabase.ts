// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ClearMetadataForChains from './ClearMetadataForChains';

export default class ClearMetadataDatabase extends ClearMetadataForChains {
  chains: string[] = [];
}
