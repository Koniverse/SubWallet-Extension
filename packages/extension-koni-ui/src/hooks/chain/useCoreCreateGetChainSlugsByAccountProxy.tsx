// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxy } from '@subwallet/extension-base/types';
import { useCallback } from 'react';

const useCoreCreateGetChainSlugsByAccountProxy = () => {
  return useCallback((accountProxies: AccountProxy): string[] => {
    return [];
  }, []);
};

export default useCoreCreateGetChainSlugsByAccountProxy;
