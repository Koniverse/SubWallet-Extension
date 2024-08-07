// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

// import { getHttpEndpoint } from '@orbs-network/ton-access';
import { _TonApi } from '@subwallet/extension-base/services/chain-service/types';
import { Address, beginCell, Cell, storeMessage } from '@ton/core';
import { KeyPair, mnemonicToPrivateKey } from '@ton/crypto';
import { external, JettonMaster, JettonWallet, OpenedContract, WalletContractV4 } from '@ton/ton';

export function getJettonMasterContract (tonApi: _TonApi, contractAddress: string) {
  const masterAddress = Address.parse(contractAddress);

  return tonApi.open(JettonMaster.create(masterAddress));
}

export async function getJettonWalletContract (jettonMasterContract: OpenedContract<JettonMaster>, tonApi: _TonApi, ownerAddress: string) {
  await sleep(1500);
  const walletAddress = Address.parse(ownerAddress);

  await sleep(1500);
  const jettonWalletAddress = await jettonMasterContract.getWalletAddress(walletAddress);

  await sleep(1500);

  return tonApi.open(JettonWallet.create(jettonWalletAddress));
}

// export async function getTonClient (isTestnet = false) {
//   if (isTestnet) {
//     const endpoint = await getHttpEndpoint({ network: 'testnet' });
//
//     return new TonClient({ endpoint });
//   }
//
//   const endpoint = await getHttpEndpoint();
//
//   return new TonClient({ endpoint });
// }

export function sleep (ms: number) { // alibaba for test
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getKeyPair (mnemonic: string): Promise<KeyPair> {
  return await mnemonicToPrivateKey(mnemonic.split(' ').map((word) => word.trim()));
}

export function externalMessage (contract: WalletContractV4, seqno: number, body: Cell) {
  return beginCell()
    .storeWritable(
      storeMessage(
        external({
          to: contract.address,
          init: seqno === 0 ? contract.init : undefined,
          body: body
        })
      )
    )
    .endCell();
}

export async function sendTonTransaction (boc: string) {
  const resp = await fetch(
    'https://testnet.toncenter.com/api/v2/sendBocReturnHash', { // todo: create function to get this api by chain
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-API-KEY': '98b3eaf42da2981d265bfa6aea2c8d390befb6f677f675fefd3b12201bdf1bc3' // todo: hide this key
      },
      body: JSON.stringify({
        boc: boc
      })
    }
  );

  return await resp.json() as string;
}

export async function signWithSigner (message: Cell): Promise<Buffer> {
  const base64Signature = await new Promise<string>((resolve, reject) => {
    const signerPromise: {
      resolve: (base64Signature: string) => void;
      reject: () => void;
    } | null = { resolve, reject };
  });

  return Buffer.from(base64Signature, 'base64');
}

export async function getStatusByExtMsgHash (extMsgHash: string) {

}
