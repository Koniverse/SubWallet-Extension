// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReferendumVoteProgressBar, ReferendumVoteSummary } from '@subwallet/extension-koni-ui/components';
import { GovVotedAccountsModal } from '@subwallet/extension-koni-ui/components/Modal';
import { useGetGovLockedInfos, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { UserVoting } from '@subwallet/extension-koni-ui/types/gov';
import { getMinApprovalThreshold, getTallyVotesBarPercent, getTimeLeft, GOV_QUERY_KEYS } from '@subwallet/extension-koni-ui/utils/gov';
import { formatVoteResult } from '@subwallet/extension-koni-ui/utils/gov/votingStats';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import { ReferendumDetail, SubsquareApiSdk } from '@subwallet/subsquare-api-sdk';
import { useQuery } from '@tanstack/react-query';
import { Clock, Info } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { VotingStats } from './VotingStats';

type Props = ThemeProps & {
  referendumDetail: ReferendumDetail,
  onClickVote: VoidFunction;
  chain: string
  sdkInstance?: SubsquareApiSdk
};

const GovVotedAccountsModalId = 'gov-voted-accounts-modal';

const Component = ({ chain, className, onClickVote, referendumDetail, sdkInstance }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { ayesPercent, naysPercent } = getTallyVotesBarPercent(referendumDetail.onchainData.tally);
  const referendumId = referendumDetail?.referendumIndex;
  const thresholdPercent = getMinApprovalThreshold(referendumDetail);
  const govLockedInfos = useGetGovLockedInfos();
  const { activeModal } = useContext(ModalContext);
  const [timeLeft, setTimeLeft] = useState<string | undefined>(() =>
    getTimeLeft(referendumDetail)
  );

  const userVotingInfo = useMemo<UserVoting[] | undefined>(() => {
    if (!referendumDetail) {
      return [];
    }

    const userVoting: UserVoting[] = [];
    const trackId = Number(referendumDetail.trackInfo.id);

    (govLockedInfos || []).forEach((acc) => {
      if (acc.chain !== chain) {
        return;
      }

      const track = acc.tracks?.find((t) => Number(t.trackId) === trackId);

      if (!track) {
        return;
      }

      const votesForThisRef = track.votes?.find(
        (v) => Number(v.referendumIndex) === referendumDetail.referendumIndex
      );

      const delegation = track.delegation ? { ...track.delegation } : undefined;

      if (votesForThisRef || delegation) {
        userVoting.push({
          address: acc.address,
          trackId,
          votes: votesForThisRef,
          delegation
        });
      }
    });

    return userVoting.length > 0 ? userVoting : undefined;
  }, [chain, govLockedInfos, referendumDetail]);

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

  const openUserVotingInfo = useCallback(() => {
    activeModal(GovVotedAccountsModalId);
  }, [activeModal]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(referendumDetail));
    }, 1000);

    return () => clearInterval(interval);
  }, [referendumDetail]);

  return (
    <div className={className}>
      <div className={'__vote-title-box'}>
        <div className={'__vote-title'}>{t('Voting Summary')}</div>
        {!!timeLeft && (
          <div className={'__vote-remaining-time'}>
            <Icon
              customSize={'16px'}
              phosphorIcon={Clock}
              weight={'fill'}
            />
            <div>
              {
                ayesPercent > naysPercent
                  ? t('Approve in {{timeLeft}}', { timeLeft })
                  : t('Reject in {{timeLeft}}', { timeLeft })
              }
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

        {!!userVotingInfo &&
          <div className={'__i-vote-summary-total'}>
            <ReferendumVoteSummary
              chain={chain}
              iconVoteStatSize={'16px'}
              userVoting={userVotingInfo}
            />

            {userVotingInfo.length > 1 &&
              <div onClick={openUserVotingInfo}>
                <Icon
                  className={'__i-vote-summary-total-info'}
                  customSize={'16px'}
                  phosphorIcon={Info}
                  weight={'bold'}
                />
              </div>
            }
          </div>
        }

        <VotingStats
          chain={chain}
          isLegacyGov={!!sdkInstance?.isLegacyGov}
          votingData={votingData}
        />
      </div>

      <Button
        block={true}
        disabled={referendumDetail.version === 1}
        onClick={onClickVote}
      >
        {t('Vote')}
      </Button>

      {!!userVotingInfo && <GovVotedAccountsModal
        chain={chain}
        modalId={GovVotedAccountsModalId}
        usersVoted={userVotingInfo}
      />}
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
    },

    '.__i-vote-summary-total': {
      marginTop: token.marginSM,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: token.colorTextLight4,

      '.__i-vote-summary': {
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        fontWeight: token.bodyFontWeight
      },

      '.__i-vote-summary-total-info': {
        cursor: 'pointer',
        transition: 'color 0.2s',
        color: token.colorTextLight3,

        '&:hover': {
          color: token.colorTextLight1
        }
      }
    },

    '.__i-vote-summary, .__i-vote-stat-value .ant-typography': {
      fontSize: `${token.fontSizeSM}px !important`,
      lineHeight: `${token.lineHeightSM} !important`,
      fontWeight: `${token.bodyFontWeight} !important`,
      color: `${token.colorTextLight4} !important`
    },

    '.__i-vote-summary': {
      alignItems: 'baseline'
    },

    '.__i-vote-stat': {
      alignItems: 'center'
    },

    '.__legend-part': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      fontWeight: token.bodyFontWeight
    }

  };
});
