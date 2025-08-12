// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { balanceNoPrefixFormater } from '@subwallet/extension-base/utils';
import { getEarningImpact } from '@subwallet/extension-koni-ui/messaging';
import { formatNumber } from '@subwallet/react-ui';
import { useEffect, useState } from 'react';

interface PoolData {
  chain?: string;
  slug: string;
}

export const useTaoStakingFee = (
  poolInfo: PoolData | undefined,
  amount: string,
  decimals: number,
  netuid: number,
  type: ExtrinsicType
) => {
  const [stakingFee, setStakingFee] = useState<string | undefined>();

  const isBittensorChain = poolInfo?.chain === 'bittensor' || poolInfo?.chain === 'bittensor_testnet';

  useEffect(() => {
    let isSync = true;

    const doFunction = () => {
      if (!poolInfo || !isBittensorChain) {
        return;
      }

      getEarningImpact({
        slug: poolInfo.slug,
        value: amount,
        netuid,
        type
      })
        .then((impact) => {
          const stakingTaoFee = formatNumber(
            impact.stakingTaoFee || '0',
            decimals,
            balanceNoPrefixFormater
          );

          if (isSync) {
            setStakingFee(stakingTaoFee);
          }
        })
        .catch((error) => {
          console.error('Failed to get earning impact:', error);
        });
    };

    doFunction();

    return () => {
      isSync = false;
    };
  }, [poolInfo, amount, decimals, type, isBittensorChain, netuid]);

  return stakingFee;
};
