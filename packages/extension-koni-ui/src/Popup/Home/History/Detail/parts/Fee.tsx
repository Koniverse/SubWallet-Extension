// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType, TransactionAdditionalInfo } from '@subwallet/extension-base/background/KoniTypes';
import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { ThemeProps, TransactionHistoryDisplayItem } from '@subwallet/extension-koni-ui/types';
import { isTypeTransfer } from '@subwallet/extension-koni-ui/utils';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  data: TransactionHistoryDisplayItem;
}

const Component: React.FC<Props> = (props: Props) => {
  const { data } = props;
  const { crossChainFeeInfo, fee } = data;

  const { t } = useTranslation();

  const xcmInfo = useMemo((): TransactionAdditionalInfo[ExtrinsicType.TRANSFER_XCM] | undefined => {
    if (isTypeTransfer(data.type) && data.additionalInfo && data.type === ExtrinsicType.TRANSFER_XCM) {
      return data.additionalInfo as TransactionAdditionalInfo[ExtrinsicType.TRANSFER_XCM];
    }

    return undefined;
  }, [data.additionalInfo, data.type]);

  if (xcmInfo || crossChainFeeInfo) {
    return (
      <>
        {xcmInfo && <MetaInfo.Number
          decimals={fee?.decimals || undefined}
          label={t('ui.HISTORY.screen.HistoryDetail.Fee.networkFee')}
          suffix={fee?.symbol || undefined}
          value={fee?.value || '0'}
        />}

        {crossChainFeeInfo && <MetaInfo.Number
          decimals={crossChainFeeInfo?.decimals || undefined}
          label={('Destination fee')}
          suffix={crossChainFeeInfo?.symbol || undefined}
          value={crossChainFeeInfo.value}
        />}
      </>
    );
  }

  return (
    <MetaInfo.Number
      decimals={fee?.decimals || undefined}
      label={t('ui.HISTORY.screen.HistoryDetail.Fee.networkFee')}
      suffix={fee?.symbol || undefined}
      value={fee?.value || '0'}
    />
  );
};

const HistoryDetailFee = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {};
});

export default HistoryDetailFee;
