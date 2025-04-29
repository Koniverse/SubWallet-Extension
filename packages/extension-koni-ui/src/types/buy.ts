// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type CreateBuyOrderFunction = (token: string, address: string, network: string, walletReference: string) => Promise<string>;
