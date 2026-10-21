// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { getWorthAtSpot } from '@subwallet/extension-base/utils/alpha';
import BigN from 'bignumber.js';

const U64_MAX = new BigN('18446744073709551615');

/** `DefaultTaoWeight`, also what mainnet reads (10-21) */
export const DEFAULT_TAO_WEIGHT = new BigN(0.18);
/** `Delegates(hotkey)` is a take out of this */
const TAKE_SCALE = 65535;

/** One validator's stake, read from the chain at one block (EXT-14) */
export interface ValidatorStakeRow {
  /**
   * `TotalHotkeyAlpha(hotkey, netuid)` on each subnet counted, with that subnet's TAO per alpha: one on a subnet's
   * list, every subnet on root's
   */
  alphas: Array<{ alpha: BigN, taoPerAlpha: BigN }>;
  /** `TotalHotkeyAlpha(hotkey, 0)`: the hotkey's root stake, TAO */
  rootStake: BigN;
}

/** A validator's stake in rao of TAO, split as the picker shows it */
export interface ValidatorStake {
  /** Root weight plus subnet stake, as the static `validator.json` added `global_weighted_stake` up */
  totalStake: BigN;
  /** The share of the root stake that counts on each subnet: root stake × `TaoWeight` */
  rootWeight: BigN;
  /** The alpha on the hotkey, at spot: on the subnet listed, or summed over every subnet on root */
  subnetStake: BigN;
}

/** `TaoWeight` is a share of u64::MAX; the default when the chain has none */
export const decodeTaoWeight = (raw?: BigN.Value): BigN => (raw === undefined ? DEFAULT_TAO_WEIGHT : new BigN(raw).dividedBy(U64_MAX));

/** `ValidatorPermit(netuid)` is one flag per uid: the uids holding a permit */
export const getPermittedUids = (permits: boolean[]): number[] => permits.reduce<number[]>((uids, permit, uid) => (permit ? [...uids, uid] : uids), []);

/**
 * The hotkeys a picker lists, on a subnet or on root: those holding a validator permit, then those paid in the last
 * epoch — a parent earning through its child keys holds no permit. Each once, permit holders first.
 */
export const getValidatorHotkeys = (permitted: string[], paid: string[]): string[] => [...new Set([...permitted, ...paid])];

export function getValidatorStake ({ alphas, rootStake }: ValidatorStakeRow, taoWeight: BigN): ValidatorStake {
  const rootWeight = rootStake.multipliedBy(taoWeight).integerValue(BigN.ROUND_FLOOR);
  const subnetStake = alphas.reduce((sum, { alpha, taoPerAlpha }) => sum.plus(getWorthAtSpot(alpha, taoPerAlpha)), new BigN(0));

  return { rootWeight, subnetStake, totalStake: rootWeight.plus(subnetStake) };
}

/** `Delegates(hotkey)` as the picker prints a take: percent, up to 2 decimals — 11,796 is 18, 5,898 is 9 */
export const formatTake = (raw: BigN.Value): string => new BigN(raw).dividedBy(TAKE_SCALE).multipliedBy(100).decimalPlaces(2).toString();
