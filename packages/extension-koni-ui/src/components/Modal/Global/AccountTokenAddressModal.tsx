// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountTokenAddressItem, CloseIcon, GeneralEmptyList } from '@subwallet/extension-koni-ui/components';
import { ADDRESS_GROUP_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useNotification } from '@subwallet/extension-koni-ui/hooks';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { AccountTokenAddress, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard } from '@subwallet/extension-koni-ui/utils';
import { Icon, SwList, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretLeft, FadersHorizontal } from 'phosphor-react';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

export interface AccountTokenAddressModalProps {
  items: AccountTokenAddress[];
  onBack?: VoidFunction;
  onCancel?: VoidFunction;
}

type Props = ThemeProps & AccountTokenAddressModalProps & {
  onCancel: VoidFunction;
};

const modalId = ADDRESS_GROUP_MODAL;
const LEARN_MORE_DOCS_URL = 'https://docs.subwallet.app/main/extension-user-guide/receive-and-transfer-assets/receive-tokens-and-nfts#select-your-preferred-bitcoin-address';

const Component: React.FC<Props> = ({ className, items, onBack, onCancel }: Props) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { addressQrModal } = useContext(WalletModalContext);

  // Note: This component only supports Bitcoin addresses. Please review it if you want to use it for other use cases.
  const onShowQr = useCallback((item: AccountTokenAddress) => {
    return () => {
      const processFunction = () => {
        addressQrModal.open({
          accountTokenAddresses: items,
          address: item.accountInfo.address,
          chainSlug: item.chainSlug,
          onBack: addressQrModal.close,
          onCancel: () => {
            addressQrModal.close();
            onCancel();
          }
        });
      };

      processFunction();
    };
  }, [addressQrModal, items, onCancel]);

  const onCopyAddress = useCallback((item: AccountTokenAddress) => {
    return () => {
      const processFunction = () => {
        copyToClipboard(item.accountInfo.address || '');
        notify({
          message: t('ui.ACCOUNT.components.Modal.Global.AccountTokenAddress.copiedToClipboard')
        });
      };

      processFunction();
    };
  }, [notify, t]);

  const renderItem = useCallback(
    (item: AccountTokenAddress) => {
      return (
        <AccountTokenAddressItem
          className={'item-wrapper'}
          item={item}
          key={`${item.accountInfo.type}_${item.accountInfo.address}`}
          onClick={onShowQr(item)}
          onClickCopyButton={onCopyAddress(item)}
          onClickQrButton={onShowQr(item)}
        />
      );
    },
    [onCopyAddress, onShowQr]
  );

  const renderEmpty = useCallback(() => {
    return <GeneralEmptyList />;
  }, []);

  return (
    <SwModal
      className={CN(className, 'address-group-modal')}
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
      id={modalId}
      onCancel={onBack || onCancel}
      rightIconProps={onBack
        ? {
          icon: <CloseIcon />,
          onClick: onCancel
        }
        : undefined}
      title={t<string>('ui.ACCOUNT.components.Modal.Global.AccountTokenAddress.selectAddressType')}
    >
      <div>
        {/* TODO: Move this description content into a prop passed to the component */}
        <div className={'description'}>
          {t('ui.ACCOUNT.components.Modal.Global.AccountTokenAddress.bitcoinAddressSupport')}
          <a
            href={LEARN_MORE_DOCS_URL}
            rel='noreferrer'
            style={{ textDecoration: 'underline' }}
            target={'_blank'}
          >Learn more</a>
        </div>
        <SwList
          actionBtnIcon={<Icon phosphorIcon={FadersHorizontal} />}
          className={'address-group-list'}
          list={items}
          renderItem={renderItem}
          renderWhenEmpty={renderEmpty}
        />
      </div>
    </SwModal>
  );
};

const AccountTokenAddressModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.address-group-list': {
      display: 'flex',
      flexDirection: 'column'
    },

    '.item-wrapper + .item-wrapper': {
      marginTop: 8
    },

    '.description': {
      paddingBottom: token.padding,
      fontSize: token.fontSizeSM,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeightSM,
      textAlign: 'center',
      color: token.colorTextTertiary
    },

    '.ant-sw-list-search-input': {
      paddingBottom: token.paddingXS
    },

    '.ant-sw-list-section': {
      height: '100%'
    }
  };
});

export default AccountTokenAddressModal;
