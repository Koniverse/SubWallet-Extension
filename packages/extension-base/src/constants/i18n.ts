// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LanguageOptionType, LanguageType } from '@subwallet/extension-base/background/KoniTypes';
import { detectTranslate } from '@subwallet/extension-base/utils';

export const languageOptions: LanguageOptionType[] = [
  {
    text: detectTranslate('base.constants.i18n.languageOptions.en'),
    value: 'en'
  },
  {
    text: detectTranslate('base.constants.i18n.languageOptions.vi'),
    value: 'vi'
  },
  {
    text: detectTranslate('base.constants.i18n.languageOptions.zh'),
    value: 'zh'
  },
  {
    text: detectTranslate('base.constants.i18n.languageOptions.ja'),
    value: 'ja'
  },
  {
    text: detectTranslate('base.constants.i18n.languageOptions.ru'),
    value: 'ru'
  },
  {
    text: detectTranslate('base.constants.i18n.languageOptions.fr'),
    value: 'fr'
  },
  {
    text: detectTranslate('base.constants.i18n.languageOptions.tr'),
    value: 'tr'
  },
  {
    text: detectTranslate('base.constants.i18n.languageOptions.pl'),
    value: 'pl'
  },
  {
    text: detectTranslate('base.constants.i18n.languageOptions.th'),
    value: 'th'
  },
  {
    text: detectTranslate('base.constants.i18n.languageOptions.ur'),
    value: 'ur'
  }
];

export const ENABLE_LANGUAGES: LanguageType[] = ['en', 'vi', 'zh', 'ja', 'ru'];
