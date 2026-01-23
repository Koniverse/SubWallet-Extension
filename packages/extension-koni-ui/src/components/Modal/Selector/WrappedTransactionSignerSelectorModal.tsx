// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isSameAddress } from '@subwallet/extension-base/utils';
import { WrappedTransactionSignerSelectorItem } from '@subwallet/extension-koni-ui/components';
import { WRAPPED_TRANSACTION_SIGNER_SELECTOR_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetAccountByAddress } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps, WrappedTransactionSigner } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwList, SwModal } from '@subwallet/react-ui';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import { CheckCircle, X, XCircle } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

/**
 * Select signer for a wrapped transaction
 */
export interface WrappedTransactionSignerSelectorModalProps {
  chainSlug: string;
  targetAddress: string;

  selectedSigner: WrappedTransactionSigner | null;
  signerItems: WrappedTransactionSigner [];

  onSelectSigner: (signer: WrappedTransactionSigner) => void;
}

type Props = ThemeProps & WrappedTransactionSignerSelectorModalProps;

const modalId = WRAPPED_TRANSACTION_SIGNER_SELECTOR_MODAL;

const Component = (props: Props, ref: ForwardedRef<any>) => {
  const { chainSlug,
    className = '',
    onSelectSigner,
    selectedSigner,
    signerItems,
    targetAddress } = props;

  const { t } = useTranslation();
  const sectionRef = useRef<SwListSectionRef>(null);
  const { inactiveModal } = useContext(ModalContext);

  const account = useGetAccountByAddress(targetAddress);
  const isMultisigTransaction = !!account?.isMultisig;

  /**
   * Combine wrapped account and signable signer accounts
   */
  const fullList = useMemo<WrappedTransactionSigner []>(() => {
    if (!account || account.isMultisig) {
      return signerItems;
    }

    return [
      {
        kind: 'substrate_proxy',
        isProxiedAccount: true,
        address: targetAddress,
        proxyId: account.proxyId
      },
      ...signerItems
    ];
  }, [account, signerItems, targetAddress]);

  const [selected, setSelected] =
    useState<WrappedTransactionSigner | null>(selectedSigner);

  const onSelect = useCallback(
    (item: WrappedTransactionSigner) => () => {
      setSelected(item);
    },
    []
  );

  const onCancelSelectSigner = useCallback(() => {
    setSelected(selectedSigner ?? null);
    inactiveModal(modalId);
  }, [inactiveModal, selectedSigner]);

  const renderItem = useCallback(
    (item: WrappedTransactionSigner) => {
      const isSelected =
        !!selected &&
        isSameAddress(selected.address, item.address) &&
        selected.substrateProxyType === item.substrateProxyType;

      return (
        <WrappedTransactionSignerSelectorItem
          chainSlug={chainSlug}
          className='__proxy-account-item'
          isSelected={isSelected}
          key={item.address}
          onClick={onSelect(item)}
          showUnselectIcon
          signerItem={item}
        />
      );
    },
    [selected, chainSlug, onSelect]
  );

  const onConfirmSelectSigner = useCallback(() => {
    if (selected) {
      onSelectSigner(selected);
    }
  }, [onSelectSigner, selected]);

  return (
    <SwModal
      className={className}
      closeIcon={
        <Icon
          phosphorIcon={X}
          size='md'
        />
      }
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
            {t('ui.ACCOUNT.components.Modal.Selector.WrappedTransactionSignerSelectorModal.cancel')}
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
            onClick={onConfirmSelectSigner}
          >
            {t('ui.ACCOUNT.components.Modal.Selector.WrappedTransactionSignerSelectorModal.continue')}
          </Button>
        </>
      }
      id={modalId}
      onCancel={onCancelSelectSigner}
      title={t('ui.ACCOUNT.components.Modal.Selector.WrappedTransactionSignerSelectorModal.selectAccount')}
    >
      <div className='proxy-modal__description'>
        {isMultisigTransaction
          ? t('ui.ACCOUNT.components.Modal.Selector.WrappedTransactionSignerSelectorModal.selectMultisigSigningAccount')
          : t('ui.ACCOUNT.components.Modal.Selector.WrappedTransactionSignerSelectorModal.selectSigningAccount')}
      </div>

      <SwList.Section
        list={fullList}
        ref={sectionRef}
        renderItem={renderItem}
      />
    </SwModal>
  );
};

export const WrappedTransactionSignerSelectorModal =
  styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => ({
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
  }));
