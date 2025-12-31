// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LANGUAGE } from '@subwallet/extension-base/constants';
import { createLogger } from '@subwallet/extension-base/utils/logger';
import i18next from 'i18next';
import { useEffect, useMemo, useState } from 'react';

import { useSelector } from './useSelector';

const logger = createLogger('useSubscribeLanguage');

const useSubscribeLanguage = () => {
  const originalLanguage = useMemo(() => localStorage.getItem(LANGUAGE) || 'en', []);

  const { language } = useSelector((state) => state.settings);

  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (language !== originalLanguage) {
      setChanged(true);
    }
  }, [language, originalLanguage]);

  useEffect(() => {
    if (changed) {
      i18next.changeLanguage(language).catch((error) => logger.error('Failed to change language', error));
    }
  }, [changed, language]);
};

export default useSubscribeLanguage;
