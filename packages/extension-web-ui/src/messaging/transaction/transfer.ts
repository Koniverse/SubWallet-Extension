// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AmountData, RequestMaxTransferable } from '@subwallet/extension-base/background/KoniTypes';
import { RequestOptimalTransferProcess } from '@subwallet/extension-base/services/balance-service/helpers';
import { TokenPayFeeInfo } from '@subwallet/extension-base/services/fee-service/interfaces';
import { BitcoinTransactionData, SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { CommonOptimalTransferPath, RequestCrossChainTransfer, RequestGetAmountForPair, RequestGetTokensCanPayFee, TokenSpendingApprovalParams } from '@subwallet/extension-base/types';
import { RequestSubmitSignPsbtTransfer, RequestSubmitTransfer, RequestSubmitTransferWithId, RequestSubscribeTransfer, ResponseSubscribeTransfer, ResponseSubscribeTransferConfirmation } from '@subwallet/extension-base/types/balance/transfer';

import { sendMessage } from '../base';

export async function makeTransfer (request: RequestSubmitTransfer): Promise<SWTransactionResponse> {
  return sendMessage('pri(accounts.transfer)', request);
}

export async function makeBitcoinDappTransferConfirmation (request: RequestSubmitTransferWithId): Promise<SWTransactionResponse> {
  return sendMessage('pri(accounts.bitcoin.dapp.transfer.confirmation)', request);
}

export async function makePSBTTransferAfterConfirmation (request: RequestSubmitSignPsbtTransfer): Promise<SWTransactionResponse> {
  return sendMessage('pri(accounts.psbt.transfer.confirmation)', request);
}

export async function makeCrossChainTransfer (request: RequestCrossChainTransfer): Promise<SWTransactionResponse> {
  return sendMessage('pri(accounts.crossChainTransfer)', request);
}

export async function getBitcoinTransactionData (request: RequestSubmitTransfer): Promise<BitcoinTransactionData> {
  return sendMessage('pri(accounts.getBitcoinTransactionData)', request);
}

export async function approveSpending (request: TokenSpendingApprovalParams): Promise<SWTransactionResponse> {
  return sendMessage('pri(accounts.approveSpending)', request);
}

export async function getMaxTransfer (request: RequestMaxTransferable): Promise<AmountData> {
  return sendMessage('pri(transfer.getMaxTransferable)', request);
}

export async function subscribeMaxTransfer (request: RequestSubscribeTransfer, callback: (data: ResponseSubscribeTransfer) => void): Promise<ResponseSubscribeTransfer> {
  return sendMessage('pri(transfer.subscribe)', request, callback);
}

export async function getOptimalTransferProcess (request: RequestOptimalTransferProcess): Promise<CommonOptimalTransferPath> {
  return sendMessage('pri(accounts.getOptimalTransferProcess)', request);
}

export async function getTokensCanPayFee (request: RequestGetTokensCanPayFee): Promise<TokenPayFeeInfo> { // can set a default fee to ED of native token
  return sendMessage('pri(customFee.getTokensCanPayFee)', request);
}

export async function subscribeTransferWhenConfirmation (request: RequestSubscribeTransfer, callback: (data: ResponseSubscribeTransferConfirmation) => void): Promise<ResponseSubscribeTransferConfirmation> {
  return sendMessage('pri(transfer.confirmation.subscribe)', request, callback);
}

export async function getAmountForPair (request: RequestGetAmountForPair): Promise<string> {
  return sendMessage('pri(customFee.getAmountForPair)', request);
}
