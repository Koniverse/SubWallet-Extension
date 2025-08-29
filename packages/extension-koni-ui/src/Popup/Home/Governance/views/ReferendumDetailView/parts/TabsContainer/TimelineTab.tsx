// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { TimelineItem } from '@subwallet/subsquare-api-sdk';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  timeline: TimelineItem[]
};

const Component = ({ className, timeline }: Props): React.ReactElement<Props> => {
  return (
    <div className={className}>
      {timeline.map((item) => {
        const date = new Date(item.indexer.blockTime);
        const timeFormatted = `${date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })} - ${date.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        })}`;

        return (
          <div
            className='timeline-item'
            key={item._id}
          >
            <div className='timeline-name'>{item.name}</div>
            <div className='timeline-time'>{timeFormatted}</div>
          </div>
        );
      })}
    </div>
  );
};

export const TimelineTab = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});
