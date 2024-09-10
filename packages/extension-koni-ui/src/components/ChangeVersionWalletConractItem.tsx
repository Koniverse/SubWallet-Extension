// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WalletContractItem } from '@subwallet/extension-koni-ui/components/Modal/ChangeVersionWalletContractModal';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { tonAccountChangeWalletContractVersion } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Icon, Logo } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & WalletContractItem

const Component: React.FC<Props> = (props: Props) => {
  const { chainSlug, className, isSelected, value, walletType } = props;
  const { token } = useTheme() as Theme;
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);

  const { t } = useTranslation();

  const _onSelect = useCallback(() => {
    (async () => {
      try {
        const success = await tonAccountChangeWalletContractVersion({
          proxyId: currentAccountProxy?.id || '',
          address: value,
          version: walletType
        });

        if (success) {
          // Handle successful version change
          console.log(`Version changed to ${walletType}`);
        } else {
          // Handle failure
          console.error('Failed to change version');
        }
      } catch (error) {
        // Handle error
        console.error('Error changing version:', error);
      }
    })();
  }, [currentAccountProxy?.id, value, walletType]);

  return (
    <>
      <div
        className={CN(className, '__item-list-wallet')}
        onClick={_onSelect}
      >
        <div className='__item-left-part'>
          <Logo
            network={chainSlug}
            shape={'circle'}
            size={28}
          />
        </div>

        <div className='__item-center-part'>
          <div className='__item-chain-name'>
            {walletType}
          </div>
          <div className='__item-address'>
            {toShort(value, 4, 5)}
          </div>
        </div>

        <div className='__item-right-part'>
          {isSelected && <Icon
            className={'right-item__select-icon'}
            iconColor={isSelected ? token.colorSuccess : token.colorTextLight4}
            phosphorIcon={CheckCircle}
            size={'sm'}
            weight={'fill'}
          />}
        </div>
      </div>
    </>
  );
};

const ChangeVersionWalletConractItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    background: token.colorBgSecondary,
    paddingLeft: token.paddingSM,
    paddingRight: token.paddingXXS,
    paddingTop: 6,
    paddingBottom: 6,
    borderRadius: token.borderRadiusLG,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
    transition: `background ${token.motionDurationMid} ease-in-out`,
    gap: token.sizeXS,
    overflowX: 'hidden',
    minHeight: 52,

    '.__item-center-part': {
      display: 'flex',
      overflowX: 'hidden',
      'white-space': 'nowrap',
      gap: token.sizeXXS,
      flex: 1,
      alignItems: 'baseline'
    },

    '.__item-chain-name': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontWeight: token.fontWeightStrong
    },

    '.__item-address': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextLight4,
      fontWeight: token.bodyFontWeight
    },

    '.__item-right-part': {
      paddingLeft: 4
    },

    '.-show-on-hover': {
      opacity: 0,
      transition: `opacity ${token.motionDurationMid} ease-in-out`
    },
    '.-hide-on-hover': {
      opacity: 1,
      transition: `opacity ${token.motionDurationMid} ease-in-out`
    },
    '.right-item__select-icon': {
      paddingLeft: token.paddingSM - 2,
      paddingRight: token.paddingSM - 2
    },

    '&:hover': {
      background: token.colorBgInput,
      '.-hide-on-hover': {
        opacity: 0
      },
      '.-show-on-hover': {
        opacity: 1
      }
    }
  };
});

export default ChangeVersionWalletConractItem;