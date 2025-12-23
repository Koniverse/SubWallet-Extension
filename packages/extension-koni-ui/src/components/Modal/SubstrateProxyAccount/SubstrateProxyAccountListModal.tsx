// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountItemWithProxyAvatar } from '@subwallet/extension-koni-ui/components';
import { SUBSTRATE_PROXY_ACCOUNT_LIST_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { findAccountByAddress } from '@subwallet/extension-koni-ui/utils';
import { Icon, ModalContext, SwList, SwModal } from '@subwallet/react-ui';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import { X } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export interface Props extends ThemeProps {
  substrateProxyAddresses: string[];
}

const modalId = SUBSTRATE_PROXY_ACCOUNT_LIST_MODAL;

const Component = (props: Props, ref: ForwardedRef<any>) => {
  const { className = '', substrateProxyAddresses } = props;
  const { t } = useTranslation();
  const sectionRef = useRef<SwListSectionRef>(null);
  const { accounts } = useSelector((state) => state.accountState);
  const { inactiveModal } = useContext(ModalContext);

  const renderItem = useCallback((substrateProxyAddress: string) => {
    const account = findAccountByAddress(accounts, substrateProxyAddress);

    return (
      <AccountItemWithProxyAvatar
        account={account}
        accountAddress={substrateProxyAddress}
        addressFallbackLength={9}
        className={'__account-item'}
      />
    );
  }, [accounts]);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  return (
    <SwModal
      className={`${className}`}
      closable={true}
      closeIcon={<Icon
        phosphorIcon={X}
        size='md'
      />}
      id={modalId}
      onCancel={onCancel}
      title={t('ui.ACCOUNT.components.Modal.SubstrateProxyAccount.SubstrateProxyAccountList.substrateProxyAccount')}
    >
      <SwList.Section
        list={substrateProxyAddresses}
        ref={sectionRef}
        renderItem={renderItem}
      />
    </SwModal>
  );
};

const SubstrateProxyAccountListModal = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-header': {
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingSM
    },

    '.ant-sw-modal-body': {
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 0
    },

    '.ant-sw-list-wrapper': {
      flex: 1,
      marginTop: token.margin,
      overflowY: 'auto'
    },

    '.ant-sw-list-wrapper .ant-sw-list': {
      padding: 0
    },

    '.__account-item': {
      paddingBlock: token.paddingXS
    },

    '.__account-item + .__account-item': {
      marginTop: token.marginXS
    },

    '.ant-sw-modal-footer': {
      display: 'flex',
      gap: token.sizeXS,
      borderTop: 0
    }
  };
});

export default SubstrateProxyAccountListModal;
