// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BaseStepType, CommonStepType, ProcessStep, ProcessTransactionData, StepStatus, SwapStepType, YieldStepType } from '@subwallet/extension-base/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isStepCompleted, isStepFailed, isStepProcessing, isStepTimeout } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import { SwIconProps } from '@subwallet/react-ui/es/icon';
import CN from 'classnames';
import { CheckCircle, ProhibitInset, Spinner } from 'phosphor-react';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  processData: ProcessTransactionData
};

const Component: FC<Props> = (props: Props) => {
  const { className, processData } = props;
  const { t } = useTranslation();

  const iconProp = useMemo<SwIconProps>(() => {
    const iconInfo: SwIconProps = (() => {
      if (isStepCompleted(processData.status)) {
        return {
          phosphorIcon: CheckCircle,
          weight: 'fill'
        };
      } else if (isStepFailed(processData.status) || isStepTimeout(processData.status)) {
        return {
          phosphorIcon: ProhibitInset,
          weight: 'fill'
        };
      }

      return {
        phosphorIcon: Spinner
      };
    })();

    return {
      ...iconInfo,
      size: 'md'
    };
  }, [processData.status]);

  const currentStep: ProcessStep | undefined = useMemo(() => {
    const first = processData.steps.find((s) => s.id === processData.currentStepId);

    if (first) {
      return first;
    }

    const second = processData.steps.slice().reverse().find((s) => [StepStatus.COMPLETE, StepStatus.FAILED, StepStatus.TIMEOUT, StepStatus.CANCELLED].includes(s.status));

    if (second) {
      return second;
    }

    return processData.steps[0];
  }, [processData.currentStepId, processData.steps]);

  const title = useMemo(() => {
    if (isStepCompleted(processData.status)) {
      return t('Success');
    }

    if (isStepFailed(processData.status)) {
      return t('Failed');
    }

    if (isStepTimeout(processData.status)) {
      return t('Timeout');
    }

    if (!currentStep) {
      return '';
    }

    if (([
      CommonStepType.XCM,
      YieldStepType.XCM
    ] as BaseStepType[]).includes(currentStep.type)) {
      return t('Transfer token cross-chain');
    }

    if (currentStep.type === SwapStepType.SWAP) {
      return t('Swap token');
    }

    if (([
      CommonStepType.TOKEN_APPROVAL,
      YieldStepType.TOKEN_APPROVAL
    ] as BaseStepType[]).includes(currentStep.type)) {
      return t('Approve token');
    }

    if (([
      YieldStepType.NOMINATE,
      YieldStepType.JOIN_NOMINATION_POOL,
      YieldStepType.MINT_VDOT,
      YieldStepType.MINT_VMANTA,
      YieldStepType.MINT_LDOT,
      YieldStepType.MINT_QDOT,
      YieldStepType.MINT_SDOT,
      YieldStepType.MINT_STDOT
    ] as BaseStepType[]).includes(currentStep.type)) {
      return t('Stake token');
    }

    if (currentStep.type === SwapStepType.PERMIT) {
      return t('Sign message');
    }

    // if (processData.type === ProcessType.SWAP) {
    //   //
    // }
    //
    // if (processData.type === ProcessType.EARNING) {
    //   //
    // }

    return '';
  }, [currentStep, processData.status, t]);

  return (
    <div
      className={CN(className, {
        '-processing': isStepProcessing(processData.status),
        '-complete': isStepCompleted(processData.status),
        '-failed': isStepFailed(processData.status),
        '-timeout': isStepTimeout(processData.status)
      })}
    >
      <Icon
        {...iconProp}
        className={CN('__icon')}
      />

      <div className='__title'>
        {title}
      </div>
    </div>
  );
};

export const CurrentProcessStep = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    alignItems: 'center',
    gap: token.sizeSM,

    '.__icon': {
      minWidth: 32,
      height: 32,
      borderRadius: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',

      '&:before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        inset: 0,
        borderRadius: '100%',
        backgroundColor: 'currentcolor',
        zIndex: 1,
        opacity: 0.1
      },

      svg: {
        position: 'relative',
        zIndex: 2
      }
    },

    '.__title': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight
    },

    '&.-processing': {
      color: '#D9A33E'
    },

    '&.-complete': {
      color: token.colorSuccess
    },

    '&.-failed, &.-timeout': {
      color: token.colorError
    }
  });
});
