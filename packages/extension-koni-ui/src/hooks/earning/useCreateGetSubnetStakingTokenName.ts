// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RootState } from '@subwallet/extension-koni-ui/stores';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

function useCreateGetSubnetStakingTokenName () {
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);

  const bittensorMapping = useMemo(() => {
    const mapping: Record<string, string> = {};

    for (const asset of Object.values(assetRegistryMap)) {
      if (asset.originChain === 'bittensor' && asset.assetType === 'LOCAL' && asset.metadata?.netuid !== null && asset.metadata?.netuid !== undefined) {
        const netuid = asset.metadata.netuid;

        mapping[netuid] = asset.slug.toLowerCase();
      }
    }

    return mapping;
  }, [assetRegistryMap]);

  return useCallback((chain: string, netuid: number): string | undefined => {
    if (chain === 'bittensor') {
      return bittensorMapping[netuid];
    }

    return undefined;
  }, [bittensorMapping]);
}

export default useCreateGetSubnetStakingTokenName;
