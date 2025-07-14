// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { BitcoinFeeDetail, BitcoinFeeInfo, BitcoinFeeRate } from '@subwallet/extension-base/types';
import { BehaviorSubject } from 'rxjs';

import { CardanoFeeDetail, CardanoFeeInfo, CardanoTipInfo } from './cardano';
import { EvmEIP1559FeeOption, EvmFeeDetail, EvmFeeInfo } from './evm';
import { SubstrateFeeDetail, SubstrateFeeInfo, SubstrateTipInfo } from './substrate';
import { TonFeeDetail, TonFeeInfo, TonTipInfo } from './ton';

export type FeeInfo = EvmFeeInfo | SubstrateFeeInfo | TonFeeInfo | CardanoFeeInfo | BitcoinFeeInfo;
export type FeeDetail = EvmFeeDetail | SubstrateFeeDetail | TonFeeDetail | CardanoFeeDetail | BitcoinFeeDetail;
export type FeeCustom = EvmEIP1559FeeOption | SubstrateTipInfo | TonTipInfo | CardanoTipInfo | BitcoinFeeRate;

export interface FeeSubscription {
  observer: BehaviorSubject<FeeInfo | undefined>;
  subscription: Record<string, VoidFunction>;
  unsubscribe: VoidFunction;
}
