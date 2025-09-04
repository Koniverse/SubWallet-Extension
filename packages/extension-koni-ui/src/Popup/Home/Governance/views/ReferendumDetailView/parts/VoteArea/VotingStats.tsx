// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CollapsiblePanel, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { useGetNativeTokenBasicInfo, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ReferendumVoteResult } from '@subwallet/extension-koni-ui/utils/gov/votingStats';
import { Icon, Number } from '@subwallet/react-ui';
import CN from 'classnames';
import { Info } from 'phosphor-react';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  votingData: ReferendumVoteResult;
  chain: string;
}

const Component = ({ chain, className, votingData }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);

  return (
    <div className={className}>
      <CollapsiblePanel
        className={CN(className)}
        title={t('Show voting stats')}
      >
        <MetaInfo>
          <MetaInfo.Default
            label={t('Aye') + ` (${votingData.ayes.totalVotedAccounts})`}
          >
            <div className='voting-stats__value'>
              <Number
                decimal={decimals}
                prefix={'~'}
                suffix={symbol}
                value={votingData.ayes.totalVotedAmount}
              />
              <Icon
                phosphorIcon={Info}
                size={'sm'}
              />
            </div>
          </MetaInfo.Default>
          <MetaInfo.Default
            label={t('Nay') + ` (${votingData.nays.totalVotedAccounts})`}
          >
            <div className='voting-stats__value'>
              <Number
                decimal={decimals}
                prefix={'~'}
                suffix={symbol}
                value={votingData.nays.totalVotedAmount}
              />
              <Icon
                phosphorIcon={Info}
                size={'sm'}
              />
            </div>
          </MetaInfo.Default>
          <MetaInfo.Default
            label={t('Abstain') + ` (${votingData.abstains.totalVotedAccounts})`}
          >
            <div className='voting-stats__value'>
              <Number
                decimal={decimals}
                prefix={'~'}
                suffix={symbol}
                value={votingData.abstains.totalVotedAmount}
              />
              <Icon
                phosphorIcon={Info}
                size={'sm'}
              />
            </div>
          </MetaInfo.Default>
        </MetaInfo>
      </CollapsiblePanel>
    </div>
  );
};

export const VotingStats = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.voting-stats__value': {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: 14,
      color: token.colorText
    },
    '.voting-stats__value svg': {
      opacity: 0.7,
      cursor: 'pointer',
      transition: 'opacity 0.2s'
    },
    '.voting-stats__value svg:hover': {
      opacity: 1
    }
  };
});
