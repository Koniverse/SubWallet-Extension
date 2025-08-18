// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

export { default as BasePoolHandler } from './base';
export { default as NominationPoolHandler } from './nomination-pool';

export * from './lending';
export * from './liquid-staking';
export * from './native-staking';

// Q&A: Issues that need to be checked
// Calculate the amount of tokens that can be farmed => Use transferable balance, need to keep an additional maintain balance amount (including ED) to pay fees later.
// Currently interlay lending has been removed and blocked on UI.
// liquid-staking has not been maintained for quite a while
// Double check issues related to Middleware services => getPoolTargets

// Multiple step farming - XCM
// XCM substrate => XCM transfer => Perform staking
// Approved token of EVM when staking EVM on a contract
// Example: StDot on moonbeam => Transfer xcDot => StDot => Staking on moonbeam (Actually granting permission to StDot contract for staking)
// Currently only supports EVM staking on Moonbeam

// Double check issues related to claim rewards
// Only applies to native staking and nomination pool staking
// Native staking: Automatically returns rewards to the original wallet and pools. Some networks require claim rewards like Mythos, Amplitude. With Astar handled through dApp.
// Nomination pool staking: need to manually claim or delegate to claim rewards. Claim all pool rewards and return to the original wallet.
// Exists forever.
