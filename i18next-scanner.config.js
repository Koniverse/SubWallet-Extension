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

function transform (file, enc, done) {
  const { ext } = path.parse(file.path);

  if (ext === '.tsx') {
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

function customTransform(file, enc, done) {
  const { ext } = path.parse(file.path);
  if (['.ts', '.tsx'].includes(ext)) {
    try {
      const content = fs.readFileSync(file.path, enc);
      const { outputText } = typescript.transpileModule(content, {
        compilerOptions: {
          target: 'es2018',
          jsx: ext === '.tsx' ? 'react' : 'preserve',
          module: 'esnext'
        },
        fileName: path.basename(file.path)
      });

      // Hàm kiểm tra key đã được dịch
      const isTranslatedKey = (key) => {
        // Bước 1: Chuẩn hóa key (bỏ dấu nháy, khoảng trắng, backtick)
        const cleanKey = String(key)
          .replace(/['"`\s]/g, '') // Bỏ tất cả dấu nháy/khoảng trắng
          .trim();

        // Bước 2: Kiểm tra namespace
        const isNamespaced = /^(ui|bg|common|i18nExtend)\.[a-z]+(\.[a-z0-9]+)*$/i.test(cleanKey);

        // Bước 3: Kiểm tra dynamic key (${...}, {{...}})
        const isDynamic = /(\$\{|{{|}})/.test(key);

        return isNamespaced || isDynamic;
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

      // Parse <Trans> component
      this.parser.parseTransFromString(outputText, (key) => {
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
      savePath: 'packages/extension-koni/public/locales/{{lng}}/{{ns}}.json'
    },
    trans: {
      component: 'Trans'
    }
  },
  output: './',
  transform,
  scanSourceForTranslations
};
