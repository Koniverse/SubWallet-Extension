// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EvmProviderError } from '@subwallet/extension-base/background/errors/EvmProviderError';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { AmountData, BitcoinSignatureRequest, ChainType, EvmProviderErrorType, EvmSendTransactionRequest, EvmSignatureRequest, ExtrinsicStatus, ExtrinsicType, NotificationType, TransactionAdditionalInfo, TransactionDirection, TransactionHistoryItem } from '@subwallet/extension-base/background/KoniTypes';
import { _SUPPORT_TOKEN_PAY_FEE_GROUP, ALL_ACCOUNT_KEY, fetchBlockedConfigObjects, fetchLatestBlockedActionsAndFeatures, getPassConfigId } from '@subwallet/extension-base/constants';
import { checkBalanceWithTransactionFee, checkSigningAccountForTransaction, checkSupportForAction, checkSupportForFeature, checkSupportForTransaction, estimateFeeForTransaction } from '@subwallet/extension-base/core/logic-validation/transfer';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { cellToBase64Str, externalMessage, getTransferCellPromise } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/ton/utils';
import { CardanoTransactionConfig } from '@subwallet/extension-base/services/balance-service/transfer/cardano-transfer';
import { TonTransactionConfig } from '@subwallet/extension-base/services/balance-service/transfer/ton-transfer';
import { _getAssetDecimals, _getAssetSymbol, _getChainNativeTokenBasicInfo, _getEvmChainId, _isChainEvmCompatible, _isNativeTokenBySlug } from '@subwallet/extension-base/services/chain-service/utils';
import { ClaimAvailBridgeNotificationMetadata } from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import { EXTENSION_REQUEST_URL } from '@subwallet/extension-base/services/request-service/constants';
import { TRANSACTION_TIMEOUT } from '@subwallet/extension-base/services/transaction-service/constants';
import { parseLiquidStakingEvents, parseLiquidStakingFastUnstakeEvents, parseTransferEventLogs, parseXcmEventLogs } from '@subwallet/extension-base/services/transaction-service/event-parser';
import { getBaseTransactionInfo, getTransactionId, isBitcoinTransaction, isCardanoTransaction, isSubstrateTransaction, isTonTransaction } from '@subwallet/extension-base/services/transaction-service/helpers';
import { OptionalSWTransaction, SWDutchTransaction, SWDutchTransactionInput, SWPermitTransaction, SWPermitTransactionInput, SWTransaction, SWTransactionBase, SWTransactionInput, SWTransactionResponse, TransactionEmitter, TransactionEventMap, TransactionEventResponse, ValidateTransactionResponseInput } from '@subwallet/extension-base/services/transaction-service/types';
import { getExplorerLink, parseTransactionData } from '@subwallet/extension-base/services/transaction-service/utils';
import { isWalletConnectRequest } from '@subwallet/extension-base/services/wallet-connect-service/helpers';
import { AccountJson, BaseStepType, BasicTxErrorType, BasicTxWarningCode, BriefProcessStep, LeavePoolAdditionalData, PermitSwapData, ProcessStep, ProcessTransactionData, RequestStakePoolingBonding, RequestYieldStepSubmit, SpecialYieldPoolInfo, StepStatus, SubmitBittensorChangeValidatorStaking, SubmitJoinNominationPool, SubstrateTipInfo, TransactionErrorType, Web3Transaction, YieldPoolType } from '@subwallet/extension-base/types';
import { anyNumberToBN, pairToAccount, reformatAddress } from '@subwallet/extension-base/utils';
import { mergeTransactionAndSignature } from '@subwallet/extension-base/utils/eth/mergeTransactionAndSignature';
import { isContractAddress, parseContractInput } from '@subwallet/extension-base/utils/eth/parseTransaction';
import { getId } from '@subwallet/extension-base/utils/getId';
import { BN_ZERO } from '@subwallet/extension-base/utils/number';
import keyring from '@subwallet/ui-keyring';
import { Cell } from '@ton/core';
import BigN from 'bignumber.js';
import { Psbt } from 'bitcoinjs-lib';
import { addHexPrefix } from 'ethereumjs-util';
import { ethers, TransactionLike } from 'ethers';
import EventEmitter from 'eventemitter3';
import { t } from 'i18next';
import { BehaviorSubject, interval as rxjsInterval, map as rxjsMap, Subscription } from 'rxjs';
import { TransactionConfig, TransactionReceipt } from 'web3-core';

import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { Signer, SignerOptions, SignerResult } from '@polkadot/api/types';
import { EventRecord } from '@polkadot/types/interfaces';
import { SignerPayloadJSON } from '@polkadot/types/types/extrinsic';
import { hexToU8a, isHex } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';

export default class TransactionService {
  private readonly state: KoniState;

  private readonly watchTransactionSubscribes: Record<string, Promise<void>> = {};

  private aliveProcessMap: Map<string, ProcessTransactionData> = new Map();

  private readonly transactionSubject: BehaviorSubject<Record<string, SWTransactionBase>> = new BehaviorSubject<Record<string, SWTransactionBase>>({});
  private readonly aliveProcessSubject: BehaviorSubject<Map<string, ProcessTransactionData>> = new BehaviorSubject<Map<string, ProcessTransactionData>>(this.aliveProcessMap);

  private cacheProcessInfo: Record<string, Record<string, string>> = {};

  private get transactions (): Record<string, SWTransactionBase> {
    return this.transactionSubject.getValue();
  }

  constructor (state: KoniState) {
    this.state = state;
  }

  private get allTransactions (): SWTransactionBase[] {
    return Object.values(this.transactions);
  }

  private get processingTransactions (): SWTransactionBase[] {
    return this.allTransactions.filter((t) => t.status === ExtrinsicStatus.QUEUED || t.status === ExtrinsicStatus.SUBMITTING);
  }

  public getTransaction (id: string) {
    return this.transactions[id];
  }

  private checkDuplicate (transaction: ValidateTransactionResponseInput): TransactionError[] {
    // Check duplicated transaction
    const existed = this.processingTransactions
      .filter((item) => item.address === transaction.address && item.chain === transaction.chain);

    if (existed.length > 0) {
      return [new TransactionError(BasicTxErrorType.DUPLICATE_TRANSACTION)];
    }

    return [];
  }

  public async validateTransaction (transactionInput: SWTransactionInput): Promise<SWTransactionResponse> {
    const validationResponse: SWTransactionResponse = {
      ...transactionInput,
      status: undefined,
      errors: transactionInput.errors || [],
      warnings: transactionInput.warnings || [],
      processId: transactionInput.step?.processId
    };
    const { additionalValidator, address, chain, chainType, extrinsicType } = validationResponse;
    const chainInfo = this.state.chainService.getChainInfoByKey(chain);

    const blockedConfigObjects = await fetchBlockedConfigObjects();
    const currentConfig = this.state.settingService.getEnvironmentSetting();

    const passBlockedConfigId = getPassConfigId(currentConfig, blockedConfigObjects);

    const blockedActionsFeaturesMaps = await fetchLatestBlockedActionsAndFeatures(passBlockedConfigId);

    for (const blockedActionsFeaturesMap of blockedActionsFeaturesMaps) {
      const { blockedActionsMap, blockedFeaturesList } = blockedActionsFeaturesMap;

      checkSupportForFeature(validationResponse, blockedFeaturesList, chainInfo);

      checkSupportForAction(validationResponse, blockedActionsMap);
    }

    const transaction = transactionInput.transaction as OptionalSWTransaction;

    // Check duplicated transaction
    validationResponse.errors.push(...this.checkDuplicate(transactionInput));

    // Check support for transaction
    checkSupportForTransaction(validationResponse, transaction);

    if (!chainInfo) {
      validationResponse.errors.push(new TransactionError(BasicTxErrorType.INTERNAL_ERROR, t('bg.TRANSACTION_SERVICE.services.service.transaction.cannotFindNetwork')));
    }

    const substrateApi = this.state.chainService.getSubstrateApi(chainInfo.slug);
    const evmApi = this.state.chainService.getEvmApi(chainInfo.slug);
    const tonApi = this.state.chainService.getTonApi(chainInfo.slug);
    const cardanoApi = this.state.chainService.getCardanoApi(chainInfo.slug);
    const bitcoinApi = this.state.chainService.getBitcoinApi(chainInfo.slug);
    // todo: should split into isEvmTx && isNoEvmApi. Because other chains type also has no Evm Api. Same to all blockchain.
    // todo: refactor check evmTransaction.
    const isNoEvmApi = transaction && !isSubstrateTransaction(transaction) && !isTonTransaction(transaction) && !isCardanoTransaction(transaction) && !isBitcoinTransaction(transaction) && !evmApi;
    const isNoTonApi = transaction && isTonTransaction(transaction) && !tonApi;
    const isNoCardanoApi = transaction && isCardanoTransaction(transaction) && !cardanoApi;
    const isNoBitcoinApi = transaction && isBitcoinTransaction(transaction) && !bitcoinApi;

    if (isNoEvmApi || isNoTonApi || isNoCardanoApi || isNoBitcoinApi) {
      validationResponse.errors.push(new TransactionError(BasicTxErrorType.CHAIN_DISCONNECTED, undefined));
    }

    // Estimate fee for transaction
    const id = getId();
    const feeInfo = await this.state.feeService.subscribeChainFee(id, chain, chainType);
    const nativeTokenInfo = this.state.chainService.getNativeTokenInfo(chain);
    const tokenPayFeeSlug = transactionInput.tokenPayFeeSlug;
    const isNonNativeTokenPayFee = tokenPayFeeSlug && !_isNativeTokenBySlug(tokenPayFeeSlug);
    const nonNativeTokenPayFeeInfo = isNonNativeTokenPayFee ? this.state.chainService.getAssetBySlug(tokenPayFeeSlug) : undefined;
    const priceMap = (await this.state.priceService.getPrice()).priceMap;

    if (!transactionInput.skipFeeRecalculation) {
      validationResponse.estimateFee = await estimateFeeForTransaction(validationResponse, transaction, chainInfo, evmApi, substrateApi, priceMap, feeInfo, nativeTokenInfo, nonNativeTokenPayFeeInfo, transactionInput.isTransferLocalTokenAndPayThatTokenAsFee);
    }

    const chainInfoMap = this.state.chainService.getChainInfoMap();

    // Check account signing transaction

    checkSigningAccountForTransaction(validationResponse, chainInfoMap);

    const nativeTokenAvailable = await this.state.balanceService.getTransferableBalance(address, chain, nativeTokenInfo.slug, extrinsicType);

    // Check available balance against transaction fee
    checkBalanceWithTransactionFee(validationResponse, transactionInput, nativeTokenInfo, nativeTokenAvailable);

    // Warnings Ton address if bounceable and not active
    // if (transaction && isTonTransaction(transaction) && tonApi) {
    //   await checkTonAddressBounceableAndAccountNotActive(tonApi, validationResponse);
    // }

    // Check additional validations
    additionalValidator && await additionalValidator(validationResponse);

    return validationResponse;
  }

  public getTransactionSubject () {
    return this.transactionSubject;
  }

  public get observables () {
    const transactionSubject = this.transactionSubject;
    const aliveProcessSubject = this.aliveProcessSubject;

    return {
      get transaction () {
        return transactionSubject.asObservable();
      },
      get aliveProcess () {
        return aliveProcessSubject.asObservable().pipe(
          rxjsMap((aliveProcessMap): Record<string, ProcessTransactionData> => {
            const aliveProcessRecord: Record<string, ProcessTransactionData> = {};

            aliveProcessMap.forEach((value, key) => {
              aliveProcessRecord[key] = value;
            });

            return aliveProcessRecord;
          })
        );
      }
    };
  }

  public get values () {
    const transactionSubject = this.transactionSubject;
    const aliveProcessSubject = this.aliveProcessSubject;

    return {
      get transaction () {
        return transactionSubject.value;
      },
      get aliveProcess (): Record<string, ProcessTransactionData> {
        const aliveProcessMap = aliveProcessSubject.value;

        const aliveProcessRecord: Record<string, ProcessTransactionData> = {};

        aliveProcessMap.forEach((value, key) => {
          aliveProcessRecord[key] = value;
        });

        return aliveProcessRecord;
      }
    };
  }

  public getCacheInfo (processId: string, step: BaseStepType): string {
    return this.cacheProcessInfo[processId]?.[step] || '';
  }

  private updateAliveProcess () {
    this.aliveProcessSubject.next(this.aliveProcessMap);
  }

  private fillTransactionDefaultInfo (transaction: SWTransactionInput): SWTransaction {
    const isInternal = !transaction.url;
    const transactionId = transaction.id || getTransactionId(transaction.chainType, transaction.chain, isInternal, isWalletConnectRequest(transaction.id));

    return {
      ...transaction,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      errors: transaction.errors || [],
      warnings: transaction.warnings || [],
      url: transaction.url || EXTENSION_REQUEST_URL,
      status: ExtrinsicStatus.QUEUED,
      isInternal,
      id: transactionId,
      extrinsicHash: transactionId
    } as SWTransaction;
  }

  private fillDutchTransactionDefaultInfo (transaction: SWDutchTransactionInput): SWDutchTransaction {
    const isInternal = !transaction.url;
    const transactionId = getTransactionId(transaction.chainType, transaction.chain, isInternal, isWalletConnectRequest(transaction.id));

    return {
      ...transaction,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      errors: transaction.errors || [],
      warnings: transaction.warnings || [],
      url: transaction.url || EXTENSION_REQUEST_URL,
      status: ExtrinsicStatus.QUEUED,
      isInternal,
      id: transactionId,
      extrinsicHash: transactionId
    } as SWDutchTransaction;
  }

  public async addTransaction (inputTransaction: SWTransactionInput): Promise<TransactionEmitter> {
    const transactions = this.transactions;
    // Fill transaction default info
    const transaction = this.fillTransactionDefaultInfo(inputTransaction);

    // Add Transaction
    transactions[transaction.id] = transaction;
    this.transactionSubject.next({ ...transactions });

    return await this.sendTransaction(transaction);
  }

  public addDutchTransaction (inputTransaction: SWDutchTransactionInput): TransactionEmitter {
    const transactions = this.transactions;
    const transaction = this.fillDutchTransactionDefaultInfo(inputTransaction);

    transactions[transaction.id] = transaction;
    this.transactionSubject.next({ ...transactions });

    return this.sendDutchTransaction(transaction);
  }

  public generateBeforeHandleResponseErrors (errors: TransactionError[]): SWTransactionResponse {
    return {
      errors,
      additionalValidator: undefined,
      address: '',
      chain: '',
      chainType: ChainType.SUBSTRATE,
      data: undefined,
      extrinsicType: ExtrinsicType.UNKNOWN,
      transferNativeAmount: undefined,
      url: undefined,
      warnings: []
    };
  }

  public async handleTransaction (transaction: SWTransactionInput): Promise<SWTransactionResponse> {
    const validatedTransaction = await this.validateTransaction(transaction);
    const ignoreWarnings: BasicTxWarningCode[] = validatedTransaction.ignoreWarnings || [];
    const stopByErrors = validatedTransaction.errors.length > 0;
    const stopByWarnings = validatedTransaction.warnings.length > 0 && validatedTransaction.warnings.some((warning) => !ignoreWarnings.includes(warning.warningType));

    if (stopByErrors || stopByWarnings) {
      // @ts-ignore
      'transaction' in validatedTransaction && delete validatedTransaction.transaction;
      'additionalValidator' in validatedTransaction && delete validatedTransaction.additionalValidator;
      'eventsHandler' in validatedTransaction && delete validatedTransaction.eventsHandler;

      return validatedTransaction;
    }

    validatedTransaction.warnings = [];

    const emitter = await this.addTransaction(validatedTransaction);

    await new Promise<void>((resolve, reject) => {
      // TODO
      if (transaction.resolveOnDone) {
        emitter.on('success', (data: TransactionEventResponse) => {
          validatedTransaction.id = data.id;
          validatedTransaction.extrinsicHash = data.extrinsicHash;
          resolve();
        });
      } else {
        emitter.on('signed', (data: TransactionEventResponse) => {
          validatedTransaction.id = data.id;
          validatedTransaction.extrinsicHash = data.extrinsicHash;
          resolve();
        });
      }

      emitter.on('error', (data: TransactionEventResponse) => {
        if (data.errors.length > 0) {
          validatedTransaction.errors.push(...data.errors);
          resolve();
        }
      });

      emitter.on('timeout', (data: TransactionEventResponse) => {
        if (transaction.errorOnTimeOut && data.errors.length > 0) {
          validatedTransaction.errors.push(...data.errors);
          resolve();
        }
      });
    });

    // @ts-ignore
    'transaction' in validatedTransaction && delete validatedTransaction.transaction;
    'additionalValidator' in validatedTransaction && delete validatedTransaction.additionalValidator;
    'eventsHandler' in validatedTransaction && delete validatedTransaction.eventsHandler;

    return validatedTransaction;
  }

  public async handleTransactionAfterConfirmation (transaction: SWTransactionInput): Promise<SWTransactionResponse> {
    const validatedTransaction = await this.validateTransaction(transaction);

    const stopByErrors = validatedTransaction.errors.length > 0;
    const stopByWarnings = validatedTransaction.warnings.length > 0 && !validatedTransaction.ignoreWarnings;

    if (stopByErrors || stopByWarnings) {
      // @ts-ignore
      'transaction' in validatedTransaction && delete validatedTransaction.transaction;
      'additionalValidator' in validatedTransaction && delete validatedTransaction.additionalValidator;
      'eventsHandler' in validatedTransaction && delete validatedTransaction.eventsHandler;

      return validatedTransaction;
    }

    validatedTransaction.warnings = [];

    const transactionsSubject = this.transactions;
    const emitter = new EventEmitter<TransactionEventMap>();

    // Fill transaction default info
    const transactionUpdated = this.fillTransactionDefaultInfo(validatedTransaction);

    // Add Transaction
    transactionsSubject[transactionUpdated.id] = { ...transactionUpdated, emitterTransaction: emitter };
    this.transactionSubject.next({ ...transactionsSubject });

    emitter.on('success', (data: TransactionEventResponse) => {
      validatedTransaction.id = data.id;
      validatedTransaction.extrinsicHash = data.extrinsicHash;
      this.handlePostProcessing(data.id);
      this.onSuccess(data);
    });

    emitter.on('signed', (data: TransactionEventResponse) => {
      validatedTransaction.id = data.id;
      validatedTransaction.extrinsicHash = data.extrinsicHash;
      this.onSigned(data);
    });

    emitter.on('error', (data: TransactionEventResponse) => {
      if (data.errors.length > 0) {
        validatedTransaction.errors.push(...data.errors);
      }

      this.onFailed({ ...data, errors: [...data.errors, new TransactionError(BasicTxErrorType.INTERNAL_ERROR)] });
    });

    emitter.on('send', (data: TransactionEventResponse) => {
      this.onSend(data);
    });

    emitter.on('extrinsicHash', (data: TransactionEventResponse) => {
      this.onHasTransactionHash(data);
    });

    emitter.on('timeout', (data: TransactionEventResponse) => {
      this.onTimeOut({ ...data, errors: [...data.errors, new TransactionError(BasicTxErrorType.TIMEOUT)] });
    });

    // @ts-ignore
    'transaction' in validatedTransaction && delete validatedTransaction.transaction;
    'additionalValidator' in validatedTransaction && delete validatedTransaction.additionalValidator;
    'eventsHandler' in validatedTransaction && delete validatedTransaction.eventsHandler;

    return { ...validatedTransaction };
  }

  // Output signature => Store as extrinsicHash and use in later steps.
  public async handlePermitTransaction (transaction: SWPermitTransactionInput): Promise<SWTransactionResponse> {
    const transactionId = getTransactionId(transaction.chainType, transaction.chain, true);
    const validatedTransaction: SWTransactionResponse = {
      ...transaction,
      id: transactionId,
      extrinsicHash: '',
      status: undefined,
      errors: transaction.errors || [],
      warnings: transaction.warnings || [],
      processId: transaction.step?.processId
    };

    const txInput: SWPermitTransaction = {
      ...transaction,
      isInternal: true,
      status: ExtrinsicStatus.QUEUED,
      id: transactionId,
      extrinsicHash: transactionId,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime()
    } as SWPermitTransaction;

    const _data = transaction.data as PermitSwapData;
    const emitter = this.sendPermitTransaction(txInput);

    await new Promise<void>((resolve, reject) => {
      emitter.on('success', (data: TransactionEventResponse) => {
        validatedTransaction.id = data.id;
        validatedTransaction.extrinsicHash = data.extrinsicHash;

        this.cacheProcessInfo[_data.processId] = {
          [_data.step]: data.extrinsicHash as string
        };

        resolve();
      });

      emitter.on('error', (data: TransactionEventResponse) => {
        if (data.errors.length > 0) {
          validatedTransaction.errors.push(...data.errors);
          resolve();
        }
      });

      emitter.on('timeout', (data: TransactionEventResponse) => {
        if (transaction.errorOnTimeOut && data.errors.length > 0) {
          validatedTransaction.errors.push(...data.errors);
          resolve();
        }
      });
    });

    // @ts-ignore
    'transaction' in validatedTransaction && delete validatedTransaction.transaction;
    'additionalValidator' in validatedTransaction && delete validatedTransaction.additionalValidator;
    'eventsHandler' in validatedTransaction && delete validatedTransaction.eventsHandler;

    return validatedTransaction;
  }

  // For swaps with very large transaction volumes. Use API to create centralized transactions.
  public async handleDutchTransaction (transaction: SWDutchTransactionInput): Promise<SWTransactionResponse> {
    const transactionId = getTransactionId(transaction.chainType, transaction.chain, true);
    const validatedTransaction: SWTransactionResponse = {
      ...transaction,
      id: transactionId,
      extrinsicHash: '',
      status: undefined,
      errors: transaction.errors || [],
      warnings: transaction.warnings || [],
      processId: transaction.step?.processId
    };

    const txInput: SWDutchTransaction = {
      ...transaction,
      isInternal: true,
      status: ExtrinsicStatus.QUEUED,
      id: transactionId,
      extrinsicHash: transactionId,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime()
    } as SWDutchTransaction;

    const emitter = this.addDutchTransaction(txInput);

    await new Promise<void>((resolve) => {
      if (transaction.resolveOnDone) {
        emitter.on('success', (data: TransactionEventResponse) => {
          validatedTransaction.id = data.id;
          validatedTransaction.extrinsicHash = data.extrinsicHash;

          resolve();
        });
      } else {
        emitter.on('signed', (data: TransactionEventResponse) => {
          validatedTransaction.id = data.id;
          validatedTransaction.extrinsicHash = data.extrinsicHash;
          resolve();
        });
      }

      emitter.on('error', (data: TransactionEventResponse) => {
        if (data.errors.length > 0) {
          validatedTransaction.errors.push(...data.errors);
          resolve();
        }
      });

      emitter.on('timeout', (data: TransactionEventResponse) => {
        if (transaction.errorOnTimeOut && data.errors.length > 0) {
          validatedTransaction.errors.push(...data.errors);
          resolve();
        }
      });
    });

    // @ts-ignore
    'transaction' in validatedTransaction && delete validatedTransaction.transaction;
    'additionalValidator' in validatedTransaction && delete validatedTransaction.additionalValidator;
    'eventsHandler' in validatedTransaction && delete validatedTransaction.eventsHandler;

    return validatedTransaction;
  }

  private async sendTransaction (transaction: SWTransaction): Promise<TransactionEmitter> {
    // Send Transaction
    const emitter = await (transaction.chainType === 'substrate'
      ? this.signAndSendSubstrateTransaction(transaction)
      : transaction.chainType === 'evm'
        ? this.signAndSendEvmTransaction(transaction)
        : transaction.chainType === 'cardano'
          ? this.signAndSendCardanoTransaction(transaction)
          : transaction.chainType === 'ton'
            ? this.signAndSendTonTransaction(transaction)
            : this.signAndSendBitcoinTransaction(transaction));

    const { eventsHandler, step } = transaction;

    emitter.on('signed', (data: TransactionEventResponse) => {
      this.onSigned(data);
    });

    emitter.on('send', (data: TransactionEventResponse) => {
      this.onSend(data);

      if (step) {
        this.updateProcessStepStatus(step, { transactionId: transaction.id, status: StepStatus.SUBMITTING, chain: transaction.chain });
      }
    });

    emitter.on('extrinsicHash', (data: TransactionEventResponse) => {
      this.onHasTransactionHash(data);

      if (step) {
        this.updateProcessStepStatus(step, { extrinsicHash: data.extrinsicHash, status: StepStatus.PROCESSING });
      }
    });

    emitter.on('success', (data: TransactionEventResponse) => {
      this.handlePostProcessing(data.id);
      this.onSuccess(data);

      if (step) {
        this.updateProcessStepStatus(step, { status: StepStatus.COMPLETE });
      }
    });

    emitter.on('error', (data: TransactionEventResponse) => {
      // this.handlePostProcessing(data.id); // might enable this later
      this.onFailed({ ...data, errors: [...data.errors, new TransactionError(BasicTxErrorType.INTERNAL_ERROR)] });

      if (step) {
        const rejectError = data.errors.find((error) => {
          // TODO: REFACTOR ERROR CODE
          return ([BasicTxErrorType.UNABLE_TO_SIGN, BasicTxErrorType.USER_REJECT_REQUEST] as TransactionErrorType[]).includes(error.errorType);
        });

        /**
         * Now simple check, first step have step id = 1.
         * Improve to fetch the process from db
         * */
        if (rejectError && step.stepId === 1) {
          this.deleteProcess(step);
        } else {
          this.updateProcessStepStatus(step, { status: StepStatus.FAILED });
        }
      }
    });

    emitter.on('timeout', (data: TransactionEventResponse) => {
      this.onTimeOut({ ...data, errors: [...data.errors, new TransactionError(BasicTxErrorType.TIMEOUT)] });

      if (step) {
        this.updateProcessStepStatus(step, { status: StepStatus.TIMEOUT });
      }
    });

    // Todo: handle any event with transaction.eventsHandler

    eventsHandler?.(emitter);

    return emitter;
  }

  private sendPermitTransaction (transaction: SWPermitTransaction) {
    // Send Transaction
    const emitter = this.signAndSendEvmPermitTransaction(transaction);

    const { eventsHandler, step } = transaction;

    emitter.on('send', (data: TransactionEventResponse) => {
      if (step) {
        this.updateProcessStepStatus(step, { transactionId: transaction.id, status: StepStatus.SUBMITTING, chain: transaction.chain });
      }
    });

    emitter.on('extrinsicHash', (data: TransactionEventResponse) => {
      if (step) {
        this.updateProcessStepStatus(step, { extrinsicHash: data.extrinsicHash, status: StepStatus.PROCESSING });
      }
    });

    emitter.on('success', (data: TransactionEventResponse) => {
      if (step) {
        this.updateProcessStepStatus(step, { status: StepStatus.COMPLETE });
      }
    });

    emitter.on('error', (data: TransactionEventResponse) => {
      // this.handlePostProcessing(data.id); // might enable this later
      this.onFailed({ ...data, errors: [...data.errors, new TransactionError(BasicTxErrorType.INTERNAL_ERROR)] });

      if (step) {
        const rejectError = data.errors.find((error) => {
          // TODO: REFACTOR ERROR CODE
          return ([BasicTxErrorType.UNABLE_TO_SIGN, BasicTxErrorType.USER_REJECT_REQUEST] as TransactionErrorType[]).includes(error.errorType);
        });

        /**
         * Now simple check, first step have step id = 1.
         * Improve to fetch the process from db
         * */
        if (rejectError && step.stepId === 1) {
          this.deleteProcess(step);
        } else {
          this.updateProcessStepStatus(step, { status: StepStatus.FAILED });
        }
      }
    });

    // Todo: handle any event with transaction.eventsHandler

    eventsHandler?.(emitter);

    return emitter;
  }

  private sendDutchTransaction (transaction: SWDutchTransaction) {
    // Send Transaction
    const emitter = this.signAndSendEvmDutchTransaction(transaction);

    const { eventsHandler, step } = transaction;

    emitter.on('send', (data: TransactionEventResponse) => {
      this.onSend(data);

      if (step) {
        this.updateProcessStepStatus(step, { transactionId: transaction.id, status: StepStatus.SUBMITTING, chain: transaction.chain });
      }
    });

    emitter.on('extrinsicHash', (data: TransactionEventResponse) => {
      this.onHasTransactionHash(data);

      if (step) {
        this.updateProcessStepStatus(step, { extrinsicHash: data.extrinsicHash, status: StepStatus.PROCESSING });
      }
    });

    emitter.on('success', (data: TransactionEventResponse) => {
      this.handlePostProcessing(data.id);
      this.onSuccess(data);

      if (step) {
        this.updateProcessStepStatus(step, { status: StepStatus.COMPLETE });
      }
    });

    emitter.on('error', (data: TransactionEventResponse) => {
      // this.handlePostProcessing(data.id); // might enable this later
      this.onFailed({ ...data, errors: [...data.errors, new TransactionError(BasicTxErrorType.INTERNAL_ERROR)] });

      if (step) {
        const rejectError = data.errors.find((error) => {
          // TODO: REFACTOR ERROR CODE
          return ([BasicTxErrorType.UNABLE_TO_SIGN, BasicTxErrorType.USER_REJECT_REQUEST] as TransactionErrorType[]).includes(error.errorType);
        });

        /**
         * Now simple check, first step have step id = 1.
         * Improve to fetch the process from db
         * */
        if (rejectError && step.stepId === 1) {
          this.deleteProcess(step);
        } else {
          this.updateProcessStepStatus(step, { status: StepStatus.FAILED });
        }
      }
    });

    emitter.on('timeout', (data: TransactionEventResponse) => {
      this.onTimeOut({ ...data, errors: [...data.errors, new TransactionError(BasicTxErrorType.TIMEOUT)] });

      if (step) {
        this.updateProcessStepStatus(step, { status: StepStatus.TIMEOUT });
      }
    });

    // Todo: handle any event with transaction.eventsHandler

    eventsHandler?.(emitter);

    return emitter;
  }

  private removeTransaction (id: string): void {
    if (this.transactions[id]) {
      delete this.transactions[id];
      this.transactionSubject.next({ ...this.transactions });
    }
  }

  private updateTransaction (id: string, data: Partial<Omit<SWTransactionBase, 'id'>>): void {
    const transaction = this.transactions[id];

    if (transaction) {
      this.transactions[id] = {
        ...transaction,
        ...data
      };
    }
  }

  private getTransactionLink (id: string): string | undefined {
    const transaction = this.getTransaction(id);
    const chainInfo = this.state.chainService.getChainInfoByKey(transaction.chain);

    return getExplorerLink(chainInfo, transaction.extrinsicHash, 'tx');
  }

  private transactionToHistories (id: string, startBlock?: number, nonce?: number, eventLogs?: EventRecord[]): TransactionHistoryItem[] {
    const transaction = this.getTransaction(id);
    const extrinsicType = transaction.extrinsicType;

    const chainInfo = this.state.chainService.getChainInfoByKey(transaction.chain);
    const formattedTransactionAddress = reformatAddress(transaction.address);

    const historyItem: TransactionHistoryItem = {
      origin: 'app',
      chain: transaction.chain,
      direction: TransactionDirection.SEND,
      type: transaction.extrinsicType,
      from: transaction.address,
      to: '',
      chainType: transaction.chainType,
      address: formattedTransactionAddress,
      status: transaction.status,
      transactionId: transaction.id,
      extrinsicHash: transaction.extrinsicHash,
      time: transaction.createdAt,
      fee: transaction.estimateFee,
      blockTime: undefined,
      blockNumber: 0, // Will be added in next step
      blockHash: '', // Will be added in next step
      nonce: nonce ?? 0,
      startBlock: startBlock || 0,
      processId: transaction.step?.processId
    };

    const nativeAsset = _getChainNativeTokenBasicInfo(chainInfo);
    const baseNativeAmount = { value: '0', decimals: nativeAsset.decimals, symbol: nativeAsset.symbol };

    // Fill data by extrinsicType
    switch (extrinsicType) {
      case ExtrinsicType.TRANSFER_BALANCE: {
        const inputData = parseTransactionData<ExtrinsicType.TRANSFER_TOKEN>(transaction.data);

        historyItem.to = inputData.to;
        const sendingTokenInfo = this.state.chainService.getAssetBySlug(inputData.tokenSlug);

        historyItem.amount = { value: inputData.value || '0', decimals: sendingTokenInfo.decimals || 0, symbol: sendingTokenInfo.symbol };
        eventLogs && parseTransferEventLogs(historyItem, eventLogs, transaction.chain, sendingTokenInfo, chainInfo);
      }

        break;
      case ExtrinsicType.TRANSFER_TOKEN: {
        const inputData = parseTransactionData<ExtrinsicType.TRANSFER_TOKEN>(transaction.data);

        historyItem.to = inputData.to;
        const sendingTokenInfo = this.state.chainService.getAssetBySlug(inputData.tokenSlug);

        historyItem.amount = { value: inputData.value || '0', decimals: sendingTokenInfo.decimals || 0, symbol: sendingTokenInfo.symbol };
        eventLogs && parseTransferEventLogs(historyItem, eventLogs, transaction.chain, sendingTokenInfo, chainInfo);
      }

        break;
      case ExtrinsicType.TRANSFER_XCM: {
        const inputData = parseTransactionData<ExtrinsicType.TRANSFER_XCM>(transaction.data);

        historyItem.to = inputData.to;
        const sendingTokenInfo = this.state.chainService.getAssetBySlug(inputData.tokenSlug);

        historyItem.amount = { value: inputData.value || '0', decimals: sendingTokenInfo.decimals || 0, symbol: sendingTokenInfo.symbol };

        // @ts-ignore
        historyItem.additionalInfo = { destinationChain: inputData?.destinationNetworkKey || '', originalChain: inputData.originNetworkKey || '', fee: transaction.estimateFee };
        eventLogs && parseXcmEventLogs(historyItem, eventLogs, transaction.chain, sendingTokenInfo, chainInfo);
      }

        break;
      case ExtrinsicType.SEND_NFT: {
        const inputData = parseTransactionData<ExtrinsicType.SEND_NFT>(transaction.data);

        historyItem.to = inputData.recipientAddress;
        historyItem.amount = {
          decimals: 0,
          symbol: 'NFT',
          value: '1'
        };
      }

        break;
      case ExtrinsicType.STAKING_BOND: {
        const data = parseTransactionData<ExtrinsicType.STAKING_BOND>(transaction.data);

        historyItem.amount = { ...baseNativeAmount, value: data.amount || '0' };
      }

        break;
      case ExtrinsicType.JOIN_YIELD_POOL: {
        const data = parseTransactionData<ExtrinsicType.JOIN_YIELD_POOL>(transaction.data);
        const poolData = data.data as SubmitJoinNominationPool;

        historyItem.amount = { ...baseNativeAmount, value: poolData.amount || '0' };
        historyItem.to = poolData.selectedPool.name || poolData.selectedPool.id.toString();
      }

        break;
      case ExtrinsicType.STAKING_UNBOND:
        {
          const data = parseTransactionData<ExtrinsicType.STAKING_UNBOND>(transaction.data);

          if (data.poolInfo?.metadata.subnetData) {
            historyItem.additionalInfo = {
              symbol: data.poolInfo.metadata.subnetData.subnetSymbol
            };
          }

          if (data.isLiquidStaking && data.derivativeTokenInfo && data.exchangeRate && data.inputTokenInfo) {
            historyItem.amount = {
              decimals: _getAssetDecimals(data.derivativeTokenInfo),
              symbol: _getAssetSymbol(data.derivativeTokenInfo),
              value: data.amount
            };

            historyItem.additionalInfo = {
              inputTokenSlug: data.inputTokenInfo.slug,
              exchangeRate: data.exchangeRate
            } as TransactionAdditionalInfo[ExtrinsicType.STAKING_UNBOND];
          } else {
            historyItem.to = data.validatorAddress || '';
            historyItem.amount = { ...baseNativeAmount, value: data.amount || '0' };
          }
        }

        break;
      case ExtrinsicType.STAKING_LEAVE_POOL:
        {
          const data = parseTransactionData<ExtrinsicType.STAKING_LEAVE_POOL>(transaction.data);

          historyItem.to = data.address || '';
          historyItem.amount = { ...baseNativeAmount, value: data.amount || '0' };
        }

        break;
      case ExtrinsicType.STAKING_CLAIM_REWARD: {
        const data = parseTransactionData<ExtrinsicType.STAKING_CLAIM_REWARD>(transaction.data);

        historyItem.amount = { ...baseNativeAmount, value: data.unclaimedReward || '0' };
      }

        break;

      case ExtrinsicType.STAKING_WITHDRAW: {
        const data = parseTransactionData<ExtrinsicType.STAKING_WITHDRAW>(transaction.data);

        const slug = data.slug;
        const poolHandler = this.state.earningService.getPoolHandler(slug);

        const amount: AmountData = {
          ...baseNativeAmount,
          value: data.unstakingInfo.claimable || '0'
        };

        if (poolHandler) {
          const asset = this.state.getAssetBySlug(poolHandler.metadataInfo.inputAsset);

          if (asset) {
            amount.decimals = asset.decimals || 0;
            amount.symbol = asset.symbol;
          }
        }

        historyItem.to = data.unstakingInfo.validatorAddress || '';
        historyItem.amount = amount;
        break;
      }

      case ExtrinsicType.STAKING_CANCEL_UNSTAKE: {
        const data = parseTransactionData<ExtrinsicType.STAKING_CANCEL_UNSTAKE>(transaction.data);

        historyItem.amount = { ...baseNativeAmount, value: data.selectedUnstaking.claimable || '0' };
        break;
      }

      case ExtrinsicType.CHANGE_EARNING_VALIDATOR: {
        const data = parseTransactionData<ExtrinsicType.CHANGE_EARNING_VALIDATOR>(transaction.data) as SubmitBittensorChangeValidatorStaking;

        historyItem.additionalInfo = {
          symbol: data.metadata?.subnetSymbol || ''
        };

        if (data.amount !== '0') {
          historyItem.amount = { ...baseNativeAmount, value: data.amount };
        }

        break;
      }

      case ExtrinsicType.EVM_EXECUTE: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = parseTransactionData<ExtrinsicType.EVM_EXECUTE>(transaction.data);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        historyItem.to = data?.to || '';
        break;
      }

      case ExtrinsicType.MINT_STDOT:
      case ExtrinsicType.MINT_QDOT:
      case ExtrinsicType.MINT_LDOT:
      case ExtrinsicType.MINT_SDOT:
      case ExtrinsicType.MINT_VMANTA:

      // eslint-disable-next-line no-fallthrough
      case ExtrinsicType.MINT_VDOT: {
        const params = parseTransactionData<ExtrinsicType.MINT_VDOT>(transaction.data);

        const inputTokenInfo = this.state.chainService.getAssetBySlug(params.inputTokenSlug);
        const isFeePaidWithInputAsset = params.feeTokenSlug === params.inputTokenSlug;

        historyItem.amount = { value: params.amount, symbol: _getAssetSymbol(inputTokenInfo), decimals: _getAssetDecimals(inputTokenInfo) };

        const additionalInfo: TransactionAdditionalInfo[ExtrinsicType.MINT_VDOT] = {
          slug: params.slug,
          derivativeTokenSlug: params.derivativeTokenSlug,
          exchangeRate: params.exchangeRate
        };

        historyItem.additionalInfo = additionalInfo;
        eventLogs && !_isChainEvmCompatible(chainInfo) && parseLiquidStakingEvents(historyItem, eventLogs, inputTokenInfo, chainInfo, isFeePaidWithInputAsset, extrinsicType);

        break;
      }

      case ExtrinsicType.UNSTAKE_QDOT:

      // eslint-disable-next-line no-fallthrough
      case ExtrinsicType.REDEEM_QDOT: {
        const data = parseTransactionData<ExtrinsicType.REDEEM_QDOT>(transaction.data);
        const yieldPoolInfo = data.poolInfo as SpecialYieldPoolInfo;

        if (yieldPoolInfo.metadata.derivativeAssets) {
          const inputTokenSlug = yieldPoolInfo.metadata.inputAsset;
          const inputTokenInfo = this.state.chainService.getAssetBySlug(inputTokenSlug);

          historyItem.amount = { value: data.amount, symbol: _getAssetSymbol(inputTokenInfo), decimals: _getAssetDecimals(inputTokenInfo) };
          eventLogs && parseLiquidStakingFastUnstakeEvents(historyItem, eventLogs, chainInfo, extrinsicType);

          const additionalInfo: LeavePoolAdditionalData = {
            minAmountPercent: 1,
            symbol: inputTokenInfo.symbol,
            decimals: inputTokenInfo.decimals || 0,
            exchangeRate: 1,
            slug: yieldPoolInfo.slug,
            type: yieldPoolInfo.type,
            chain: yieldPoolInfo.chain,
            group: yieldPoolInfo.group,
            isFast: data.fastLeave
          };

          historyItem.additionalInfo = additionalInfo;
        }

        break;
      }

      case ExtrinsicType.UNSTAKE_VDOT:
      case ExtrinsicType.UNSTAKE_VMANTA:
      case ExtrinsicType.UNSTAKE_LDOT:
      case ExtrinsicType.UNSTAKE_SDOT:
      case ExtrinsicType.UNSTAKE_STDOT:
      case ExtrinsicType.REDEEM_STDOT:
      case ExtrinsicType.REDEEM_LDOT:
      case ExtrinsicType.REDEEM_SDOT:
      case ExtrinsicType.REDEEM_VMANTA:

      // eslint-disable-next-line no-fallthrough
      case ExtrinsicType.REDEEM_VDOT: {
        const data = parseTransactionData<ExtrinsicType.REDEEM_VDOT>(transaction.data);
        const yieldPoolInfo = data.poolInfo as SpecialYieldPoolInfo;
        const minAmountPercents = this.state.earningService.getMinAmountPercent();

        if (yieldPoolInfo.metadata.derivativeAssets) {
          const derivativeTokenSlug = yieldPoolInfo.metadata.derivativeAssets[0];
          const derivativeTokenInfo = this.state.chainService.getAssetBySlug(derivativeTokenSlug);
          const chainInfo = this.state.chainService.getChainInfoByKey(data.poolInfo.chain);

          historyItem.amount = { value: data.amount, symbol: _getAssetSymbol(derivativeTokenInfo), decimals: _getAssetDecimals(derivativeTokenInfo) };
          eventLogs && !_isChainEvmCompatible(chainInfo) && parseLiquidStakingFastUnstakeEvents(historyItem, eventLogs, chainInfo, extrinsicType);

          const minAmountPercent = minAmountPercents[yieldPoolInfo.slug] || 1;
          const inputTokenSlug = yieldPoolInfo.metadata.inputAsset;
          const inputTokenInfo = this.state.chainService.getAssetBySlug(inputTokenSlug);
          const additionalInfo: LeavePoolAdditionalData = {
            minAmountPercent,
            symbol: inputTokenInfo.symbol,
            decimals: inputTokenInfo.decimals || 0,
            exchangeRate: yieldPoolInfo.statistic?.assetEarning[0].exchangeRate || 1,
            slug: yieldPoolInfo.slug,
            type: yieldPoolInfo.type,
            chain: yieldPoolInfo.chain,
            group: yieldPoolInfo.group,
            isFast: data.fastLeave
          };

          historyItem.additionalInfo = additionalInfo;
        }

        break;
      }

      case ExtrinsicType.TOKEN_SPENDING_APPROVAL: {
        const data = parseTransactionData<ExtrinsicType.TOKEN_SPENDING_APPROVAL>(transaction.data);
        const inputAsset = this.state.chainService.getAssetBySlug(data.contractAddress);

        historyItem.amount = { value: '0', symbol: _getAssetSymbol(inputAsset), decimals: _getAssetDecimals(inputAsset) };

        break;
      }

      case ExtrinsicType.SWAP: {
        const data = parseTransactionData<ExtrinsicType.SWAP>(transaction.data); // TODO: switch by provider
        const inputAsset = this.state.chainService.getAssetBySlug(data.quote.pair.from);

        historyItem.amount = { value: data.quote.fromAmount, symbol: _getAssetSymbol(inputAsset), decimals: _getAssetDecimals(inputAsset) };
        historyItem.additionalInfo = data;

        break;
      }

      case ExtrinsicType.CLAIM_BRIDGE: {
        const data = parseTransactionData<ExtrinsicType.CLAIM_BRIDGE>(transaction.data); // TODO: switch by provider
        const metadata = data.notification.metadata as ClaimAvailBridgeNotificationMetadata;
        const claimAsset = this.state.chainService.getAssetBySlug(metadata.tokenSlug);

        historyItem.amount = { value: metadata.amount, symbol: _getAssetSymbol(claimAsset), decimals: _getAssetDecimals(claimAsset) };
        historyItem.additionalInfo = data;

        break;
      }

      case ExtrinsicType.UNKNOWN:
        break;
    }

    try {
      // Return one more history record if transaction send to account in the wallets
      const toAccount = historyItem?.to && keyring.getPair(historyItem.to);

      if (toAccount) {
        const receiverHistory: TransactionHistoryItem = {
          ...historyItem,
          address: toAccount.address,
          direction: TransactionDirection.RECEIVED
        };

        switch (extrinsicType) {
          case ExtrinsicType.TRANSFER_XCM: {
            const inputData = parseTransactionData<ExtrinsicType.TRANSFER_XCM>(transaction.data);

            receiverHistory.chain = inputData.destinationNetworkKey;
            break;
          }

          default:
            break;
        }

        return [historyItem, receiverHistory];
      }
    } catch (e) {
      console.warn(e);
    }

    return [historyItem];
  }

  private onSigned ({ id }: TransactionEventResponse) {
    console.debug(`Transaction "${id}" is signed`);
  }

  private onSend ({ id, nonce, startBlock }: TransactionEventResponse) {
    // Update transaction status
    this.updateTransaction(id, { status: ExtrinsicStatus.SUBMITTING });

    // Create Input History Transaction History
    this.state.historyService.insertHistories(this.transactionToHistories(id, startBlock, nonce)).catch(console.error);

    this.createProcessNotification(id).catch(console.error);

    console.debug(`Transaction "${id}" is sent`);
  }

  private onHasTransactionHash ({ blockHash, extrinsicHash, id }: TransactionEventResponse) {
    // Write processing transaction history
    const updateData = { extrinsicHash, status: ExtrinsicStatus.PROCESSING, blockHash: blockHash || '' };

    this.updateTransaction(id, updateData);

    // In this case transaction id is the same as extrinsic hash and will change after below update
    this.state.historyService.updateHistoryByExtrinsicHash(id, updateData).catch(console.error);

    console.debug(`Transaction "${id}" is submitted with hash ${extrinsicHash || ''}`);

    const transaction = this.getTransaction(id);

    if ([
      ExtrinsicType.STAKING_JOIN_POOL,
      ExtrinsicType.STAKING_BOND,
      ExtrinsicType.JOIN_YIELD_POOL,
      ExtrinsicType.MINT_LDOT,
      ExtrinsicType.MINT_QDOT,
      ExtrinsicType.MINT_SDOT,
      ExtrinsicType.MINT_STDOT,
      ExtrinsicType.MINT_VDOT,
      ExtrinsicType.MINT_VMANTA
    ].includes(transaction.extrinsicType)) {
      this.handlePostEarningTransaction(id);
    }

    // Trigger balance update for Bitcoin transactions after receiving extrinsicHash
    if (ExtrinsicType.TRANSFER_BALANCE && transaction.chainType === 'bitcoin') {
      const balanceService = this.state.balanceService;
      const inputData = parseTransactionData<ExtrinsicType.TRANSFER_BALANCE>(transaction.data);

      try {
        const sender = keyring.getPair(inputData.from);

        balanceService.refreshBalanceForAddress(sender.address, transaction.chain, inputData.tokenSlug, transaction.extrinsicType)
          .catch((error) => console.error('Failed to run balance subscription:', error));
      } catch (e) {
        console.error(e);
      }

      try {
        const recipient = keyring.getPair(inputData.to);

        balanceService.refreshBalanceForAddress(recipient.address, transaction.chain, inputData.tokenSlug, transaction.extrinsicType)
          .catch((error) => console.error('Failed to run balance subscription:', error));
      } catch (e) {
        console.error(e);
      }
    }
  }

  private handlePostProcessing (id: string) { // must be done after success/failure to make sure the transaction is finalized
    const transaction = this.getTransaction(id);

    if (transaction.extrinsicType === ExtrinsicType.SEND_NFT) {
      const inputData = parseTransactionData<ExtrinsicType.SEND_NFT>(transaction.data);

      try {
        const sender = keyring.getPair(inputData.senderAddress);

        sender && this.state.dbService.handleNftTransfer(transaction.chain, [sender.address, ALL_ACCOUNT_KEY], inputData.nftItem)
          .then(() => {
            this.state.eventService.emit('transaction.transferNft', undefined);
          })
          .catch(console.error);
      } catch (e) {
        console.error(e);
      }

      try {
        const recipient = keyring.getPair(inputData.recipientAddress);

        recipient && this.state.dbService.addNft(recipient.address, { ...inputData.nftItem, owner: recipient.address })
          .catch(console.error);
      } catch (e) {
        console.error(e);
      }
    } else if ([ExtrinsicType.STAKING_BOND, ExtrinsicType.STAKING_UNBOND, ExtrinsicType.STAKING_WITHDRAW, ExtrinsicType.STAKING_CANCEL_UNSTAKE, ExtrinsicType.STAKING_CLAIM_REWARD, ExtrinsicType.JOIN_YIELD_POOL, ExtrinsicType.STAKING_LEAVE_POOL].includes(transaction.extrinsicType)) {
      this.state.eventService.emit('transaction.submitStaking', transaction.chain);
    } else if (transaction.extrinsicType === ExtrinsicType.SWAP) {
      const inputData = parseTransactionData<ExtrinsicType.SWAP>(transaction.data);
      const toAssetSlug = inputData.quote.pair.to;

      // todo: consider async
      this.state.chainService.updateAssetSetting(toAssetSlug, { visible: true }, true).catch(console.error);
    }
  }

  private onSuccess ({ blockHash, blockNumber, blockTime, extrinsicHash, id }: TransactionEventResponse) {
    const transaction = this.getTransaction(id);

    this.updateTransaction(id, { status: ExtrinsicStatus.SUCCESS, extrinsicHash });

    // Write success transaction history
    this.state.historyService.updateHistoryByExtrinsicHash(transaction.extrinsicHash, {
      extrinsicHash,
      status: ExtrinsicStatus.SUCCESS,
      blockNumber: blockNumber || 0,
      blockHash: blockHash || '',
      blockTime
    }).catch(console.error);

    const info = isHex(extrinsicHash) ? extrinsicHash : getBaseTransactionInfo(transaction, this.state.chainService.getChainInfoMap());

    this.state.notificationService.notify({
      type: NotificationType.SUCCESS,
      title: t('bg.TRANSACTION_SERVICE.services.service.transaction.transactionCompleted'),
      message: t('bg.TRANSACTION_SERVICE.services.service.transaction.transactionInfoCompleted', { replace: { info } }),
      action: { url: this.getTransactionLink(id) },
      notifyViaBrowser: true
    });

    this.state.eventService.emit('transaction.done', transaction);
  }

  private onFailed ({ blockHash, blockNumber, errors, extrinsicHash, id }: TransactionEventResponse) {
    const transaction = this.getTransaction(id);
    const nextStatus = ExtrinsicStatus.FAIL;

    if (transaction) {
      this.updateTransaction(id, { status: nextStatus, errors, extrinsicHash });

      // Write failed transaction history
      this.state.historyService.updateHistoryByExtrinsicHash(transaction.extrinsicHash, {
        extrinsicHash: extrinsicHash || transaction.extrinsicHash,
        status: nextStatus,
        blockNumber: blockNumber || 0,
        blockHash: blockHash || ''
      }).catch(console.error);

      const info = isHex(transaction?.extrinsicHash) ? transaction?.extrinsicHash : getBaseTransactionInfo(transaction, this.state.chainService.getChainInfoMap());

      this.state.notificationService.notify({
        type: NotificationType.ERROR,
        title: t('bg.TRANSACTION_SERVICE.services.service.transaction.transactionFailed'),
        message: t('bg.TRANSACTION_SERVICE.services.service.transaction.transactionInfoFailed', { replace: { info } }),
        action: { url: this.getTransactionLink(id) },
        notifyViaBrowser: true
      });
    }

    this.state.eventService.emit('transaction.failed', transaction);
  }

  private onTimeOut ({ blockHash, blockNumber, errors, extrinsicHash, id }: TransactionEventResponse) {
    const transaction = this.getTransaction(id);
    const nextStatus = ExtrinsicStatus.TIMEOUT;

    if (transaction) {
      this.updateTransaction(id, { status: nextStatus, errors, extrinsicHash });

      this.state.historyService.updateHistoryByExtrinsicHash(transaction.extrinsicHash, {
        extrinsicHash: extrinsicHash || transaction.extrinsicHash,
        status: nextStatus,
        blockNumber: blockNumber || 0,
        blockHash: blockHash || ''
      }).catch(console.error);

      const info = isHex(transaction?.extrinsicHash) ? transaction?.extrinsicHash : getBaseTransactionInfo(transaction, this.state.chainService.getChainInfoMap());

      this.state.notificationService.notify({
        type: NotificationType.ERROR,
        title: t('bg.TRANSACTION_SERVICE.services.service.transaction.transactionTimedOut'),
        message: t('bg.TRANSACTION_SERVICE.services.service.transaction.transactionInfoTimedOut', { replace: { info } }),
        action: { url: this.getTransactionLink(id) },
        notifyViaBrowser: true
      });
    }

    this.state.eventService.emit('transaction.timeout', transaction);
  }

  public generateHashPayload (chain: string, transaction: TransactionConfig): HexString {
    const chainInfo = this.state.chainService.getChainInfoByKey(chain);

    let txObject: TransactionLike;

    const max = anyNumberToBN(transaction.maxFeePerGas);

    if (max.gt(BN_ZERO)) {
      txObject = {
        nonce: transaction.nonce ?? 0,
        maxFeePerGas: addHexPrefix(anyNumberToBN(transaction.maxFeePerGas).toString(16)),
        maxPriorityFeePerGas: addHexPrefix(anyNumberToBN(transaction.maxPriorityFeePerGas).toString(16)),
        gasLimit: addHexPrefix(anyNumberToBN(transaction.gas).toString(16)),
        to: transaction.to,
        value: addHexPrefix(anyNumberToBN(transaction.value).toString(16)),
        data: transaction.data,
        chainId: _getEvmChainId(chainInfo),
        type: 2
      };
    } else {
      txObject = {
        nonce: transaction.nonce ?? 0,
        gasPrice: addHexPrefix(anyNumberToBN(transaction.gasPrice).toString(16)),
        gasLimit: addHexPrefix(anyNumberToBN(transaction.gas).toString(16)),
        to: transaction.to,
        value: addHexPrefix(anyNumberToBN(transaction.value).toString(16)),
        data: transaction.data,
        chainId: _getEvmChainId(chainInfo),
        type: 0
      };
    }

    return ethers.Transaction.from(txObject).unsignedSerialized as HexString;
  }

  private async signAndSendEvmTransaction ({ address, chain, id, isPassConfirmation, step, transaction, url }: SWTransaction): Promise<TransactionEmitter> {
    const payload = (transaction as EvmSendTransactionRequest);
    const evmApi = this.state.chainService.getEvmApi(chain);
    const chainInfo = this.state.chainService.getChainInfoByKey(chain);
    const hasError = !!(payload.errors && payload.errors.length > 0);
    const accountPair = keyring.getPair(address);
    const account: AccountJson = pairToAccount(accountPair);

    // Allow sign transaction
    payload.canSign = true;

    // Fill contract info
    if (!payload.parseData) {
      try {
        const isToContract = await isContractAddress(payload.to || '', evmApi);

        payload.isToContract = isToContract;

        payload.parseData = isToContract
          ? payload.data
            ? (await parseContractInput(payload.data || '', payload.to || '', chainInfo)).result
            : ''
          : payload.data || '';
      } catch (e) {
        console.warn('Unable to parse contract input data');
        payload.parseData = payload.data as string;
      }
    }

    if (!payload.address) {
      payload.address = address;
    }

    if ('data' in payload && payload.data === undefined) {
      delete payload.data;
    }

    // Set unique nonce to avoid transaction errors
    if (!payload.nonce) {
      const evmApi = this.state.chainService.getEvmApi(chain);

      if (evmApi.isApiConnected) {
        payload.nonce = await evmApi?.api.eth.getTransactionCount(address);
      }
    }

    if (!payload.chainId) {
      payload.chainId = chainInfo?.evmInfo?.evmChainId ?? 1;
    }

    // Autofill from
    if (!payload.from) {
      payload.from = address;
    }

    if (!payload.estimateGas) {
      if (payload.maxFeePerGas) {
        payload.estimateGas = new BigN(anyNumberToBN(payload.maxFeePerGas).toNumber()).multipliedBy(payload.gas || '0').toFixed(0);
      } else {
        payload.estimateGas = new BigN(anyNumberToBN(payload.gasPrice).toNumber()).multipliedBy(payload.gas || '0').toFixed(0);
      }
    }

    const isExternal = !!account.isExternal;
    const isInjected = !!account.isInjected;

    if (!hasError) {
      // generate hashPayload for EVM transaction
      payload.hashPayload = this.generateHashPayload(chain, payload);
    }

    const emitter = new EventEmitter<TransactionEventMap>();

    const txObject: Web3Transaction = {
      nonce: payload.nonce ?? 0,
      from: payload.from as string,
      gasPrice: anyNumberToBN(payload.gasPrice).toNumber(),
      maxFeePerGas: anyNumberToBN(payload.maxFeePerGas).toNumber(),
      maxPriorityFeePerGas: anyNumberToBN(payload.maxPriorityFeePerGas).toNumber(),
      gasLimit: anyNumberToBN(payload.gas).toNumber(),
      to: payload.to,
      value: anyNumberToBN(payload.value).toNumber(),
      data: payload.data,
      chainId: payload.chainId
    };

    const eventData: TransactionEventResponse = {
      id,
      errors: [],
      warnings: [],
      extrinsicHash: id,
      processId: step?.processId
    };

    if (isInjected) {
      this.state.requestService.addConfirmation(id, url || EXTENSION_REQUEST_URL, 'evmWatchTransactionRequest', payload, {})
        .then(async ({ isApproved, payload }) => {
          if (isApproved) {
            if (!payload) {
              throw new EvmProviderError(EvmProviderErrorType.UNAUTHORIZED, 'Bad signature');
            }

            const web3Api = this.state.chainService.getEvmApi(chain).api;

            // Emit signed event
            emitter.emit('signed', eventData);

            eventData.nonce = txObject.nonce;
            eventData.startBlock = await web3Api.eth.getBlockNumber() - 3;
            // Add start info
            emitter.emit('send', eventData); // This event is needed after sending transaction with queue

            const txHash = payload;

            eventData.extrinsicHash = txHash;
            emitter.emit('extrinsicHash', eventData);

            this.watchTransactionSubscribes[id] = new Promise<void>((resolve, reject) => {
              // eslint-disable-next-line prefer-const
              let subscribe: Subscription;

              const onComplete = () => {
                subscribe?.unsubscribe?.();
                delete this.watchTransactionSubscribes[id];
              };

              const onSuccess = (rs: TransactionReceipt) => {
                if (rs) {
                  eventData.extrinsicHash = rs.transactionHash;
                  eventData.blockHash = rs.blockHash;
                  eventData.blockNumber = rs.blockNumber;
                  emitter.emit('success', eventData);
                  onComplete();
                  resolve();
                }
              };

              const onError = (error: Error) => {
                if (error) {
                  // TODO: Change type and message
                  eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SEND, error.message));
                  emitter.emit('error', eventData);
                  onComplete();
                  reject(error);
                }
              };

              const onCheck = () => {
                web3Api.eth.getTransactionReceipt(txHash).then(onSuccess).catch(onError);
              };

              subscribe = rxjsInterval(3000).subscribe(onCheck);
            });
          } else {
            this.removeTransaction(id);
            eventData.errors.push(new TransactionError(BasicTxErrorType.USER_REJECT_REQUEST));
            emitter.emit('error', eventData);
          }
        })
        .catch((e: Error) => {
          this.removeTransaction(id);
          // TODO: Change type
          eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SIGN, e.message));

          emitter.emit('error', eventData);
        });
    } else {
      this.state.requestService.addConfirmation(id, url || EXTENSION_REQUEST_URL, 'evmSendTransactionRequest', payload, { isPassConfirmation })
        .then(async ({ isApproved, payload }) => {
          if (isApproved) {
            let signedTransaction: string | undefined;

            if (!payload) {
              throw new EvmProviderError(EvmProviderErrorType.UNAUTHORIZED, t('bg.TRANSACTION_SERVICE.services.service.transaction.failedToSign'));
            }

            const web3Api = this.state.chainService.getEvmApi(chain).api;

            if (!isExternal) {
              signedTransaction = payload;
            } else {
              const signed = mergeTransactionAndSignature(txObject, payload as `0x${string}`);

              const recover = web3Api.eth.accounts.recoverTransaction(signed);

              if (recover.toLowerCase() !== account.address.toLowerCase()) {
                throw new EvmProviderError(EvmProviderErrorType.UNAUTHORIZED, t('bg.TRANSACTION_SERVICE.services.service.transaction.wrongSignatureSignWithDappAccount'));
              }

              signedTransaction = signed;
            }

            // Emit signed event
            emitter.emit('signed', eventData);

            // Send transaction
            this.handleTransactionTimeout(emitter, eventData);

            // Add start info
            eventData.nonce = txObject.nonce;
            eventData.startBlock = await web3Api.eth.getBlockNumber();
            emitter.emit('send', eventData); // This event is needed after sending transaction with queue
            signedTransaction && web3Api.eth.sendSignedTransaction(signedTransaction)
              .once('transactionHash', (hash) => {
                eventData.extrinsicHash = hash;
                emitter.emit('extrinsicHash', eventData);
              })
              .once('receipt', (rs) => {
                eventData.extrinsicHash = rs.transactionHash;
                eventData.blockHash = rs.blockHash;
                eventData.blockNumber = rs.blockNumber;
                emitter.emit('success', eventData);
              })
              .once('error', (e) => {
                eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED, t(e.message)));
                emitter.emit('error', eventData);
              })
              .catch((e: Error) => {
                eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SEND, t(e.message)));
                emitter.emit('error', eventData);
              });
          } else {
            this.removeTransaction(id);
            eventData.errors.push(new TransactionError(BasicTxErrorType.USER_REJECT_REQUEST));
            emitter.emit('error', eventData);
          }
        })
        .catch((e: Error) => {
          this.removeTransaction(id);
          eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SIGN, t(e.message)));

          emitter.emit('error', eventData);
        });
    }

    return emitter;
  }

  private signAndSendEvmPermitTransaction ({ address, id, isPassConfirmation, step, transaction, url }: SWPermitTransaction): TransactionEmitter {
    // Allow sign transaction
    const canSign = true;
    const emitter = new EventEmitter<TransactionEventMap>();

    const eventData: TransactionEventResponse = {
      id,
      errors: [],
      warnings: [],
      extrinsicHash: id,
      processId: step?.processId
    };

    const evmSignaturePayload: EvmSignatureRequest = {
      id: id,
      type: 'eth_signTypedData_v4',
      payload: transaction,
      address: address,
      hashPayload: '',
      canSign: canSign,
      processId: step?.processId
    };

    this.state.requestService.addConfirmation(id, url || EXTENSION_REQUEST_URL, 'evmSignatureRequest', evmSignaturePayload, { isPassConfirmation })
      .then(({ isApproved, payload: signature }) => {
        if (isApproved) {
          // Emit signed event
          emitter.emit('signed', eventData);
          emitter.emit('send', eventData); // This event is needed after sending transaction with queue

          if (!signature) {
            throw new EvmProviderError(EvmProviderErrorType.UNAUTHORIZED, t('bg.TRANSACTION_SERVICE.services.service.transaction.failedToSign'));
          }

          eventData.extrinsicHash = signature;

          emitter.emit('extrinsicHash', eventData);
          emitter.emit('success', eventData);
        } else {
          eventData.errors.push(new TransactionError(BasicTxErrorType.USER_REJECT_REQUEST));
          emitter.emit('error', eventData);
        }
      })
      .catch((e: Error) => {
        this.removeTransaction(id);
        eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SIGN, t(e.message)));

        emitter.emit('error', eventData);
      });

    return emitter;
  }

  private signAndSendEvmDutchTransaction ({ address, id, isPassConfirmation, step, transaction, url }: SWDutchTransaction): TransactionEmitter {
    const emitter = new EventEmitter<TransactionEventMap>();

    const eventData: TransactionEventResponse = {
      id,
      errors: [],
      warnings: [],
      extrinsicHash: id,
      processId: step?.processId
    };

    // todo: review this object
    const evmSignaturePayload: EvmSignatureRequest = {
      id: id,
      type: 'eth_signTypedData_v4',
      payload: transaction,
      address: address,
      hashPayload: '',
      canSign: true,
      processId: step?.processId
    };

    this.state.requestService.addConfirmation(id, url || EXTENSION_REQUEST_URL, 'submitApiRequest', evmSignaturePayload, { isPassConfirmation })
      .then(({ isApproved, payload: signature }) => {
        if (isApproved) {
          emitter.emit('signed', eventData);
          emitter.emit('send', eventData);

          transaction.submitSwapOrder()
            .then((isSendSuccess) => {
              if (!isSendSuccess) {
                throw new EvmProviderError(EvmProviderErrorType.UNAUTHORIZED, t('bg.TRANSACTION_SERVICE.services.service.transaction.failedToSign'));
              }

              this.handleTransactionTimeout(emitter, eventData);

              transaction.cronCheckTxSuccess()
                .then((order) => {
                  if (!order) {
                    eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED));
                    emitter.emit('error', eventData);
                  } else {
                    eventData.extrinsicHash = order.txHash;

                    emitter.emit('extrinsicHash', eventData);
                    emitter.emit('success', eventData);
                  }
                })
                .catch((e: Error) => {
                  eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED, t(e.message)));
                  emitter.emit('error', eventData);
                });
            })
            .catch((e: Error) => {
              eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SEND, t(e.message)));
              emitter.emit('error', eventData);
            });
        } else {
          this.removeTransaction(id);
          eventData.errors.push(new TransactionError(BasicTxErrorType.USER_REJECT_REQUEST));
          emitter.emit('error', eventData);
        }
      })
      .catch((e: Error) => {
        this.removeTransaction(id);
        eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SIGN, t(e.message)));

        emitter.emit('error', eventData);
      });

    return emitter;
  }

  private signAndSendSubstrateTransaction ({ address, chain, feeCustom, id, signAfterCreate, step, tokenPayFeeSlug, transaction, url }: SWTransaction): TransactionEmitter {
    const tip = (feeCustom as SubstrateTipInfo)?.tip || '0';
    const feeAssetId = tokenPayFeeSlug && !_isNativeTokenBySlug(tokenPayFeeSlug) && _SUPPORT_TOKEN_PAY_FEE_GROUP.assetHub.includes(chain) ? this.state.chainService.getAssetBySlug(tokenPayFeeSlug).metadata?.multilocation as Record<string, any> : undefined;

    const emitter = new EventEmitter<TransactionEventMap>();
    const eventData: TransactionEventResponse = {
      id,
      errors: [],
      warnings: [],
      extrinsicHash: id,
      processId: step?.processId
    };

    const extrinsic = transaction as SubmittableExtrinsic;
    // const registry = extrinsic.registry;
    // const signedExtensions = registry.signedExtensions;

    const signerOption: Partial<SignerOptions> = {
      signer: {
        signPayload: async (payload: SignerPayloadJSON) => {
          const { signature, signedTransaction } = await this.state.requestService.signInternalTransaction(id, address, url || EXTENSION_REQUEST_URL, payload, signAfterCreate);

          return {
            id: (new Date()).getTime(),
            signature,
            signedTransaction
          } as SignerResult;
        }
      } as Signer,
      tip,
      withSignedTransaction: true,
      assetId: feeAssetId
    };

    // if (_isRuntimeUpdated(signedExtensions)) {
    //   const metadataHash = await this.state.chainService.calculateMetadataHash(chain);
    //
    //   if (metadataHash) {
    //     signerOption.mode = 1;
    //     signerOption.metadataHash = metadataHash;
    //   }
    // }

    extrinsic.signAsync(address, signerOption).then(async (rs) => {
      // Emit signed event
      emitter.emit('signed', eventData);

      // Send transaction
      const api = this.state.chainService.getSubstrateApi(chain);

      eventData.nonce = rs.nonce.toNumber();
      eventData.startBlock = (await api.api.query.system.number()).toPrimitive() as number;
      this.handleTransactionTimeout(emitter, eventData);
      emitter.emit('send', eventData); // This event is needed after sending transaction with queue

      let isBroadcast = false;
      let isInBlock = false;
      let isFinish = false;

      rs.send((txState) => {
        // handle events, logs, history
        if (!txState || !txState.status) {
          return;
        }

        // Broadcast transaction
        if (!isBroadcast) {
          if (txState.status.isBroadcast || txState.status.isInBlock || txState.status.isFinalized) {
            eventData.extrinsicHash = txState.txHash.toHex();
            isBroadcast = true;

            if (!isFinish) {
              emitter.emit('extrinsicHash', eventData);
            }
          }
        }

        // Transaction in block
        if (!isInBlock) {
          if (txState.status.isInBlock || txState.status.isFinalized) {
            eventData.blockHash = txState.status.asInBlock.toHex();
            eventData.eventLogs = txState.events;
            isInBlock = true;
          }
        }

        // Transaction finished
        if (!isFinish) {
          if (txState.status.isInBlock || txState.status.isFinalized) {
            if (!eventData.extrinsicHash) {
              eventData.extrinsicHash = txState.txHash.toHex();
            }

            txState.events
              .filter(({ event: { section } }) => section === 'system')
              .forEach(({ event: { data: [error], method } }): void => {
                if (method === 'ExtrinsicFailed') {
                  eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED, error.toString()));
                  emitter.emit('error', eventData);
                  isFinish = true;
                } else if (method === 'ExtrinsicSuccess') {
                  emitter.emit('success', eventData);
                  isFinish = true;
                }
              });
          }
        }
      }).catch((e: Error) => {
        eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED, e.message));
        emitter.emit('error', eventData);
      });
    }).catch((e: Error) => {
      this.removeTransaction(id);
      eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SIGN, e.message));
      emitter.emit('error', eventData);
    });

    return emitter;
  }

  private signAndSendTonTransaction ({ address, chain, extrinsicType, id, step, transaction, url }: SWTransaction): TransactionEmitter {
    const walletContract = keyring.getPair(address).ton.currentContract;
    const emitter = new EventEmitter<TransactionEventMap>();
    const eventData: TransactionEventResponse = {
      id,
      errors: [],
      warnings: [],
      extrinsicHash: id,
      processId: step?.processId
    };

    const payload = transaction as TonTransactionConfig;

    const signer = (message: Cell): Promise<Buffer> => {
      return new Promise<Buffer>((resolve) => {
        this.state.requestService.addConfirmationTon(id, url || EXTENSION_REQUEST_URL, 'tonSendTransactionRequest', { ...payload, messagePayload: cellToBase64Str(message), messages: [] }, {})
          .then(({ isApproved, payload }) => {
            if (!isApproved) {
              this.removeTransaction(id);
              eventData.errors.push(new TransactionError(BasicTxErrorType.USER_REJECT_REQUEST));
              emitter.emit('error', eventData);
            } else {
              if (!payload) {
                throw new Error('Bad signature');
              }

              resolve(Buffer.from(hexToU8a(payload)));
            }
          })
          .catch((e: Error) => {
            this.removeTransaction(id);
            eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SIGN, t(e.message)));

            emitter.emit('error', eventData);
          });
      });
    };

    const tonTransactionConfig = transaction as TonTransactionConfig; // todo: is this same as payload?
    const seqno = tonTransactionConfig.seqno;
    const messages = tonTransactionConfig.messages;

    const transferObjectPromise = getTransferCellPromise(walletContract, signer, payload, seqno, messages);

    transferObjectPromise.then((tx) => {
      // Emit signed event
      emitter.emit('signed', eventData);
      const boc = externalMessage(walletContract, seqno, tx).toBoc().toString('base64');

      this.handleTransactionTimeout(emitter, eventData);
      emitter.emit('send', eventData); // This event is needed after sending transaction with queue

      const tonApi = this.state.chainService.getTonApi(chain);

      tonApi.sendTonTransaction(boc).then((externalMsgHash) => { // the externalMsgHash is the hash of first message, not the hash of transaction.
        if (!externalMsgHash) {
          return;
        }

        tonApi.getStatusByExtMsgHash(externalMsgHash, extrinsicType).then(([status, hex]) => {
          if (status && hex) {
            eventData.extrinsicHash = hex;
            emitter.emit('extrinsicHash', eventData);
            emitter.emit('success', eventData);
          }

          if (!status && hex) {
            eventData.extrinsicHash = hex;
            emitter.emit('extrinsicHash', eventData);
            eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED));
            emitter.emit('error', eventData);
          }
        }).catch((e: Error) => {
          eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED, e.message));
          emitter.emit('error', eventData);
        });

        // todo: handle status of externalMsgHash
      }).catch((e: Error) => {
        eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED, e.message));
        emitter.emit('error', eventData);
      });
    }).catch((e: Error) => {
      this.removeTransaction(id);
      eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SIGN, e.message));
      emitter.emit('error', eventData);
    });

    return emitter;
  }

  private signAndSendCardanoTransaction ({ chain, id, transaction, url }: SWTransaction): TransactionEmitter {
    const emitter = new EventEmitter<TransactionEventMap>();
    const eventData: TransactionEventResponse = {
      id,
      errors: [],
      warnings: [],
      extrinsicHash: id
    };

    const transactionConfig = transaction as CardanoTransactionConfig;
    const cardanoApi = this.state.chainService.getCardanoApi(chain);

    this.state.requestService.addConfirmationCardano(id, url || EXTENSION_REQUEST_URL, 'cardanoSendTransactionRequest', transactionConfig, {})
      .then(({ isApproved, payload }) => {
        if (!isApproved) {
          this.removeTransaction(id);
          eventData.errors.push(new TransactionError(BasicTxErrorType.USER_REJECT_REQUEST));
          emitter.emit('error', eventData);
        } else {
          if (!payload) {
            throw new Error('Failed to sign');
          }

          // Emit signed event
          emitter.emit('signed', eventData);

          // Send transaction
          this.handleTransactionTimeout(emitter, eventData);
          emitter.emit('send', eventData);

          // send qua api
          cardanoApi.sendCardanoTxReturnHash(payload)
            .then((txHash) => {
              if (!txHash) {
                eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED));
                emitter.emit('error', eventData);
              }

              eventData.extrinsicHash = txHash;
              emitter.emit('extrinsicHash', eventData);

              // todo: wait transaction by fetch txHash by API
              cardanoApi.getStatusByTxHash(txHash, transactionConfig.cardanoTtlOffset).then((status) => {
                if (!status) {
                  eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED));
                  emitter.emit('error', eventData);
                }

                emitter.emit('success', eventData);
              })
                .catch((e: Error) => {
                  eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED, e.message));
                  emitter.emit('error', eventData);
                });
            })
            .catch((e: Error) => {
              eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED, e.message));
              emitter.emit('error', eventData);
            });
        }
      })
      .catch((e: Error) => {
        this.removeTransaction(id);
        eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SIGN, t(e.message)));

        emitter.emit('error', eventData);
      });

    return emitter;
  }

  // Use this for bitcoin transactions only
  public emitterEventTransaction = (emitter: TransactionEmitter, eventData: TransactionEventResponse, chain: string, payload: string) => {
    // Emit signed event
    emitter.emit('signed', eventData);
    // Add start info
    emitter.emit('send', eventData);

    const event = this.state.chainService.getBitcoinApi(chain).api.sendRawTransaction(payload);

    event.on('extrinsicHash', (txHash) => {
      eventData.extrinsicHash = txHash;
      emitter.emit('extrinsicHash', eventData);
    });

    event.on('success', (transactionStatus) => {
      console.log(transactionStatus);
      eventData.blockHash = transactionStatus.block_hash || undefined;
      eventData.blockNumber = transactionStatus.block_height || undefined;
      eventData.blockTime = transactionStatus.block_time ? (transactionStatus.block_time * 1000) : undefined;
      emitter.emit('success', eventData);
    });

    event.on('error', (error) => {
      eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SEND, error));
      emitter.emit('error', eventData);
    });
  };

  private signAndSendBitcoinTransaction ({ address, chain, id, transaction, url }: SWTransaction): TransactionEmitter {
    const tx = transaction as Psbt;
    // const bitcoinApi = this.state.chainService.getBitcoinApi(chain);
    // const chainInfo = this.state.chainService.getChainInfoByKey(chain);

    const accountPair = keyring.getPair(address);
    const account: AccountJson = pairToAccount(accountPair);

    const payload: BitcoinSignatureRequest = {
      payload: undefined,
      payloadJson: undefined,
      address,
      canSign: true,
      hashPayload: tx.toHex(),
      id
    };

    const emitter = new EventEmitter<TransactionEventMap>();

    const eventData: TransactionEventResponse = {
      id,
      errors: [],
      warnings: [],
      extrinsicHash: id
    };

    const isInjected = !!account.isInjected;
    // const isExternal = !!account.isExternal;

    if (isInjected) {
      throw new TransactionError(BasicTxErrorType.UNSUPPORTED);
    } else {
      this.state.requestService.addConfirmationBitcoin(id, url || EXTENSION_REQUEST_URL, 'bitcoinSendTransactionRequest', payload, {})
        .then(({ isApproved, payload }) => {
          if (isApproved) {
            if (!payload) {
              throw new Error('Bad signature');
            }

            // Emit signed event
            emitter.emit('signed', eventData);
            // Add start info
            emitter.emit('send', eventData);
            const bitcoinApi = this.state.chainService.getBitcoinApi(chain);
            const event = bitcoinApi.api.sendRawTransaction(payload);

            event.on('extrinsicHash', (txHash) => {
              eventData.extrinsicHash = txHash;
              emitter.emit('extrinsicHash', eventData);
            });

            event.on('success', (transactionStatus) => {
              eventData.blockHash = transactionStatus.block_hash || undefined;
              eventData.blockNumber = transactionStatus.block_height || undefined;
              eventData.blockTime = transactionStatus.block_time ? (transactionStatus.block_time * 1000) : undefined;
              emitter.emit('success', eventData);
            });

            event.on('error', (error) => {
              eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SEND, error));
              emitter.emit('error', eventData);
            });
          } else {
            this.removeTransaction(id);
            eventData.errors.push(new TransactionError(BasicTxErrorType.USER_REJECT_REQUEST));
            emitter.emit('error', eventData);
          }
        })
        .catch((e: Error) => {
          this.removeTransaction(id);
          eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SIGN, e.message));
          emitter.emit('error', eventData);
        });
    }

    return emitter;
  }

  private handleTransactionTimeout (emitter: EventEmitter<TransactionEventMap>, eventData: TransactionEventResponse): void {
    const timeout = setTimeout(() => {
      const transaction = this.getTransaction(eventData.id);

      if (transaction.status !== ExtrinsicStatus.SUCCESS && transaction.status !== ExtrinsicStatus.FAIL) {
        eventData.errors.push(new TransactionError(BasicTxErrorType.TIMEOUT, t('bg.TRANSACTION_SERVICE.services.service.transaction.transactionTimeout')));
        emitter.emit('timeout', eventData);
        clearTimeout(timeout);
      }
    }, TRANSACTION_TIMEOUT);

    emitter.once('success', () => {
      clearTimeout(timeout);
    });

    emitter.once('error', () => {
      clearTimeout(timeout);
    });
  }

  private handlePostEarningTransaction (id: string) {
    const transaction = this.getTransaction(id);

    let slug: string;

    // TODO
    if ('data' in transaction.data) {
      slug = (transaction.data as RequestYieldStepSubmit).data.slug;
    } else {
      slug = (transaction.data as RequestStakePoolingBonding).slug;
    }

    const poolHandler = this.state.earningService.getPoolHandler(slug);

    if (poolHandler) {
      const type = poolHandler.type;

      if (type === YieldPoolType.NATIVE_STAKING) {
        return;
      }
    } else {
      return;
    }

    this.state.mintCampaignService.unlockDotCampaign.mintNft({
      transactionId: id,
      address: transaction.address,
      slug: slug,
      network: transaction.chain,
      extrinsicHash: transaction.extrinsicHash
    })
      .catch(console.error);
  }

  public async createProcessIfNeed (process: ProcessTransactionData) {
    if (!this.aliveProcessMap.has(process.id)) {
      this.aliveProcessMap.set(process.id, process);

      this.updateAliveProcess();
      await this.state.dbService.upsertProcessTransaction(process);
    }
  }

  public checkProcessExist (processId: string) {
    return this.aliveProcessMap.has(processId);
  }

  private deleteProcess (step: BriefProcessStep) {
    const { processId } = step;

    this.aliveProcessMap.delete(processId);
    this.state.dbService.deleteProcessTransactionById(processId).catch(console.error);

    this.updateAliveProcess();
  }

  // Q&A: Check more about process step status, if it related to one-signing?
  // A: Aggregate multiple transactions into one process, each process has multiple steps, each step has its own status. When updating the status of a step, it will affect the status of the entire process.
  public updateProcessStepStatus (step: BriefProcessStep, data: Pick<ProcessStep, 'status' | 'transactionId' | 'extrinsicHash' | 'chain'>) {
    const { processId, stepId } = step;
    const process = this.aliveProcessMap.get(processId);

    if (process) {
      const step = process.steps.find((item) => item.id === stepId);

      if (step) {
        Object.assign(step, data);

        if ([StepStatus.PREPARE || StepStatus.PROCESSING].includes(step.status)) {
          process.currentStepId = step.id;
        }

        if (step.status === StepStatus.COMPLETE) {
          const nextStep = process.steps.find((item) => item.id === stepId + 1);

          if (nextStep) {
            nextStep.status = StepStatus.PREPARE;
            process.currentStepId = nextStep.id;
          }
        } else if ([StepStatus.FAILED, StepStatus.TIMEOUT].includes(step.status)) {
          const nextSteps = process.steps.filter((item) => item.id > stepId);

          nextSteps.forEach((item) => {
            item.status = StepStatus.CANCELLED;
          });
        }
      }

      if (process.steps.some((item) => [StepStatus.PROCESSING, StepStatus.SUBMITTING].includes(item.status))) {
        process.status = StepStatus.PROCESSING;
      }

      if (process.steps.some((item) => item.status === StepStatus.TIMEOUT)) {
        process.status = StepStatus.TIMEOUT;
      }

      if (process.steps.every((item) => item.status === StepStatus.COMPLETE)) {
        const lastStep = process.steps[process.steps.length - 1];

        process.lastTransactionChain = lastStep.chain;
        process.lastTransactionId = lastStep.transactionId;
        process.status = StepStatus.COMPLETE;
      }

      if (process.steps.some((item) => item.status === StepStatus.FAILED)) {
        process.status = StepStatus.FAILED;
      }

      this.aliveProcessMap.set(processId, process);
      this.state.dbService.upsertProcessTransaction(process).catch(console.error);

      if ([StepStatus.COMPLETE, StepStatus.FAILED, StepStatus.TIMEOUT].includes(process.status)) {
        this.aliveProcessMap.delete(processId);
      }

      this.updateAliveProcess();
    } else {
      this.state.dbService.getProcessTransactionById(processId)
        .then((process) => {
          if (process) {
            const step = process.steps.find((item) => item.id === stepId);

            if (step && step.status === StepStatus.TIMEOUT && [StepStatus.COMPLETE, StepStatus.FAILED].includes(data.status)) {
              Object.assign(step, data);

              const isLastStep = process.steps[process.steps.length - 1].id = stepId;

              if (isLastStep) {
                process.status = data.status;
              }

              this.state.dbService.upsertProcessTransaction(process).catch(console.error);
            }
          }
        })
        .catch(console.error);
    }
  }

  public async updateProcessInfo (id: string, combineInfo: unknown, step?: ProcessStep) {
    const process = this.aliveProcessMap.get(id);

    if (process) {
      if (step) {
        const index = process.steps.findIndex((item) => item.id === step?.id);

        if (index !== -1) {
          process.steps[index] = step;
        }
      }

      if (combineInfo) {
        process.combineInfo = combineInfo;
      }

      this.aliveProcessMap.set(process.id, process);
      this.updateAliveProcess();
      await this.state.dbService.upsertProcessTransaction(process);
    }
  }

  public async createProcessNotification (transactionId: string) {
    const transaction = this.getTransaction(transactionId);

    if (transaction && transaction.step?.processId) {
      const process = this.aliveProcessMap.get(transaction.step.processId);

      if (process) {
        await this.state.inappNotificationService.createProcessNotification(process);
      }
    }
  }

  public resetWallet (): void {
    this.transactionSubject.next({});
  }
}
