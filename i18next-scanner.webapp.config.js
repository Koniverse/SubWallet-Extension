// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Webapp-specific i18next scanner config.
// Scans extension-web-ui + extension-base (same backend) and removes keys
// not used by the webapp, keeping the webapp locale lean and avoiding
// merge conflicts with other branches.

const baseConfig = require('./i18next-scanner.config.js');

module.exports = {
    ...baseConfig,
    input: [
        'packages/extension-web-ui/src/**/*.{ts,tsx}',
        'packages/extension-base/src/**/*.{ts,tsx}',
        // Exclude test files, i18n bootstrap and type declarations
        '!packages/*/src/**/*.spec.{ts,tsx}',
        '!packages/*/src/i18n/**',
        '!**/node_modules/**',
        '!**/*.d.ts'
    ],
    options: {
        ...baseConfig.options,
        resource: {
            ...baseConfig.options.resource,
            loadPath: 'packages/webapp/public/locales/{{lng}}/translation.json',
            savePath: 'packages/webapp/public/locales/{{lng}}/translation.json',
        }
    }
};
