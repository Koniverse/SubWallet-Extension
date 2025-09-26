// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { PhosphorIcon, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CircleHalf, ThumbsDown, ThumbsUp } from 'phosphor-react';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  type: GovVoteType;
}

const VOTE_MAP: Record<GovVoteType, { icon: PhosphorIcon; label: string; style: string }> = {
  [GovVoteType.AYE]: {
    icon: ThumbsUp,
    label: 'Aye',
    style: '-aye'
  },
  [GovVoteType.NAY]: {
    icon: ThumbsDown,
    label: 'Nay',
    style: '-nay'
  },
  [GovVoteType.ABSTAIN]: {
    icon: CircleHalf,
    label: 'Abstain',
    style: '-abstain'
  },
  [GovVoteType.SPLIT]: {
    icon: CircleHalf,
    label: 'Split',
    style: '-split'
  }
};

const Component = ({ className, type }: Props) => {
  const { icon, label, style } = VOTE_MAP[type];
  const { t } = useTranslation();

  return (
    <div className={CN(className, 'vote-map')}>
      <Icon
        className={CN('voting-stats__icon', style)}
        customSize={'16px'}
        phosphorIcon={icon}
        weight={'fill'}
      />
      <div className={CN('voting-stats__label', style)}>
        {t(label)}
      </div>
    </div>
  );
};

const VoteMetaInfo = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',

    '& .voting-stats__icon': {
      marginRight: token.marginXXS
    },

    '& .voting-stats__label': {
      fontSize: '14px',
      lineHeight: token.lineHeight,
      fontWeight: token.fontWeightStrong
    },

    '& .-aye': {
      color: token['green-7']
    },

    '& .-nay': {
      color: token['red-7']
    },

    '& .-abstain': {
      color: token.colorTextLight2
    }
  };
});

export default VoteMetaInfo;
