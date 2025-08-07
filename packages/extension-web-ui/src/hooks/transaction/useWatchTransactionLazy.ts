// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TransactionFormBaseProps } from '@subwallet/extension-web-ui/types';
import { noop } from '@subwallet/extension-web-ui/utils';
import { Form, FormInstance } from '@subwallet/react-ui';
import { NamePath } from '@subwallet/react-ui/es/form/interface';
import { useEffect, useState } from 'react';
import { useIsFirstRender } from 'usehooks-ts';

const useLazyWatchTransaction = <T extends TransactionFormBaseProps, K extends keyof T>(key: K, form: FormInstance<T>, defaultData: T, lazyTime = 300): T[K] => {
  const isFirstRender = useIsFirstRender();
  const watch = Form.useWatch(key, form);
  const [value, setValue] = useState<T[K]>(defaultData[key]);
  const [isBlur, setIsBlur] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const formObject = form.getFieldInstance(key as NamePath);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const inputElement = formObject?.input as HTMLInputElement;

    if (inputElement) {
      inputElement.onfocus = () => {
        setIsBlur(false);
      };

      inputElement.onblur = () => {
        setIsBlur(true);
      };
    }
  }, [form, key]);

  useEffect(() => {
    if (isFirstRender) {
      setValue(defaultData[key]);

      return noop;
    } else if (isBlur) {
      setValue(watch);

      return noop;
    } else {
      const timer = setTimeout(() => {
        setValue(watch);
      }, lazyTime);

      return () => clearTimeout(timer);
    }
  }, [defaultData, isBlur, isFirstRender, key, lazyTime, watch]);

  return value;
};

export default useLazyWatchTransaction;
