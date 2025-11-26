// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface UnlockingChunk {
  value: number,
  era: number
}

export interface PalletStakingStakingLedger {
  stash: string,
  total: number,
  active: number,
  unlocking: UnlockingChunk[],
  claimedRewards: number[]
}
