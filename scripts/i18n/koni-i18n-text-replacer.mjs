#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0
import fs from 'fs';
import path from 'path';
import { replaceInFile } from 'replace-in-file';

// Configurable paths
const LOCALES_DIR = 'packages/extension-koni/public/locales';
const SCRIPT_GEN_DIR = path.join(LOCALES_DIR, 'script-gen');
const outputFilePath = path.join(SCRIPT_GEN_DIR, 'combined-data.json');
/**
 * Load combined translation data from file
 * @param {string} filePath - Path to translation file
 * @returns {Object} Parsed translation data or empty object if file doesn't exist
 */
function loadCombinedData(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`Translation file not found: ${filePath}. Creating new file.`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return {};
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return {};
  }
}

function escapeForRegex(text) {
  return text
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\n/g, '\\n')
    .replace(/'/g, '\\\'')
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`');
}


function convertDataFormat(newData) {
  const oldFormat = {};
  for (const [text, data] of Object.entries(newData)) {
    oldFormat[text] = data.locations;
  }
  return oldFormat;
}

function extractVariables(template) {
  const matches = template.match(/\{\{\w+\}\}/g) || [];
  return matches.map(v => v.replace(/\{\{|\}\}/g, ''));
}

function generateReplacementPatterns(originalText, key) {
  const escapedText = escapeForRegex(originalText);
  const variables = extractVariables(originalText);
  const patterns = [];

  // 1. Basic t() function
  patterns.push({
    regex: new RegExp(`t\\(['"]${escapedText}['"]\\)`, 'g'),
    replacement: `t('${key}')`
  });

  // 2. t<string>()
  patterns.push({
    regex: new RegExp(`t<\\w+>\\(['"]${escapedText}['"]\\)`, 'g'),
    replacement: `t<string>('${key}')`
  });

  // 3. detectTranslate()
  patterns.push({
    regex: new RegExp(`detectTranslate\\(['"]${escapedText}['"]\\)`, 'g'),
    replacement: `detectTranslate('${key}')`
  });

  // 4. t() with object (replace: {...} )
  patterns.push({
    regex: new RegExp(`t\\(['"\`]${escapedText}['"\`],\\s*(\\{[\\s\\S]*?\\})\\)`, 'g'),
    replacement: `t('${key}', $1)`
  });

  // 5. t<string>() with object (replace: {...} )
  patterns.push({
    regex: new RegExp(`t<\\w+>\\(['"\`]${escapedText}['"\`],\\s*(\\{[\\s\\S]*?\\})\\)`, 'g'),
    replacement: `t('${key}', $1)`
  });

  return patterns;
}
/**
 * Replace i18n texts with mapped keys
 * @param newDataFormat
 * @param {Object} options - { dryRun: boolean, verbose: boolean }
 */
async function replaceTextInCode(newDataFormat, options = { dryRun: false, verbose: false }) {
  const keyMappings = convertDataFormat(newDataFormat);
  console.log('============== keyMappings =================', keyMappings);
  const replacements = [];
  const processedFiles = new Set();

  // 1. Build replacement rules
  for (const [text, mappings] of Object.entries(keyMappings)) {

    for (const { filepath, key } of mappings) {
      if (!fs.existsSync(filepath)) {
        if (options.verbose) console.warn(`⚠️ File not found: ${filepath}`);
        continue;
      }

      if (!replacements.some(r => r.files === filepath)) {
        replacements.push({
          files: filepath,
          from: [],
          to: [],
          allowEmptyPaths: true
        });
      }

      const fileRule = replacements.find(r => r.files === filepath);

      const patterns = generateReplacementPatterns(text, key);

      patterns.forEach(({ regex, replacement }) => {
        fileRule.from.push(regex);
        fileRule.to.push(replacement);
      });

      processedFiles.add(filepath);
    }
  }

  // 2. Execute replacement
  try {
    if (options.dryRun) {
      console.log('Dry run results:');
      replacements.forEach(rule => {
        console.log(`📄 ${rule.files}`);
        rule.from.forEach((pattern, i) => {
          console.log(`  🔍 ${pattern.source} → ${rule.to[i]}`);
        });
      });
      return { changedFiles: [], totalReplacements: 0 };
    }

    const results = await Promise.all(
      replacements.map(options => replaceInFile(options))
    );

    // 3. Report results
    const changedFiles = results.flat().filter(r => r.hasChanged);
    const totalReplacements = changedFiles.reduce((sum, r) => sum + r.numReplacements, 0);

    if (options.verbose) {
      console.log('✅ Replacement completed');
      console.log(`Changed ${changedFiles.length} files (${totalReplacements} total replacements):`);
      changedFiles.forEach(r => {
        console.log(`→ ${r.file} (${r.numReplacements} replacements)`);
      });
    }

    return { changedFiles, totalReplacements };
  } catch (error) {
    console.error('❌ Replacement failed:', error);
    throw error;
  }
}

async function main() {
  try {
    // Load translation mappings
    const combinedData = loadCombinedData(outputFilePath);

    if (Object.keys(combinedData).length === 0) {
      console.error('No translation mappings found in', outputFilePath);
      process.exit(1);
    }

    // Process replacements
    const options = {
      dryRun: process.argv.includes('--dry-run'),
      verbose: process.argv.includes('--verbose') || true
    };

    const { changedFiles, totalReplacements } = await replaceTextInCode(combinedData, options);

    if (!options.dryRun) {
      console.log(`Successfully processed ${changedFiles.length} files with ${totalReplacements} replacements.`);
    }
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
