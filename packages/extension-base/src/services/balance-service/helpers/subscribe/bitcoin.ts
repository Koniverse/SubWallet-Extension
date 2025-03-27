// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

export const subscribeBitcoinBalance = async (address: string[]) => {
  console.log('btc balance');

  return () => {
    console.log('unsub');
  };
};
