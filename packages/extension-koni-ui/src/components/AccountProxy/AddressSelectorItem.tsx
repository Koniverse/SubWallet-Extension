// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getBitcoinKeypairAttributes, toShort } from '@subwallet/extension-koni-ui/utils';
import { getKeypairTypeByAddress, isBitcoinAddress } from '@subwallet/keyring';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import AccountProxyAvatar from './AccountProxyAvatar';

type Props = ThemeProps & {
  name?: string;
  avatarValue?: string;
  address: string;
  onClick?: VoidFunction;
  isSelected?: boolean;
  showUnselectIcon?: boolean;
}

function Component (props: Props): React.ReactElement<Props> {
  const { address,
    avatarValue,
    className, isSelected, name, onClick, showUnselectIcon } = props;

  const bitcoinAttributes = useMemo(() => {
    if (isBitcoinAddress(address)) {
      const keyPairType = getKeypairTypeByAddress(address);

      return getBitcoinKeypairAttributes(keyPairType);
    }

    return undefined;
  }, [address]);

  return (
    <div
      className={CN(className)}
      onClick={onClick}
    >
      <div className='__item-left-part'>
        <AccountProxyAvatar
          className={'__avatar'}
          size={24}
          value={avatarValue}
        />
      </div>

      <div className='__item-center-part'>
        <div className={'__item-name-wrapper'}>
          {
            !!name && (
              <div className='__name'>
                {name}
              </div>
            )
          }
          {!!bitcoinAttributes && !!bitcoinAttributes.schema
            ? (
              <>
                <div className={'__name-label-divider'}> &nbsp; - &nbsp;</div>
                <div className={CN('__label', `-schema-${bitcoinAttributes.schema}`)}>
                  {bitcoinAttributes.label}
                </div>
              </>
            )
            : null}
        </div>

        <div className='__address'>
          {toShort(address, 9, 10)}
        </div>
      </div>

      <div className='__item-right-part'>
        {(isSelected || showUnselectIcon) && (
          <div className={CN('__checked-icon-wrapper', {
            '-selected': isSelected
          })}
          >
            <Icon
              phosphorIcon={CheckCircle}
              size='sm'
              weight='fill'
            />
          </div>
        )}
      </div>
    </div>
  );
}

const AddressSelectorItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    background: token.colorBgSecondary,
    paddingLeft: token.paddingSM,
    paddingRight: token.paddingSM,
    paddingTop: 6,
    paddingBottom: 6,
    borderRadius: token.borderRadiusLG,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
    transition: `background ${token.motionDurationMid} ease-in-out`,
    overflowX: 'hidden',
    minHeight: 52,

    '.__avatar': {
      marginRight: token.marginXS
    },

    '.__item-center-part': {
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      'white-space': 'nowrap',
      flex: 1,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight
    },

    '.__item-name-wrapper': {
      display: 'flex',
      alignItems: 'center'
    },

    '.__item-right-part': {
      display: 'flex'
    },

    '.__checked-icon-wrapper': {
      display: 'flex',
      justifyContent: 'center',
      minWidth: 40,
      marginRight: -token.marginXS,
      color: token.colorTextLight4,

      '&.-selected': {
        color: token.colorSuccess
      }
    },

    '.__name': {
      color: token.colorTextLight1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontWeight: token.fontWeightStrong
    },

    '.__address': {
      color: token.colorTextLight4,
      fontSize: token.fontSizeSM,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeightSM
    },

    '&:hover': {
      background: token.colorBgInput
    },

    '.__label, .__name-label-divider': {
      fontSize: token.fontSizeXS,
      lineHeight: token.lineHeightXS,
      fontWeight: 700,
      '&.-schema-orange-7': {
        color: token['orange-7']
      },
      '&.-schema-lime-7': {
        color: token['lime-7']
      },
      '&.-schema-cyan-7': {
        color: token['cyan-7']
      }
    },

    '.__name-label-divider': {
      color: token.colorTextTertiary
    }

  };
});

export default AddressSelectorItem;
