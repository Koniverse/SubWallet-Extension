// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AuthUrlInfo } from '@subwallet/extension-base/services/request-service/types';
import { ActionItemType, ActionModal } from '@subwallet/extension-koni-ui/components';
import { DAPP_CONFIGURATION_MODAL } from '@subwallet/extension-koni-ui/constants';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { changeAuthorization, forgetSite, toggleAuthorization } from '@subwallet/extension-koni-ui/messaging';
import { updateAuthUrls } from '@subwallet/extension-koni-ui/stores/utils';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import { ArrowsLeftRight, Plugs, PlugsConnected, ShieldCheck, ShieldSlash, X } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  authInfo: AuthUrlInfo;
}

const modalId = DAPP_CONFIGURATION_MODAL;

function Component ({ authInfo, className = '' }: Props): React.ReactElement<Props> {
  const { switchNetworkAuthorizeModal } = useContext(WalletModalContext);
  const { inactiveModal } = useContext(ModalContext);
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;

  const onCloseActionModal = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const actions: ActionItemType[] = useMemo(() => {
    const isAllowed = authInfo.isAllowed;
    const isEvmAuthorize = authInfo.accountAuthTypes.includes('evm');

    const result: ActionItemType[] = [
      {
        key: isAllowed ? 'block' : 'unblock',
        icon: isAllowed ? ShieldSlash : ShieldCheck,
        iconBackgroundColor: isAllowed ? token.colorError : token.colorSuccess,
        title: isAllowed ? t('Block this site') : t('Unblock this site'),
        onClick: () => {
          toggleAuthorization(authInfo.id)
            .then(({ list }) => {
              updateAuthUrls(list);
            })
            .catch(console.error);
          onCloseActionModal();
        }
      },
      {
        key: 'forget-site',
        icon: X,
        iconBackgroundColor: token.colorWarning,
        title: t('Forget this site'),
        onClick: () => {
          forgetSite(authInfo.id, updateAuthUrls).catch(console.error);
          onCloseActionModal();
        }
      }
    ];

    if (isAllowed) {
      result.push(
        {
          key: 'disconnect-all',
          icon: Plugs,
          iconBackgroundColor: token['gray-3'],
          title: t('Disconnect all accounts'),
          onClick: () => {
            changeAuthorization(false, authInfo.id, updateAuthUrls).catch(console.error);
            onCloseActionModal();
          }
        },
        {
          key: 'connect-all',
          icon: PlugsConnected,
          iconBackgroundColor: token['green-6'],
          title: t('Connect all accounts'),
          onClick: () => {
            changeAuthorization(true, authInfo.id, updateAuthUrls).catch(console.error);
            onCloseActionModal();
          }
        }
      );

      if (isEvmAuthorize) {
        result.push({
          key: 'switch-network',
          icon: ArrowsLeftRight,
          iconBackgroundColor: token['geekblue-6'],
          title: t('Switch network'),
          onClick: () => {
            switchNetworkAuthorizeModal.open(
              {
                authUrlInfo: authInfo,
                onComplete: (list) => {
                  updateAuthUrls(list);
                  onCloseActionModal();
                }
              }
            );
          }
        });
      }
    }

    return result;
  }, [authInfo, onCloseActionModal, switchNetworkAuthorizeModal, t, token]);

  return (
    <ActionModal
      actions={actions}
      className={`${className} action-modal`}
      id={modalId}
      onCancel={onCloseActionModal}
      title={t('dApp configuration')}
    />
  );
}

export const DAppConfigurationModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.__action-item + .__action-item': {
      marginTop: token.marginXS
    },

    '&.action-modal': {
      '.__action-item.block .ant-setting-item-name': {
        color: token.colorError
      }
    }
  });
});
