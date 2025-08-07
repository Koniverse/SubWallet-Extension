// Copyright 2019-2022 @subwallet/extension-koni-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Hotfix: Define these keys locally to avoid circular dependency between logo/index.ts and constants/index.ts
// Do NOT import from constants/index.ts — doing so may cause `undefined` values at runtime
const SUBSTRATE_GENERIC_KEY = 'substrate_generic';
const SUBSTRATE_MIGRATION_KEY = 'substrate_migration';

export const DefaultLogosMap: Record<string, string> = {
  subwallet: '/images/projects/subwallet.png',
  parity: '/images/projects/parity.png',
  keystone: '/images/projects/keystone.png',
  ledger: '/images/projects/ledger.png',
  default: '/images/subwallet/default.png',
  transak: '/images/projects/transak.png',
  moonpay: '/images/projects/moonpay.png',
  onramper: '/images/projects/onramper.png',
  polkadot_vault: '/images/projects/polkadot-vault.png',
  walletconnect: '/images/projects/walletconnect.png',
  banxa: '/images/projects/banxa.png',
  coinbase: '/images/projects/coinbase.png',
  rocketIcon: '/images/projects/rocket-icon.gif',
  invarch: '/images/projects/invarch.png',
  sora_polkadot: '/images/projects/sora_polkadot.png',
  logion: '/images/projects/logion.png',
  energy_web_x: '/images/projects/energy_web_x.png',
  moonsama: '/images/projects/moonsama.svg',
  omnibtc: '/images/projects/omnibtc.jpg',
  coinversation: '/images/projects/coinversation.jpg',
  peaq: '/images/projects/peaq.jpg',
  t3rn: '/images/projects/t3rn.png',
  moonwell: '/images/projects/moonwell-apollo.png',
  stellaswap: '/images/projects/stellaswap.png',
  subwallet_gradient: '/images/projects/subwallet-gradient.png',
  subwallet_mc: '/images/projects/subwallet-monochrome.svg',
  polkadot_js: '/images/projects/polkadot-js.png',
  polkadot_js_mc: '/images/projects/polkadot-js-monochrome.svg',
  talisman: '/images/projects/talisman.png',
  talisman_mc: '/images/projects/talisman-monochrome.svg',
  nova: '/images/projects/nova-wallet.png',
  nova_mc: '/images/projects/nova-wallet-monochrome.svg',
  xtwitter: '/images/projects/xtwitter.png',
  xtwitter_transparent: '/images/projects/xtwitter_transparent.png',
  chain_flip: '/images/projects/chainflip-mainnet.png',
  hydradx: '/images/projects/hydradx.png',
  simple_swap: '/images/projects/simple-swap.png',
  uniswap: '/images/projects/uniswap.png',
  kyber: '/images/projects/kyber.png',
  ordinal_rune: '/images/projects/ordinal_rune.png',
  polkadot_assethub: '/images/projects/polkadot-asset-hub.png',
  kusama_assethub: '/images/projects/kusama-asset-hub.png',
  rococo_assethub: '/images/projects/rococo-asset-hub.png',
  currency_brl: '/images/projects/CurrencyBRL.png',
  currency_cny: '/images/projects/CurrencyCNY.png',
  currency_hkd: '/images/projects/CurrencyHKD.png',
  currency_vnd: '/images/projects/CurrencyVND.png',
  [SUBSTRATE_GENERIC_KEY]: '/images/projects/polkadot.png',
  [SUBSTRATE_MIGRATION_KEY]: '/images/projects/polkadot-migration.png',
  ton: '/images/projects/ton.png',
  ...Object.fromEntries( // Can use image from chain-list instead of local image
    Array.from({ length: 96 }, (_, i) => [`subnet-${i}`, `/images/bittensor/subnet-${i}.png`])
  ),
  meld: '/images/projects/meld.png'
};

export const IconMap = {
  __CONNECTED__: '/images/icons/__connected__.png',
  __CONNECTING__: '/images/icons/__connecting__.png',
  __UNSTABLE__: '/images/icons/__unstable__.png',
  __DISCONNECTED__: '/images/icons/__disconnected__.png',
  __qr_code__: '/images/icons/__qr_code__.png'
};

export default DefaultLogosMap;
