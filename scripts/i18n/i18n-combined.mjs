#!/usr/bin/env node
import fs from 'fs';

const textToKeyFile = 'packages/extension-koni/public/locales/i18n-location-mappings.json';
const filepathToNamespaceFile = 'packages/extension-koni/public/locales/mapping-location.json';
const mappingRawContentI18nFilePath = 'packages/extension-koni/public/locales/mapping-raw-content-i18n.json';
const outputFilePath = 'packages/extension-koni/public/locales/combined-data.json';

async function main() {
  try {
    // Đọc các file cần thiết
    const textToFilepaths = JSON.parse(fs.readFileSync(textToKeyFile, 'utf-8'));
    const filepathToNamespace = JSON.parse(fs.readFileSync(filepathToNamespaceFile, 'utf-8'));
    const textToKey = JSON.parse(fs.readFileSync(mappingRawContentI18nFilePath, 'utf-8'));

    // Tạo đối tượng kết hợp
    const combinedData = Object.keys(textToFilepaths).reduce((result, textKey) => {
      const camelCaseKey = textToKey[textKey];

      if (!camelCaseKey) {
        console.warn(`[WARNING] Skipped: No key found for text "${textKey}" in file "${textToKeyFile}".`);
        return result;
      }

      const filepaths = textToFilepaths[textKey];

      const mappings = filepaths
        .map(filepath => {
          const namespace = filepathToNamespace[filepath];

          if (!namespace) {
            console.warn(`[WARNING] Skipped: No namespace found for filepath "${filepath}" in file "${filepathToNamespaceFile}".`);
            return null;
          }

          const finalKey = `${namespace}.${camelCaseKey}`;

          return {
            filepath,
            key: finalKey
          };
        })
        .filter(item => item !== null);

      if (mappings.length > 0) {
        result[textKey] = mappings;
      }

      return result;
    }, {});

    // Ghi dữ liệu kết hợp vào file
    fs.writeFileSync(outputFilePath, JSON.stringify(combinedData, null, 2), 'utf-8');
    console.log(`Successfully wrote combined data to ${outputFilePath}`);

  } catch (error) {
    console.error('Error combining data:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});

