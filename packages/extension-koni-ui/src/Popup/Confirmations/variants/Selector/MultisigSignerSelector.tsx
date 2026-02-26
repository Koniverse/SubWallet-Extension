// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/types';
import { AccountItemWithProxyAvatar, AccountProxyAvatar, AlertBox } from '@subwallet/extension-koni-ui/components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretDown, CircleNotch } from 'phosphor-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export interface MultisigSignerSelectorProps {
  className?: string;
  isPreparing: boolean;
  isSignerItemsLoading: boolean;
  onOpenSelectSignerModal: () => void;
  signerAccount?: AccountJson | null;
  wrapError?: string | null;
}

function MultisigSignerSelector ({ className, isPreparing, isSignerItemsLoading, onOpenSelectSignerModal, signerAccount, wrapError }: MultisigSignerSelectorProps) {
  const { t } = useTranslation();
  const isDisabled = isSignerItemsLoading || isPreparing;
  const renderSignerRightPart = useCallback(() => (
    <Icon
      className={CN('multisig-signer-selector__icon', { '-loading': isDisabled })}
      customSize='18px'
      phosphorIcon={isDisabled ? CircleNotch : CaretDown}
    />
  ), [isDisabled]);

  return (
    <div className={CN('multisig-signer-container', className)}>
      <AccountItemWithProxyAvatar
        account={signerAccount || null}
        accountAddress={signerAccount?.address}
        accountName={!signerAccount ? t('ui.DAPP.Confirmations.MultisigSignerSelector.selectAccountToSign') : undefined}
        className={CN('multisig-signer-selector', { '-disabled': isDisabled })}
        leftPartNode={!signerAccount
          ? (
            <AccountProxyAvatar
              className='multisig-signer-avatar'
              size={24}
              value={''}
            />
          )
          : undefined}
        onClick={isDisabled ? undefined : onOpenSelectSignerModal}
        renderRightPart={renderSignerRightPart}
        showAccountNameFallback={!!signerAccount}
      />
      {!!wrapError && (
        <AlertBox
          className='multisig-signer-error'
          description={wrapError}
          type='warning'
        />
      )}
    </div>
  );
}

export default styled(React.memo(MultisigSignerSelector))<MultisigSignerSelectorProps>(({ theme: { token } }: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: token.sizeXS,

  '.multisig-signer-selector': {
    backgroundColor: token.colorBgSecondary,
    minHeight: 48,
    padding: `${token.paddingXS}px ${token.paddingSM}px`
  },

  '.multisig-signer-selector.-disabled': {
    cursor: 'not-allowed',
    opacity: 0.8
  },

  '.multisig-signer-selector__icon.-loading': {
    animation: 'spinner-loading 1s infinite linear'
  },

  '.multisig-signer-error': {
    marginTop: token.marginXS
  }
}));
