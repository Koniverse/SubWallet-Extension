// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

export const useGetCurrentTab = () => {
  const [tab, setTab] = useState<chrome.tabs.Tab | undefined>(undefined);

  useEffect(() => {
    const updateTab = () => {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        setTab(tabs[0]);
      });
    };

    updateTab();

    chrome.tabs.onActivated.addListener(updateTab);
    chrome.windows.onFocusChanged.addListener(updateTab);

    const onTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tabInfo: chrome.tabs.Tab) => {
      if (changeInfo.status === 'complete' || changeInfo.url) {
        updateTab();
      }
    };

    chrome.tabs.onUpdated.addListener(onTabUpdated);

    return () => {
      chrome.tabs.onActivated.removeListener(updateTab);
      chrome.windows.onFocusChanged.removeListener(updateTab);
      chrome.tabs.onUpdated.removeListener(onTabUpdated);
    };
  }, []);

  return tab;
};
