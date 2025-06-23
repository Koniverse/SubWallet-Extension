// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { AccountJson } from '@subwallet/extension-base/types';
import { getReformatedAddressRelatedToChain } from '@subwallet/extension-koni-ui/utils';
import { useCallback } from 'react';

const useCoreCreateReformatAddress = () => {
  return useCallback((accountJson: AccountJson, chainInfo: _ChainInfo): string | undefined => {
    return getReformatedAddressRelatedToChain(accountJson, chainInfo);
  }, []);
};

export default useCoreCreateReformatAddress;
