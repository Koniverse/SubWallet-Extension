// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ModalContext } from '@subwallet/react-ui';
import { useContext, useMemo } from 'react';

const useIsModalInactive = (currentModalId: string): boolean => {
  const { data: { activeMap } } = useContext(ModalContext);

  return useMemo(() => {
    return !activeMap[currentModalId];
  }, [activeMap, currentModalId]);
};

export default useIsModalInactive;
