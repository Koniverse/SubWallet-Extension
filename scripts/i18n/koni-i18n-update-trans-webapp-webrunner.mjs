#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const CONFIG = {
  LANGUAGES: ['en', 'vi', 'ja', 'zh', 'ru'],
  EXTENSION_LOCALES_DIR: 'packages/extension-koni/public/locales',
  WEB_RUNNER_LOCALES_DIR: 'packages/web-runner/public/locales',
  WEBAPP_LOCALES_DIR: 'packages/webapp/public/locales',
  TRANSLATION_FILE: 'translation.json',
  ENCODING: 'utf-8',
  BG_PREFIX: 'bg.'
};

const PATHS = {
  getLangFile: (lng, app) => {
    const baseDir = {
      extension: CONFIG.EXTENSION_LOCALES_DIR,
      webRunner: CONFIG.WEB_RUNNER_LOCALES_DIR,
      webapp: CONFIG.WEBAPP_LOCALES_DIR
    }[app];
    return path.join(baseDir, lng, CONFIG.TRANSLATION_FILE);
  }
};

class FileRepository {
  static loadJson(filePath, allowEmpty = false) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, CONFIG.ENCODING));
      }
      return allowEmpty ? {} : null;
    } catch (error) {
      console.error(`❌ Error reading ${filePath}:`, error.message);
      return null;
    }
  }

  static saveJson(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), CONFIG.ENCODING);
      console.log(`✅ Saved: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error reading ${filePath}:`, error.message);
    }
  }
}

class Logger {
  static start(message) {
    console.log(`🔄 ${message}`);
  }

  static success(message) {
    console.log(`🎉 ${message}`);
  }

  static languageStats(app, lng, addedCount) {
    console.log(`🌍 ${app.toUpperCase()} - ${lng.toUpperCase()}:`);
    console.log(`   - Added: ${addedCount} keys`);
  }
}

class TranslationService {
  static copyBgKeys(sourceTranslations, targetTranslations) {
    const newTranslations = { ...targetTranslations };
    let addedCount = 0;

    Object.entries(sourceTranslations).forEach(([key, value]) => {
      if (key.startsWith(CONFIG.BG_PREFIX) && !newTranslations[key]) {
        newTranslations[key] = value;
        addedCount++;
      }
    });

    return { newTranslations, addedCount };
  }
}


async function copyBgKeysToApps() {
  Logger.start('Starting to copy bg. keys to web-runner and webapp...');


  CONFIG.LANGUAGES.forEach(lng => {

    const sourceFile = PATHS.getLangFile(lng, 'extension');
    const sourceTranslations = FileRepository.loadJson(sourceFile, true) || {};
    if (!sourceTranslations) {
      console.error(`❌ Failed to load translation file for ${lng} from extension`);
      return;
    }

    ['webRunner', 'webapp'].forEach(app => {
      const targetFile = PATHS.getLangFile(lng, app);
      const targetTranslations = FileRepository.loadJson(targetFile, true) || {};

      const targetDir = path.dirname(targetFile);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const { newTranslations, addedCount } = TranslationService.copyBgKeys(sourceTranslations, targetTranslations);

      FileRepository.saveJson(targetFile, newTranslations);
      Logger.languageStats(app, lng, addedCount);
    });
  });

  Logger.success('Successfully copied bg. keys to all translation files!');
}

// --- THỰC THI ---
copyBgKeysToApps().catch(error => {
  console.error('❌ Process failed:', error);
  process.exit(1);
});
