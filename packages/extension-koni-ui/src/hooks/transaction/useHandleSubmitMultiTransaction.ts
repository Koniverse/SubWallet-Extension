// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AmountData } from '@subwallet/extension-base/background/KoniTypes';
import { TransactionWarning } from '@subwallet/extension-base/background/warnings/TransactionWarning';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { defaultLogger } from '@subwallet/extension-base/utils/logger';
import { useExtensionDisplayModes, useSidePanelUtils, useTransactionContext } from '@subwallet/extension-koni-ui/hooks';
import { windowOpen } from '@subwallet/extension-koni-ui/messaging';
import { CommonActionType, CommonProcessAction } from '@subwallet/extension-koni-ui/reducer';
import { ClaimRewardParams } from '@subwallet/extension-koni-ui/types';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useNotification, useTranslation } from '../common';

const useHandleSubmitMultiTransaction = (dispatchProcessState: (value: CommonProcessAction) => void, handleWarning?: (value: TransactionWarning[]) => void, handleDataForInsufficientAlert?: (estimateFee: AmountData) => Record<string, string>) => {
  const notify = useNotification();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { closeSidePanel } = useSidePanelUtils();
  const { isExpanseMode, isSidePanelMode } = useExtensionDisplayModes();

  const { onDone } = useTransactionContext<ClaimRewardParams>();

  const onHandleOneSignConfirmation = useCallback((transactionProcessId: string) => {
    if (!isExpanseMode) {
      windowOpen({
        allowedPath: '/transaction-submission',
        params: {
          'transaction-process-id': transactionProcessId
        }
      }).then(window.close).catch((error) => defaultLogger.debug('Failed to open window', error));

      isSidePanelMode && closeSidePanel();
    } else {
      navigate(`/transaction-submission?transaction-process-id=${transactionProcessId}`);
    }
  }, [closeSidePanel, isExpanseMode, isSidePanelMode, navigate]);

  const onError = useCallback(
    (error: Error) => {
      notify({
        message: error.message,
        type: 'error',
        duration: 8
      });

      dispatchProcessState({
        type: CommonActionType.STEP_ERROR_ROLLBACK,
        payload: error
      });
    },
    [dispatchProcessState, notify]
  );

  const onSuccess = useCallback(
    (lastStep: boolean, needRollback: boolean): ((rs: SWTransactionResponse) => boolean) => {
      return (rs: SWTransactionResponse): boolean => {
        const { errors: _errors, id, processId, warnings } = rs;

        if (_errors.length || warnings.length) {
          if (_errors[0]?.message !== 'Rejected by user') {
            if (
              _errors[0]?.message.startsWith('UnknownError Connection to Indexed DataBase server lost') ||
              _errors[0]?.message.startsWith('Provided address is invalid, the capitalization checksum test failed') ||
              _errors[0]?.message.startsWith('connection not open on send()')
            ) {
              notify({
                message: t('ui.TRANSACTION.hook.transaction.useHandleSubmitMulti.selectedNetworkLostConnection'),
                type: 'error',
                duration: 8
              });

              return false;
            } else {
              notify({
                message: _errors[0]?.message || warnings[0]?.message,
                type: _errors.length ? 'error' : 'warning',
                duration: 8
              });
            }

            if (!_errors.length) {
              handleWarning?.(warnings);
            } else {
              // hideAll();
              onError(_errors[0]);
              handleWarning?.([]);
            }

            return false;
          } else {
            dispatchProcessState({
              type: needRollback ? CommonActionType.STEP_ERROR_ROLLBACK : CommonActionType.STEP_ERROR,
              payload: _errors[0]
            });

            return false;
          }
        } else if (id) {
          dispatchProcessState({
            type: CommonActionType.STEP_COMPLETE,
            payload: rs
          });

          if (lastStep) {
            processId ? onHandleOneSignConfirmation(processId) : onDone(id);

            return false;
          }

          return true;
        }

        return false;
      };
    },
    [notify, t, handleWarning, onError, dispatchProcessState, onHandleOneSignConfirmation, onDone]
  );

  return useMemo(() => ({
    onSuccess,
    onError
  }), [onError, onSuccess]);
};

export default useHandleSubmitMultiTransaction;
