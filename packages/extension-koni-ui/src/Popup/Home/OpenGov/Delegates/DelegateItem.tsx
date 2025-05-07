// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _DelegateInfo } from '@subwallet/extension-base/services/open-gov/type';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertHexColorToRGBA } from '@subwallet/extension-koni-ui/utils';
import CN from 'classnames';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  data: _DelegateInfo,
  onClick: (data: _DelegateInfo) => void,
};

function Component ({ className, data, onClick }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const onClickContainer = useCallback(() => {
    onClick(data);
  }, [data, onClick]);

  return (
    <div
      className={CN(className)}
      onClick={onClickContainer}
    >
      <div className='__item-inner'>
        <div className='__right-block'>
          <div className='__item-name'>{data.address || ''}</div>
          <div className='__item-timeline'>{data.votes}</div>
          <div className='__item-rewards'>
            <div className='__item-label'>{t('Name')}:</div>
            <div className='__item-value'>{data.manifesto?.name || ''}</div>
          </div>
          <div className='__separator' />
          <div className='__item-tags'>#{data.manifesto?.source || ''}</div>
        </div>
      </div>
    </div>
  );
}

const DelegateItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    backgroundColor: token.colorBgSecondary,
    borderRadius: token.borderRadiusLG,
    cursor: 'pointer',
    position: 'relative',
    padding: token.sizeSM,
    paddingTop: token.paddingXS,
    paddingBottom: token.paddingXS,
    overflow: 'hidden',
    '.ant-tag-has-color': {
      backgroundColor: convertHexColorToRGBA(token['gray-6'], 0.1)
    },
    '.__item-tags': {
      display: 'flex'
    },
    '.__item-tag': {
      marginRight: 4,
      display: 'flex',
      flexDirection: 'row',
      gap: 4,
      fontWeight: 700
    },
    '.__item-inner': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeSM
    },
    '.__right-block': {
      overflow: 'hidden',
      flex: 1
    },
    '.__item-name': {
      fontSize: token.fontSize,
      color: token.colorTextLight1,
      lineHeight: token.lineHeight,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      'white-space': 'nowrap'
    },
    '.__item-timeline, .__item-rewards': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextTertiary,
      fontWeight: token.bodyFontWeight
    },
    '.__item-rewards': {
      display: 'flex'
    },
    '.__separator': {
      height: 2,
      backgroundColor: 'rgba(33, 33, 33, 0.80)',
      marginTop: token.marginXS,
      marginBottom: token.marginXS
    },
    '.__item-rewards .__item-value': {
      color: token.colorSuccess,
      fontWeight: token.headingFontWeight,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },

    '.__item-background': {
      height: '100%',
      width: 32,
      backgroundPosition: 'left',
      backgroundSize: 'cover',
      position: 'absolute',
      top: 0,
      left: 4,
      filter: 'blur(8px)'
    }
  };
});

export default DelegateItem;
