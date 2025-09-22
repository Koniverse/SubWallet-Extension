// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  ayePercent: number;
  nayPercent: number;
  thresholdPercent: number;
};

const Component = ({ ayePercent,
  className,
  nayPercent,
  thresholdPercent }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <div className='__legend-container'>
        <div className='__legend-part __legend-aye-part'>
          <span className={'__label'}>
            {t('Aye')}:&nbsp;
          </span>
          <span className={'__percent'}>{`${ayePercent}%`}</span>
        </div>
        <div className='__legend-part __legend-threshold-part'>
          <span className={'__label'}>
            {t('Threshold')}:&nbsp;
          </span>
          <span className={'__percent'}>{`${thresholdPercent}%`}</span>
        </div>
        <div className='__legend-part __legend-nay-part'>
          <span className={'__label'}>
            {t('Nay')}:&nbsp;
          </span>
          <span className={'__percent'}>{`${nayPercent}%`}</span>
        </div>
      </div>

      <div className={'__bar-container'}>
        <div
          className={'__bar-aye-part'}
          style={{ width: `${ayePercent}%` }}
        />
        <div
          className={'__bar-nay-part'}
          style={{ width: `${nayPercent}%` }}
        />
        <div
          className={'__threshold-mark'}
          style={{ left: `${thresholdPercent}%` }}
        />
      </div>
    </div>
  );
};

const ReferendumVoteProgressBar = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__legend-container': {
      display: 'flex'
    },

    '.__legend-part': {
      flex: 1,
      fontSize: token.fontSizeXS,
      lineHeight: token.lineHeightXS,
      fontWeight: 700,
      color: token.colorTextLight4
    },

    '.__legend-aye-part': {
      textAlign: 'left',

      '.__label': {
        color: token['green-7']
      }
    },

    '.__legend-threshold-part': {
      textAlign: 'center'
    },

    '.__legend-nay-part': {
      textAlign: 'right',

      '.__label': {
        color: token['red-7']
      }
    },

    '.__bar-container': {
      position: 'relative',
      display: 'flex',
      gap: 2,
      paddingTop: token.paddingXXS,
      paddingBottom: token.paddingXXS
    },

    '.__bar-aye-part': {
      height: token.sizeXXS,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 1,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 1,
      backgroundColor: token['green-7']
    },

    '.__bar-nay-part': {
      height: token.sizeXXS,
      borderTopLeftRadius: 1,
      borderTopRightRadius: 8,
      borderBottomLeftRadius: 1,
      borderBottomRightRadius: 8,
      backgroundColor: token['red-7']
    },

    '.__threshold-mark': {
      position: 'absolute',
      marginLeft: -0.5,
      height: 8,
      width: 1,
      backgroundColor: token.colorWhite,
      top: 2,
      borderRadius: 8
    }
  };
});

export default ReferendumVoteProgressBar;
