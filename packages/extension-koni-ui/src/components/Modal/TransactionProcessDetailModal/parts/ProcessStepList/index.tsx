// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProcessTransactionData, ProcessType, SwapBaseTxData } from '@subwallet/extension-base/types';
import { TransactionProcessStepItem } from '@subwallet/extension-koni-ui/components';
import { useGetSwapProcessSteps, useGetTransactionProcessSteps } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  processData: ProcessTransactionData
};

const Component: FC<Props> = (props: Props) => {
  const { className, processData } = props;
  const { t } = useTranslation();

  const getTransactionProcessSteps = useGetTransactionProcessSteps();
  const getSwapProcessSteps = useGetSwapProcessSteps();

  const stepItems = useMemo(() => {
    if (processData.type === ProcessType.SWAP) {
      const data = processData.combineInfo as SwapBaseTxData;

      return getSwapProcessSteps(data.process, data.quote, true, processData.steps, false);
    }

    return getTransactionProcessSteps(processData.steps, processData.combineInfo);
  }, [processData.type, processData.steps, processData.combineInfo, getTransactionProcessSteps, getSwapProcessSteps]);

  return (
    <div
      className={className}
    >
      <div className='__heading'>{t('ui.TRANSACTION.components.Modal.TxProcessDetail.StepList.transactionProcess')}</div>

      <div className='__step-list-container'>
        {
          stepItems.map((item) => (
            <TransactionProcessStepItem
              {...item}
              key={item.index}
            />
          ))
        }
      </div>
    </div>
  );
};

export const ProcessStepList = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    paddingTop: token.padding,
    borderTop: `2px solid ${token.colorBgInput}`,

    '.__heading': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.headingFontWeight,
      color: token.colorTextLight1,
      marginBottom: 14
    },

    '.__step-list-container': {
      paddingLeft: token.paddingSM,
      paddingRight: token.paddingSM
    }
  });
});
