// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ProxyType } from '@subwallet/extension-base/types/proxy';

const PROXY_EXTRINSIC_GROUPS: Record<string, ExtrinsicType[]> = {
  STAKING: [
    ExtrinsicType.STAKING_BOND,
    ExtrinsicType.STAKING_UNBOND,
    ExtrinsicType.STAKING_WITHDRAW,
    ExtrinsicType.STAKING_JOIN_POOL,
    ExtrinsicType.STAKING_LEAVE_POOL
  ]
};

export const typeToProxyMap: Partial<Record<ExtrinsicType, ProxyType[]>> = {
  ...Object.fromEntries(PROXY_EXTRINSIC_GROUPS.STAKING.map((t) => [t, ['Staking', 'NonTransfer']]))
};
