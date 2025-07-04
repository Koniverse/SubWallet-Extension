// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SwModalFuncProps } from '@subwallet/react-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useConfirmModal } from '../modal';

const modalId = 'delete-account-modal';

const useDeleteAccount = () => {
  const { t } = useTranslation();

  const modalProps: SwModalFuncProps = useMemo(() => {
    return {
      closable: true,
      content: t('ui.hook.account.useDeleteAccount.removeAccountAccessWarning'),
      id: modalId,
      okText: t('ui.hook.account.useDeleteAccount.remove'),
      subTitle: t('ui.hook.account.useDeleteAccount.removeThisAccount'),
      title: t('ui.hook.account.useDeleteAccount.confirmation'),
      type: 'error'
    };
  }, [t]);

  const { handleSimpleConfirmModal } = useConfirmModal(modalProps);

  return handleSimpleConfirmModal;
};

export default useDeleteAccount;
