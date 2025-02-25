// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { fetchStaticData } from '@subwallet/extension-base/utils';
import { useCallback, useEffect, useState } from 'react';

const useIsPolkadotUnifiedChain = () => {
  const [chainOldPrefixMapping, setChainOldPrefixMapping] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchStaticData<Record<string, number>>('old-chain-prefix')
      .then((result) => {
        setChainOldPrefixMapping(result);
      })
      .catch((error) => {
        console.error('Error fetching static data:', error);
      });
  }, []);

  return useCallback((chainSlug?: string): boolean => {
    if (!chainSlug) {
      return false;
    }

    return Object.prototype.hasOwnProperty.call(chainOldPrefixMapping, chainSlug);
  }, [chainOldPrefixMapping]);
};

export default useIsPolkadotUnifiedChain;
