// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReferendumStatusTag, ReferendumTrackTag } from '@subwallet/extension-koni-ui/components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ReferendumDetail } from '@subwallet/subsquare-api-sdk';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  referendumDetail: ReferendumDetail,
};

const Component = ({ className, referendumDetail }: Props): React.ReactElement<Props> => {
  return (
    <div className={className}>
      <div className='__ref-title'>
        {referendumDetail.title}
      </div>
      <div className='__tags'>
        <ReferendumStatusTag status={referendumDetail.state.name} />
        <ReferendumTrackTag trackName={referendumDetail.trackInfo.name} />
      </div>
    </div>
  );
};

export const MetaArea = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    paddingInline: token.padding,

    '.__ref-title': {
      lineHeight: token.lineHeight,
      fontSize: token.fontSize,
      color: token.colorTextLight1,
      marginBottom: token.marginXS
    },

    '.__tags': {
      marginBottom: token.marginSM,
      display: 'flex',
      gap: token.sizeXXS
    }
  };
});
