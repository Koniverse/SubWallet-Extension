// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { GovVoteRequest, RemoveVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { MetaInfo } from '@subwallet/extension-koni-ui/components/MetaInfo';
import { ThemeProps, TransactionHistoryDisplayItem } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  data: TransactionHistoryDisplayItem;
}

const isTypeGov = (txType: ExtrinsicType) => [
  ExtrinsicType.GOV_VOTE,
  ExtrinsicType.GOV_UNVOTE
].includes(txType);

const Component: React.FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { data } = props;

  if (!isTypeGov(data.type)) {
    return null;
  }

  const govVoteInfo = data.additionalInfo as (GovVoteRequest | RemoveVoteRequest);

  return (
    <>
      <MetaInfo.Default label={t('Referenda ID')}>
        {govVoteInfo.referendumIndex}
      </MetaInfo.Default>
      {data.type === ExtrinsicType.GOV_VOTE && (
        <MetaInfo.Default label={t('Vote direction')}>
          {govVoteInfo.type}
        </MetaInfo.Default>
      )}
    </>
  );
};

export const GovVoteLayout = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {};
});
