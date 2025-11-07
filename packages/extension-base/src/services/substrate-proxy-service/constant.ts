// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { SubstrateProxyType } from '@subwallet/extension-base/types/substrateProxyAccount';

const SUBSTRATE_PROXY_ACCOUNT_EXTRINSIC_GROUPS: Record<string, ExtrinsicType[]> = {
  STAKING: [
    ExtrinsicType.STAKING_BOND,
    ExtrinsicType.STAKING_UNBOND,
    ExtrinsicType.STAKING_WITHDRAW,
    ExtrinsicType.STAKING_JOIN_POOL,
    ExtrinsicType.STAKING_LEAVE_POOL
  ]
};

// Map extrinsic type to possible substrate proxy types that can be used
// The governance proxy type will be support later
export const txTypeToSubstrateProxyMap: Partial<Record<ExtrinsicType, SubstrateProxyType[]>> = {
  ...Object.fromEntries(SUBSTRATE_PROXY_ACCOUNT_EXTRINSIC_GROUPS.STAKING.map((t) => [t, ['Staking', 'NonTransfer']]))
};
