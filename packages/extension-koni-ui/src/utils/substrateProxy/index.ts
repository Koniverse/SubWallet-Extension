// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubstrateProxyType } from '@subwallet/extension-base/types';

export const getSubstrateProxyAddressKey = (address: string, substrateProxyType: SubstrateProxyType) => substrateProxyType + ':' + address;
