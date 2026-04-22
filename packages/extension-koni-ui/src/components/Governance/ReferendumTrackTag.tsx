// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertHexColorToRGBA } from '@subwallet/extension-koni-ui/utils';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  trackName: string
};

const Component = ({ className, trackName }: Props): React.ReactElement<Props> => {
  return (
    <div className={className}>
      <div className='__label'>
        {trackName}
      </div>
    </div>
  );
};

const ReferendumTrackTag = styled(Component)<Props>(({ theme: { token } }: Props) => {
  const color = token['gray-6'];
  const backgroundColor = convertHexColorToRGBA(color, 0.1);

  return {
    backgroundColor,
    color,
    display: 'flex',
    gap: token.sizeXXS,
    borderRadius: token.borderRadiusLG,
    height: 22,
    alignItems: 'center',
    paddingInline: token.sizeXS,

    '.__label': {
      fontSize: token.fontSizeXS,
      lineHeight: token.lineHeightXS,
      fontWeight: token.headingFontWeight
    }
  };
});

export default ReferendumTrackTag;
