// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainConnectionStatus } from '@subwallet/extension-base/services/chain-service/types';
import { ChainInfoWithStateAndStatus } from '@subwallet/extension-koni-ui/hooks/chain/useChainInfoWithStateAndStatus';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { updateChainActiveState } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, Switch } from '@subwallet/react-ui';
import { PencilSimpleLine } from 'phosphor-react';
import React, { useCallback, useEffect, useState } from 'react';
import { NavigateFunction } from 'react-router';
import styled from 'styled-components';

interface Props extends ThemeProps {
  chainInfo: ChainInfoWithStateAndStatus,
  showDetailNavigation?: boolean,
  navigate?: NavigateFunction
}

function Component ({ chainInfo, className = '', navigate, showDetailNavigation }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const showNotification = useNotification();
  const [loading, setLoading] = useState(false);

  const onSwitchChainState = useCallback((checked: boolean, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading) {
      setLoading(true);
      updateChainActiveState(chainInfo.slug, checked)
        .then((result) => {
          setLoading(false);

          if (!result) {
            showNotification({
              message: t('ui.components.ChainItemFooter.error'),
              type: 'error'
            });
          }
        })
        .catch(() => {
          showNotification({
            message: t('ui.components.ChainItemFooter.error'),
            type: 'error'
          });
          setLoading(false);
        });
    }
  }, [chainInfo.slug, loading, showNotification, t]);

  const onClick = useCallback(() => {
    navigate && navigate('/settings/chains/detail', { state: chainInfo.slug });
  }, [chainInfo, navigate]);

  useEffect(() => {
    if (chainInfo.connectionStatus === _ChainConnectionStatus.CONNECTED && !chainInfo.active) {
      updateChainActiveState(chainInfo.slug, true).catch(() => {
        // skip error since we will try to update active state again when user click the switch
      });
    }
  }, [chainInfo, t]);

  return (
    <div className={`${className}`}>
      <Switch
        checked={chainInfo.active}
        loading={loading}
        onClick={onSwitchChainState}
      />
      {
        showDetailNavigation && <Button
          icon={<Icon
            phosphorIcon={PencilSimpleLine}
            size='sm'
            type='phosphor'
          />}
          onClick={onClick}
          size={'xs'}
          type={'ghost'}
        />
      }
    </div>
  );
}

const ChainItemFooter = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    alignItems: 'center'
  });
});

export default ChainItemFooter;
