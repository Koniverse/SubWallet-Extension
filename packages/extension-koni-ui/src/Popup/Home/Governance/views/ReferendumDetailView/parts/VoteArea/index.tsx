// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReferendumVoteProgressBar } from '@subwallet/extension-koni-ui/components';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getMinApprovalThreshold, getTallyVotesBarPercent, getTimeLeft, GOV_QUERY_KEYS } from '@subwallet/extension-koni-ui/utils/gov';
import { formatVoteResult } from '@subwallet/extension-koni-ui/utils/gov/votingStats';
import { Button } from '@subwallet/react-ui';
import { ReferendumDetail, SubsquareApiSdk } from '@subwallet/subsquare-api-sdk';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { VotingStats } from './VotingStats';

type Props = ThemeProps & {
  referendumDetail: ReferendumDetail,
  onClickVote: VoidFunction;
  chain: string
  sdkInstance?: SubsquareApiSdk
};

const Component = ({ chain, className, onClickVote, referendumDetail, sdkInstance }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { ayesPercent, naysPercent } = getTallyVotesBarPercent(referendumDetail.onchainData.tally);
  const referendumId = referendumDetail?.referendumIndex;
  const thresholdPercent = getMinApprovalThreshold(referendumDetail);
  const timeLeft = getTimeLeft(referendumDetail);

  const { data } = useQuery({
    queryKey: GOV_QUERY_KEYS.referendumVotes(chain, referendumId),
    queryFn: async () => {
      if (!referendumId || !sdkInstance) {
        return undefined;
      }

      return await sdkInstance.getReferendaVotes(`${referendumId}`);
    },
    enabled: !!referendumId && !!chain,
    staleTime: 60 * 1000
  });

  const votingData = useMemo(() => formatVoteResult(data || []), [data]);

  return (
    <div className={className}>
      <h3>Voting Summary</h3>
      {timeLeft && (
        <div>timeLeft: {timeLeft}</div>
      )}

      <ReferendumVoteProgressBar
        ayePercent={ayesPercent}
        className={'__i-vote-progress-bar'}
        nayPercent={naysPercent}
        thresholdPercent={thresholdPercent}
      />

      <VotingStats
        chain={chain}
        votingData={votingData}
      />

      <Button
        block={true}
        onClick={onClickVote}
      >
        {t('Vote')}
      </Button>
    </div>
  );
};

export const VoteArea = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});
