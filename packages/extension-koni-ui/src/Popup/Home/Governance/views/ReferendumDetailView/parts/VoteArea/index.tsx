// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ReferendumDetail } from '@subwallet/subsquare-api-sdk/types';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  referendumDetail: ReferendumDetail,
};

const Component = ({ className }: Props): React.ReactElement<Props> => {
  return (
    <div className={className}>
      Aye, ThresHold, Nay
    </div>
  );
};

export const VoteArea = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});
