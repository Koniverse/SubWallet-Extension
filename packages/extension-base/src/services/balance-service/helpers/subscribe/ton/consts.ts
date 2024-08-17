// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

export const WORKCHAIN = 0;

export const INIT_FEE_JETTON_TRANSFER = '0.1';

export enum TON_OPCODES {
  JETTON_TRANSFER = 0xf8a7ea5,
  NFT_TRANSFER = 0x5fcc3d14,
  STONFI_SWAP = 0x25938561
}

export const EXTRA_TON_ESTIMATE_FEE = BigInt(500);

// todo: This is just free API for dev, remove this and set better RPC later
export const TON_CENTER_API_KEY = '98b3eaf42da2981d265bfa6aea2c8d390befb6f677f675fefd3b12201bdf1bc3'; // alibaba
// export const TON_CENTER_API_KEY = '870ff97c30ad16dc4297bcac8bcf2243a4daffeba6c6d6c31553e342811e673a'; // alibaba
// export const TON_CENTER_API_KEY = '078f715c911784eb4c8d2d545da3ce5db5d07996452bb2246e0a0071c66b87e9'; // alibaba

export enum TON_API_ENDPOINT {
  MAINNET = 'https://toncenter.com/api',
  TESTNET = 'https://testnet.toncenter.com/api'
}