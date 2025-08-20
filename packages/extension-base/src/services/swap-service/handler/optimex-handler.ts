// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import {SwapBaseHandler, SwapBaseInterface} from "@subwallet/extension-base/services/swap-service/handler/base-handler";
import {SwapProviderId} from "@subwallet/extension-base/types";
import {ChainService} from "@subwallet/extension-base/services/chain-service";
import {BalanceService} from "@subwallet/extension-base/services/balance-service";
import FeeService from "@subwallet/extension-base/services/fee-service/service";

export class OptimexHandler implements SwapBaseInterface {
  private readonly isTestnet: boolean;
  private swapBaseHandler: SwapBaseHandler;
  providerSlug: SwapProviderId;

  constructor (chainService: ChainService, balanceService: BalanceService, feeService: FeeService, isTestnet = true) {
    this.swapBaseHandler = new SwapBaseHandler({
      chainService,
      balanceService,
      feeService,
      providerName: isTestnet ? 'Optimex Testnet' : 'Optimex',
      providerSlug: isTestnet ? SwapProviderId.O
    })
  }
}
