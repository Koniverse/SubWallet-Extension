// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps, TransactionProcessStepItemType } from '@subwallet/extension-koni-ui/types';
import { isStepCompleted, isStepFailed, isStepPending, isStepProcessing, isStepTimeout } from '@subwallet/extension-koni-ui/utils';
import { Icon, Logo } from '@subwallet/react-ui';
import { SwIconProps } from '@subwallet/react-ui/es/icon';
import CN from 'classnames';
import { CheckCircle, ClockCounterClockwise, ProhibitInset, SpinnerGap } from 'phosphor-react';
import React, { FC, useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & TransactionProcessStepItemType;

const Component: FC<Props> = (props: Props) => {
  const { className, content, index, isLastItem, logoKey, status } = props;

  const iconProp = useMemo<SwIconProps>(() => {
    const iconInfo: SwIconProps = (() => {
      if (logoKey) {
        if (isStepCompleted(status) || isStepFailed(status) || isStepTimeout(status)) {
          return {
            type: 'customIcon',
            customIcon: (
              <Logo
                className={'__step-chain-logo'}
                network={logoKey.toLowerCase()}
                shape={'circle'}
                size={16}
              />
            )
          };
        }
      }

      if (isStepCompleted(status)) {
        return {
          phosphorIcon: CheckCircle,
          weight: 'fill'
        };
      } else if (isStepFailed(status)) {
        return {
          phosphorIcon: ProhibitInset,
          weight: 'fill'
        };
      } else if (isStepTimeout(status)) {
        return {
          phosphorIcon: ClockCounterClockwise,
          weight: 'fill'
        };
      } else if (isStepProcessing(status)) {
        return {
          phosphorIcon: SpinnerGap,
          weight: 'fill'
        };
      }

      return {
        type: 'customIcon',
        customIcon: (
          <span className={'__step-ordinal-wrapper'}>
            <span className='__step-ordinal'>
              {index + 1}
            </span>
          </span>
        )
      };
    })();

    return {
      ...iconInfo,
      size: 'xs'
    };
  }, [index, logoKey, status]);

  return (
    <div
      className={CN(className, {
        '-last-item': isLastItem,
        '-pending': isStepPending(status),
        '-processing': isStepProcessing(status),
        '-complete': isStepCompleted(status),
        '-failed': isStepFailed(status),
        '-timeout': isStepTimeout(status)
      })}
    >
      <div className={'__item-left-part'}>
        <Icon
          {...iconProp}
          className={CN('__icon', {
            '-spinner': isStepProcessing(status)
          })}
        />
      </div>
      <div className='__item-right-part'>
        <div className='__content'>{content}</div>
      </div>
    </div>
  );
};

export const TransactionProcessStepItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    gap: token.size,

    '.__item-left-part': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },

    '.__item-left-part:before, .__item-left-part:after': {
      content: '""',
      display: 'block',
      width: 1,
      flex: 1
    },

    '.__item-left-part:before': {
      marginBottom: 6
    },

    '.__item-left-part:after': {
      marginTop: 6,
      backgroundColor: 'currentcolor'
    },

    '.__icon': {
      border: '1px solid currentcolor',
      minWidth: 24,
      minHeight: 24,
      borderRadius: '100%',
      alignItems: 'center',
      justifyContent: 'center'
    },

    '.__icon.-spinner': {
      '> span, > svg': {
        animation: 'swRotate 1.2s linear infinite'
      }
    },

    '.__step-chain-logo': {
      '.ant-image, img': {
        display: 'block'
      }
    },

    '.__step-ordinal-wrapper': {
      width: '1em',
      height: '1em',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'currentcolor',
      borderRadius: '100%'
    },

    '.__step-ordinal': {
      color: token.colorTextLight1,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM
    },

    '.__content': {
      background: token.colorBgSecondary,
      padding: '10px 16px',
      borderRadius: token.borderRadiusLG,
      color: token.colorTextLight3,
      fontSize: token.fontSize,
      lineHeight: '24px'
    },

    '.__item-right-part': {
      flex: 1,
      paddingTop: 6,
      paddingBottom: 6
    },

    // pending
    '&.-pending .__item-left-part': {
      color: token.colorTextLight7
    },

    '&.-pending + & .__item-left-part:before': {
      backgroundColor: token.colorTextLight7
    },

    // processing
    '&.-processing .__item-left-part': {
      color: '#D9A33E'
    },

    '&.-processing + & .__item-left-part:before': {
      backgroundColor: '#D9A33E'
    },

    // complete
    '&.-complete .__item-left-part': {
      color: token.colorSuccess
    },

    '&.-complete + & .__item-left-part:before': {
      backgroundColor: token.colorSuccess
    },

    // failed
    '&.-failed .__item-left-part': {
      color: token.colorError
    },

    '&.-failed + & .__item-left-part:before': {
      backgroundColor: token.colorError
    },

    // timeout
    '&.-timeout .__item-left-part': {
      color: token.gold
    },

    '&.-timeout + & .__item-left-part:before': {
      backgroundColor: token.gold
    },

    '&.-last-item': {
      '.__item-left-part:after': {
        opacity: 0
      }
    }
  });
});
