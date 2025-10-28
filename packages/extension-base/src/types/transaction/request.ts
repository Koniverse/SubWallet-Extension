// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionFee } from '../fee';
import { TransactionWarningType } from './warning';

export type BaseRequestSign = {
  ignoreWarnings?: TransactionWarningType[];
  substrateProxyAddress?: string;
};

export type InternalRequestSign<T> = T & BaseRequestSign;

export interface RequestBaseTransfer {
  from: string;
  to: string;
  tokenSlug: string;
  value?: string;
  transferAll?: boolean;
  transferBounceable?: boolean;
  isPassConfirmation?: boolean;
}

export interface RequestCheckTransfer extends RequestBaseTransfer, TransactionFee {
  networkKey: string,
}

export type RequestTransfer = InternalRequestSign<RequestCheckTransfer>;

export interface RequestCheckCrossChainTransfer extends RequestBaseTransfer, TransactionFee {
  value: string;
  originNetworkKey: string,
  destinationNetworkKey: string,
  showExtraWarning?: boolean,
  metadata?: AcrossMetadata
}

interface AcrossMetadata {
  amountOut: string;
  destChainSlug: string;
  rate: string;
}

export type RequestCrossChainTransfer = InternalRequestSign<RequestCheckCrossChainTransfer>;

export interface RequestGetTokensCanPayFee {
  address: string;
  chain: string;
  feeAmount?: string;
}

export interface RequestGetAmountForPair {
  nativeTokenFeeAmount: string,
  nativeTokenSlug: string,
  toTokenSlug: string
}
