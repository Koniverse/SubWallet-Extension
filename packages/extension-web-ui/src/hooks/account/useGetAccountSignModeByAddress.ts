// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountSignMode } from '@subwallet/extension-base/types';
import useGetAccountByAddress from '@subwallet/extension-web-ui/hooks/account/useGetAccountByAddress';
import { getSignMode } from '@subwallet/extension-web-ui/utils/account/account';
import { useMemo } from 'react';

const useGetAccountSignModeByAddress = (address?: string): AccountSignMode => {
  const account = useGetAccountByAddress(address);

  return useMemo((): AccountSignMode => {
    return getSignMode(account);
  }, [account]);
};

export default useGetAccountSignModeByAddress;
