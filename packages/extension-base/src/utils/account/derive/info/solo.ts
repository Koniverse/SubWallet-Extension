// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountDeriveData, DeriveInfo, IDerivePathInfo_, NextDerivePair } from '@subwallet/extension-base/types';
import { getDerivePath } from '@subwallet/keyring';
import { BitcoinKeypairTypes, EthereumKeypairTypes, KeypairType, KeyringPair, SubstrateKeypairType, SubstrateKeypairTypes, TonWalletContractVersion } from '@subwallet/keyring/types';
import { keyring } from '@subwallet/ui-keyring';
import { t } from 'i18next';

import { assert } from '@polkadot/util';

import { validateBitcoinDerivationPath, validateCardanoDerivationPath, validateEvmDerivationPath, validateOtherSubstrateDerivationPath, validateSr25519DerivationPath, validateTonDerivationPath, validateUnifiedDerivationPath } from '../validate';

const bitPathLv1 = "m/{proposal}'/{slip44}'/{firstIndex}'/0/0";
const bitPathLv2 = "m/{proposal}'/{slip44}'/{firstIndex}'/0/0/{secondIndex}";

const getBitLv1DerivePathFunction = (slip44: number, proposal: number) => {
  return bitPathLv1
    .replace('{proposal}', proposal.toString())
    .replace('{slip44}', slip44.toString());
};

const getBitLv2DerivePathFunction = (slip44: number, proposal: number) => {
  return bitPathLv2
    .replace('{proposal}', proposal.toString())
    .replace('{slip44}', slip44.toString());
};

const level1DerivationPathMap: Partial<Record<KeypairType, string>> = {
  ethereum: "m/44'/60'/0'/0/{firstIndex}",
  ton: "m/44'/607'/{firstIndex}'",
  cardano: "m/1852'/1815'/{firstIndex}'",
  'bitcoin-44': getBitLv1DerivePathFunction(0, 44),
  'bitcoin-84': getBitLv1DerivePathFunction(0, 84),
  'bitcoin-86': getBitLv1DerivePathFunction(0, 86),
  'bittest-44': getBitLv1DerivePathFunction(1, 44),
  'bittest-84': getBitLv1DerivePathFunction(1, 84),
  'bittest-86': getBitLv1DerivePathFunction(1, 86)
};

const level2DerivationPathMap: Partial<Record<KeypairType, string>> = {
  ethereum: "m/44'/60'/0'/0/{firstIndex}/{secondIndex}",
  ton: "m/44'/607'/{firstIndex}'/{secondIndex}'",
  cardano: "m/1852'/1815'/{firstIndex}'/{secondIndex}'",
  'bitcoin-44': getBitLv2DerivePathFunction(0, 44),
  'bitcoin-84': getBitLv2DerivePathFunction(0, 84),
  'bitcoin-86': getBitLv2DerivePathFunction(0, 86),
  'bittest-44': getBitLv2DerivePathFunction(1, 44),
  'bittest-84': getBitLv2DerivePathFunction(1, 84),
  'bittest-86': getBitLv2DerivePathFunction(1, 86)
};

export const parseUnifiedSuriToDerivationPath = (suri: string, type: KeypairType): string => {
  const reg = /^\/\/(\d+)(\/\/\d+)?$/;

  if (suri.match(reg)) {
    const [, firstIndex, secondData] = suri.match(reg) as string[];

    if (secondData) {
      const [, secondIndex] = secondData.match(/\/\/(\d+)/) as string[];

      const path = level2DerivationPathMap[type];

      if (path) {
        return path.replace('{firstIndex}', firstIndex).replace('{secondIndex}', secondIndex);
      }
    } else {
      const path = level1DerivationPathMap[type];

      if (path) {
        return path.replace('{firstIndex}', firstIndex);
      }
    }

    if (SubstrateKeypairTypes.includes(type)) {
      return suri;
    }
  }

  return '';
};

const validateNonSubstrateDerivationPath = (derivePath: string, type: KeypairType): IDerivePathInfo_ | undefined => {
  let validateTypeRs: IDerivePathInfo_ | undefined;

  switch (type) {
    case 'ethereum':
      validateTypeRs = validateEvmDerivationPath(derivePath);
      break;
    case 'ton':
      validateTypeRs = validateTonDerivationPath(derivePath);
      break;
    case 'cardano':
      validateTypeRs = validateCardanoDerivationPath(derivePath);
      break;
    case 'bitcoin-44':
    case 'bitcoin-84':
    case 'bitcoin-86':
    case 'bittest-44':
    case 'bittest-84':
    case 'bittest-86':
      validateTypeRs = validateBitcoinDerivationPath(derivePath);
      break;
  }

  if (validateTypeRs && validateTypeRs.type === type) {
    return validateTypeRs;
  } else {
    return undefined;
  }
};

export const getSoloDerivationInfo = (type: KeypairType, metadata: AccountDeriveData = {}): DeriveInfo => {
  const { derivationPath: derivePath, parentAddress, suri } = metadata;

  if (suri) {
    if (derivePath) {
      const validateTypeRs = validateNonSubstrateDerivationPath(derivePath, type);

      if (validateTypeRs) {
        return {
          suri: validateTypeRs.suri,
          depth: validateTypeRs.depth,
          derivationPath: derivePath,
          parentAddress,
          autoIndexes: validateTypeRs.autoIndexes
        };
      } else {
        return {
          depth: 1,
          derivationPath: derivePath,
          parentAddress,
          suri
        };
      }
    } else {
      if (SubstrateKeypairTypes.includes(type)) {
        const _type = type as SubstrateKeypairType;
        const validateTypeFunc = _type === 'sr25519' ? validateSr25519DerivationPath : (raw: string) => validateOtherSubstrateDerivationPath(raw, _type);
        const validateTypeRs = validateTypeFunc(suri);

        if (validateTypeRs) {
          return {
            suri: validateTypeRs.suri,
            depth: validateTypeRs.depth,
            parentAddress,
            autoIndexes: validateTypeRs.autoIndexes
          };
        }
      }

      const validateUnifiedRs = validateUnifiedDerivationPath(suri);

      if (validateUnifiedRs) {
        const { autoIndexes, depth } = validateUnifiedRs;
        const derivationPath = parseUnifiedSuriToDerivationPath(suri, type);

        return {
          suri: suri,
          depth,
          derivationPath: derivationPath,
          parentAddress,
          autoIndexes
        };
      } else {
        return {
          depth: 1,
          derivationPath: derivePath,
          parentAddress,
          suri
        };
      }
    }
  } else {
    if (derivePath) {
      const validateTypeRs = validateNonSubstrateDerivationPath(derivePath, type);

      if (validateTypeRs) {
        return {
          suri: validateTypeRs.suri,
          depth: validateTypeRs.depth,
          derivationPath: derivePath,
          parentAddress,
          autoIndexes: validateTypeRs.autoIndexes
        };
      } else {
        return {
          depth: 1,
          derivationPath: derivePath,
          parentAddress,
          suri
        };
      }
    }
  }

  return {
    depth: 0,
    parentAddress,
    suri: suri
  };
};

/**
 * @func findSoloNextDerive
 * @return {NextDerivePair}
 * */
export const findSoloNextDerive = (parentAddress: string): NextDerivePair => {
  let parentPair: KeyringPair | undefined;

  try {
    parentPair = keyring.getPair(parentAddress);
  } catch (e) {

  }

  assert(parentPair, t('bg.util.account.deriveSoloInfo.unableToFindAccount'));

  const deriveInfo = getSoloDerivationInfo(parentPair.type, parentPair.meta);
  const needChangeRoot = deriveInfo.depth > 0;
  let rootPair: KeyringPair | undefined;

  if (needChangeRoot) {
    try {
      rootPair = keyring.getPair(parentPair.meta.parentAddress as string || '');
    } catch (e) {

    }
  } else {
    rootPair = parentPair;
  }

  assert(rootPair, t('bg.util.account.deriveSoloInfo.unableToFindParentAccount'));

  const rootAddress = rootPair.address;
  const currentDepth = deriveInfo.depth;
  const currentIndex = deriveInfo.autoIndexes?.[currentDepth - 1];
  const pairs = keyring.getPairs();
  const children = pairs.filter((p) => p.meta.parentAddress === rootAddress);
  const childrenMetadata = children
    .map(({ meta, type }) => getSoloDerivationInfo(type, meta))
    .filter(({ autoIndexes, depth }) => {
      return depth === currentDepth + 1 && currentIndex === autoIndexes?.[currentDepth - 1];
    })
    .sort((a, b) => {
      const aDeriveIndex = a.autoIndexes?.[currentDepth];
      const bDeriveIndex = b.autoIndexes?.[currentDepth];

      if (aDeriveIndex !== undefined && bDeriveIndex !== undefined) {
        return aDeriveIndex - bDeriveIndex;
      } else {
        if (aDeriveIndex === undefined && bDeriveIndex === undefined) {
          return 0;
        } else {
          return aDeriveIndex === undefined ? 1 : -1;
        }
      }
    });

  let index = currentDepth === 0 ? 1 : 0;

  for (const { autoIndexes, suri } of childrenMetadata) {
    const _autoIndexes = autoIndexes as number[];
    const deriveIndex = _autoIndexes[currentDepth];

    if (!suri || deriveIndex === undefined) {
      break;
    }

    if (deriveIndex === index) {
      index++;
    } else if (currentDepth === 0 && deriveIndex === 0 && index > deriveIndex) {
      // Special case for the first account on the root
    } else {
      break;
    }
  }

  const isSubstrate = SubstrateKeypairTypes.includes(parentPair.type);

  const indexes: number[] = currentDepth > 0 ? (deriveInfo.autoIndexes || []) as number[] : [];

  indexes.push(index);

  const suri = isSubstrate ? [deriveInfo.suri || '', index].join('//') : '//'.concat(indexes.join('//'));

  return {
    deriveIndex: index,
    depth: currentDepth + 1,
    derivationPath: parseUnifiedSuriToDerivationPath(suri, rootPair.type),
    suri,
    deriveAddress: rootAddress
  };
};

export const derivePair = (parentPair: KeyringPair, name: string, suri: string, derivationPath?: string): KeyringPair => {
  if (parentPair.isLocked) {
    keyring.unlockPair(parentPair.address);
  }

  const isEvm = EthereumKeypairTypes.includes(parentPair.type);
  const isTon = parentPair.type === 'ton';
  const isCardano = parentPair.type === 'cardano';
  const isBitcoin = BitcoinKeypairTypes.includes(parentPair.type);

  const meta = {
    name,
    parentAddress: parentPair.address,
    suri: suri,
    derivationPath,
    tonContractVersion: undefined as unknown as TonWalletContractVersion
  };

  if (isTon && parentPair.ton?.contractVersion) {
    meta.tonContractVersion = parentPair.ton.contractVersion;
  }

  if (derivationPath && (isEvm || isTon || isCardano || isBitcoin)) {
    return isEvm
      ? parentPair.evm.deriveCustom(derivationPath, meta)
      : isTon
        ? parentPair.ton.deriveCustom(derivationPath, meta)
        : isCardano
          ? parentPair.cardano.deriveCustom(derivationPath, meta)
          : parentPair.bitcoin.deriveCustom(derivationPath, meta);
  } else {
    return parentPair.substrate.derive(suri, meta);
  }
};

export const getSuri = (seed: string, type?: KeypairType): string => {
  const extraPath = type ? getDerivePath(type)(0) : '';

  return seed + (extraPath ? '/' + extraPath : '');
};
