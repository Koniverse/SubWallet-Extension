// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DEFAULT_ROUTER_PATH } from '@subwallet/extension-koni-ui/constants/router';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useNavigateOnChangeAccount = (path = DEFAULT_ROUTER_PATH) => {
  const navigate = useNavigate();

  const { currentAccountProxy } = useSelector((state) => state.accountState);

  const [proxyId] = useState(currentAccountProxy?.id);

  useEffect(() => {
    if (currentAccountProxy?.id !== proxyId) {
      navigate(path);
    }
  }, [proxyId, currentAccountProxy?.id, navigate, path]);
};

export default useNavigateOnChangeAccount;
