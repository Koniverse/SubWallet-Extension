// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { defaultLogger } from '@subwallet/extension-base/utils/logger';
import { balanceNoPrefixFormater } from '@subwallet/extension-base/utils';
import { getEarningImpact } from '@subwallet/extension-koni-ui/messaging';
import { formatNumber } from '@subwallet/react-ui';
import { useEffect, useMemo, useState } from 'react';

export const useTaoStakingFee = (
  poolInfo: YieldPoolInfo,
  amount: string,
  decimals: number,
  netuid: number,
  type: ExtrinsicType,
  setLoadingExternal?: (loading: boolean) => void
) => {
  const [stakingFee, setStakingFee] = useState<string | undefined>();
  const [earningSlippage, setEarningSlippage] = useState<number>(0);
  const [earningRate, setEarningRate] = useState<number>(0);

  const isSubnetStaking = useMemo(() => [YieldPoolType.SUBNET_STAKING].includes(poolInfo.type), [poolInfo.type]);

  useEffect(() => {
    let isSync = true;

    const timeout = setTimeout(() => {
      if (!poolInfo || !isSubnetStaking) {
        return;
      }

      setLoadingExternal?.(true);

      getEarningImpact({
        slug: poolInfo.slug,
        value: amount,
        netuid,
        type
      })
        .then((impact) => {
          if (!isSync) {
            return;
          }

          setStakingFee(formatNumber(impact.stakingTaoFee || '0', decimals, balanceNoPrefixFormater));
          setEarningSlippage(impact.slippage);
          setEarningRate(impact.rate);
        })
        .catch((error) => {
          defaultLogger.error('Failed to get earning impact', error);
        })
        .finally(() => {
          if (isSync) {
            setLoadingExternal?.(false);
          }
        });
    }, 300);

    return () => {
      isSync = false;
      clearTimeout(timeout);
    };
  }, [poolInfo, amount, decimals, type, netuid, setLoadingExternal, isSubnetStaking]);

  return { stakingFee, earningRate, earningSlippage };
};
