// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ConfirmationDefinitions, ConfirmationDefinitionsBitcoin, ConfirmationDefinitionsCardano, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AuthorizeRequest, MetadataRequest, SigningRequest } from '@subwallet/extension-base/background/types';
import { _isSubstrateEvmCompatibleChain } from '@subwallet/extension-base/services/chain-service/utils';
import { WalletConnectNotSupportRequest, WalletConnectSessionRequest } from '@subwallet/extension-base/services/wallet-connect-service/types';
import { AccountJson, AccountSignMode, ProcessType, SubmitBittensorChangeValidatorStaking } from '@subwallet/extension-base/types';
import { _isRuntimeUpdated, detectTranslate } from '@subwallet/extension-base/utils';
import { AlertModal } from '@subwallet/extension-web-ui/components';
import { isProductionMode, NEED_SIGN_CONFIRMATION } from '@subwallet/extension-web-ui/constants';
import { useAlert, useConfirmationsInfo, useSelector } from '@subwallet/extension-web-ui/hooks';
import { BitcoinSendTransactionRequestConfirmation, BitcoinSignatureConfirmation, BitcoinSignPsbtConfirmation } from '@subwallet/extension-web-ui/Popup/Confirmations/variants';
import { SubmitApiConfirmation } from '@subwallet/extension-web-ui/Popup/Confirmations/variants/Action';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { ConfirmationType } from '@subwallet/extension-web-ui/stores/base/RequestState';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { findAccountByAddress, findChainInfoByGenesisHash, getSignMode, isRawPayload } from '@subwallet/extension-web-ui/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { SignerPayloadJSON } from '@polkadot/types/types';
import { isEthereumAddress } from '@polkadot/util-crypto';

import { ConfirmationHeader } from './parts';
import { AddNetworkConfirmation, AddTokenConfirmation, AuthorizeConfirmation, CardanoSignatureConfirmation, CardanoSignTransactionConfirmation, ConnectWalletConnectConfirmation, EvmSignatureConfirmation, EvmSignatureWithProcess, EvmTransactionConfirmation, MetadataConfirmation, NetworkConnectionErrorConfirmation, NotSupportConfirmation, NotSupportWCConfirmation, SignConfirmation, TransactionConfirmation } from './variants';

type Props = ThemeProps

const titleMap: Record<ConfirmationType, string> = {
  addNetworkRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.addNetworkRequest'),
  addTokenRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.addTokenRequest'),
  authorizeRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.connectWithSubwallet'),
  evmSendTransactionRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.transactionRequest'),
  evmWatchTransactionRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.transactionRequest'),
  evmSignatureRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.signatureRequest'),
  cardanoSignatureRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.signatureRequest'),
  cardanoSignTransactionRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.transactionRequest'),
  bitcoinSignatureRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.signatureRequest'),
  bitcoinSendTransactionRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.transactionRequest'),
  bitcoinSendTransactionRequestAfterConfirmation: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.transactionRequest'),
  bitcoinWatchTransactionRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.transactionRequest'),
  bitcoinSignPsbtRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.signPsbtRequest'),
  metadataRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.updateMetadata'),
  signingRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.signatureRequest'),
  connectWCRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.walletconnect'),
  notSupportWCRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.walletconnect'),
  errorConnectNetwork: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.transactionRequest'),
  submitApiRequest: detectTranslate('ui.CONFIRMATIONS.Popup.Confirmations.approveRequest')
} as Record<ConfirmationType, string>;

const alertModalId = 'confirmation-alert-modal';

const Component = function ({ className }: Props) {
  const { confirmationQueue, numberOfConfirmations } = useConfirmationsInfo();
  const [index, setIndex] = useState(0);
  const confirmation = confirmationQueue[index] || null;
  const accounts = useSelector((state) => state.accountState.accounts);
  const { t } = useTranslation();
  const { alertProps, closeAlert, openAlert } = useAlert(alertModalId);
  const { transactionRequest } = useSelector((state) => state.requestState);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const nextConfirmation = useCallback(() => {
    setIndex((val) => Math.min(val + 1, numberOfConfirmations - 1));
  }, [numberOfConfirmations]);

  const prevConfirmation = useCallback(() => {
    setIndex((val) => Math.max(0, val - 1));
  }, []);

  const content = useMemo((): React.ReactNode => {
    if (!confirmation) {
      return null;
    }

    if (NEED_SIGN_CONFIRMATION.includes(confirmation.type)) {
      let account: AccountJson | undefined;
      let canSign = true;
      let isMessage = false;

      if (confirmation.type === 'signingRequest') {
        const request = confirmation.item as SigningRequest;
        const _isMessage = isRawPayload(request.request.payload);
        const address = request.request.payload.address;

        account = findAccountByAddress(accounts, address) || undefined;
        const isEthereum = isEthereumAddress(address) && !account?.isSubstrateECDSA;

        if (account?.isHardware) {
          if (account?.isGeneric) {
            if (account.isSubstrateECDSA && !_isMessage) {
              const payload = request.request.payload as SignerPayloadJSON;
              const chainInfo = findChainInfoByGenesisHash(chainInfoMap, payload.genesisHash);

              canSign = !!chainInfo && _isSubstrateEvmCompatibleChain(chainInfo);
            } else {
              canSign = !isEthereum;
            }
          } else {
            if (_isMessage) {
              canSign = true;
            } else {
              const payload = request.request.payload as SignerPayloadJSON;

              // Valid even with evm ledger account (evm - availableGenesisHashes is empty)
              canSign = !!account?.availableGenesisHashes?.includes(payload.genesisHash) || _isRuntimeUpdated(payload?.signedExtensions);
            }
          }
        } else {
          canSign = true;
        }

        isMessage = _isMessage;
      } else if (['evmSignatureRequest', 'evmSendTransactionRequest', 'evmWatchTransactionRequest'].includes(confirmation.type)) {
        const request = confirmation.item as ConfirmationDefinitions['evmSignatureRequest' | 'evmSendTransactionRequest' | 'evmWatchTransactionRequest'][0];

        account = findAccountByAddress(accounts, request.payload.address) || undefined;
        canSign = request.payload.canSign;
        isMessage = confirmation.type === 'evmSignatureRequest';
      } else if (['cardanoSignatureRequest', 'cardanoSendTransactionRequest', 'cardanoWatchTransactionRequest', 'cardanoSignTransactionRequest'].includes(confirmation.type)) {
        const request = confirmation.item as ConfirmationDefinitionsCardano['cardanoSignatureRequest'][0];

        account = findAccountByAddress(accounts, request.payload.address) || undefined;
        canSign = request.payload.canSign;
        isMessage = confirmation.type === 'cardanoSignatureRequest';
      } else if (confirmation.type === 'submitApiRequest') {
        const request = confirmation.item as ConfirmationDefinitions['submitApiRequest'][0];

        account = findAccountByAddress(accounts, request.payload.address) || undefined;
        canSign = request.payload.canSign;
        isMessage = false;
      } else if (['bitcoinSignatureRequest', 'bitcoinSendTransactionRequest', 'bitcoinWatchTransactionRequest', 'bitcoinSignPsbtRequest', 'bitcoinSendTransactionRequestAfterConfirmation'].includes(confirmation.type)) {
        const request = confirmation.item as ConfirmationDefinitionsBitcoin['bitcoinSignatureRequest' | 'bitcoinSendTransactionRequest' | 'bitcoinWatchTransactionRequest' | 'bitcoinSendTransactionRequestAfterConfirmation'][0];

        account = findAccountByAddress(accounts, request.payload.address) || undefined;
        canSign = request.payload.canSign;
        isMessage = confirmation.type === 'bitcoinSignatureRequest';
      }

      const signMode = getSignMode(account);
      const isEvm = isEthereumAddress(account?.address);

      const notSupport = signMode === AccountSignMode.READ_ONLY ||
        signMode === AccountSignMode.UNKNOWN ||
        (signMode === AccountSignMode.QR && isEvm && isProductionMode) ||
        !canSign;

      if (notSupport) {
        return (
          <NotSupportConfirmation
            account={account}
            isMessage={isMessage}
            request={confirmation.item}
            type={confirmation.type}
          />
        );
      }
    }

    if (confirmation.item.isInternal && !['connectWCRequest', 'evmSignatureRequest', 'submitApiRequest'].includes(confirmation.type)) {
      return (
        <TransactionConfirmation
          closeAlert={closeAlert}
          confirmation={confirmation}
          openAlert={openAlert}
        />
      );
    }

    if (confirmation.item.isInternal && confirmation.type === 'evmSignatureRequest') {
      const request = confirmation.item as ConfirmationDefinitions['evmSignatureRequest'][0];

      if (request.payload.processId) {
        return (
          <EvmSignatureWithProcess
            closeAlert={closeAlert}
            openAlert={openAlert}
            request={request}
          />
        );
      }
    }

    switch (confirmation.type) {
      case 'addNetworkRequest':
        return <AddNetworkConfirmation request={confirmation.item as ConfirmationDefinitions['addNetworkRequest'][0]} />;
      case 'addTokenRequest':
        return <AddTokenConfirmation request={confirmation.item as ConfirmationDefinitions['addTokenRequest'][0]} />;
      case 'evmSignatureRequest':
        return (
          <EvmSignatureConfirmation
            request={confirmation.item as ConfirmationDefinitions['evmSignatureRequest'][0]}
            type={confirmation.type}
          />
        );
      case 'evmWatchTransactionRequest':
      case 'evmSendTransactionRequest':
        return (
          <EvmTransactionConfirmation
            request={confirmation.item as ConfirmationDefinitions['evmSendTransactionRequest'][0]}
            type={confirmation.type}
          />
        );
      case 'submitApiRequest':
        return (
          <SubmitApiConfirmation
            request={confirmation.item as ConfirmationDefinitions['submitApiRequest'][0]}
            type={confirmation.type}
          />
        );
      case 'cardanoSignatureRequest':
        return (
          <CardanoSignatureConfirmation
            request={confirmation.item as ConfirmationDefinitionsCardano['cardanoSignatureRequest'][0]}
            type={confirmation.type}
          />
        );
      case 'cardanoSignTransactionRequest':
        return (
          <CardanoSignTransactionConfirmation
            request={confirmation.item as ConfirmationDefinitionsCardano['cardanoSignTransactionRequest'][0]}
            type={confirmation.type}
          />
        );

      case 'bitcoinSignatureRequest':
        return (
          <BitcoinSignatureConfirmation
            request={confirmation.item as ConfirmationDefinitionsBitcoin['bitcoinSignatureRequest'][0]}
            type={confirmation.type}
          />
        );
      case 'bitcoinSignPsbtRequest':
        return (
          <BitcoinSignPsbtConfirmation
            request={confirmation.item as ConfirmationDefinitionsBitcoin['bitcoinSignPsbtRequest'][0]}
            type={confirmation.type}
          />
        );
      case 'bitcoinSendTransactionRequestAfterConfirmation':
        return (
          <BitcoinSendTransactionRequestConfirmation
            request={confirmation.item as ConfirmationDefinitionsBitcoin['bitcoinSendTransactionRequestAfterConfirmation'][0]}
            type={confirmation.type}
          />
        );
      case 'authorizeRequest':
        return (
          <AuthorizeConfirmation request={confirmation.item as AuthorizeRequest} />
        );
      case 'metadataRequest':
        return (
          <MetadataConfirmation request={confirmation.item as MetadataRequest} />
        );
      case 'signingRequest':
        return (
          <SignConfirmation request={confirmation.item as SigningRequest} />
        );
      case 'connectWCRequest':
        return (
          <ConnectWalletConnectConfirmation request={confirmation.item as WalletConnectSessionRequest} />
        );
      case 'notSupportWCRequest':
        return (<NotSupportWCConfirmation request={confirmation.item as WalletConnectNotSupportRequest} />);

      case 'errorConnectNetwork':
        return (<NetworkConnectionErrorConfirmation
          request={confirmation.item as ConfirmationDefinitions['errorConnectNetwork'][0]}
          type={confirmation.type}
        />);
    }

    return null;
  }, [accounts, chainInfoMap, closeAlert, confirmation, openAlert]);

  const headerTitle = useMemo((): string => {
    if (!confirmation) {
      return '';
    }

    if (confirmation.item.isInternal) {
      const transaction = transactionRequest[confirmation.item.id];

      if (!transaction) {
        if (confirmation.type === 'evmSignatureRequest') {
          const request = confirmation.item as ConfirmationDefinitions['evmSignatureRequest'][0];

          /**
           * TODO: REFACTOR THIS TO SCALE
           * */
          if (request.payload.processId) {
            return t('ui.CONFIRMATIONS.Popup.Confirmations.swapConfirmation');
          }
        }

        return t(titleMap[confirmation.type] || '');
      }

      if (transaction.process) {
        switch (transaction.process.type) {
          case ProcessType.SWAP:
            return t('ui.CONFIRMATIONS.Popup.Confirmations.swapConfirmation');
          case ProcessType.EARNING:
            // TODO: Replace message
            return t('ui.CONFIRMATIONS.Popup.Confirmations.earningConfirmation');
        }
      }

      switch (transaction.extrinsicType) {
        case ExtrinsicType.TRANSFER_BALANCE:
        case ExtrinsicType.TRANSFER_TOKEN:
        case ExtrinsicType.TRANSFER_XCM:
        case ExtrinsicType.SEND_NFT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.transferConfirmation');
        case ExtrinsicType.STAKING_JOIN_POOL:
        case ExtrinsicType.STAKING_BOND:
        case ExtrinsicType.JOIN_YIELD_POOL:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.addToStakeConfirm');
        case ExtrinsicType.STAKING_LEAVE_POOL:
        case ExtrinsicType.STAKING_UNBOND:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.unstakeConfirm');
        case ExtrinsicType.STAKING_WITHDRAW:
        case ExtrinsicType.STAKING_POOL_WITHDRAW:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.withdrawalConfirm');
        case ExtrinsicType.STAKING_CLAIM_REWARD:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.claimRewardsConfirm');
        case ExtrinsicType.STAKING_CANCEL_UNSTAKE:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.cancelUnstakeConfirm');

        case ExtrinsicType.CHANGE_EARNING_VALIDATOR:
          if ((transaction.data as SubmitBittensorChangeValidatorStaking)?.isMovePartialStake) {
            return t('ui.CONFIRMATIONS.Popup.Confirmations.moveYourStakeConfirm');
          }

          return t('ui.CONFIRMATIONS.Popup.Confirmations.changeValidatorConfirm');
        case ExtrinsicType.MINT_VDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.mintVdotConfirm');
        case ExtrinsicType.MINT_VMANTA:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.mintVmantaConfirm');
        case ExtrinsicType.MINT_LDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.mintLdotConfirm');
        case ExtrinsicType.MINT_SDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.mintSdotConfirm');
        case ExtrinsicType.MINT_QDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.mintQdotConfirm');
        case ExtrinsicType.MINT_STDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.mintStdotConfirm');
        case ExtrinsicType.REDEEM_VDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.redeemVdotConfirm');
        case ExtrinsicType.REDEEM_VMANTA:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.redeemVmantaConfirm');
        case ExtrinsicType.REDEEM_LDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.redeemLdotConfirm');
        case ExtrinsicType.REDEEM_SDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.redeemSdotConfirm');
        case ExtrinsicType.REDEEM_QDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.redeemQdotConfirm');
        case ExtrinsicType.REDEEM_STDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.redeemStdotConfirm');
        case ExtrinsicType.UNSTAKE_VDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.unstakeVdotConfirm');
        case ExtrinsicType.UNSTAKE_VMANTA:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.unstakeVmantaConfirm');
        case ExtrinsicType.UNSTAKE_LDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.unstakeLdotConfirm');
        case ExtrinsicType.UNSTAKE_SDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.unstakeSdotConfirm');
        case ExtrinsicType.UNSTAKE_STDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.unstakeQdotConfirm');
        case ExtrinsicType.UNSTAKE_QDOT:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.unstakeStdotConfirm');
        case ExtrinsicType.STAKING_COMPOUNDING:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.stakeCompoundConfirm');
        case ExtrinsicType.STAKING_CANCEL_COMPOUNDING:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.cancelCompoundConfirm');
        case ExtrinsicType.TOKEN_SPENDING_APPROVAL:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.tokenApprove');
        case ExtrinsicType.SWAP:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.swapConfirmation');
        case ExtrinsicType.CLAIM_BRIDGE:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.claimConfirmation');
        case ExtrinsicType.SET_FEE_TOKEN:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.changeFeeTokenConfirm');
        case ExtrinsicType.CROWDLOAN:
        case ExtrinsicType.EVM_EXECUTE:
        case ExtrinsicType.UNKNOWN:
          return t('ui.CONFIRMATIONS.Popup.Confirmations.transactionConfirm');
      }
    } else {
      return t(titleMap[confirmation.type] || '');
    }
  }, [confirmation, t, transactionRequest]);

  useEffect(() => {
    if (numberOfConfirmations) {
      if (index >= numberOfConfirmations) {
        setIndex(numberOfConfirmations - 1);
      }
    }
  }, [index, numberOfConfirmations]);

  return (
    <>
      <div className={className}>
        <ConfirmationHeader
          index={index}
          numberOfConfirmations={numberOfConfirmations}
          onClickNext={nextConfirmation}
          onClickPrev={prevConfirmation}
          title={headerTitle}
        />
        {content}
      </div>
      {
        !!alertProps && (
          <AlertModal
            modalId={alertModalId}
            {...alertProps}
          />
        )
      }
    </>
  );
};

const Confirmations = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',

  '.confirmation-header': {
    paddingTop: token.sizeXS,
    paddingBottom: token.sizeXS,
    backgroundColor: 'transparent',
    marginBottom: token.marginXS,

    h4: {
      marginBottom: 0
    }
  },

  '--content-gap': `${token.sizeMD}px`,

  '.confirmation-content': {
    flex: '1',
    overflow: 'auto',
    padding: `0 ${token.padding}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--content-gap)',
    textAlign: 'center'
  },

  '.__domain': {
    marginBottom: 0
  },

  '.confirmation-footer': {
    display: 'flex',
    flexWrap: 'wrap',
    padding: token.padding,
    gap: token.sizeSM,
    marginBottom: token.margin,

    '.warning-message': {
      width: '100%',
      color: token.colorWarning
    },

    '.ant-btn': {
      flex: 1,

      '&.icon-btn': {
        flex: '0 0 52px'
      }
    }
  },

  '.title': {
    fontSize: token.fontSizeHeading4,
    lineHeight: token.lineHeightHeading4,
    color: token.colorTextBase,
    fontWeight: token.fontWeightStrong
  },

  '.description': {
    fontSize: token.fontSizeHeading6,
    lineHeight: token.lineHeightHeading6,
    color: token.colorTextDescription
  }
}));

export default Confirmations;
