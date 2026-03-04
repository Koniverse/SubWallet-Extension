// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { useGetAccountByAddress, useGetNativeTokenBasicInfo, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { UserVoting } from '@subwallet/extension-koni-ui/types/gov';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import BigNumber from 'bignumber.js';
import CN from 'classnames';
import { CircleHalf, ThumbsDown, ThumbsUp } from 'phosphor-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import NumberDisplay from '../NumberDisplay';

type Props = ThemeProps & {
  userVoting?: UserVoting[];
  chain: string;
  iconVoteStatSize?: string;
  isDependentOnAllAccount?: boolean;
};

const Component = ({ chain, className, iconVoteStatSize = '12px', isDependentOnAllAccount = true, userVoting }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { decimals } = useGetNativeTokenBasicInfo(chain);
  const isAllAccount = useSelector((state: RootState) => state.accountState.isAllAccount);
  const vote = userVoting?.[0].votes;
  const delegation = userVoting?.[0].delegation;
  const delegatedAccount = useGetAccountByAddress(delegation?.target);
  const delegateTargetName = delegatedAccount?.name || toShort(delegation?.target || '');

  return (
    <div className={CN(className, '__i-vote-summary')}>
      {!!userVoting && userVoting.length > 0
        ? (isDependentOnAllAccount ? isAllAccount : userVoting.length > 1)
          ? (
            <div className='__i-vote-summary-label'>
              {t('ui.GOVERNANCE.components.Governance.ReferendumVoteSummary.votedDelegatedTotal', { count: userVoting.length, account: userVoting.length > 1 ? t('ui.GOVERNANCE.components.Governance.ReferendumVoteSummary.accounts') : t('ui.GOVERNANCE.components.Governance.ReferendumVoteSummary.account') })}
            </div>
          )
          : (
            <>
              {!!vote && (
                <>
                  <div className='__i-vote-summary-label'>
                    {t('ui.GOVERNANCE.components.Governance.ReferendumVoteSummary.voted')}:&nbsp;
                  </div>
                  {(BigNumber(vote?.ayeAmount || 0).gt(0) || vote.type !== GovVoteType.NAY) && (
                    <div className='__i-vote-stat -aye'>
                      <NumberDisplay
                        className='__i-vote-stat-value'
                        decimal={decimals}
                        value={vote?.ayeAmount || '0'}
                      />
                      <Icon
                        className='__i-vote-stat-icon'
                        customSize={iconVoteStatSize}
                        phosphorIcon={ThumbsUp}
                        weight='fill'
                      />
                    </div>
                  )}

                  {(BigNumber(vote?.abstainAmount || 0).gt(0) || vote.type === GovVoteType.ABSTAIN) && (
                    <div className='__i-vote-stat -abstain'>
                      <NumberDisplay
                        className='__i-vote-stat-value'
                        decimal={decimals}
                        value={vote.abstainAmount || '0'}
                      />
                      <Icon
                        className='__i-vote-stat-icon'
                        customSize={iconVoteStatSize}
                        phosphorIcon={CircleHalf}
                        weight='fill'
                      />
                    </div>
                  )}

                  {(BigNumber(vote?.nayAmount || 0).gt(0) || vote.type !== GovVoteType.AYE) && (
                    <div className='__i-vote-stat -nay'>
                      <NumberDisplay
                        className='__i-vote-stat-value'
                        decimal={decimals}
                        value={vote.nayAmount || '0'}
                      />
                      <Icon
                        className='__i-vote-stat-icon'
                        customSize={iconVoteStatSize}
                        phosphorIcon={ThumbsDown}
                        weight='fill'
                      />
                    </div>
                  )}
                </>
              )}

              {!!delegation && (
                <NumberDisplay
                  className='__i-vote-stat-value'
                  decimal={decimals}
                  prefix={`${t('ui.GOVERNANCE.components.Governance.ReferendumVoteSummary.delegated')}: `}
                  suffix={t('ui.GOVERNANCE.components.Governance.ReferendumVoteSummary.viaTarget', { target: delegateTargetName })}
                  value={delegation.balance || '0'}
                />
              )}
            </>
          )
        : (
          <div className='__i-vote-summary-label'>
            {t('ui.GOVERNANCE.components.Governance.ReferendumVoteSummary.notVotedYet')}
          </div>
        )
      }
    </div>
  );
};

const ReferendumVoteSummary = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    color: token.colorTextLight4,
    fontSize: token.fontSizeXS,
    lineHeight: token.lineHeightXS,

    '.__i-vote-stat': {
      display: 'flex'
    },

    '.__i-vote-stat + .__i-vote-stat': {
      marginLeft: token.marginXXS
    },

    '.__i-vote-stat.-aye .__i-vote-stat-icon': {
      color: token['green-7']
    },

    '.__i-vote-stat.-abstain .__i-vote-stat-icon': {
      color: token.colorTextLight2
    },

    '.__i-vote-stat.-nay .__i-vote-stat-icon': {
      color: token['red-7']
    },

    '.__i-vote-stat-icon': {
      marginLeft: 2
    },

    '.__i-vote-stat-value': {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    }
  };
});

export default ReferendumVoteSummary;
