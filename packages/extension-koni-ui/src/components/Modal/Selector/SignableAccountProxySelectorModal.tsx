// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isSameAddress } from '@subwallet/extension-base/utils';
import { SignableAccountProxySelectorItem } from '@subwallet/extension-koni-ui/components';
import { SIGNABLE_ACCOUNT_PROXY_SELECTOR_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetAccountByAddress } from '@subwallet/extension-koni-ui/hooks';
import { SignableAccountProxyItem, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwList, SwModal } from '@subwallet/react-ui';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import { CheckCircle, X, XCircle } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export interface SignableAccountProxySelectorModalProps {
  chain: string;
  address: string;
  signerSelected: SignableAccountProxyItem | null;
  accountItems: SignableAccountProxyItem[];
  onApply: (selected: SignableAccountProxyItem) => void;
}

export type SignableAccountProxySelectorModalPropsValue = Omit<SignableAccountProxySelectorModalProps, 'onCancel' | 'onApply'>;

type Props = ThemeProps & SignableAccountProxySelectorModalProps;

const modalId = SIGNABLE_ACCOUNT_PROXY_SELECTOR_MODAL;

const Component = (props: Props, ref: ForwardedRef<any>) => {
  const { accountItems, address, chain, className = '', onApply, signerSelected } = props;
  const { t } = useTranslation();
  const sectionRef = useRef<SwListSectionRef>(null);
  const account = useGetAccountByAddress(address);
  const { inactiveModal } = useContext(ModalContext);

  const isMultisigTransaction = !!account?.isMultisig;

  // Combine main account and proxy accounts
  const fullList = useMemo<SignableAccountProxyItem[]>(() => {
    if (!account || account?.isMultisig) {
      return accountItems;
    }

    return [
      {
        kind: 'substrate_proxy',
        isProxiedAccount: true,
        address,
        proxyId: account.proxyId
      },
      ...accountItems
    ];
  }, [account, accountItems, address]);

  const [selected, setSelected] = useState<SignableAccountProxyItem | null>(signerSelected);

  const onSelect = useCallback((item: SignableAccountProxyItem) => {
    return () => {
      setSelected(item);
    };
  }, []);

  const onCancelSelectSigner = useCallback(() => {
    setSelected(() => {
      if (signerSelected) {
        return signerSelected;
      }

      return null;
    });
    inactiveModal(modalId);
  }, [inactiveModal, signerSelected]);

  const renderItem = useCallback((item: SignableAccountProxyItem) => {
    const isSelected = !!selected && isSameAddress(selected.address, item.address) && selected.substrateProxyType === item.substrateProxyType;

    return (
      <SignableAccountProxySelectorItem
        accountItem={item}
        chain={chain}
        className={'__proxy-account-item'}
        isSelected={isSelected}
        key={item.address}
        onClick={onSelect(item)}
        showUnselectIcon
      />
    );
  }, [selected, chain, onSelect]);

  const onClickApply = useCallback(() => {
    if (selected) {
      onApply?.(selected);
    }
  }, [onApply, selected]);

  return (
    <SwModal
      className={`${className}`}
      closeIcon={<Icon
        phosphorIcon={X}
        size='md'
      />}
      footer={
        <>
          <Button
            block
            className='__left-button'
            icon={
              <Icon
                phosphorIcon={XCircle}
                weight='fill'
              />
            }
            onClick={onCancelSelectSigner}
            schema='secondary'
          >
            {t('ui.ACCOUNT.components.Modal.Selector.SignableAccountProxySelector.cancel')}
          </Button>
          <Button
            block
            className='__right-button'
            disabled={!selected}
            icon={
              <Icon
                phosphorIcon={CheckCircle}
                weight='fill'
              />
            }
            onClick={onClickApply}
          >
            {t('ui.ACCOUNT.components.Modal.Selector.SignableAccountProxySelector.continue')}
          </Button>
        </>
      }
      id={modalId}
      onCancel={onCancelSelectSigner}
      title={t('ui.ACCOUNT.components.Modal.Selector.SignableAccountProxySelector.selectAccount')}
    >
      <div className='proxy-modal__description'>
        {isMultisigTransaction ? t('ui.ACCOUNT.components.Modal.Selector.SignableAccountProxySelector.selectMultisigSigningAccount') : t('ui.ACCOUNT.components.Modal.Selector.SignableAccountProxySelector.selectSigningAccount')}
      </div>
      <SwList.Section
        list={fullList}
        ref={sectionRef}
        renderItem={renderItem}
      />
    </SwModal>
  );
};

export const SignableAccountProxySelectorModal = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-header': {
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingSM
    },

    '.ant-sw-modal-body': {
      paddingBottom: 0
    },

    '.proxy-modal__description': {
      textAlign: 'center',
      lineHeight: token.lineHeightHeading6,
      color: token.colorTextTertiary,
      fontSize: token.fontSizeHeading6
    },

    '.ant-sw-list-wrapper': {
      flex: 1,
      marginTop: token.margin,
      overflowY: 'auto'
    },

    '.ant-sw-list-wrapper .ant-sw-list': {
      padding: 0
    },

    '.__proxy-account-item': {
      paddingBlock: token.paddingXS
    },

    '.__proxy-account-item + .__proxy-account-item': {
      marginTop: token.marginXS
    },

    '.ant-sw-modal-footer': {
      display: 'flex',
      gap: token.sizeXS,
      borderTop: 0
    }
  };
});
