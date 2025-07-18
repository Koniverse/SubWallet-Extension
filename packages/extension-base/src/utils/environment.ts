// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isSupportWindow } from '@subwallet/extension-base/utils/mv3';
import Bowser from 'bowser';

import { EnvironmentSupport, RuntimeEnvironment, RuntimeEnvironmentInfo, TargetEnvironment } from '../background/KoniTypes';
import { SW_EXTERNAL_SERVICES_API } from '../constants';
import { ProxyServiceRoute } from '../types/environment';

function detectRuntimeEnvironment (): RuntimeEnvironmentInfo {
  if (isSupportWindow && typeof document !== 'undefined') {
    // Web environment
    return {
      environment: RuntimeEnvironment.Web,
      version: navigator?.userAgent,
      host: window.location?.host,
      protocol: window.location?.protocol
    };
  } else if (typeof self !== 'undefined' && typeof importScripts !== 'undefined') {
    // Service Worker environment
    return {
      environment: RuntimeEnvironment.ServiceWorker,
      version: navigator?.userAgent,
      host: self.location?.host,
      protocol: 'https'
    };
  } else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    // Node.js environment
    return {
      environment: RuntimeEnvironment.Node,
      version: process.versions.node
    };
  } else if (typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined') {
    // Extension environment (Chrome)
    return {
      environment: RuntimeEnvironment.ExtensionChrome,
      version: chrome.runtime.getManifest().version,
      host: window.location?.host,
      protocol: window.location?.protocol
    };
  } else if (typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined') {
    // Extension environment (Firefox)
    return {
      environment: RuntimeEnvironment.ExtensionFirefox,
      version: browser.runtime.getManifest().version,
      host: window.location?.host,
      protocol: window.location?.protocol
    };
    // @ts-ignore
  } else if (typeof WorkerGlobalScope !== 'undefined') {
    // Web Worker environment
    return {
      environment: RuntimeEnvironment.WebWorker,
      version: ''
    };
  } else {
    // Unknown environment
    return {
      environment: RuntimeEnvironment.Unknown,
      version: ''
    };
  }
}

export const RuntimeInfo: RuntimeEnvironmentInfo = detectRuntimeEnvironment();

// Todo: Support more in backend case
export const BowserParser = Bowser.getParser(typeof navigator !== 'undefined' ? navigator?.userAgent + '' : '');
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const isBrave = navigator.brave !== undefined && navigator.brave.isBrave.name === 'isBrave';
export const isFirefox = BowserParser.getBrowserName(true) === 'firefox';
export const browserName = isBrave ? 'brave' : BowserParser.getBrowserName(true);
export const browserVersion = BowserParser.getBrowserVersion();
export const osName = BowserParser.getOSName();
export const osVersion = BowserParser.getOSVersion();
export const isMobile = BowserParser.getPlatform().type === 'mobile';
export const platformType = BowserParser.getPlatform().type;
export const platformModel = BowserParser.getPlatform().model;

export const TARGET_ENV = (process.env.TARGET_ENV || 'extension') as TargetEnvironment;
export const targetIsExtension = TARGET_ENV === 'extension';
export const targetIsWeb = TARGET_ENV === 'webapp';
export const targetIsMobile = TARGET_ENV === 'mobile';

export const MODULE_SUPPORT: EnvironmentSupport = {
  MANTA_ZK: false
};

enum HEADERS {
  PLATFORM = 'Platform'
}

function formatExternalServiceApi (url: string, isTestnet?: boolean): string {
  if (isTestnet === true) {
    return `${url}/testnet`;
  }

  if (isTestnet === false) {
    return `${url}/mainnet`;
  }

  return url;
}

export async function fetchFromProxyService (service: ProxyServiceRoute, path: string, options: RequestInit, isTestnet?: boolean) {
  const baseUrl = formatExternalServiceApi(`${SW_EXTERNAL_SERVICES_API}${service}`, isTestnet);
  const url = `${baseUrl}${path}`;
  const headers = {
    [HEADERS.PLATFORM]: TARGET_ENV,
    ...(options.headers || {})
  };

  return fetch(url, {
    ...options,
    headers
  });
}
