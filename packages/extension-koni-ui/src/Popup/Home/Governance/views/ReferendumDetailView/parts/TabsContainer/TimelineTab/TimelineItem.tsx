// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReferendumTimelineProcessState } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { customFormatDate } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import { SwIconProps } from '@subwallet/react-ui/es/icon';
import CN from 'classnames';
import { CheckCircle, PlusCircle, XCircle } from 'phosphor-react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  state?: ReferendumTimelineProcessState;
  title: string;
  datetime: number;
  isLastItem?: boolean;
};

const Component = ({ className, datetime, state = ReferendumTimelineProcessState.SUCCESS, title, isLastItem }: Props): React.ReactElement<Props> => {
  const iconProp = useMemo<SwIconProps>(() => {
    const iconInfo: SwIconProps = (() => {
      if (state === ReferendumTimelineProcessState.IN_PROGRESS) {
        return {
          phosphorIcon: PlusCircle,
          weight: 'fill'
        };
      } else if (state === ReferendumTimelineProcessState.TERMINATED) {
        return {
          phosphorIcon: XCircle,
          weight: 'fill'
        };
      }

      return {
        phosphorIcon: CheckCircle,
        weight: 'fill'
      };
    })();

    return {
      ...iconInfo,
      customSize: '12px'
    };
  }, [state]);

  return (
    <div className={CN(className, {
      '-last-item': isLastItem,
      '-success': state === ReferendumTimelineProcessState.SUCCESS,
      '-in-progress': state === ReferendumTimelineProcessState.IN_PROGRESS,
      '-terminated': state === ReferendumTimelineProcessState.TERMINATED
    })}
    >
      <div className={'__i-left-part'}>
        <Icon
          {...iconProp}
          className={'__i-icon'}
        />
      </div>
      <div className='__i-right-part'>
        <div className='__i-right-part-inner'>
          <div className='__i-timeline-title'>{title}</div>
          <div className='__i-timeline-time'>{customFormatDate(datetime, '#hh#:#mm# #AMPM# - #MMM# #DD#, #YYYY#')}</div>
        </div>
      </div>
    </div>
  );
};

export const TimelineItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'flex',
    gap: token.size,

    '.__i-left-part': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },

    '.__i-left-part:before, .__i-left-part:after': {
      content: '""',
      display: 'block',
      width: 1,
      flex: 1
    },

    '.__i-left-part:before': {
      marginBottom: 6
    },

    '.__i-left-part:after': {
      marginTop: 6,
      backgroundColor: 'currentcolor'
    },

    '.__i-icon': {
      border: '1px solid currentcolor',
      minWidth: 24,
      minHeight: 24,
      borderRadius: '100%',
      alignItems: 'center',
      justifyContent: 'center'
    },

    '.__i-right-part': {
      flex: 1,
      paddingTop: 6,
      paddingBottom: 6
    },

    '.__i-right-part-inner': {
      backgroundColor: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: token.padding,
      paddingRight: token.paddingXS
    },

    '.__i-timeline-title': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.headingFontWeight,
      color: token.colorTextLight1
    },

    '.__i-timeline-time': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextLight4
    },

    // success
    '&.-success .__i-left-part': {
      color: token.colorSuccess
    },

    '&.-success + & .__i-left-part:before': {
      backgroundColor: token.colorSuccess
    },

    // in-progress
    '&.-in-progress .__i-left-part': {
      color: token.colorTextLight2
    },

    '&.-in-progress + & .__i-left-part:before': {
      backgroundColor: token.colorTextLight2
    },

    // complete
    '&.-terminated .__i-left-part': {
      color: token.colorError
    },

    '&.-terminated + & .__i-left-part:before': {
      backgroundColor: token.colorError
    },

    '&.-last-item': {
      '.__i-left-part:after': {
        opacity: 0
      }
    }
  };
});
