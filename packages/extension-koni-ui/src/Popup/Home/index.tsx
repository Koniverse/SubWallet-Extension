// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createLogger } from '@subwallet/extension-base/utils/logger';
import { Layout } from '@subwallet/extension-koni-ui/components';
import { GlobalSearchTokenModal } from '@subwallet/extension-koni-ui/components/Modal/GlobalSearchTokenModal';
import { GlobalSearchTokenGroupModal, Layout } from '@subwallet/extension-koni-ui/components';
import RemindUpgradeFirefoxVersion from '@subwallet/extension-koni-ui/components/Modal/RemindUpgradeFirefoxVersion';
import { GeneralTermModal } from '@subwallet/extension-koni-ui/components/Modal/TermsAndConditions/GeneralTermModal';
import { CONFIRM_GENERAL_TERM, DEFAULT_SESSION_VALUE, GENERAL_TERM_AND_CONDITION_MODAL, HOME_CAMPAIGN_BANNER_MODAL, LATEST_SESSION, REMIND_BACKUP_SEED_PHRASE_MODAL, REMIND_UPGRADE_FIREFOX_VERSION } from '@subwallet/extension-koni-ui/constants';
import { AppOnlineContentContext } from '@subwallet/extension-koni-ui/contexts/AppOnlineContentProvider';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useAccountBalance, useGetChainAndExcludedTokenByCurrentAccountProxy, useSetSessionLatest, useTokenGroup, useUpgradeFireFoxVersion } from '@subwallet/extension-koni-ui/hooks';
import { RemindBackUpSeedPhraseParamState, SessionStorage, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isFirefox } from '@subwallet/extension-koni-ui/utils';
import { ModalContext } from '@subwallet/react-ui';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

const logger = createLogger('Home');

type Props = ThemeProps;

export const GlobalSearchTokenModalId = 'globalSearchToken';
export const GlobalSearchTokenGroupModalId = 'GlobalSearchTokenGroupModalId';
const historyPageIgnoreRemind = 'ignoreRemind';
const historyPageIgnoreBanner = 'ignoreBanner';

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { allowedChains } = useGetChainAndExcludedTokenByCurrentAccountProxy();
  const tokenGroupStructure = useTokenGroup(allowedChains);
  const location = useLocation();
  const accountBalance = useAccountBalance(tokenGroupStructure.tokenGroupMap);
  const [isConfirmedTermGeneral, setIsConfirmedTermGeneral] = useLocalStorage(CONFIRM_GENERAL_TERM, 'nonConfirmed');
  const [showTabBar, setShowTabBar] = useState<boolean>(true);
  const { isNeedUpgradeVersion } = useUpgradeFireFoxVersion();
  const { showAppPopup } = useContext(AppOnlineContentContext);

  const remindBackUpShowed = useRef<boolean>(false);
  const showAppPopupFunc = useRef<(currentRoute: string | undefined) => void>(showAppPopup);

  const { sessionLatest } = useSetSessionLatest();

  const onOpenGlobalSearchToken = useCallback(() => {
    activeModal(GlobalSearchTokenModalId);
  }, [activeModal]);

  const onCloseGlobalSearchTokenGroup = useCallback(() => {
    inactiveModal(GlobalSearchTokenGroupModalId);
  }, [inactiveModal]);

  const onAfterConfirmTermModal = useCallback(() => {
    setIsConfirmedTermGeneral('confirmed');
  }, [setIsConfirmedTermGeneral]);

  useEffect(() => {
    showAppPopupFunc.current = showAppPopup;
  }, [showAppPopup]);

  useEffect(() => {
    const isFromIgnorePage = location.state as RemindBackUpSeedPhraseParamState;
    const sessionLatestInit = (JSON.parse(localStorage.getItem(LATEST_SESSION) || JSON.stringify(DEFAULT_SESSION_VALUE))) as SessionStorage;

    const handleOpenBanner = () => {
      if (!sessionLatestInit.remind && isFromIgnorePage?.from !== historyPageIgnoreBanner) {
        showAppPopupFunc.current(location.pathname);
      }
    };

    if (isFirefox()) {
      isNeedUpgradeVersion().then((rs) => {
        if (rs) {
          activeModal(REMIND_UPGRADE_FIREFOX_VERSION);
        } else {
          handleOpenBanner();
        }
      })
        .catch((error) => logger.error('Failed to handle campaign banner', error));
    } else {
      handleOpenBanner();
    }
  }, [activeModal, isNeedUpgradeVersion, location]);

  useEffect(() => {
    // Run remind backup seed phrase one time
    if (!remindBackUpShowed.current) {
      const infoSession = Date.now();

      const isFromIgnorePage = location.state as RemindBackUpSeedPhraseParamState;

      if (infoSession - sessionLatest.timeCalculate > sessionLatest.timeBackup &&
        sessionLatest.remind &&
        (isFromIgnorePage?.from !== historyPageIgnoreRemind)) {
        inactiveModal(HOME_CAMPAIGN_BANNER_MODAL);
        activeModal(REMIND_BACKUP_SEED_PHRASE_MODAL);
        remindBackUpShowed.current = true;
      }
    }
  }, [activeModal, inactiveModal, location, sessionLatest]);

  useEffect(() => {
    if (isConfirmedTermGeneral.includes('nonConfirmed')) {
      activeModal(GENERAL_TERM_AND_CONDITION_MODAL);
    }
  }, [activeModal, isConfirmedTermGeneral, setIsConfirmedTermGeneral]);

  return (
    <>
      <HomeContext.Provider value={{
        tokenGroupStructure,
        accountBalance,
        uiState: { setShowTabBar }
      }}
      >
        <div className={`home home-container ${className}`}>
          <Layout.Home
            onClickSearchToken={onOpenGlobalSearchToken}
            showFaderIcon
            showNotificationIcon
            showSearchToken
            showSidebarIcon
            showTabBar={showTabBar}
          >
            <Outlet />
            <GeneralTermModal onOk={onAfterConfirmTermModal} />
            <RemindUpgradeFirefoxVersion />
          </Layout.Home>
        </div>
      </HomeContext.Provider>

      <GlobalSearchTokenGroupModal
        id={GlobalSearchTokenGroupModalId}
        onCancel={onCloseGlobalSearchTokenGroup}
        tokenGroupBalanceMap={accountBalance.tokenGroupBalanceMap}
        tokenGroups={tokenGroupStructure.tokenGroups}
      />
    </>
  );
}

const Home = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    height: '100%'
  });
});

export default Home;
