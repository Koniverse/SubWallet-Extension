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

  console.log('======================== translations ======================', translations);
  return;

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
    console.log(`Successfully wrote translation keys to ${rawContentI18nFilePath}`);


    // Write to file asynchronously
    fs.writeFileSync(textToKeyFile, JSON.stringify(deduplicatedTranslationsObject, null, 2), 'utf-8');
    console.log(`Successfully wrote translations to ${textToKeyFile}`);
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

  // Đọc dữ liệu từ raw-data-mapping.json và raw-file-paths.json
  const textToFilepaths = JSON.parse(fs.readFileSync(textToKeyFile, 'utf-8'));
  // Đọc dữ liệu từ file: mapping-location-file-paths.json
  const filepathToNamespace = JSON.parse(fs.readFileSync(filepathToNamespaceFile, 'utf-8'));

  // Đọc dữ liệu từ file: rawfilePaths
  const textToKey = JSON.parse(fs.readFileSync(mappingRawContentI18nFilePath, 'utf-8'));

  // Tạo đối tượng kết hợp
  const combinedData = Object.keys(textToFilepaths).reduce((result, textKey) => {
    // Lấy ra camelCaseKey từ File 3
    const camelCaseKey = textToKey[textKey];

    // Xử lý lỗi: Nếu không tìm thấy key cho văn bản gốc
    if (!camelCaseKey) {
      console.warn(`[CẢNH BÁO] Bỏ qua: Không tìm thấy key cho văn bản "${textKey}" trong file "${textToKeyFile}".`);
      return result; // Bỏ qua và tiếp tục với textKey tiếp theo
    }

    const filepaths = textToFilepaths[textKey];

    // Tạo mảng các đối tượng mapping cho textKey hiện tại
    const mappings = filepaths
      .map(filepath => {
        // Lấy ra namespace từ File 2
        const namespace = filepathToNamespace[filepath];

        // Xử lý lỗi: Nếu không tìm thấy namespace cho filepath
        if (!namespace) {
          console.warn(`[CẢNH BÁO] Bỏ qua: Không tìm thấy namespace cho filepath "${filepath}" trong file "${filepathToNamespaceFile}".`);
          return null; // Trả về null để lọc ra sau
        }

        // Tạo key cuối cùng bằng cách kết hợp
        const finalKey = `${namespace}.${camelCaseKey}`;

        return {
          filepath,
          key: finalKey
        };
      })
      .filter(item => item !== null); // Lọc bỏ các mục bị lỗi (trả về null)

    // Chỉ thêm vào kết quả nếu có ít nhất một mapping hợp lệ
    if (mappings.length > 0) {
      result[textKey] = mappings;
    }

    return result;
  }, {});

  // Ghi dữ liệu kết hợp vào file mới
  fs.writeFileSync(outputFilePath, JSON.stringify(combinedData, null, 2), 'utf-8');

}

main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
