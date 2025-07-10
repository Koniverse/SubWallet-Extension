#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const LOCALES_DIR = 'packages/extension-koni/public/locales';
const SCRIPT_GEN_DIR = path.join(LOCALES_DIR, 'script-gen');
const AI_GEN_DIR = path.join(LOCALES_DIR, 'ai-gen');
const outputFilePath = path.join(SCRIPT_GEN_DIR, 'combined-data.json');

const textToFilepaths = path.join(SCRIPT_GEN_DIR, 'raw-text-meta-mapping.json');
const filepathToNamespaceFile = path.join(AI_GEN_DIR, 'ai-filepath-to-namespace.json');
const mappingRawContentI18nFilePath = path.join(AI_GEN_DIR, 'ai-text-to-summary.json');

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`❌ Failed to read ${filePath}:`, error.message);
    process.exit(1);
  }
}

function readExistingData(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return {};
  } catch (error) {
    console.error(`❌ Failed to read existing data from ${filePath}:`, error.message);
    return {};
  }
}

async function main() {
  try {
    // 1. Đọc dữ liệu hiện có (nếu có)
    const existingData = readExistingData(outputFilePath);

    // 1. Đọc các file mapping với validation
    const textToLocations = readJsonFile(textToFilepaths);
    const filepathToNamespace = readJsonFile(filepathToNamespaceFile);
    const textToKey = readJsonFile(mappingRawContentI18nFilePath);

    // 2. Khởi tạo kết quả và thống kê
    const combinedData = {...existingData};
    const skippedTexts = [];
    const missingNamespaces = [];
    const updatedTexts = [];
    const newTexts = [];

    // 3. Xử lý từng text key
    for (const [textKey, data] of Object.entries(textToLocations)) {
      const camelCaseKey = textToKey[textKey];
      const { locations, translations } = data;

      if (!camelCaseKey) {
        skippedTexts.push(textKey);
        continue;
      }

      // Xử lý locations
      const processedLocations = locations.map(filepath => {
        const namespace = filepathToNamespace[filepath];

        if (!namespace) {
          missingNamespaces.push(filepath);
          return null;
        }

        return {
          filepath,
          key: `${namespace}.${camelCaseKey}`
        };
      }).filter(Boolean);

      if (processedLocations.length > 0) {
        const newEntry = {
          locations: processedLocations,
          translations: translations || {} // Đảm bảo luôn có translations
        };

        if (textKey in combinedData) {
          // Nếu textKey đã tồn tại, merge locations và translations
          const existingEntry = combinedData[textKey];
          combinedData[textKey] = {
            locations: [...existingEntry.locations, ...newEntry.locations],
            translations: {...existingEntry.translations, ...newEntry.translations}
          };
          updatedTexts.push(textKey);
        } else {
          // Nếu là textKey mới
          combinedData[textKey] = newEntry;
          newTexts.push(textKey);
        }
      }
    }

    // 4. Thống kê và cảnh báo
    if (skippedTexts.length > 0) {
      console.warn(`⚠️  Skipped ${skippedTexts.length} texts without keys:`);
      console.warn(skippedTexts.slice(0, 5).join('\n'));
      if (skippedTexts.length > 5) console.warn('...and more');
    }

    if (missingNamespaces.length > 0) {
      console.warn(`⚠️  Missing namespace for ${missingNamespaces.length} filepaths:`);
      console.warn(missingNamespaces.slice(0, 5).join('\n'));
      if (missingNamespaces.length > 5) console.warn('...and more');
    }

    // 5. Ghi dữ liệu kết hợp
    fs.writeFileSync(outputFilePath, JSON.stringify(combinedData, null, 2), 'utf-8');

    console.log(`✅ Successfully updated combined data at ${outputFilePath}`);
    console.log(`ℹ️ Total entries: ${Object.keys(combinedData).length}`);
    console.log(`ℹ️ New entries: ${newTexts.length}`);
    console.log(`ℹ️ Updated entries: ${updatedTexts.length}`);
    console.log(`ℹ️ Missing keys: ${skippedTexts.length}`);
    console.log(`ℹ️ Missing namespaces: ${missingNamespaces.length}`);

  } catch (error) {
    console.error('❌ Error combining data:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
