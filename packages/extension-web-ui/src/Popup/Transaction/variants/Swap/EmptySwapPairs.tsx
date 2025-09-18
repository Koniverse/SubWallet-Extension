// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { detectTranslate } from '@subwallet/extension-base/utils';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { PageIcon } from '@subwallet/react-ui';
import { MagnifyingGlass } from 'phosphor-react';
import React, { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  onClickReload: () => void
}

const Component: React.FC<Props> = ({ className, onClickReload }: Props) => {
  const { t } = useTranslation();

  const handleReload = useCallback(() => {
    onClickReload();
  }, [onClickReload]);

  return (
    <div className={className}>
      <PageIcon
        color='var(--icon-color)'
        iconProps={{
          type: 'phosphor',
          phosphorIcon: MagnifyingGlass,
          weight: 'fill'
        }}
      />
      <div className='message'>
        {t('Unable to load data')}
      </div>
      <div className={'data-empty-msg'}>
        <div className='description'>
          {t('Something went wrong while loading data for this screen.')}
        </div>
        <div className={'description'}>
          <Trans
            components={{
              highlight: (
                <span
                  className={'reload-text'}
                  onClick={handleReload}
                />
              )
            }}
            i18nKey={detectTranslate('<highlight>Reload now</highlight> to get the new data')}
          />
        </div>
      </div>
    </div>
  );
};

const EmptySwapPairs = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '--icon-color': token['gray-4'],
    paddingTop: token.padding,
    marginTop: token.margin * 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    '.data-empty-msg': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },

    '.message': {
      color: token.colorTextHeading,
      fontWeight: token.headingFontWeight,
      fontSize: token.fontSizeHeading5,
      lineHeight: token.lineHeightHeading5,
      paddingTop: token.padding
    },

    '.description': {
      color: token.colorTextDescription,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      paddingLeft: '32px',
      paddingRight: '32px',
      textAlign: 'center'
    },

    '.reload-text': {
      color: token.geekblue,
      textDecoration: 'underline',
      cursor: 'pointer',
      fontWeight: token.headingFontWeight
    }
  };
});

export default EmptySwapPairs;
