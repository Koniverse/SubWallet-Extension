// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { fetchBlockedConfigObjects, fetchLatestBlockedActionsAndFeatures, getPassConfigId } from '@subwallet/extension-base/constants';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { ServiceStatus, StoppableServiceInterface } from '@subwallet/extension-base/services/base/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _getAssetOriginChain } from '@subwallet/extension-base/services/chain-service/utils';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { AssetHubSwapHandler } from '@subwallet/extension-base/services/swap-service/handler/asset-hub';
import { SwapBaseInterface } from '@subwallet/extension-base/services/swap-service/handler/base-handler';
import { ChainflipSwapHandler } from '@subwallet/extension-base/services/swap-service/handler/chainflip-handler';
import { HydradxHandler } from '@subwallet/extension-base/services/swap-service/handler/hydradx-handler';
import { OptimexHandler } from '@subwallet/extension-base/services/swap-service/handler/optimex-handler';
import { getSwapAltToken, getTokenPairFromStep, processStepsToPathActions, SWAP_QUOTE_TIMEOUT_MAP } from '@subwallet/extension-base/services/swap-service/utils';
import { BasicTxErrorType, DynamicSwapAction, DynamicSwapType, OptimalSwapPathParamsV2, SwapRequestV2, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { CommonOptimalSwapPath, DEFAULT_FIRST_STEP, MOCK_STEP_FEE } from '@subwallet/extension-base/types/service-base';
import { _SUPPORTED_SWAP_PROVIDERS, ProcessedQuoteAskResponse, SwapErrorType, SwapPair, SwapProviderId, SwapQuote, SwapQuoteResponse, SwapRequestResult, SwapStepType, SwapSubmitParams, SwapSubmitStepData } from '@subwallet/extension-base/types/swap';
import { _reformatAddressWithChain, createPromiseHandler, PromiseHandler } from '@subwallet/extension-base/utils';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';
import { SwapPath } from '@subwallet-monorepos/subwallet-services-sdk/services';
import BigN from 'bignumber.js';
import { t } from 'i18next';
import { BehaviorSubject } from 'rxjs';

import { KyberHandler } from './handler/kyber-handler';
import { SimpleSwapHandler } from './handler/simpleswap-handler';
import { UniswapHandler, UniswapMetadata } from './handler/uniswap-handler';

export class SwapService implements StoppableServiceInterface {
  protected readonly state: KoniState;
  private eventService: EventService;
  private readonly chainService: ChainService;
  private swapPairSubject: BehaviorSubject<SwapPair[]> = new BehaviorSubject<SwapPair[]>([]);
  private handlers: Record<string, SwapBaseInterface> = {};

  startPromiseHandler: PromiseHandler<void> = createPromiseHandler();
  stopPromiseHandler: PromiseHandler<void> = createPromiseHandler();
  status: ServiceStatus = ServiceStatus.NOT_INITIALIZED;

  constructor (state: KoniState) {
    this.state = state;
    this.eventService = state.eventService;
    this.chainService = state.chainService;
  }

  private async askProvidersForQuote (_request: SwapRequestV2) {
    const availableQuotes: ProcessedQuoteAskResponse[] = [];

    // hotfix // todo: remove later
    const request = {
      ..._request,
      isSupportKyberVersion: true
    };

    try {
      const quotes = await subwalletApiSdk.swapApi.fetchSwapQuoteData(request);

      if (Array.isArray(quotes)) {
        quotes.forEach((quoteData) => {
          if (!_SUPPORTED_SWAP_PROVIDERS.includes(quoteData.provider)) {
            return;
          }

          if (!quoteData.quote || Object.keys(quoteData.quote).length === 0) {
            return;
          }

          if (!('errorClass' in quoteData.quote)) {
            availableQuotes.push({
              quote: quoteData.quote as SwapQuote | undefined
            });
          } else {
            availableQuotes.push({
              error: new SwapError(
                quoteData.quote.errorType as SwapErrorType,
                quoteData.quote.message
              )
            });
          }
        });
      }
    } catch (err) {
      availableQuotes.push({
        error: new SwapError(SwapErrorType.ASSET_NOT_SUPPORTED)
      });
    }

    return availableQuotes;
  }

  private getDefaultProcessV2 (params: OptimalSwapPathParamsV2): CommonOptimalSwapPath {
    const result: CommonOptimalSwapPath = {
      totalFee: [MOCK_STEP_FEE],
      steps: [DEFAULT_FIRST_STEP],
      path: []
    };

    const swapPairInfo = params.path.find((action) => action.action === DynamicSwapType.SWAP);

    if (!swapPairInfo) {
      console.error('Swap pair is not found');

      return result;
    }

    result.totalFee.push({
      feeComponent: [],
      feeOptions: [params.request.pair.from],
      defaultFeeToken: params.request.pair.from
    });
    result.steps.push({
      id: result.steps.length,
      name: 'Swap',
      type: SwapStepType.SWAP,
      metadata: {
        sendingValue: params.request.fromAmount.toString(),
        originTokenInfo: this.chainService.getAssetBySlug(swapPairInfo.pair.from),
        destinationTokenInfo: this.chainService.getAssetBySlug(swapPairInfo.pair.to)
      }
    });

    return result;
  }

  public async generateOptimalProcessV2 (params: OptimalSwapPathParamsV2): Promise<CommonOptimalSwapPath> {
    if (!params.selectedQuote) {
      return this.getDefaultProcessV2(params);
    } else {
      const providerId = params.request.currentQuote?.id || params.selectedQuote.provider.id;
      const handler = this.handlers[providerId];

      if (handler) {
        return handler.generateOptimalProcessV2(params);
      } else {
        return this.getDefaultProcessV2(params);
      }
    }
  }

  public async handleSwapRequestV2 (request: SwapRequestV2): Promise<SwapRequestResult> {
    /*
    * 1. Find available path
    * 2. Ask swap quotes from providers
    * 3. Select the best quote
    * 4. Generate optimal process for that quote
    * */

    const { path, swapQuoteResponse } = await this.getLatestQuoteFromSwapRequest(request);

    console.group('Swap Logger');
    console.log('path', path);
    console.log('swapQuoteResponse', swapQuoteResponse);

    if (swapQuoteResponse.optimalQuote && swapQuoteResponse.optimalQuote.metadata) {
      const routing = (swapQuoteResponse.optimalQuote.metadata as UniswapMetadata).routing;

      if (routing) {
        console.log('Uniswap routing', routing);
      }
    }

    let optimalProcess;

    try {
      optimalProcess = await this.generateOptimalProcessV2({
        request,
        selectedQuote: swapQuoteResponse.optimalQuote,
        path
      });
    } catch (e) {
      throw new Error((e as Error).message);
    }

    if (swapQuoteResponse.error) {
      return {
        process: optimalProcess,
        quote: swapQuoteResponse
      };
    }

    console.log('optimalProcess', optimalProcess);
    console.groupEnd();

    if (JSON.stringify(processStepsToPathActions(optimalProcess.steps)) !== JSON.stringify(optimalProcess.path.map((e) => e.action))) {
      throw new Error('Swap pair is not found');
    }

    return {
      process: optimalProcess,
      quote: swapQuoteResponse
    };
  }

  public async getLatestQuoteFromSwapRequest (request: SwapRequestV2): Promise<{path: DynamicSwapAction[], swapQuoteResponse: SwapQuoteResponse}> {
    let availablePath: SwapPath | undefined;

    try {
      availablePath = await subwalletApiSdk.swapApi.findAvailablePath(request);
    } catch (e) {
      console.log('Error findAvailablePath', e);
    }

    if (!availablePath) {
      return {
        path: [],
        swapQuoteResponse: {
          quotes: [],
          aliveUntil: Date.now() + SWAP_QUOTE_TIMEOUT_MAP.error,
          error: new SwapError(SwapErrorType.ERROR_FETCHING_QUOTE)
        }
      };
    }

    const { path } = availablePath;

    const swapAction = path.find((step) => step.action === DynamicSwapType.SWAP);

    const directSwapRequest: SwapRequestV2 | undefined = swapAction
      ? { ...request,
        address: _reformatAddressWithChain(request.address, this.chainService.getChainInfoByKey(_getAssetOriginChain(this.chainService.getAssetBySlug(swapAction.pair.from)))),
        pair: swapAction.pair }
      : undefined;

    if (!directSwapRequest) {
      throw Error('Swap pair is not found');
    }

    if (path.length > 1 && path.map((action) => action.action).includes(DynamicSwapType.BRIDGE)) {
      directSwapRequest.isCrossChain = true;
    }

    const swapQuoteResponse = await this.getLatestDirectQuotes(directSwapRequest);

    return {
      path,
      swapQuoteResponse
    };
  }

  private async getLatestDirectQuotes (request: SwapRequestV2): Promise<SwapQuoteResponse> {
    // request.pair.metadata = this.getSwapPairMetadata(request.pair.slug); // deprecated
    const quoteAskResponses = await this.askProvidersForQuote(request);

    // todo: handle error to return back to UI
    // todo: more logic to select the best quote

    const availableQuotes = quoteAskResponses.filter((quote) => !quote.error).map((quote) => quote.quote as SwapQuote);
    let quoteError: SwapError | undefined;
    let selectedQuote: SwapQuote | undefined;
    let aliveUntil = (+Date.now() + SWAP_QUOTE_TIMEOUT_MAP.default);

    if (availableQuotes.length === 0) {
      const preferredErrorResp = quoteAskResponses.find((quote) => {
        return !!quote.error && ![SwapErrorType.UNKNOWN, SwapErrorType.ASSET_NOT_SUPPORTED].includes(quote.error.errorType);
      });

      const defaultErrorResp = quoteAskResponses.find((quote) => !!quote.error);

      quoteError = preferredErrorResp?.error || defaultErrorResp?.error;
    } else {
      // sort quotes by largest receivable, with priority for some providers
      availableQuotes.sort((a, b) => {
        const bnToAmountA = BigN(a.toAmount);
        const bnToAmountB = BigN(b.toAmount);

        if (bnToAmountB.eq(bnToAmountA) && [SwapProviderId.CHAIN_FLIP_MAINNET, SwapProviderId.UNISWAP].includes(a.provider.id)) {
          return -1;
        }

        if (bnToAmountA.gt(bnToAmountB)) {
          return -1;
        } else {
          return 1;
        }
      });

      if (request.preferredProvider) {
        selectedQuote = availableQuotes.find((quote) => quote.provider.id === request.preferredProvider) || availableQuotes[0];
      } else {
        selectedQuote = availableQuotes[0];
      }

      aliveUntil = selectedQuote?.aliveUntil || (+Date.now() + SWAP_QUOTE_TIMEOUT_MAP.default);
    }

    const neededProviders = availableQuotes.map((quote) => quote.provider.id);

    await Promise.all(Object.values(this.handlers).map(async (handler) => {
      if (neededProviders.includes(handler.providerSlug) && handler.init && handler.isReady === false) {
        await handler.init();
      }
    }));

    return {
      optimalQuote: selectedQuote,
      quotes: availableQuotes,
      error: quoteError,
      aliveUntil
    } as SwapQuoteResponse;
  }

  private initHandlers () {
    _SUPPORTED_SWAP_PROVIDERS.forEach((providerId) => {
      switch (providerId) {
        case SwapProviderId.CHAIN_FLIP_TESTNET:
          this.handlers[providerId] = new ChainflipSwapHandler(this.chainService, this.state.balanceService, this.state.feeService);
          break;
        case SwapProviderId.CHAIN_FLIP_MAINNET:
          this.handlers[providerId] = new ChainflipSwapHandler(this.chainService, this.state.balanceService, this.state.feeService, false);
          break;
        case SwapProviderId.HYDRADX_MAINNET:
          this.handlers[providerId] = new HydradxHandler(this.chainService, this.state.balanceService, this.state.feeService, false);
          break;
        case SwapProviderId.POLKADOT_ASSET_HUB:
          this.handlers[providerId] = new AssetHubSwapHandler(this.chainService, this.state.balanceService, this.state.feeService, 'statemint');
          break;
        case SwapProviderId.KUSAMA_ASSET_HUB:
          this.handlers[providerId] = new AssetHubSwapHandler(this.chainService, this.state.balanceService, this.state.feeService, 'statemine');
          break;
        case SwapProviderId.SIMPLE_SWAP:
          this.handlers[providerId] = new SimpleSwapHandler(this.chainService, this.state.balanceService, this.state.feeService);
          break;
        case SwapProviderId.UNISWAP:
          this.handlers[providerId] = new UniswapHandler(this.chainService, this.state.balanceService, this.state.transactionService, this.state.feeService);
          break;
        case SwapProviderId.KYBER:
          this.handlers[providerId] = new KyberHandler(this.chainService, this.state.balanceService, this.state.transactionService, this.state.feeService);
          break;
        case SwapProviderId.OPTIMEX:
          this.handlers[providerId] = new OptimexHandler(this.chainService, this.state.balanceService, this.state.feeService, false);
          break;
        case SwapProviderId.OPTIMEX_TESTNET:
          this.handlers[providerId] = new OptimexHandler(this.chainService, this.state.balanceService, this.state.feeService, true);
          break;
        default:
          throw new Error('Unsupported provider');
      }
    });
  }

  async init (): Promise<void> {
    this.status = ServiceStatus.INITIALIZING;
    this.eventService.emit('swap.ready', true);

    this.status = ServiceStatus.INITIALIZED;

    this.initHandlers();

    await this.start();
  }

  async start (): Promise<void> {
    if (this.status === ServiceStatus.STOPPING) {
      await this.waitForStopped();
    }

    if (this.status === ServiceStatus.STARTED || this.status === ServiceStatus.STARTING) {
      return this.waitForStarted();
    }

    this.status = ServiceStatus.STARTING;

    // todo: start the service jobs, subscribe data,...

    this.swapPairSubject.next(this.getSwapPairs()); // todo: might need to change it online

    // Update promise handler
    this.startPromiseHandler.resolve();
    this.stopPromiseHandler = createPromiseHandler();

    this.status = ServiceStatus.STARTED;
  }

  async stop (): Promise<void> {
    if (this.status === ServiceStatus.STARTING) {
      await this.waitForStarted();
    }

    if (this.status === ServiceStatus.STOPPED || this.status === ServiceStatus.STOPPING) {
      return this.waitForStopped();
    }

    // todo: unsub, persist data,...

    this.stopPromiseHandler.resolve();
    this.startPromiseHandler = createPromiseHandler();

    this.status = ServiceStatus.STOPPED;
  }

  waitForStarted (): Promise<void> {
    return this.startPromiseHandler.promise;
  }

  waitForStopped (): Promise<void> {
    return this.stopPromiseHandler.promise;
  }

  // todo: deprecated
  public getSwapPairs (): SwapPair[] {
    return Object.entries(this.chainService.swapRefMap).map(([slug, assetRef]) => {
      const fromAsset = this.chainService.getAssetBySlug(assetRef.srcAsset);

      return {
        slug,
        from: assetRef.srcAsset,
        to: assetRef.destAsset,
        metadata: {
          alternativeAsset: getSwapAltToken(fromAsset)
        }
      } as SwapPair;
    });
  }

  public async validateSwapProcessV2 (params: ValidateSwapProcessParams): Promise<TransactionError[]> {
    const providerId = params.selectedQuote.provider.id;
    const handler = this.handlers[providerId];

    if (params.currentStep > 0) {
      return [];
    }

    const blockedConfigObjects = await fetchBlockedConfigObjects();
    const currentConfig = this.state.settingService.getEnvironmentSetting();

    const passBlockedConfigId = getPassConfigId(currentConfig, blockedConfigObjects);
    const blockedActionsFeaturesMaps = await fetchLatestBlockedActionsAndFeatures(passBlockedConfigId);

    const originSwapPairInfo = getTokenPairFromStep(params.process.steps);

    if (!originSwapPairInfo) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const currentAction = `${ExtrinsicType.SWAP}___${originSwapPairInfo.slug}___${params.selectedQuote.provider.id}`;

    for (const blockedActionsFeaturesMap of blockedActionsFeaturesMaps) {
      const { blockedActionsMap } = blockedActionsFeaturesMap;

      if (blockedActionsMap.swap.includes(currentAction)) {
        return [new TransactionError(BasicTxErrorType.UNSUPPORTED, t('Feature under maintenance. Try again later'))];
      }
    }

    if (handler) {
      return handler.validateSwapProcessV2(params);
    } else {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }
  }

  public async handleSwapProcess (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const handler = this.handlers[params.quote.provider.id];

    if (params.process.steps.length === 1) { // todo: do better to handle error generating steps
      return Promise.reject(new TransactionError(BasicTxErrorType.INTERNAL_ERROR, 'Please check your network and try again'));
    }

    if (handler) {
      return handler.handleSwapProcess(params);
    } else {
      return Promise.reject(new TransactionError(BasicTxErrorType.INTERNAL_ERROR));
    }
  }

  // todo: deprecated
  public subscribeSwapPairs (callback: (pairs: SwapPair[]) => void) {
    return this.chainService.subscribeSwapRefMap().subscribe((refMap) => {
      const latestData = Object.entries(refMap).map(([slug, assetRef]) => {
        const fromAsset = this.chainService.getAssetBySlug(assetRef.srcAsset);

        return {
          slug,
          from: assetRef.srcAsset,
          to: assetRef.destAsset,
          metadata: {
            alternativeAsset: getSwapAltToken(fromAsset)
          }
        } as SwapPair;
      });

      callback(latestData);
    });
  }
}
