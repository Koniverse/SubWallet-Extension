// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { packageInfo } from '@subwallet/extension-base';
import { BlockedConfigObjects, EnvConfig } from '@subwallet-monorepos/subwallet-services-sdk/services';

export const APP_ENV = process.env.TARGET_ENV as string;
export const APP_VER = packageInfo.version;

export function getPassConfigId (currentConfig: EnvConfig, blockedConfigObjects: BlockedConfigObjects) {
  const passList: string[] = [];

  Object.entries(blockedConfigObjects).forEach(([key, appliedConfig]) => {
    let passAppConfig = false;
    let passBrowserConfig = false;
    let passOSConfig = false;

    if (!appliedConfig.appConfig || !currentConfig.appConfig) {
      passAppConfig = true;
    } else {
      const isPassEnv = currentConfig.appConfig.environment === appliedConfig.appConfig.environment;
      const isPassVer = isPassVersion(currentConfig.appConfig.version as string, appliedConfig.appConfig.version);

      passAppConfig = isPassEnv && isPassVer;
    }

    if (!appliedConfig.browserConfig || !currentConfig.browserConfig) {
      passBrowserConfig = true;
    } else {
      const isPassType = currentConfig.browserConfig.type === appliedConfig.browserConfig.type;
      const isPassVer = isPassVersion(currentConfig.browserConfig.version as string, appliedConfig.browserConfig.version);

      passBrowserConfig = isPassType && isPassVer;
    }

    if (!appliedConfig.osConfig || !currentConfig.osConfig) {
      passOSConfig = true;
    } else {
      const isPassType = currentConfig.osConfig.type === appliedConfig.osConfig.type;
      const isPassVer = isPassVersion(currentConfig.osConfig.version as string, appliedConfig.osConfig.version);

      passOSConfig = isPassType && isPassVer;
    }

    if (passAppConfig && passBrowserConfig && passOSConfig) {
      passList.push(key);
    }
  });

  return passList;
}

function isPassVersion (versionStr: string, versionCondition?: string) { // todo: check if has case versionStr = undefined?
  const versionArr = versionStr.split('.');

  if (!versionCondition) {
    return true;
  }

  if (versionCondition.includes('>=')) {
    const versionConditionStr = versionCondition.replace('>=', '').trim();
    const versionConditionArr = versionConditionStr.split('.'); // todo: map(Number) instead of parseInt later

    if (versionConditionStr === versionStr) {
      return true;
    }

    for (let i = 0; i < versionArr.length; i++) {
      if (parseInt(versionArr[i]) < parseInt(versionConditionArr[i])) {
        return false;
      }

      if (parseInt(versionArr[i]) > parseInt(versionConditionArr[i])) {
        return true;
      }
    }

    return true;
  }

  if (versionCondition.includes('>')) {
    const versionConditionArr = versionCondition.replace('>', '').trim().split('.');

    for (let i = 0; i < versionArr.length; i++) {
      if (parseInt(versionArr[i]) < parseInt(versionConditionArr[i])) {
        return false;
      }

      if (parseInt(versionArr[i]) > parseInt(versionConditionArr[i])) {
        return true;
      }
    }

    return false;
  }

  // todo: also handle less use cases: <, <=

  const versionConditionStr = versionCondition.trim();

  return versionStr === versionConditionStr;
}
