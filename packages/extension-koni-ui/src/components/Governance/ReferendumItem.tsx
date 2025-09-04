// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NumberDisplay, ReferendumStatusTag, ReferendumTrackTag, ReferendumVoteProgressBar } from '@subwallet/extension-koni-ui/components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getMinApprovalThreshold, getTallyVotesBarPercent, getTimeLeft } from '@subwallet/extension-koni-ui/utils/gov';
import { Icon } from '@subwallet/react-ui';
import { Referendum } from '@subwallet/subsquare-api-sdk';
import CN from 'classnames';
import { CircleHalf, ThumbsDown, ThumbsUp } from 'phosphor-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import SpendSummary from './SpendSummary';

type Props = ThemeProps & {
  onClick?: VoidFunction;
  item: Referendum;
  chain: string;
};

const Component = ({ chain, className, item, onClick }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { ayesPercent, naysPercent } = getTallyVotesBarPercent(item.onchainData.tally);

  const thresholdPercent = getMinApprovalThreshold(item);

  const timeLeft = getTimeLeft(item);

  return (
    <div
      className={CN(className)}
      onClick={onClick}
    >
      <div className='__i-ref-id-and-requested-amount'>
        <div className='__i-ref-id'>#{item.referendumIndex}</div>
        <div className='__i-requested-amount-container'>

          {item.allSpends && item.allSpends.length > 0 && (
            <SpendSummary
              chain={chain}
              className='__i-requested-amount'
              spends={item.allSpends}
            />
          )}
        </div>
      </div>

      <div className='__i-ref-title'>
        {item.title}
      </div>

      <div className='__i-tags'>
        <ReferendumStatusTag status={item.state.name} />
        <ReferendumTrackTag trackName={item.trackInfo.name} />
      </div>

      <ReferendumVoteProgressBar
        ayePercent={ayesPercent}
        className={'__i-vote-progress-bar'}
        nayPercent={naysPercent}
        thresholdPercent={thresholdPercent}
      />

      <>
        <div className='__i-separator' />
        <div className='__i-vote-summary-area'>

          <div className='__i-vote-summary'>
            <div className={'__i-vote-summary-label'}>
              {t('Voted')}:&nbsp;
            </div>

            <div className={'__i-vote-stat -aye'}>
              <NumberDisplay
                className={'__i-vote-stat-value'}
                decimal={0}
                value={20}
              />

              <Icon
                className={'__i-vote-stat-icon'}
                customSize={'12px'}
                phosphorIcon={ThumbsUp}
                weight={'fill'}
              />
            </div>

            <div className={'__i-vote-stat -abstain'}>
              <NumberDisplay
                className={'__i-vote-stat-value'}
                decimal={0}
                value={20}
              />

              <Icon
                className={'__i-vote-stat-icon'}
                customSize={'12px'}
                phosphorIcon={CircleHalf}
                weight={'fill'}
              />
            </div>

            <div className={'__i-vote-stat -nay'}>
              <NumberDisplay
                className={'__i-vote-stat-value'}
                decimal={0}
                value={20}
              />

              <Icon
                className={'__i-vote-stat-icon'}
                customSize={'12px'}
                phosphorIcon={ThumbsDown}
                weight={'fill'}
              />
            </div>
          </div>

          {timeLeft && (
            <div className='__i-reject-time'>
              {t('{{status}} in {{time}}', {
                status: ayesPercent > naysPercent ? t('Approve') : t('Reject'),
                time: timeLeft
              })}
            </div>
          )}
        </div>
      </>
    </div>
  );
};

const ReferendumItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    backgroundColor: token.colorBgSecondary,
    borderRadius: token.borderRadiusLG,
    padding: token.paddingSM,
    cursor: 'pointer',

    '.ant-number, .ant-typography': {
      color: 'inherit !important',
      fontSize: 'inherit !important',
      fontWeight: 'inherit !important',
      lineHeight: 'inherit'
    },

    '.__i-ref-id-and-requested-amount': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 22,
      marginBottom: token.marginXS
    },

    '.__i-ref-id': {
      lineHeight: token.lineHeightSM,
      fontSize: token.fontSizeSM,
      color: token.colorTextLight4
    },

    '.__i-requested-amount': {
      display: 'flex',
      fontSize: token.fontSize,
      gap: token.sizeXXS,
      lineHeight: token.lineHeight
    },

    '.__i-ref-title': {
      lineHeight: token.lineHeight,
      fontSize: token.fontSize,
      color: token.colorTextLight1,
      marginBottom: token.marginXS,
      display: '-webkit-box',
      '-webkit-line-clamp': '2',
      '-webkit-box-orient': 'vertical',
      overflow: 'hidden'
    },

    '.__i-tags': {
      marginBottom: token.marginSM,
      display: 'flex',
      gap: token.sizeXXS
    },

    '.__i-vote-progress-bar': {
      paddingBottom: token.paddingXXS
    },

    '.__i-separator': {
      marginTop: token.marginXXS,
      height: 2,
      backgroundColor: token.colorBgDivider,
      opacity: 0.8,
      marginBottom: token.marginXS
    },

    '.__i-vote-summary-area': {
      display: 'flex'
    },

    '.__i-vote-summary': {
      display: 'flex',
      flex: 1,
      color: token.colorTextLight4,
      fontSize: token.fontSizeXS,
      lineHeight: token.lineHeightXS
    },

    '.__i-vote-stat': {
      display: 'flex'
    },

    '.__i-vote-stat + .__i-vote-stat': {
      marginLeft: token.marginXXS
    },

    '.__i-vote-stat.-aye': {
      '.__i-vote-stat-icon': {
        color: token['green-7']
      }
    },

    '.__i-vote-stat.-abstain': {
      '.__i-vote-stat-icon': {
        color: token.colorTextLight2
      }
    },

    '.__i-vote-stat.-nay': {
      '.__i-vote-stat-icon': {
        color: token['red-7']
      }
    },

    '.__i-vote-stat-icon': {
      marginLeft: 2
    },

    '.__i-reject-time': {
      color: token.colorTextLight1,
      fontSize: token.fontSizeXS,
      lineHeight: token.lineHeightXS
    }
  };
});

export default ReferendumItem;
