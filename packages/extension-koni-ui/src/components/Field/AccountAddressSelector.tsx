// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field/Base';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useSelectModalInputHelper, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { AccountAddressItemType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GovAccountAddressItemType, GovVoteStatus } from '@subwallet/extension-koni-ui/types/gov';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Field, Icon, InputRef, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretDown } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback, useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { AccountSelectorModal } from '../Modal';
import GovAccountSelectoModal from '../Modal/Governance/GovAccountSelector';

interface BaseProps extends ThemeProps, BasicInputWrapper {
  labelStyle?: 'horizontal' | 'vertical';
  autoSelectFirstItem?: boolean;
}

interface RegularProps extends BaseProps {
  items: AccountAddressItemType[];
  isGovModal?: false;
}

interface GovProps extends BaseProps {
  items: GovAccountAddressItemType[];
  isGovModal: true;
}

type Props = RegularProps | GovProps;

const Component = (props: Props, ref: ForwardedRef<InputRef>): React.ReactElement<Props> => {
  const { autoSelectFirstItem, className = '', disabled, id = 'account-selector'
    , isGovModal, items, label
    , labelStyle, placeholder, readOnly, statusHelp, tooltip, value } = props;

  const { t } = useTranslation();
  const { onSelect } = useSelectModalInputHelper(props, ref);
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { alertModal: { close: closeAlert, open: openAlert } } = useContext(WalletModalContext);

  const onOpenModal = useCallback(() => {
    if (disabled || readOnly) {
      return;
    }

    activeModal(id);
  }, [activeModal, disabled, id, readOnly]);

  const onCancelModal = useCallback(() => {
    inactiveModal(id);
  }, [id, inactiveModal]);

  const onSelectGovItem = useCallback((item: GovAccountAddressItemType) => {
    if (item.govVoteStatus === GovVoteStatus.DELEGATED) {
      openAlert({
        title: t('Unable to vote'),
        type: NotificationType.ERROR,
        content: t(
          'You\'re delegating votes for the referendum\'s track with account named "{{name}}". Ask your delegatee to vote or remove your delegated votes, then try again',
          { name: item.accountName }
        ),
        okButton: {
          text: t('I understand'),
          onClick: closeAlert
        }
      });

      return;
    }

    onSelect(item.address);
    onCancelModal();
  }, [closeAlert, onCancelModal, onSelect, openAlert, t]);

  const onSelectRegularItem = useCallback((item: AccountAddressItemType) => {
    onSelect(item.address);
    onCancelModal();
  }, [onCancelModal, onSelect]);

  const selectedItem = useMemo(() => {
    if (!value) {
      return undefined;
    }

    return items.find((i) => i.address === value);
  }, [items, value]);

  const fieldContent = useMemo(() => {
    if (!selectedItem) {
      return null;
    }

    return (
      <div className={'__selected-item'}>
        <div className={'__selected-item-name common-text'}>
          {selectedItem.accountName}
        </div>

        <div className={'__selected-item-address common-text'}>
          &nbsp;({toShort(selectedItem.address, 4, 5)})
        </div>
      </div>
    );
  }, [selectedItem]);

  const fieldSuffix = useMemo(() => {
    return (
      <Icon
        className={'__caret-icon'}
        customSize={'20px'}
        phosphorIcon={CaretDown}
      />
    );
  }, []);

  useEffect(() => {
    if (isGovModal && !value && items.length > 1 && !disabled && !readOnly) {
      activeModal(id);
    }
  }, [isGovModal, value, items.length, disabled, readOnly, activeModal, id]);

  return (
    <>
      <div
        className={className}
        onClick={onOpenModal}
      >
        <Field
          className={CN({
            '-label-horizontal': labelStyle === 'horizontal',
            'is-selectable': !(disabled || readOnly),
            'is-disabled': disabled,
            'is-readonly': readOnly
          })}
          content={fieldContent}
          label={label}
          placeholder={placeholder || t('Select account')}
          statusHelp={statusHelp}
          suffix={fieldSuffix}
          tooltip={tooltip}
        />
      </div>
      {isGovModal
        ? (
          <GovAccountSelectoModal
            autoSelectFirstItem={autoSelectFirstItem}
            items={items}
            modalId={id}
            onCancel={onCancelModal}
            onSelectItem={onSelectGovItem}
            selectedValue={value}
          />
        )
        : (
          <AccountSelectorModal
            autoSelectFirstItem={autoSelectFirstItem}
            items={items}
            modalId={id}
            onCancel={onCancelModal}
            onSelectItem={onSelectRegularItem}
            selectedValue={value}
          />
        )}
    </>
  );
};

const AccountAddressSelector = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return ({
    '.__selected-item': {
      display: 'flex',
      fontWeight: token.headingFontWeight,
      color: token.colorTextLight1,
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    },

    '.ant-field-container .ant-field-content.ant-field-content.ant-field-content': {
      color: token.colorTextLight2
    },

    '.__selected-item-name': {
      textOverflow: 'ellipsis',
      fontWeight: token.headingFontWeight,
      overflow: 'hidden'
    },

    '.__selected-item-address': {
      color: token.colorTextLight4
    },

    '.__caret-icon': {
      minWidth: 40,
      display: 'flex',
      justifyContent: 'center',
      marginRight: -10
    }
  });
});

export default AccountAddressSelector;
