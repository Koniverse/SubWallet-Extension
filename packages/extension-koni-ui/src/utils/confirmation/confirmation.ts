// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ConfirmationDefinitions, ConfirmationDefinitionsBitcoin } from '@subwallet/extension-base/background/KoniTypes';
import { BitcoinSignatureSupportType, EvmSignatureSupportType } from '@subwallet/extension-koni-ui/types/confirmation';

import { ExtrinsicPayload } from '@polkadot/types/interfaces';

export const isSubstrateMessage = (payload: string | ExtrinsicPayload): payload is string => typeof payload === 'string';

export const isEvmMessage = (request: ConfirmationDefinitions[EvmSignatureSupportType][0]): request is ConfirmationDefinitions['evmSignatureRequest'][0] => {
  return !!(request as ConfirmationDefinitions['evmSignatureRequest'][0]).payload.type;
};

export const isBitcoinMessage = (request: ConfirmationDefinitionsBitcoin[BitcoinSignatureSupportType][0]): request is ConfirmationDefinitionsBitcoin['bitcoinSignatureRequest'][0] => {
  return !!(request as ConfirmationDefinitionsBitcoin['bitcoinSignatureRequest'][0]).payload.payloadJson;
};
