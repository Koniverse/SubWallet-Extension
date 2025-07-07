// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxy } from '@subwallet/extension-base/types';
import { AccountChainAddressList, CloseIcon } from '@subwallet/extension-koni-ui/components';
import { ACCOUNT_CHAIN_ADDRESSES_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretLeft } from 'phosphor-react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  accountProxy: AccountProxy;
  onCancel: VoidFunction;
  onBack?: VoidFunction;
};

const modalId = ACCOUNT_CHAIN_ADDRESSES_MODAL;

const Component: React.FC<Props> = ({ accountProxy, className, onBack, onCancel }: Props) => {
  const { t } = useTranslation();

  const accountChainAddressListModalProps = useMemo(() => ({
    onCancel
  }), [onCancel]);

  return (
    <SwModal
      className={CN(className)}
      closeIcon={
        onBack
          ? (
            <Icon
              phosphorIcon={CaretLeft}
              size='md'
            />
          )
          : undefined
      }
      destroyOnClose={true}
      id={modalId}
      onCancel={onBack || onCancel}
      rightIconProps={onBack
        ? {
          icon: <CloseIcon />,
          onClick: onCancel
        }
        : undefined}
      title={t<string>('ui.Modal.Account.ChainAddresses.selectAddress')}
    >
      <AccountChainAddressList
        accountProxy={accountProxy}
        isInModal={true}
        modalProps={accountChainAddressListModalProps}
      />
    </SwModal>
  );
};

const AccountChainAddressesModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-content': {
      height: '200vh',
      overflowY: 'hidden'
    },

    '.ant-sw-list-search-input': {
      paddingBottom: token.paddingXS
    },

    '.ant-sw-modal-body': {
      paddingLeft: 0,
      paddingRight: 0
    },

    '.ant-sw-list-section': {
      height: '100%'
    }
  };
});

export default AccountChainAddressesModal;
