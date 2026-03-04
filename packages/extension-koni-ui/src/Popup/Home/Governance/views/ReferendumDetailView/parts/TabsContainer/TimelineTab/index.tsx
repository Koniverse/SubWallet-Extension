// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GovStatusKey, RefTimelineItem } from '@subwallet/subsquare-api-sdk';
import React from 'react';
import styled from 'styled-components';

import { TimelineItemList } from './TimelineItemList';

type Props = ThemeProps & {
  timeline: RefTimelineItem[];
  referendumStatus: GovStatusKey;
};

const Component = ({ className, referendumStatus, timeline }: Props): React.ReactElement<Props> => {
  return (
    <div className={className}>
      <TimelineItemList
        referendumStatus={referendumStatus}
        timeline={timeline}
      />
    </div>
  );
};

export const TimelineTab = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});
