// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ConfirmationDefinitions, ConfirmationResult, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountSignMode } from '@subwallet/extension-base/types';
import { CONFIRMATION_QR_MODAL } from '@subwallet/extension-web-ui/constants/modal';
import { useGetAccountByAddress, useNotification } from '@subwallet/extension-web-ui/hooks';
import useUnlockChecker from '@subwallet/extension-web-ui/hooks/common/useUnlockChecker';
import { completeConfirmation } from '@subwallet/extension-web-ui/messaging';
import { PhosphorIcon, SubmitApiType, ThemeProps } from '@subwallet/extension-web-ui/types';
import { getSignMode, removeTransactionPersist } from '@subwallet/extension-web-ui/utils';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, QrCode, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  id: string;
  type: SubmitApiType;
  payload: ConfirmationDefinitions[SubmitApiType][0];
  extrinsicType?: ExtrinsicType;
  txExpirationTime?: number;
}

const handleConfirm = async (type: SubmitApiType, id: string, payload: string) => {
  return await completeConfirmation(type, {
    id,
    isApproved: true,
    payload
  } as ConfirmationResult<string>);
};

const handleCancel = async (type: SubmitApiType, id: string) => {
  return await completeConfirmation(type, {
    id,
    isApproved: false
  } as ConfirmationResult<string>);
};

const Component: React.FC<Props> = (props: Props) => {
  const { className, extrinsicType, id, payload, txExpirationTime, type } = props;
  const { payload: { address } } = payload;
  const { t } = useTranslation();
  const notify = useNotification();

  const { activeModal } = useContext(ModalContext);

  const checkUnlock = useUnlockChecker();
  const account = useGetAccountByAddress(address);
  const signMode = useMemo(() => getSignMode(account), [account]);
  const [showQuoteExpired, setShowQuoteExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const approveIcon = useMemo((): PhosphorIcon => {
    switch (signMode) {
      case AccountSignMode.QR:
        return QrCode;
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
    setTimeout(() => {
      handleConfirm(type, id, '').finally(() => {
        setLoading(false);
      });
    }, 1000);
  }, [id, type]);

  const onConfirmQr = useCallback(() => {
    activeModal(CONFIRMATION_QR_MODAL);
  }, [activeModal]);

  const onConfirm = useCallback(() => {
    removeTransactionPersist(extrinsicType);

    if (txExpirationTime) {
      const currentTime = +Date.now();

      if (currentTime >= txExpirationTime) {
        notify({
          message: t('Transaction expired'),
          type: 'error'
        });
        onCancel();
      }
    }

    switch (signMode) {
      case AccountSignMode.QR:
        onConfirmQr();
        break;
      default:
        checkUnlock().then(() => {
          onApprovePassword();
        }).catch(() => {
          // Unlock is cancelled
        });
    }
  }, [extrinsicType, txExpirationTime, signMode, notify, t, onCancel, onConfirmQr, checkUnlock, onApprovePassword]);

  useEffect(() => {
    let timer: NodeJS.Timer;

    if (txExpirationTime) {
      timer = setInterval(() => {
        if (Date.now() >= txExpirationTime) {
          setShowQuoteExpired(true);
          clearInterval(timer);
        }
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [txExpirationTime]);

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
        disabled={showQuoteExpired}
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
    </div>
  );
};

const SubmitApiArea = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '&.confirmation-footer': {
      '.alert-box': {
        width: '100%'
      }
    }
  };
});

export default SubmitApiArea;
