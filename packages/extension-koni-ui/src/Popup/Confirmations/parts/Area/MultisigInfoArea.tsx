// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { PendingMultisigTxRequest } from '@subwallet/extension-base/types/multisig';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { useGetNativeTokenBasicInfo, useOpenDetailModal } from '@subwallet/extension-koni-ui/hooks';
import { BaseDetailModal } from '@subwallet/extension-koni-ui/Popup/Confirmations/parts/Detail';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { decodeTransferAmount, toShort } from '@subwallet/extension-koni-ui/utils';
import { decodeTransferRecipient } from '@subwallet/extension-koni-ui/utils/transaction/decode';
import { Button, Icon, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import { Info } from 'phosphor-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  transaction: SWTransactionResult;
}

function Component ({ className, transaction }: Props) {
  const { t } = useTranslation();
  const transactionData = transaction.data as PendingMultisigTxRequest;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  const openDetailModal = useOpenDetailModal();

  const descriptionContent = useMemo(() => {
    if (transaction.extrinsicType === ExtrinsicType.MULTISIG_EXECUTE_TX) {
      return t('ui.Confirmations.MultisigInfoArea.multisigExecutionDescription');
    }

    if (transaction.extrinsicType === ExtrinsicType.MULTISIG_CANCEL_TX) {
      return t('ui.Confirmations.MultisigInfoArea.multisigCancelDescription');
    }

    return null;
  }, [t, transaction.extrinsicType]);

  const recipientAddress = useMemo(
    () => decodeTransferRecipient(transactionData?.decodedCallData),
    [transactionData?.decodedCallData]
  );

  const transferAmount = useMemo(
    () => decodeTransferAmount(transactionData?.decodedCallData),
    [transactionData?.decodedCallData]
  );

  return (
    <div className={CN(className, 'multisig-area-container')}>
      {(recipientAddress && transferAmount) && <MetaInfo
        className={'transaction-recipient-info'}
        hasBackgroundWrapper
      >
        <MetaInfo.Account
          address={recipientAddress}
          chainSlug={transaction.chain}
          label={t('ui.Confirmations.MultisigInfoArea.recipient')}
          onlyShowName
        />
        <MetaInfo.Number
          decimals={decimals}
          label={t('ui.Confirmations.MultisigInfoArea.amount')}
          suffix={symbol}
          value={transferAmount}
        />

      </MetaInfo>}
      <MetaInfo
        className={CN('multisig-info-area')}
        hasBackgroundWrapper
      >
        <MetaInfo.Account
          address={transaction.address}
          chainSlug={transaction.chain}
          className={CN('signatory-address-info')}
          label={t('ui.Confirmations.MultisigInfoArea.signatory')}
        />

        {!transaction.wrappingStatus && (
          <>
            <MetaInfo.Number
              decimals={decimals}
              label={t('ui.Confirmations.MultisigInfoArea.networkFee')}
              suffix={symbol}
              value={transaction.estimateFee?.value || 0}
            />

            <MetaInfo.Default
              label={t('ui.Confirmations.MultisigInfoArea.callData')}
            >
              {toShort(transactionData.callHash, 5, 5)}
              <Button
                className={'call-data-info-button'}
                icon={<Icon
                  customSize={'18px'}
                  phosphorIcon={Info}
                />}
                onClick={openDetailModal}
                type={'ghost'}
              />
            </MetaInfo.Default>
          </>
        )}
      </MetaInfo>

      {!transaction.wrappingStatus && <Typography.Text className={CN('description-text')}>
        {descriptionContent}
      </Typography.Text>}

      {<BaseDetailModal
        className={CN(className, 'call-data-detail-modal')}
        showFooter={false}
        title={t('ui.Confirmations.Detail.CallDataDetail.transactionDetails')}
      >
        <pre className='json'>
          {JSON.stringify(transactionData.decodedCallData || '', null, 2)}
        </pre>
      </BaseDetailModal>}
    </div>
  );
}

const MultisigInfoArea = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => {
  return {
    marginTop: token.marginSM,

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

    '.description-text': {
      fontSize: token.fontSize,
      marginTop: token.marginSM,
      color: token.colorTextLight4,
      textAlign: 'left',
      display: 'block'
    },

    '.error-message': {
      marginTop: token.marginSM,

      '.alert-description': {
        color: token.colorWarning
      }
    },

    '&.call-data-detail-modal': {
      '.ant-sw-modal-body': {
        height: 264,
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

export default MultisigInfoArea;
