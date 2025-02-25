// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Icon, SwIconProps, Tooltip } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback } from 'react';
import styled from 'styled-components';

export type MenuItemType = {
  label: string;
  value: string;
  icon: SwIconProps;
  disabled?: boolean;
};

type Props = MenuItemType & ThemeProps & {
  showToolTip: boolean;
  isActivated: boolean;
  onClick: (key: string) => void;
};

function Component ({ className = '', disabled, icon, isActivated, label, onClick, showToolTip, value }: Props): React.ReactElement<Props> {
  const _onClick = useCallback(() => {
    if (disabled) {
      return;
    }

    onClick(value);
  }, [disabled, onClick, value]);

  return (
    <div
      className={CN(className, {
        '-activated': isActivated,
        '-disabled': disabled,
        '-can-hover': !(isActivated || disabled)
      })}
      onClick={_onClick}
      tabIndex={-1}
    >

      <Icon
        className={'__icon'}
        size={'md'}
        weight={'fill'}
        {...icon}
      />

      <div className={'__label'}>
        {label}
      </div>

      {
        showToolTip && (
          <Tooltip
            placement={'right'}
            title={label}
          >
            <div className={'__overlay'}></div>
          </Tooltip>
        )
      }
    </div>
  );
}

export const MenuItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    borderRight: '4px solid transparent',
    margin: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    height: 52,
    paddingLeft: token.padding,
    paddingRight: token.padding,
    position: 'relative',

    '.__overlay': {
      position: 'absolute',
      top: 0,
      left: 0,
      right: -4,
      bottom: 0,
      zIndex: 2
    },

    '.__icon': {
      fontSize: 24,
      height: 40,
      width: 40,
      minWidth: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: token.colorTextLight3
    },

    '.__label': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.headingFontWeight,
      marginLeft: token.marginXS,
      color: token.colorTextLight3,
      'white-space': 'nowrap'
    },

    '.__active-count': {
      borderRadius: '50%',
      color: token.colorWhite,
      fontSize: token.sizeXS,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeightLG,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: token.colorError,
      position: 'absolute',
      right: 194,
      top: 14,
      minWidth: '12px'
    },

    '&.-can-hover:hover': {
      backgroundColor: token.colorBgInput,

      '.__icon': {
        color: token.colorTextLight1
      },

      '.__label': {
        color: token.colorTextLight1
      }
    },

    '&.-activated': {
      borderRightColor: token.colorPrimary,

      '.__icon': {
        color: token.colorPrimary
      },

      '.__label': {
        color: token.colorTextLight1
      }
    },

    '&.-disabled': {
      opacity: 0.4,
      cursor: 'not-allowed'
    }
  });
});
