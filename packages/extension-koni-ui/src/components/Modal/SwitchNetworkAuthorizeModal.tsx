// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { AuthUrlInfo, AuthUrls } from '@subwallet/extension-base/services/request-service/types';
import { createLogger } from '@subwallet/extension-base/utils/logger';
import { stripUrl } from '@subwallet/extension-base/utils';
import { BasicInputEvent, ChainSelector } from '@subwallet/extension-koni-ui/components';
import { AUTHORIZE_TYPE_SUPPORTS_NETWORK_SWITCH, SWITCH_CURRENT_NETWORK_AUTHORIZE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetCurrentAuth, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { switchCurrentNetworkAuthorization } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ChainItemType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import useNotification from '../../hooks/common/useNotification';

const logger = createLogger('SwitchNetworkAuthorizeModal');

export interface SwitchNetworkAuthorizeModalProps {
  authUrlInfo: AuthUrlInfo;
  onComplete: (authInfo: AuthUrls) => void;
  needsTabAuthCheck?: boolean;
}

type Props = ThemeProps & SwitchNetworkAuthorizeModalProps &{
  onCancel: () => void;
};

const networkSelectModalId = SWITCH_CURRENT_NETWORK_AUTHORIZE_MODAL;
const networkTypeSupported = AUTHORIZE_TYPE_SUPPORTS_NETWORK_SWITCH;

function Component ({ authUrlInfo, className, needsTabAuthCheck, onCancel, onComplete }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [networkSelected, setNetworkSelected] = useState(authUrlInfo.currentNetworkMap[networkTypeSupported] || '');
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);
  const currentAuthByActiveTab = useGetCurrentAuth();
  const showNotification = useNotification();

  const networkItems = useMemo(() => {
    return Object.values(chainInfoMap)
      .reduce<ChainItemType[]>((acc, chainInfo) => {
      if (_isChainEvmCompatible(chainInfo) && networkTypeSupported === 'evm') {
        acc.push({ name: chainInfo.name, slug: chainInfo.slug });
      }

      return acc;
    }, []);
  }, [chainInfoMap]);

  const onSelectNetwork = useCallback((event: BasicInputEvent) => {
    setNetworkSelected(event.target.value);
  }, []);

  useEffect(() => {
    let isSync = true;

    if (networkSelected && networkSelected !== authUrlInfo.currentNetworkMap[networkTypeSupported]) {
      const url = stripUrl(authUrlInfo.url);

      if (isSync) {
        setLoading(true);
      }

      switchCurrentNetworkAuthorization({ networkKey: networkSelected, authSwitchNetworkType: networkTypeSupported, url }).then(({ list }) => {
        showNotification({
          message: t('ui.DAPP.components.Modal.SwitchNetworkAuthorize.switchedNetworkSuccessfully')
        });
        onComplete(list);
      }).catch((error) => logger.error('Failed to switch current network authorization', error)).finally(() => {
        onCancel();

        if (isSync) {
          setNetworkSelected('');
          setLoading(false);
        }
      });
    }

    return () => {
      isSync = false;
    };
  }, [authUrlInfo, networkSelected, onCancel, onComplete, showNotification, t]);

  useEffect(() => {
    if (needsTabAuthCheck && currentAuthByActiveTab && currentAuthByActiveTab.id !== authUrlInfo.id) {
      onCancel();
    }
  }, [authUrlInfo.id, currentAuthByActiveTab, needsTabAuthCheck, onCancel]);

  return (
    <ChainSelector
      className={className}
      id={networkSelectModalId}
      items={networkItems}
      loading={loading}
      onChange={onSelectNetwork}
      title={t('ui.DAPP.components.Modal.SwitchNetworkAuthorize.selectNetwork')}
      value={networkSelected}
    />
  );
}

const SwitchNetworkAuthorizeModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({

    '&.chain-selector-input': {
      display: 'none'
    },

    '.__action-item + .__action-item': {
      marginTop: token.marginXS
    },

    '.__item-chain-type-logo': {
      height: 20,
      width: 20
    }
  });
});

export default SwitchNetworkAuthorizeModal;
