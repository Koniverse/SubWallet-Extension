// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubstrateProxyAccountItem } from '@subwallet/extension-base/types';
import { SubstrateProxyAccountSelectorItem } from '@subwallet/extension-koni-ui/components';
import { SUBSTRATE_PROXY_ACCOUNT_LIST_MODAL } from '@subwallet/extension-koni-ui/constants';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getSubstrateProxyAddressKey } from '@subwallet/extension-koni-ui/utils';
import { Icon, ModalContext, SwList, SwModal } from '@subwallet/react-ui';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import { X } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export interface Props extends ThemeProps {
  substrateProxyAccounts: SubstrateProxyAccountItem[];
}

const modalId = SUBSTRATE_PROXY_ACCOUNT_LIST_MODAL;

const Component = (props: Props, ref: ForwardedRef<any>) => {
  const { className = '', substrateProxyAccounts } = props;
  const { t } = useTranslation();
  const sectionRef = useRef<SwListSectionRef>(null);
  const { inactiveModal } = useContext(ModalContext);

  const renderItem = useCallback((item: SubstrateProxyAccountItem) => {
    const key = getSubstrateProxyAddressKey(item.substrateProxyAddress, item.substrateProxyType);

    return (
      <SubstrateProxyAccountSelectorItem
        className={'__account-item'}
        key={key}
        showCheckedIcon={false}
        substrateProxyAccount={item}
      />
    );
  }, []);

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
        list={substrateProxyAccounts}
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
      paddingBottom: 0,
      paddingTop: 0
    },

    '.ant-sw-list-wrapper': {
      flex: 1,
      marginTop: token.margin,
      overflowY: 'auto'
    },

    '.ant-sw-list-wrapper .ant-sw-list': {
      padding: 0
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
