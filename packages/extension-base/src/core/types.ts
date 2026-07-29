// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { AccountJson } from '@subwallet/extension-base/types';

export type LedgerMustCheckType = 'polkadot' | 'migration' | 'polkadot_ecdsa' | 'unnecessary';

export enum ValidationCondition {
  IS_NOT_NULL = 'IS_NOT_NULL',
  IS_ADDRESS = 'IS_ADDRESS',
  IS_VALID_ADDRESS_FOR_ECOSYSTEM = 'IS_VALID_ADDRESS_FOR_ECOSYSTEM',
  IS_VALID_SUBSTRATE_ADDRESS_FORMAT = 'IS_VALID_SUBSTRATE_ADDRESS_FORMAT',
  IS_VALID_TON_ADDRESS_FORMAT = 'IS_VALID_TON_ADDRESS_FORMAT',
  IS_VALID_CARDANO_ADDRESS_FORMAT = 'IS_VALID_CARDANO_ADDRESS_FORMAT',
  IS_VALID_BITCOIN_ADDRESS_FORMAT = 'IS_VALID_BITCOIN_ADDRESS_FORMAT',
  IS_NOT_DUPLICATE_ADDRESS = 'IS_NOT_DUPLICATE_ADDRESS',
  IS_SUPPORT_LEDGER_ACCOUNT = 'IS_SUPPORT_LEDGER_ACCOUNT'
}

export enum ActionType {
  SEND_FUND = 'SEND_FUND',
  SEND_NFT = 'SEND_NFT',
  SWAP = 'SWAP',
  MANAGE_SUBSTRATE_PROXY_ACCOUNT = 'MANAGE_SUBSTRATE_PROXY_ACCOUNT'
}

export interface ValidateRecipientParams {
  srcChain: string,
  destChainInfo: _ChainInfo,
  assetInfo?: _ChainAsset,
  fromAddress: string,
  toAddress: string,
  account: AccountJson | null, // If the recipient address exists in the wallet, then `account` is the information of that address.
  actionType: ActionType,
  autoFormatValue?: boolean,
  allowLedgerGenerics: string[]
}
