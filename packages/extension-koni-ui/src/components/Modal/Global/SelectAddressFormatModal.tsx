// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { reformatAddress } from '@subwallet/extension-base/utils';
import { AccountChainAddressWithStatusItem, GeneralEmptyList } from '@subwallet/extension-koni-ui/components';
import { UNIFIED_CHAIN_SS58_PREFIX } from '@subwallet/extension-koni-ui/constants';
import { SELECT_ADDRESS_FORMAT_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useNotification } from '@subwallet/extension-koni-ui/hooks';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard } from '@subwallet/extension-koni-ui/utils';
import { Icon, SwList, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { FadersHorizontal } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
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
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const chainInfo = chainInfoMap[chainSlug];
  const { addressQrModal } = useContext(WalletModalContext);

  const listItem: AddressFormatInfo[] = useMemo(() => {
    const legacyAccInfoItem: AddressFormatInfo = {
      address: reformatAddress(address, chainInfo?.substrateInfo?.addressPrefix),
      name: name,
      slug: chainSlug,
      isNewFormat: false
    };

    const newAccInfoInfo: AddressFormatInfo = {
      ...legacyAccInfoItem,
      isNewFormat: true,
      address: reformatAddress(address, UNIFIED_CHAIN_SS58_PREFIX)
    };

    return [legacyAccInfoItem, newAccInfoInfo];
  }, [address, chainInfo?.substrateInfo?.addressPrefix, name, chainSlug]);

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
          message: t('Copied to clipboard')
        });
      };

      processFunction();
    };
  }, [notify, t]);

  const renderItem = useCallback((item: AddressFormatInfo) => {
    return (
      <>
        <div className={'item-wrapper'}>
          <AccountChainAddressWithStatusItem
            address={item.address}
            chainName={item.name}
            isNewFormat={item.isNewFormat}
            key={`${item.address}-${item.slug}`}
            onClickCopyButton={onCopyAddress(item)}
            onClickQrButton={onShowQr(item)}
            tokenSlug={item.slug}
          />
        </div>
      </>
    );
  }, [onCopyAddress, onShowQr]);

  return (
    <SwModal
      className={CN(className, 'wallet-version-modal')}
      destroyOnClose={true}
      id={selectAddressFormatModalId}
      onCancel={onBack || onCancel}
      title={t<string>('Select address format')}
    >
      <div>
        <div className={'sub-title'}>
          {t('Some exchanges are still using legacy format for token deposit and withdrawal. Make sure you choose the correct address format to avoid risks of fund loss. ')}
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
          rowGap='var(--row-gap)'
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
      fontSize: token.fontSize,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight,
      textAlign: 'center',
      color: token.colorTextTertiary
    },
    '.item-wrapper:not(:last-child)': {
      marginBottom: 8
    },
    '.ant-sw-modal-footer': {
      borderTop: 0
    }
  };
});

export default SelectAddressFormatModal;
