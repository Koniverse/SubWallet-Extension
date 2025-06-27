// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ConfirmationDefinitions, ConfirmationDefinitionsBitcoin, ConfirmationDefinitionsCardano, ConfirmationDefinitionsTon, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { SigningRequest } from '@subwallet/extension-base/background/types';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { ProcessType, SwapBaseTxData } from '@subwallet/extension-base/types';
import { SwapTxData } from '@subwallet/extension-base/types/swap';
import { AlertBox, AlertBoxInstant } from '@subwallet/extension-koni-ui/components';
import { useIsPolkadotUnifiedChain, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { SubmitApiArea } from '@subwallet/extension-koni-ui/Popup/Confirmations/parts';
import CardanoSignArea from '@subwallet/extension-koni-ui/Popup/Confirmations/parts/Sign/Cardano';
import TonSignArea from '@subwallet/extension-koni-ui/Popup/Confirmations/parts/Sign/Ton';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ConfirmationQueueItem } from '@subwallet/extension-koni-ui/stores/base/RequestState';
import { AlertDialogProps, ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { BitcoinSignArea, EvmSignArea, SubstrateSignArea } from '../../parts/Sign';
import { BaseProcessConfirmation, BaseTransactionConfirmation, BondTransactionConfirmation, CancelUnstakeTransactionConfirmation, ChangeEarningValidatorTransactionConfirmation, ClaimBridgeTransactionConfirmation, ClaimRewardTransactionConfirmation, DefaultWithdrawTransactionConfirmation, EarnProcessConfirmation, FastWithdrawTransactionConfirmation, JoinPoolTransactionConfirmation, JoinYieldPoolConfirmation, LeavePoolTransactionConfirmation, SendNftTransactionConfirmation, SwapProcessConfirmation, SwapTransactionConfirmation, TokenApproveConfirmation, TransferBlock, UnbondTransactionConfirmation, WithdrawTransactionConfirmation } from './variants';

interface Props extends ThemeProps {
  confirmation: ConfirmationQueueItem;
  openAlert: (alertProps: AlertDialogProps) => void;
  closeAlert: VoidFunction;
}

const getTransactionComponent = (extrinsicType: ExtrinsicType): typeof BaseTransactionConfirmation => {
  switch (extrinsicType) {
    case ExtrinsicType.TRANSFER_BALANCE:
    case ExtrinsicType.TRANSFER_TOKEN:
    case ExtrinsicType.TRANSFER_XCM:
      return TransferBlock;
    case ExtrinsicType.SEND_NFT:
      return SendNftTransactionConfirmation;
    case ExtrinsicType.STAKING_JOIN_POOL:
    case ExtrinsicType.JOIN_YIELD_POOL:
      return JoinPoolTransactionConfirmation;
    case ExtrinsicType.STAKING_LEAVE_POOL:
      return LeavePoolTransactionConfirmation;
    case ExtrinsicType.STAKING_BOND:
      return BondTransactionConfirmation;
    case ExtrinsicType.STAKING_UNBOND:
      return UnbondTransactionConfirmation;
    case ExtrinsicType.CHANGE_EARNING_VALIDATOR:
      return ChangeEarningValidatorTransactionConfirmation;
    case ExtrinsicType.STAKING_WITHDRAW:
    case ExtrinsicType.STAKING_POOL_WITHDRAW:
      return WithdrawTransactionConfirmation;
    case ExtrinsicType.STAKING_CLAIM_REWARD:
      return ClaimRewardTransactionConfirmation;
    case ExtrinsicType.STAKING_CANCEL_UNSTAKE:
      return CancelUnstakeTransactionConfirmation;
    case ExtrinsicType.MINT_QDOT:
    case ExtrinsicType.MINT_VDOT:
    case ExtrinsicType.MINT_LDOT:
    case ExtrinsicType.MINT_SDOT:
    case ExtrinsicType.MINT_STDOT:
    case ExtrinsicType.MINT_VMANTA:
      return JoinYieldPoolConfirmation;
    case ExtrinsicType.REDEEM_QDOT:
    case ExtrinsicType.REDEEM_VDOT:
    case ExtrinsicType.REDEEM_LDOT:
    case ExtrinsicType.REDEEM_SDOT:
    case ExtrinsicType.REDEEM_STDOT:
    case ExtrinsicType.REDEEM_VMANTA:
      return FastWithdrawTransactionConfirmation;
    case ExtrinsicType.UNSTAKE_QDOT:
    case ExtrinsicType.UNSTAKE_VDOT:
    case ExtrinsicType.UNSTAKE_LDOT:
    case ExtrinsicType.UNSTAKE_SDOT:
    case ExtrinsicType.UNSTAKE_STDOT:
    case ExtrinsicType.UNSTAKE_VMANTA:
      return DefaultWithdrawTransactionConfirmation;
    case ExtrinsicType.TOKEN_SPENDING_APPROVAL:
      return TokenApproveConfirmation;
    case ExtrinsicType.SWAP:
      return SwapTransactionConfirmation;
    case ExtrinsicType.CLAIM_BRIDGE:
      return ClaimBridgeTransactionConfirmation;
    case ExtrinsicType.CROWDLOAN:
    case ExtrinsicType.STAKING_CANCEL_COMPOUNDING:
    case ExtrinsicType.STAKING_COMPOUNDING:
    case ExtrinsicType.EVM_EXECUTE:
    case ExtrinsicType.UNKNOWN:
    default:
      return BaseTransactionConfirmation;
  }
};

// TODO: NEED TO MERGE THESE COMPONENTS TO COMPONENTS IN THE PROCESS DIRECTORY
const getProcessComponent = (processType: ProcessType): typeof BaseProcessConfirmation => {
  switch (processType) {
    case ProcessType.SWAP:
      return SwapProcessConfirmation;
    case ProcessType.EARNING:
      return EarnProcessConfirmation;
    default:
      return BaseProcessConfirmation;
  }
};

const Component: React.FC<Props> = (props: Props) => {
  const { className, closeAlert, confirmation: { item, type }, openAlert } = props;
  const { id } = item;

  const { t } = useTranslation();

  const { transactionRequest } = useSelector((state: RootState) => state.requestState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

  const transaction = useMemo(() => transactionRequest[id], [transactionRequest, id]);

  const checkIsPolkadotUnifiedChain = useIsPolkadotUnifiedChain();

  const network = useMemo(() => chainInfoMap[transaction.chain], [chainInfoMap, transaction.chain]);

  const renderContent = useCallback((transaction: SWTransactionResult): React.ReactNode => {
    const { extrinsicType, process } = transaction;

    if (process) {
      const Component = getProcessComponent(process.type);

      return (
        <Component
          closeAlert={closeAlert}
          openAlert={openAlert}
          transaction={transaction}
        />
      );
    }

    const Component = getTransactionComponent(extrinsicType);

    return (
      <Component
        closeAlert={closeAlert}
        openAlert={openAlert}
        transaction={transaction}
      />
    );
  }, [closeAlert, openAlert]);

  const txExpirationTime = useMemo((): number | undefined => {
    // transaction might only be valid for a certain period of time
    if (transaction.extrinsicType === ExtrinsicType.SWAP) {
      const data = transaction.data as SwapTxData;

      return data.quote.aliveUntil;
    }

    if (transaction.process && transaction.process.type === ProcessType.SWAP) {
      const data = transaction.process.combineInfo as SwapBaseTxData;

      return data.quote.aliveUntil;
    }
    // todo: there might be more types of extrinsic

    return undefined;
  }, [transaction.data, transaction.extrinsicType, transaction.process]);

  const isAddressFormatInfoBoxVisible = useMemo(() => {
    if ([ExtrinsicType.TRANSFER_BALANCE, ExtrinsicType.TRANSFER_TOKEN].includes(transaction.extrinsicType)) {
      const targetChain = transaction.chain;

      return checkIsPolkadotUnifiedChain(targetChain);
    }

    return false;
  }, [checkIsPolkadotUnifiedChain, transaction.chain, transaction.extrinsicType]);

  return (
    <>
      <div className={CN(className, 'confirmation-content')}>
        {renderContent(transaction)}
        {isAddressFormatInfoBoxVisible && (
          <AlertBoxInstant
            className={'address-format-info-box'}
            type={'new-address-format'}
          />
        )}
        {!!transaction.estimateFee?.tooHigh && (
          <AlertBox
            className='network-box'
            description={t('Gas fees on {{networkName}} are high due to high demands, so gas estimates are less accurate.', { replace: { networkName: network?.name } })}
            title={t('Pay attention!')}
            type='warning'
          />
        )}
      </div>
      {
        type === 'signingRequest' && (
          <SubstrateSignArea
            extrinsicType={transaction.extrinsicType}
            id={item.id}
            isInternal={item.isInternal}
            request={(item as SigningRequest).request}
            txExpirationTime={txExpirationTime}
          />
        )
      }
      {
        (type === 'evmSendTransactionRequest' || type === 'evmWatchTransactionRequest') && (
          <EvmSignArea
            extrinsicType={transaction.extrinsicType}
            id={item.id}
            payload={(item as ConfirmationDefinitions['evmSendTransactionRequest' | 'evmWatchTransactionRequest'][0])}
            txExpirationTime={txExpirationTime}
            type={type}
          />
        )
      }
      {
        (type === 'submitApiRequest') && (
          <SubmitApiArea
            extrinsicType={transaction.extrinsicType}
            id={item.id}
            payload={(item as ConfirmationDefinitions['submitApiRequest'][0])}
            txExpirationTime={txExpirationTime}
            type={type}
          />
        )
      }
      {
        (type === 'tonSendTransactionRequest' || type === 'tonWatchTransactionRequest') && (
          <TonSignArea
            extrinsicType={transaction.extrinsicType}
            id={item.id}
            payload={(item as ConfirmationDefinitionsTon['tonSendTransactionRequest' | 'tonWatchTransactionRequest'][0])}
            txExpirationTime={txExpirationTime}
            type={type}
          />
        )
      }
      {
        (type === 'cardanoSendTransactionRequest' || type === 'cardanoWatchTransactionRequest') && (
          <CardanoSignArea
            extrinsicType={transaction.extrinsicType}
            id={item.id}
            payload={(item as ConfirmationDefinitionsCardano['cardanoSendTransactionRequest' | 'cardanoWatchTransactionRequest'][0])}
            txExpirationTime={txExpirationTime}
            type={type}
          />
        )
      }
      {
        (type === 'bitcoinSignatureRequest' || type === 'bitcoinSendTransactionRequest' || type === 'bitcoinWatchTransactionRequest' || type === 'bitcoinSignPsbtRequest') && (
          <BitcoinSignArea
            extrinsicType={transaction.extrinsicType}
            id={item.id}
            payload={(item as ConfirmationDefinitionsBitcoin['bitcoinSignatureRequest' | 'bitcoinSendTransactionRequest' | 'bitcoinWatchTransactionRequest' | 'bitcoinSignPsbtRequest'][0])}
            type={type}
          />
        )
      }
    </>
  );
};

const TransactionConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '--content-gap': 0,
    marginTop: token.marginXS,

    '.network-box, .address-format-info-box': {
      marginTop: token.marginSM
    },

    '.-to-right': {
      '.__value': {
        textAlign: 'right'
      }
    }
  };
});

export default TransactionConfirmation;
