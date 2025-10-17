// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProxyItem } from '@subwallet/extension-base/types/proxy';
import { AccountProxyAvatar } from '@subwallet/extension-koni-ui/components';
import { useGetAccountProxyById, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { Context, useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';

export interface ProxyItemExtended extends ProxyItem {
  isMain?: boolean;
}

type Props = ThemeProps & {
  proxyAccount: ProxyItemExtended
  isSelected?: boolean;
  showUnselectIcon?: boolean;
  showCheckedIcon?: boolean;
  onClick?: VoidFunction;
};

function Component (props: Props): React.ReactElement<Props> {
  const { className, isSelected, onClick, proxyAccount, showCheckedIcon = true, showUnselectIcon } = props;
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const { t } = useTranslation();
  const accountProxy = useGetAccountProxyById(proxyAccount.proxyId);

  const checkedIconNode = ((showUnselectIcon || isSelected) && (
    <div className='__checked-icon-wrapper'>
      <Icon
        iconColor={isSelected ? token.colorSuccess : token.colorTextLight4}
        phosphorIcon={CheckCircle}
        size='sm'
        weight='fill'
      />
    </div>
  ));

  return (
    <div
      className={CN(className)}
      onClick={onClick}
    >
      <div className='__item-left-part'>
        <AccountProxyAvatar
          size={32}
          value={proxyAccount.proxyId || proxyAccount.proxyAddress}
        />
      </div>
      <div className='__item-middle-part'>
        <div className='__item-identity-part'>
          <div className='__item-name'>
            {accountProxy?.name || toShort(proxyAccount.proxyAddress, 4, 5)}
          </div>
          {!!accountProxy?.name && <div className='__item-address'>
            ({toShort(proxyAccount.proxyAddress, 4, 5)})
          </div>}
        </div>
        <div className={CN('__proxy-type', {
          '-is-main': proxyAccount.isMain
        })}
        >
          {
            proxyAccount.isMain ? t('Proxied account') : `${t('Proxy type')}: ${proxyAccount.proxyType}`
          }
        </div>
      </div>
      <div className='__item-right-part'>
        {showCheckedIcon && checkedIconNode}
      </div>
    </div>
  );
}

export const ProxyAccountSelectorItem = styled(Component)<Props>(({ theme }) => {
  const { token } = theme as Theme;

  return {
    background: token.colorBgSecondary,
    padding: token.paddingSM,
    paddingRight: token.paddingSM,
    borderRadius: token.borderRadiusLG,
    alignItems: 'center',
    display: 'flex',
    cursor: 'pointer',
    transition: `background ${token.motionDurationMid} ease-in-out`,
    gap: token.sizeSM,

    '.__item-middle-part': {
      flex: 1,
      textAlign: 'left',
      'white-space': 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'flex',
      flexDirection: 'column'
    },

    '.__item-identity-part': {
      display: 'flex',
      overflowX: 'hidden',
      'white-space': 'nowrap',
      gap: token.sizeXXS,
      flex: 1,
      alignItems: 'baseline'
    },

    '.__item-name': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight1,
      'white-space': 'nowrap',
      overflow: 'hidden',
      fontWeight: token.headingFontWeight,
      textOverflow: 'ellipsis'
    },

    '.__item-address': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight4
    },

    '.__proxy-type': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: '#D92079',

      '&.-is-main': {
        color: '#86C338'
      }
    },

    '.__item-right-part': {
      display: 'flex'
    },

    '.__item-chain-type-logos': {
      minHeight: 20
    },

    '.__checked-icon-wrapper': {
      display: 'flex',
      justifyContent: 'center',
      minWidth: 40,
      marginRight: -token.marginXS
    },

    '&:hover': {
      background: token.colorBgInput,
      '.__item-actions-overlay': {
        opacity: 0
      },
      '.-show-on-hover': {
        opacity: 1
      }
    }
  };
});
