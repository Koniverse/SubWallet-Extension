// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps, TransactionProcessStepItemType } from '@subwallet/extension-koni-ui/types';
import { isStepCompleted, isStepFailed, isStepPending, isStepProcessing, isStepTimeout } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import { SwIconProps } from '@subwallet/react-ui/es/icon';
import CN from 'classnames';
import { CheckCircle, ClockCounterClockwise, ProhibitInset, SpinnerGap } from 'phosphor-react';
import React, { FC, useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & TransactionProcessStepItemType;

const Component: FC<Props> = (props: Props) => {
  const { className, index, isLastItem, status, text } = props;

  const iconProp = useMemo<SwIconProps>(() => {
    const iconInfo: SwIconProps = (() => {
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
  }, [index, status]);

  return (
    <div
      className={CN(className, {
        '-last-item': isLastItem
      })}
    >
      <div className={CN('__item-left-part', {
        '-pending': isStepPending(status),
        '-processing': isStepProcessing(status),
        '-complete': isStepCompleted(status),
        '-failed': isStepFailed(status),
        '-timeout': isStepTimeout(status)
      })}
      >
        <Icon
          {...iconProp}
          className={CN('__icon')}
        />

        {
          !isLastItem && (
            <div className='__line'></div>
          )
        }
      </div>
      <div className='__item-right-part'>
        <div className='__text'>{text}</div>
      </div>
    </div>
  );
};

export const TransactionProcessStepSimpleItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    gap: token.sizeXS,

    '.__item-left-part': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },

    '.__icon': {
      border: '1px solid currentcolor',
      minWidth: 24,
      minHeight: 24,
      borderRadius: '100%',
      alignItems: 'center',
      justifyContent: 'center'
    },

    '.__line': {
      width: 1,
      flex: 1,
      backgroundColor: 'currentcolor',
      marginTop: 2,
      marginBottom: 2
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

    '.__item-left-part.-pending': {
      color: token.colorTextLight7
    },

    '.__item-left-part.-processing': {
      color: '#D9A33E'
    },

    '.__item-left-part.-complete': {
      color: token.colorSuccess
    },

    '.__item-left-part.-failed': {
      color: token.colorError
    },

    '.__item-left-part.-timeout': {
      color: token.gold
    },

    '.__item-right-part': {
      paddingBottom: 4
    },

    '.__text': {
      marginTop: -8,
      minHeight: 40,
      display: 'flex',
      alignItems: 'center',
      color: token.colorTextLight3,
      fontSize: token.sizeSM,
      lineHeight: token.lineHeightSM
    },

    '&.-last-item': {
      '.__item-right-part': {
        paddingBottom: 0
      }
    }
  });
});
