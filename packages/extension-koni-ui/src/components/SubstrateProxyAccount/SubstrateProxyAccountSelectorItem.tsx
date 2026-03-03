// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubstrateProxyAccountItem } from '@subwallet/extension-base/types';
import { AccountProxyAvatar } from '@subwallet/extension-koni-ui/components';
import { useGetAccountProxyById, useNotification, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard, toShort } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { Context, useCallback, useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';

export interface SubstrateProxyAccountItemExtended extends SubstrateProxyAccountItem {
  isMain?: boolean;
}

type Props = ThemeProps & {
  substrateProxyAccount: SubstrateProxyAccountItemExtended
  isSelected?: boolean;
  showUnselectIcon?: boolean;
  showCheckedIcon?: boolean;
  onClick?: VoidFunction;
};

function Component (props: Props): React.ReactElement<Props> {
  const { className, isSelected, onClick, showCheckedIcon = true, showUnselectIcon, substrateProxyAccount } = props;
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const { t } = useTranslation();
  const notify = useNotification();
  const accountProxy = useGetAccountProxyById(substrateProxyAccount.proxyId);
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

  const onCopyAddress = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    copyToClipboard(substrateProxyAccount.substrateProxyAddress);
    notify({
      message: t('ui.ACCOUNT.components.SubstrateProxyAccount.SelectorItem.copiedToClipboard')
    });
  }, [notify, substrateProxyAccount.substrateProxyAddress, t]);

  return (
    <div
      className={CN(className, {
        '-readonly': !showCheckedIcon
      })}
      key={substrateProxyAccount.substrateProxyAddress}
      onClick={showCheckedIcon ? onClick : undefined}
    >
      <div
        className='__item-left-part'
        onClick={onCopyAddress}
      >
        <AccountProxyAvatar
          size={32}
          value={substrateProxyAccount.proxyId || substrateProxyAccount.substrateProxyAddress}
        />
      </div>
      <div className='__item-middle-part'>
        <div className='__item-identity-part'>
          <div className={CN('__item-name', {
            '-has-address': !!accountProxy?.name
          })}
          >
            {accountProxy?.name || toShort(substrateProxyAccount.substrateProxyAddress, 9, 9)}
          </div>
          {!!accountProxy?.name && <div className='__item-address'>
            ({toShort(substrateProxyAccount.substrateProxyAddress, 4, 5)})
          </div>}
        </div>
        <div className={CN('__proxy-type', {
          '-is-main': substrateProxyAccount.isMain
        })}
        >
          {
            substrateProxyAccount.isMain ? t('ui.ACCOUNT.components.SubstrateProxyAccount.SelectorItem.proxiedAccount') : `${t('ui.ACCOUNT.components.SubstrateProxyAccount.SelectorItem.proxyType')}: ${substrateProxyAccount.substrateProxyType}`
          }
        </div>
      </div>
      <div className='__item-right-part'>
        {showCheckedIcon && checkedIconNode}
      </div>
    </div>
  );
}

export const SubstrateProxyAccountSelectorItem = styled(Component)<Props>(({ theme }) => {
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
      color: token.colorTextLight4,
      'white-space': 'nowrap',
      overflow: 'hidden',
      fontWeight: token.headingFontWeight,
      textOverflow: 'ellipsis',

      '&.-has-address': {
        color: token.colorTextLight1
      }
    },

    '.__item-address': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight4,
      fontWeight: token.headingFontWeight
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
    },

    '&.-readonly': {
      cursor: 'default'
    }
  };
});
