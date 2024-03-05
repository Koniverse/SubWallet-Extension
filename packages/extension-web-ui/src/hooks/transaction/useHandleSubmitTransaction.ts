// Copyright 2019-2022 @polkadot/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AmountData } from '@subwallet/extension-base/background/KoniTypes';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { useTransactionContext } from '@subwallet/extension-web-ui/hooks';
import { ClaimRewardParams } from '@subwallet/extension-web-ui/types';
import { useCallback, useMemo } from 'react';

import { useNotification, useTranslation } from '../common';

export const insufficientMessages = ['残高不足', 'Недостаточный баланс', 'Insufficient balance'];

// todo: Will update type for handleDataForInsufficientAlert
const useHandleSubmitTransaction = (setIgnoreWarnings?: (value: boolean) => void, handleDataForInsufficientAlert?: (estimateFee: AmountData) => Record<string, string>) => {
  const notify = useNotification();
  const { t } = useTranslation();

  const { closeAlert, onDone, openAlert, openRecheckChainConnectionModal } = useTransactionContext<ClaimRewardParams>();

  const onSuccess = useCallback((rs: SWTransactionResponse) => {
    const { errors, estimateFee, id, warnings } = rs;

    if (errors.length || warnings.length) {
      if (![t('Rejected by user'), 'Rejected by user'].includes(errors[0]?.message)) {
        if (errors[0]?.message?.startsWith('Unable to fetch staking data.')) {
          openRecheckChainConnectionModal(errors[0].message.split('"')[1]);
        } else if (
          errors[0]?.message.startsWith(
            'UnknownError Connection to Indexed DataBase server lost' ||
            'Provided address is invalid, the capitalization checksum test failed' ||
            'connection not open on send()'
          )
        ) {
          notify({
            message: t('Your selected network has lost connection. Update it by re-enabling it or changing network provider'),
            type: 'error',
            duration: 8
          });
        } else if (
          handleDataForInsufficientAlert &&
          insufficientMessages.some((v) => errors[0]?.message.includes(v)) &&
          estimateFee
        ) {
          const _data = handleDataForInsufficientAlert(estimateFee);

          openAlert({
            title: t('Insufficient balance'),
            content: t('Your available balance is {{availableBalance}} {{symbol}}, you need to ' +
              'leave {{existentialDeposit}} {{symbol}} as minimal balance (existential deposit) and pay network fees' +
              '. Make sure you have at least {{maintainBalance}} {{symbol}} in your transferable balance to proceed.',
            { replace: { ..._data } }),
            okButton: {
              text: t('I understand'),
              onClick: () => {
                closeAlert();
              }
            }
          });
        } else {
          notify({
            message: errors[0]?.message || warnings[0]?.message,
            type: errors.length ? 'error' : 'warning'
          });
        }
      }

      if (!errors.length) {
        warnings[0] && setIgnoreWarnings?.(true);
      }
    } else if (id) {
      onDone(id);
    }
  }, [t, handleDataForInsufficientAlert, openRecheckChainConnectionModal, notify, openAlert, closeAlert, setIgnoreWarnings, onDone]);

  const onError = useCallback((error: Error) => {
    notify({
      message: t(error.message),
      type: 'error'
    });
  }, [t, notify]);

  return useMemo(() => ({
    onSuccess,
    onError
  }), [onError, onSuccess]);
};

export default useHandleSubmitTransaction;
