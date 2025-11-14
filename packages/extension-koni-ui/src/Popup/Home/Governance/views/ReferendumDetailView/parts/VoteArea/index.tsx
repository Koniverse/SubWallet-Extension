// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReferendumVoteProgressBar, ReferendumVoteSummary } from '@subwallet/extension-koni-ui/components';
import { GovVotedAccountsModal } from '@subwallet/extension-koni-ui/components/Modal';
import { useGetGovLockedInfos, useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { UserVoting } from '@subwallet/extension-koni-ui/types/gov';
import { getMinApprovalThreshold, getTallyVotesBarPercent, getTimeLeft, getUserVotingListForReferendum, GOV_QUERY_KEYS } from '@subwallet/extension-koni-ui/utils/gov';
import { formatVoteResult } from '@subwallet/extension-koni-ui/utils/gov/votingStats';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import { GOV_COMPLETED_STATES, GOV_PREPARING_STATES, ReferendumDetail, ReferendumVoteDetail, SubsquareApiSdk } from '@subwallet/subsquare-api-sdk';
import { useQuery } from '@tanstack/react-query';
import { Clock, Info } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { useMigrationOffset } from '../../../../hooks/useGovernanceView/useMigrationOffset';
import { VotingStats } from './VotingStats';

type Props = ThemeProps & {
  referendumDetail: ReferendumDetail,
  onClickVote: VoidFunction;
  chain: string
  sdkInstance?: SubsquareApiSdk;
  voteMap?: Map<string, ReferendumVoteDetail>;
};

const GovVotedAccountsModalId = 'gov-voted-accounts-modal';

const Component = ({ chain, className, onClickVote, referendumDetail, sdkInstance, voteMap }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { ayesPercent, naysPercent } = getTallyVotesBarPercent(referendumDetail.onchainData.tally);
  const { data: migrationBlockOffset } = useMigrationOffset(chain, sdkInstance);

  const referendumId = referendumDetail?.referendumIndex;

  const govLockedInfos = useGetGovLockedInfos(chain);
  const { activeModal } = useContext(ModalContext);
  const isAllAccount = useSelector((state) => state.accountState.isAllAccount);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const [timeLeft, setTimeLeft] = useState<string | undefined>();

  const userVotingInfo = useMemo<UserVoting[] | undefined>(() => {
    if (!referendumDetail) {
      return [];
    }

    return getUserVotingListForReferendum({ referendum: referendumDetail, govLockedInfos, voteMap, chainInfo: chainInfoMap[chain] });
  }, [chain, chainInfoMap, govLockedInfos, referendumDetail, voteMap]);

  const thresholdPercent = useMemo(
    () => getMinApprovalThreshold(referendumDetail, chain, migrationBlockOffset?.offset || 0),
    [referendumDetail, chain, migrationBlockOffset?.offset]
  );

  const timeLeftContent = useMemo(() => {
    const time = timeLeft ?? '';
    const isPreparing = GOV_PREPARING_STATES.includes(referendumDetail.state.name);
    const isAyeLeading = ayesPercent > naysPercent;

    return isPreparing
      ? (isAyeLeading ? t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.VoteArea.decisionStartsIn', { time }) : t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.VoteArea.timeOutIn', { time }))
      : (isAyeLeading ? t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.VoteArea.approveIn', { time }) : t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.VoteArea.rejectIn', { time }));
  }, [ayesPercent, naysPercent, referendumDetail.state.name, t, timeLeft]);

  const { data } = useQuery({
    queryKey: GOV_QUERY_KEYS.referendumVotes(chain, referendumId),
    queryFn: async () => {
      if (referendumId === null || referendumId === undefined || !sdkInstance) {
        return undefined;
      }

      return await sdkInstance.getReferendaVotes(`${referendumId}`);
    },
    enabled: !!chain,
    staleTime: 60 * 1000
  });

  const votingData = useMemo(() => formatVoteResult(data || []), [data]);

  const openUserVotingInfo = useCallback(() => {
    activeModal(GovVotedAccountsModalId);
  }, [activeModal]);

  const shouldShowVoteButton = useMemo(() => {
    const isVersion1 = referendumDetail.version === 1;
    const isCompleted = GOV_COMPLETED_STATES.includes(referendumDetail.state.name);

    return !(isVersion1 || isCompleted);
  }, [referendumDetail.state.name, referendumDetail.version]);

  useEffect(() => {
    const updateTime = () => setTimeLeft(getTimeLeft(referendumDetail, chain, migrationBlockOffset));

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [referendumDetail, chain, migrationBlockOffset]);

  return (
    <div className={className}>
      <div className={'__vote-title-box'}>
        <div className={'__vote-title'}>{t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.VoteArea.votingSummary')}</div>
        {!!timeLeft && (
          <div className={'__vote-remaining-time'}>
            <Icon
              customSize={'16px'}
              phosphorIcon={Clock}
              weight={'fill'}
            />
            <div>
              {timeLeftContent}
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

        {!!userVotingInfo?.length &&
          <div className={'__i-vote-summary-total'}>
            <ReferendumVoteSummary
              chain={chain}
              iconVoteStatSize={'16px'}
              userVoting={userVotingInfo}
            />
            {isAllAccount && <div onClick={openUserVotingInfo}>
              <Icon
                className={'__i-vote-summary-total-info'}
                customSize={'16px'}
                phosphorIcon={Info}
                weight={'bold'}
              />
            </div>}
          </div>
        }

        <VotingStats
          chain={chain}
          isLegacyGov={!!sdkInstance?.isLegacyGov}
          votingData={votingData}
        />
      </div>

      {shouldShowVoteButton && <Button
        block={true}
        onClick={onClickVote}
      >
        {(userVotingInfo?.length === 1 && !!userVotingInfo[0].votes) ? t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.VoteArea.revote') : t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.VoteArea.vote')}
      </Button>}

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
