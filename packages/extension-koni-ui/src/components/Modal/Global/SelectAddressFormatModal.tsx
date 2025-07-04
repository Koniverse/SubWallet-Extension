// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { reformatAddress } from '@subwallet/extension-base/utils';
import { AccountChainAddressWithStatusItem, CloseIcon, GeneralEmptyList } from '@subwallet/extension-koni-ui/components';
import { SELECT_ADDRESS_FORMAT_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useNotification, useSelector } from '@subwallet/extension-koni-ui/hooks';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard } from '@subwallet/extension-koni-ui/utils';
import { Icon, SwList, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretLeft, FadersHorizontal } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import styled from 'styled-components';

export interface SelectAddressFormatModalProps {
  address: string;
  chainSlug: string;
  name: string;
  onBack?: VoidFunction;
  onCancel?: VoidFunction;
}

type Props = ThemeProps & SelectAddressFormatModalProps & {
  onCancel: VoidFunction;
};

export type AddressFormatInfo = {
  name: string;
  slug: string;
  address: string;
  isNewFormat: boolean;
}

const selectAddressFormatModalId = SELECT_ADDRESS_FORMAT_MODAL;
const LEARN_MORE_DOCS_URL = 'https://address-format-guide.notion.site/Unified-address-format-integration-guide-12dffd09c4a280c0a1ebc475657dd6f6';

const Component: React.FC<Props> = ({ address, chainSlug, className, name, onBack, onCancel }: Props) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { addressQrModal } = useContext(WalletModalContext);
  const chainOldPrefixMap = useSelector((state: RootState) => state.chainStore.chainOldPrefixMap);
  const oldPrefixAddress = useMemo(() => {
    return chainOldPrefixMap[chainSlug];
  }, [chainOldPrefixMap, chainSlug]);
  const listItem: AddressFormatInfo[] = useMemo(() => {
    const legacyAccInfoItem: AddressFormatInfo = {
      address: reformatAddress(address, oldPrefixAddress),
      name: name,
      slug: chainSlug,
      isNewFormat: false
    };

    const newAccInfoInfo: AddressFormatInfo = {
      ...legacyAccInfoItem,
      isNewFormat: true,
      address: address
    };

    return [legacyAccInfoItem, newAccInfoInfo];
  }, [address, oldPrefixAddress, name, chainSlug]);

  const renderEmpty = useCallback(() => {
    return <GeneralEmptyList />;
  }, []);

  const onShowQr = useCallback((item: AddressFormatInfo) => {
    return () => {
      const processFunction = () => {
        addressQrModal.open({
          address: item.address,
          chainSlug: item.slug,
          onBack: addressQrModal.close,
          isNewFormat: item.isNewFormat,
          onCancel: () => {
            addressQrModal.close();
            onCancel();
          }
        });
      };

      processFunction();
    };
  }, [addressQrModal, onCancel]);

  const onCopyAddress = useCallback((item: AddressFormatInfo) => {
    return () => {
      const processFunction = () => {
        copyToClipboard(item.address || '');
        notify({
          message: t('ui.Modal.Global.SelectAddressFormat.copiedToClipboard')
        });
      };

      processFunction();
    };
  }, [notify, t]);

  const renderItem = useCallback((item: AddressFormatInfo) => {
    return (
      <AccountChainAddressWithStatusItem
        address={item.address}
        chainName={item.name}
        className={'item-wrapper'}
        isNewFormat={item.isNewFormat}
        key={`${item.address}-${item.slug}`}
        onClickCopyButton={onCopyAddress(item)}
        onClickQrButton={onShowQr(item)}
        tokenSlug={item.slug}
      />
    );
  }, [onCopyAddress, onShowQr]);

  return (
    <SwModal
      className={CN(className, 'address-format-modal')}
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
      id={selectAddressFormatModalId}
      onCancel={onBack || onCancel}
      rightIconProps={onBack
        ? {
          icon: <CloseIcon />,
          onClick: onCancel
        }
        : undefined
      }
      title={t<string>('Select address format')}
    >
      <div>
        <div className={'sub-title'}>
          {t('ui.Modal.Global.SelectAddressFormat.legacyAddressFormatWarning')}
          <a
            href={LEARN_MORE_DOCS_URL}
            rel='noreferrer'
            style={{ textDecoration: 'underline' }}
            target={'_blank'}
          >Learn more</a>
        </div>
        <SwList
          actionBtnIcon={<Icon phosphorIcon={FadersHorizontal} />}
          className={'address-format-list'}
          list={listItem}
          renderItem={renderItem}
          renderWhenEmpty={renderEmpty}
        />
      </div>
    </SwModal>
  );
};

const SelectAddressFormatModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.address-format-list': {
      display: 'flex',
      flexDirection: 'column'
    },
    '.sub-title': {
      paddingBottom: token.padding,
      fontSize: token.fontSizeSM,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeightSM,
      textAlign: 'center',
      color: token.colorTextTertiary
    },

    '.item-wrapper + .item-wrapper': {
      marginTop: 8
    },

    '.ant-sw-modal-footer': {
      borderTop: 0
    }
  };
});

export default SelectAddressFormatModal;
