// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { WORKCHAIN } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/ton/consts';
import { sleep } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/ton/utils';
import { _TonApi } from '@subwallet/extension-base/services/chain-service/types';
import { keyring } from '@subwallet/ui-keyring';
import {fromNano, internal, MessageRelaxed, toNano} from '@ton/core';
import { Address, WalletContractV4 } from '@ton/ton';

interface TonTransactionConfigProps {
  from: string,
  to: string,
  networkKey: string,
  value: string,
  transferAll: boolean,
  tonApi: _TonApi
}

export interface TonTransactionConfig {
  from: string,
  to: string,
  networkKey: string,
  value: string,
  messages: MessageRelaxed[]
  estimateFee: string;
  seqno: number
}

export async function createTonTransaction ({ from, networkKey, to, tonApi, transferAll, value }: TonTransactionConfigProps): Promise<[TonTransactionConfig, string]> {
  const keyPair = keyring.getPair(from);
  const tonAddress = Address.parse(from);
  const walletContract = WalletContractV4.create({ workchain: WORKCHAIN, publicKey: Buffer.from(keyPair.publicKey) });
  const contract = tonApi.open(walletContract);
  const seqno = await contract.getSeqno();

  let transferValue: string | undefined;

  const messages = [
    internal({
      to: to,
      value: fromNano(value),
      body: 'SubWallet Bluedot',
      bounce: false
    })
  ];

  const fakeContract = tonApi.open(WalletContractV4.create({ workchain: WORKCHAIN, publicKey: Buffer.from(new Array(32)) }));

  await sleep(1500);
  const fakeSeqno = await fakeContract.getSeqno();
  const fakeCell = fakeContract.createTransfer({
    secretKey: Buffer.from(new Array(64)),
    seqno: fakeSeqno,
    messages
  });

  await sleep(1500);
  const estimateFeeInfo = await tonApi.estimateExternalMessageFee(tonAddress, fakeCell); // todo: optimize the estimate fee
  const estimateFee = BigInt(
    estimateFeeInfo.source_fees.gas_fee +
    estimateFeeInfo.source_fees.in_fwd_fee +
    estimateFeeInfo.source_fees.storage_fee +
    estimateFeeInfo.source_fees.fwd_fee
  );

  if (transferAll) {
    await sleep(1500);
    const balance = await tonApi.getBalance(tonAddress);

    transferValue = (balance - estimateFee).toString();
  }

  const transactionObject = {
    from,
    to,
    networkKey,
    value: transferValue ?? value,
    messages,
    estimateFee: estimateFee.toString(),
    seqno
  } as unknown as TonTransactionConfig;

  return [transactionObject, transactionObject.value];
}
