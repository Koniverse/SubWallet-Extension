// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isSameAddress } from '@subwallet/extension-base/utils';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { useMemo } from 'react';

const useGetGovLockedInfos = (chain?: string) => {
  const { currentAccountProxy, isAllAccount } = useSelector((state) => state.accountState);
  const govLockedInfos = useSelector((state) => state.openGov.govLockedInfos);

  return useMemo(() => {
    let infos = govLockedInfos;

    if (chain) {
      infos = infos.filter((item) => item.chain === chain);
    }

    if (isAllAccount) {
      return infos;
    }

    if (currentAccountProxy?.accounts?.length) {
      return infos.filter((item) =>
        currentAccountProxy.accounts.some(({ address }) => isSameAddress(item.address, address))
      );
    }

    return [];
  }, [isAllAccount, currentAccountProxy?.accounts, govLockedInfos, chain]);
};

export default useGetGovLockedInfos;
