// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

export default function useExtensionDisplayModes () {
  return useMemo(() => {
    const isSidePanelMode = window.location.pathname.includes('side-panel.html');
    const isPopupMode = !isSidePanelMode && window.innerWidth <= 400;
    const isExpanseMode = !isSidePanelMode && !isPopupMode;

    return {
      isPopupMode,
      isExpanseMode,
      isSidePanelMode
    };
  }, []);
}
