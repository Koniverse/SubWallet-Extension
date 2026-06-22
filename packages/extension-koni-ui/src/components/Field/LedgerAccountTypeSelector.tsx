// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { POLKADOT_LEDGER_SCHEME } from '@subwallet/extension-base/background/KoniTypes';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { useSelectModalInputHelper } from '@subwallet/extension-koni-ui/hooks/form/useSelectModalInputHelper';
import { ChainItemType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Field, Icon, InputRef, Logo, ModalContext, SwModal, Web3Block } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretDown } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback, useContext, useMemo } from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';

export interface LedgerPolkadotAccountItemType extends ChainItemType {
  scheme: POLKADOT_LEDGER_SCHEME;
  description: string;
}

interface Props extends ThemeProps, BasicInputWrapper{
  items: LedgerPolkadotAccountItemType[];
  value?: string;
  id?: string;
}

const CONNECT_LEDGER_USER_GUIDE_URL = 'https://docs.subwallet.app/main/extension-user-guide/cold-wallet-management/connect-ledger-devices/connect-via-the-polkadot-app#select-the-right-account-type-for-use-when-connecting-via-polkadot-app';

function Component (props: Props, ref: ForwardedRef<InputRef>): React.ReactElement<Props> {
  const { className, id = 'account-type', items, value } = props;
  const { t } = useTranslation();
  const { onSelect } = useSelectModalInputHelper(props, ref);
  const { activeModal, inactiveModal } = useContext(ModalContext);

  const onOpenModal = useCallback(() => {
    activeModal(id);
  }, [activeModal, id]);

  const onCancelModal = useCallback(() => {
    inactiveModal(id);
  }, [id, inactiveModal]);

  const selectedItem = useMemo(() => {
    if (!value) {
      return undefined;
    }

    return items.find((i) => i.scheme === value);
  }, [items, value]);

  const onSelectItem = useCallback((item: LedgerPolkadotAccountItemType) => {
    return () => {
      onSelect(item.scheme);
      onCancelModal();
    };
  }, [onCancelModal, onSelect]);

  const renderItem = useCallback((item: LedgerPolkadotAccountItemType) => {
    return (
      <Web3Block
        className={'account-type-item'}
        leftItem={
          <Logo
            className='chain-logo'
            network={item.slug}
            shape='circle'
            size={28}
          />
        }
        middleItem={
          <div className='network-item-content'>
            <div className='network-name'>{t(item.name)}</div>
            <div className='network-description'>{t(item.description)}</div>
          </div>
        }
        onClick={onSelectItem(item)}
      />
    );
  }, [onSelectItem, t]);

  const fieldContent = useMemo(() => {
    if (!selectedItem) {
      return null;
    }

    return (
      <div className={'__selected-item'}>
        <Logo
          className='chain-logo'
          network={selectedItem.slug}
          shape='circle'
          size={20}
        />
        <div className={'__selected-item-name common-text'}>
          {t(selectedItem.name)}
        </div>
      </div>
    );
  }, [selectedItem, t]);

  const fieldSuffix = useMemo(() => {
    return (
      <Icon
        className={'__caret-icon'}
        customSize={'20px'}
        phosphorIcon={CaretDown}
      />
    );
  }, []);

  return (
    <>
      <div
        className={className}
        onClick={onOpenModal}
      >
        <Field
          className={CN('is-selectable')}
          content={fieldContent}
          label={t('ui.components.Field.LedgerAccountTypeSelector.selectAccountType')}
          placeholder={t('ui.components.Field.LedgerAccountTypeSelector.selectAccountType')}
          suffix={fieldSuffix}
        />
      </div>
      <SwModal
        className={className}
        closable={true}
        id={id}
        onCancel={onCancelModal}
        title={t('ui.components.Field.LedgerAccountTypeSelector.selectAccountType')}
      >
        <div className={'modal-description'}>
          <Trans
            components={{
              highlight: (
                <a
                  href={CONNECT_LEDGER_USER_GUIDE_URL}
                  target='__blank'
                />
              )
            }}
            i18nKey={detectTranslate('ui.components.Field.LedgerAccountTypeSelector.choosePolkadotAccountTypeReloadInfo')}
          />
        </div>

        <div className={'modal-content'}>
          { items.map((item: LedgerPolkadotAccountItemType) => (
            <div key={item.slug}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      </SwModal>
    </>
  );
}

export const LedgerAccountTypeSelector = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return ({
    '.chain-logo': {
      margin: '-1px 0'
    },

    '.modal-description': {
      marginBottom: token.margin,
      textAlign: 'center',
      color: token.colorTextDescription,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,

      a: {
        textDecoration: 'underline'
      }
    },

    '.account-type-item': {
      width: 358,
      padding: `${token.paddingSM + 2}px ${token.paddingSM}px`,
      backgroundColor: token.colorBgSecondary,
      fontWeight: 500,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      borderRadius: token.borderRadiusLG,

      '.ant-web3-block-left-item': {
        paddingRight: 10
      }
    },

    '.modal-content': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeXS
    },

    '.network-item-content': {
      '.network-description': {
        color: token.colorTextDescription,
        fontSize: token.fontSizeHeading6,
        lineHeight: token.lineHeightHeading6
      },

      '.network-name': {
        fontSize: token.fontSizeHeading5,
        lineHeight: token.lineHeightHeading5
      }
    },

    '.__selected-item': {
      display: 'flex',
      gap: token.sizeXS
    },

    '.ant-field-content-wrapper': {
      '.ant-field-content': {
        color: `${token.colorTextLight2} !important`
      }
    }
  });
});
