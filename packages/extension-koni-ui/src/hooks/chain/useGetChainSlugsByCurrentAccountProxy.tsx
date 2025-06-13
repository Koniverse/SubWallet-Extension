// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCoreCreateGetChainSlugsByAccountProxy, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { useMemo } from 'react';

const useGetChainSlugsByCurrentAccountProxy = (): string[] => {
  const currentAccountProxy = useSelector((state) => state.accountState.currentAccountProxy);
  const getChainSlugsByAccountProxy = useCoreCreateGetChainSlugsByAccountProxy();

  return useMemo(() => {
    if (!currentAccountProxy) {
      return [];
    }

    return getChainSlugsByAccountProxy(currentAccountProxy);
  }, [currentAccountProxy, getChainSlugsByAccountProxy]);
};

export default useGetChainSlugsByCurrentAccountProxy;
