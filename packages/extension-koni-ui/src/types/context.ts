// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountBalanceHookType, TokenGroupHookType } from '@subwallet/extension-koni-ui/types/hook';

export type UIState = {
  setShowTabBar: (visible: boolean) => void;
}

export type HomeContextType = {
  tokenGroupStructure: TokenGroupHookType,
  accountBalance: AccountBalanceHookType,
  uiState: UIState
}
