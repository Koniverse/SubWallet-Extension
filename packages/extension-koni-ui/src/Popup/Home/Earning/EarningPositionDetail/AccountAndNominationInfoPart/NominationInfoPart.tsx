// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { YieldPoolInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import NominatorCollapsiblePanel from '@subwallet/extension-koni-ui/components/Common/NominatorCollapsiblePanel';
import EarningValidatorSelectedModal from '@subwallet/extension-koni-ui/components/Modal/Earning/EarningValidatorSelectedModal';
import { EARNING_SELECTED_VALIDATOR_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useFetchChainState, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { fetchPoolTarget } from '@subwallet/extension-koni-ui/messaging';
import { store } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  compound: YieldPositionInfo;
  poolInfo: YieldPoolInfo;
  inputAsset: _ChainAsset;
};

function Component ({ className, compound,
  poolInfo }: Props) {
  const { t } = useTranslation();
  const [forceFetchValidator, setForceFetchValidator] = useState(false);
  const [targetLoading, setTargetLoading] = useState(false);
  const chainState = useFetchChainState(poolInfo?.chain || '');
  const slug = poolInfo.slug;

  useEffect(() => {
    let unmount = false;

    if ((!!poolInfo.chain && !!compound.address && chainState?.active) || forceFetchValidator) {
      setTargetLoading(true);
      fetchPoolTarget({ slug })
        .then((result) => {
          if (!unmount) {
            store.dispatch({ type: 'earning/updatePoolTargets', payload: result });
          }
        })
        .catch(console.error)
        .finally(() => {
          if (!unmount) {
            setTargetLoading(false);
            setForceFetchValidator(false);
          }
        });
    }

    return () => {
      unmount = true;
    };
  }, [chainState?.active, forceFetchValidator, slug, poolInfo.chain, compound.address]);

  const isAllAccount = useMemo(() => isAccountAll(compound.address), [compound.address]);
  const haveNomination = useMemo(() => {
    return [YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING, YieldPoolType.SUBNET_STAKING].includes(poolInfo.type);
  }, [poolInfo.type]);

  const noNomination = useMemo(
    () => !haveNomination || isAllAccount || !compound.nominations.length,
    [compound.nominations.length, haveNomination, isAllAccount]
  );

  if (noNomination) {
    return null;
  }

  return (
    <>
      <NominatorCollapsiblePanel
        className={CN(className)}
        modalId={EARNING_SELECTED_VALIDATOR_MODAL}
        title={t('Nomination info')}
      />

      <EarningValidatorSelectedModal
        chain={poolInfo.chain}
        disabled={false}
        from={compound.address}
        loading={targetLoading}
        modalId={EARNING_SELECTED_VALIDATOR_MODAL}
        nominations={compound.nominations}
        setForceFetchValidator={setForceFetchValidator}
        slug={poolInfo.slug}
      />
    </>
  );
}

export const NominationInfoPart = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  '.__nomination-item': {
    gap: token.sizeSM,

    '.__label': {
      'white-space': 'nowrap',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: token.sizeXS,
      overflow: 'hidden'
    },

    '.__value-col': {
      flex: '0 1 auto'
    }
  },

  '.__nomination-item.-hide-number': {
    '.__value-col': {
      display: 'none'
    }
  },

  '.__nomination-name': {
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  }
}));
