// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProxyItem } from '@subwallet/extension-base/types/proxy';
import { ProxyAccountSelectorItem } from '@subwallet/extension-koni-ui/components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, SwList, SwModal } from '@subwallet/react-ui';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import { CheckCircle, X, XCircle } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  chain: string;
  modalId: string;
  address: string;
  proxyId: string;
  proxyItems: ProxyItem[];
  onCancel: VoidFunction;
  onApply: (selected: string | null) => void;
}

interface ProxyItemExtended extends ProxyItem {
  isMain?: boolean;
}

const Component = (props: Props, ref: ForwardedRef<any>) => {
  const { address, className = '', modalId, onApply, onCancel, proxyId, proxyItems } = props;
  const { t } = useTranslation();
  const sectionRef = useRef<SwListSectionRef>(null);
  const [selected, setSelected] = useState<string>(address);

  const fullList = useMemo(() => {
    return [
      {
        isMain: true,
        proxyAddress: address,
        proxyId
      },
      ...proxyItems
    ];
  }, [address, proxyId, proxyItems]);

  const onSelect = useCallback((address: string) => {
    return () => {
      setSelected(address);
    };
  }, []);

  const renderItem = useCallback((item: ProxyItemExtended) => {
    const isSelected = selected === item.proxyAddress;

    return (
      <ProxyAccountSelectorItem
        className={'__proxy-account-item'}
        isSelected={isSelected}
        onClick={onSelect(item.proxyAddress)}
        proxyAccount={item}
        showUnselectIcon
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
      title={t('Select account')}
    >
      <div className='proxy-modal__description'>
        {t('You\'re performing transactions from a proxied account. Select the account you want to sign this transaction')}
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

export default ProxyAccountSelectorModal;
