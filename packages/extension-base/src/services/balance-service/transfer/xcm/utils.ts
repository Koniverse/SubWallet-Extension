// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { fetchParaSpellChainMap } from '@subwallet/extension-base/constants/paraspell-chain-map';
import { _isSnowBridgeXcm } from '@subwallet/extension-base/core/substrate/xcm-parser';
import { _isAcrossChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/acrossBridge';
import { isAvailChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/availBridge';
import { CreateXcmExtrinsicProps } from '@subwallet/extension-base/services/balance-service/transfer/xcm/index';
import { _isPolygonChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/polygonBridge';
import { _isPosChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/posBridge';
import { _getSubstrateRelayParent, _isPureEvmChain, _isSubstrateRelayChain } from '@subwallet/extension-base/services/chain-service/utils';
import { ProxyServiceRoute } from '@subwallet/extension-base/types/environment';
import { fetchFromProxyService } from '@subwallet/extension-base/utils';
import BigNumber from 'bignumber.js';

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Call, ExtrinsicPayload } from '@polkadot/types/interfaces';
import { assert, compactToU8a, isHex, u8aConcat, u8aEq } from '@polkadot/util';

import { _isBittensorToSubtensorBridge, _isSubtensorToBittensorBridge } from './bittensorBridge';

export type ParaSpellDryRunError = {
  reason: string
  subReason?: string
  instructionIndex?: number
  instruction?: object
}

export type ParaSpellDryRunChainKind = 'origin' | 'destination' | 'hop'

// Top-level dry-run error: same shape as ParaSpellDryRunError, plus which chain it came from
export interface ParaSpellDryRunFailure extends ParaSpellDryRunError {
  chainKind?: ParaSpellDryRunChainKind
  chain?: string
}

export type ParaSpellDryRunChainFailure = {
  success: false,
  dryRunError: ParaSpellDryRunError
}

export type ParaSpellDryRunChainSuccess = {
  success: true
  fee: string
  forwardedXcms: any
  // destParaId?: number
}

export type ParaSpellDryRunChainResult = ParaSpellDryRunChainSuccess | ParaSpellDryRunChainFailure;

export type ParaSpellDryRunHopInfo = {
  chain?: string
  result: ParaSpellDryRunChainResult
}

export type ParaSpellDryRunResult = {
  success: boolean
  dryRunError?: ParaSpellDryRunFailure
  origin: ParaSpellDryRunChainResult
  destination?: ParaSpellDryRunChainResult
  hops: ParaSpellDryRunHopInfo[]
}

export type ParaSpellXcmFeeType = 'dryRun' | 'paymentInfo' | 'noFeeRequired'

export interface ParaSpellAssetInfo {
  [p: string]: any
  symbol: string
  decimals: number
}

export interface ParaSpellXcmFeeDetail {
  fee?: string
  feeType?: ParaSpellXcmFeeType
  sufficient?: boolean
  asset: ParaSpellAssetInfo
  dryRunError?: ParaSpellDryRunError
}

export type ParaSpellXcmFeeHopInfo = {
  chain?: string
  result: ParaSpellXcmFeeDetail
}

export type ParaSpellXcmFeeResult = {
  success: boolean
  dryRunError?: ParaSpellDryRunFailure
  origin: ParaSpellXcmFeeDetail
  destination: ParaSpellXcmFeeDetail
  hops: ParaSpellXcmFeeHopInfo[]
}

export interface GetXcmFeeRequest {
  sender: string,
  recipient: string,
  value: string,
  fromChainInfo: _ChainInfo,
  toChainInfo: _ChainInfo,
  fromTokenInfo: _ChainAsset
}

interface ParaSpellCurrency {
  [p: string]: any,
  amount: string
}

interface ParaSpellError {
  message: string,
  error: string,
  statusCode: number
}

const version = '/v2';

const paraSpellApi = {
  buildXcm: `${version}/x-transfer`,
  feeXcm: `${version}/xcm-fee`,
  dryRunXcm: `${version}/dry-run`,
  dryRunPreviewXcm: `${version}/dry-run-preview`,
  maxTransferable: `${version}/transferable-amount`,
  minTransferable: `${version}/min-transferable-amount`,
  supportedAssets: `${version}/supported-assets`
};

function txHexToSubmittableExtrinsic (api: ApiPromise, hex: string): SubmittableExtrinsic<'promise'> {
  try {
    assert(isHex(hex), 'Expected a hex-encoded call');

    let extrinsicCall: Call;
    let extrinsicPayload: ExtrinsicPayload | null = null;
    let decoded: SubmittableExtrinsic<'promise'> | null = null;

    try {
      // attempt to decode with api.tx
      const tx = api.tx(hex);

      // ensure that the full data matches here
      assert(tx.toHex() === hex, 'Cannot decode data as extrinsic, length mismatch');

      decoded = tx;
      extrinsicCall = api.createType('Call', decoded.method);
    } catch {
      try {
        // attempt to decode as Call
        extrinsicCall = api.createType('Call', hex);

        const callHex = extrinsicCall.toHex();

        if (callHex === hex) {
          // ok
        } else if (hex.startsWith(callHex)) {
          // this could be an un-prefixed payload...
          const prefixed = u8aConcat(compactToU8a(extrinsicCall.encodedLength), hex);

          extrinsicPayload = api.createType('ExtrinsicPayload', prefixed);

          assert(u8aEq(extrinsicPayload.toU8a(), prefixed), 'Unable to decode data as un-prefixed ExtrinsicPayload');

          extrinsicCall = api.createType('Call', extrinsicPayload.method.toHex());
        } else {
          console.error('Unable to decode data as Call, length mismatch in supplied data');
        }
      } catch {
        // final attempt, we try this as-is as a (prefixed) payload
        extrinsicPayload = api.createType('ExtrinsicPayload', hex);

        assert(extrinsicPayload.toHex() === hex, 'Unable to decode input data as Call, Extrinsic or ExtrinsicPayload');

        extrinsicCall = api.createType('Call', extrinsicPayload.method.toHex());
      }
    }

    const { method, section } = api.registry.findMetaCall(extrinsicCall.callIndex);
    const extrinsicFn = api.tx[section][method];

    if (!decoded) {
      decoded = extrinsicFn(...extrinsicCall.args);
    }

    return decoded;
  } catch (e) {
    console.error('Failed to decode extrinsic hex', e);

    throw new Error('Failed to decode extrinsic hex');
  }
}

export async function buildXcm (request: CreateXcmExtrinsicProps) {
  const { destinationChain, originChain, originTokenInfo, recipient, sender, sendingValue, substrateApi } = request;

  if (!substrateApi) {
    throw new Error('Substrate API is not available');
  }

  const paraSpellIdentifyV4 = originTokenInfo.metadata?.paraSpellIdentifyV4;

  if (!paraSpellIdentifyV4) {
    throw new Error('Token is not support XCM at this time');
  }

  await assertXcmCurrencySupported(originChain, destinationChain, originTokenInfo);

  const paraSpellChainMap = await fetchParaSpellChainMap();

  const bodyData = {
    sender,
    recipient,
    from: paraSpellChainMap[originChain.slug],
    to: paraSpellChainMap[destinationChain.slug],
    currency: createParaSpellCurrency(paraSpellIdentifyV4, sendingValue),
    options: {
      abstractDecimals: false
    }
  };

  const response = await fetchFromProxyService(
    ProxyServiceRoute.PARASPELL,
    paraSpellApi.buildXcm,
    {
      method: 'POST',
      body: JSON.stringify(bodyData),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json() as ParaSpellError;

    throw new Error(error.message);
  }

  const extrinsicHex = await response.text();
  const chainApi = await substrateApi.isReady;

  return txHexToSubmittableExtrinsic(chainApi.api, extrinsicHex);
}

export async function dryRunXcm (request: CreateXcmExtrinsicProps) {
  const { destinationChain, originChain, originTokenInfo, recipient, sender, sendingValue } = request;
  const paraSpellChainMap = await fetchParaSpellChainMap();
  const paraSpellIdentifyV4 = originTokenInfo.metadata?.paraSpellIdentifyV4;

  if (!paraSpellIdentifyV4) {
    throw new Error('Token is not support XCM at this time');
  }

  const bodyData = {
    sender,
    recipient,
    from: paraSpellChainMap[originChain.slug],
    to: paraSpellChainMap[destinationChain.slug],
    currency: createParaSpellCurrency(paraSpellIdentifyV4, sendingValue),
    options: {
      abstractDecimals: false
    }
  };

  const response = await fetchFromProxyService(
    ProxyServiceRoute.PARASPELL,
    paraSpellApi.dryRunXcm,
    {
      method: 'POST',
      body: JSON.stringify(bodyData),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json() as ParaSpellError;

    return createParaSpellDryRunFailure(error.message);
  }

  return await response.json() as ParaSpellDryRunResult;
}

export async function dryRunPreviewXcm (request: CreateXcmExtrinsicProps) {
  const { destinationChain, originChain, originTokenInfo, recipient, sender, sendingValue } = request;
  const paraSpellChainMap = await fetchParaSpellChainMap();
  const paraSpellIdentifyV4 = originTokenInfo.metadata?.paraSpellIdentifyV4;

  if (!paraSpellIdentifyV4) {
    throw new Error('Token is not support XCM at this time');
  }

  const bodyData = {
    sender,
    recipient,
    from: paraSpellChainMap[originChain.slug],
    to: paraSpellChainMap[destinationChain.slug],
    currency: createParaSpellCurrency(paraSpellIdentifyV4, sendingValue),
    options: {
      abstractDecimals: false,
      mintFeeAssets: true
    }
  };

  const response = await fetchFromProxyService(
    ProxyServiceRoute.PARASPELL,
    paraSpellApi.dryRunPreviewXcm,
    {
      method: 'POST',
      body: JSON.stringify(bodyData),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json() as ParaSpellError;

    return createParaSpellDryRunFailure(error.message);
  }

  return await response.json() as ParaSpellDryRunResult;
}

export async function estimateXcmFee (request: GetXcmFeeRequest) {
  const { fromChainInfo, fromTokenInfo, recipient, sender, toChainInfo, value } = request;
  const paraSpellChainMap = await fetchParaSpellChainMap();
  const paraSpellIdentifyV4 = fromTokenInfo.metadata?.paraSpellIdentifyV4;
  const requestValue = BigNumber(value).gt(0) ? value : '1'; // avoid bug in-case estimate fee sendingValue <= 0;

  if (!paraSpellIdentifyV4) {
    console.error('Lack of paraspell metadata');

    return undefined;
  }

  const bodyData = {
    sender,
    recipient,
    from: paraSpellChainMap[fromChainInfo.slug],
    to: paraSpellChainMap[toChainInfo.slug],
    currency: createParaSpellCurrency(paraSpellIdentifyV4, requestValue),
    options: {
      abstractDecimals: false
    }
  };

  const response = await fetchFromProxyService(
    ProxyServiceRoute.PARASPELL,
    paraSpellApi.feeXcm,
    {
      method: 'POST',
      body: JSON.stringify(bodyData),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    }
  );

  if (!response.ok) {
    console.error('Failed to request estimate fee');

    return undefined;
  }

  return await response.json() as ParaSpellXcmFeeResult;
}

export async function fetchMinXcmTransferableAmount (request: GetXcmFeeRequest) {
  const { fromChainInfo: originChain, fromTokenInfo: originTokenInfo, recipient, sender, toChainInfo: destinationChain, value: sendingValue } = request;
  const paraSpellChainMap = await fetchParaSpellChainMap();
  const paraSpellIdentifyV4 = originTokenInfo.metadata?.paraSpellIdentifyV4;

  if (!paraSpellIdentifyV4) {
    throw new Error('Token is not support XCM at this time');
  }

  const bodyData = {
    sender,
    recipient,
    from: paraSpellChainMap[originChain.slug],
    to: paraSpellChainMap[destinationChain.slug],
    currency: createParaSpellCurrency(paraSpellIdentifyV4, sendingValue),
    options: {
      abstractDecimals: false
    }
  };

  const response = await fetchFromProxyService(
    ProxyServiceRoute.PARASPELL,
    paraSpellApi.minTransferable,
    {
      method: 'POST',
      body: JSON.stringify(bodyData),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json() as ParaSpellError;

    throw new Error(error.message);
  }

  return String(await response.json());
}

export interface ParaSpellSupportedAsset {
  [p: string]: any
  symbol?: string
  location?: Record<string, any>
}

const SUPPORTED_ASSETS_CACHE_TTL = 30 * 60 * 1000;

const supportedAssetsCache: Record<string, { expiredAt: number, request: Promise<ParaSpellSupportedAsset[]> }> = {};

async function fetchParaSpellSupportedAssets (origin: string, destination: string): Promise<ParaSpellSupportedAsset[]> {
  const cacheKey = `${origin}___${destination}`;
  const cached = supportedAssetsCache[cacheKey];

  if (cached && cached.expiredAt > Date.now()) {
    return cached.request;
  }

  const request = (async () => {
    const response = await fetchFromProxyService(
      ProxyServiceRoute.PARASPELL,
      `${paraSpellApi.supportedAssets}?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json() as ParaSpellError;

      throw new Error(error.message);
    }

    return await response.json() as ParaSpellSupportedAsset[];
  })();

  supportedAssetsCache[cacheKey] = { expiredAt: Date.now() + SUPPORTED_ASSETS_CACHE_TTL, request };

  request.catch(() => {
    delete supportedAssetsCache[cacheKey];
  });

  return request;
}

// ParaSpell and chain-list spell the same junction in different ways: `Here` vs `{ Here: null }`,
// `"Polkadot"` vs `{ polkadot: null }`, `1,984` vs `1984`, `X1` as an object vs a single-item array.
function normalizeXcmLocation (value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeXcmLocation);
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, child]): [string, unknown] => {
        const normalizedKey = key.toLowerCase();
        const normalizedChild = normalizeXcmLocation(child);

        return [normalizedKey, normalizedKey === 'x1' && !Array.isArray(normalizedChild) ? [normalizedChild] : normalizedChild];
      })
      .sort(([a], [b]) => a.localeCompare(b));

    const result: Record<string, unknown> = {};

    for (const [key, child] of entries) {
      result[key] = child;
    }

    return result;
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return value.toString();
  }

  if (typeof value === 'string') {
    const plain = value.replace(/,/g, '').trim();

    return /^\d+$/.test(plain) ? plain : { [plain.toLowerCase()]: null };
  }

  return value;
}

function isSameXcmLocation (a: unknown, b: unknown): boolean {
  return JSON.stringify(normalizeXcmLocation(a)) === JSON.stringify(normalizeXcmLocation(b));
}

function getConsensusSystem (chainInfo: _ChainInfo): string | undefined {
  if (_isSubstrateRelayChain(chainInfo)) {
    return chainInfo.slug;
  }

  return _getSubstrateRelayParent(chainInfo) || undefined;
}

/**
 * Across a consensus boundary (Polkadot <> Kusama) both Asset Hubs register a local and a bridged
 * flavour of the same stablecoin under the same symbol, and only the bridged one can cross.
 * Sending the local one traps the funds on the destination, so the currency we are about to send is
 * checked against the pair ParaSpell actually supports.
 * Returns true on network errors — the dry-run is still ahead.
 */
export async function isXcmCurrencySupported (originChain: _ChainInfo, destinationChain: _ChainInfo, originTokenInfo: _ChainAsset): Promise<boolean> {
  const originConsensus = getConsensusSystem(originChain);
  const destinationConsensus = getConsensusSystem(destinationChain);

  if (!originConsensus || !destinationConsensus || originConsensus === destinationConsensus) {
    return true;
  }

  const paraSpellIdentifyV4 = originTokenInfo.metadata?.paraSpellIdentifyV4;

  if (!paraSpellIdentifyV4) {
    return true;
  }

  const paraSpellChainMap = await fetchParaSpellChainMap();
  const origin = paraSpellChainMap[originChain.slug];
  const destination = paraSpellChainMap[destinationChain.slug];

  if (!origin || !destination) {
    return true;
  }

  let supportedAssets: ParaSpellSupportedAsset[];

  try {
    supportedAssets = await fetchParaSpellSupportedAssets(origin, destination);
  } catch (e) {
    console.error('Failed to fetch ParaSpell supported assets', e);

    return true;
  }

  const location = paraSpellIdentifyV4.location as Record<string, any> | undefined;

  return location
    ? supportedAssets.some((asset) => asset.location && isSameXcmLocation(asset.location, location))
    : supportedAssets.some((asset) => asset.symbol?.toLowerCase() === originTokenInfo.symbol.toLowerCase());
}

// Single choke point: makeCrossChainTransfer checks this up-front, but the swap and earning flows
// reach buildXcm without that check.
async function assertXcmCurrencySupported (originChain: _ChainInfo, destinationChain: _ChainInfo, originTokenInfo: _ChainAsset): Promise<void> {
  if (!await isXcmCurrencySupported(originChain, destinationChain, originTokenInfo)) {
    throw new Error(`${originTokenInfo.symbol} on ${originChain.name} cannot be bridged to ${destinationChain.name}. Select the ${destinationChain.name} version of this token and try again`);
  }
}

function createParaSpellDryRunFailure (reason: string): ParaSpellDryRunResult {
  return {
    success: false,
    dryRunError: { reason },
    origin: {
      success: false,
      dryRunError: { reason }
    },
    hops: []
  };
}

function createParaSpellCurrency (paraSpellIdentifyV4: Record<string, any>, amount: string): ParaSpellCurrency {
  return {
    ...paraSpellIdentifyV4,
    amount
  };
}

// Matches ParaSpell error strings only — do not reuse for another XCM provider.
export function isParaSpellChainNotSupportPolkadotApi (str: string): boolean {
  const regex = /(?=.*not yet supported)(?=.*Polkadot API).*/i; // Example: The chain Interlay is not yet supported by the Polkadot API.

  return regex.test(str);
}

// Matches ParaSpell error strings only — do not reuse for another XCM provider.
export function isParaSpellChainNotSupportDryRun (str: string): boolean {
  const regex = /(?=.*DryRunApi)(?=.*not available).*/i; // Example: DryRunApi is not available on chain Acala

  return regex.test(str);
}

export function isSubstrateCrossChain (originChainInfo: _ChainInfo, destinationChainInfo: _ChainInfo) {
  if (originChainInfo.slug === destinationChainInfo.slug) {
    return false;
  }

  // isAvailBridgeFromEvm
  if (_isPureEvmChain(originChainInfo) && isAvailChainBridge(destinationChainInfo.slug)) {
    return false;
  }

  // isAvailBridgeFromAvail
  if (isAvailChainBridge(originChainInfo.slug) && _isPureEvmChain(destinationChainInfo)) {
    return false;
  }

  // isSnowBridgeEvmTransfer
  if (_isPureEvmChain(originChainInfo) && _isSnowBridgeXcm(originChainInfo, destinationChainInfo)) {
    return false;
  }

  // isPolygonBridgeTransfer
  if (_isPolygonChainBridge(originChainInfo.slug, destinationChainInfo.slug)) {
    return false;
  }

  // isPosBridgeTransfer
  if (_isPosChainBridge(originChainInfo.slug, destinationChainInfo.slug)) {
    return false;
  }

  // isAcrossBridgeTransfer
  if (_isAcrossChainBridge(originChainInfo.slug, destinationChainInfo.slug)) {
    return false;
  }

  if (_isBittensorToSubtensorBridge(originChainInfo.slug, destinationChainInfo.slug)) {
    return false;
  }

  if (_isSubtensorToBittensorBridge(originChainInfo.slug, destinationChainInfo.slug)) {
    return false;
  }

  return true;
}
