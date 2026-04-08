// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountSignMode } from '@subwallet/extension-base/types';
import { useGetAccountSignModeByAddress } from '@subwallet/extension-web-ui/hooks';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { isEthereumAddress } from '@polkadot/util-crypto';

const useGetAccountTitleByAddress = (address?: string): string => {
  const { t } = useTranslation();

  const signMode = useGetAccountSignModeByAddress(address);
  const isEvm = useMemo(() => isEthereumAddress(address || ''), [address]);

  return useMemo((): string => {
    switch (signMode) {
      case AccountSignMode.LEGACY_LEDGER:
      case AccountSignMode.GENERIC_LEDGER:
      case AccountSignMode.ECDSA_SUBSTRATE_LEDGER:
        return t('ui.USE_GET_ACCOUNT_TITLE_BY_ADDRESS.hooks.account.useGetAccountTitleByAddress.ledgerAccount');
      case AccountSignMode.ALL_ACCOUNT:
        return t('ui.USE_GET_ACCOUNT_TITLE_BY_ADDRESS.hooks.account.useGetAccountTitleByAddress.allAccount');
      case AccountSignMode.PASSWORD:
        return t('ui.USE_GET_ACCOUNT_TITLE_BY_ADDRESS.hooks.account.useGetAccountTitleByAddress.normalAccount');

      case AccountSignMode.QR:
        if (isEvm) {
          return t('ui.USE_GET_ACCOUNT_TITLE_BY_ADDRESS.hooks.account.useGetAccountTitleByAddress.evmQrSignerAccount');
        } else {
          return t('ui.USE_GET_ACCOUNT_TITLE_BY_ADDRESS.hooks.account.useGetAccountTitleByAddress.substrateQrSignerAccount');
        }

      case AccountSignMode.READ_ONLY:
        return t('ui.USE_GET_ACCOUNT_TITLE_BY_ADDRESS.hooks.account.useGetAccountTitleByAddress.watchOnlyAccount');
      case AccountSignMode.UNKNOWN:
      default:
        return t('ui.USE_GET_ACCOUNT_TITLE_BY_ADDRESS.hooks.account.useGetAccountTitleByAddress.unknownAccount');
    }
  }, [signMode, t, isEvm]);
};

export default useGetAccountTitleByAddress;
