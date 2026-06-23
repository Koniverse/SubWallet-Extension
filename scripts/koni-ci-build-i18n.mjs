#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';

import execSync from '@polkadot/dev/scripts/execSync.mjs';

execSync('yarn i18next-scanner --config i18next-scanner.config.js');
execSync('yarn i18next-scanner --config i18next-scanner.webapp.config.js');

// ponytail: preserve webapp content and only fill blank shared keys from extension locales.
const english = JSON.parse(fs.readFileSync('./packages/webapp/public/locales/en/translation.json', 'utf8'));

for (const { name: language } of fs.readdirSync('./packages/extension-koni/public/locales', { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
  const extensionPath = `./packages/extension-koni/public/locales/${language}/translation.json`;
  const webappPath = `./packages/webapp/public/locales/${language}/translation.json`;
  const extension = JSON.parse(fs.readFileSync(extensionPath, 'utf8'));
  const webapp = JSON.parse(fs.readFileSync(webappPath, 'utf8'));

  for (const key of Object.keys(webapp)) {
    webapp[key] ||= extension[key] || english[key] || '';
  }

  fs.writeFileSync(webappPath, JSON.stringify(webapp, null, 2));
}
