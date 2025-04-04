// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CommonOptimalSwapPath, ProcessStep, StepStatus, SwapQuote } from '@subwallet/extension-base/types';
import { useGetSwapProcessStepContent } from '@subwallet/extension-koni-ui/hooks';
import { TransactionProcessStepItemType } from '@subwallet/extension-koni-ui/types';
import { useCallback } from 'react';

const useGetSwapProcessSteps = () => {
  const getStepContent = useGetSwapProcessStepContent();

  const handleItemWithStatus = useCallback((processItems: ProcessStep[], quote: SwapQuote): TransactionProcessStepItemType[] => {
    return [];
  }, []);
  const handleItemWithoutStatus = useCallback((process: CommonOptimalSwapPath, quote: SwapQuote): TransactionProcessStepItemType[] => {
    const result: TransactionProcessStepItemType[] = [];

    process.steps.forEach((st, index) => {
      if (index === 0) {
        return;
      }

      result.push({
        status: StepStatus.QUEUED,
        content: getStepContent(st, process.totalFee[index], quote),
        index: index - 1,
        logoKey: undefined,
        isLastItem: index === (process.steps.length - 1)
      });
    });

    return result;
  }, [getStepContent]);

  return useCallback((process: CommonOptimalSwapPath, quote: SwapQuote, fillStepStatus = true, processItems: ProcessStep[] | null = null): TransactionProcessStepItemType[] => {
    if (processItems && fillStepStatus) {
      return handleItemWithStatus(processItems, quote);
    }

    return handleItemWithoutStatus(process, quote);
  }, [handleItemWithStatus, handleItemWithoutStatus]);
};

export default useGetSwapProcessSteps;
