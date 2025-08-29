// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import { CaretLeft } from 'phosphor-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ViewBaseType } from '../../types';

type Props = ThemeProps & ViewBaseType & {
  goOverview: VoidFunction;
};

const Component = ({ className, goOverview }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const onBack = useCallback(() => {
    goOverview();
  }, [goOverview]);

  return (
    <div className={className}>
      <div className='__top-part'>
        <Button
          className={'__back-button'}
          icon={
            <Icon
              customSize={'24px'}
              phosphorIcon={CaretLeft}
            />
          }
          onClick={onBack}
          size={'xs'}
          type={'ghost'}
        />
        <div className={'__top-part-title'}>{t('Locked detail')}</div>
      </div>

    </div>
  );
};

export const UnlockTokenView = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    paddingBottom: 20,

    '.__top-part': {
      display: 'flex',
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      marginBottom: token.marginXXS,
      alignItems: 'center'
    },

    '.__top-part-title': {
      textAlign: 'center',
      flex: 1,
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      marginRight: 40
    },

    '.__back-button': {
      color: token.colorTextLight1,

      '&:hover': {
        color: token.colorTextLight3
      },

      '&:active': {
        color: token.colorTextLight4
      }
    }
  };
});
