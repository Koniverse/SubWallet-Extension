// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CREATE_ACCOUNT_MODAL, NEW_MULTISIG_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

import AccountTypeModal from './AccountTypeModal';

type Props = ThemeProps;

const Component: React.FC<Props> = ({ className }: Props) => {
  const { t } = useTranslation();

  return (
    <AccountTypeModal
      className={className}
      id={NEW_MULTISIG_MODAL}
      label={t('ui.ACCOUNT.components.Modal.Account.NewMultisig.confirm')}
      previousId={CREATE_ACCOUNT_MODAL}
      url={'/accounts/new-multisig-account'}
    />
  );
};

const NewMultisigModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {};
});

export default NewMultisigModal;
