// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { useNotification } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon } from '@subwallet/react-ui';
import { ReferendumDetail } from '@subwallet/subsquare-api-sdk/types';
import { Copy } from 'phosphor-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  referendumDetail: ReferendumDetail;
};

const BLOCK_TIME_SEC = 6;

const blocksToDaysLabel = (blocks: number, blockTimeSec = BLOCK_TIME_SEC) => {
  const days = blocks / (86400 / blockTimeSec);

  return Number.isInteger(days) ? `${days} days` : `${days.toFixed(2)} days`;
};

const Component = ({ className, referendumDetail }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const notify = useNotification();

  const _onClickCopyButton = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();

    navigator.clipboard.writeText(referendumDetail.onchainData.proposalHash)
      .then(() => {
        notify({
          message: t('Copied to clipboard')
        });
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        notify({
          message: t('Copy failed')
        });
      });
  }, [notify, t, referendumDetail.onchainData.proposalHash]);

  return (
    <MetaInfo className={className}>
      <MetaInfo
        className='referendum-detail'
        hasBackgroundWrapper={true}
      >
        <MetaInfo.Default
          label={t('Proposer')}
        >
          {toShort(referendumDetail.onchainData.info.submissionDeposit.who)}
        </MetaInfo.Default>
        <MetaInfo.Default
          label={t('Depositor')}
        >
          {toShort(referendumDetail.onchainData.info.decisionDeposit.who)}
        </MetaInfo.Default>
        <MetaInfo.Default
          label={t('Track')}
        >
          {referendumDetail.trackInfo.name}
        </MetaInfo.Default>
        <MetaInfo.Default
          label={t('Decision Period')}
        >
          {blocksToDaysLabel(referendumDetail.trackInfo.decisionPeriod)}
        </MetaInfo.Default>
        <MetaInfo.Default
          label={t('Confirmation Period')}
        >
          {blocksToDaysLabel(referendumDetail.trackInfo.confirmPeriod)}
        </MetaInfo.Default>
        <MetaInfo.Default
          label={t('Enact')}
        >
          After {referendumDetail.onchainData.info.enactment.after}
        </MetaInfo.Default>
      </MetaInfo>

      <MetaInfo
        className='referendum-detail'
        hasBackgroundWrapper={true}
      >
        <MetaInfo.Default
          label={t('Proposer Hash')}
        >
          {toShort(referendumDetail.onchainData.proposalHash)}
          <Button
            icon={
              <Icon
                phosphorIcon={Copy}
                size='sm'
              />
            }
            onClick={_onClickCopyButton}
            size='xs'
            tooltip={t('Copy proposal hash')}
            type='ghost'
          />
        </MetaInfo.Default>
        <MetaInfo.Default
          label={t('Call')}
        >
          {referendumDetail.onchainData.proposal.call.method}
        </MetaInfo.Default>
      </MetaInfo>
    </MetaInfo>
  );
};

export const DetailsTab = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});
