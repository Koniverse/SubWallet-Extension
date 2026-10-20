// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { getPositionApr } from '@subwallet/extension-base/services/earning-service/handlers/native-staking/bittensor-subnet-apr';
import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import { NormalYieldPoolStatistic, YieldCompoundingPeriod, YieldPoolInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { balanceFormatter, formatNumber } from '@subwallet/extension-base/utils';
import { CollapsiblePanel, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { useCreateGetSubnetStakingTokenName, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { useSubnetApr } from '@subwallet/extension-koni-ui/hooks/earning/useSubnetApr';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getEarningTimeText } from '@subwallet/extension-koni-ui/utils';
import { Logo } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  inputAsset: _ChainAsset;
  poolInfo: YieldPoolInfo;
  compound?: YieldPositionInfo;
};

function Component ({ className, compound, inputAsset, poolInfo }: Props) {
  const { t } = useTranslation();

  const totalApy = useMemo((): number | undefined => {
    return (
      poolInfo.statistic?.totalApy ||
      (poolInfo.statistic?.totalApr
        ? calculateReward(poolInfo.statistic.totalApr, undefined, YieldCompoundingPeriod.YEARLY).apy
        : undefined)
    );
  }, [poolInfo.statistic?.totalApr, poolInfo.statistic?.totalApy]);

  const unstakePeriod = useMemo((): number | undefined => {
    if (poolInfo.statistic && 'unstakingPeriod' in poolInfo.statistic) {
      return (poolInfo.statistic as NormalYieldPoolStatistic).unstakingPeriod;
    } else {
      return undefined;
    }
  }, [poolInfo.statistic]);
  const isSubnetStaking = useMemo(() => [YieldPoolType.SUBNET_STAKING].includes(poolInfo.type), [poolInfo.type]);
  const isBittensor = useMemo(() => _STAKING_CHAIN_GROUP.bittensor.includes(poolInfo.chain), [poolInfo.chain]);

  // A subnet position earns its validators' APR, from the chain, weighted by the stake on each (EXT-1)
  const subnetApr = useSubnetApr(isSubnetStaking ? poolInfo : undefined);
  const positionApr = useMemo((): number | undefined => {
    if (!subnetApr || !compound) {
      return undefined;
    }

    return getPositionApr(compound.nominations.map(({ activeStake, validatorAddress }) => ({ hotkey: validatorAddress, stake: new BigN(activeStake) })), subnetApr);
  }, [compound, subnetApr]);
  const aprHint = useMemo((): string | undefined => {
    if (subnetApr?.upTo === 0) {
      return t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.noRewardsLastEpoch');
    }

    return positionApr === 0 ? t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.validatorEarnedNothing') : undefined;
  }, [positionApr, subnetApr, t]);

  const getSubnetStakingTokenName = useCreateGetSubnetStakingTokenName();

  const subnetToken = useMemo(() => {
    return getSubnetStakingTokenName(poolInfo.chain, poolInfo.metadata.subnetData?.netuid || 0);
  }, [getSubnetStakingTokenName, poolInfo.chain, poolInfo.metadata.subnetData?.netuid]);

  return (
    <CollapsiblePanel
      className={CN(className)}
      title={t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.earningInfo')}
    >
      <MetaInfo
        labelColorScheme='gray'
        labelFontWeight='regular'
        spaceSize='sm'
        valueColorScheme='light'
      >
        {!isSubnetStaking
          ? (
            <MetaInfo.Chain
              chain={poolInfo.chain}
              label={t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.network')}
            />
          )
          : (
            <MetaInfo.Default
              label={t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.subnet')}
            >
              <div className='__subnet-wrapper'>
                <Logo
                  className='__item-logo'
                  isShowSubLogo={false}
                  network={poolInfo.chain}
                  size={24}
                  token={subnetToken}
                />
                <span className='chain-name'>{poolInfo.metadata.shortName}</span>
              </div>
            </MetaInfo.Default>
          )}
        {isSubnetStaking
          ? (
            <MetaInfo.Default label={t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.estimatedEarnings')}>
              {/* A measured 0 shows as 0%; "—" only when there is no figure at all */}
              <div>
                {positionApr === undefined
                  ? '—'
                  : t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.aprInAlpha', { replace: { apr: formatNumber(positionApr * 100, 0, balanceFormatter), symbol: poolInfo.metadata.subnetData?.subnetSymbol || '' } })}
              </div>
              {aprHint && <div className='__apr-hint'>{aprHint}</div>}
            </MetaInfo.Default>
          )
          : totalApy !== undefined && (
            <MetaInfo.Number
              label={t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.estimatedEarnings')}
              suffix={'% ' + t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.perYear')}
              value={totalApy}
              valueColorSchema='even-odd'
            />
          )}

        <MetaInfo.Number
          decimals={inputAsset?.decimals || 0}
          label={t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.minimumActiveStake')}
          suffix={inputAsset?.symbol}
          value={poolInfo.statistic?.earningThreshold.join || '0'}
          valueColorSchema='even-odd'
        />
        {unstakePeriod !== undefined && (
          <MetaInfo.Default label={t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.unstakingPeriod')}>
            {/* A Bittensor unstake is an immediate swap; a root hold, when the chain sets one, lasts up to that long (EXT-16) */}
            {isBittensor && unstakePeriod === 0
              ? t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.immediately')
              : (
                <>
                  {(poolInfo.type === YieldPoolType.LIQUID_STAKING || poolInfo.type === YieldPoolType.SUBNET_STAKING || isBittensor) && <span className={'__label'}>Up to</span>}
                  {getEarningTimeText(t, unstakePeriod)}
                </>
              )}
          </MetaInfo.Default>
        )}
      </MetaInfo>
    </CollapsiblePanel>
  );
}

export const EarningInfoPart = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  '.__apr-hint': {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    color: token.colorTextLight4
  },

  '.__label': {
    paddingRight: token.paddingXXS
  },
  '.__subnet-wrapper': {
    display: 'flex',
    alignItems: 'center',
    gap: token.sizeXS,
    minWidth: 0
  }
}));
