// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicDataTypeMap, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { DecodeCallDataResponse } from '@subwallet/extension-base/types';
import { PendingMultisigTxRequest } from '@subwallet/extension-base/types/multisig';
import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { CONFIRMATION_DETAIL_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useOpenDetailModal } from '@subwallet/extension-koni-ui/hooks';
import { BaseDetailModal } from '@subwallet/extension-koni-ui/Popup/Confirmations/parts';
import { ThemeProps, TransactionHistoryDisplayItem } from '@subwallet/extension-koni-ui/types';
import { isTypeMultiSig, toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, useExcludeModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { Info } from 'phosphor-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  data: TransactionHistoryDisplayItem;
}

const Component: React.FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { className, data } = props;

  useExcludeModal(CONFIRMATION_DETAIL_MODAL);
  const openDetailModal = useOpenDetailModal();

  const { callData, decodedCallData } = useMemo<{ callData: string, decodedCallData: DecodeCallDataResponse | undefined}>(() => {
    switch (data.type) {
      case ExtrinsicType.MULTISIG_INIT_TX: {
        return { ...data.additionalInfo as ExtrinsicDataTypeMap[ExtrinsicType.MULTISIG_INIT_TX] };
      }

      case ExtrinsicType.MULTISIG_APPROVE_TX:
      case ExtrinsicType.MULTISIG_EXECUTE_TX:

      // eslint-disable-next-line no-fallthrough
      case ExtrinsicType.MULTISIG_CANCEL_TX: {
        const additionalInfo = data.additionalInfo as PendingMultisigTxRequest;

        return {
          callData: additionalInfo.call,
          decodedCallData: additionalInfo.decodedCallData
        };
      }

      default:
        return { callData: '', decodedCallData: undefined };
    }
  }, [data.additionalInfo, data.type]);

  if (!isTypeMultiSig(data.type)) {
    return <></>;
  }

  if (!decodedCallData || !callData) {
    return <></>;
  }

  return (
    <>
      <MetaInfo.Default
        className={CN(className, 'call-data-info-button-wrapper')}
        label={t('ui.HISTORY.screen.HistoryDetail.CallData.callData')}
      >
        {toShort(callData || '', 6, 6)}
        <Button
          className={'call-data-info-button'}
          icon={<Icon
            className={'call-data-info-icon'}
            customSize={'18px'}
            phosphorIcon={Info}
          />}
          onClick={openDetailModal}
          size={'sm'}
          type={'ghost'}
        />
      </MetaInfo.Default>

      {<BaseDetailModal
        className={CN(className, 'call-data-detail-modal')}
        showFooter={false}
        title={t('ui.HISTORY.screen.HistoryDetail.CallData.transactionDetails')}
      >
        <pre
          className='json'
          style={{ marginBottom: 0 }}
        >
          {JSON.stringify(decodedCallData || '', null, 2)}
        </pre>
      </BaseDetailModal>}
    </>
  );
};

export const CallDataLayout = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

    '.call-data-info-button': {
      height: '18px !important',
      width: '18px !important',
      minWidth: 'unset !important',
      color: token.colorTextLight4,
      transform: 'all 0.3s ease-in-out',
      '.call-data-info-icon': {
        height: '18px !important'
      },

      '&:hover': {
        color: token.colorTextLight2
      }
    },

    '.__value': {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    },

    '&.call-data-detail-modal': {
      '.ant-sw-modal-body': {
        maxHeight: 264,
        borderRadius: token.borderRadiusLG,
        padding: token.paddingSM,
        backgroundColor: token.colorBgSecondary,
        overflowY: 'auto',
        scrollBehavior: 'smooth',
        color: '#999999',
        margin: `${token.margin}px 0`,
        fontSize: token.fontSizeLG - 1,
        fontFamily: token.monoSpaceFontFamily
      }
    }
  };
});
