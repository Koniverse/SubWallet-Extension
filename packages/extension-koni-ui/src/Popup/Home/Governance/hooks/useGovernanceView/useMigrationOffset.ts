// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _EXPECTED_BLOCK_TIME } from '@subwallet/extension-base/services/chain-service/constants';
import { SubsquareApiSdk } from '@subwallet/subsquare-api-sdk';
import { useQuery } from '@tanstack/react-query';

const MIGRATED_CHAINS = [
  'statemine',
  'statemint'
];

const CACHE_TTL = 20 * 60 * 1000;

export function useMigrationOffset (chain: string, sdk: SubsquareApiSdk | undefined) {
  const enabled = MIGRATED_CHAINS.includes(chain);

  return useQuery({ queryKey: ['migrationOffset', chain],
    queryFn: async () => {
      if (!enabled || !sdk) {
        return 0;
      }

      const offset = await sdk.getMigrationBlockOffset(_EXPECTED_BLOCK_TIME[chain]);

      return offset ?? 0;
    },
    enabled,
    staleTime: CACHE_TTL,
    gcTime: CACHE_TTL });
}
