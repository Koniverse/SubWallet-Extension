// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { REQUEST_CAMERA_ACCESS_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { GearSix, Warning } from 'phosphor-react';
import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

const modalId = REQUEST_CAMERA_ACCESS_MODAL;

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { inactiveModal } = useContext(ModalContext);

  const closeModal = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onClick = useCallback(() => {
    closeModal();

    navigate('/settings/security', { state: true });
  }, [closeModal, navigate]);

  return (
    <SwModal
      id={modalId}
      onCancel={closeModal}
      title={t('ui.Modal.RequestCameraAccess.cannotScan')}
      wrapClassName={CN(className)}
    >
      <div className='body-container'>
        <div className='notice'>
          <Icon
            iconColor='var(--icon-warning-color)'
            phosphorIcon={Warning}
            size='sm'
          />
          <div className='title'>
            {t('ui.Modal.RequestCameraAccess.cameraNotAvailable')}
          </div>
        </div>
        <div className='description'>
          {t('ui.Modal.RequestCameraAccess.allowCameraAccessToContinue')}
        </div>
        <Button
          block={true}
          icon={(
            <Icon
              phosphorIcon={GearSix}
            />
          )}
          onClick={onClick}
        >
          {t('ui.Modal.RequestCameraAccess.goToSetting')}
        </Button>
      </div>
    </SwModal>
  );
};

const RequestCameraAccessModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '--icon-warning-color': token.colorWarning,

    '.body-container': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: token.sizeMD
    },

    '.notice': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: token.sizeXS
    },

    '.title': {
      fontWeight: token.fontWeightStrong,
      color: token.colorWarning,
      fontSize: token.fontSizeHeading5,
      lineHeight: token.lineHeightHeading5
    },

    '.description': {
      color: token.colorTextDescription,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6
    }
  };
});

export default RequestCameraAccessModal;
