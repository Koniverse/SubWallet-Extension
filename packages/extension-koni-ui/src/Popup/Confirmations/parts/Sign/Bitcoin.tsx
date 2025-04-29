// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BitcoinSignatureRequest, BitcoinSignPsbtRequest, ConfirmationDefinitionsBitcoin, ConfirmationResult, EvmSendTransactionRequest, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { RequestSubmitTransferWithId } from '@subwallet/extension-base/types/balance/transfer';
import { wait } from '@subwallet/extension-base/utils';
import { CONFIRMATION_QR_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetChainInfoByChainId, useLedger, useNotification, useUnlockChecker } from '@subwallet/extension-koni-ui/hooks';
import { completeConfirmationBitcoin, makeBitcoinDappTransferConfirmation, makePSBTTransferAfterConfirmation } from '@subwallet/extension-koni-ui/messaging';
import { AccountSignMode, BitcoinSignatureSupportType, PhosphorIcon, SigData, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getSignMode, isBitcoinMessage, removeTransactionPersist } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, QrCode, Swatches, Wallet, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { hexToU8a, u8aToU8a } from '@polkadot/util';

import { ScanSignature } from '../Qr';

interface Props extends ThemeProps {
  id: string;
  type: BitcoinSignatureSupportType;
  payload: ConfirmationDefinitionsBitcoin[BitcoinSignatureSupportType][0];
  extrinsicType?: ExtrinsicType;
  editedPayload?: RequestSubmitTransferWithId;
  canSign?: boolean;
}

const handleConfirm = async (type: BitcoinSignatureSupportType, id: string, payload: string) => {
  return await completeConfirmationBitcoin(type, {
    id,
    isApproved: true,
    payload
  } as ConfirmationResult<string>);
};

const handleCancel = async (type: BitcoinSignatureSupportType, id: string) => {
  return await completeConfirmationBitcoin(type, {
    id,
    isApproved: false
  } as ConfirmationResult<string>);
};

const handleSignature = async (type: BitcoinSignatureSupportType, id: string, signature: string) => {
  return await completeConfirmationBitcoin(type, {
    id,
    isApproved: true,
    payload: signature
  } as ConfirmationResult<string>);
};

const Component: React.FC<Props> = (props: Props) => {
  const { canSign, className, editedPayload, extrinsicType, id, payload, type } = props;
  const { payload: { hashPayload } } = payload;
  const { account } = (payload.payload as BitcoinSignatureRequest);
  // TODO: [Review] Error eslint
  const chainId = (payload.payload as EvmSendTransactionRequest)?.chainId || 1;

  const { t } = useTranslation();
  const notify = useNotification();

  const { activeModal } = useContext(ModalContext);

  const chain = useGetChainInfoByChainId(chainId);

  const checkUnlock = useUnlockChecker();
  const signMode = useMemo(() => getSignMode(account), [account]);
  // TODO: [Review] type generic_ledger or legacy_ledger
  const isLedger = useMemo(() => signMode === AccountSignMode.GENERIC_LEDGER, [signMode]);
  const isMessage = isBitcoinMessage(payload);

  const [loading, setLoading] = useState(false);

  const { error: ledgerError,
    isLoading: isLedgerLoading,
    isLocked,
    ledger,
    refresh: refreshLedger,
    signMessage: ledgerSignMessage,
    signTransaction: ledgerSignTransaction,
    warning: ledgerWarning } = useLedger(chain?.slug, isLedger);

  const isLedgerConnected = useMemo(() => !isLocked && !isLedgerLoading && !!ledger, [
    isLedgerLoading,
    isLocked,
    ledger
  ]);

  const approveIcon = useMemo((): PhosphorIcon => {
    switch (signMode) {
      case AccountSignMode.QR:
        return QrCode;
      case AccountSignMode.GENERIC_LEDGER:
        return Swatches;
      case AccountSignMode.INJECTED:
        return Wallet;
      default:
        return CheckCircle;
    }
  }, [signMode]);

  // Handle buttons actions
  const onCancel = useCallback(() => {
    setLoading(true);
    handleCancel(type, id).finally(() => {
      setLoading(false);
    });
  }, [id, type]);

  const onApprovePassword = useCallback(() => {
    setLoading(true);

    const promise = async () => {
      if (type === 'bitcoinSendTransactionRequestAfterConfirmation' && editedPayload) {
        await makeBitcoinDappTransferConfirmation(editedPayload);
      } else if (type === 'bitcoinSignPsbtRequest') {
        const { payload: { account, broadcast, network, psbt, to, tokenSlug, txInput, txOutput, value } } = payload.payload as BitcoinSignPsbtRequest;

        if (broadcast) {
          await makePSBTTransferAfterConfirmation({ id, chain: network, txOutput, txInput, tokenSlug, psbt, from: account, to, value });
        } else {
          await wait(1000);
        }
      } else {
        await wait(1000);
      }
    };

    promise().then(() => {
      handleConfirm(type, id, '').finally(() => {
        setLoading(false);
      });
    })
      .catch((error) => {
        console.error(error);
        notify({
          message: t((error as Error).message),
          type: 'error',
          duration: 8
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [editedPayload, id, notify, payload.payload, t, type]);

  const onApproveSignature = useCallback((signature: SigData) => {
    setLoading(true);

    setTimeout(() => {
      handleSignature(type, id, signature.signature)
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [id, type]);

  const onConfirmQr = useCallback(() => {
    activeModal(CONFIRMATION_QR_MODAL);
  }, [activeModal]);

  const onConfirmLedger = useCallback(() => {
    if (!hashPayload) {
      return;
    }

    if (!isLedgerConnected || !ledger) {
      refreshLedger();

      return;
    }

    setLoading(true);

    setTimeout(() => {
      // TODO: Review metadata of ledgerSignTransaction
      const signPromise = isMessage ? ledgerSignMessage(u8aToU8a(hashPayload), account?.accountIndex, account?.addressOffset) : ledgerSignTransaction(hexToU8a(hashPayload), new Uint8Array(0), account?.accountIndex, account?.addressOffset);

      signPromise
        .then(({ signature }) => {
          onApproveSignature({ signature });
        })
        .catch((e: Error) => {
          console.log(e);
          setLoading(false);
        });
    });
  }, [account?.accountIndex, account?.addressOffset, hashPayload, isLedgerConnected, isMessage, ledger, ledgerSignMessage, ledgerSignTransaction, onApproveSignature, refreshLedger]);

  const onConfirmInject = useCallback(() => {
    console.error('Not implemented yet');
    // if (evmWallet) {
    //   let promise: Promise<`0x${string}`>;
    //
    //   if (isMessage) {
    //     promise = evmWallet.request<`0x${string}`>({ method: payload.payload.type, params: [account.address, payload.payload.payload] });
    //   } else {
    //     promise = new Promise<`0x${string}`>((resolve, reject) => {
    //       const { account, canSign, hashPayload, ...transactionConfig } = payload.payload;
    //
    //       evmWallet.request({
    //         method: 'wallet_switchEthereumChain',
    //         params: [{ chainId: chainId.toString(16) }]
    //       })
    //         .then(() => evmWallet.request<`0x${string}`>({
    //           method: 'eth_sendTransaction',
    //           params: [transactionConfig]
    //         }))
    //         .then((value) => {
    //           resolve(value);
    //         })
    //         .catch(reject);
    //     });
    //   }
    //
    //   setLoading(true);
    //   promise
    //     .then((signature) => {
    //       onApproveSignature({ signature });
    //     })
    //     .catch((e) => {
    //       console.error(e);
    //     })
    //     .finally(() => {
    //       setLoading(false);
    //     });
    // }
  }, []);

  const onConfirm = useCallback(() => {
    removeTransactionPersist(extrinsicType);

    switch (signMode) {
      case AccountSignMode.QR:
        onConfirmQr();
        break;
      case AccountSignMode.GENERIC_LEDGER:
        onConfirmLedger();
        break;
      case AccountSignMode.INJECTED:
        onConfirmInject();
        break;
      default:
        checkUnlock().then(() => {
          onApprovePassword();
        }).catch(() => {
          // Unlock is cancelled
        });
    }
  }, [checkUnlock, extrinsicType, onConfirmInject, onApprovePassword, onConfirmLedger, onConfirmQr, signMode]);

  useEffect(() => {
    !!ledgerError && notify({
      message: ledgerError,
      type: 'error'
    });
  }, [ledgerError, notify]);

  useEffect(() => {
    !!ledgerWarning && notify({
      message: ledgerWarning,
      type: 'warning'
    });
  }, [ledgerWarning, notify]);

  return (
    <div className={CN(className, 'confirmation-footer')}>
      <Button
        disabled={loading}
        icon={(
          <Icon
            phosphorIcon={XCircle}
            weight='fill'
          />
        )}
        onClick={onCancel}
        schema={'secondary'}
      >
        {t('Cancel')}
      </Button>
      <Button
        disabled={!(canSign === undefined ? payload.payload.canSign : canSign && payload.payload.canSign)}
        icon={(
          <Icon
            phosphorIcon={approveIcon}
            weight='fill'
          />
        )}
        loading={loading}
        onClick={onConfirm}
      >
        {t('Approve')}
      </Button>
      {/* { */}
      {/*   signMode === AccountSignMode.QR && ( */}
      {/*     <DisplayPayloadModal> */}
      {/*       <EvmQr */}
      {/*         address={account.address} */}
      {/*         hashPayload={hashPayload} */}
      {/*         isMessage={isEvmMessage(payload)} */}
      {/*       /> */}
      {/*     </DisplayPayloadModal> */}
      {/*   ) */}
      {/* } */}
      {signMode === AccountSignMode.QR && <ScanSignature onSignature={onApproveSignature} />}
    </div>
  );
};

const BitcoinSignArea = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {};
});

export default BitcoinSignArea;
