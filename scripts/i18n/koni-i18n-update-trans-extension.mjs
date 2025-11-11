#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const LANGUAGES = ['en', 'vi', 'ja', 'zh', 'ru'];
const LOCALES_DIR = 'packages/extension-koni/public/locales';
const SCRIPT_GEN_DIR = path.join(LOCALES_DIR, 'script-gen');
const COMBINED_DATA_FILE = path.join(SCRIPT_GEN_DIR, 'combined-data.json');

// --- HELPER FUNCTIONS ---
function loadJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return null;
  }
}

function saveJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Saved: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error saving ${filePath}:`, error.message);
  }
}

// --- MAIN FUNCTION ---
async function updateTranslationFiles() {
  console.log('🔄 Starting translation files update...');

  // 1. Load combined data
  const combinedData = loadJsonFile(COMBINED_DATA_FILE);
  if (!combinedData) {
    console.error('❌ Failed to load combined data file');
    process.exit(1);
  }

  // 2. Create set of all converted keys (ONLY keys that were converted)
  const convertedTexts = new Set(Object.keys(combinedData));

  // 3. Process each language
  LANGUAGES.forEach(lng => {
    const langFile = path.join(LOCALES_DIR, lng, 'translation.json');
    const existingTranslations = loadJsonFile(langFile) || {};
    const newTranslations = {...existingTranslations};

    let addedCount = 0;
    let updatedCount = 0;
    let removedCount = 0;

    // Process each entry in combined data
    Object.entries(combinedData).forEach(([key, entry]) => {
      entry.locations.forEach(location => {
        const translationKey = location.key;
        const translationValue = entry.translations[lng] || entry.translations.en || key;

        if (!newTranslations[translationKey]) {
          newTranslations[translationKey] = translationValue;
          addedCount++;
        } else if (newTranslations[translationKey] !== translationValue) {
          newTranslations[translationKey] = translationValue;
          updatedCount++;
        }
      });
    });

    // ONLY remove old keys that have been converted
    Object.keys(existingTranslations).forEach(key => {
      if (convertedTexts.has(key)) {
        delete newTranslations[key];
        removedCount++;
      }
    });

    // Save language file
    saveJsonFile(langFile, newTranslations);
    console.log(`🌍 ${lng.toUpperCase()}:`);
    console.log(`   - Added: ${addedCount}`);
    console.log(`   - Updated: ${updatedCount}`);
    console.log(`   - Removed: ${removedCount}`);
    console.log(`   - Total keys: ${Object.keys(newTranslations).length}`);
  });

  console.log('🎉 Successfully updated all translation files!');
}

updateTranslationFiles().catch(error => {
  console.error('❌ Process failed:', error);
  process.exit(1);
});
