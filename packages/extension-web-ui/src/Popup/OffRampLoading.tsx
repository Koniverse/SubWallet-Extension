// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN_TEN } from '@subwallet/extension-base/utils';
import { DEFAULT_OFF_RAMP_PARAMS, DEFAULT_TRANSFER_PARAMS, OFF_RAMP_DATA, TRANSFER_TRANSACTION } from '@subwallet/extension-web-ui/constants';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { useGetChainAssetInfo, useSelector } from '@subwallet/extension-web-ui/hooks';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { OffRampParams, Theme, ThemeProps, TransferParams } from '@subwallet/extension-web-ui/types';
import { Button, ModalContext, PageIcon, SwModal } from '@subwallet/react-ui';
import BigNumber from 'bignumber.js';
import CN from 'classnames';
import { Warning, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { LoadingScreen } from '../components';
import { findAccountByAddress, removeStorage } from '../utils';

type Props = ThemeProps;

// todo: may need recheck usage, move to util if is necessary
const toBNString = (input: string | number | BigNumber, decimal: number): string => {
  const raw = new BigNumber(input);

  return raw.multipliedBy(BN_TEN.pow(decimal)).toFixed();
};

const noAccountModalId = 'no-account-modal';
const redirectTransakModalId = 'redirect-transak-modal';

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const { token } = useTheme() as Theme;
  // Handle Sell Token
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const [, setStorage] = useLocalStorage(TRANSFER_TRANSACTION, DEFAULT_TRANSFER_PARAMS);
  const [offRampData] = useLocalStorage(OFF_RAMP_DATA, DEFAULT_OFF_RAMP_PARAMS);

  const { activeModal } = useContext(ModalContext);

  const addresses = useMemo(() => accounts.map((account) => account.address), [accounts]);
  const { isWebUI } = useContext(ScreenContext);

  const tokenInfo = useGetChainAssetInfo(offRampData.slug);
  const navigate = useNavigate();

  const openTransfer = useCallback((data: OffRampParams) => {
    const partnerCustomerId = data.partnerCustomerId;
    const walletAddress = data.walletAddress;
    const slug = data.slug;
    const bnAmount = toBNString(data.numericCryptoAmount.toString(), tokenInfo?.decimals || 0);

    const targetAccount = findAccountByAddress(accounts, partnerCustomerId);

    // will not happen, this is just for backup
    if (!targetAccount) {
      return;
    }

    const transferParams: TransferParams = {
      ...DEFAULT_TRANSFER_PARAMS,
      fromAccountProxy: targetAccount.proxyId || '',
      from: partnerCustomerId,
      chain: tokenInfo?.originChain || '',
      destChain: tokenInfo?.originChain || '',
      asset: tokenInfo?.slug || '',
      defaultSlug: slug || '',
      to: walletAddress,
      value: bnAmount.toString(),
      orderId: data.orderId,
      service: 'transak',
      isReadonly: true
    };

    setStorage(transferParams);

    if (!isWebUI) {
      navigate('/transaction/off-ramp-send-fund');
    } else {
      navigate('/home/tokens?openSendFund=true');
    }
  }, [tokenInfo?.decimals, tokenInfo?.originChain, tokenInfo?.slug, accounts, setStorage, isWebUI, navigate]);

  useEffect(() => {
    if (offRampData.orderId) {
      if (addresses.includes(offRampData.partnerCustomerId)) {
        activeModal(redirectTransakModalId);
      } else {
        activeModal(noAccountModalId);
      }
    }
  }, [activeModal, addresses, offRampData, openTransfer]);

  const onBackToHome = useCallback(() => {
    removeStorage(OFF_RAMP_DATA);
    navigate('/home/tokens');
  }, [navigate]);

  const onRedirectToTransfer = useCallback(() => {
    openTransfer(offRampData);
    removeStorage(OFF_RAMP_DATA);
  }, [offRampData, openTransfer]);

  const { t } = useTranslation();
  const footerModal = useMemo(() => {
    return (
      <>
        <Button
          block={true}
          onClick={onBackToHome}
        >
          {t('I understand')}
        </Button>
      </>
    );
  }, [onBackToHome, t]);

  const redirectFooterModal = useMemo(() => {
    return (
      <>
        <Button
          block={true}
          onClick={onBackToHome}
          schema={'secondary'}
        >
          {t('Cancel')}
        </Button>
        <Button
          block={true}
          onClick={onRedirectToTransfer}
        >
          {t('Continue')}
        </Button>
      </>
    );
  }, [onBackToHome, onRedirectToTransfer, t]);

  return (
    <>
      <LoadingScreen />
      <SwModal
        className={CN(className)}
        footer={footerModal}
        id={noAccountModalId}
        onCancel={onBackToHome}
        title={t('Unable to sell tokens')}
      >
        <div className={'__modal-content'}>
          <PageIcon
            color={token.colorError}
            iconProps={{
              weight: 'fill',
              phosphorIcon: XCircle
            }}
          />
          <div className='__modal-description'>
            {t('The requested account is not found in SubWallet. Re-import the account and try again')}
          </div>
        </div>
      </SwModal>
      <SwModal
        className={CN(className)}
        closable={false}
        footer={redirectFooterModal}
        id={redirectTransakModalId}
        maskClosable={false}
        title={t('Action needed')}
      >
        <div className={'__modal-content'}>
          <PageIcon
            color={token.colorWarning}
            iconProps={{
              phosphorIcon: Warning
            }}
          />
          <div className='__modal-description'>
            {t('To complete the transaction, you\'ll need to transfer tokens to the the address of your chosen provider. Hit "Continue" to proceed')}
          </div>
        </div>
      </SwModal>
    </>
  );
}

const OffRampLoading = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    height: '100%',
    '.__modal-content': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.size,
      alignItems: 'center',
      padding: `${token.padding}px ${token.padding}px 0 ${token.padding}px`
    },

    '.ant-sw-header-center-part': {
      width: 'fit-content'
    },

    '.__modal-description': {
      textAlign: 'center',
      color: token.colorTextDescription,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6
    },

    '.__modal-user-guide': {
      marginLeft: token.marginXXS
    },

    '.ant-sw-modal-footer': {
      borderTop: 'none',
      display: 'flex',
      gap: token.sizeSM
    }
  });
});

export default OffRampLoading;
