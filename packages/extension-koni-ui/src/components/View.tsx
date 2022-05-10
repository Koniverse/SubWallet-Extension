// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import React, { useCallback, useEffect, useState } from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

import { subscribeSettings } from '@polkadot/extension-koni-ui/messaging';

// FIXME We should not import from index when this one is imported there as well
import { AvailableThemes, chooseTheme, Main, themes, ThemeSwitchContext } from '.';

interface Props {
  children: React.ReactNode;
  className?: string;
}

function View ({ children, className }: Props): React.ReactElement<Props> {
  const [theme, setTheme] = useState(chooseTheme());

  const switchTheme = useCallback(
    (theme: AvailableThemes): void => {
      localStorage.setItem('theme', theme);
      setTheme(theme);
    },
    []
  );

  useEffect(() => {
    subscribeSettings(null, (data) => {
      if (data.theme !== localStorage.getItem('theme')) {
        switchTheme(data.theme);
      }
    }).then((data) => {
      if (data.theme !== localStorage.getItem('theme')) {
        switchTheme(data.theme);
      }
    }).catch((e) => console.log('There is problem when subscribeSettings', e));
  }, [switchTheme]);

  const _theme = themes[theme];

  return (
    <ThemeSwitchContext.Provider value={switchTheme}>
      <ThemeProvider theme={_theme}>
        <BodyTheme theme={_theme} />
        <Main className={className}>
          {children}
        </Main>
      </ThemeProvider>
    </ThemeSwitchContext.Provider>
  );
}

const BodyTheme = createGlobalStyle<ThemeProps>`
  body {
    background-color: ${({ theme }: ThemeProps): string => theme.bodyColor};
  }

  html {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export default View;
