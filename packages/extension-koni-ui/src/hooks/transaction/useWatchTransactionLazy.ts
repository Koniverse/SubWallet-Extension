// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TransactionFormBaseProps } from '@subwallet/extension-koni-ui/types';
import { noop } from '@subwallet/extension-koni-ui/utils';
import { Form, FormInstance } from '@subwallet/react-ui';
import { useEffect, useState } from 'react';
import { useIsFirstRender } from 'usehooks-ts';

const useLazyWatchTransaction = <T extends TransactionFormBaseProps, K extends keyof T>(key: K, form: FormInstance<T>, defaultData: T, lazyTime = 300): T[K] => {
  const isFirstRender = useIsFirstRender();
  const watch = Form.useWatch(key, form);
  const [value, setValue] = useState<T[K]>(defaultData[key]);

  useEffect(() => {
    if (isFirstRender) {
      setValue(defaultData[key]);

      return noop;
    } else {
      const timer = setTimeout(() => {
        setValue(watch);
      }, lazyTime);

      return () => clearTimeout(timer);
    }
  }, [defaultData, isFirstRender, key, lazyTime, watch]);

  return value;
};

export default useLazyWatchTransaction;
