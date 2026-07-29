// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestAccountNameValidate, RequestBounceableValidate, RequestMnemonicValidateV2, ResponseAccountNameValidate, ResponseCheckPublicAndSecretKey, ResponseMnemonicValidateV2, ResponsePrivateKeyValidateV2 } from '@subwallet/extension-base/types';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging/base';

export async function checkPublicAndPrivateKey (publicKey: string, secretKey: string): Promise<ResponseCheckPublicAndSecretKey> {
  return sendMessage('pri(accounts.validate.substrate.publicAndPrivateKey)', { publicKey, secretKey });
}

export async function validateSeedV2 (request: RequestMnemonicValidateV2): Promise<ResponseMnemonicValidateV2> {
  return sendMessage('pri(accounts.validate.seed)', request);
}

export async function validateMetamaskPrivateKeyV2 (privateKey: string): Promise<ResponsePrivateKeyValidateV2> {
  return sendMessage('pri(accounts.validate.privateKey)', { privateKey });
}

export async function validateAccountName (request: RequestAccountNameValidate): Promise<ResponseAccountNameValidate> {
  return sendMessage('pri(accounts.validate.name)', request);
}

export async function isTonBounceableAddress (request: RequestBounceableValidate): Promise<boolean> {
  return sendMessage('pri(accounts.validate.bounceable)', request);
}
