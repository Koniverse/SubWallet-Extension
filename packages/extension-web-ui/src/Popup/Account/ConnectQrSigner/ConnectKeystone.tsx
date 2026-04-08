// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DefaultLogosMap from '@subwallet/extension-web-ui/assets/logo';
import ConnectQrSigner from '@subwallet/extension-web-ui/Popup/Account/ConnectQrSigner/index';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps;

const Component: React.FC<ThemeProps> = () => {
  const { t } = useTranslation();

  return (
    <ConnectQrSigner
      deviceName={t('ui.CONNECT_KEYSTONE.Popup.Account.ConnectQrSigner.ConnectKeystone.keystone')}
      instructionUrl={'https://docs.subwallet.app/main/extension-user-guide/account-management/connect-keystone-device'}
      logoUrl={DefaultLogosMap.keystone}
      subTitle={t('ui.CONNECT_KEYSTONE.Popup.Account.ConnectQrSigner.ConnectKeystone.openSoftwareWalletSectionOnYourKeystoneAndChooseSubwallet')}
      title={t('ui.CONNECT_KEYSTONE.Popup.Account.ConnectQrSigner.ConnectKeystone.connectKeystoneDevice')}
    />
  );
};

const ConnectKeystone = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});

export default ConnectKeystone;
