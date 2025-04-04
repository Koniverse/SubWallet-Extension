// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AlgorithmId, CBORValue, COSEKey, CurveType, Int, KeyType, Label } from '@emurgo/cardano-message-signing-browser';
import { Address as CardanoAddress, AssetName, Assets, BigNum, MultiAsset, ScriptHash, TransactionHash, TransactionInput, TransactionOutput, TransactionUnspentOutput, Value as CardanoAmountValue } from '@emurgo/cardano-serialization-lib-nodejs';
import { CardanoBalanceItem, CardanoUtxosItem } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/cardano/types';
import { MetadataStore } from '@subwallet/extension-base/stores';
import { addMetadata } from '@subwallet/extension-chains';
import { MetadataDef } from '@subwallet/extension-inject/types';
import { hexToAscii } from 'web3-utils';

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

export const CoseLabel = {
  address: Label.new_text('address'),
  crv: Label.new_int(Int.new_i32(-1)),
  x: Label.new_int(Int.new_i32(-2))
};

export const createCOSEKey = (addressBytes: Uint8Array, publicKey: Uint8Array) => {
  const coseKey = COSEKey.new(Label.from_key_type(KeyType.OKP));

  coseKey.set_key_id(addressBytes);
  coseKey.set_algorithm_id(Label.from_algorithm_id(AlgorithmId.EdDSA));
  coseKey.set_header(CoseLabel.crv, CBORValue.from_label(Label.from_curve_type(CurveType.Ed25519)));
  coseKey.set_header(CoseLabel.x, CBORValue.new_bytes(publicKey));

  return coseKey;
};

const convertAssetToValue = (amount: CardanoBalanceItem[]): CardanoAmountValue => {
  const value = CardanoAmountValue.new(BigNum.from_str('0'));
  const multiAsset = MultiAsset.new();

  for (const item of amount) {
    if (item.unit === 'lovelace') {
      value.set_coin(BigNum.from_str(item.quantity));
    } else {
      const policyIdHex = item.unit.slice(0, 56);
      const assetNameHex = item.unit.slice(56);

      const scriptHash = ScriptHash.from_bytes(Buffer.from(policyIdHex, 'hex'));
      const assetName = AssetName.new(Buffer.from(assetNameHex, 'hex'));
      const quantity = BigNum.from_str(item.quantity);

      let assets = multiAsset.get(scriptHash);

      if (!assets) {
        assets = Assets.new();
        multiAsset.insert(scriptHash, assets);
      }

      assets.insert(assetName, quantity);
    }
  }

  if (multiAsset.len() > 0) {
    value.set_multiasset(multiAsset);
  }

  return value;
};

export const convertValueToAsset = (value: CardanoAmountValue): CardanoBalanceItem[] => {
  const assets = [];

  assets.push({ unit: 'lovelace', quantity: value.coin().toString() });
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
          quantity: quantity?.toString() ?? '0',
          policy: policy.to_hex(),
          name: hexToAscii(assetName.to_hex()),
          fingerprint: `${policy.to_hex()}${assetName.to_hex()}`
        });
      }
    }
  }

  return assets;
};

export const convertUtxoRawToUtxo = (utxos: CardanoUtxosItem[]) => {
  return utxos.map((utxo) => {
    const txHash = TransactionHash.from_bytes(Buffer.from(utxo.tx_hash, 'hex'));

    const txIndex = utxo.output_index;

    const input = TransactionInput.new(txHash, txIndex);
    const value = convertAssetToValue(utxo.amount);

    const txOutput = TransactionOutput.new(
      CardanoAddress.from_bech32(utxo.address),
      value
    );

    return TransactionUnspentOutput.new(input, txOutput);
  });
};
