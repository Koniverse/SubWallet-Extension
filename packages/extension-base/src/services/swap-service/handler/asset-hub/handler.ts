// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import FeeService from '@subwallet/extension-base/services/fee-service/service';
import { DEFAULT_EXCESS_AMOUNT_WEIGHT, getAmountAfterSlippage } from '@subwallet/extension-base/services/swap-service/utils';
import { BaseStepDetail, BaseSwapStepMetadata, BasicTxErrorType, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, DynamicSwapType, GenSwapStepFuncV2, OptimalSwapPathParamsV2, SwapBaseTxData, SwapErrorType, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { _reformatAddressWithChain } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';

import { SwapBaseHandler, SwapBaseInterface } from '../base-handler';
import { AssetHubRouter } from './router';

export class AssetHubSwapHandler implements SwapBaseInterface {
  private swapBaseHandler: SwapBaseHandler;
  private readonly chain: string;
  private router: AssetHubRouter | undefined;
  isReady = false;
  providerSlug: SwapProviderId;

  constructor (chainService: ChainService, balanceService: BalanceService, feeService: FeeService, chain: string) {
    const chainInfo = chainService.getChainInfoByKey(chain);
    const providerSlug: SwapProviderId = (function () {
      switch (chain) {
        case 'statemint':
          return SwapProviderId.POLKADOT_ASSET_HUB;
        case 'statemine':
          return SwapProviderId.KUSAMA_ASSET_HUB;
        case 'westend_assethub':
          return SwapProviderId.WESTEND_ASSET_HUB;
        default:
          return SwapProviderId.ROCOCO_ASSET_HUB;
      }
    }());

    this.swapBaseHandler = new SwapBaseHandler({
      balanceService,
      chainService,
      providerName: chainInfo.name,
      providerSlug,
      feeService
    });

    this.providerSlug = providerSlug;
    this.chain = chain;
  }

  get chainService () {
    return this.swapBaseHandler.chainService;
  }

  get balanceService () {
    return this.swapBaseHandler.balanceService;
  }

  get providerInfo () {
    return this.swapBaseHandler.providerInfo;
  }

  get name () {
    return this.swapBaseHandler.name;
  }

  get slug () {
    return this.swapBaseHandler.slug;
  }

  public async init (): Promise<void> {
    const chainState = this.chainService.getChainStateByKey(this.chain);

    if (!chainState.active) {
      await this.chainService.enableChain(this.chain);
    }

    this.router = new AssetHubRouter(this.chain, this.chainService);

    this.isReady = true;
  }

  async getSubmitStep (params: OptimalSwapPathParamsV2, stepIndex: number): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    const { path, request: { address, alternativeAddress, fromAmount, recipient }, selectedQuote } = params;
    const stepData = path[stepIndex];

    if (stepData.action !== DynamicSwapType.SWAP) {
      return Promise.resolve(undefined);
    }

    const swapPairInfo = stepData.pair;

    if (!swapPairInfo || !selectedQuote) {
      return Promise.resolve(undefined);
    }

    const originTokenInfo = this.chainService.getAssetBySlug(swapPairInfo.from);
    const destinationTokenInfo = this.chainService.getAssetBySlug(swapPairInfo.to);
    const originChain = this.chainService.getChainInfoByKey(originTokenInfo.originChain);
    const destinationChain = this.chainService.getChainInfoByKey(destinationTokenInfo.originChain);

    const actionList = JSON.stringify(path.map((step) => step.action));
    const xcmSwapXcm = actionList === JSON.stringify([DynamicSwapType.BRIDGE, DynamicSwapType.SWAP, DynamicSwapType.BRIDGE]);
    const swapXcm = actionList === JSON.stringify([DynamicSwapType.SWAP, DynamicSwapType.BRIDGE]);
    const needModifyData = swapXcm || xcmSwapXcm;

    let bnSendingValue = BigN(fromAmount);
    let bnExpectedReceive = BigN(selectedQuote.toAmount);
    const sender = _reformatAddressWithChain(address, originChain, alternativeAddress);
    let receiver = _reformatAddressWithChain(recipient || address, destinationChain);

    if (needModifyData) {
      bnSendingValue = bnSendingValue.multipliedBy(DEFAULT_EXCESS_AMOUNT_WEIGHT);
      bnExpectedReceive = bnExpectedReceive.multipliedBy(DEFAULT_EXCESS_AMOUNT_WEIGHT);
      receiver = _reformatAddressWithChain(address, destinationChain, alternativeAddress);
    }

    const submitStep: BaseStepDetail = {
      name: 'Swap',
      type: SwapStepType.SWAP,
      // @ts-ignore
      metadata: {
        sendingValue: bnSendingValue.toFixed(0, 1),
        expectedReceive: bnExpectedReceive.toFixed(0, 1),
        originTokenInfo,
        destinationTokenInfo,
        sender,
        receiver,
        version: 2
      } as unknown as BaseSwapStepMetadata
    };

    return Promise.resolve([submitStep, selectedQuote.feeInfo]);
  }

  generateOptimalProcessV2 (params: OptimalSwapPathParamsV2): Promise<CommonOptimalSwapPath> {
    const stepFuncList: GenSwapStepFuncV2[] = params.path.map((step) => {
      if (step.action === DynamicSwapType.SWAP) {
        return this.getSubmitStep.bind(this);
      }

      if (step.action === DynamicSwapType.BRIDGE) {
        return this.swapBaseHandler.getBridgeStep.bind(this.swapBaseHandler);
      }

      throw new Error(`Error generating optimal process: Action ${step.action as string} is not supported`);
    });

    return this.swapBaseHandler.generateOptimalProcessV2(params, stepFuncList);
  }

  async handleSubmitStep (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const metadata = params.process.steps[params.currentStep].metadata as unknown as BaseSwapStepMetadata;

    if (!metadata || !metadata.sendingValue || !metadata.destinationTokenInfo || !metadata.originTokenInfo) {
      return new SwapError(SwapErrorType.UNKNOWN) as unknown as SwapSubmitStepData;
    }

    const fromAsset = metadata.originTokenInfo;

    const txData: SwapBaseTxData = {
      provider: this.providerInfo,
      quote: params.quote,
      address: params.address,
      slippage: params.slippage,
      process: params.process
    };

    const paths = params.quote.route.path.map((slug) => this.chainService.getAssetBySlug(slug));
    const minReceive = BigN(getAmountAfterSlippage(metadata.expectedReceive, params.slippage));

    if (!params.address || !paths || !minReceive) {
      throw new SwapError(SwapErrorType.UNKNOWN);
    }

    const extrinsic = await this.router?.buildSwapExtrinsic(paths, params.address, metadata.sendingValue, minReceive.toString());

    return {
      txChain: fromAsset.originChain,
      txData,
      extrinsic,
      transferNativeAmount: _isNativeToken(fromAsset) ? params.quote.fromAmount : '0', // todo
      extrinsicType: ExtrinsicType.SWAP,
      chainType: ChainType.SUBSTRATE
    } as SwapSubmitStepData;
  }

  handleSwapProcess (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const { currentStep, process } = params;
    const type = process.steps[currentStep].type;

    switch (type) {
      case CommonStepType.XCM:
        return this.swapBaseHandler.handleBridgeStep(params, 'xcm');
      case SwapStepType.SWAP:
        return this.handleSubmitStep(params);
      default:
        return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }
  }

  public async validateSwapProcessV2 (params: ValidateSwapProcessParams): Promise<TransactionError[]> {
    // todo: recheck address and recipient format in params
    const { process, selectedQuote } = params; // todo: review flow, currentStep param.

    // todo: validate path with optimalProcess
    // todo: review error message in case many step swap
    if (BigN(selectedQuote.fromAmount).lte(0)) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Amount must be greater than 0')];
    }

    const actionList = JSON.stringify(process.path.map((step) => step.action));
    const swap = actionList === JSON.stringify([DynamicSwapType.SWAP]);
    const swapXcm = actionList === JSON.stringify([DynamicSwapType.SWAP, DynamicSwapType.BRIDGE]);
    const xcmSwap = actionList === JSON.stringify([DynamicSwapType.BRIDGE, DynamicSwapType.SWAP]);
    const xcmSwapXcm = actionList === JSON.stringify([DynamicSwapType.BRIDGE, DynamicSwapType.SWAP, DynamicSwapType.BRIDGE]);

    if (swap) {
      return this.swapBaseHandler.validateSwapOnlyProcess(params, 1); // todo: create interface for input request
    }

    if (swapXcm) {
      return this.swapBaseHandler.validateSwapXcmProcess(params, 1, 2);
    }

    if (xcmSwap) {
      return this.swapBaseHandler.validateXcmSwapProcess(params, 2, 1);
    }

    if (xcmSwapXcm) {
      return this.swapBaseHandler.validateXcmSwapXcmProcess(params, 2, 1, 3);
    }

    return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
  }
}
