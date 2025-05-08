// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { AccountAuthType } from '@subwallet/extension-base/background/types';
import { AuthUrlInfo, AuthUrls } from '@subwallet/extension-base/services/request-service/types';
import { AccountChainType } from '@subwallet/extension-base/types';
import { stripUrl } from '@subwallet/extension-base/utils';
import { BasicInputEvent, ChainSelector } from '@subwallet/extension-koni-ui/components';
import { SELECT_NETWORK_TYPE_AUTHORIZE_MODAL, SWITCH_CURRENT_NETWORK_AUTHORIZE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { switchCurrentNetworkAuthorization } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ChainItemType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getChainTypeLogoMap } from '@subwallet/extension-koni-ui/utils';
import { ModalContext, SettingItem, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { Context, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styled, { ThemeContext } from 'styled-components';

type Props = ThemeProps & {
  authUrlInfo: AuthUrlInfo;
  onComplete: (authInfo: AuthUrls) => void;
}

const authModalId = SELECT_NETWORK_TYPE_AUTHORIZE_MODAL;
const chainSelectModalId = SWITCH_CURRENT_NETWORK_AUTHORIZE_MODAL;

type AuthTypeItemType = {
  title: string;
  img: string;
  key: string;
  onClick: () => void;
}

const AuthChainTypeMap: Record<AccountAuthType, { chainInfoKey: keyof _ChainInfo; chainType: AccountChainType }> = {
  substrate: { chainInfoKey: 'substrateInfo', chainType: AccountChainType.SUBSTRATE },
  evm: { chainInfoKey: 'evmInfo', chainType: AccountChainType.ETHEREUM },
  cardano: { chainInfoKey: 'cardanoInfo', chainType: AccountChainType.CARDANO },
  ton: { chainInfoKey: 'tonInfo', chainType: AccountChainType.TON }
};

function Component ({ authUrlInfo, className, onComplete }: Props): React.ReactElement<Props> {
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { t } = useTranslation();
  const [chainItems, setChainItems] = useState<ChainItemType[]>([]);
  const [chainTypeSelected, setChainTypeSelected] = useState<AccountAuthType | null>(null);
  const [loading, setLoading] = useState(false);
  const [chainSelected, setChainSelected] = useState('');
  const logoMap = useContext<Theme>(ThemeContext as Context<Theme>).logoMap;
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);

  const chainTypeLogoMap = useMemo(() => {
    return getChainTypeLogoMap(logoMap);
  }, [logoMap]);

  const onCancel = useCallback(() => {
    inactiveModal(authModalId);
  }, [inactiveModal]);

  const selectChainType = useCallback((chainType: AccountAuthType) => {
    setChainTypeSelected(chainType);

    inactiveModal(authModalId);

    const currentNetwork = authUrlInfo.currentNetworkMap[chainType];

    if (currentNetwork) {
      setChainSelected(currentNetwork);
    }

    const chainItemTypes = Object.values(chainInfoMap)
      .reduce<ChainItemType[]>((acc, chainInfo) => {
      if (chainInfo[AuthChainTypeMap[chainType].chainInfoKey]) {
        acc.push({ name: chainInfo.name, slug: chainInfo.slug });
      }

      return acc;
    }, []);

    setChainItems(chainItemTypes);
    activeModal(chainSelectModalId);
  }, [activeModal, authUrlInfo.currentNetworkMap, chainInfoMap, inactiveModal]);

  const chainTypeItems = useMemo<AuthTypeItemType[]>(() =>
    authUrlInfo.accountAuthTypes
      .filter((type) => authUrlInfo.currentNetworkMap[type])
      .map((authType) => ({
        title: authType.charAt(0).toUpperCase() + authType.slice(1),
        img: chainTypeLogoMap[AuthChainTypeMap[authType].chainType],
        key: authType,
        onClick: () => selectChainType(authType)
      }))
  , [authUrlInfo.accountAuthTypes, authUrlInfo.currentNetworkMap, chainTypeLogoMap, selectChainType]);

  const onSelectChain = useCallback((event: BasicInputEvent) => {
    setChainSelected(event.target.value);
  }, []);

  useEffect(() => {
    if (chainTypeSelected && chainSelected !== authUrlInfo.currentNetworkMap[chainTypeSelected]) {
      const url = stripUrl(authUrlInfo.url);

      setLoading(true);
      switchCurrentNetworkAuthorization({ networkKey: chainSelected, authSwitchNetworkType: chainTypeSelected, url }).then(({ list }) => {
        onComplete(list);
      }).catch(console.error).finally(() => {
        setChainTypeSelected(null);
        setChainItems([]);
        setChainSelected('');
        setLoading(false);
      });
    }
  }, [authUrlInfo, chainSelected, chainTypeSelected, onComplete]);

  return (
    <>
      <SwModal
        className={CN(className, 'auth-type-modal')}
        id={authModalId}
        onCancel={onCancel}
        title={t('Select Network Type')}
      >
        <div className={'__items-container'}>
          {
            chainTypeItems.map((item) => {
              return (
                <SettingItem
                  className={`__action-item ${item.key}`}
                  key={item.key}
                  leftItemIcon={ <img
                    alt='Network type'
                    className={'__item-chain-type-logo'}
                    src={item.img}
                  />}
                  name={item.title}
                  onPressItem={item.onClick}
                />
              );
            })
          }
        </div>
      </SwModal>

      <ChainSelector
        id={chainSelectModalId}
        items={chainItems}
        loading={loading}
        onChange={onSelectChain}
        title={t('Select chain')}
        value={chainSelected}
      />
    </>

  );
}

const SwitchNetworkAuthorizeModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
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
