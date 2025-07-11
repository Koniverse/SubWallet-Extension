// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from '@subwallet/extension-web-ui/hooks';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { TokenSelectorItemType } from '@subwallet/extension-web-ui/types/field';
import { Logo, Number } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
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
}

const Component = ({ balanceInfo, chainName, chainSlug, className, isSelected, onClick, showBalance, tokenSlug, tokenSymbol }: Props) => {
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);

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
        showBalance && (
          <div className='__item-right-part'>
            {
              !!balanceInfo && balanceInfo.isReady && !balanceInfo.isNotSupport
                ? (
                  <>
                    <Number
                      className={'__value'}
                      decimal={0}
                      decimalOpacity={0.45}
                      hide={!isShowBalance}
                      value={balanceInfo.free.value}
                    />
                    <Number
                      className={'__converted-value'}
                      decimal={0}
                      decimalOpacity={0.45}
                      hide={!isShowBalance}
                      intOpacity={0.45}
                      prefix={(balanceInfo.currency?.isPrefix && balanceInfo.currency.symbol) || ''}
                      size={12}
                      suffix={(!balanceInfo.currency?.isPrefix && balanceInfo.currency?.symbol) || ''}
                      unitOpacity={0.45}
                      value={balanceInfo.free.convertedValue}
                    />
                  </>
                )
                : (
                  <>
                    <div className={'__value'}>--</div>
                    <div className={'__converted-value'}>--</div>
                  </>
                )
            }
          </div>
        )
      }
    </div>
  );
};

const TokenSelectorItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
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
      textAlign: 'right'
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

export default TokenSelectorItem;
