// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProcessStep } from '@subwallet/extension-base/types';
import { TransactionProcessStepSimpleItem } from '@subwallet/extension-web-ui/components';
import { useGetTransactionProcessStepText } from '@subwallet/extension-web-ui/hooks';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import React, { FC, useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  processStep: ProcessStep,
  index: number,
  isLastItem?: boolean;
  combineInfo: unknown;
};

const Component: FC<Props> = (props: Props) => {
  const { className, combineInfo, index, isLastItem, processStep } = props;
  const getStepText = useGetTransactionProcessStepText();

  const text = useMemo(() => {
    return getStepText(processStep, combineInfo);
  }, [combineInfo, getStepText, processStep]);

  return (
    <TransactionProcessStepSimpleItem
      className={className}
      content={text}
      index={index}
      isLastItem={isLastItem}
      status={processStep.status}
    />
  );
};

export const Item = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({

  });
});
