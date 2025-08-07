// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountSignMode } from '@subwallet/extension-base/types';
import useGetAccountByAddress from '@subwallet/extension-koni-ui/hooks/account/useGetAccountByAddress';
import { getSignMode } from '@subwallet/extension-koni-ui/utils/account/account';
import { useMemo } from 'react';

const useGetAccountSignModeByAddress = (address?: string): AccountSignMode => {
  const account = useGetAccountByAddress(address);

  return useMemo((): AccountSignMode => {
    return getSignMode(account);
  }, [account]);
};

export default useGetAccountSignModeByAddress;
