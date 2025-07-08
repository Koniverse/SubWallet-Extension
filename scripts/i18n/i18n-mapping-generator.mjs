#!/usr/bin/env node
import fs from 'fs';
import { replaceInFile } from 'replace-in-file';
import config from '../../i18next-scanner.config.js';

const textToKeyFile = 'packages/extension-koni/public/locales/i18n-location-mappings.json';
const locationFilePaths = 'packages/extension-koni/public/locales/location-file-paths.json';
const rawContentI18nFilePath = 'packages/extension-koni/public/locales/raw-content-i18n.json';


const mappingRawContentI18nFilePath = 'packages/extension-koni/public/locales/mapping-raw-content-i18n.json';
const filepathToNamespaceFile = 'packages/extension-koni/public/locales/mapping-location.json';

const outputFilePath = 'packages/extension-koni/public/locales/combined-data.json';

// Main
async function main() {

  const translations = await config.scanSourceForTranslations(config);

  if (translations.size === 0) {
    console.log('No translations found');
    return;
  }

  console.log('===================================== translations ====================================', translations);

  // Convert Map to a plain object for serialization
  const translationsObject = Object.fromEntries(translations);

  const translationKeys = Object.keys(translationsObject);

  const deduplicatedTranslationsObject = Object.keys(translationsObject).reduce((result, key) => {
    // Sử dụng Set để loại bỏ các filepath trùng lặp
    result[key] = [...new Set(translationsObject[key])];
    return result;
  }, {});

  try {
    // Ghi các key vào file translation-keys.json
    fs.writeFileSync(rawContentI18nFilePath, JSON.stringify(translationKeys, null, 2), 'utf-8');
    console.log(`Successfully wrote rawContentI18nFilePath to ${rawContentI18nFilePath}`);


    // Write to file asynchronously
    fs.writeFileSync(textToKeyFile, JSON.stringify(deduplicatedTranslationsObject, null, 2), 'utf-8');
    console.log(`Successfully wrote textToKeyFile to ${textToKeyFile}`);
  } catch (error) {
    console.error(`Failed to write ${textToKeyFile}:`, error);
    process.exit(1);
  }

  try {

    const filePathsData = [...new Set(Object.values(translationsObject).flat())];
    // Write to file asynchronously
    fs.writeFileSync(locationFilePaths, JSON.stringify(filePathsData, null, 2), 'utf-8');

    console.log(`Successfully wrote locationFilePaths to ${locationFilePaths}`);
  } catch (error) {
    console.error(`Failed to write files!`, error);
    process.exit(1);
  }

}

main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
