// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Brc20Metadata, InscriptionFetchedData } from '@subwallet/extension-base/services/chain-service/handler/bitcoin/strategy/types';
import { createLogger } from '@subwallet/extension-base/utils/logger';
import { HiroService } from '@subwallet/extension-base/services/hiro-service';

const hiroServiceLogger = createLogger('HiroService');

// todo: handle inscription testnet
export async function getBrc20Metadata (isTestnet = false, ticker: string) {
  const hiroService = HiroService.getInstance(isTestnet);
  const defaultMetadata = {
    ticker: '',
    decimals: 0
  } as Brc20Metadata;

  try {
    const response = await hiroService.getBRC20Metadata(ticker);
    const rs = response?.token;

    if (rs) {
      return {
        ticker: rs.ticker,
        decimals: rs.decimals
      } as Brc20Metadata;
    }

    return defaultMetadata;
  } catch (error) {
    hiroServiceLogger.debug(`Error on request brc20 metadata with ticker ${ticker}`);

    return defaultMetadata;
  }
}

export async function getInscriptionContent (isTestnet: boolean, inscriptionId: string) {
  const hiroService = HiroService.getInstance(isTestnet);

  try {
    return await hiroService.getInscriptionContent(inscriptionId);
  } catch (error) {
    hiroServiceLogger.debug(`Error on request inscription ${inscriptionId} content`);

    return {};
  }
}

// todo: handle large inscriptions
export async function getAddressInscriptions (address: string, isTestnet: boolean, offset = 0, limit = 25) {
  const hiroService = HiroService.getInstance(isTestnet);

  try {
    const response = await hiroService.getAddressInscriptionsInfo({
      limit: String(limit),
      offset: String(offset),
      address: String(address)
    }) as unknown as InscriptionFetchedData;

    return response.results;
  } catch (error) {
    hiroServiceLogger.error(`Failed to get ${address} inscriptions with offset ${offset} and limit ${limit}`, error);
    throw error;
  }
}

export function getPreviewUrl (inscriptionId: string) {
  const hiroService = HiroService.getInstance();

  try {
    return hiroService.getPreviewUrl(inscriptionId);
  } catch (error) {
    hiroServiceLogger.error(`Failed to get inscription ${inscriptionId} preview url`, error);
    throw error;
  }
}

export function isValidBrc20Ticker (ticker: string) {
  const bytesLength = getByteLength(ticker);

  return bytesLength === 4 || bytesLength === 5;
}

function getByteLength (str: string): number {
  const encoder = new TextEncoder();
  const encodedStr = encoder.encode(str);

  // Return the length of the encoded array, which represents the number of bytes
  return encodedStr.length;
}
