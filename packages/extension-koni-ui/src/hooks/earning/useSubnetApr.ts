// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubnetAprResult, YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { getSubnetApr } from '@subwallet/extension-koni-ui/messaging';
import { useEffect, useState } from 'react';

/**
 * The APR of the Bittensor subnet on screen, computed from the chain (EXT-1, BE-2): undefined while it loads,
 * null when there is no figure — a subnet that has not run an epoch since it registered, or a failed read.
 */
export const useSubnetApr = (poolInfo?: YieldPoolInfo): SubnetAprResult | null | undefined => {
  const [apr, setApr] = useState<SubnetAprResult | null | undefined>();
  const slug = poolInfo?.slug;
  const netuid = poolInfo?.type === YieldPoolType.SUBNET_STAKING ? poolInfo.metadata.subnetData?.netuid : undefined;

  useEffect(() => {
    let cancel = false;

    setApr(undefined);

    if (slug && netuid) {
      getSubnetApr({ slug, netuid })
        .then((result) => {
          !cancel && setApr(result);
        })
        .catch((e) => {
          console.error(e);
          !cancel && setApr(null);
        });
    }

    return () => {
      cancel = true;
    };
  }, [netuid, slug]);

  return apr;
};
