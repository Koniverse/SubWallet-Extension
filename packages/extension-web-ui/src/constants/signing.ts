// Copyright 2019-2022 @polkadot/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountSignMode } from '@subwallet/extension-base/types';
import { ConfirmationType } from '@subwallet/extension-web-ui/stores/base/RequestState';

export const MODE_CAN_SIGN: AccountSignMode[] = [AccountSignMode.PASSWORD, AccountSignMode.QR, AccountSignMode.LEGACY_LEDGER, AccountSignMode.GENERIC_LEDGER, AccountSignMode.ECDSA_SUBSTRATE_LEDGER];

export const NEED_SIGN_CONFIRMATION: ConfirmationType[] = ['evmSignatureRequest', 'evmSendTransactionRequest', 'signingRequest'];
