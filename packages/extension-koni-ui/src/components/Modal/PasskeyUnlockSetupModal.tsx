// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PASSKEY_UNLOCK_SETUP_MODAL } from '@subwallet/extension-koni-ui/constants';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isPasskeyPromptCancelled } from '@subwallet/extension-koni-ui/utils/passkeyUnlock';
import { Button, Icon, PageIcon, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { Fingerprint, XCircle } from 'phosphor-react';
import React, { useCallback, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';

interface Props extends ThemeProps {
  /** Runs the enrollment; rejects when it fails, so the user can retry or skip */
  onEnable: () => Promise<void>;
  onSkip: () => void;
}

const modalId = PASSKEY_UNLOCK_SETUP_MODAL;

function Component ({ className, onEnable, onSkip }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onClickEnable = useCallback(() => {
    setLoading(true);
    setError('');

    onEnable()
      .catch((e: Error) => {
        console.error('Passkey unlock setup failed', e);

        // Closing the browser prompt is a choice, not a failure: leave the offer as it is
        if (!isPasskeyPromptCancelled(e)) {
          setError(t('ui.ACCOUNT.components.Modal.PasskeyUnlockSetup.setupFailed'));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [onEnable, t]);

  const onClickSkip = useCallback(() => {
    if (!loading) {
      onSkip();
    }
  }, [loading, onSkip]);

  const footerModal = useMemo(() => {
    return (
      <>
        <Button
          block={true}
          disabled={loading}
          icon={(
            <Icon
              phosphorIcon={XCircle}
              weight='fill'
            />
          )}
          onClick={onClickSkip}
          schema='secondary'
        >
          {t('ui.ACCOUNT.components.Modal.PasskeyUnlockSetup.notNow')}
        </Button>

        <Button
          block={true}
          icon={(
            <Icon
              phosphorIcon={Fingerprint}
              weight='fill'
            />
          )}
          loading={loading}
          onClick={onClickEnable}
        >
          {t('ui.ACCOUNT.components.Modal.PasskeyUnlockSetup.enable')}
        </Button>
      </>
    );
  }, [loading, onClickEnable, onClickSkip, t]);

  return (
    <SwModal
      className={CN(className)}
      closable={true}
      footer={footerModal}
      id={modalId}
      maskClosable={false}
      onCancel={onClickSkip}
      title={t('ui.ACCOUNT.components.Modal.PasskeyUnlockSetup.title')}
    >
      <div className='__modal-content'>
        <PageIcon
          color={token['colorPrimary-6']}
          iconProps={{
            weight: 'fill',
            phosphorIcon: Fingerprint
          }}
        />
        <div className='__modal-description'>
          {t('ui.ACCOUNT.components.Modal.PasskeyUnlockSetup.description')}
        </div>
        {!!error && <div className='__modal-error'>{error}</div>}
      </div>
    </SwModal>
  );
}

const PasskeyUnlockSetupModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
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

    '.__modal-error': {
      textAlign: 'center',
      color: token.colorError,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM
    },

    '.ant-sw-modal-footer': {
      borderTop: 'none',
      display: 'flex',
      gap: token.sizeSM
    }
  };
});

export default PasskeyUnlockSetupModal;
