// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LanguageType } from '@subwallet/extension-base/background/KoniTypes';
import { isProductionMode } from '@subwallet/extension-koni-ui/constants';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

const useFetchMarkdownContentData = () => {
  const currentLanguage = useSelector((state: RootState) => state.settings.language);

  const getJsonFile = useCallback((supportedLanguages: LanguageType[], fallbackLanguage: LanguageType) => {
    const resultLanguage = supportedLanguages.includes(currentLanguage) ? currentLanguage : fallbackLanguage;

    return isProductionMode ? `list-${resultLanguage}.json` : `preview-${resultLanguage}.json`;
  }, [currentLanguage]);

  return useCallback(<T = unknown>(folder: string, supportedLanguages: LanguageType[], fallbackLanguage: LanguageType = 'en') => {
    const jsonFile = getJsonFile(supportedLanguages, fallbackLanguage);

    return subwalletApiSdk.staticContentApi.fetchMarkdownContent<T>(folder, jsonFile);
  }, [getJsonFile]);
};

export default useFetchMarkdownContentData;
