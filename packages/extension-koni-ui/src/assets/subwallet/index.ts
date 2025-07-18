// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SwapProviderId } from '@subwallet/extension-base/types/swap';
import { DefaultLogosMap } from '@subwallet/extension-koni-ui/assets/logo';
import { SUBSTRATE_GENERIC_KEY, SUBSTRATE_MIGRATION_KEY } from '@subwallet/extension-koni-ui/constants';

const SwLogosMap: Record<string, string> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  subwallet: require('./subwallet.png'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  avatar_placeholder: require('./avatar_placeholder.png'),
  default: DefaultLogosMap.default,
  transak: DefaultLogosMap.transak,
  onramper: DefaultLogosMap.onramper,
  moonpay: DefaultLogosMap.moonpay,
  banxa: DefaultLogosMap.banxa,
  coinbase: DefaultLogosMap.coinbase,
  stellaswap: DefaultLogosMap.stellaswap,
  chain_flip_mainnet: DefaultLogosMap.chain_flip,
  chain_flip_testnet: DefaultLogosMap.chain_flip,
  simple_swap: DefaultLogosMap.simple_swap,
  uniswap: DefaultLogosMap.uniswap,
  kyber: DefaultLogosMap.kyber,
  hydradx_mainnet: DefaultLogosMap.hydradx,
  hydradx_testnet: DefaultLogosMap.hydradx,
  ordinal_rune: DefaultLogosMap.ordinal_rune,
  [SUBSTRATE_GENERIC_KEY]: DefaultLogosMap[SUBSTRATE_GENERIC_KEY],
  [SUBSTRATE_MIGRATION_KEY]: DefaultLogosMap[SUBSTRATE_MIGRATION_KEY],
  [SwapProviderId.POLKADOT_ASSET_HUB.toLowerCase()]: DefaultLogosMap.polkadot_assethub,
  [SwapProviderId.KUSAMA_ASSET_HUB.toLowerCase()]: DefaultLogosMap.kusama_assethub,
  [SwapProviderId.ROCOCO_ASSET_HUB.toLowerCase()]: DefaultLogosMap.rococo_assethub,
  ton: DefaultLogosMap.ton,
  ...Object.fromEntries(
    Array.from({ length: 96 }, (_, i) => [`subnet-${i}`, `./images/bittensor/subnet-${i}.png`])
  ),
  meld: DefaultLogosMap.meld
};

export default SwLogosMap;
