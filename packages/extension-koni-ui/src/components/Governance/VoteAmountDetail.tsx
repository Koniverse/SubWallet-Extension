// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import VoteTypeLabel from '@subwallet/extension-koni-ui/components/Governance/VoteTypeLabel';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { VoteAmountDetailProps } from '@subwallet/extension-koni-ui/types/gov';
import { Number } from '@subwallet/react-ui';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  amountDetail: VoteAmountDetailProps;
  decimals?: number;
  symbol?: string;
};

const Component = ({ amountDetail: { abstainAmount, ayeAmount, nayAmount }, className, decimals = 0, symbol }: Props): React.ReactElement<Props> => {
  return (
    <MetaInfo
      className={className}
      hasBackgroundWrapper
    >
      {
        ayeAmount != null && (
          <div className={'__amount-detail-item'}>
            <VoteTypeLabel
              type={GovVoteType.AYE}
            />
            <Number
              className={'__vote-amount-value'}
              decimal={decimals}
              decimalOpacity={0.45}
              formatType={'balance'}
              intOpacity={0.85}
              size={14}
              suffix={symbol}
              unitOpacity={0.85}
              value={ayeAmount}
              weight={500}
            />
          </div>
        )
      }
      {
        nayAmount != null && (
          <div className={'__amount-detail-item'}>
            <VoteTypeLabel
              type={GovVoteType.NAY}
            />
            <Number
              className={'__vote-amount-value'}
              decimal={decimals}
              decimalOpacity={0.45}
              formatType={'balance'}
              intOpacity={0.85}
              size={14}
              suffix={symbol}
              unitOpacity={0.85}
              value={nayAmount}
              weight={500}
            />
          </div>
        )
      }
      {
        abstainAmount != null && (
          <div className={'__amount-detail-item'}>
            <VoteTypeLabel
              type={GovVoteType.ABSTAIN}
            />
            <Number
              className={'__vote-amount-value'}
              decimal={decimals}
              decimalOpacity={0.45}
              formatType={'balance'}
              intOpacity={0.85}
              size={14}
              suffix={symbol}
              unitOpacity={0.85}
              value={abstainAmount}
              weight={500}
            />
          </div>
        )
      }
    </MetaInfo>
  );
};

const VoteAmountDetail = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '&.meta-info-block': {
      padding: 0
    },

    '.__amount-detail-item': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingInline: token.paddingSM,
      paddingBlock: token.paddingSM + 2
    }
  };
});

export default VoteAmountDetail;
