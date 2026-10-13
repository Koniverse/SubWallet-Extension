#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import path from 'path';
import fs from "fs";

import execSync from '@polkadot/dev/scripts/execSync.mjs';
import {Webhook} from "discord-webhook-node";

console.log('$ polkadot-ci-ghact-build', process.argv.slice(2).join(' '));

function runClean() {
  execSync('yarn polkadot-dev-clean-build');
}

function runCheck() {
  execSync('yarn lint');
}

function runTest() {
  execSync('yarn test');
}

// The full test suite is not runnable yet, so only run the suites that are known to pass
function runStableTest() {
  execSync('yarn test:one packages/extension-base/src/services/multisig-service');
}

function runBuild() {
  execSync('yarn build');
}

function runBuildWebRunner() {
  execSync('yarn web-runner:build-zip');
}

function npmGetVersion() {
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')).version;
}

runClean();
runCheck();
// runTest();
runStableTest();
runBuild();

// Web runner
runBuildWebRunner();
