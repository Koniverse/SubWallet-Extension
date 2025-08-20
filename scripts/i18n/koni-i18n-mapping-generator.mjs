#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0
import fs from 'fs';
import config from '../../i18next-scanner.config.js';
import path from 'path';

// Configuration constants
const LANGUAGES = ['en', 'ja', 'vi', 'zh', 'ru'];
const LOCALES_DIR = 'packages/extension-koni/public/locales';
const SCRIPT_GEN_DIR = path.join(LOCALES_DIR, 'script-gen');


const rawTextMetaMappingPath = path.join(SCRIPT_GEN_DIR, 'raw-text-meta-mapping.json');
const rawFilePathsPath = path.join(SCRIPT_GEN_DIR, 'raw-file-paths.json');
const rawI18nStringsPath = path.join(SCRIPT_GEN_DIR, 'raw-text.json');

function loadTranslations() {
  const translations = {};

  LANGUAGES.forEach(lng => {
    const filePath = path.join(LOCALES_DIR, lng, 'translation.json');
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      Object.entries(data).forEach(([key, value]) => {
        if (!translations[key]) {
          translations[key] = {};
        }
        if (value === '') {
          translations[key][lng] = key;
        } else {
          translations[key][lng] = value;
        }
      });
    } catch (err) {
      console.warn(`Failed to read ${lng}:`, err.message);
    }
  });

  return translations;
}

// Main
async function main() {

  const sourceLocations = await config.scanSourceForTranslations(config);

  if (sourceLocations.size === 0) {
    console.log('No translations found');
    return;
  }

  // Log for dev
  console.log('========================================= sourceLocations ====================================', sourceLocations);

  // Convert Map to a plain object for serialization
  const translationsObject = Object.fromEntries(sourceLocations);
  const translationKeys = Object.keys(translationsObject);
  const translations = loadTranslations();

  const combinedData = {};


  Object.keys(translationsObject).forEach(key => {
    combinedData[key] = {
      locations: [...new Set(translationsObject[key])],
      translations: translations[key] || {}
    };

    if (!translations[key]) {
      LANGUAGES.forEach(lng => {
        if (!combinedData[key].translations[lng]) {
          combinedData[key].translations[lng] = lng === 'en' ? key : '';
        }
      });
    }
  });

  try {
    fs.writeFileSync(rawI18nStringsPath, JSON.stringify(translationKeys, null, 2), 'utf-8');
    console.log(`Successfully wrote rawContentI18nFilePath to ${rawI18nStringsPath}`);


    fs.writeFileSync(rawTextMetaMappingPath, JSON.stringify(combinedData, null, 2), 'utf-8');
    console.log(`Successfully wrote textToKeyFile to ${rawTextMetaMappingPath}`);
  } catch (error) {
    console.error(`Failed to write ${rawTextMetaMappingPath}:`, error);
    process.exit(1);
  }

  try {

    const filePathsData = [...new Set(Object.values(translationsObject).flat())];
    fs.writeFileSync(rawFilePathsPath, JSON.stringify(filePathsData, null, 2), 'utf-8');

    console.log(`Successfully wrote locationFilePaths to ${rawFilePathsPath}`);
  } catch (error) {
    console.error(`Failed to write files!`, error);
    process.exit(1);
  }

}

main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
