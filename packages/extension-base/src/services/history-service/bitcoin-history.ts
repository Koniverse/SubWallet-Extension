// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { ChainType, ExtrinsicStatus, ExtrinsicType, TransactionDirection, TransactionHistoryItem } from '@subwallet/extension-base/background/KoniTypes';
import { BitcoinTx } from '@subwallet/extension-base/types';

function isSender (address: string, transferItem: BitcoinTx) {
  return transferItem.vin.some((i) => i.prevout.scriptpubkey_address === address);
}

export function parseBitcoinTransferData (address: string, transferItem: BitcoinTx, chainInfo: _ChainInfo): TransactionHistoryItem {
  const chainType = ChainType.BITCOIN;
  const nativeDecimals = chainInfo.bitcoinInfo?.decimals || 8;
  const nativeSymbol = chainInfo.bitcoinInfo?.symbol || '';

  const isCurrentAddressSender = isSender(address, transferItem);

  const sender = isCurrentAddressSender ? address : transferItem.vin[0]?.prevout?.scriptpubkey_address || '';
  const receiver = isCurrentAddressSender ? transferItem.vout[0]?.scriptpubkey_address || '' : address;

  const amountValue = (() => {
    const targetAddress = isCurrentAddressSender ? receiver : address;
    const vouts = transferItem.vout.filter((i) => i.scriptpubkey_address === targetAddress);

    if (vouts.length) {
      return vouts.reduce((total, item) => total + item.value, 0).toString();
    } else {
      return '0'
    }
  })();

  return {
    address,
    origin: 'blockstream',
    time: 0, // From api, cannot get time submit transaction
    blockTime: transferItem.status.block_time ? transferItem.status.block_time * 1000 : undefined,
    chainType,
    type: ExtrinsicType.TRANSFER_BALANCE,
    extrinsicHash: transferItem.txid,
    chain: chainInfo.slug,
    direction: address === sender ? TransactionDirection.SEND : TransactionDirection.RECEIVED,
    fee: {
      value: `${transferItem.fee}`,
      decimals: nativeDecimals,
      symbol: nativeSymbol
    },
    from: sender,
    to: receiver,
    blockNumber: transferItem.status.block_height || 0,
    blockHash: transferItem.status.block_hash || '',
    amount: {
      value: amountValue,
      decimals: nativeDecimals,
      symbol: nativeSymbol
    },
    status: transferItem.status.confirmed ? ExtrinsicStatus.SUCCESS : ExtrinsicStatus.PROCESSING
  };
}
