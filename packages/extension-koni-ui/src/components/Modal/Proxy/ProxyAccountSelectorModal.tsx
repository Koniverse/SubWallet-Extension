// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProxyItem } from '@subwallet/extension-base/types/proxy';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, SwList, SwModal, Web3Block } from '@subwallet/react-ui';
import SwAvatar from '@subwallet/react-ui/es/sw-avatar';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import { CheckCircle, X, XCircle } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

interface Props extends ThemeProps {
  chain: string;
  modalId: string;
  address: string
  proxyItems: ProxyItem[]
  onCancel: VoidFunction,
  onApply: (selected: string | null) => void;
}

interface ProxyItemExtended extends ProxyItem {
  isMain?: boolean;
}

const Component = (props: Props, ref: ForwardedRef<any>) => {
  const { address, className = '', modalId, onApply, onCancel, proxyItems } = props;
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;
  const sectionRef = useRef<SwListSectionRef>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const fullList = useMemo(() => {
    return [
      {
        isMain: true,
        proxyAddress: address
      },
      ...proxyItems
    ];
  }, [address, proxyItems]);

  const onSelect = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const address = (e.currentTarget.dataset.address as string) || '';

    setSelected((old) => (old === address ? null : address));
  }, []);

  const renderItem = useCallback((item: ProxyItemExtended) => {
    const isSelected = selected === item.proxyAddress;
    const isMain = item.isMain;

    return (
      <div
        className='proxy-item-wrapper'
        data-address={item.proxyAddress}
        key={item.proxyAddress}
        onClick={onSelect}
      >
        <Web3Block
          className='proxy-item'
          leftItem={
            <SwAvatar
              size={32}
              theme='polkadot'
              value={item.proxyAddress}
            />
          }
          middleItem={
            <div className='proxy-item__info'>
              <div className='proxy-item__address'>{toShort(item.proxyAddress)}</div>
              <div
                className={`proxy-item__type ${isMain ? 'main' : ''}`}
              >
                {isMain ? 'Proxied account' : `Proxy type: ${item.proxyType}`}
              </div>
            </div>
          }
          rightItem={
            <div className='proxy-item__check'>
              <Icon
                iconColor={isSelected ? token.colorSuccess : token.colorTextLight4}
                phosphorIcon={CheckCircle}
                size='sm'
                weight='fill'
              />
            </div>
          }
        />
      </div>
    );
  }, [selected, onSelect, token.colorSuccess, token.colorTextLight4]);

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
            {t('Cancel')}
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
            {t('Continue')}
          </Button>
        </>
      }
      id={modalId}
      onCancel={onCancel}
      title={t('Select proxy account')}
    >
      <div className='proxy-modal__description'>
        You’re performing transactions from a proxied account.
        Select the account you want to sign this transaction.
      </div>
      <SwList.Section
        list={fullList}
        ref={sectionRef}
        renderItem={renderItem}
      />
    </SwModal>
  );
};

const ProxyAccountSelectorModal = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
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

    '.proxy-item-wrapper:not(:last-child)': {
      marginBottom: 8
    },

    '.proxy-item': {
      display: 'flex',
      alignItems: 'center',
      borderRadius: token.borderRadiusLG,
      transition: 'background-color 0.2s ease',
      color: token.colorTextLight1,
      backgroundColor: token.colorBgSecondary
    },

    '.proxy-item__info': {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },

    '.proxy-item__type': {
      color: token['magenta-6'],
      fontWeight: 500,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,

      '&.main': {
        color: token['lime-6']
      }
    },

    '.proxy-item__check': {
      minWidth: '40px',
      display: 'flex',
      justifyContent: 'center',
      marginLeft: token.marginXXS
    },

    '.ant-sw-modal-footer': {
      display: 'flex',
      gap: token.sizeXS,
      borderTop: 0
    }
  };
});

export default ProxyAccountSelectorModal;
