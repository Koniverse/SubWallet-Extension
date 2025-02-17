// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProcessTransactionData } from '@subwallet/extension-base/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Item } from './Item';

type Props = ThemeProps & {
  processData: ProcessTransactionData
};

const Component: FC<Props> = (props: Props) => {
  const { className, processData } = props;
  const { t } = useTranslation();

  return (
    <div
      className={className}
    >
      <div className='__heading'>{t('Transaction process')}</div>

      <div className='__step-list-container'>
        {
          processData.steps.map((step, index) => (
            <Item
              combineInfo={processData.combineInfo}
              index={index}
              isLastItem={index === processData.steps.length - 1}
              key={step.id}
              processStep={step}
            />
          ))
        }
      </div>
    </div>
  );
};

export const ProcessStepList = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.__heading': {
      fontSize: token.fontSizeHeading5,
      lineHeight: token.lineHeightHeading5,
      color: token.colorTextLight1,
      marginBottom: 24
    },
    '.__step-list-container': {
      paddingLeft: token.padding,
      paddingRight: token.padding
    }
  });
});
