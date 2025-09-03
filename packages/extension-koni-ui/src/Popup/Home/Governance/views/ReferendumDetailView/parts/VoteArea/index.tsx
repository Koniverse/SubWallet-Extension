// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getMinApprovalThreshold, getTallyVotesBarPercent, getTimeLeft } from '@subwallet/extension-koni-ui/utils/gov';
import { Button } from '@subwallet/react-ui';
import { ReferendumDetail } from '@subwallet/subsquare-api-sdk';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  referendumDetail: ReferendumDetail,
  onClickVote: VoidFunction;
};

const Component = ({ className, onClickVote, referendumDetail }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { ayesPercent, naysPercent } = getTallyVotesBarPercent(referendumDetail.onchainData.tally);

  const thresholdPercent = getMinApprovalThreshold(referendumDetail);

  const timeLeft = getTimeLeft(referendumDetail);

  return (
    <div className={className}>
      <h3>Voting Summary</h3>
      {timeLeft && (
        <div>timeLeft: {timeLeft}%</div>
      )}
      <div>Aye: {ayesPercent}%</div>
      <div>Nay: {naysPercent}%</div>
      <div>Threshold: {thresholdPercent}%</div>

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
