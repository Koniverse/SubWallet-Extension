// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { getPriceAfterStake, getPriceAfterUnstake } from '@subwallet/extension-base/utils/alpha';
import BigN from 'bignumber.js';

import { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';

export interface SimulatedSubnetTrade {
  /** TAO per alpha before the trade */
  spot: BigN;
  /** TAO per alpha once the trade fills in full: what the chain checks a limit against */
  priceAfter: BigN;
  /** What the trade pays out, after the fee, in rao of the output */
  out: BigN;
  /** The pool fee, in rao of the input */
  fee: BigN;
}

/**
 * Stakes `amount` TAO into, or unstakes `amount` alpha from, subnet `netuid` with the chain's own
 * simulation (`sim_swap_tao_for_alpha` / `sim_swap_alpha_for_tao`), and the pool price it leaves
 * (EXT-5, EXT-6). One round of three parallel requests, on the best block or, with `at`, on that block.
 */
export async function simulateSubnetTrade (api: ApiPromise, netuid: number, amount: BigN, isStake: boolean, at?: ApiDecoration<'promise'>): Promise<SimulatedSubnetTrade> {
  const source = at ?? api;
  const [priceCodec, [taoInCodec, alphaInCodec], simCodec] = await Promise.all([
    source.call.swapRuntimeApi.currentAlphaPrice(netuid),
    // One request either way: the API batches plain reads of the best block itself, but not reads at a block
    at
      ? at.queryMulti([[at.query.subtensorModule.subnetTAO, netuid], [at.query.subtensorModule.subnetAlphaIn, netuid]])
      : Promise.all([api.query.subtensorModule.subnetTAO(netuid), api.query.subtensorModule.subnetAlphaIn(netuid)]),
    isStake
      ? source.call.swapRuntimeApi.simSwapTaoForAlpha(netuid, amount.toFixed(0))
      : source.call.swapRuntimeApi.simSwapAlphaForTao(netuid, amount.toFixed(0))
  ]);
  // rao per alpha
  const spot = new BigN(priceCodec.toString()).dividedBy(1e9);
  const pool = { taoIn: new BigN(taoInCodec.toString()), alphaIn: new BigN(alphaInCodec.toString()) };
  const sim = simCodec.toPrimitive() as { taoAmount?: number | string, alphaAmount?: number | string, taoFee?: number | string, alphaFee?: number | string };

  if (isStake) {
    const out = new BigN(sim.alphaAmount ?? 0);
    const fee = new BigN(sim.taoFee ?? 0);

    return { spot, out, fee, priceAfter: getPriceAfterStake(spot, pool, amount, fee, out) };
  }

  const out = new BigN(sim.taoAmount ?? 0);
  const fee = new BigN(sim.alphaFee ?? 0);

  return { spot, out, fee, priceAfter: getPriceAfterUnstake(spot, pool, amount, fee, out) };
}
