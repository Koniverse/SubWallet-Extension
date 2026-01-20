// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs');
const path = require('path');
const typescript = require('typescript');
const vfs = require('vinyl-fs');
const scanner = require('i18next-scanner');

function getPackageRelativePath(fullPath) {
  const normalized = path.normalize(fullPath).replace(/\\/g, '/');
  const packagesIndex = normalized.indexOf('packages/');

  if (packagesIndex !== -1) {
    return normalized.substring(packagesIndex);
  }

  return fullPath;
}

const translations = new Map();

/***
 The ** transform** function is for the i18n scanner (handles everything: both translated and untranslated keys,
 and writes them to ***`locales-to-compare`***)
 @usage: Used to compare translation keys before and after processing

***/
function transform (file, enc, done) {
  const { ext } = path.parse(file.path);

  if (['.ts', '.tsx'].includes(ext)) {
    const content = fs.readFileSync(file.path, enc);

    const { outputText } = typescript.transpileModule(content, {
      compilerOptions: {
        target: 'es2018'
      },
      fileName: path.basename(file.path)
    });

    this.parser.parseFuncFromString(outputText);
  }

  done();
}


/**
 * The `customTransform` function is used to detect untranslated keys in the source code.
 */
function customTransform(file, enc, done) {
  const { ext } = path.parse(file.path);
  if (['.ts', '.tsx'].includes(ext)) {
    try {
      const content = fs.readFileSync(file.path, enc);
      const { outputText } = typescript.transpileModule(content, {
        compilerOptions: {
          target: 'es2018'
        },
        fileName: path.basename(file.path)
      });

      // Function to check whether the key is already translated
      const isTranslatedKey = (key) => {
        // Step 1: Normalize the key (remove quotes, whitespace, backticks)
        const cleanKey = String(key)
          .replace(/['"`\s]/g, '')
          .trim();

        // Step 2: Check if it's namespaced
        return /^(ui|bg)(\.[A-Za-z0-9_]+)+$/.test(cleanKey);
      };

      // Parse functions t, detectTranslate
      this.parser.parseFuncFromString(outputText, { list: ['t', 'detectTranslate'] }, (key) => {
        if (!isTranslatedKey(key)) {
          if (!translations.has(key)) {
            translations.set(key, []);
          }
          translations.get(key).push(getPackageRelativePath(file.path));
        }
      });

    } catch (error) {
      console.error(`Error processing file ${file.path}:`, error);
    }
  }

  done();
}

function scanSourceForTranslations(config) {
  return new Promise((resolve, reject) => {
    vfs
      .src(config.input)
      .pipe(scanner(config.options, customTransform))
      .on('error', (err) => {
        console.error('Scanner error:', err);
        reject(err);
      })
      .on('end', () => {
        if (translations.size > 0) {
          resolve(translations);
        } else {
          reject(new Error('No translations found'));
        }
      })
      .pipe(vfs.dest(config.output));
  });
}

/**
 * i18n Scanner Usage
 *
 * Step 1: Disable writing
 * - Comment `resource.savePath`
 *
 * Step 2: Run i18n maintenance scripts
 * - i18n:scan
 * - i18n:combine-locales
 * - i18n:replace-text
 * - i18n:update:ext
 * - i18n:update:web-mobile
 *
 * Step 3: Final build
 * - Comment `scanSourceForTranslations`
 * - Uncomment `resource.savePath`
 * - Run `build:i18n`
 *
 * Notes:
 * - `transform` is always enabled.
 * - `scanSourceForTranslations` is only for cleanup phase.
 */

module.exports = {
  input: [
    'packages/extension-koni-ui/src/**/*.{ts,tsx}',
    '!packages/extension-web-ui/src/**/*.{ts,tsx}',
    'packages/extension-base/src/**/*.{ts,tsx}',
    // Use ! to filter out files or directories
    '!packages/*/src/**/*.spec.{ts,tsx}',
    '!packages/*/src/i18n/**',
    '!**/node_modules/**',
    '!**/*.d.ts'
  ],
  options: {
    debug: true,
    removeUnusedKeys: true,
    defaultLng: 'en',
    func: {
      extensions: ['.tsx', '.ts'],
      list: ['t', 'i18next.t', 'i18n.t', 'detectTranslate']
    },
    keySeparator: false, // key separator
    lngs: ['en', 'vi', 'zh', 'ja', 'ru'],
    nsSeparator: false, // namespace separator
    resource: {
      jsonIndent: 2,
      lineEnding: '\n',
      loadPath: 'packages/extension-koni/public/locales/{{lng}}/{{ns}}.json',
      // savePath: 'packages/extension-koni/public/locales/{{lng}}/{{ns}}.json',
    },
    trans: {
      component: 'Trans'
    }
  },
  output: './',
  transform,
  scanSourceForTranslations
};
