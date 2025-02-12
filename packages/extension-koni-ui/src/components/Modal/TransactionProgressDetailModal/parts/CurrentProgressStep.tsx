// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CommonStepType, ProcessStep, ProcessTransactionData, StepStatus, SwapStepType } from '@subwallet/extension-base/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon } from '@subwallet/react-ui';
import { SwIconProps } from '@subwallet/react-ui/es/icon';
import CN from 'classnames';
import { CheckCircle, ProhibitInset, Spinner } from 'phosphor-react';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  progressData: ProcessTransactionData
};

const Component: FC<Props> = (props: Props) => {
  const { className, progressData } = props;
  const { t } = useTranslation();

  const iconProp = useMemo<SwIconProps>(() => {
    const iconInfo: SwIconProps = (() => {
      if (progressData.status === StepStatus.COMPLETE) {
        return {
          phosphorIcon: CheckCircle,
          weight: 'fill'
        };
      } else if (progressData.status === StepStatus.FAILED) {
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
  }, [progressData.status]);

  const currentStep: ProcessStep | undefined = useMemo(() => {
    const first = progressData.steps.find((s) => s.status === StepStatus.PROCESSING);

    if (first) {
      return first;
    }

    const second = progressData.steps.slice().reverse().find((s) => [StepStatus.COMPLETE, StepStatus.FAILED].includes(s.status));

    if (second) {
      return second;
    }

    return progressData.steps[0];
  }, [progressData.steps]);

  const title = useMemo(() => {
    if (progressData.status === StepStatus.COMPLETE) {
      return t('Success');
    }

    if (progressData.status === StepStatus.FAILED) {
      return t('Failed');
    }

    if (!currentStep) {
      return '';
    }

    if (currentStep.type === CommonStepType.XCM) {
      return t('Transfer token cross-chain');
    }

    if (currentStep.type === SwapStepType.SWAP) {
      return t('Swap token');
    }

    // if (progressData.type === ProcessType.SWAP) {
    //   //
    // }
    //
    // if (progressData.type === ProcessType.EARNING) {
    //   //
    // }

    return '';
  }, [currentStep, progressData.status, t]);

  return (
    <div
      className={CN(className, {
        '-processing': ![StepStatus.COMPLETE, StepStatus.FAILED].includes(progressData.status),
        '-complete': progressData.status === StepStatus.COMPLETE,
        '-failed': progressData.status === StepStatus.FAILED
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

export const CurrentProgressStep = styled(Component)<Props>(({ theme: { token } }: Props) => {
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
