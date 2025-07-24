// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getMultiChainAsset } from '@subwallet/extension-base/services/chain-service/utils';
import { SHOW_BANNER_TOKEN_GROUPS } from '@subwallet/extension-web-ui/constants';
import { useSelector } from '@subwallet/extension-web-ui/hooks';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { EarningPoolsParam, ThemeProps } from '@subwallet/extension-web-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import { Coins, Vault } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps & {
  tokenGroupSlug: string;
};

const Component: React.FC<Props> = ({ className, tokenGroupSlug }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const multiChainAssetMap = useSelector((state: RootState) => state.assetRegistry.multiChainAssetMap);

  const symbol = useMemo<string>(() => {
    if (tokenGroupSlug) {
      if (multiChainAssetMap[tokenGroupSlug]) {
        return multiChainAssetMap[tokenGroupSlug].symbol;
      }

      if (assetRegistryMap[tokenGroupSlug]) {
        return assetRegistryMap[tokenGroupSlug].symbol;
      }
    }

    return '';
  }, [tokenGroupSlug, assetRegistryMap, multiChainAssetMap]);

  const multiChainAssetSlug = useMemo(() => {
    if (multiChainAssetMap[tokenGroupSlug]) {
      return tokenGroupSlug;
    }

    if (assetRegistryMap[tokenGroupSlug]) {
      return _getMultiChainAsset(assetRegistryMap[tokenGroupSlug]);
    }

    return undefined;
  }, [assetRegistryMap, multiChainAssetMap, tokenGroupSlug]);

  const onClickEarnNow = useCallback(() => {
    if (!tokenGroupSlug || !symbol || !multiChainAssetSlug) {
      return;
    }

    navigate('/home/earning/pools', { state: {
      poolGroup: multiChainAssetSlug,
      symbol
    } as EarningPoolsParam });
  }, [multiChainAssetSlug, navigate, symbol, tokenGroupSlug]);

  const isShowBanner = useMemo(() => {
    return SHOW_BANNER_TOKEN_GROUPS.some((slug) => {
      return slug === multiChainAssetSlug;
    });
  }, [multiChainAssetSlug]);

  if (!isShowBanner) {
    return null;
  }

  return (
    <div className={className}>
      <div className={'__note-box'}>
        <div className={'__title-wrapper'}>
          <Icon
            className={'__token-icon'}
            phosphorIcon={Coins}
            weight={'fill'}
          />

          <div className={'__title'}>
            {t('Earn yield on your {{symbol}}', { replace: { symbol: symbol } })}
          </div>
        </div>

        <div className={'__content'}>{t('There are multiple ways to earn with your {{symbol}}, such as native staking, liquid staking, or lending. Check out Earning for curated options with competitive APY to earn yield on your DOT.', { replace: { symbol: symbol } })}</div>
      </div>

      <Button
        className={'__footer-button'}
        contentAlign={'left'}
        icon={
          <Icon
            className='__footer-button-icon'
            phosphorIcon={Vault}
            size='md'
            weight='fill'
          />
        }
        onClick={onClickEarnNow}
      >
        <div className={'__footer-button-content'}>
          <div className={'__footer-button-title'}>{t('Rewards: 14.8% - 18.5%')}</div>
          <div className={'__footer-button-subtitle'}>{t('Earn now')}</div>
        </div>
      </Button>
    </div>
  );
};

const EarnCTABanner = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    marginTop: 24,
    borderTop: `2px solid ${token.colorBgDivider}`,
    display: 'flex',
    gap: token.size,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: token.sizeLG,
    marginInline: 44,
    paddingBottom: 32,
    background: token.colorBgDefault,
    opacity: 1,
    zIndex: 10,
    '.__note-box': {
      maxWidth: 684,
      flex: '1 1 300px'
    },
    '.__title-wrapper': {
      display: 'flex',
      alignItems: 'center',
      marginBottom: token.marginXS
    },
    '.__token-icon': {
      color: token.colorSuccess,
      fontSize: 24,
      width: 40,
      height: 40,
      justifyContent: 'center'
    },
    '.__title': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      color: token.colorTextLight3
    },
    '.__content': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight4
    },
    '.__footer-button': {
      height: 72,
      flex: 1,
      paddingRight: token.paddingSM,
      paddingLeft: token.paddingSM,
      gap: token.size,
      maxWidth: 384
    },
    '.__footer-button-icon': {
      width: 40,
      height: 40,
      justifyContent: 'center'
    },
    '.__footer-button-content': {
      textAlign: 'left'
    },
    '.__footer-button-title': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      color: token.colorTextLight1,
      marginBottom: token.marginXXS
    },
    '.__footer-button-subtitle': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight3
    },
    '@media (max-width: 767px)': {
      '.__footer-button': {
        minWidth: '100%'
      },

      '.__buttons-block': {
        '.ant-btn': {
          minWidth: '100%'
        }
      }
    }

  };
});

export default EarnCTABanner;
