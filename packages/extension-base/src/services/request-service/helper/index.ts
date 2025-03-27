// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AlgorithmId, CBORValue, COSEKey, CurveType, Int, KeyType, Label } from '@emurgo/cardano-message-signing-browser';
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
