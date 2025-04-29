// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { fetchStaticData } from '@subwallet/extension-base/utils';

export async function fetchParaSpellChainMap (): Promise<Record<string, string>> {
  return await fetchStaticData<Record<string, string>>('paraspell-chain-map');
}
