// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import * as csl from '@emurgo/cardano-serialization-lib-nodejs';
import { _AssetType, _ChainAsset } from '@subwallet/chain-list/types';
import { ErrorValidation } from '@subwallet/extension-base/background/KoniTypes';
import { CardanoTxJson, CardanoTxOutput } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/cardano/types';
import { CardanoAssetMetadata, getAdaBelongUtxo, getCardanoTxFee, splitCardanoId } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/cardano/utils';
import { _CardanoApi } from '@subwallet/extension-base/services/chain-service/types';
import { toUnit } from '@subwallet/extension-base/utils';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';

export interface CardanoTransactionConfigProps {
  tokenInfo: _ChainAsset;
  nativeTokenInfo: _ChainAsset;
  from: string,
  to: string,
  networkKey: string,
  value: string,
  transferAll: boolean,
  cardanoTtlOffset: number,
  cardanoApi: _CardanoApi
}

export interface CardanoTransactionConfig {
  from: string,
  to: string,
  networkKey: string,
  value: string,
  transferAll: boolean,
  cardanoTtlOffset: number,
  estimateCardanoFee: string,
  cardanoPayload: string, // hex unsigned tx
  errors?: ErrorValidation[]
}

enum POPULAR_CARDANO_ERROR_PHRASE {
  NOT_MATCH_MIN_AMOUNT = 'less than the minimum UTXO value',
  INSUFFICIENT_INPUT = 'Insufficient input in transaction'
}

function getFirstNumberAfterSubstring (inputStr: string, subStr: string) {
  const regex = new RegExp(`(${subStr})\\D*(\\d+)`);
  const match = inputStr.match(regex);

  if (match) {
    return parseInt(match[2], 10);
  } else {
    return null;
  }
}

export async function createCardanoTransaction (params: CardanoTransactionConfigProps): Promise<[CardanoTransactionConfig | null, string]> {
  const { cardanoTtlOffset, from, networkKey, to, tokenInfo, transferAll, value } = params;

  const cardanoId = tokenInfo.metadata?.cardanoId;
  const isNativeTransfer = tokenInfo.assetType === _AssetType.NATIVE;
  const isSelfTransfer = from === to;

  if (!cardanoId) {
    throw new Error('Missing token policy id metadata');
  }

  let payload: string;

  try {
    payload = await subwalletApiSdk.cardanoApi.fetchUnsignedPayload({
      sender: from,
      receiver: to,
      unit: cardanoId,
      quantity: value
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    const tokenDecimals = params.tokenInfo.decimals || 0; // todo: review if should use nativeTokenDecimals?
    const nativeTokenSymbol = params.nativeTokenInfo.symbol;

    if (errorMessage.includes(POPULAR_CARDANO_ERROR_PHRASE.NOT_MATCH_MIN_AMOUNT)) {
      const minAdaRequiredRaw = getFirstNumberAfterSubstring(errorMessage, POPULAR_CARDANO_ERROR_PHRASE.NOT_MATCH_MIN_AMOUNT);
      const minAdaRequired = minAdaRequiredRaw ? toUnit(minAdaRequiredRaw, tokenDecimals) : 1;

      throw new Error(`Amount too low. Increase your amount above ${minAdaRequired} ${nativeTokenSymbol} and try again`);
    }

    if (errorMessage.includes(POPULAR_CARDANO_ERROR_PHRASE.INSUFFICIENT_INPUT)) {
      throw new Error(`Insufficient ${nativeTokenSymbol} balance to perform transaction. Top up ${nativeTokenSymbol} and try again`);
    }

    console.error(`Transaction is not built successfully: ${errorMessage}`);
    throw new Error('Unable to perform this transaction at the moment. Try again later');
  }

  if (!payload) {
    throw new Error('Build cardano payload failed!');
  }

  console.log('Build cardano payload successfully!', payload);

  validatePayload(payload, params);

  const fee = getCardanoTxFee(payload);
  const adaBelongToCnaUtxo = isNativeTransfer || isSelfTransfer ? BigInt(0) : getAdaBelongUtxo(payload, to);

  const tx: CardanoTransactionConfig = {
    from,
    to,
    networkKey,
    value,
    transferAll,
    cardanoTtlOffset,
    estimateCardanoFee: (fee + adaBelongToCnaUtxo).toString(),
    cardanoPayload: payload
  };

  return [tx, value];
}

function validatePayload (payload: string, params: CardanoTransactionConfigProps) {
  const txInfo = JSON.parse(csl.Transaction.from_hex(payload).to_json()) as CardanoTxJson;
  const outputs = txInfo.body.outputs;
  const cardanoId = params.tokenInfo.metadata?.cardanoId;
  const assetType = params.tokenInfo.assetType;
  const isSendSameAddress = params.from === params.to;

  if (!cardanoId) {
    throw new Error('Missing cardano id metadata');
  }

  const cardanoAssetMetadata = splitCardanoId(cardanoId);

  if (isSendSameAddress) {
    validateAllOutputsBelongToAddress(params.from, outputs);
    validateExistOutputWithAmountSend(params.value, outputs, assetType, cardanoAssetMetadata);
  } else {
    const [outputsBelongToReceiver, outputsNotBelongToReceiver] = [
      outputs.filter((output) => output.address === params.to),
      outputs.filter((output) => output.address !== params.to)
    ];

    validateReceiverOutputsWithAmountSend(params.value, outputsBelongToReceiver, assetType, cardanoAssetMetadata);
    validateAllOutputsBelongToAddress(params.from, outputsNotBelongToReceiver);
  }
}

function validateAllOutputsBelongToAddress (address: string, outputs: CardanoTxOutput[]) {
  const found = outputs.find((output) => output.address !== address);

  if (found) {
    throw new Error('Transaction has invalid address information');
  }
}

function validateExistOutputWithAmountSend (amount: string, outputs: CardanoTxOutput[], assetType: _AssetType, cardanoAssetMetadata: CardanoAssetMetadata) {
  if (assetType === _AssetType.NATIVE) {
    const found = outputs.find((output) => output.amount.coin === amount);

    if (found) {
      return;
    }

    throw new Error('Transaction has invalid transfer amount information');
  }

  if (assetType === _AssetType.CIP26) {
    const found = outputs.find((output) => amount === output.amount.multiasset[cardanoAssetMetadata.policyId]?.[cardanoAssetMetadata.nameHex]);

    if (found) {
      return;
    }

    throw new Error('Transaction has invalid transfer amount information');
  }

  throw new Error('Invalid asset type!');
}

function validateReceiverOutputsWithAmountSend (amount: string, outputs: CardanoTxOutput[], assetType: _AssetType, cardanoAssetMetadata: CardanoAssetMetadata) {
  if (outputs.length !== 1) {
    throw new Error('Transaction has invalid transfer amount information');
  }

  const receiverOutput = outputs[0];

  if (assetType === _AssetType.NATIVE) {
    if (receiverOutput.amount.coin === amount) {
      return;
    }

    throw new Error('Transaction has invalid transfer amount information');
  }

  if (assetType === _AssetType.CIP26) {
    if (receiverOutput.amount.multiasset[cardanoAssetMetadata.policyId][cardanoAssetMetadata.nameHex] === amount) {
      return;
    }

    throw new Error('Transaction has invalid transfer amount information');
  }

  throw new Error('Invalid asset type!');
}
