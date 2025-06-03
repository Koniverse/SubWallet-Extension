// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { AccountProxy } from '@subwallet/extension-base/types';

const useCoreIsChainInfoCompatibleWithAccountProxy = (chainInfo: _ChainInfo, accountProxies: AccountProxy): boolean => {
  return false;
};

export default useCoreIsChainInfoCompatibleWithAccountProxy;
