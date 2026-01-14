// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { PendingMultisigTxRequest } from '@subwallet/extension-base/types/multisig';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { useGetNativeTokenBasicInfo, useOpenDetailModal } from '@subwallet/extension-koni-ui/hooks';
import { BaseDetailModal } from '@subwallet/extension-koni-ui/Popup/Confirmations/parts/Detail';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
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

  return (
    <>
      <MetaInfo
        className={CN('wrapped-transaction-container', className)}
        hasBackgroundWrapper
      >
        <MetaInfo.Account
          address={transaction.address}
          chainSlug={transaction.chain}
          className={CN(className, 'signatory-address-info')}
          label={t('ui.Confirmations.MultisigInfoArea.signatory')}
        />

        <MetaInfo.Number
          decimals={decimals}
          label={t('ui.Confirmations.MultisigInfoArea.networkFee')}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />

        <MetaInfo.Default
          className={className}
          label={t('ui.Confirmations.Detail.CallDataDetail.callData')}
        >
          {toShort(transactionData.callHash, 5, 5)}
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

      </MetaInfo>

      <Typography.Text className={CN(className, 'description-text')}>
        {descriptionContent}
      </Typography.Text>

      {<BaseDetailModal
        className={CN(className, 'call-data-detail-modal')}
        showFooter={false}
        title={t('ui.Confirmations.Detail.CallDataDetail.transactionDetails')}
      >
        <pre className='json'>
          {JSON.stringify(transactionData.decodedCallData || '', null, 2)}
        </pre>
      </BaseDetailModal>}
    </>
  );
}

const MultisigInfoArea = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => {
  return {

  };
});

export default MultisigInfoArea;
