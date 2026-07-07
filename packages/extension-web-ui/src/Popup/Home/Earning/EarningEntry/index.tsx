// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { AlertModal, LoadingScreen, PageWrapper } from '@subwallet/extension-web-ui/components';
import { EarningTermModal } from '@subwallet/extension-web-ui/components/Modal/TermsAndConditions/EarningTermModal';
import { CONFIRM_EARNING_TERM, CREATE_RETURN, DEFAULT_ROUTER_PATH, EARNING_TERM_AND_CONDITION_MODAL } from '@subwallet/extension-web-ui/constants';
import { DataContext } from '@subwallet/extension-web-ui/contexts/DataContext';
import { useAlert, useGroupYieldPosition, useSelector, useTranslation } from '@subwallet/extension-web-ui/hooks';
import EarningOptions from '@subwallet/extension-web-ui/Popup/Home/Earning/EarningEntry/EarningOptions';
import EarningPositions from '@subwallet/extension-web-ui/Popup/Home/Earning/EarningEntry/EarningPositions';
import { EarningEntryParam, EarningEntryView, ThemeProps } from '@subwallet/extension-web-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { PlusCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps;
const alertModalId = 'earning-entry-alert-modal';

function Component () {
  const locationState = useLocation().state as EarningEntryParam;
  const { currentAccountProxy } = useSelector((state) => state.accountState);
  const currentAccountProxyRef = useRef(currentAccountProxy?.id);
  const [entryView, setEntryView] = useState<EarningEntryView>(locationState?.view || EarningEntryView.POSITIONS);
  const [loading, setLoading] = useState<boolean>(false);
  const redirectFromPreviewRef = useRef<boolean>(locationState?.redirectFromPreview || false);
  const chainNameRef = useRef<string>(locationState?.chainName || '');
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const { alertProps, closeAlert, openAlert } = useAlert(alertModalId);
  const [, setReturnStorage] = useLocalStorage(CREATE_RETURN, DEFAULT_ROUTER_PATH);
  const [confirmedEarningTerm, setConfirmedEarningTerm] = useLocalStorage(CONFIRM_EARNING_TERM, 'nonConfirmed');
  const earningPositions = useGroupYieldPosition();
  const navigate = useNavigate();

  useEffect(() => {
    if (confirmedEarningTerm === 'nonConfirmed') {
      activeModal(EARNING_TERM_AND_CONDITION_MODAL);
    }
  }, [activeModal, confirmedEarningTerm]);

  const onAfterConfirmEarningTermModal = useCallback(() => {
    setConfirmedEarningTerm('confirmed');
  }, [setConfirmedEarningTerm]);

  useEffect(() => {
    if (redirectFromPreviewRef.current) {
      openAlert({
        title: t('bg.TRANSACTION.core.validation.request.invalidAccountType'),
        type: NotificationType.ERROR,
        content: t('ui.EARNING_ENTRY.Popup.Home.Earning.EarningEntry.youDonTHaveAnyAccountToStakeOnNetworkYetCreateANewAccountAndTryAgain', { replace: { chainName: chainNameRef.current } }),
        cancelButton: {
          text: 'Dismiss',
          onClick: closeAlert,
          icon: XCircle
        },
        okButton: {
          text: t('ui.ACCOUNT.hook.account.useHandleTonWarning.createNew'),
          onClick: () => {
            closeAlert();
            setReturnStorage('/transaction/earn');
            navigate('/accounts/new-seed-phrase');
          },
          icon: PlusCircle
        }
      });
    }
  }, [closeAlert, navigate, openAlert, setReturnStorage, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentAccountProxyRef.current !== currentAccountProxy?.id) {
        currentAccountProxyRef.current = currentAccountProxy?.id;

        setEntryView(EarningEntryView.POSITIONS);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentAccountProxy?.id]);

  if (loading) {
    return (<LoadingScreen />);
  }

  return (
    <>
      {earningPositions.length && entryView === EarningEntryView.POSITIONS
        ? (
          <EarningPositions
            earningPositions={earningPositions}
            setEntryView={setEntryView}
            setLoading={setLoading}
          />
        )
        : (
          <EarningOptions
            earningPositions={earningPositions}
            setEntryView={setEntryView}
          />
        )}

      {
        !!alertProps && (
          <AlertModal
            modalId={alertModalId}
            {...alertProps}
          />
        )
      }
      <EarningTermModal onOk={onAfterConfirmEarningTermModal} />
    </>
  );
}

const Wrapper = ({ className }: Props) => {
  const dataContext = useContext(DataContext);

  return (
    <PageWrapper
      className={CN(className)}
      resolve={dataContext.awaitStores(['earning', 'price', 'balance', 'chainStore', 'assetRegistry'])}
    >
      <Component />
    </PageWrapper>
  );
};

const EarningEntry = styled(Wrapper)<Props>(() => ({

}));

export default EarningEntry;
