// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { SubnetAprResult, YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { getSubnetApr } from '@subwallet/extension-koni-ui/messaging';
import { useEffect, useState } from 'react';

/**
 * The APR of the Bittensor pool on screen (EXT-1): a subnet's from the chain, root's (netuid 0) from the proxy's 30-day
 * figures. Undefined while it loads, null when there is no figure — a subnet that has not run an epoch since it
 * registered, root on testnet, or a failed read.
 */
export const useSubnetApr = (poolInfo?: YieldPoolInfo): SubnetAprResult | null | undefined => {
  const [apr, setApr] = useState<SubnetAprResult | null | undefined>();
  const slug = poolInfo?.slug;
  const isRoot = poolInfo?.type === YieldPoolType.NATIVE_STAKING && _STAKING_CHAIN_GROUP.bittensor.includes(poolInfo.chain);
  const netuid = poolInfo?.type === YieldPoolType.SUBNET_STAKING ? poolInfo.metadata.subnetData?.netuid : isRoot ? 0 : undefined;

  useEffect(() => {
    let cancel = false;

    setApr(undefined);

    if (slug && netuid !== undefined) {
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
