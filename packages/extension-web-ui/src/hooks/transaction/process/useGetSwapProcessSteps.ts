// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CommonOptimalSwapPath, ProcessStep, StepStatus, SwapQuote } from '@subwallet/extension-base/types';
import { useGetSwapProcessStepContent } from '@subwallet/extension-web-ui/hooks';
import { TransactionProcessStepItemType } from '@subwallet/extension-web-ui/types';
import { useCallback } from 'react';

const useGetSwapProcessSteps = () => {
  const getStepContent = useGetSwapProcessStepContent();

  const handleItemWithStatus = useCallback((processItems: ProcessStep[], quote: SwapQuote, showFee: boolean): TransactionProcessStepItemType[] => {
    const result: TransactionProcessStepItemType[] = [];

    processItems.forEach((pi, index) => {
      result.push({
        status: pi.status,
        content: getStepContent(pi, pi.fee, quote, showFee),
        index: index,
        logoKey: undefined,
        isLastItem: index === (processItems.length - 1)
      });
    });

    return result;
  }, [getStepContent]);

  const handleItemWithoutStatus = useCallback((process: CommonOptimalSwapPath, quote: SwapQuote, showFee: boolean): TransactionProcessStepItemType[] => {
    const result: TransactionProcessStepItemType[] = [];

    process.steps.forEach((st, index) => {
      if (index === 0) {
        return;
      }

      result.push({
        status: StepStatus.QUEUED,
        content: getStepContent(st, process.totalFee[index], quote, showFee),
        index: index - 1,
        logoKey: undefined,
        isLastItem: index === (process.steps.length - 1)
      });
    });

    return result;
  }, [getStepContent]);

  return useCallback((process: CommonOptimalSwapPath, quote: SwapQuote, fillStepStatus = true, processItems: ProcessStep[] | null = null, showFee = true): TransactionProcessStepItemType[] => {
    if (processItems && fillStepStatus) {
      return handleItemWithStatus(processItems, quote, showFee);
    }

    return handleItemWithoutStatus(process, quote, showFee);
  }, [handleItemWithStatus, handleItemWithoutStatus]);
};

export default useGetSwapProcessSteps;
