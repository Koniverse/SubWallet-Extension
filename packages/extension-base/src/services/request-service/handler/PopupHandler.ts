// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { withErrorLog } from '@subwallet/extension-base/background/handlers/helpers';
import { BrowserConfirmationType, RequestSettingsType } from '@subwallet/extension-base/background/KoniTypes';
import RequestService from '@subwallet/extension-base/services/request-service';
import { DEFAULT_NOTIFICATION_TYPE } from '@subwallet/extension-base/services/setting-service/constants';
import { osName } from '@subwallet/extension-base/utils';

const NOTIFICATION_URL = chrome.runtime.getURL('notification.html');

const extraHeight = osName === 'Linux' ? 0 : 28;
const extraWidth = osName === 'Windows' ? 16 : 0;

const POPUP_WINDOW_OPTS: chrome.windows.CreateData = {
  focused: true,
  height: 600 + extraHeight,
  type: 'popup',
  url: NOTIFICATION_URL,
  width: 390 + extraWidth
};

const NORMAL_WINDOW_OPTS: chrome.windows.CreateData = {
  focused: true,
  type: 'normal',
  url: NOTIFICATION_URL
};

export async function openPopup (url: string) {
  const win = await chrome.windows.getCurrent();
  const popupOptions = { ...POPUP_WINDOW_OPTS, url };

  if (win) {
    popupOptions.left = (win.left || 0) + (win.width || 0) - (popupOptions.width || 0) - 20;
    popupOptions.top = (win.top || 0) + 110;
  }

  await chrome.windows.create(popupOptions);
}

// Chrome dismisses the toolbar popup the moment it loses focus, and it draws its passkey prompt in
// the parent browser window - so by the time a passkey unlock lands, the popup that asked for it is
// already gone and the wallet sits there waiting for another click on the toolbar icon. Reopening it
// has to be driven from here for that same reason: the page that would otherwise do it is dead.
const FOCUS_SETTLE_TIME = 250;

function delay (ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The toolbar popup is the one wallet surface that is not a tab. The expanded view and the dapp
// confirmation window are both index.html or notification.html inside one, and the side panel gives
// itself away by its url - none of them want the toolbar popup opened on top of them.
export function isActionPopupSender (port: chrome.runtime.Port): boolean {
  const { tab, url } = port.sender || {};

  return !tab && !!url?.includes('index.html');
}

export async function reopenActionPopup (): Promise<void> {
  if (!chrome.action?.openPopup) {
    return;
  }

  const windows = await chrome.windows.getAll({ windowTypes: ['normal'] });
  const target = windows.find(({ focused }) => focused) || windows[windows.length - 1];

  if (!target?.id) {
    return;
  }

  // The browser only opens the popup for an active window, and the window manager grants focus
  // asynchronously, so it needs a moment before the request is accepted.
  await chrome.windows.update(target.id, { focused: true });
  await delay(FOCUS_SETTLE_TIME);

  // Deliberately not awaited: this promise settles when the popup *closes*, not when it opens, so
  // waiting on it would hang here until the user is done with the wallet.
  chrome.action.openPopup({ windowId: target.id })
    .catch((error) => console.warn('Unable to reopen the extension popup', error));
}

export default class PopupHandler {
  readonly #requestService: RequestService;
  #notification: BrowserConfirmationType = DEFAULT_NOTIFICATION_TYPE;
  #windows: number[] = [];

  constructor (requestService: RequestService) {
    this.#requestService = requestService;

    const updateNotification = (rs: RequestSettingsType) => {
      this.#notification = rs.browserConfirmationType;
    };

    requestService.settingService.getSettings(updateNotification);
    requestService.settingService.getSubject().subscribe({
      next: updateNotification
    });
  }

  public updateIconV2 (shouldClose?: boolean): void {
    const numRequests = this.#requestService.numRequests;
    const text = numRequests > 0 ? numRequests.toString() : '';

    withErrorLog(() => chrome.action?.setBadgeText({ text }));

    if (shouldClose && text === '') {
      this.popupClose();
    }
  }

  public get popup () {
    return this.#windows;
  }

  public popupClose (): void {
    this.#windows.forEach((id: number) =>
      withErrorLog(() => chrome.windows.remove(id))
    );
    this.#windows = [];
  }

  public popupOpen (): void {
    if (this.#notification !== 'extension') {
      chrome.windows.getCurrent((win) => {
        const popupOptions = { ...(
          this.#notification === 'window'
            ? {
              ...NORMAL_WINDOW_OPTS,
              width: win.width,
              height: win.height
            }
            : POPUP_WINDOW_OPTS
        ) };

        if (win) {
          popupOptions.left = (win.left || 0) + (win.width || 0) - (popupOptions.width || 0) - 20;
          popupOptions.top = (win.top || 0) + 80;
        }

        chrome.windows.create(popupOptions
          , (window): void => {
            if (window) {
              this.#windows.push(window.id || 0);
            }
          }
        );
      });
    }
  }
}
