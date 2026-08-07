// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { _ChainConnectionStatus } from '@subwallet/extension-base/services/chain-service/types';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { enableChainWithPriorityAssets } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Button } from '@subwallet/react-ui';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function useChainChecker () {
  const { t } = useTranslation();
  const { chainInfoMap, chainStateMap, chainStatusMap } = useSelector((root: RootState) => root.chainStore);
  const notify = useNotification();
  const [connectingChain, setConnectingChain] = useState<string | null>(null);

  useEffect(() => {
    if (connectingChain && chainStatusMap[connectingChain]?.connectionStatus === _ChainConnectionStatus.CONNECTED) {
      const chainInfo = chainInfoMap[connectingChain];

      notify({ message: t('ui.NETWORK.hook.chain.useChainChecker.chainIsConnected', { replace: { name: chainInfo?.name } }), type: NotificationType.SUCCESS, duration: 3 });
      setConnectingChain(null);
    }
  }, [connectingChain, chainInfoMap, chainStateMap, notify, t, chainStatusMap]);

  const ensureChainEnable = useCallback((chain: string) => {
    const chainState = chainStateMap[chain];
    const chainInfo = chainInfoMap[chain];
    const chainStatus = chainStatusMap[chain];

    if (chainState) {
      if (!chainState.active) {
        const message = t('ui.NETWORK.hook.chain.useChainChecker.confirmTurnOnFeature', { replace: { name: chainInfo?.name } });

        const _onEnabled = () => {
          enableChainWithPriorityAssets(chain).then(() => {
            const chainInfo = chainInfoMap[chain];

            setConnectingChain(chain);
            notify({ message: t('ui.NETWORK.hook.chain.useChainChecker.chainIsConnecting', { replace: { name: chainInfo?.name } }), duration: 1.5, type: 'warning' });
          }).catch(console.error);
        };

        const btn = <Button
          // eslint-disable-next-line react/jsx-no-bind
          onClick={_onEnabled}
          schema={'warning'}
          size={'xs'}
        >
          {t('ui.NETWORK.hook.chain.useChainChecker.turnItOn')}
        </Button>;

        notify({
          message,
          type: NotificationType.WARNING,
          duration: 3,
          btn
        });
      } else if (chainStatus?.connectionStatus === _ChainConnectionStatus.DISCONNECTED) {
        const message = t('ui.NETWORK.hook.chain.useChainChecker.chainIsDisconnected', { replace: { name: chainInfo?.name } });

        notify({
          message,
          type: NotificationType.ERROR,
          duration: 3
        });
      }
    }
  }, [chainInfoMap, chainStateMap, chainStatusMap, notify, t]);

  return ensureChainEnable;
}
