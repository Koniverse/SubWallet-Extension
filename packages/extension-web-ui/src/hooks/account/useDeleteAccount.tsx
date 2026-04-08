// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { SwModalFuncProps } from '@subwallet/react-ui';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useConfirmModal } from '../modal';

const modalId = 'delete-account-modal';

const useDeleteAccount = () => {
  const { t } = useTranslation();
  const { isWebUI } = useContext(ScreenContext);
  const modalProps: SwModalFuncProps = useMemo(() => {
    return {
      closable: true,
      content: isWebUI ? t('ui.USE_DELETE_ACCOUNT.hooks.account.useDeleteAccount.ifYouEverWantToUseThisAccountAgainYouWouldNeedToImportItAgainWithSeedphrasePrivateKeyOrJsonFile') : t('ui.USE_DELETE_ACCOUNT.hooks.account.useDeleteAccount.youWillNoLongerBeAbleToAccessThisAccountViaThisExtension'),
      id: modalId,
      okText: isWebUI ? t('ui.USE_DELETE_ACCOUNT.hooks.account.useDeleteAccount.delete') : t('ui.USE_DELETE_ACCOUNT.hooks.account.useDeleteAccount.remove'),
      subTitle: isWebUI ? t('ui.USE_DELETE_ACCOUNT.hooks.account.useDeleteAccount.deleteThisAccount') : t('ui.USE_DELETE_ACCOUNT.hooks.account.useDeleteAccount.removeThisAccount'),
      title: isWebUI ? t('ui.USE_DELETE_ACCOUNT.hooks.account.useDeleteAccount.removeAccount') : t('ui.USE_DELETE_ACCOUNT.hooks.account.useDeleteAccount.confirmation'),
      type: 'error'
    };
  }, [isWebUI, t]);

  const { handleSimpleConfirmModal } = useConfirmModal(modalProps);

  return handleSimpleConfirmModal;
};

export default useDeleteAccount;
