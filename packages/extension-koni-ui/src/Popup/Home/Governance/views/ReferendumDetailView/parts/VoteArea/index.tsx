// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReferendumVoteProgressBar } from '@subwallet/extension-koni-ui/components';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getMinApprovalThreshold, getTallyVotesBarPercent, getTimeLeft, GOV_QUERY_KEYS } from '@subwallet/extension-koni-ui/utils/gov';
import { formatVoteResult } from '@subwallet/extension-koni-ui/utils/gov/votingStats';
import { Button, Icon } from '@subwallet/react-ui';
import { ReferendumDetail, SubsquareApiSdk } from '@subwallet/subsquare-api-sdk';
import { useQuery } from '@tanstack/react-query';
import { Clock } from 'phosphor-react';
import React, { useEffect, useMemo, useState } from 'react';
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
  const [timeLeft, setTimeLeft] = useState<string | undefined>(() =>
    getTimeLeft(referendumDetail)
  );

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

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(referendumDetail));
    }, 1000);

    return () => clearInterval(interval);
  }, [referendumDetail]);

  return (
    <div className={className}>
      <div className={'__vote-title-box'}>
        <div className={'__vote-title'}>Voting Summary</div>
        {timeLeft && (
          <div className={'__vote-remaining-time'}>
            <Icon
              customSize={'13px'}
              phosphorIcon={Clock}
              weight={'fill'}
            />
            <div>
              Reject in {timeLeft}
            </div>
          </div>
        )}
      </div>

      <div className={'__vote-summary-box'}>
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
      </div>

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
    display: 'flex',
    flexDirection: 'column',
    gap: token.sizeSM,
    padding: `${token.paddingXS}px ${token.paddingSM}px ${token.paddingSM}px ${token.paddingSM}px`,
    backgroundColor: token.colorBgSecondary,
    borderRadius: token.borderRadiusLG,

    '.__vote-title-box': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',

      '.__vote-title': {
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        color: token.colorTextLight4
      },

      '.__vote-remaining-time': {
        fontSize: token.fontSizeSM,
        lineHeight: '20px',
        color: token.colorTextLight2,
        fontWeight: token.bodyFontWeight,
        display: 'flex',
        gap: token.sizeXXS / 2,
        alignItems: 'center'
      }
    },

    '.__vote-summary-box': {
      backgroundColor: token.colorBgDefault,
      borderRadius: token.borderRadiusLG,
      padding: `${token.paddingXS}px ${token.paddingSM}px`
    }

  };
});
