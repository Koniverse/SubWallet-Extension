// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { AuthUrlInfo, AuthUrls } from '@subwallet/extension-base/services/request-service/types';
import { stripUrl } from '@subwallet/extension-base/utils';
import { BasicInputEvent, ChainSelector } from '@subwallet/extension-koni-ui/components';
import { AUTHORIZE_TYPE_SUPPORTS_NETWORK_SWITCH, SWITCH_CURRENT_NETWORK_AUTHORIZE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { switchCurrentNetworkAuthorization } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ChainItemType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

type Props = ThemeProps & {
  authUrlInfo: AuthUrlInfo;
  onComplete: (authInfo: AuthUrls) => void;
}

const networkSelectModalId = SWITCH_CURRENT_NETWORK_AUTHORIZE_MODAL;
const networkTypeSupported = AUTHORIZE_TYPE_SUPPORTS_NETWORK_SWITCH;

function Component ({ authUrlInfo, className, onComplete }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [networkSelected, setNetworkSelected] = useState('');
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);

  useEffect(() => {
    const currentNetwork = authUrlInfo.currentNetworkMap[networkTypeSupported];

    if (currentNetwork) {
      setNetworkSelected(currentNetwork);
    }
  }, [authUrlInfo.currentNetworkMap]);

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
    if (networkSelected !== authUrlInfo.currentNetworkMap[networkTypeSupported]) {
      const url = stripUrl(authUrlInfo.url);

      setLoading(true);
      switchCurrentNetworkAuthorization({ networkKey: networkSelected, authSwitchNetworkType: networkTypeSupported, url }).then(({ list }) => {
        onComplete(list);
      }).catch(console.error).finally(() => {
        setNetworkSelected('');
        setLoading(false);
      });
    }
  }, [authUrlInfo, networkSelected, onComplete]);

  return (
    <ChainSelector
      className={className}
      id={networkSelectModalId}
      items={networkItems}
      loading={loading}
      onChange={onSelectNetwork}
      title={t('Select network')}
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
