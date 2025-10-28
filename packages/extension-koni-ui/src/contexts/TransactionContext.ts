// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubstrateProxyItem } from '@subwallet/extension-base/types';
import { SetSubstrateProxyAccountsToSign } from '@subwallet/extension-koni-ui/hooks';
import { AlertDialogProps, TransactionFormBaseProps } from '@subwallet/extension-koni-ui/types';
import { ButtonProps } from '@subwallet/react-ui';
import React, { Dispatch, SetStateAction } from 'react';

export interface TransactionContextProps {
  modalId?: string;
  defaultData: TransactionFormBaseProps;
  persistData: Dispatch<SetStateAction<TransactionFormBaseProps>>;
  needPersistData: boolean;
  onDone: (extrinsicHash: string) => void;
  setSubHeaderRightButtons: Dispatch<SetStateAction<ButtonProps[] | undefined>>;
  setCustomScreenTitle: Dispatch<SetStateAction<string | undefined>>;
  setIsDisableHeader: Dispatch<SetStateAction<boolean | undefined>>;
  goBack: () => void;
  setBackProps: Dispatch<SetStateAction<{
    disabled: boolean,
    onClick: null | VoidFunction
  }>>;
  openAlert: (alertProps: AlertDialogProps) => void;
  closeAlert: VoidFunction;
  openRecheckChainConnectionModal: (chainName: string) => void;
  closeRecheckChainConnectionModal: VoidFunction;
  setSubstrateProxyAccountsToSign: SetSubstrateProxyAccountsToSign;
  substrateProxyAccountsToSign: SubstrateProxyItem[];
}

export const TransactionContext = React.createContext<TransactionContextProps>({
  defaultData: { from: '', fromAccountProxy: '', chain: '', asset: '' },
  needPersistData: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setIsDisableHeader: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  persistData: (value) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onDone: (extrinsicHash) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSubHeaderRightButtons: (value) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setCustomScreenTitle: (title) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  goBack: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setBackProps: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openAlert: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeAlert: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openRecheckChainConnectionModal: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeRecheckChainConnectionModal: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSubstrateProxyAccountsToSign: () => {},
  substrateProxyAccountsToSign: []
});
