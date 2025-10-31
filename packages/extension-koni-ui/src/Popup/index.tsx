// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { setupApiSDK } from '@subwallet/extension-base/utils';
import { DataContextProvider } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { InjectContextProvider } from '@subwallet/extension-koni-ui/contexts/InjectContext';
import { ScannerContextProvider } from '@subwallet/extension-koni-ui/contexts/ScannerContext';
import { ThemeProvider } from '@subwallet/extension-koni-ui/contexts/ThemeContext';
import { ModalContextProvider } from '@subwallet/react-ui';
import NotificationProvider from '@subwallet/react-ui/es/notification/NotificationProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { RouterProvider } from 'react-router';

import LoadingScreen from '../components/LoadingScreen';
import { router } from './router';

// Setup API SDK before app init
setupApiSDK();
const queryClient = new QueryClient();

export default function Popup (): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <DataContextProvider>
        <ThemeProvider>
          <ModalContextProvider>
            <ScannerContextProvider>
              <NotificationProvider>
                <InjectContextProvider>
                  <RouterProvider
                    fallbackElement={<LoadingScreen className='root-loading' />}
                    router={router}
                  />
                </InjectContextProvider>
              </NotificationProvider>
            </ScannerContextProvider>
          </ModalContextProvider>
        </ThemeProvider>
      </DataContextProvider>
    </QueryClientProvider>
  );
}
