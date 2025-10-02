// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useGetNativeTokenBasicInfo } from '@subwallet/extension-koni-ui/hooks';
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
  iconVoteStatSize?: string
};

const Component = ({ chain, className, iconVoteStatSize = '12px', userVoting }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { decimals } = useGetNativeTokenBasicInfo(chain);

  const vote = userVoting?.[0].votes;
  const delegation = userVoting?.[0].delegation;

  return (
    <div className={CN(className, '__i-vote-summary')}>
      {userVoting && userVoting.length > 0
        ? userVoting.length > 1
          ? (
            <div className='__i-vote-summary-label'>
              {t('Voted/Delegated with {{count}} accounts total', { count: userVoting.length })}
            </div>
          )
          : (
            <>
              {vote && (
                <>
                  <div className='__i-vote-summary-label'>
                    {t('Voted:')}&nbsp;
                  </div>
                  {BigNumber(vote?.ayeAmount || 0).gt(0) && (
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

                  {BigNumber(vote?.abstainAmount || 0).gt(0) && (
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

                  {BigNumber(vote?.nayAmount || 0).gt(0) && (
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

              {delegation && (
                <>
                  <div className='__i-vote-summary-label'>
                    {t('Voted:')}&nbsp;
                  </div>
                  <NumberDisplay
                    className='__i-vote-stat-value'
                    decimal={decimals}
                    value={delegation.balance || '0'}
                  />&nbsp;{t('via {{target}}', { target: toShort(delegation.target) })}
                </>
              )}
            </>
          )
        : (
          <div className='__i-vote-summary-label'>
            {t('Not voted yet')}
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
    }
  };
});

export default ReferendumVoteSummary;
