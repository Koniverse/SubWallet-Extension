// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from '@subwallet/extension-web-ui/hooks';
import { Icon, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import { ChartBar, Coin, GlobeHemisphereWest, Image, ListBullets, MagnifyingGlass, RocketLaunch, SlidersHorizontal, Trophy } from 'phosphor-react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { PhosphorIcon, ThemeProps } from '../types';

export enum PAGE_TYPE {
  NFT_COLLECTION = 'nft_collection',
  NFT_COLLECTION_DETAIL = 'nft_collection_detail',
  INSCRIPTION = 'inscription',
  TOKEN = 'token',
  SEARCH = 'search',
  CROWDLOANS = 'crowdloans',
  HISTORY = 'history',
  STAKING = 'staking',
  STATISTIC = 'statistic',
  DAPPS = 'dapps',
  MISSION = 'mission'
}

type Props = ThemeProps & {
  pageType: PAGE_TYPE
  className?: string
}

type PageContent = {
  title: string
  icon: PhosphorIcon
  content: string
  button?: {
    label: string
    icon: PhosphorIcon
  }
}

const Component: React.FC<Props> = ({ className, pageType }: Props) => {
  const { t } = useTranslation();

  const pageContents = useMemo<Record<string, PageContent>>(() => {
    return {
      [PAGE_TYPE.NFT_COLLECTION]: {
        icon: Image,
        title: t('ui.NO_CONTENT.components.NoContent.noCollectibleFound'),
        content: t('ui.NO_CONTENT.components.NoContent.yourCollectiblesWillAppearHere')
      },
      [PAGE_TYPE.INSCRIPTION]: {
        icon: Image,
        title: t('ui.NO_CONTENT.components.NoContent.noInscriptionFound'),
        content: t('ui.NO_CONTENT.components.NoContent.yourInscriptionsWillAppearHere')
      },
      [PAGE_TYPE.NFT_COLLECTION_DETAIL]: {
        icon: Image,
        title: t('ui.NO_CONTENT.components.NoContent.noNftCollectible'),
        content: t('ui.NO_CONTENT.components.NoContent.yourNftCollectibleWillAppearHere')
      },
      [PAGE_TYPE.TOKEN]: {
        icon: Coin,
        title: t('ui.NO_CONTENT.components.NoContent.noTokenFound'),
        content: t('ui.NO_CONTENT.components.NoContent.yourTokenWillAppearHere')
      },
      [PAGE_TYPE.SEARCH]: {
        icon: MagnifyingGlass,
        title: t('ui.NO_CONTENT.components.NoContent.noResultsFound'),
        content: t('ui.NO_CONTENT.components.NoContent.pleaseChangeYourSearchCriteriaAndTryAgain'),
        button: {
          label: t('ui.NO_CONTENT.components.NoContent.manageTokenList'),
          icon: SlidersHorizontal
        }
      },
      [PAGE_TYPE.CROWDLOANS]: {
        icon: RocketLaunch,
        title: t('ui.NO_CONTENT.components.NoContent.youVeNotParticipatedInAnyCrowdloans'),
        content: t('ui.NO_CONTENT.components.NoContent.yourCrowdloansPortfolioWillAppearHere')
      },
      [PAGE_TYPE.HISTORY]: {
        icon: ListBullets,
        title: t('ui.NO_CONTENT.components.NoContent.noTransactionYet'),
        content: t('ui.NO_CONTENT.components.NoContent.yourTransactionHistoryWillAppearHere')
      },
      [PAGE_TYPE.STAKING]: {
        icon: Trophy,
        title: t('ui.NO_CONTENT.components.NoContent.noStaking'),
        content: t('ui.NO_CONTENT.components.NoContent.yourStakingAccountsWillAppearHere')
      },
      [PAGE_TYPE.STATISTIC]: {
        icon: ChartBar,
        title: t('ui.NO_CONTENT.components.NoContent.thereIsNoData'),
        content: t('ui.NO_CONTENT.components.NoContent.theDataWillAutomaticallyAppearWhenYourPortfolioHasAssets')
      },
      [PAGE_TYPE.DAPPS]: {
        icon: GlobeHemisphereWest,
        title: t('ui.NO_CONTENT.components.NoContent.noDappsFound'),
        content: t('ui.NO_CONTENT.components.NoContent.yourDappsWillShowUpHere')
      },
      [PAGE_TYPE.MISSION]: {
        icon: GlobeHemisphereWest,
        title: t('ui.NO_CONTENT.components.NoContent.noMissionFound'),
        content: t('ui.NO_CONTENT.components.NoContent.yourMissionsWillShowUpHere')
      }
    };
  }, [t]);

  const { content, icon, title } = pageContents[pageType];

  return (
    <div className={CN(className)}>
      <div className={CN('message-wrapper')}>
        <div className='message-icon'>
          <Icon
            iconColor='#737373'
            phosphorIcon={icon}
            weight='fill'
          />
          <div className='shape' />
        </div>

        <div className={CN('flex-col', 'message-content')}>
          <Typography.Title className='title'>{title}</Typography.Title>
          {content && (
            <Typography.Text className='content'>{content}</Typography.Text>
          )}
        </div>
      </div>
    </div>
  );
};

const NoContent = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',

    '&:before, &:after': {
      content: '""',
      display: 'block',
      flex: 1
    },

    '.message-wrapper': {
      maxWidth: 358,
      width: '100%',
      padding: token.padding,
      marginLeft: 'auto',
      marginRight: 'auto'
    },

    '.message-icon': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 64,
      position: 'relative',
      width: 112,
      height: 112,
      marginLeft: 'auto',
      marginRight: 'auto',

      '.anticon': {
        position: 'relative',
        zIndex: 10
      },

      '.shape': {
        opacity: 0.1,
        background: '#4D4D4D',
        borderRadius: '50%',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      }
    },

    '.message-content': {
      marginTop: 16,
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',

      '& > *': {
        margin: 0
      },

      '.title': {
        fontSize: 16,
        lineHeight: '24px',
        textAlign: 'center'
      },

      '.content': {
        fontSize: 14,
        lineHeight: '22px',
        color: token.colorTextLight4,
        textAlign: 'center'
      }
    },

    '@media (min-width: 992px)': {
      paddingTop: 32,
      paddingBottom: 62
    }
  };
});

export default NoContent;
