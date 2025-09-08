// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { govConvictionOptions } from '@subwallet/extension-base/services/open-gov/interface';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatBalance, toShort } from '@subwallet/extension-koni-ui/utils';
import { Icon, SwList, Web3Block } from '@subwallet/react-ui';
import SwAvatar from '@subwallet/react-ui/es/sw-avatar';
import { ReferendumVoteDetail } from '@subwallet/subsquare-api-sdk';
import { ArrowSquareOut, Copy } from 'phosphor-react';
import React, { forwardRef, useCallback } from 'react';
import styled from 'styled-components';

interface Props extends ThemeProps {
  accounts: ReferendumVoteDetail[];
  decimal: number;
  symbol: string;
}

const Component = ({ accounts, className = '', decimal, symbol }: Props) => {
  const renderItem = useCallback((item: ReferendumVoteDetail) => {
    const convictionOption = govConvictionOptions.find((opt) => opt.value === item.conviction);
    const convictionLabel = convictionOption ? convictionOption.label : `${item.conviction}x`;

    return (
      <Web3Block
        className='vote-item'
        leftItem={
          <SwAvatar
            size={24}
            value={item.account}
          />
        }
        middleItem={
          <div className='vote-item__info'>
            <div className='vote-item__address'>{toShort(item.account)}</div>
            <div className='vote-item__meta'>
              <div className='vote-item__meta-row'>
                <span className='vote-item__label'>Votes</span>
                {formatBalance(item.votes || 0, decimal)} {symbol}
              </div>
              <div className='vote-item__meta-row'>
                <span className='vote-item__label'>Conviction</span>
                <span>{convictionLabel}</span>
              </div>
              <div className='vote-item__meta-row'>
                <span className='vote-item__label'>Capital</span>
                {formatBalance(item.balance || 0, decimal)} {symbol}
              </div>
            </div>
          </div>
        }
        rightItem={
          <div className={'vote-item__arrow-wrapper'}>
            <Icon
              className={'vote-item__arrow'}
              phosphorIcon={Copy}
              size={'sm'}
            />
            <Icon
              className={'vote-item__arrow'}
              phosphorIcon={ArrowSquareOut}
              size={'sm'}
            />
          </div>
        }
      />
    );
  }, [decimal, symbol]);

  const renderEmpty = useCallback(() => {
    return <div className='__empty'>No flattened data</div>;
  }, []);

  return (
    <div className={`${className} __flattened-vote-list`}>
      <SwList
        list={accounts}
        renderItem={renderItem}
        renderWhenEmpty={renderEmpty}
      />
    </div>
  );
};

export const FlattenedVoteList = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    '.vote-item': {
      display: 'flex',
      alignItems: 'flex-start',
      borderRadius: token.borderRadiusLG,
      padding: token.paddingSM,
      marginBottom: token.marginXS,
      background: token.colorBgSecondary
    },

    '.vote-item__address': {
      fontSize: token.fontSizeLG,
      fontWeight: token.fontWeightStrong,
      marginBottom: token.marginXS
    },

    '.vote-item__meta': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.marginXXS
    },

    '.vote-item__meta-row': {
      display: 'grid',
      gridTemplateColumns: '78px auto',
      columnGap: token.sizeXS,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM
    },

    '.vote-item__label': {
      color: token.colorTextSecondary
    },

    '.vote-item__arrow-wrapper': {
      display: 'flex',
      alignItems: 'flex-start',
      marginTop: '2px'
    },

    '.vote-item__arrow': {
      paddingLeft: token.paddingSM - 2,
      paddingRight: token.paddingSM - 2
    }
  };
});
