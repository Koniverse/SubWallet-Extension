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
    // 1. Read existing data (if available)
    const existingData = readExistingData(outputFilePath);

    // 2. Read mapping files with validation
    const textToLocations = readJsonFile(textToFilepaths);
    const filepathToNamespace = readJsonFile(filepathToNamespaceFile);
    const textToKey = readJsonFile(mappingRawContentI18nFilePath);

    // 3. Initialize result and statistics
    const combinedData = {...existingData};
    const skippedTexts = [];
    const missingNamespaces = [];
    const updatedTexts = [];
    const newTexts = [];

    // 4. Process each text key
    for (const [textKey, data] of Object.entries(textToLocations)) {
      const camelCaseKey = textToKey[textKey];
      const { locations, translations } = data;

      if (!camelCaseKey) {
        skippedTexts.push(textKey);
        continue;
      }

      // Process locations
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
          translations: translations || {}
        };

        if (textKey in combinedData) {
          // If textKey already exists, merge locations and translations
          const existingEntry = combinedData[textKey];

          // Merge existing and new locations while removing duplicates based on filepath and key
          const mergedLocations = Array.from(
            new Map(
              [...existingEntry.locations, ...newEntry.locations].map(loc => {
                return [loc.filepath, loc];
              })
            ).values()
          );

          combinedData[textKey] = {
            locations: mergedLocations,
            translations: {...existingEntry.translations, ...newEntry.translations}
          };
          updatedTexts.push(textKey);
        } else {
          // If textKey is new
          combinedData[textKey] = newEntry;
          newTexts.push(textKey);
        }
      }
    }

    // 5. Show statistics and warnings
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

    // 6. Write combined data to file
    fs.writeFileSync(outputFilePath, JSON.stringify(combinedData, null, 2), 'utf-8');

    console.log(`✅ Successfully updated combined data at ${outputFilePath}`);

    console.table({
      'Total entries': Object.keys(combinedData).length,
      'New entries': newTexts.length,
      'Updated entries': updatedTexts.length,
      'Missing keys': skippedTexts.length,
      'Missing namespaces': missingNamespaces.length
    });

  } catch (error) {
    console.error('❌ Error combining data:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
