// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubstrateProxyAccountItem } from '@subwallet/extension-base/types';
import { SubstrateProxyAccountSelectorItem } from '@subwallet/extension-koni-ui/components';
import { SUBSTRATE_PROXY_ACCOUNT_SELECTOR_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetAccountByAddress } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, SwList, SwModal } from '@subwallet/react-ui';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import { CheckCircle, X, XCircle } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export interface SubstrateProxyAccountSelectorModalProps {
  chain: string;
  address: string;
  substrateProxyAccountItems: SubstrateProxyAccountItem[];
  onCancel: VoidFunction;
  onApply: (selected: string) => void;
}

export type SubstrateProxyAccountSelectorModalPropsValue = Omit<SubstrateProxyAccountSelectorModalProps, 'onCancel' | 'onApply'>;

type Props = ThemeProps & SubstrateProxyAccountSelectorModalProps;

interface SubstrateProxyItemExtended extends SubstrateProxyAccountItem {
  isMain?: boolean;
}

const modalId = SUBSTRATE_PROXY_ACCOUNT_SELECTOR_MODAL;

const Component = (props: Props, ref: ForwardedRef<any>) => {
  const { address, className = '', onApply, onCancel, substrateProxyAccountItems } = props;
  const { t } = useTranslation();
  const sectionRef = useRef<SwListSectionRef>(null);
  const [selected, setSelected] = useState<string>(address);
  const account = useGetAccountByAddress(address);

  const fullList = useMemo(() => {
    return [
      {
        isMain: true,
        substrateProxyAddress: address,
        proxyId: account?.proxyId
      },
      ...substrateProxyAccountItems
    ];
  }, [account?.proxyId, address, substrateProxyAccountItems]);

  const onSelect = useCallback((address: string) => {
    return () => {
      setSelected(address);
    };
  }, []);

  const renderItem = useCallback((item: SubstrateProxyItemExtended) => {
    const isSelected = selected === item.substrateProxyAddress;

    return (
      <SubstrateProxyAccountSelectorItem
        className={'__proxy-account-item'}
        isSelected={isSelected}
        onClick={onSelect(item.substrateProxyAddress)}
        showUnselectIcon
        substrateProxyAccount={item}
      />
    );
  }, [selected, onSelect]);

  const onClickApply = useCallback(() => {
    onApply?.(selected);
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
            onClick={onCancel}
            schema='secondary'
          >
            {t('ui.ACCOUNT.components.Modal.SubstrateProxyAccount.SubstrateProxyAccountSelector.cancel')}
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
            {t('ui.ACCOUNT.components.Modal.SubstrateProxyAccount.SubstrateProxyAccountSelector.continue')}
          </Button>
        </>
      }
      id={modalId}
      onCancel={onCancel}
      title={t('ui.ACCOUNT.components.Modal.SubstrateProxyAccount.SubstrateProxyAccountSelector.selectAccount')}
    >
      <div className='proxy-modal__description'>
        {t('ui.ACCOUNT.components.Modal.SubstrateProxyAccount.SubstrateProxyAccountSelector.selectSigningAccount')}
      </div>
      <SwList.Section
        list={fullList}
        ref={sectionRef}
        renderItem={renderItem}
      />
    </SwModal>
  );
};

const SubstrateProxyAccountSelectorModal = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
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

    '.proxy-modal__description': {
      textAlign: 'center',
      lineHeight: token.lineHeightHeading6,
      color: token.colorTextTertiary,
      fontSize: token.fontSizeHeading6
    },

    '.ant-sw-list-wrapper': {
      flex: 1,
      marginTop: token.margin
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

export default SubstrateProxyAccountSelectorModal;
