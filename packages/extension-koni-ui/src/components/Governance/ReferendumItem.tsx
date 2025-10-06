// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReferendumStatusTag, ReferendumTrackTag, ReferendumVoteProgressBar } from '@subwallet/extension-koni-ui/components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ReferendumWithVoting } from '@subwallet/extension-koni-ui/types/gov';
import { getMinApprovalThreshold, getTallyVotesBarPercent, getTimeLeft } from '@subwallet/extension-koni-ui/utils/gov';
import CN from 'classnames';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ReferendumVoteSummary from './ReferendumVoteSummary';
import SpendSummary from './SpendSummary';

type Props = ThemeProps & {
  onClick?: VoidFunction;
  item: ReferendumWithVoting;
  chain: string;
};

const Component = ({ chain, className, item, onClick }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { ayesPercent, naysPercent } = getTallyVotesBarPercent(item.onchainData.tally);
  const [timeLeft, setTimeLeft] = useState<string | undefined>(() =>
    getTimeLeft(item)
  );

  const thresholdPercent = getMinApprovalThreshold(item);
  const refStatus = item.version === 1 ? item.state : item.state.name;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(item));
    }, 1000);

    return () => clearInterval(interval);
  }, [item]);

  return (
    <div
      className={CN(className)}
      onClick={onClick}
    >
      <div className='__i-ref-id-and-requested-amount'>
        <div className='__i-ref-id'>#{item.referendumIndex}</div>
        {item.version === 2 && <div className='__i-requested-amount-container'>

          {!!item.allSpends && item.allSpends.length > 0 && (
            <SpendSummary
              chain={chain}
              className='__i-requested-amount'
              spends={item.allSpends}
            />
          )}
        </div>}
      </div>

      <div className='__i-ref-title'>
        {item.title}
      </div>

      <div className='__i-tags'>
        <ReferendumStatusTag status={refStatus} />
        {item.version === 2 && <ReferendumTrackTag trackName={item.trackInfo.name} />}
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
          <ReferendumVoteSummary
            chain={chain}
            userVoting={item.userVoting}
          />
          {!!timeLeft && (
            <div className='__i-time-left'>
              {
                ayesPercent > naysPercent
                  ? t('Approve in {{time}}', {
                    time: timeLeft
                  })
                  : t('Reject in {{time}}', {
                    time: timeLeft
                  })
              }
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
      display: 'flex',
      justifyContent: 'space-between'
    },

    '.__i-time-left': {
      color: token.colorTextLight1,
      fontSize: token.fontSizeXS,
      lineHeight: token.lineHeightXS
    }
  };
});

export default ReferendumItem;
