// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';
import { CardanoBalanceItem, CardanoUtxosItem } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/cardano/types';
import { MetadataStore } from '@subwallet/extension-base/stores';
import { addMetadata } from '@subwallet/extension-chains';
import { MetadataDef } from '@subwallet/extension-inject/types';

import { knownGenesis } from '@polkadot/networks/defaults';
import { HexString } from '@polkadot/util/types';

export const extractMetadata = (store: MetadataStore): void => {
  store.allMap((map): void => {
    const knownEntries = Object.entries(knownGenesis);
    const defs: Record<string, { def: MetadataDef, index: number, key: string }> = {};
    const removals: string[] = [];

    Object
      .entries(map)
      .forEach(([key, def]): void => {
        const entry = knownEntries.find(([, hashes]) => hashes.includes(def.genesisHash as HexString));

        if (entry) {
          const [name, hashes] = entry;
          const index = hashes.indexOf(def.genesisHash as HexString);

          // flatten the known metadata based on the genesis index
          // (lower is better/newer)
          if (!defs[name] || (defs[name].index > index)) {
            if (defs[name]) {
              // remove the old version of the metadata
              removals.push(defs[name].key);
            }

            defs[name] = { def, index, key };
          }
        } else {
          // this is not a known entry, so we will just apply it
          defs[key] = { def, index: 0, key };
        }
      });

    removals.forEach((key) => store.remove(key));
    Object.values(defs).forEach(({ def }) => addMetadata(def));
  });
};

export const convertAssetToValue = (amount: CardanoBalanceItem[]): CardanoWasm.Value => {
  const value = CardanoWasm.Value.new(CardanoWasm.BigNum.from_str('0'));
  const multiAsset = CardanoWasm.MultiAsset.new();

  for (const item of amount) {
    if (item.unit === 'lovelace') {
      value.set_coin(CardanoWasm.BigNum.from_str(item.quantity));
    } else {
      const policyIdHex = item.unit.slice(0, 56);
      const assetNameHex = item.unit.slice(56);

      const scriptHash = CardanoWasm.ScriptHash.from_bytes(Buffer.from(policyIdHex, 'hex'));
      const assetName = CardanoWasm.AssetName.new(Buffer.from(assetNameHex, 'hex'));
      const quantity = CardanoWasm.BigNum.from_str(item.quantity);

      let assets = multiAsset.get(scriptHash);

      if (!assets) {
        assets = CardanoWasm.Assets.new();
      }

      assets.insert(assetName, quantity);
      multiAsset.insert(scriptHash, assets);
    }
  }

  if (multiAsset.len() > 0) {
    value.set_multiasset(multiAsset);
  }

  return value;
};

export const convertValueToAsset = (value: CardanoWasm.Value): CardanoBalanceItem[] => {
  const assets = [];

  assets.push({ unit: 'lovelace', quantity: value.coin().to_js_value() });
  const multiAssets = value.multiasset()?.keys();

  if (multiAssets) {
    for (let j = 0; j < multiAssets.len(); j++) {
      const policy = multiAssets.get(j);

      const policyAssets = value.multiasset()?.get(policy);

      if (!policyAssets) {
        continue;
      }

      const assetNames = policyAssets.keys();

      for (let k = 0; k < assetNames.len(); k++) {
        const assetName = assetNames.get(k);
        const quantity = policyAssets.get(assetName);

        const assetUnit = `${policy.to_hex()}${assetName.to_hex()}`;

        assets.push({
          unit: assetUnit,
          quantity: quantity?.to_js_value() ?? '0',
          policy: policy.to_hex(),
          name: Buffer.from(assetName.to_hex(), 'hex').toString(),
          fingerprint: `${policy.to_hex()}${assetName.to_hex()}`
        });
      }
    }
  }

  return assets;
};

export const convertUtxoRawToUtxo = (utxos: CardanoUtxosItem[]) => {
  return utxos.map((utxo) => {
    const txHash = CardanoWasm.TransactionHash.from_bytes(Buffer.from(utxo.tx_hash, 'hex'));

    const txIndex = utxo.output_index;

    const input = CardanoWasm.TransactionInput.new(txHash, txIndex);
    const value = convertAssetToValue(utxo.amount);

    const txOutput = CardanoWasm.TransactionOutput.new(
      CardanoWasm.Address.from_bech32(utxo.address),
      value
    );

    return CardanoWasm.TransactionUnspentOutput.new(input, txOutput);
  });
};

export function getBalanceAddressMap (outputs: CardanoWasm.TransactionOutputs) {
  const acc: Record<string, CardanoWasm.Value> = {};

  for (let i = 0; i < outputs.len(); i++) {
    const item = outputs.get(i);
    const address = item.address().to_bech32();

    if (!acc[address]) {
      acc[address] = item.amount();
    } else {
      acc[address] = acc[address].checked_add(item.amount());
    }
  }

  return acc;
}

/**
 * Extracts all required key hashes from a list of certificates.
 * Handles different certificate kinds: stake deregistration, delegation,
 * pool registration, pool retirement, and MIR (move instantaneous rewards).
 *
 * Only processes key hash credentials (ignores script credentials).
 *
 * @param {Certificates} certificates - List of certificate objects from a transaction body.
 * @returns {string[]} - An array of required key hashes in hex format.
 */

export function extractKeyHashFromCertificate (certificates?: CardanoWasm.Certificates): string[] {
  if (!certificates) {
    return [];
  }

  const requiredKeyHashes: string[] = [];

  // Helper: Extract key hash from stake credential (only if it's a public key)
  const extractKeyHash = (credential: CardanoWasm.Credential) => {
    if (credential.kind() === 0) {
      // kind === 0 => StakeCredential is a public key
      return credential.to_keyhash()?.to_hex();
    }

    return null;
  };

  for (let i = 0; i < certificates.len(); i++) {
    const cert = certificates.get(i);

    switch (cert.kind()) {
      case 0: {
        // Stake Registration Certificate
        // No key hash required here, just registration action
        break;
      }

      case 1: {
        // Stake Deregistration Certificate
        const credential = cert.as_stake_deregistration()?.stake_credential();

        if (!credential) {
          break;
        }

        const hash = extractKeyHash(credential);

        if (hash) {
          requiredKeyHashes.push(hash);
        }

        break;
      }

      case 2: {
        // Stake Delegation Certificate
        const credential = cert.as_stake_delegation()?.stake_credential();

        if (!credential) {
          break;
        }

        const hash = extractKeyHash(credential);

        if (hash) {
          requiredKeyHashes.push(hash);
        }

        break;
      }

      case 3: {
        // Pool Registration Certificate
        // Collect all pool owner key hashes
        const owners = cert.as_pool_registration()?.pool_params().pool_owners();

        if (!owners) {
          break;
        }

        for (let j = 0; j < owners.len(); j++) {
          const ownerKeyHash = owners.get(j).to_hex();

          requiredKeyHashes.push(ownerKeyHash);
        }

        break;
      }

      case 4: {
        // Pool Retirement Certificate
        // The operator key hash is required to authorize retirement
        const operator = cert.as_pool_retirement()?.pool_keyhash().to_hex();

        if (!operator) {
          break;
        }

        requiredKeyHashes.push(operator);
        break;
      }

      case 6: {
        // Move Instantaneous Rewards Certificate
        // Extract key hashes from reward receivers
        const rewards = cert.as_move_instantaneous_rewards_cert()?.move_instantaneous_reward().as_to_stake_creds()?.keys();

        if (!rewards) {
          break;
        }

        for (let j = 0; j < rewards.len(); j++) {
          const hash = extractKeyHash(rewards.get(j));

          if (hash) {
            requiredKeyHashes.push(hash);
          }
        }

        break;
      }

      default: {
        // Unknown or unsupported certificate kind — skip
        break;
      }
    }
  }

  return requiredKeyHashes;
}

/**
 * Extracts required key hashes from withdrawal entries.
 * It processes only credentials of kind 0 (key hash based).
 *
 * @param {Withdrawals} withdrawals - The withdrawal map from a transaction body.
 * @returns {string[]} - An array of required key hashes in hex format.
 */

export function extractKeyHashesFromWithdrawals (withdrawals?: CardanoWasm.Withdrawals): string[] {
  if (!withdrawals) {
    return [];
  }

  const requiredKeyHashes: string[] = [];

  const rewardAccounts = withdrawals.keys();

  for (let i = 0; i < rewardAccounts.len(); i++) {
    const stakeCred = rewardAccounts.get(i).payment_cred();

    // Check if the credential is a key hash (not a script)
    const keyHash = stakeCred.to_keyhash();

    if (stakeCred.kind() === 0 && keyHash) {
      const hexHash = Buffer.from(keyHash.to_bytes()).toString('hex');

      requiredKeyHashes.push(hexHash);
    }
  }

  return requiredKeyHashes;
}

/**
 * Recursively extract all Ed25519 key hashes from a NativeScripts collection.
 * Only processes `ScriptPubkey` entries (kind = 0), and traverses through nested scripts.
 *
 * @param {NativeScripts} scripts - A collection of native scripts.
 * @returns {string[]} - An array of key hashes (hex-encoded) from all script_pubkey entries.
 */

export function extractKeyHashesFromScripts (scripts?: CardanoWasm.NativeScripts): string[] {
  if (!scripts) {
    return [];
  }

  const keyHashes: string[] = [];

  for (let i = 0; i < scripts.len(); i++) {
    const script = scripts.get(i);

    switch (script.kind()) {
      case 0: { // ScriptPubkey
        const pubkeyHash = script.as_script_pubkey()?.addr_keyhash();

        if (!pubkeyHash) {
          break;
        }

        const hexHash = pubkeyHash.to_hex();

        keyHashes.push(hexHash);
        break;
      }

      case 1: { // ScriptAll
        const nestedScripts = script.as_script_all()?.native_scripts();

        keyHashes.push(...extractKeyHashesFromScripts(nestedScripts));
        break;
      }

      case 2: { // ScriptAny
        const nestedScripts = script.as_script_any()?.native_scripts();

        keyHashes.push(...extractKeyHashesFromScripts(nestedScripts));
        break;
      }

      case 3: { // ScriptNOfK
        const nestedScripts = script.as_script_n_of_k()?.native_scripts();

        keyHashes.push(...extractKeyHashesFromScripts(nestedScripts));
        break;
      }

      default:
        // Unknown kind, skip
        break;
    }
  }

  return keyHashes;
}

/**
 * Extract required key hashes from the RequiredSigners field in the transaction body.
 * Each entry is an Ed25519 key hash that must sign the transaction.
 *
 * @param {Ed25519KeyHashes} requiredSigners - A list of required signer key hashes.
 * @returns {string[]} - Array of hex-encoded Ed25519 key hashes.
 */
export function extractKeyHashesFromRequiredSigners (requiredSigners?: CardanoWasm.Ed25519KeyHashes): string[] {
  if (!requiredSigners) {
    return [];
  }

  const result: string[] = [];

  for (let i = 0; i < requiredSigners.len(); i++) {
    result.push(requiredSigners.get(i).to_hex());
  }

  return result;
}

/**
 * Extract required key hashes from collateral inputs in a linear and readable flow.
 *
 * This function resolves UTXOs of each collateral input,
 * attempts to extract the payment key hash from various supported address types,
 * and returns an array of required signer key hashes in hex format.
 *
 * @param {TransactionInputs} collaterals - Collateral inputs used for script validation
 * @param getSpecificUtxo
 * @returns {Promise<string[]>} - Hex-encoded key hashes required to sign the transaction
 */
export async function extractKeyHashesFromCollaterals (
  collaterals?: CardanoWasm.TransactionInputs,
  getSpecificUtxo?: (txHash: string, txId: number) => Promise<CardanoUtxosItem | undefined>
): Promise<string[]> {
  if (!collaterals || !getSpecificUtxo) {
    return [];
  }

  const keyHashes: string[] = [];

  for (let i = 0; i < collaterals.len(); i++) {
    const collateral = collaterals.get(i);

    // Resolve UTXO from tx_id + index
    const txId = collateral.transaction_id().to_hex();
    const utxo = await getSpecificUtxo(txId, collateral.index());

    if (!utxo) {
      continue;
    }

    // Load address object from UTXO
    const address = CardanoWasm.Address.from_bech32(utxo.address);

    // Try extracting payment key hash from different address types
    const types = [
      CardanoWasm.BaseAddress,
      CardanoWasm.EnterpriseAddress,
      CardanoWasm.PointerAddress
    ];

    let extracted = false;

    for (const Type of types) {
      try {
        const paymentCred = Type.from_address(address)?.payment_cred();
        const keyHash = paymentCred?.to_keyhash();

        if (keyHash) {
          keyHashes.push(keyHash.to_hex());
          extracted = true;
          break;
        }
      } catch (_) {
        // Skip to next type
      }
    }

    if (!extracted) {
      throw new Error('Unsupported collateral address type');
    }
  }

  return keyHashes;
}

/// Check if valueA has sufficient value to cover valueB
export function hasSufficientCardanoValue (
  valueA: CardanoWasm.Value,
  valueB: CardanoWasm.Value
): boolean {
  const coinA = BigInt(valueA.coin().to_str());
  const coinB = BigInt(valueB.coin().to_str());

  // Check if ADA amount in valueA is less than required in valueB
  if (coinA < coinB) {
    return false;
  }

  const multiAssetB = valueB.multiasset();

  if (!multiAssetB) {
    return true;
  } // No assets required in valueB

  const multiAssetA = valueA.multiasset();

  if (!multiAssetA) {
    return false;
  } // valueA has no assets but valueB requires them

  const policyIds = multiAssetB.keys();

  for (let i = 0; i < policyIds.len(); i++) {
    const policyId = policyIds.get(i);
    const assetsB = multiAssetB.get(policyId);
    const assetsA = multiAssetA.get(policyId);

    if (!assetsB) {
      continue;
    }

    if (!assetsA) {
      return false;
    } // Required policy ID is missing in valueA

    const assetNames = assetsB.keys();

    for (let j = 0; j < assetNames.len(); j++) {
      const assetName = assetNames.get(j);
      const quantityB = BigInt(assetsB.get(assetName)?.to_str() ?? '0');
      const quantityA = BigInt(assetsA.get(assetName)?.to_str() ?? '0');

      // Check if asset quantity in valueA is less than required
      if (quantityA < quantityB) {
        return false;
      }
    }
  }

  return true;
}
