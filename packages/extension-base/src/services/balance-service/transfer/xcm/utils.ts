// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { fetchParaSpellChainMap } from '@subwallet/extension-base/constants/paraspell-chain-map';
import { CreateXcmExtrinsicProps } from '@subwallet/extension-base/services/balance-service/transfer/xcm/index';

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Call, ExtrinsicPayload } from '@polkadot/types/interfaces';
import { assert, compactToU8a, isHex, u8aConcat, u8aEq } from '@polkadot/util';

export type DryRunNodeFailure = {
  success: false,
  failureReason: string
}

export type DryRunNodeSuccess = {
  success: true
  fee: string
  forwardedXcms: any
  // destParaId?: number
  // currency: string
}

export type DryRunNodeResult = DryRunNodeSuccess | DryRunNodeFailure;

export type DryRunResult = {
  origin: DryRunNodeResult
  destination?: DryRunNodeResult
  assetHub?: DryRunNodeResult
  bridgeHub?: DryRunNodeResult
}

interface GetXcmFeeRequest {
  sender: string,
  recipient: string,
  value: string,
  fromChainInfo: _ChainInfo,
  toChainInfo: _ChainInfo,
  fromTokenInfo: _ChainAsset
}

export type XcmFeeType = 'dryRun' | 'paymentInfo'

export interface XcmFeeDetail {
  fee: string
  currency: string
  feeType: XcmFeeType
  dryRunError?: string
}

export type GetXcmFeeResult = {
  origin: XcmFeeDetail
  destination: XcmFeeDetail
}

interface ParaSpellCurrency {
  [p: string]: string,
  amount: string
}

interface ParaSpellError {
  message: string,
  error: string,
  statusCode: number
}

const paraSpellEndpoint = 'https://api.lightspell.xyz/v3';

const paraSpellApi = {
  buildXcm: `${paraSpellEndpoint}/x-transfer`,
  dryRunXcm: `${paraSpellEndpoint}/dry-run`,
  feeXcm: `${paraSpellEndpoint}/xcm-fee`
};

const paraSpellKey = process.env.PARASPELL_API_KEY || '';

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
  const { destinationChain, originChain, originTokenInfo, recipient, sendingValue, substrateApi } = request;

  if (!substrateApi) {
    throw new Error('Substrate API is not available');
  }

  const psAssetType = originTokenInfo.metadata?.paraSpellAssetType;
  const psAssetValue = originTokenInfo.metadata?.paraSpellValue;

  if (!psAssetType || !psAssetValue) {
    throw new Error('Token is not support XCM at this time');
  }

  const paraSpellChainMap = await fetchParaSpellChainMap();

  const bodyData = {
    address: recipient,
    from: paraSpellChainMap[originChain.slug],
    to: paraSpellChainMap[destinationChain.slug],
    currency: createParaSpellCurrency(psAssetType, psAssetValue, sendingValue)
  };

  const response = await fetch(paraSpellApi.buildXcm, {
    method: 'POST',
    body: JSON.stringify(bodyData),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-KEY': paraSpellKey
    }
  });

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
  const psAssetType = originTokenInfo.metadata?.paraSpellAssetType;
  const psAssetValue = originTokenInfo.metadata?.paraSpellValue;

  if (!psAssetType || !psAssetValue) {
    throw new Error('Token is not support XCM at this time');
  }

  const bodyData = {
    senderAddress: sender,
    address: recipient,
    from: paraSpellChainMap[originChain.slug],
    to: paraSpellChainMap[destinationChain.slug],
    currency: createParaSpellCurrency(psAssetType, psAssetValue, sendingValue)
  };

  const response = await fetch(paraSpellApi.dryRunXcm, {
    method: 'POST',
    body: JSON.stringify(bodyData),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-KEY': paraSpellKey
    }
  });

  if (!response.ok) {
    const error = await response.json() as ParaSpellError;

    return {
      origin: {
        success: false,
        failureReason: error.message
      }
    } as DryRunResult;
  }

  return await response.json() as DryRunResult;
}

export async function estimateXcmFee (request: GetXcmFeeRequest) {
  const { fromChainInfo, fromTokenInfo, recipient, sender, toChainInfo, value } = request;
  const paraSpellChainMap = await fetchParaSpellChainMap();
  const psAssetType = fromTokenInfo.metadata?.paraSpellAssetType;
  const psAssetValue = fromTokenInfo.metadata?.paraSpellValue;

  if (!psAssetType || !psAssetValue) {
    console.error('Lack of paraspell metadata');

    return undefined;
  }

  const bodyData = {
    senderAddress: sender,
    address: recipient,
    from: paraSpellChainMap[fromChainInfo.slug],
    to: paraSpellChainMap[toChainInfo.slug],
    currency: createParaSpellCurrency(psAssetType, psAssetValue, value)
  };

  const response = await fetch(paraSpellApi.feeXcm, {
    method: 'POST',
    body: JSON.stringify(bodyData),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-KEY': paraSpellKey
    }
  });

  if (!response.ok) {
    console.error('Failed to request estimate fee');

    return undefined;
  }

  return await response.json() as GetXcmFeeResult;
}

function createParaSpellCurrency (assetType: string, assetValue: string, amount: string): ParaSpellCurrency {
  // todo: handle complex conditions for asset has same symbol in a chain: Id, Multi-location, ...
  // todo: or update all asset to use multi-location
  return {
    [assetType]: assetValue,
    amount
  };
}

export function isChainNotSupportPolkadotApi (str: string): boolean {
  const regex = /(?=.*not yet supported)(?=.*Polkadot API).*/i; // Example: The node Interlay is not yet supported by the Polkadot API.

  return regex.test(str);
}

export function isChainNotSupportDryRun (str: string): boolean {
  const regex = /(?=.*DryRunApi)(?=.*not available).*/i; // Example: DryRunApi is not available on node Acala

  return regex.test(str);
}

// todo: remove
export const STABLE_XCM_VERSION = 3;

// todo: remove
export function isUseTeleportProtocol (originChainInfo: _ChainInfo, destChainInfo: _ChainInfo, tokenSlug?: string) {
  const relayChainToSystemChain =
    (['polkadot'].includes(originChainInfo.slug) && ['statemint'].includes(destChainInfo.slug)) ||
    (['kusama'].includes(originChainInfo.slug) && ['statemine'].includes(destChainInfo.slug)) ||
    (['rococo'].includes(originChainInfo.slug) && ['rococo_assethub'].includes(destChainInfo.slug)) ||
    (['westend'].includes(originChainInfo.slug) && ['westend_assethub'].includes(destChainInfo.slug));
  const systemChainToRelayChain =
    (['polkadot'].includes(destChainInfo.slug) && ['statemint'].includes(originChainInfo.slug)) ||
    (['kusama'].includes(destChainInfo.slug) && ['statemine'].includes(originChainInfo.slug)) ||
    (['rococo'].includes(destChainInfo.slug) && ['rococo_assethub'].includes(originChainInfo.slug)) ||
    (['westend'].includes(destChainInfo.slug) && ['westend_assethub'].includes(originChainInfo.slug));
  const isXcmMythos =
    (originChainInfo.slug === 'mythos' && destChainInfo.slug === 'statemint' && tokenSlug === 'mythos-NATIVE-MYTH') ||
    (originChainInfo.slug === 'statemint' && destChainInfo.slug === 'mythos' && tokenSlug === 'statemint-LOCAL-MYTH');

  return relayChainToSystemChain || systemChainToRelayChain || isXcmMythos;
}
