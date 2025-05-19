// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { _isAcrossBridgeXcm } from '@subwallet/extension-base/core/substrate/xcm-parser';
import subwalletApiSdk from '@subwallet/subwallet-api-sdk';

import { CreateXcmExtrinsicProps } from '..';

// Across Bridge
const acrossPairsMap = new Map([
  [COMMON_CHAIN_SLUGS.ETHEREUM, new Set(['optimism', 'base_mainnet', 'arbitrum_one'])],
  ['optimism', new Set([COMMON_CHAIN_SLUGS.ETHEREUM, 'base_mainnet', 'arbitrum_one'])],
  ['base_mainnet', new Set([COMMON_CHAIN_SLUGS.ETHEREUM, 'optimism', 'arbitrum_one'])],
  ['arbitrum_one', new Set([COMMON_CHAIN_SLUGS.ETHEREUM, 'optimism', 'base_mainnet'])],
  [COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA, new Set(['base_sepolia', 'arbitrum_sepolia'])], // TESTNET START HERE
  ['base_sepolia', new Set([COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA])],
  ['arbitrum_sepolia', new Set([COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA])]
]);

export function _isAcrossChainBridge (srcChain: string, destChain: string): boolean {
  return acrossPairsMap.get(srcChain)?.has(destChain) ?? false;
}

export function _isAcrossTestnetBridge (srcChain: string): boolean {
  return srcChain === 'base_sepolia' || srcChain === 'arbitrum_sepolia' || srcChain === COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA;
}

export const AcrossErrorMsg = {
  AMOUNT_TOO_LOW: 'amount too low',
  AMOUNT_TOO_HIGH: 'amount too high'
};

export interface AcrossQuote {
  outputAmount: string;
  rate: string;
}

interface XcmApiResponse {
  sender: string;
  to: string;
  transferEncodedCall: string;
  value: string;
  metadata?: any;
}

// Calculate fee for across bridge transfer
export const getAcrossQuote = async ({ destinationChain,
  destinationTokenInfo,
  originChain,
  originTokenInfo,
  recipient,
  sender,
  sendingValue }: CreateXcmExtrinsicProps) => {
  const isAcrossBridgeXcm = _isAcrossBridgeXcm(originChain, destinationChain);

  if (!isAcrossBridgeXcm) {
    throw new Error('This is not a valid AcrossBridge transfer');
  }

  if (!sender) {
    throw new Error('Sender is required');
  }

  try {
    const data = await subwalletApiSdk.xcmApi?.fetchXcmData(sender, originTokenInfo.slug, destinationTokenInfo.slug, recipient, sendingValue);

    if (!data) {
      throw new Error('Failed to fetch Across Bridge Data. Please try again later');
    }

    return data as XcmApiResponse;
  } catch (error) {
    return Promise.reject(error);
  }
};

// export const SpokePoolMapping: Record<number, { SpokePool: { address: string; blockNumber: number } }> = {
//   1: {
//     SpokePool: { address: '0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5', blockNumber: 17117454 }
//   },
//   10: {
//     SpokePool: { address: '0x6f26Bf09B1C792e3228e5467807a900A503c0281', blockNumber: 93903076 }
//   },
//   11155111: {
//     SpokePool: { address: '0x5ef6C01E11889d86803e0B23e3cB3F9E9d97B662', blockNumber: 5288470 }
//   },
//   11155420: {
//     SpokePool: { address: '0x4e8E101924eDE233C13e2D8622DC8aED2872d505', blockNumber: 7762656 }
//   },
//   1135: {
//     SpokePool: { address: '0x9552a0a6624A23B848060AE5901659CDDa1f83f8', blockNumber: 2602337 }
//   },
//   130: {
//     SpokePool: { address: '0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64', blockNumber: 7915488 }
//   },
//   137: {
//     SpokePool: { address: '0x9295ee1d8C5b022Be115A2AD3c30C72E34e7F096', blockNumber: 41908657 }
//   },
//   168587773: {
//     SpokePool: { address: '0x5545092553Cf5Bf786e87a87192E902D50D8f022', blockNumber: 7634204 }
//   },
//   1868: {
//     SpokePool: { address: '0x3baD7AD0728f9917d1Bf08af5782dCbD516cDd96', blockNumber: 1709997 }
//   },
//   288: {
//     SpokePool: { address: '0xBbc6009fEfFc27ce705322832Cb2068F8C1e0A58', blockNumber: 619993 }
//   },
//   324: {
//     SpokePool: { address: '0xE0B015E54d54fc84a6cB9B666099c46adE9335FF', blockNumber: 10352565 }
//   },
//   34443: {
//     SpokePool: { address: '0x3baD7AD0728f9917d1Bf08af5782dCbD516cDd96', blockNumber: 8043187 }
//   },
//   37111: {
//     SpokePool: { address: '0x6A0a7f39530923911832Dd60667CE5da5449967B', blockNumber: 156275 }
//   },
//   41455: {
//     SpokePool: { address: '0x13fDac9F9b4777705db45291bbFF3c972c6d1d97', blockNumber: 4240318 }
//   },
//   4202: {
//     SpokePool: { address: '0xeF684C38F94F48775959ECf2012D7E864ffb9dd4', blockNumber: 7267988 }
//   },
//   42161: {
//     SpokePool: { address: '0xe35e9842fceaCA96570B734083f4a58e8F7C5f2A', blockNumber: 83868041 }
//   },
//   421614: {
//     SpokePool: { address: '0x7E63A5f1a8F0B4d0934B2f2327DAED3F6bb2ee75', blockNumber: 12411026 }
//   },
//   480: {
//     SpokePool: { address: '0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64', blockNumber: 4524742 }
//   },
//   534352: {
//     SpokePool: { address: '0x3baD7AD0728f9917d1Bf08af5782dCbD516cDd96', blockNumber: 7489705 }
//   },
//   57073: {
//     SpokePool: { address: '0xeF684C38F94F48775959ECf2012D7E864ffb9dd4', blockNumber: 1139240 }
//   },
//   59144: {
//     SpokePool: { address: '0x7E63A5f1a8F0B4d0934B2f2327DAED3F6bb2ee75', blockNumber: 2721169 }
//   },
//   690: {
//     SpokePool: { address: '0x13fDac9F9b4777705db45291bbFF3c972c6d1d97', blockNumber: 5512122 }
//   },
//   7777777: {
//     SpokePool: { address: '0x13fDac9F9b4777705db45291bbFF3c972c6d1d97', blockNumber: 18382867 }
//   },
//   80002: {
//     SpokePool: { address: '0xd08baaE74D6d2eAb1F3320B2E1a53eeb391ce8e5', blockNumber: 7529960 }
//   },
//   81457: {
//     SpokePool: { address: '0x2D509190Ed0172ba588407D4c2df918F955Cc6E1', blockNumber: 5574280 }
//   },
//   8453: {
//     SpokePool: { address: '0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64', blockNumber: 2164878 }
//   },
//   84532: {
//     SpokePool: { address: '0x82B564983aE7274c86695917BBf8C99ECb6F0F8F', blockNumber: 6082004 }
//   },
//   919: {
//     SpokePool: { address: '0xbd886FC0725Cc459b55BbFEb3E4278610331f83b', blockNumber: 13999465 }
//   }
// };
