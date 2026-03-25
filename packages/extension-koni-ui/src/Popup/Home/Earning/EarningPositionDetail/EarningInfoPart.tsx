// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import { DelegatedStrategyInfo, NormalYieldPoolStatistic, YieldCompoundingPeriod, YieldPoolInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { CollapsiblePanel, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { EarningConstituentsModal } from '@subwallet/extension-koni-ui/components/Modal/Earning';
import { EARNING_CONSTITUENTS_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useCreateGetSubnetStakingTokenName, useNotification, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getEarningTimeText, toShort } from '@subwallet/extension-koni-ui/utils';
import { Icon, Logo, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { Copy, Info } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';

type Props = ThemeProps & {
  compound: YieldPositionInfo;
  inputAsset: _ChainAsset;
  list: YieldPositionInfo[];
  poolInfo: YieldPoolInfo;
};

function Component ({ className, compound, inputAsset, list, poolInfo }: Props) {
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);

  const notify = useNotification();
  const _onClickCopyButton = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
    notify({
      message: t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.copiedToClipboard')
    });
  }, [notify, t]);

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
  const isDelegatedStaking = useMemo(() => poolInfo.type === YieldPoolType.DELEGATED_STAKING, [poolInfo.type]);

  const delegatedNomination = useMemo<DelegatedStrategyInfo | undefined>(() => {
    if (!isDelegatedStaking) {
      return undefined;
    }

    if (compound.nominations?.[0]) {
      return compound.nominations[0] as DelegatedStrategyInfo;
    }

    for (const item of list) {
      if (item.nominations?.[0]) {
        return item.nominations[0] as DelegatedStrategyInfo;
      }
    }

    return undefined;
  }, [compound.nominations, isDelegatedStaking, list]);

  const delegatedConstituents = useMemo(() => {
    if (!isDelegatedStaking) {
      return [] as string[];
    }

    const itemSet = new Set<string>();
    const fromCompound = compound.metadata?.constituents;

    if (Array.isArray(fromCompound)) {
      fromCompound.forEach((item) => itemSet.add(String(item)));
    }

    list.forEach((item) => {
      const fromItem = item.metadata?.constituents;

      if (Array.isArray(fromItem)) {
        fromItem.forEach((subnet) => itemSet.add(String(subnet)));
      }
    });

    return Array.from(itemSet);
  }, [compound.metadata, isDelegatedStaking, list]);

  const delegatedStrategyApy = delegatedNomination?.expectedReturn;

  const getSubnetStakingTokenName = useCreateGetSubnetStakingTokenName();

  const subnetToken = useMemo(() => {
    return getSubnetStakingTokenName(poolInfo.chain, poolInfo.metadata.subnetData?.netuid || 0);
  }, [getSubnetStakingTokenName, poolInfo.chain, poolInfo.metadata.subnetData?.netuid]);

  const onOpenConstituentsModal = useCallback(() => {
    activeModal(EARNING_CONSTITUENTS_MODAL);
  }, [activeModal]);

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
        {isDelegatedStaking && (
          <>
            <MetaInfo.Default
              label={t('ui.EARNING.components.Modal.Earning.EarningInfo.strategy')}
            >
              {delegatedNomination?.validatorIdentity || '-'}
            </MetaInfo.Default>

            <MetaInfo.Default
              label={(
                <div
                  className={'__constituents-info-label'}
                >
                  <span>{t('ui.EARNING.components.Modal.Earning.EarningInfo.constituents')}</span>
                  <div
                    className={'__constituents-info-button'}
                    onClick={onOpenConstituentsModal}
                  >
                    <Icon
                      customSize={'16px'}
                      phosphorIcon={Info}
                      size={'sm'}
                    />
                  </div>
                </div>
              )}
            >
              {`${delegatedConstituents.length} ${delegatedConstituents.length > 1
                ? t('ui.EARNING.components.Modal.Earning.EarningInfo.subnets')
                : t('ui.EARNING.components.Modal.Earning.EarningInfo.subnet')}`}
            </MetaInfo.Default>

            {delegatedStrategyApy !== undefined && (
              <MetaInfo.Number
                label={t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.estimatedEarnings')}
                suffix={'% ' + t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.perYear')}
                value={delegatedStrategyApy}
                valueColorSchema='even-odd'
              />
            )}

            <MetaInfo.Number
              decimals={inputAsset?.decimals || 0}
              label={t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.minimumActiveStake')}
              suffix={inputAsset?.symbol}
              value={delegatedNomination?.validatorMinStake || poolInfo.statistic?.earningThreshold.join || '0'}
              valueColorSchema='even-odd'
            />

            <MetaInfo.Default
              label={t('ui.EARNING.components.Modal.Earning.StrategyDetail.proxyAddress')}
            >
              <div className='__proxy-address'>
                <span className='__proxy-address-text'>
                  {toShort(delegatedNomination?.validatorAddress || '-', 6)}
                </span>

                <CopyToClipboard text={delegatedNomination?.validatorAddress || ''}>
                  <span
                    className='__proxy-address-copy'
                    onClick={_onClickCopyButton}
                  >
                    <Icon
                      customSize='16px'
                      phosphorIcon={Copy}
                    />
                  </span>
                </CopyToClipboard>
              </div>
            </MetaInfo.Default>

            <EarningConstituentsModal constituents={delegatedConstituents} />
          </>
        )}

        {!isDelegatedStaking && !isSubnetStaking && (
          <MetaInfo.Chain
            chain={poolInfo.chain}
            label={t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.network')}
          />
        )}

        {!isDelegatedStaking && isSubnetStaking && (
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

        {!isDelegatedStaking && totalApy !== undefined && (
          <MetaInfo.Number
            label={t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.estimatedEarnings')}
            suffix={'% ' + t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.perYear')}
            value={totalApy}
            valueColorSchema='even-odd'
          />
        )}

        {!isDelegatedStaking && (
          <MetaInfo.Number
            decimals={inputAsset?.decimals || 0}
            label={t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.minimumActiveStake')}
            suffix={inputAsset?.symbol}
            value={poolInfo.statistic?.earningThreshold.join || '0'}
            valueColorSchema='even-odd'
          />
        )}
        {!isDelegatedStaking && unstakePeriod !== undefined && (
          <MetaInfo.Default label={t('ui.EARNING.screen.EarningPositionDetail.EarningInfo.unstakingPeriod')}>
            {(poolInfo.type === YieldPoolType.LIQUID_STAKING || poolInfo.type === YieldPoolType.SUBNET_STAKING) && <span className={'__label'}>Up to</span>}
            {getEarningTimeText(t, unstakePeriod)}
          </MetaInfo.Default>
        )}
      </MetaInfo>
    </CollapsiblePanel>
  );
}

export const EarningInfoPart = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  '.__label': {
    paddingRight: token.paddingXXS
  },
  '.__proxy-address': {
    display: 'flex',
    gap: '4px'
  },
  '.__proxy-address-copy': {
    cursor: 'pointer'
  },
  '.__constituents-info-label': {
    border: 0,
    padding: 0,
    background: 'transparent',
    color: token.colorTextLight4,
    display: 'inline-flex',
    alignItems: 'center',
    gap: token.sizeXXS

  },

  '.__constituents-info-button': {
    cursor: 'pointer'
  },

  '.__subnet-wrapper': {
    display: 'flex',
    alignItems: 'center',
    gap: token.sizeXS,
    minWidth: 0
  }
}));
