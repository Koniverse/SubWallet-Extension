// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { govStatusDisplayMap } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertHexColorToRGBA } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import { GovStatusKey } from '@subwallet/subsquare-api-sdk';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  status: GovStatusKey
};

const Component = ({ className, status }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const currentTagDisplayInfo = govStatusDisplayMap[status];

  return (
    <div className={className}>

      {
        !!currentTagDisplayInfo.icon && (
          <Icon
            className={'__icon'}
            customSize={'12px'}
            phosphorIcon={currentTagDisplayInfo.icon}
          />
        )
      }

      <div className='__label'>
        {t(currentTagDisplayInfo.label)}
      </div>
    </div>
  );
};

const ReferendumStatusTag = styled(Component)<Props>(({ status, theme: { token } }: Props) => {
  const currentTagDisplayInfo = govStatusDisplayMap[status];
  const color = typeof currentTagDisplayInfo.colorToken === 'string' ? token[currentTagDisplayInfo.colorToken] as string : token['gray-6'];
  const backgroundColor = convertHexColorToRGBA(color, 0.1);

  return {
    backgroundColor,
    color,
    display: 'flex',
    gap: token.sizeXXS,
    borderRadius: token.borderRadiusLG,
    height: 22,
    alignItems: 'center',
    paddingInline: token.sizeXS,

    '.__label': {
      fontSize: token.fontSizeXS,
      lineHeight: token.lineHeightXS,
      fontWeight: token.headingFontWeight
    }
  };
});

export default ReferendumStatusTag;
