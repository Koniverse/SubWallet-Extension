// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { useOpenDetailModal } from '@subwallet/extension-koni-ui/hooks';
import { BaseDetailModal } from '@subwallet/extension-koni-ui/Popup/Confirmations/parts';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { Info } from 'phosphor-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  callData: string;
}

function Component ({ callData, className }: Props) {
  const { t } = useTranslation();
  const openDetailModal = useOpenDetailModal();

  return (
    <>
      <MetaInfo.Default
        className={className}
        label={t('ui.Confirmations.Detail.CallDataDetail.callData')}
      >
        {callData}
        <Button
          className={'call-data-info-button'}
          icon={ <Icon
            customSize={'18px'}
            phosphorIcon={Info}
          />}
          onClick={openDetailModal}
          type={'ghost'}
        />
      </MetaInfo.Default>

      <BaseDetailModal
        className={CN(className, 'transaction-detail-modal')}
        showFooter={false}
        title={t('ui.Confirmations.Detail.CallDataDetail.transactionDetails')}
      >
        {'0x0'}
      </BaseDetailModal>
    </>

  );
}

const CallDataDetail = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.call-data-info-button': {
      height: 'fit-content !important',
      width: 'fit-content !important',
      minWidth: 'unset !important',
      color: token.colorTextLight4,
      transform: 'all 0.3s ease-in-out',

      '&:hover': {
        color: token.colorTextLight2
      }
    },

    '.__value': {
      display: 'flex',
      alignItems: 'center'
    },

    '&.transaction-detail-modal': {
      '.ant-sw-modal-body': {
        height: 264,
        borderRadius: token.borderRadiusLG,
        padding: token.paddingSM,
        backgroundColor: token.colorBgSecondary,
        overflowY: 'auto',
        scrollBehavior: 'smooth',
        color: '#999999',
        margin: `${token.margin}px 0`,
        fontFamily: 'Space Grotesk',
        fontSize: token.fontSizeLG - 1
      }
    }
  };
});

export default CallDataDetail;
