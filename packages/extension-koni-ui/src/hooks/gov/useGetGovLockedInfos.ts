// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isSameAddress } from '@subwallet/extension-base/utils';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { useMemo } from 'react';

const useGetGovLockedInfos = () => {
  const { currentAccountProxy, isAllAccount } = useSelector((state) => state.accountState);
  const govLockedInfos = useSelector((state) => state.openGov.govLockedInfos);

  return useMemo(() => {
    if (isAllAccount) {
      return govLockedInfos;
    }

    if (currentAccountProxy?.accounts?.length) {
      return govLockedInfos.filter((item) =>
        currentAccountProxy.accounts.some(({ address }) => isSameAddress(item.address, address))
      );
    }

    return [];
  }, [isAllAccount, currentAccountProxy?.accounts, govLockedInfos]);
};

export default useGetGovLockedInfos;
