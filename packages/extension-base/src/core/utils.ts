// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _AssetType, _ChainAsset } from '@subwallet/chain-list/types';
import { ExtrinsicType, SufficientChainsDetails, SufficientMetadata } from '@subwallet/extension-base/background/KoniTypes';
import { BalanceAccountType } from '@subwallet/extension-base/core/substrate/types';
import { ActionType, LedgerMustCheckType, ValidateRecipientParams } from '@subwallet/extension-base/core/types';
import { tonAddressInfo } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/ton/utils';
import { _SubstrateAdapterQueryArgs, _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getTokenOnChainAssetId, _getXcmAssetMultilocation, _isBridgedToken, _isChainBitcoinCompatible, _isChainCardanoCompatible, _isChainCompatibleLedgerEvm, _isChainEvmCompatible, _isChainSubstrateCompatible, _isChainTonCompatible, _isSubstrateEvmCompatibleChain } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountChainType, AccountJson, AccountSignMode } from '@subwallet/extension-base/types';
import { isAddressAndChainCompatible, isSameAddress, isSubstrateEcdsaLedgerAssetSupported, reformatAddress } from '@subwallet/extension-base/utils';
import { isAddress, isCardanoTestnetAddress, isTonAddress } from '@subwallet/keyring';
import { getBitcoinAddressInfo, validateBitcoinAddress } from '@subwallet/keyring/utils';

import { AnyJson } from '@polkadot/types/types';
import { isEthereumAddress } from '@polkadot/util-crypto';

export function getStrictMode (type: string, extrinsicType?: ExtrinsicType) {
  if (type === BalanceAccountType.FrameSystemAccountInfo) {
    return !extrinsicType || ![ExtrinsicType.TRANSFER_BALANCE].includes(extrinsicType);
  }

  return false;
}

export function _getAppliedExistentialDeposit (existentialDeposit: string, strictMode?: boolean): bigint {
  return strictMode ? BigInt(existentialDeposit) : BigInt(0);
}

export function getMaxBigInt (a: bigint, b: bigint): bigint {
  return a > b ? a : b;
}

export function ledgerMustCheckNetwork (account: AccountJson | null): LedgerMustCheckType {
  if (account && account.isHardware && account.isGeneric && !isEthereumAddress(account.address)) {
    return account.originGenesisHash ? 'migration' : 'polkadot';
  } else {
    return 'unnecessary';
  }
}

// --- recipient address validation --- //

export function _isNotNull (validateRecipientParams: ValidateRecipientParams): string {
  const { toAddress } = validateRecipientParams;

  if (!toAddress) {
    return 'Recipient address is required';
  }

  return '';
}

export function _isAddress (validateRecipientParams: ValidateRecipientParams): string {
  const { toAddress } = validateRecipientParams;

  if (!isAddress(toAddress)) {
    return 'Invalid recipient address';
  }

  return '';
}

export function _isValidAddressForEcosystem (validateRecipientParams: ValidateRecipientParams): string {
  const { destChainInfo, toAddress } = validateRecipientParams;

  if (!isAddressAndChainCompatible(toAddress, destChainInfo)) {
    if (_isChainEvmCompatible(destChainInfo) ||
      _isChainSubstrateCompatible(destChainInfo) ||
      _isChainTonCompatible(destChainInfo) ||
      _isChainCardanoCompatible(destChainInfo) ||
      _isChainBitcoinCompatible(destChainInfo)) {
      return `Recipient address must be a valid ${destChainInfo.name} address`;
    }

    return 'Unknown chain type';
  }

  return '';
}

export function _isValidSubstrateAddressFormat (validateRecipientParams: ValidateRecipientParams): string {
  const { destChainInfo, toAddress } = validateRecipientParams;

  const addressPrefix = destChainInfo?.substrateInfo?.addressPrefix ?? 42;
  const toAddressFormatted = reformatAddress(toAddress, addressPrefix, undefined, false);

  if (toAddressFormatted && toAddressFormatted !== toAddress) {
    return `Recipient address must be a valid ${destChainInfo.name} address`;
  }

  return '';
}

export function _isValidTonAddressFormat (validateRecipientParams: ValidateRecipientParams): string {
  const { destChainInfo, toAddress } = validateRecipientParams;
  const tonInfoData = isTonAddress(toAddress) && tonAddressInfo(toAddress);

  if (tonInfoData && tonInfoData.isTestOnly !== destChainInfo.isTestnet) {
    return `Recipient address must be a valid ${destChainInfo.name} address`;
  }

  return '';
}

export function _isValidCardanoAddressFormat (validateRecipientParams: ValidateRecipientParams): string {
  const { destChainInfo, toAddress } = validateRecipientParams;

  if (isCardanoTestnetAddress(toAddress) !== destChainInfo.isTestnet) {
    return `Recipient address must be a valid ${destChainInfo.name} address`;
  }

  return '';
}

export function _isValidBitcoinAddressFormat (validateRecipientParams: ValidateRecipientParams): string {
  const { destChainInfo, toAddress } = validateRecipientParams;
  const addressInfo = validateBitcoinAddress(toAddress) ? getBitcoinAddressInfo(toAddress) : null;

  if (addressInfo?.network !== destChainInfo.bitcoinInfo?.bitcoinNetwork) {
    return `Recipient address must be a valid ${destChainInfo.name} address`;
  }

  return '';
}

export function _isNotDuplicateAddress (validateRecipientParams: ValidateRecipientParams): string {
  const { fromAddress, toAddress } = validateRecipientParams;

  if (isSameAddress(fromAddress, toAddress)) {
    return 'Recipient address must be different from sender address';
  }

  return '';
}

export function _isSupportLedgerAccount (validateRecipientParams: ValidateRecipientParams): string {
  const { account, actionType, allowLedgerGenerics, assetInfo, destChainInfo } = validateRecipientParams;

  if (account?.isHardware) {
    if (!account.isGeneric) {
      // For ledger legacy
      const availableGen: string[] = account.availableGenesisHashes || [];
      const destChainName = destChainInfo?.name || 'Unknown';

      if (!availableGen.includes(destChainInfo?.substrateInfo?.genesisHash || '')) {
        return 'Your Ledger account is not supported by {{network}} network.'.replace('{{network}}', destChainName);
      }
    } else {
      if (account.chainType === AccountChainType.ETHEREUM) {
        // For ecdsa substrate account in polkadot ledger app
        if (account.signMode === AccountSignMode.ECDSA_SUBSTRATE_LEDGER) {
          if (actionType === ActionType.SEND_NFT) {
            return 'Ledger Polkadot (EVM) address is not supported for NFT transfer';
          }

          if (!_isSubstrateEvmCompatibleChain(destChainInfo)) {
            return 'Ledger Polkadot (EVM) address is not supported for this transfer';
          } else if (assetInfo && !isSubstrateEcdsaLedgerAssetSupported(assetInfo, destChainInfo)) {
            return 'Ledger Polkadot (EVM) address is not supported for this transfer';
          }
        } else {
          if (!_isChainCompatibleLedgerEvm(destChainInfo)) {
            return 'Ledger EVM address is not supported for this transfer';
          }
        }
      }

      // For ledger generic
      const ledgerCheck = ledgerMustCheckNetwork(account);

      if (ledgerCheck !== 'unnecessary' && !allowLedgerGenerics.includes(destChainInfo.slug)) {
        return `Ledger ${ledgerCheck === 'polkadot' ? 'Polkadot' : 'Migration'} address is not supported for this transfer`;
      }
    }
  }

  return '';
}

export const _isSufficientToken = async (tokenInfo: _ChainAsset, substrateApi: _SubstrateApi, sufficientChain: SufficientChainsDetails): Promise<boolean> => {
  if (tokenInfo.assetType !== _AssetType.NATIVE) {
    const assetId = _isBridgedToken(tokenInfo) ? _getXcmAssetMultilocation(tokenInfo) : _getTokenOnChainAssetId(tokenInfo);
    const chainSlug = tokenInfo.originChain;

    const queryParams: _SubstrateAdapterQueryArgs = {
      section: 'query',
      args: [assetId]
    };

    if (sufficientChain.assetHubPallet.includes(chainSlug)) {
      if (!_isBridgedToken(tokenInfo)) {
        queryParams.module = 'assets';
      } else {
        queryParams.module = 'foreignAssets';
      }

      queryParams.method = 'asset';
    }

    if (sufficientChain.assetRegistryPallet.includes(chainSlug)) {
      queryParams.module = 'assetRegistry';
      queryParams.method = 'assets';
    }

    if (sufficientChain.assetsPallet.includes(chainSlug)) {
      queryParams.module = 'assets';
      queryParams.method = 'asset';
    }

    if (sufficientChain.foreignAssetsPallet.includes(chainSlug)) {
      queryParams.module = 'foreignAsset';
      queryParams.method = 'asset';
    }

    try {
      if (queryParams.method && queryParams.module) {
        const metadata = (await substrateApi.makeRpcQuery<AnyJson>(queryParams)) as unknown as SufficientMetadata;

        if (metadata?.isSufficient !== undefined) {
          return metadata?.isSufficient;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (tokenInfo.metadata?.isSufficient) {
    return tokenInfo.metadata?.isSufficient;
  }

  return false;
};
