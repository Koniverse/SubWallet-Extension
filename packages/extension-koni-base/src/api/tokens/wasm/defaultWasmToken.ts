// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CustomToken, CustomTokenType } from '@subwallet/extension-base/background/KoniTypes';

interface WasmTokenJson {
  psp22: CustomToken[],
  psp34: CustomToken[]
}

export const DEFAULT_WASM_TOKENS: WasmTokenJson = {
  psp22: [],
  psp34: [
    {
      name: 'AFRICA’S POLKADOT EVENT',
      smartContract: '5DVG2kveDY5msL6stCh83QAz6pNN1yLa2D3yfJnLVprYWsAq',
      chain: 'alephTest',
      type: CustomTokenType.psp34
    }
  ]
};
