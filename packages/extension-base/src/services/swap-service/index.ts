// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { ServiceStatus, ServiceWithProcessInterface, StoppableServiceInterface } from '@subwallet/extension-base/services/base/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _getAssetOriginChain, _getChainSubstrateAddressPrefix } from '@subwallet/extension-base/services/chain-service/utils';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { AssetHubSwapHandler } from '@subwallet/extension-base/services/swap-service/handler/asset-hub';
import { SwapBaseInterface } from '@subwallet/extension-base/services/swap-service/handler/base-handler';
import { ChainflipSwapHandler } from '@subwallet/extension-base/services/swap-service/handler/chainflip-handler';
import { HydradxHandler } from '@subwallet/extension-base/services/swap-service/handler/hydradx-handler';
import { _PROVIDER_TO_SUPPORTED_PAIR_MAP, findAllBridgeDestinations, findBridgeTransitDestination, findSwapTransitDestination, getBridgeStep, getSupportSwapChain, getSwapAltToken, getSwapStep, isChainsHasSameProvider, SWAP_QUOTE_TIMEOUT_MAP } from '@subwallet/extension-base/services/swap-service/utils';
import { ActionPair, BasicTxErrorType, DynamicSwapAction, DynamicSwapType, OptimalSwapPathParamsV2, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { CommonOptimalPath, DEFAULT_FIRST_STEP, MOCK_STEP_FEE } from '@subwallet/extension-base/types/service-base';
import { _SUPPORTED_SWAP_PROVIDERS, OptimalSwapPathParams, QuoteAskResponse, SwapErrorType, SwapPair, SwapProviderId, SwapQuote, SwapQuoteResponse, SwapRequest, SwapRequestResult, SwapStepType, SwapSubmitParams, SwapSubmitStepData } from '@subwallet/extension-base/types/swap';
import { _reformatAddressWithChain, createPromiseHandler, PromiseHandler, reformatAddress } from '@subwallet/extension-base/utils';
import subwalletApiSdk from '@subwallet/subwallet-api-sdk';
import { BehaviorSubject } from 'rxjs';

import { SimpleSwapHandler } from './handler/simpleswap-handler';
import { UniswapHandler } from './handler/uniswap-handler';

export const _isChainSupportedByProvider = (providerSlug: SwapProviderId, chain: string) => {
  const supportedChains = _PROVIDER_TO_SUPPORTED_PAIR_MAP[providerSlug];

  return supportedChains ? supportedChains.includes(chain) : false;
};

export class SwapService implements ServiceWithProcessInterface, StoppableServiceInterface {
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

  private async askProvidersForQuote (request: SwapRequest) {
    const availableQuotes: QuoteAskResponse[] = [];

    await Promise.all(Object.values(this.handlers).map(async (handler) => {
      // temporary solution to reduce number of requests to providers, will work as long as there's only 1 provider for 1 chain

      if (handler.init && handler.isReady === false) {
        await handler.init();
      }
    }));

    const quotes = await subwalletApiSdk.swapApi?.fetchSwapQuoteData(request);

    console.log('quotes from API', quotes);

    if (Array.isArray(quotes)) {
      quotes.forEach((quoteData) => {
        if (!quoteData.quote || Object.keys(quoteData.quote).length === 0) {
          return;
        }

        if (!('errorClass' in quoteData.quote)) {
          availableQuotes.push({ quote: quoteData.quote as SwapQuote | undefined });
        } else {
          availableQuotes.push({
            error: new SwapError(quoteData.quote.errorType as SwapErrorType, quoteData.quote.message)
          });
        }
      });
    }

    return availableQuotes;
  }

  // deprecated
  private getDefaultProcess (params: OptimalSwapPathParams): CommonOptimalPath {
    const result: CommonOptimalPath = {
      totalFee: [MOCK_STEP_FEE],
      steps: [DEFAULT_FIRST_STEP]
    };

    result.totalFee.push({
      feeComponent: [],
      feeOptions: [params.request.pair.from],
      defaultFeeToken: params.request.pair.from
    });
    result.steps.push({
      id: result.steps.length,
      name: 'Swap',
      type: SwapStepType.SWAP
    });

    return result;
  }

  private getDefaultProcessV2 (params: OptimalSwapPathParamsV2): CommonOptimalPath {
    const result: CommonOptimalPath = {
      totalFee: [MOCK_STEP_FEE],
      steps: [DEFAULT_FIRST_STEP]
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

  // deprecated
  public async generateOptimalProcess (params: OptimalSwapPathParams): Promise<CommonOptimalPath> {
    if (!params.selectedQuote) {
      return this.getDefaultProcess(params);
    } else {
      const providerId = params.request.currentQuote?.id || params.selectedQuote.provider.id;
      const handler = this.handlers[providerId];

      if (handler) {
        return handler.generateOptimalProcess(params);
      } else {
        return this.getDefaultProcess(params);
      }
    }
  }

  public async generateOptimalProcessV2 (params: OptimalSwapPathParamsV2): Promise<CommonOptimalPath> {
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

  // deprecated
  // eslint-disable-next-line @typescript-eslint/require-await
  public async handleSwapRequest (request: SwapRequest): Promise<SwapRequestResult> {
    /*
    * 1. Ask swap quotes from providers
    * 2. Select the best quote
    * 3. Generate optimal process for that quote
    * */

    // const swapQuoteResponse = await this.getLatestDirectQuotes(request);

    // const optimalProcess = await this.generateOptimalProcess({
    //   request,
    //   selectedQuote: swapQuoteResponse.optimalQuote
    // });

    return {
      // @ts-ignore
      process: null,
      // @ts-ignore
      quote: null
    };
  }

  public async handleSwapRequestV2 (request: SwapRequest): Promise<SwapRequestResult> {
    /*
    * 1. Find available path
    * 2. Ask swap quotes from providers
    * 3. Select the best quote @Todo: handle this better
    * 4. Generate optimal process for that quote
    * */

    const { path, swapQuoteResponse } = await this.getLatestQuoteFromSwapRequest(request);
    const optimalProcess = await this.generateOptimalProcessV2({
      request,
      selectedQuote: swapQuoteResponse.optimalQuote,
      path
    });

    // todo: can also return a chain route
    console.log('path--------------------------', path);
    console.log('optimalProcess----------------', optimalProcess);

    return {
      process: optimalProcess,
      quote: swapQuoteResponse
    };
  }

  public getAvailablePath (request: SwapRequest): [DynamicSwapAction[], SwapRequest | undefined] {
    const { address, pair } = request;
    // todo: control provider tighter
    const supportSwapChains = getSupportSwapChain();
    const fromToken = this.chainService.getAssetBySlug(pair.from);
    const toToken = this.chainService.getAssetBySlug(pair.to);
    const fromChain = _getAssetOriginChain(fromToken);
    const toChain = _getAssetOriginChain(toToken);
    const toChainInfo = this.chainService.getChainInfoByKey(toChain);
    const assetRefMap = this.chainService.getAssetRefMap();
    let process: DynamicSwapAction[] = [];

    if (!fromToken || !toToken) {
      throw Error('Token not found');
    }

    if (!fromChain || !toChain) {
      throw Error('Token metadata error');
    }

    // SWAP: 2 tokens in the same chain and chain has dex
    if (isChainsHasSameProvider(fromChain, toChain)) { // there's a dex that can support direct swapping
      process.push(getSwapStep(fromToken.slug, toToken.slug));

      return [process, request];
    }

    // ------------------------
    // SWAP -> BRIDGE: Try to find a token in from chain that can bridge to toToken
    const swapTransit = findSwapTransitDestination(assetRefMap, fromToken, toToken);

    if (swapTransit && supportSwapChains.includes(fromChain)) {
      const swapStep = getSwapStep(fromToken.slug, swapTransit);

      process.push(swapStep);
      process.push(getBridgeStep(swapTransit, toToken.slug));

      return [process, {
        ...request,
        pair: swapStep.pair
      }];
    }

    // ------------------------
    // BRIDGE -> SWAP: Try to find a token in dest chain that can bridge from fromToken
    const bridgeTransit = findBridgeTransitDestination(assetRefMap, fromToken, toToken);

    if (bridgeTransit && supportSwapChains.includes(toChain)) {
      const swapStep = getSwapStep(bridgeTransit, toToken.slug);

      process.push(getBridgeStep(fromToken.slug, bridgeTransit));
      process.push(swapStep);

      return [process, {
        ...request,
        address: reformatAddress(address, _getChainSubstrateAddressPrefix(toChainInfo)),
        pair: swapStep.pair
      }];
    }

    // ------------------------
    // BRIDGE -> SWAP -> BRIDGE: Try to find a tri-step path to swap
    const processList: DynamicSwapAction[][] = [];
    const swapPairList: ActionPair[] = [];
    const allBridgeDestinations = findAllBridgeDestinations(assetRefMap, fromToken);

    // currently find first path. Todo: return all paths or best path.
    for (const bridgeTransit of allBridgeDestinations) {
      process = [];
      const bridgeDestinationInfo = this.chainService.getAssetBySlug(bridgeTransit);
      const swapTransit = findSwapTransitDestination(assetRefMap, bridgeDestinationInfo, toToken);

      if (swapTransit && supportSwapChains.includes(bridgeDestinationInfo.originChain)) {
        const swapStep = getSwapStep(bridgeTransit, swapTransit);

        process.push(getBridgeStep(fromToken.slug, bridgeTransit));
        process.push(swapStep);
        process.push(getBridgeStep(swapTransit, toToken.slug));

        // set the highest priority to hydration provider
        if (bridgeDestinationInfo.originChain === COMMON_CHAIN_SLUGS.HYDRADX) {
          return [process, {
            ...request,
            address: _reformatAddressWithChain(address, this.chainService.getChainInfoByKey(COMMON_CHAIN_SLUGS.HYDRADX)),
            pair: swapStep.pair
          }];
        }

        processList.push(process);
        swapPairList.push(swapStep.pair);
      }
    }

    // get first process
    if (processList.length && swapPairList.length) {
      const [firstProcess, firstSwapPair] = [processList[0], swapPairList[0]];
      const chainSwap = this.chainService.getAssetBySlug(firstSwapPair.from).originChain;

      return [firstProcess, {
        ...request,
        address: _reformatAddressWithChain(address, this.chainService.getChainInfoByKey(chainSwap)),
        pair: firstSwapPair
      }];
    }

    // todo: encapsulate each route type to function

    return [[], undefined];
  }

  public async getLatestQuoteFromSwapRequest (request: SwapRequest): Promise<{path: DynamicSwapAction[], swapQuoteResponse: SwapQuoteResponse}> {
    const [path, directSwapRequest] = this.getAvailablePath(request);

    if (!directSwapRequest) {
      throw Error('Swap pair is not found');
    }

    const swapQuoteResponse = await this.getLatestDirectQuotes(directSwapRequest);

    return {
      path,
      swapQuoteResponse
    };
  }

  private async getLatestDirectQuotes (request: SwapRequest): Promise<SwapQuoteResponse> {
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
      selectedQuote = availableQuotes.find((quote) => quote.provider.id === request.currentQuote?.id) || availableQuotes[0]; // todo: choose best quote based on rate
      aliveUntil = selectedQuote?.aliveUntil || (+Date.now() + SWAP_QUOTE_TIMEOUT_MAP.default);
    }

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

        case SwapProviderId.HYDRADX_TESTNET:
          this.handlers[providerId] = new HydradxHandler(this.chainService, this.state.balanceService, this.state.feeService);
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
        // case SwapProviderId.ROCOCO_ASSET_HUB:
        //   this.handlers[providerId] = new AssetHubSwapHandler(this.chainService, this.state.balanceService, this.state.feeService, 'rococo_assethub');
        //   break;
        case SwapProviderId.WESTEND_ASSET_HUB:
          this.handlers[providerId] = new AssetHubSwapHandler(this.chainService, this.state.balanceService, this.state.feeService, 'westend_assethub');
          break;
        case SwapProviderId.SIMPLE_SWAP:
          this.handlers[providerId] = new SimpleSwapHandler(this.chainService, this.state.balanceService, this.state.feeService);
          break;
        case SwapProviderId.UNISWAP:
          this.handlers[providerId] = new UniswapHandler(this.chainService, this.state.balanceService, this.state.transactionService, this.state.feeService);
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

  // private getSwapPairMetadata (slug: string): Record<string, any> | undefined {
  //   return this.getSwapPairs().find((pair) => pair.slug === slug)?.metadata;
  // }

  public async validateSwapProcess (params: ValidateSwapProcessParams): Promise<TransactionError[]> {
    const providerId = params.selectedQuote.provider.id;
    const handler = this.handlers[providerId];

    if (handler) {
      return handler.validateSwapProcess(params);
    } else {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }
  }

  public async validateSwapProcessV2 (params: ValidateSwapProcessParams): Promise<TransactionError[]> {
    const providerId = params.selectedQuote.provider.id;
    const handler = this.handlers[providerId];

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
