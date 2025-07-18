// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BitcoinProviderError } from '@subwallet/extension-base/background/errors/BitcoinProviderError';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { BitcoinProviderErrorType, BitcoinSignMessageResult, BitcoinSignPsbtResult, ConfirmationDefinitionsBitcoin, ConfirmationsQueueBitcoin, ConfirmationsQueueItemOptions, ConfirmationTypeBitcoin, ExtrinsicDataTypeMap, RequestConfirmationCompleteBitcoin } from '@subwallet/extension-base/background/KoniTypes';
import { ConfirmationRequestBase, Resolver } from '@subwallet/extension-base/background/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import RequestService from '@subwallet/extension-base/services/request-service';
import TransactionService from '@subwallet/extension-base/services/transaction-service';
import { TransactionEventResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { BasicTxErrorType } from '@subwallet/extension-base/types';
import { createPromiseHandler } from '@subwallet/extension-base/utils';
import { isInternalRequest } from '@subwallet/extension-base/utils/request';
import keyring from '@subwallet/ui-keyring';
import { Psbt } from 'bitcoinjs-lib';
import * as bitcoin from 'bitcoinjs-lib';
import { t } from 'i18next';
import { BehaviorSubject } from 'rxjs';

import { isArray, logger as createLogger } from '@polkadot/util';
import { Logger } from '@polkadot/util/types';

export default class BitcoinRequestHandler {
  readonly #requestService: RequestService;
  readonly #chainService: ChainService;
  readonly #transactionService: TransactionService;
  readonly #logger: Logger;
  private readonly confirmationsQueueSubjectBitcoin = new BehaviorSubject<ConfirmationsQueueBitcoin>({
    bitcoinSignatureRequest: {},
    bitcoinSendTransactionRequest: {},
    bitcoinWatchTransactionRequest: {},
    bitcoinSendTransactionRequestAfterConfirmation: {},
    bitcoinSignPsbtRequest: {}
  });

  private readonly confirmationsPromiseMap: Record<string, { resolver: Resolver<any>, validator?: (rs: any) => Error | undefined }> = {};

  constructor (requestService: RequestService, chainService: ChainService, transactionService: TransactionService) {
    this.#requestService = requestService;
    this.#chainService = chainService;
    this.#transactionService = transactionService;
    this.#logger = createLogger('BitcoinRequestHandler');
  }

  public get numBitcoinRequests (): number {
    let count = 0;

    Object.values(this.confirmationsQueueSubjectBitcoin.getValue()).forEach((x) => {
      count += Object.keys(x).length;
    });

    return count;
  }

  public getConfirmationsQueueSubjectBitcoin (): BehaviorSubject<ConfirmationsQueueBitcoin> {
    return this.confirmationsQueueSubjectBitcoin;
  }

  public async addConfirmationBitcoin<CT extends ConfirmationTypeBitcoin> (
    id: string,
    url: string,
    type: CT,
    payload: ConfirmationDefinitionsBitcoin[CT][0]['payload'],
    options: ConfirmationsQueueItemOptions = {},
    validator?: (input: ConfirmationDefinitionsBitcoin[CT][1]) => Error | undefined
  ): Promise<ConfirmationDefinitionsBitcoin[CT][1]> {
    const confirmations = this.confirmationsQueueSubjectBitcoin.getValue();
    const confirmationType = confirmations[type] as Record<string, ConfirmationDefinitionsBitcoin[CT][0]>;
    const payloadJson = JSON.stringify(payload);
    const isInternal = isInternalRequest(url);

    if (['bitcoinSignatureRequest', 'bitcoinSendTransactionRequest', 'bitcoinSendTransactionRequestAfterConfirmation', 'bitcoinSignPsbtRequest'].includes(type)) {
      const isAlwaysRequired = await this.#requestService.settingService.isAlwaysRequired;

      if (isAlwaysRequired) {
        this.#requestService.keyringService.lock();
      }
    }

    // Check duplicate request
    const duplicated = Object.values(confirmationType).find((c) => (c.url === url) && (c.payloadJson === payloadJson));

    if (duplicated) {
      throw new Error('Duplicate request');
    }

    confirmationType[id] = {
      id,
      url,
      isInternal,
      payload,
      payloadJson,
      ...options
    } as ConfirmationDefinitionsBitcoin[CT][0];

    const promise = new Promise<ConfirmationDefinitionsBitcoin[CT][1]>((resolve, reject) => {
      this.confirmationsPromiseMap[id] = {
        validator: validator,
        resolver: {
          resolve: resolve,
          reject: reject
        }
      };
    });

    this.confirmationsQueueSubjectBitcoin.next(confirmations);

    if (!isInternal) {
      this.#requestService.popupOpen();
    }

    this.#requestService.updateIconV2();

    return promise;
  }

  public updateConfirmationBitcoin<CT extends ConfirmationTypeBitcoin> (
    id: string,
    type: CT,
    payload: ConfirmationDefinitionsBitcoin[CT][0]['payload'],
    options: ConfirmationsQueueItemOptions = {},
    validator?: (input: ConfirmationDefinitionsBitcoin[CT][1]) => Error | undefined
  ) {
    const confirmations = this.confirmationsQueueSubjectBitcoin.getValue();
    const confirmationType = confirmations[type] as Record<string, ConfirmationDefinitionsBitcoin[CT][0]>;

    // Check duplicate request
    const exists = confirmationType[id];

    if (!exists) {
      throw new Error('Request does not exist');
    }

    const payloadJson = JSON.stringify(payload);

    confirmationType[id] = {
      ...exists,
      payload,
      payloadJson,
      ...options
    } as ConfirmationDefinitionsBitcoin[CT][0];

    if (validator) {
      this.confirmationsPromiseMap[id].validator = validator;
    }

    this.confirmationsQueueSubjectBitcoin.next(confirmations);
  }

  signMessageBitcoin (confirmation: ConfirmationDefinitionsBitcoin['bitcoinSignatureRequest'][0]): BitcoinSignMessageResult {
    const { address, payload } = confirmation.payload;
    const pair = keyring.getPair(address);

    if (pair.isLocked) {
      keyring.unlockPair(pair.address);
    }

    // Check if payload is a string
    if (typeof payload === 'string') {
      // Assume BitcoinSigner is an instance that implements the BitcoinSigner interface
      return {
        signature: pair.bitcoin.signMessage(payload),
        message: payload,
        address
      }; // Assuming compressed = false
    } else if (payload instanceof Uint8Array) { // Check if payload is a byte array (Uint8Array)
      // Convert Uint8Array to string
      const payloadString = Buffer.from(payload).toString('hex');

      // Assume BitcoinSigner is an instance that implements the BitcoinSigner interface
      return {
        signature: pair.bitcoin.signMessage(payloadString),
        message: payload.toString(),
        address
      }; // Assuming compressed = false
    } else {
      // Handle the case where payload is invalid
      throw new Error('Invalid payload type');
    }
  }

  private signTransactionBitcoin (request: ConfirmationDefinitionsBitcoin['bitcoinSendTransactionRequest'][0]): string {
    // Extract necessary information from the BitcoinSendTransactionRequest
    const { address, hashPayload } = request.payload;
    const pair = keyring.getPair(address);

    // Unlock the pair if it is locked
    if (pair.isLocked) {
      keyring.unlockPair(pair.address);
    }

    const psbt = Psbt.fromHex(hashPayload);

    // Finalize all inputs in the Psbt
    // Sign the Psbt using the pair's bitcoin object
    const signedTransaction = pair.bitcoin.signTransaction(psbt, psbt.txInputs.map((v, i) => i));

    signedTransaction.finalizeAllInputs();

    return signedTransaction.extractTransaction().toHex();
  }

  private async signTransactionBitcoinWithPayload (request: ConfirmationDefinitionsBitcoin['bitcoinSendTransactionRequestAfterConfirmation'][0]): Promise<string> {
    const transaction = this.#transactionService.getTransaction(request.id);
    const { chain, emitterTransaction, id } = transaction;
    const { from } = transaction.data as ExtrinsicDataTypeMap['transfer.balance'];
    const { promise, reject, resolve } = createPromiseHandler<string>();

    if (!emitterTransaction) {
      throw new BitcoinProviderError(BitcoinProviderErrorType.INTERNAL_ERROR);
    }

    const eventData: TransactionEventResponse = {
      id,
      errors: [],
      warnings: [],
      extrinsicHash: id
    };

    emitterTransaction.on('extrinsicHash', (data) => {
      if (!data.extrinsicHash) {
        reject(BitcoinProviderErrorType.INTERNAL_ERROR);
      } else {
        resolve(data.extrinsicHash);
      }
    });

    emitterTransaction.on('error', (error) => {
      reject(error);
    });

    try {
      const chainInfo = this.#chainService.getChainInfoByKey(chain);
      const psbt = transaction.transaction as Psbt;
      const pair = keyring.getPair(from);

      // Unlock the pair if it is locked
      if (pair.isLocked) {
        keyring.unlockPair(pair.address);
      }

      // Finalize all inputs in the Psbt
      // Sign the Psbt using the pair's bitcoin object
      const signedTransaction = pair.bitcoin.signTransaction(psbt, psbt.txInputs.map((v, i) => i));

      signedTransaction.finalizeAllInputs();

      const signature = signedTransaction.extractTransaction().toHex();

      this.#transactionService.emitterEventTransaction(emitterTransaction, eventData, chainInfo.slug, signature);
    } catch (e) {
      emitterTransaction.emit('error', { ...eventData, errors: [new TransactionError(BasicTxErrorType.INTERNAL_ERROR, (e as Error).message)] });
    }

    return promise;
  }

  private async signPsbt (request: ConfirmationDefinitionsBitcoin['bitcoinSignPsbtRequest'][0]): Promise<BitcoinSignPsbtResult> {
    // Extract necessary information from the BitcoinSendTransactionRequest
    const { address, payload } = request.payload;
    const { allowedSighash, autoFinalized = true, broadcast, network, psbt: psbtHex, signAtIndex } = payload;
    const transaction = this.#transactionService.getTransaction(request.id);
    const bitcoinNetwork = network === 'bitcoinTestnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    const psbt = bitcoin.Psbt.fromHex(psbtHex, { network: bitcoinNetwork });
    let eventData: TransactionEventResponse = {
      id: request.id,
      errors: [],
      warnings: [],
      extrinsicHash: request.id
    };

    const pair = keyring.getPair(address);

    // Unlock the pair if it is locked
    if (pair.isLocked) {
      keyring.unlockPair(pair.address);
    }

    const signAtIndexGenerate = signAtIndex ? (isArray(signAtIndex) ? signAtIndex : [signAtIndex]) : [...(Array(psbt.inputCount) as number[])].map((_, i) => i);
    let psptSignedTransaction: Psbt | null = null;

    // Sign the Psbt using the pair's bitcoin object
    try {
      psptSignedTransaction = pair.bitcoin.signTransaction(psbt, signAtIndexGenerate, allowedSighash);
    } catch (e) {
      if (transaction) {
        transaction.emitterTransaction?.emit('error', { ...eventData, errors: [new TransactionError(BasicTxErrorType.INVALID_PARAMS, (e as Error).message)], id: transaction.id, extrinsicHash: transaction.id });
      }

      throw new Error((e as Error).message);
    }

    if (!psptSignedTransaction) {
      throw new Error('Unable to sign');
    }

    if (!broadcast) {
      if (autoFinalized) {
        for (const index of signAtIndexGenerate) {
          psptSignedTransaction.finalizeInput(index);
        }
      }

      return {
        psbt: psptSignedTransaction.toHex()
      };
    }

    if (!transaction) {
      throw new BitcoinProviderError(BitcoinProviderErrorType.INTERNAL_ERROR);
    }

    const { chain, emitterTransaction, id } = transaction;

    eventData = {
      id,
      errors: [],
      warnings: [],
      extrinsicHash: id
    };

    if (!emitterTransaction) {
      throw new BitcoinProviderError(BitcoinProviderErrorType.INTERNAL_ERROR);
    }

    const chainInfo = this.#chainService.getChainInfoByKey(chain);

    try {
      if (!autoFinalized) {
        throw new Error('Unable to send transaction without autoFinalized');
      }

      psptSignedTransaction.finalizeAllInputs();
    } catch (e) {
      emitterTransaction.emit('error', { ...eventData, errors: [new TransactionError(BasicTxErrorType.INVALID_PARAMS, (e as Error).message)] });
      throw new Error((e as Error).message);
    }

    const hexTransaction = psptSignedTransaction.extractTransaction().toHex();

    this.#transactionService.emitterEventTransaction(emitterTransaction, eventData, chainInfo.slug, hexTransaction);
    const { promise, reject, resolve } = createPromiseHandler<BitcoinSignPsbtResult>();

    emitterTransaction.on('extrinsicHash', (data) => {
      if (!data.extrinsicHash || !psptSignedTransaction) {
        reject(BitcoinProviderErrorType.INTERNAL_ERROR);
      } else {
        resolve({
          psbt: psptSignedTransaction?.toHex(),
          txid: data.extrinsicHash
        });
      }
    });

    emitterTransaction.on('error', (error) => {
      reject(error);
    });

    return promise;
  }

  private async decorateResultBitcoin<T extends ConfirmationTypeBitcoin> (t: T, request: ConfirmationDefinitionsBitcoin[T][0], result: ConfirmationDefinitionsBitcoin[T][1]) {
    if (t === 'bitcoinSignatureRequest') {
      result.payload = this.signMessageBitcoin(request as ConfirmationDefinitionsBitcoin['bitcoinSignatureRequest'][0]);
    } else if (t === 'bitcoinSendTransactionRequest') {
      result.payload = this.signTransactionBitcoin(request as ConfirmationDefinitionsBitcoin['bitcoinSendTransactionRequest'][0]);
    } else if (t === 'bitcoinSignPsbtRequest') {
      result.payload = await this.signPsbt(request as ConfirmationDefinitionsBitcoin['bitcoinSignPsbtRequest'][0]);
    } else if (t === 'bitcoinSendTransactionRequestAfterConfirmation') {
      result.payload = await this.signTransactionBitcoinWithPayload(request as ConfirmationDefinitionsBitcoin['bitcoinSendTransactionRequestAfterConfirmation'][0]);
    }

    if (t === 'bitcoinSignatureRequest' || t === 'bitcoinSendTransactionRequest' || t === 'bitcoinSignPsbtRequest' || t === 'bitcoinSendTransactionRequestAfterConfirmation') {
      const isAlwaysRequired = await this.#requestService.settingService.isAlwaysRequired;

      if (isAlwaysRequired) {
        this.#requestService.keyringService.lock();
      }
    }
  }

  public async completeConfirmationBitcoin (request: RequestConfirmationCompleteBitcoin): Promise<boolean> {
    const confirmations = this.confirmationsQueueSubjectBitcoin.getValue();

    for (const ct in request) {
      const type = ct as ConfirmationTypeBitcoin;
      const result = request[type] as ConfirmationDefinitionsBitcoin[typeof type][1];

      const { id, isApproved } = result;
      const { resolver, validator } = this.confirmationsPromiseMap[id];
      const confirmation = confirmations[type][id];

      if (!resolver || !confirmation) {
        this.#logger.error(t('Unable to proceed. Please try again'), type, id);
        throw new Error('Unable to proceed. Please try again');
      }

      if (isApproved) {
        try {
          // Fill signature for some special type
          await this.decorateResultBitcoin(type, confirmation, result);
          const error = validator && validator(result);

          if (error) {
            resolver.reject(error);
          }
        } catch (e) {
          resolver.reject(e as Error);
        }
      }

      // Delete confirmations from queue
      delete this.confirmationsPromiseMap[id];
      delete confirmations[type][id];
      this.confirmationsQueueSubjectBitcoin.next(confirmations);

      // Update icon, and close queue
      this.#requestService.updateIconV2(this.#requestService.numAllRequests === 0);
      resolver.resolve(result);
    }

    return true;
  }

  public resetWallet () {
    const confirmations = this.confirmationsQueueSubjectBitcoin.getValue();

    for (const [type, requests] of Object.entries(confirmations)) {
      for (const confirmation of Object.values(requests)) {
        const { id } = confirmation as ConfirmationRequestBase;
        const { resolver } = this.confirmationsPromiseMap[id];

        if (!resolver || !confirmation) {
          console.error('Not found confirmation', type, id);
        } else {
          resolver.reject(new Error('Reset wallet'));
        }

        delete this.confirmationsPromiseMap[id];
        delete confirmations[type as ConfirmationTypeBitcoin][id];
      }
    }

    this.confirmationsQueueSubjectBitcoin.next(confirmations);
  }
}
