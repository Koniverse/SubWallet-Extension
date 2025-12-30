// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ConfirmationDefinitions, ConfirmationDefinitionsBitcoin, ConfirmationDefinitionsCardano, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AuthorizeRequest, MetadataRequest, SigningRequest } from '@subwallet/extension-base/background/types';
import { _isSubstrateEvmCompatibleChain } from '@subwallet/extension-base/services/chain-service/utils';
import { GovVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { WalletConnectNotSupportRequest, WalletConnectSessionRequest } from '@subwallet/extension-base/services/wallet-connect-service/types';
import { AccountJson, AccountSignMode, ProcessType, SubmitBittensorChangeValidatorStaking } from '@subwallet/extension-base/types';
import { _isRuntimeUpdated, detectTranslate } from '@subwallet/extension-base/utils';
import { AlertModal } from '@subwallet/extension-koni-ui/components';
import { isProductionMode, NEED_SIGN_CONFIRMATION } from '@subwallet/extension-koni-ui/constants';
import { useAlert, useConfirmationsInfo, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { SubmitApiConfirmation } from '@subwallet/extension-koni-ui/Popup/Confirmations/variants/Action';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ConfirmationType } from '@subwallet/extension-koni-ui/stores/base/RequestState';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { findAccountByAddress, findChainInfoByGenesisHash, getSignMode, isRawPayload } from '@subwallet/extension-koni-ui/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { SignerPayloadJSON } from '@polkadot/types/types';
import { isEthereumAddress } from '@polkadot/util-crypto';

import { ConfirmationHeader } from './parts';
import { AddNetworkConfirmation, AddTokenConfirmation, AuthorizeConfirmation, BitcoinSendTransactionRequestConfirmation, BitcoinSignatureConfirmation, BitcoinSignPsbtConfirmation, CardanoSignatureConfirmation, CardanoSignTransactionConfirmation, ConnectWalletConnectConfirmation, EvmSignatureConfirmation, EvmSignatureWithProcess, EvmTransactionConfirmation, MetadataConfirmation, NetworkConnectionErrorConfirmation, NotSupportConfirmation, NotSupportWCConfirmation, SignConfirmation, TransactionConfirmation } from './variants';

type Props = ThemeProps

const titleMap: Record<ConfirmationType, string> = {
  addNetworkRequest: detectTranslate('ui.Confirmations.addNetworkRequest'),
  addTokenRequest: detectTranslate('ui.Confirmations.addTokenRequest'),
  authorizeRequest: detectTranslate('ui.Confirmations.connectWithSubWallet'),
  evmSendTransactionRequest: detectTranslate('ui.Confirmations.transactionRequest'),
  evmSignatureRequest: detectTranslate('ui.Confirmations.signatureRequest'),
  cardanoSignatureRequest: detectTranslate('ui.Confirmations.signatureRequest'),
  cardanoSignTransactionRequest: detectTranslate('ui.Confirmations.transactionRequest'),
  bitcoinSignatureRequest: detectTranslate('ui.Confirmations.signatureRequest'),
  bitcoinSendTransactionRequest: detectTranslate('ui.Confirmations.transactionRequest'),
  bitcoinSendTransactionRequestAfterConfirmation: detectTranslate('ui.Confirmations.transactionRequest'),
  bitcoinWatchTransactionRequest: detectTranslate('ui.Confirmations.transactionRequest'),
  bitcoinSignPsbtRequest: detectTranslate('ui.Confirmations.signPsbtRequest'),
  metadataRequest: detectTranslate('ui.Confirmations.updateMetadata'),
  signingRequest: detectTranslate('ui.Confirmations.signatureRequest'),
  connectWCRequest: detectTranslate('ui.Confirmations.walletConnect'),
  notSupportWCRequest: detectTranslate('ui.Confirmations.walletConnect'),
  errorConnectNetwork: detectTranslate('ui.Confirmations.transactionRequest'),
  submitApiRequest: detectTranslate('ui.Confirmations.approveRequest')
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
            return t('ui.Confirmations.swapConfirmation');
          }
        }

        return t(titleMap[confirmation.type] || '');
      }

      if (transaction.process) {
        switch (transaction.process.type) {
          case ProcessType.SWAP:
            return t('ui.Confirmations.swapConfirmation');
          case ProcessType.EARNING:
            // TODO: Replace message
            return t('ui.Confirmations.earningConfirmation');
        }
      }

      switch (transaction.extrinsicType) {
        case ExtrinsicType.TRANSFER_BALANCE:
        case ExtrinsicType.TRANSFER_TOKEN:
        case ExtrinsicType.TRANSFER_XCM:
        case ExtrinsicType.SEND_NFT:
          return t('ui.Confirmations.transferConfirmation');
        case ExtrinsicType.STAKING_JOIN_POOL:
        case ExtrinsicType.STAKING_BOND:
        case ExtrinsicType.JOIN_YIELD_POOL:
          return t('ui.Confirmations.addToStakeConfirm');
        case ExtrinsicType.STAKING_LEAVE_POOL:
        case ExtrinsicType.STAKING_UNBOND:
          return t('ui.Confirmations.unstakeConfirm');
        case ExtrinsicType.STAKING_WITHDRAW:
        case ExtrinsicType.STAKING_POOL_WITHDRAW:
          return t('ui.Confirmations.withdrawalConfirm');
        case ExtrinsicType.STAKING_CLAIM_REWARD:
          return t('ui.Confirmations.claimRewardsConfirm');
        case ExtrinsicType.STAKING_CANCEL_UNSTAKE:
          return t('ui.Confirmations.cancelUnstakeConfirm');

        case ExtrinsicType.CHANGE_EARNING_VALIDATOR:
          if ((transaction.data as SubmitBittensorChangeValidatorStaking)?.isMovePartialStake) {
            return t('ui.Confirmations.moveStakeConfirm');
          }

          return t('ui.Confirmations.changeValidatorConfirm');
        case ExtrinsicType.MINT_VDOT:
          return t('ui.Confirmations.mintVDotConfirm');
        case ExtrinsicType.MINT_VMANTA:
          return t('ui.Confirmations.mintVMantaConfirm');
        case ExtrinsicType.MINT_LDOT:
          return t('ui.Confirmations.mintLDotConfirm');
        case ExtrinsicType.MINT_SDOT:
          return t('ui.Confirmations.mintSDotConfirm');
        case ExtrinsicType.MINT_QDOT:
          return t('ui.Confirmations.mintQDotConfirm');
        case ExtrinsicType.MINT_STDOT:
          return t('ui.Confirmations.mintStDotConfirm');
        case ExtrinsicType.REDEEM_VDOT:
          return t('ui.Confirmations.redeemVDotConfirm');
        case ExtrinsicType.REDEEM_VMANTA:
          return t('ui.Confirmations.redeemVMantaConfirm');
        case ExtrinsicType.REDEEM_LDOT:
          return t('ui.Confirmations.redeemLDotConfirm');
        case ExtrinsicType.REDEEM_SDOT:
          return t('ui.Confirmations.redeemSDotConfirm');
        case ExtrinsicType.REDEEM_QDOT:
          return t('ui.Confirmations.redeemQDotConfirm');
        case ExtrinsicType.REDEEM_STDOT:
          return t('ui.Confirmations.redeemStDotConfirm');
        case ExtrinsicType.UNSTAKE_VDOT:
          return t('ui.Confirmations.unstakeVDotConfirm');
        case ExtrinsicType.UNSTAKE_VMANTA:
          return t('ui.Confirmations.unstakeVMantaConfirm');
        case ExtrinsicType.UNSTAKE_LDOT:
          return t('ui.Confirmations.unstakeLDotConfirm');
        case ExtrinsicType.UNSTAKE_SDOT:
          return t('ui.Confirmations.unstakeSDotConfirm');
        case ExtrinsicType.UNSTAKE_STDOT:
          return t('ui.Confirmations.unstakeQDotConfirm');
        case ExtrinsicType.UNSTAKE_QDOT:
          return t('ui.Confirmations.unstakeStDotConfirm');
        case ExtrinsicType.STAKING_COMPOUNDING:
          return t('ui.Confirmations.stakeCompoundConfirm');
        case ExtrinsicType.STAKING_CANCEL_COMPOUNDING:
          return t('ui.Confirmations.cancelCompoundConfirm');
        case ExtrinsicType.TOKEN_SPENDING_APPROVAL:
          return t('ui.Confirmations.tokenApprove');
        case ExtrinsicType.SWAP:
          return t('ui.Confirmations.swapConfirmation');
        case ExtrinsicType.CLAIM_BRIDGE:
          return t('ui.Confirmations.claimConfirmation');
        case ExtrinsicType.GOV_VOTE:
          return t('ui.Confirmations.voteForId', { id: (transaction.data as GovVoteRequest).referendumIndex });
        case ExtrinsicType.GOV_UNVOTE:
          return t('ui.Confirmations.unvoteConfirmation');
        case ExtrinsicType.GOV_UNLOCK_VOTE:
          return t('ui.Confirmations.unlockVotesConfirmation');
        case ExtrinsicType.CROWDLOAN:
        case ExtrinsicType.EVM_EXECUTE:
        case ExtrinsicType.UNKNOWN:
          return t('ui.Confirmations.transactionConfirm');
        case ExtrinsicType.MULTISIG_APPROVE_TX:
          return t('Multisig approve unstake');
        case ExtrinsicType.MULTISIG_CANCEL_TX:
          return t('Multisig cancel unstake');
        case ExtrinsicType.MULTISIG_EXECUTE_TX:
          return t('Multisig execute unstake');
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
    '.ant-sw-header-center-part': {
      width: 'fit-content'
    },

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
