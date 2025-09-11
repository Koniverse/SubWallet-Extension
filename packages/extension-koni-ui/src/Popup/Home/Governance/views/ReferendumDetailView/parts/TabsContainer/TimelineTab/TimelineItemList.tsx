// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GovStatusKey, RefTimelineItem } from '@subwallet/subsquare-api-sdk';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { TimelineItem } from './TimelineItem';

type Props = ThemeProps & {
  timeline: RefTimelineItem[];
  referendumStatus: GovStatusKey;
};

const Component = ({ className, timeline }: Props): React.ReactElement<Props> => {
  const lastItemState = useMemo(() => {
    return undefined;
  }, []);

  return (
    <div className={className}>
      {
        timeline.map((item, index) => (
          <TimelineItem
            datetime={item.indexer.blockTime}
            isLastItem={index === timeline.length - 1}
            key={item.name}
            state={index === timeline.length - 1 ? lastItemState : undefined}
            title={item.name}
          />
        ))
      }
    </div>
  );
};

export const TimelineItemList = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    paddingInline: token.paddingSM,
    marginTop: -6
  };
});
