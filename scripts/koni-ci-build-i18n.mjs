#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';

import execSync from '@polkadot/dev/scripts/execSync.mjs';

execSync('yarn i18next-scanner --config i18next-scanner.config.js');

// ponytail: webapp locales are generated from one source of truth; rerun this after syncing UI logic.
fs.rmSync('./packages/webapp/public/locales', { force: true, recursive: true });
fs.cpSync('./packages/extension-koni/public/locales', './packages/webapp/public/locales', { recursive: true });
execSync('yarn i18next-scanner --config i18next-scanner.webapp.config.js');
