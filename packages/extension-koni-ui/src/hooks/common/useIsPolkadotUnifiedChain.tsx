// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { UNIFIED_POLKADOT_CHAIN_SLUGS } from '@subwallet/extension-koni-ui/constants';
import { useCallback } from 'react';

const useIsPolkadotUnifiedChain = () => {
  return useCallback((chainSlug?: string): boolean => {
    return (
      UNIFIED_POLKADOT_CHAIN_SLUGS.some((slug) => chainSlug === slug)
    );
  }, []);
};

export default useIsPolkadotUnifiedChain;
