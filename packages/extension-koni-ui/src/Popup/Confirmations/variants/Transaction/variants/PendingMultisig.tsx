// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { ApprovePendingTxRequest } from '@subwallet/extension-base/types/multisig';
import { CommonTransactionInfo } from '@subwallet/extension-koni-ui/components';
import { MultisigInfoArea } from '@subwallet/extension-koni-ui/Popup/Confirmations/parts';
import { AlertDialogProps, ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

export interface BaseTransactionConfirmationProps extends ThemeProps {
  transaction: SWTransactionResult;
  openAlert: (alertProps: AlertDialogProps) => void;
  closeAlert: VoidFunction;
}

const Component: React.FC<BaseTransactionConfirmationProps> = (props: BaseTransactionConfirmationProps) => {
  const { className, transaction } = props;
  const transactionData = transaction.data as ApprovePendingTxRequest;

  return (
    <div className={CN(className)}>
      <CommonTransactionInfo
        address={transactionData.multisigMetadata.multisigAddress}
        network={transaction.chain}
      />
      <MultisigInfoArea transaction={transaction} />
    </div>
  );
};

const PendingMultisigConfirmation = styled(Component)<BaseTransactionConfirmationProps>(({ theme: { token } }: BaseTransactionConfirmationProps) => {
  return {};
});

export default PendingMultisigConfirmation;
