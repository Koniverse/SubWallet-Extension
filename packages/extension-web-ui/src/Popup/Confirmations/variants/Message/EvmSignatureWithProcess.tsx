// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ConfirmationsQueueItem, EvmSignatureRequest } from '@subwallet/extension-base/background/KoniTypes';
import { ProcessTransactionData, ProcessType, SwapBaseTxData } from '@subwallet/extension-base/types';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { AlertDialogProps, ThemeProps } from '@subwallet/extension-web-ui/types';
import CN from 'classnames';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { EvmSignArea } from '../../parts/Sign';
import { BaseProcessConfirmation, EarnProcessConfirmation, SwapProcessConfirmation } from '../Process';

interface Props extends ThemeProps {
  request: ConfirmationsQueueItem<EvmSignatureRequest>
  openAlert: (alertProps: AlertDialogProps) => void;
  closeAlert: VoidFunction;
}

const getProcessComponent = (processType: ProcessType): typeof BaseProcessConfirmation => {
  switch (processType) {
    case ProcessType.SWAP:
      return SwapProcessConfirmation;
    case ProcessType.EARNING:
      return EarnProcessConfirmation;
    default:
      return BaseProcessConfirmation;
  }
};

const Component: React.FC<Props> = (props: Props) => {
  const { className, closeAlert, openAlert, request } = props;
  const { id, payload } = request;

  const { aliveProcess } = useSelector((state: RootState) => state.requestState);

  const process = useMemo(() => aliveProcess[payload.processId || ''], [aliveProcess, payload.processId]);

  const renderContent = useCallback((process: ProcessTransactionData): React.ReactNode => {
    if (process) {
      const Component = getProcessComponent(process.type);

      return (
        <Component
          closeAlert={closeAlert}
          openAlert={openAlert}
          process={process}
        />
      );
    } else {
      return null;
    }
  }, [closeAlert, openAlert]);

  const txExpirationTime = useMemo((): number | undefined => {
    if (process.type === ProcessType.SWAP) {
      const data = process.combineInfo as SwapBaseTxData;

      return data.quote.aliveUntil;
    }
    // todo: there might be more types of extrinsic

    return undefined;
  }, [process.combineInfo, process.type]);

  return (
    <>
      <div className={CN(className, 'confirmation-content')}>
        {renderContent(process)}
      </div>
      <EvmSignArea
        id={id}
        payload={request}
        txExpirationTime={txExpirationTime}
        type={'evmSignatureRequest'}
      />
    </>
  );
};

const TransactionConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '--content-gap': 0,
    marginTop: token.marginXS,

    '.network-box': {
      marginTop: token.marginSM
    },

    '.-to-right': {
      '.__value': {
        textAlign: 'right'
      }
    }
  };
});

export default TransactionConfirmation;
