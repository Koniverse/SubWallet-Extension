// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ClearMetadataForChains from './ClearMetadataForChains';

export default class ClearMetadataForMythos extends ClearMetadataForChains {
  chains: string[] = ['mythos', 'muse_testnet'];
}
