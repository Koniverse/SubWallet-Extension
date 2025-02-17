// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BaseStepType, CommonStepType, ProcessStep, ProcessTransactionData, StepStatus, SwapStepType, YieldStepType } from '@subwallet/extension-base/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
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
      if (processData.status === StepStatus.COMPLETE) {
        return {
          phosphorIcon: CheckCircle,
          weight: 'fill'
        };
      } else if (processData.status === StepStatus.FAILED) {
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
    const first = processData.steps.find((s) => s.status === StepStatus.PROCESSING);

    if (first) {
      return first;
    }

    const second = processData.steps.slice().reverse().find((s) => [StepStatus.COMPLETE, StepStatus.FAILED].includes(s.status));

    if (second) {
      return second;
    }

    return processData.steps[0];
  }, [processData.steps]);

  const title = useMemo(() => {
    if (processData.status === StepStatus.COMPLETE) {
      return t('Success');
    }

    if (processData.status === StepStatus.FAILED) {
      return t('Failed');
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
        '-processing': ![StepStatus.COMPLETE, StepStatus.FAILED].includes(processData.status),
        '-complete': processData.status === StepStatus.COMPLETE,
        '-failed': processData.status === StepStatus.FAILED
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
      color: token.colorWarning

    },

    '&.-complete': {
      color: token.colorSuccess
    },

    '&.-failed': {
      color: token.colorError
    }
  });
});
