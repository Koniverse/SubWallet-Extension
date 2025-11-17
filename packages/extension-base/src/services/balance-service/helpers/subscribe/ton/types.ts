// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { Cell } from '@ton/core';

export type Signer = (message: Cell) => Promise<Buffer>;

export interface TxByMsgResponse {
  transactions: TxDetailInfo[]
}

export type AccountState = 'uninitialized' | 'active' | 'frozen' | 'unknown';

interface TxDetailInfo {
  hash: string
  description: {
    compute_ph: {
      success: boolean
    },
    action: {
      success: boolean
    }
  },
  in_msg: Msg,
  out_msgs: Msg[]
}

interface Msg {
  hash: string,
  bounced: boolean,
  opcode: string
}

interface TonApiJettonBalance {
  balance: string;
  jetton: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface TonApiJettonResponse {
  balances: TonApiJettonBalance[];
}

export interface TonApiAccountResponse {
  address: string;
  balance: number;
}
