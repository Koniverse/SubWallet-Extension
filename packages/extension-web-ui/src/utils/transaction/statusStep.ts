// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { StepStatus } from '@subwallet/extension-base/types';

export const isStepPending = (stepStatus?: StepStatus) => {
  return stepStatus === StepStatus.QUEUED;
};

export const isStepProcessing = (stepStatus?: StepStatus) => {
  return !!stepStatus && [StepStatus.PREPARE, StepStatus.SUBMITTING, StepStatus.PROCESSING].includes(stepStatus);
};

export const isStepCompleted = (stepStatus?: StepStatus) => {
  return stepStatus === StepStatus.COMPLETE;
};

export const isStepFailed = (stepStatus?: StepStatus) => {
  return !!stepStatus && [StepStatus.FAILED, StepStatus.CANCELLED].includes(stepStatus);
};

export const isStepTimeout = (stepStatus?: StepStatus) => {
  return stepStatus === StepStatus.TIMEOUT;
};

export const isStepFinal = (stepStatus?: StepStatus) => {
  return isStepCompleted(stepStatus) || isStepTimeout(stepStatus) || isStepFailed(stepStatus);
};
