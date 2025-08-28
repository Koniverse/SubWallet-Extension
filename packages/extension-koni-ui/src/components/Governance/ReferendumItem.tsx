// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { govStatusItems } from '@subwallet/extension-koni-ui/constants';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon } from '@subwallet/react-ui';
import { Referendum } from '@subwallet/subsquare-api-sdk';
import React from 'react';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  onClick?: VoidFunction;
  item: Referendum;
};

const Component = ({ className, item, onClick }: Props): React.ReactElement<Props> => {
  const { token } = useTheme() as Theme;

  const statusConfig = govStatusItems.find((s) => s.key === item.state.name);
  const StatusIcon = statusConfig?.icon;
  const color = statusConfig?.colorToken && token[statusConfig.colorToken]
    ? (token[statusConfig.colorToken] as string)
    : token.colorText;

  return (
    <div
      className={className}
      onClick={onClick}
    >
      <div className='__ref-id'>
        Referendum #{item.referendumIndex}
      </div>

      <div className='__track-name'>{item.trackInfo.name}</div>

      <div className='__status'>
        {StatusIcon && (
          <Icon
            customSize='16px'
            iconColor={color}
            phosphorIcon={StatusIcon}
            weight='fill'
          />
        )}
        <span style={{ marginLeft: 6, color }}>{item.state.name}</span>
      </div>
    </div>
  );
};

const ReferendumItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    backgroundColor: token.colorBgSecondary,
    borderRadius: token.borderRadiusLG,
    minHeight: 80,
    cursor: 'pointer'
  };
});

export default ReferendumItem;
