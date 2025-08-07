// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ConfirmationDefinitions, ConfirmationDefinitionsBitcoin, ConfirmationDefinitionsCardano, ConfirmationDefinitionsTon } from '@subwallet/extension-base/background/KoniTypes';

export type EvmSignatureSupportType = keyof Pick<ConfirmationDefinitions, 'evmSignatureRequest' | 'evmSendTransactionRequest' | 'evmWatchTransactionRequest'>;
export type EvmErrorSupportType = keyof Pick<ConfirmationDefinitions, 'errorConnectNetwork'>;

export type SubmitApiType = keyof Pick<ConfirmationDefinitions, 'submitApiRequest'>;

export type TonSignatureSupportType = keyof Pick<ConfirmationDefinitionsTon, 'tonSignatureRequest' | 'tonWatchTransactionRequest' | 'tonSendTransactionRequest'>;

export type CardanoSignatureSupportType = keyof Pick<ConfirmationDefinitionsCardano, 'cardanoSignatureRequest' | 'cardanoWatchTransactionRequest' | 'cardanoSendTransactionRequest' | 'cardanoSignTransactionRequest'>;

export type BitcoinSignatureSupportType = keyof Pick<ConfirmationDefinitionsBitcoin, 'bitcoinSignatureRequest' | 'bitcoinSendTransactionRequest' | 'bitcoinWatchTransactionRequest' | 'bitcoinSignPsbtRequest' | 'bitcoinSendTransactionRequestAfterConfirmation'>;
