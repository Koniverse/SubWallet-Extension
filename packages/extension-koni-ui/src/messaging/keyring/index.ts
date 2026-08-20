// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { KeyringState, PasskeyUnlockContext, RequestChangeMasterPassword, RequestKeyringExportMnemonic, RequestMigratePassword, RequestPasskeyUnlockAuthenticate, RequestPasskeyUnlockEnroll, RequestPasskeyUnlockReturnToPopup, RequestResetWallet, RequestUnlockKeyring, ResponseChangeMasterPassword, ResponseKeyringExportMnemonic, ResponseMigratePassword, ResponsePasskeyUnlockAuthenticate, ResponseResetWallet, ResponseUnlockKeyring } from '@subwallet/extension-base/background/KoniTypes';

import { sendMessage } from '../base';

// Keyring state
export async function keyringStateSubscribe (cb: (value: KeyringState) => void): Promise<KeyringState> {
  return sendMessage('pri(keyring.subscribe)', null, cb);
}

export async function keyringChangeMasterPassword (request: RequestChangeMasterPassword): Promise<ResponseChangeMasterPassword> {
  return sendMessage('pri(keyring.change)', request);
}

export async function keyringMigrateMasterPassword (request: RequestMigratePassword): Promise<ResponseMigratePassword> {
  return sendMessage('pri(keyring.migrate)', request);
}

export async function keyringUnlock (request: RequestUnlockKeyring): Promise<ResponseUnlockKeyring> {
  return sendMessage('pri(keyring.unlock)', request);
}

export async function passkeyUnlockGetContext (): Promise<PasskeyUnlockContext | null> {
  return sendMessage('pri(keyring.passkeyUnlock.get)', null);
}

export async function passkeyUnlockEnroll (request: RequestPasskeyUnlockEnroll): Promise<ResponseUnlockKeyring> {
  return sendMessage('pri(keyring.passkeyUnlock.enroll)', request);
}

export async function passkeyUnlockAuthenticate (request: RequestPasskeyUnlockAuthenticate): Promise<ResponsePasskeyUnlockAuthenticate> {
  return sendMessage('pri(keyring.passkeyUnlock.authenticate)', request);
}

export async function passkeyUnlockRemove (): Promise<void> {
  return sendMessage('pri(keyring.passkeyUnlock.remove)', null);
}

export async function passkeyUnlockOpenWindow (): Promise<void> {
  return sendMessage('pri(keyring.passkeyUnlock.openWindow)', null);
}

export async function passkeyUnlockReturnToPopup (request: RequestPasskeyUnlockReturnToPopup): Promise<boolean> {
  return sendMessage('pri(keyring.passkeyUnlock.returnToPopup)', request);
}

export async function keyringLock (): Promise<void> {
  return sendMessage('pri(keyring.lock)', null);
}

export async function keyringExportMnemonic (request: RequestKeyringExportMnemonic): Promise<ResponseKeyringExportMnemonic> {
  return sendMessage('pri(keyring.export.mnemonic)', request);
}

export async function resetWallet (request: RequestResetWallet): Promise<ResponseResetWallet> {
  return sendMessage('pri(keyring.reset)', request);
}
