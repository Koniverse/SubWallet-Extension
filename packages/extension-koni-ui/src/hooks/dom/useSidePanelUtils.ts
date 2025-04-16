// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Bowser from 'bowser';
import { useCallback, useMemo } from 'react';

export default function useSidePanelUtils () {
  const isSidePanelSupported = useMemo((): boolean => {
    const result = Bowser.getParser(window.navigator.userAgent).getResult();

    // temporary solution for detecting brave
    // @ts-ignore
    const isBrave = !!window.navigator.brave;

    return (
      !isBrave && ['chrome', 'microsoft edge'].includes(result.browser.name?.toLowerCase() || '') &&
      result.platform.type === 'desktop'
    );
  }, []);

  const openSidePanel = useCallback(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      if (tab) {
        const windowId = tab.windowId;

        chrome.sidePanel.open({ windowId: windowId }).catch((err: Error) => {
          console.log('Error occurred opening side panel', err);
        });
      }
    });
  }, []);

  const closeSidePanel = useCallback(() => {
    window.close();
  }, []);

  return useMemo(() => ({
    isSidePanelSupported,
    openSidePanel,
    closeSidePanel
  }), [isSidePanelSupported, closeSidePanel, openSidePanel]);
}
