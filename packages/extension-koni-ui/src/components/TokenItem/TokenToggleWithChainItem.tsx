// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import TokenItemFooter from '@subwallet/extension-koni-ui/Popup/Settings/Tokens/component/TokenItemFooter';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { TokenSelectorItemType } from '@subwallet/extension-koni-ui/types/field';
import { Logo } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface Props extends ThemeProps {
  onClick?: VoidFunction;
  tokenSlug: string;
  tokenSymbol: string;
  chainSlug: string;
  isSelected?: boolean;
  chainName: string;
  balanceInfo?: TokenSelectorItemType['balanceInfo'];
  showBalance?: boolean;
  showToggle?: boolean;
  tokenInfo?: _ChainAsset
  showButtonEdit?: boolean
}

const Component = ({ chainName, chainSlug, className, isSelected, onClick, showButtonEdit, showToggle, tokenInfo, tokenSlug, tokenSymbol }: Props) => {
  const navigate = useNavigate();
  const { assetSettingMap } = useSelector((state: RootState) => state.assetRegistry);
  const renderTokenRightItem = useCallback(() => {
    if (!tokenInfo) {
      return null;
    }

    const assetSetting = assetSettingMap?.[tokenInfo.slug];

    return (
      <TokenItemFooter
        assetSetting={assetSetting}
        navigate={navigate}
        showButtonEdit={showButtonEdit}
        tokenInfo={tokenInfo}
      />
    );
  }, [assetSettingMap, navigate, showButtonEdit, tokenInfo]);

  return (
    <div
      className={CN(className, {
        '-selected': isSelected
      })}
      onClick={onClick}
    >
      <div className='__item-left-part'>
        <Logo
          isShowSubLogo={true}
          shape={'squircle'}
          size={40}
          subLogoShape={'circle'}
          subNetwork={chainSlug}
          token={tokenSlug.toLowerCase()}
        />
      </div>
      <div className='__item-center-part'>
        <div className='__token-symbol'>
          {tokenSymbol}
        </div>
        <div className='__chain-name'>
          {chainName}
        </div>
      </div>

      {
        showToggle && !!tokenInfo && (
          <div className='__item-right-part'>
            {renderTokenRightItem()}
          </div>
        )
      }
    </div>
  );
};

const TokenToggleWithChainItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    backgroundColor: token.colorBgSecondary,
    borderRadius: token.borderRadiusLG,
    padding: token.paddingSM,
    cursor: 'pointer',
    gap: token.sizeXS,
    transition: `background ${token.motionDurationMid} ease-in-out`,

    '.__item-center-part': {
      overflow: 'hidden',
      flex: 1
    },

    '.__token-symbol': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      color: token.colorTextLight1,
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis'
    },

    '.__chain-name': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextLight3,
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis'
    },

    '.__item-right-part': {
      textAlign: 'right',
      alignItems: 'center',
      display: 'flex'
    },

    '.ant-number .ant-typography': {
      fontSize: 'inherit !important',
      lineHeight: 'inherit'
    },

    '.__value': {
      lineHeight: token.lineHeightLG,
      fontSize: token.fontSizeLG,
      fontWeight: token.headingFontWeight,
      color: token.colorTextLight1
    },

    '.__converted-value': {
      lineHeight: token.lineHeightSM,
      fontSize: token.fontSizeSM,
      color: token.colorTextLight4
    },

    '&:hover, &.-selected': {
      background: token.colorBgInput
    }
  });
});

export default TokenToggleWithChainItem;
