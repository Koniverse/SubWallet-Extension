// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BaseModal } from '@subwallet/extension-web-ui/components';
import { useTranslation } from '@subwallet/extension-web-ui/hooks';
import { ThemeProps, VoidFunction } from '@subwallet/extension-web-ui/types';
import { Button } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  modalId: string,
  onCancel: VoidFunction,
  onClickConfirm: VoidFunction;
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, modalId, onCancel, onClickConfirm } = props;
  const { t } = useTranslation();

  return (
    <>
      <BaseModal
        center={true}
        className={CN(className)}
        footer={(
          <Button
            block={true}
            onClick={onClickConfirm}
          >
            {t('ui.RECHECK_CHAIN_CONNECTION_MODAL.components.Modal.Common.RecheckChainConnectionModal.update')}
          </Button>
        )}
        id={modalId}
        onCancel={onCancel}
        title={t('ui.RECHECK_CHAIN_CONNECTION_MODAL.components.Modal.Common.RecheckChainConnectionModal.updateNetwork')}
      >
        <div className={'__message'}>
          {t('ui.RECHECK_CHAIN_CONNECTION_MODAL.components.Modal.Common.RecheckChainConnectionModal.yourSelectedNetworkHasLostConnectionUpdateItByReEnablingItOrChangingNetworkProvider')}
        </div>
      </BaseModal>
    </>
  );
};

const RecheckChainConnectionModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__message': {
      color: token.colorTextLight4,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      textAlign: 'center'
    }
  };
});

export default RecheckChainConnectionModal;
