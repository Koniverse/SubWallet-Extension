// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createLogger } from '@subwallet/extension-base/utils/logger';
import { ConvertLedgerError } from '@subwallet/extension-koni-ui/types';
import { TFunction } from 'i18next';

const logger = createLogger('LedgerConnector');

export const convertLedgerError = (err: Error, t: TFunction, network: string, isSigning = false, expandError = true, isGetAddress = false): ConvertLedgerError => {
  const error = err;
  const message = error.message;
  const name = error.name;

  switch (name) {
    case 'TransportInterfaceNotAvailable':
      return {
        message: t('ui.LEDGER.util.connector.Ledger.ledgerOnlyOneTab'),
        status: 'error'
      };
  }

  if (
    message.includes('Locked device') ||
    message.includes('Device Locked')
  ) {
    return {
      status: 'warning',
      needCloseLedger: true,
      message: t('ui.LEDGER.util.connector.Ledger.pleaseUnlockLedger')
    };
  }

  if (
    message.includes('App does not seem to be open') || // App not open
    message.includes('Unknown Status Code: 28161') || // Substrate stay in dashboard
    message.includes('Unknown Status Code: 28160') || // Substrate stay in dashboard
    message.includes('Unknown Return Code: 0x6987') || // TX_NOT_INITIALIZED
    message.includes('CLA_NOT_SUPPORTED') || // Evm wrong app
    message.includes('Wrong Length') // Attach account Polkadot ECDSA in Polkadot Migration App
  ) {
    if (isSigning) {
      return {
        status: 'error',
        message: t('ui.LEDGER.util.connector.Ledger.unableToSignOpenLedgerApp', { replace: { network: network } })
      };
    } else {
      return {
        status: 'error',
        message: t('ui.LEDGER.util.connector.Ledger.openLedgerAppToConnect', { replace: { network: network } })
      };
    }
  }

  if (message.includes('Data is invalid')) {
    if (!isGetAddress) {
      return {
        status: 'error',
        message: t('ui.LEDGER.util.connector.Ledger.unableToSignOpenLedgerApp', { replace: { network: network } })
      };
    }
  }

  // Required blind signing or sign on a not registry network
  if (message.includes('Please enable Blind signing or Contract data in the Ethereum app Settings')) {
    return {
      status: 'error',
      message: t('ui.LEDGER.util.connector.Ledger.ledgerEnableBlindSigning')
    };
  }

  // Device disconnected
  if (message.includes('The device was disconnect') ||
    message.includes('A transfer error has occurred')
  ) {
    return {
      status: 'error',
      message: t('ui.LEDGER.util.connector.Ledger.ledgerIsDisconnected')
    };
  }

  // Have a request in queue
  if (
    message.includes('Cannot set property message of  which has only a getter') || // EVM
    message.includes("Failed to execute 'transferIn' on 'USBDevice'") || // Substrate
    message.includes("Failed to execute 'transferOut' on 'USBDevice'") // Substrate
  ) {
    return {
      status: 'error',
      message: t('ui.LEDGER.util.connector.Ledger.anotherRequestInQueue')
    };
  }

  // User reject request
  if (
    message.includes('User rejected') || // EVM
    message.includes('Transaction rejected') // Substrate
  ) {
    return {
      status: 'error',
      message: t('ui.LEDGER.util.connector.Ledger.rejectedByUser')
    };
  }

  // App transaction version out of data
  if (message.includes('Txn version not supported')) {
    return {
      status: 'error',
      message: t('ui.LEDGER.util.connector.Ledger.ledgerAppOutOfDate', { replace: { network: network } })
    };
  }

  logger.warn('Unknown ledger error', { error });

  if (expandError) {
    return {
      status: 'error',
      message: message
    };
  }

  return {
    status: 'error',
    message: t('ui.LEDGER.util.connector.Ledger.failToConnectClickRetry')
  };
};
