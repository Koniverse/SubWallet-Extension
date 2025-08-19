// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { governanceVoteIconMap } from '@subwallet/extension-koni-ui/constants';
import { GovernanceVoteType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  onClick?: VoidFunction;
  type: GovernanceVoteType;
  disabled?: boolean;
  loading?: boolean;
};

const Component = ({ className, disabled, loading, onClick, type }: Props): React.ReactElement<Props> => {
  return (
    <Button
      className={CN(className, `-type-${type}`)}
      disabled={loading || disabled}
      icon={(
        <Icon
          customSize={'28px'}
          phosphorIcon={governanceVoteIconMap[type]}
          weight={'fill'}
        />
      )}
      loading={loading}
      onClick={onClick}
      shape='circle'
    />
  );
};

export const VoteButton = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '&.ant-btn.-type-aye': {
      backgroundColor: token['green-7'],

      '&:hover': {
        backgroundColor: token['green-8']
      },

      '&:active': {
        backgroundColor: token['green-6']
      }
    },
    '&.ant-btn.-type-nay': {
      backgroundColor: token['red-7'],

      '&:hover': {
        backgroundColor: token['red-8']
      },

      '&:active': {
        backgroundColor: token['red-6']
      }
    },
    '&.ant-btn.-type-abstain, &.ant-btn.-type-split': {
      backgroundColor: token['gray-2'],

      '&:hover': {
        backgroundColor: token['gray-3']
      },

      '&:active': {
        backgroundColor: token['gray-1']
      }
    }
  };
});
