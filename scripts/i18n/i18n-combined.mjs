#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// CONFIGURATION-DRIVEN PATTERN:
// Centralized configuration for paths, filenames, and constants
const CONFIG = {
  LOCALES_DIR: 'packages/extension-koni/public/locales',
  SCRIPT_GEN_DIR: 'script-gen',
  AI_GEN_DIR: 'ai-gen',
  OUTPUT_FILE: 'combined-data.json',
  TEXT_TO_FILEPATHS: 'raw-text-meta-mapping.json',
  FILEPATH_TO_NAMESPACE: 'ai-filepath-to-namespace.json',
  TEXT_TO_KEY: 'ai-text-to-summary.json',
  ENCODING: 'utf-8',
  MAX_LOG_ITEMS: 5
};

// CONFIGURATION-DRIVEN PATTERN:
// All file paths are derived from config, making the script easily portable
const PATHS = {
  outputFile: path.join(CONFIG.LOCALES_DIR, CONFIG.SCRIPT_GEN_DIR, CONFIG.OUTPUT_FILE),
  textToFilepaths: path.join(CONFIG.LOCALES_DIR, CONFIG.SCRIPT_GEN_DIR, CONFIG.TEXT_TO_FILEPATHS),
  filepathToNamespace: path.join(CONFIG.LOCALES_DIR, CONFIG.AI_GEN_DIR, CONFIG.FILEPATH_TO_NAMESPACE),
  textToKey: path.join(CONFIG.LOCALES_DIR, CONFIG.AI_GEN_DIR, CONFIG.TEXT_TO_KEY)
};

// SERVICE-ORIENTED PATTERN:
// FileRepository is a utility/service class that isolates I/O concerns
class FileRepository {
  static readJson(filePath, allowEmpty = false) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, CONFIG.ENCODING));
      }
      return allowEmpty ? {} : null;
    } catch (error) {
      console.error(`❌ Failed to read ${filePath}:`, error.message);
      if (allowEmpty) return {};
      throw error;
    }
  }

  static writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), CONFIG.ENCODING);
  }
}

// SERVICE-ORIENTED PATTERN:
// Logger is a utility service focused only on logging
class Logger {
  static warn(message, items = [], maxItems = CONFIG.MAX_LOG_ITEMS) {
    console.warn(`⚠️ ${message}: ${items.length}`);
    if (items.length > 0) {
      console.warn(items.slice(0, maxItems).join('\n'));
      if (items.length > maxItems) console.warn('...and more');
    }
  }

  static success(message) {
    console.log(`✅ ${message}`);
  }

  static stats(stats) {
    console.table(stats);
  }
}

// SERVICE-ORIENTED PATTERN:
// TranslationService encapsulates transformation logic of text-key mapping and translation merging
class TranslationService {
  static mergeTranslations(existing = {}, newTranslations = {}) {
    const merged = { ...existing };
    for (const [lang, value] of Object.entries(newTranslations)) {
      if (value && value !== merged[lang]) {
        merged[lang] = value;
      }
    }
    return merged;
  }

  // TRANSFORM PHASE of ETL PATTERN:
  // This function transforms raw mapping data into a structured, namespaced format
  static processTextKeys(textToLocations, textToKey, filepathToNamespace) {
    const combinedData = {};
    const stats = {
      skippedTexts: [],
      missingNamespaces: [],
      updatedTexts: [],
      newTexts: []
    };

    for (const [textKey, data] of Object.entries(textToLocations)) {
      const camelCaseKey = textToKey[textKey];
      const { locations, translations } = data;

      if (!camelCaseKey) {
        stats.skippedTexts.push(textKey);
        continue;
      }

      const processedLocations = locations
        .map(filepath => {
          const namespace = filepathToNamespace[filepath];
          if (!namespace) {
            stats.missingNamespaces.push(filepath);
            return null;
          }
          return { filepath, key: `${namespace}.${camelCaseKey}` };
        })
        .filter(Boolean);

      if (processedLocations.length > 0) {
        combinedData[textKey] = {locations: processedLocations, translations};
        stats.newTexts.push(textKey);
      }
    }

    return { combinedData, stats };
  }
}

// ETL PATTERN CONTROLLER: main() coordinates the full Extract → Transform → Load process
async function main() {
  try {

    console.log('📦 Starting translation merge process...');
    // EXTRACT PHASE of ETL PATTERN:
    const existingData = FileRepository.readJson(PATHS.outputFile, true);

    console.log('📁 Loaded existing translation data');
    const textToLocations = FileRepository.readJson(PATHS.textToFilepaths);
    const filepathToNamespace = FileRepository.readJson(PATHS.filepathToNamespace);
    const textToKey = FileRepository.readJson(PATHS.textToKey);
    console.log('📄 Loaded mapping files');

    // TRANSFORM PHASE:
    const { combinedData, stats } = TranslationService.processTextKeys(
      textToLocations,
      textToKey,
      filepathToNamespace
    );

    // DATA MERGING LOGIC:
    // Merge existing and new entries, preserving and updating where needed
    Object.entries(existingData).forEach(([key, entry]) => {
      if (combinedData[key]) {
        const mergedLocations = Array.from(
          new Map(
            [...entry.locations, ...combinedData[key].locations].map(loc => [loc.filepath, loc])
          ).values()
        );
        combinedData[key] = {
          locations: mergedLocations,
          translations: TranslationService.mergeTranslations(entry.translations, combinedData[key].translations)
        };
        stats.updatedTexts.push(key);
        stats.newTexts = stats.newTexts.filter(k => k !== key);
      } else {
        combinedData[key] = entry;
      }
    });

    // LOAD PHASE of ETL PATTERN:
    FileRepository.writeJson(PATHS.outputFile, combinedData);
    Logger.success(`Successfully updated combined data at ${PATHS.outputFile}`);

    // LOGGING PHASE:
    Logger.warn('Skipped texts without corresponding keys', stats.skippedTexts);
    Logger.warn('Missing namespaces for file paths', stats.missingNamespaces);
    Logger.stats({
      'Total entries': Object.keys(combinedData).length,
      'New entries': stats.newTexts.length,
      'Updated entries': stats.updatedTexts.length,
      'Missing keys': stats.skippedTexts.length,
      'Missing namespaces': stats.missingNamespaces.length
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
