// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { withErrorLog } from '@subwallet/extension-base/background/handlers/helpers';
import { BrowserConfirmationType, RequestSettingsType } from '@subwallet/extension-base/background/KoniTypes';
import { PASSKEY_UNLOCK_WINDOW_FLAG } from '@subwallet/extension-base/services/keyring-service/passkeyUnlock';
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

export async function openPopup (url: string, width = 390) {
  const win = await chrome.windows.getCurrent();
  const popupOptions = { ...POPUP_WINDOW_OPTS, url, width: width + extraWidth };

  if (win) {
    popupOptions.left = (win.left || 0) + (win.width || 0) - (popupOptions.width || 0) - 20;
    popupOptions.top = (win.top || 0) + 110;
  }

  await chrome.windows.create(popupOptions);
}

// The browser renders the passkey prompt at a fixed width of its own, so the unlock window has
// to stay wider than that prompt or the browser draws it hanging over the window edge.
export const PASSKEY_UNLOCK_WINDOW_WIDTH = 540;

export async function openPasskeyUnlockWindow () {
  await openPopup(`${chrome.runtime.getURL('index.html')}#/keyring/login?${PASSKEY_UNLOCK_WINDOW_FLAG}=true`, PASSKEY_UNLOCK_WINDOW_WIDTH);
}

// The window manager grants focus asynchronously, so the browser needs a moment before it sees
// the target window as active.
const FOCUS_SETTLE_TIME = 250;
// openPopup() only settles once the popup closes again, so a rejection is the only signal there
// is: anything still pending after this long has opened. A refusal comes back from the browser
// process right away, so this only has to outlast that round trip.
const POPUP_OPEN_TIMEOUT = 300;

// Long enough for the answer to reach the window that is about to be closed.
const WINDOW_CLOSE_DELAY = 50;

function delay (ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The wide window only exists to host the browser prompt, so the wallet itself goes back to the
// toolbar popup as soon as the keyring is unlocked. The browser only opens that popup for an
// active window and dismisses it on any focus change, so the whole sequence is driven from here
// rather than from the page that is about to disappear.
export async function openDefaultPopup (unlockWindowId?: number): Promise<boolean> {
  const windows = await chrome.windows.getAll({ windowTypes: ['normal'] });
  const target = windows.find(({ focused }) => focused) || windows[windows.length - 1];

  if (chrome.action?.openPopup && target?.id) {
    await chrome.windows.update(target.id, { focused: true });
    await delay(FOCUS_SETTLE_TIME);

    const opened = await Promise.race([
      chrome.action.openPopup({ windowId: target.id }).then(() => true, (error) => {
        console.warn('Unable to open the extension popup', error);

        return false;
      }),
      delay(POPUP_OPEN_TIMEOUT).then(() => true)
    ]);

    if (opened) {
      // The unlock window is no longer focused, so closing it leaves the popup alone - but it is
      // also the caller, so let the answer go out before its port disappears.
      unlockWindowId && setTimeout(() => {
        chrome.windows.remove(unlockWindowId).catch(console.error);
      }, WINDOW_CLOSE_DELAY);

      return true;
    }
  }

  // The browser refused the popup, so keep the wallet in the window it is already showing and just
  // shrink it back to the size the popup would have had.
  if (unlockWindowId) {
    await chrome.windows.update(unlockWindowId, {
      width: POPUP_WINDOW_OPTS.width,
      height: POPUP_WINDOW_OPTS.height,
      focused: true
    }).catch(console.error);
  }

  return false;
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
