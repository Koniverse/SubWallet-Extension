// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { useCreateGetSubnetStakingTokenName, useTranslation } from '@subwallet/extension-web-ui/hooks';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { openInNewTab } from '@subwallet/extension-web-ui/utils';
import { Button, Icon, Logo } from '@subwallet/react-ui';
import CN from 'classnames';
import { Eye } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  poolInfo: YieldPoolInfo;
};

function Component ({ className, poolInfo }: Props) {
  const { t } = useTranslation();

  const subnetId = poolInfo.metadata.subnetData?.netuid;

  const onViewOnExplorer = useCallback(() => {
    if (typeof subnetId !== 'number') {
      return;
    }

    openInNewTab(`https://taostats.io/subnets/${subnetId}`)();
  }, [subnetId]);

  const isMainSubnetStaking = useMemo(() => [YieldPoolType.SUBNET_STAKING].includes(poolInfo.type) && !poolInfo.slug.includes('testnet'), [poolInfo.slug, poolInfo.type]);

  const getSubnetStakingTokenName = useCreateGetSubnetStakingTokenName();

  const subnetToken = useMemo(() => {
    return getSubnetStakingTokenName(poolInfo.chain, poolInfo.metadata.subnetData?.netuid || 0);
  }, [getSubnetStakingTokenName, poolInfo.chain, poolInfo.metadata.subnetData?.netuid]);

  return (
    <>
      <div
        className={CN(className, '__subnet-info-desktop-part')}
      >
        <div className={'__part-title'}>{t('Subnet info')}</div>

        <div className={'__part-content-area'}>
          <div className='__logo-and-name'>
            <Logo
              className='__logo'
              isShowSubLogo={false}
              network={poolInfo.chain}
              shape={'circle'}
              size={32}
              token={subnetToken}
            />

            <div className='__name'>
              {poolInfo.metadata.shortName}
            </div>
          </div>
        </div>

        <div className='__separator' />

        <Button
          block={true}
          className={'__view-on-explorer-button -ghost-type-3'}
          disabled={!isMainSubnetStaking || typeof subnetId !== 'number'}
          icon={
            <Icon
              customSize={'28px'}
              phosphorIcon={Eye}
            />
          }
          onClick={onViewOnExplorer}
          type={'ghost'}
        >{t('View on explorer')}</Button>
      </div>
    </>
  );
}

export const SubnetInfoDesktopPart = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  borderRadius: token.borderRadiusLG,
  backgroundColor: token.colorBgSecondary,
  paddingTop: 16,
  paddingRight: 24,
  paddingLeft: 24,
  flex: 1,
  display: 'flex',
  gap: 12,
  flexDirection: 'column',
  flexBasis: 384,
  justifyContent: 'space-between',
  overflow: 'hidden',

  '.__part-title': {
    lineHeight: token.lineHeight
  },

  '.__logo-and-name': {
    display: 'flex',
    alignItems: 'center',
    gap: token.sizeSM
  },

  '.__name': {
    fontSize: token.fontSizeHeading4,
    lineHeight: token.lineHeightHeading4,
    fontWeight: token.headingFontWeight,
    color: token.colorTextLight1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  '.__separator': {
    height: 2,
    backgroundColor: 'rgba(33, 33, 33, 0.80)',
    marginBottom: -token.marginSM
  }
}));
