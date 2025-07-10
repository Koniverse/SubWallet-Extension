// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useTranslation from '@subwallet/extension-web-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import { ArrowCounterClockwise } from 'phosphor-react';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  onReload?: VoidFunction;
  isLoading?: boolean;
};

const Component: React.FC<Props> = (props: Props) => {
  const { className, isLoading, onReload } = props;
  const { t } = useTranslation();

  return (
    <div className={className}>
      <div className={'__block-container'}>
        <div className='__block-title'>
          {t('Failed to load price chart')}
        </div>

        <div className='__block-description'>
          {t('There was an issue fetching the data. Please click the reload button to try again.')}
        </div>

        <Button
          className={'__reload-button'}
          disabled={isLoading}
          icon={
            (
              <Icon
                phosphorIcon={ArrowCounterClockwise}
              />
            )
          }
          loading={isLoading}
          onClick={onReload}
        >
          {t('Reload')}
        </Button>
      </div>
    </div>
  );
};

export const FailToLoadDataContent = styled(Component)<ThemeProps>(({ theme: { token } }: ThemeProps) => ({
  textAlign: 'center',
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',

  '.__block-container': {
    padding: '40px 32px'
  },

  '.__block-title': {
    fontSize: token.fontSizeHeading5,
    lineHeight: token.lineHeightHeading5,
    color: token.colorTextLight2,
    marginBottom: token.marginSM
  },

  '.__block-description': {
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    color: token.colorTextLight3,
    marginBottom: 28
  },

  '.__reload-button': {
    minWidth: 182
  }
}));
