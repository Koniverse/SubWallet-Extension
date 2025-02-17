// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProcessStep, StepStatus } from '@subwallet/extension-base/types';
import { ProcessStepItemType } from '@subwallet/extension-koni-ui/components';
import { useGetTransactionProcessStepText } from '@subwallet/extension-koni-ui/hooks';
import { useCallback } from 'react';

const useGetTransactionProcessSteps = () => {
  const getStepText = useGetTransactionProcessStepText();

  return useCallback((processStep: ProcessStep[], combineInfo: unknown, fillStepStatus = true): ProcessStepItemType[] => {
    return processStep.map((ps, index) => ({
      status: fillStepStatus ? ps.status : StepStatus.QUEUED,
      text: getStepText(ps, combineInfo),
      index,
      isLastItem: index === processStep.length - 1
    }));
  }, [getStepText]);
};

export default useGetTransactionProcessSteps;
