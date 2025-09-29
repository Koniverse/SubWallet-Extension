// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReferendumTimelineProcessState } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GOV_COMPLETED_FAILED_STATES, GOV_COMPLETED_SUCCESS_STATES, GOV_ONGOING_STATES, GovStatusKey, RefTimelineItem } from '@subwallet/subsquare-api-sdk';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { TimelineItem } from './TimelineItem';

type Props = ThemeProps & {
  timeline: RefTimelineItem[];
  referendumStatus: GovStatusKey;
};

const Component = ({ className, referendumStatus, timeline }: Props): React.ReactElement<Props> => {
  const lastItemState = useMemo<ReferendumTimelineProcessState | undefined>(() => {
    if (GOV_ONGOING_STATES.includes(referendumStatus)) {
      return ReferendumTimelineProcessState.IN_PROGRESS;
    }

    if (GOV_COMPLETED_SUCCESS_STATES.includes(referendumStatus)) {
      return ReferendumTimelineProcessState.SUCCESS;
    }

    if (GOV_COMPLETED_FAILED_STATES.includes(referendumStatus)) {
      return ReferendumTimelineProcessState.TERMINATED;
    }

    return undefined;
  }, [referendumStatus]);

  const timelineItems = useMemo(() => {
    return timeline.map((item, index) => (
      <TimelineItem
        datetime={item.indexer.blockTime}
        isLastItem={index === timeline.length - 1}
        key={item.name}
        state={index === timeline.length - 1 ? lastItemState : undefined}
        title={item.name}
      />
    ));
  }, [timeline, lastItemState]);

  return (
    <div className={className}>
      {timelineItems}
    </div>
  );
};

export const TimelineItemList = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    paddingInline: token.paddingSM,
    marginTop: -6
  };
});
