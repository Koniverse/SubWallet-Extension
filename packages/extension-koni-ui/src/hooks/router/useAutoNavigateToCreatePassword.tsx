// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RootState } from '@subwallet/extension-koni-ui/stores';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export default function useAutoNavigateToCreatePassword () {
  const navigate = useNavigate();
  const hasMasterPassword = useSelector((state: RootState) => state.accountState.hasMasterPassword);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!hasMasterPassword) {
      navigate('/keyring/create-password', {
        state: {
          prevPathname: location.pathname,
          prevSearch: searchParams.toString(),
          prevState: location.state as unknown
        }
      });
    }
  }, [navigate, hasMasterPassword, location.pathname, location.state, searchParams]);
}
