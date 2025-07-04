// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ConfirmationDefinitionsCardano, ConfirmationResult, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AlertBox } from '@subwallet/extension-koni-ui/components';
import { useNotification } from '@subwallet/extension-koni-ui/hooks';
import useUnlockChecker from '@subwallet/extension-koni-ui/hooks/common/useUnlockChecker';
import { completeConfirmationCardano } from '@subwallet/extension-koni-ui/messaging';
import { CardanoSignatureSupportType, PhosphorIcon, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { removeTransactionPersist } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  id: string;
  type: CardanoSignatureSupportType;
  payload: ConfirmationDefinitionsCardano[CardanoSignatureSupportType][0];
  extrinsicType?: ExtrinsicType;
  txExpirationTime?: number;
}

const handleConfirm = async (type: CardanoSignatureSupportType, id: string, payload: string) => {
  return await completeConfirmationCardano(type, {
    id,
    isApproved: true,
    payload
  } as ConfirmationResult<string>);
};

const handleCancel = async (type: CardanoSignatureSupportType, id: string) => {
  return await completeConfirmationCardano(type, {
    id,
    isApproved: false
  } as ConfirmationResult<string>);
};

const Component: React.FC<Props> = (props: Props) => {
  const { className, extrinsicType, id, payload, txExpirationTime, type } = props;
  const { payload: { errors } } = payload;

  const { t } = useTranslation();
  const notify = useNotification();

  const checkUnlock = useUnlockChecker();

  const [showQuoteExpired, setShowQuoteExpired] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);

  const approveIcon = useMemo((): PhosphorIcon => {
    return CheckCircle;
  }, []);
  const isErrorTransaction = useMemo(() => errors && errors.length > 0, [errors]);
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

  const onConfirm = useCallback(() => {
    removeTransactionPersist(extrinsicType);

    if (txExpirationTime) {
      const currentTime = +Date.now();

      if (currentTime >= txExpirationTime) {
        notify({
          message: t('ui.Confirmations.Sign.Cardano.transactionExpired'),
          type: 'error'
        });
        onCancel();
      }
    }

    checkUnlock().then(() => {
      onApprovePassword();
    }).catch(() => {
      // Unlock is cancelled
    });
  }, [extrinsicType, txExpirationTime, notify, t, onCancel, checkUnlock, onApprovePassword]);

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
      {
        isErrorTransaction && errors && (
          <AlertBox
            className={CN(className, 'alert-box')}
            description={errors[0].message}
            title={errors[0].name}
            type={'error'}
          />
        )
      }
      {
        isErrorTransaction
          ? <Button
            disabled={loading}
            onClick={onCancel}
            schema={'primary'}
          >
            {t('ui.Confirmations.Sign.Cardano.iUnderstand')}
          </Button>
          : <Button
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
            {t('ui.Confirmations.Sign.Cardano.cancel')}
          </Button>
      }
      {!isErrorTransaction && <Button
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
        {t('ui.Confirmations.Sign.Cardano.approve')}
      </Button> }
    </div>
  );
};

const CardanoSignArea = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '&.confirmation-footer': {
      '.alert-box': {
        width: '100%'
      }
    }
  };
});

export default CardanoSignArea;
