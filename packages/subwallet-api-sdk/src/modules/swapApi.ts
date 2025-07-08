// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubWalletResponse } from '../sdk';

// todo: use interface from @subwallet/extension-base/types
interface ActionPair {
  slug: string;
  from: string;
  to: string;
}

enum DynamicSwapType {
  SWAP = 'SWAP',
  BRIDGE = 'BRIDGE'
}

interface DynamicSwapAction {
  action: DynamicSwapType;
  pair: ActionPair;
}

export interface SwapPair {
  slug: string;
  from: string;
  to: string;
  metadata?: Record<string, any>;
}

export interface SwapProvider {
  id: SwapProviderId;
  name: string;
  faq?: string;
}

export enum SwapProviderId {
  CHAIN_FLIP_TESTNET = 'CHAIN_FLIP_TESTNET',
  CHAIN_FLIP_MAINNET = 'CHAIN_FLIP_MAINNET',
  HYDRADX_MAINNET = 'HYDRADX_MAINNET',
  HYDRADX_TESTNET = 'HYDRADX_TESTNET',
  POLKADOT_ASSET_HUB = 'POLKADOT_ASSET_HUB',
  KUSAMA_ASSET_HUB = 'KUSAMA_ASSET_HUB',
  ROCOCO_ASSET_HUB = 'ROCOCO_ASSET_HUB',
  WESTEND_ASSET_HUB = 'WESTEND_ASSET_HUB',
  SIMPLE_SWAP = 'SIMPLE_SWAP',
  UNISWAP = 'UNISWAP',
  KYBER = 'KYBER'
}

export interface SwapRequest {
  address: string;
  pair: SwapPair;
  fromAmount: string;
  slippage: number; // Example: 0.01 for 1%
  recipient?: string;
  feeToken?: string;
  currentQuote?: SwapProvider
}

interface SwapRequestV2 {
  address: string;
  pair: SwapPair;
  fromAmount: string;
  slippage: number; // Example: 0.01 for 1%
  recipient?: string;
  feeToken?: string;
  preferredProvider?: SwapProviderId; // allow user to designate a provider
  isCrossChain?: boolean;
  evmBridgeSwapVersion?: boolean; // hotfix todo: remove later
}

export interface HydrationRateRequest {
  address: string;
  pair: SwapPair;
}

export type SwapRate = number;

export interface QuoteAskResponse {
  provider: SwapProviderId;
  quote?: SwapQuote | SwapError;
}

export interface SwapQuote {
  pair: SwapPair;
  fromAmount: string;
  toAmount: string;
  rate: SwapRate; // rate = fromToken / toToken
  provider: SwapProvider;
  aliveUntil: number; // timestamp
  route: SwapRoute;

  minSwap?: string; // min amount to start swapping
  maxSwap?: string; // set by the provider
  estimatedArrivalTime?: number; // in seconds
  isLowLiquidity?: boolean; // definition would be different for different providers
  metadata?: any;

  feeInfo: CommonStepFeeInfo;
}

export interface CommonFeeComponent {
  feeType: BaseFeeType;
  amount: string;
  tokenSlug: string;
}

export interface CommonStepFeeInfo {
  feeComponent: CommonFeeComponent[];
  defaultFeeToken: string; // token to pay transaction fee with
  feeOptions: string[]; // list of tokenSlug, always include defaultFeeToken
  selectedFeeToken?: string;
}

export type BaseFeeType = SwapFeeType;
export enum SwapFeeType {
  PLATFORM_FEE = 'PLATFORM_FEE',
  NETWORK_FEE = 'NETWORK_FEE',
  WALLET_FEE = 'WALLET_FEE'
}

export interface SwapRoute {
  path: string[]; // list of tokenSlug
  // todo: there might be more info
}

export interface SwapError {
  errorClass: string;
  errorType: string;
  message: string;
  name: string;
}

export interface SwapPath {
  path: DynamicSwapAction[]
}

export class SwapApi {
  private baseUrl: string;

  constructor (baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetchSwapQuoteData (quoteRequest: SwapRequest): Promise<QuoteAskResponse[]> {
    const url = `${this.baseUrl}/swap`;

    try {
      const rawResponse = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quoteRequest })
      });

      const response = await rawResponse.json() as SubWalletResponse<QuoteAskResponse[]>;

      if (response.statusCode !== 200) {
        throw new Error(response.message);
      }

      return response.result;
    } catch (error) {
      throw new Error(`Failed to fetch swap quote: ${(error as Error).message}`);
    }
  }

  async getHydrationRate (hydrationRateRequest: HydrationRateRequest): Promise<number | undefined> {
    const url = `${this.baseUrl}/swap/hydration-rate`;

    try {
      const rawResponse = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hydrationRateRequest })
      });

      const response = await rawResponse.json() as SubWalletResponse<{ rate: number }>;

      if (response.statusCode !== 200) {
        console.error(response.message);

        return undefined;
      }

      return response.result.rate;
    } catch (error) {
      console.error(`Failed to fetch swap quote: ${(error as Error).message}`);

      return undefined;
    }
  }

  async findAvailablePath (_availablePathRequest: SwapRequestV2) {
    const url = `${this.baseUrl}/swap/find-available-path`;

    // hotfix todo: remove later
    const availablePathRequest = {
      ..._availablePathRequest,
      evmBridgeSwapVersion: true
    };

    try {
      const rawResponse = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ availablePathRequest })
      });

      const response = await rawResponse.json() as SubWalletResponse<SwapPath>;

      if (response.statusCode !== 200) {
        return undefined;
      }

      return response.result;
    } catch (error) {
      console.error(`Failed to fetch swap quote: ${(error as Error).message}`);

      return undefined;
    }
  }
}
