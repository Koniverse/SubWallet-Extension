// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LoadingScreen, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { EarningTermModal } from '@subwallet/extension-koni-ui/components/Modal/TermsAndConditions/EarningTermModal';
import { CONFIRM_EARNING_TERM, EARNING_TERM_AND_CONDITION_MODAL } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useGroupYieldPosition, useSelector, useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import EarningOptions from '@subwallet/extension-koni-ui/Popup/Home/Earning/EarningEntry/EarningOptions';
import EarningPositions from '@subwallet/extension-koni-ui/Popup/Home/Earning/EarningEntry/EarningPositions';
import { EarningEntryParam, EarningEntryView, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps;

function Component () {
  useSetCurrentPage('/home/earning');
  const locationState = useLocation().state as EarningEntryParam;
  const { currentAccountProxy } = useSelector((state) => state.accountState);
  const { activeModal } = useContext(ModalContext);
  const currentAccountProxyRef = useRef(currentAccountProxy?.id);
  const [entryView, setEntryView] = useState<EarningEntryView>(locationState?.view || EarningEntryView.POSITIONS);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmedEarningTerm, setConfirmedEarningTerm] = useLocalStorage(CONFIRM_EARNING_TERM, 'nonConfirmed');

  const earningPositions = useGroupYieldPosition();

  useEffect(() => {
    if (confirmedEarningTerm.includes('nonConfirmed')) {
      activeModal(EARNING_TERM_AND_CONDITION_MODAL);
    }
  }, [activeModal, confirmedEarningTerm]);

  const onAfterConfirmEarningTermModal = useCallback(() => {
    setConfirmedEarningTerm('confirmed');
  }, [setConfirmedEarningTerm]);

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
            hasEarningPositions={!!earningPositions.length}
            setEntryView={setEntryView}
          />
        )}
      <EarningTermModal onOk={onAfterConfirmEarningTermModal} />
    </>
  );
}

const Wrapper = ({ className }: Props) => {
  const dataContext = useContext(DataContext);

  return (
    <PageWrapper
      className={CN(className)}
      resolve={dataContext.awaitStores(['earning', 'price', 'balance'])}
    >
      <Component />
    </PageWrapper>
  );
};

const EarningEntry = styled(Wrapper)<Props>(({ theme: { token } }: Props) => ({

}));

export default EarningEntry;
