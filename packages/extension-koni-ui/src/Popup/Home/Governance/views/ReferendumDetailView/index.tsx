// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import GovAccountSelectoModal from '@subwallet/extension-koni-ui/components/Modal/Governance/GovAccountSelector';
import { DEFAULT_GOV_REFERENDUM_VOTE_PARAMS, GOV_REFERENDUM_VOTE_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { chainSlugToPolkassemblySite, chainSlugToSubsquareSite } from '@subwallet/extension-koni-ui/Popup/Home/Governance/shared';
import { ViewBaseType } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GovAccountAddressItemType, GovVoteStatus } from '@subwallet/extension-koni-ui/types/gov';
import { getTransactionFromAccountProxyValue } from '@subwallet/extension-koni-ui/utils';
import { GOV_QUERY_KEYS } from '@subwallet/extension-koni-ui/utils/gov';
import { Button, ModalContext, SwSubHeader } from '@subwallet/react-ui';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { useGovReferendumVotes } from '../../hooks/useGovernanceView/useGovReferendumVotes';
import { MetaArea } from './parts/MetaArea';
import { RequestedAmount } from './parts/RequestedAmount';
import { TabsContainer } from './parts/TabsContainer';
import { VoteArea } from './parts/VoteArea';

type Props = ThemeProps & ViewBaseType & {
  referendumId: string;
  goOverview: VoidFunction;
};

const modalId = 'account-selector';

const Component = ({ chainSlug, className, goOverview, referendumId, sdkInstance }: Props): React.ReactElement<Props> => {
  const { currentAccountProxy } = useSelector((state) => state.accountState);
  const navigate = useNavigate();

  const { t } = useTranslation();
  const fromAccountProxy = getTransactionFromAccountProxyValue(currentAccountProxy);

  const { accountAddressItems } = useGovReferendumVotes({
    chain: chainSlug,
    referendumId: referendumId,
    fromAccountProxy
  });

  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { alertModal: { close: closeAlert, open: openAlert } } = useContext(WalletModalContext);
  const { uiState: { setShowTabBar } } = useContext(HomeContext);

  const [, setGovRefVoteStorage] = useLocalStorage(GOV_REFERENDUM_VOTE_TRANSACTION, DEFAULT_GOV_REFERENDUM_VOTE_PARAMS);
  const onBack = useCallback(() => {
    goOverview();
  }, [goOverview]);

  const { data } = useQuery({
    queryKey: GOV_QUERY_KEYS.referendumDetail(chainSlug, referendumId),
    queryFn: async () => {
      if (!referendumId) {
        return undefined;
      }

      return await sdkInstance?.getReferendaDetails(`${referendumId}`);
    },
    staleTime: 60 * 1000
  });

  const onViewPolkassembly = useCallback(() => {
    window.open(`https://${chainSlugToPolkassemblySite[chainSlug]}.polkassembly.io/referenda/${data?.referendumIndex || ''}`, '_blank');
  }, [chainSlug, data?.referendumIndex]);

  const onViewSubsquare = useCallback(() => {
    window.open(`https://${chainSlugToSubsquareSite[chainSlug]}.subsquare.io/referenda/${data?.referendumIndex || ''}`, '_blank');
  }, [chainSlug, data?.referendumIndex]);

  const onSelectGovItem = useCallback((item: GovAccountAddressItemType) => {
    if (item.govVoteStatus === GovVoteStatus.DELEGATED) {
      openAlert({
        title: t('Unable to vote'),
        type: NotificationType.ERROR,
        content: t(
          "You're delegating votes for the referendum's track with account named {{name}}. Ask your delegatee to vote or remove your delegated votes, then try again",
          { name: item.accountName }
        ),
        okButton: {
          text: t('I understand'),
          onClick: closeAlert
        }
      });

      return;
    }

    if (referendumId == null || data?.track == null) {
      return;
    }

    setGovRefVoteStorage({
      ...DEFAULT_GOV_REFERENDUM_VOTE_PARAMS,
      from: item.address,
      referendumId,
      track: data.track,
      chain: chainSlug,
      fromAccountProxy
    });
    navigate('/transaction/gov-ref-vote/standard');
  }, [chainSlug, closeAlert, data?.track, fromAccountProxy, navigate, openAlert, referendumId, setGovRefVoteStorage, t]);

  const onClickVote = useCallback(() => {
    if (accountAddressItems.length > 1) {
      activeModal(modalId);
    } else if (accountAddressItems.length === 1) {
      onSelectGovItem(accountAddressItems[0]);
    }
  }, [accountAddressItems, activeModal, onSelectGovItem]);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  useEffect(() => {
    setShowTabBar(false);

    return () => {
      setShowTabBar(true);
    };
  }, [setShowTabBar]);

  if (!data) {
    return <></>;
  }

  const allSpends = data.allSpends;

  return (
    <div className={className}>
      <SwSubHeader
        background={'transparent'}
        center
        className={'referendum-detail-header'}
        onBack={onBack}
        paddingVertical
        showBackButton
        title={t('Referenda #{{id}}', { replace: { id: data.referendumIndex } })}
      />

      <div className={'referendum-detail-body'}>
        <MetaArea
          referendumDetail={data}
        />

        <div>
          <VoteArea
            chain={chainSlug}
            onClickVote={onClickVote}
            referendumDetail={data}
            sdkInstance={sdkInstance}
          />

          { allSpends && (
            <RequestedAmount
              allSpend={allSpends}
              chain={chainSlug}
            />
          )}
        </div>

        <TabsContainer
          chain={chainSlug}
          referendumDetail={data}
        />

        <GovAccountSelectoModal
          items={accountAddressItems}
          modalId={modalId}
          onCancel={onCancel}
          onSelectItem={onSelectGovItem}
        />

        <div className={'referendum-detail-footer'}>
          <Button
            block={true}
            className='ref-polkassambly-button'
            disabled={!chainSlugToPolkassemblySite[chainSlug]}
            icon={
              <img
                alt='Polkassembly'
                className={'footer-button-logo'}
                src={DefaultLogosMap.polkassembly}
              />
            }
            onClick={onViewPolkassembly}
            schema='secondary'
          >
            Polkassembly
          </Button>

          <Button
            block={true}
            className={'ref-subsquare-button'}
            disabled={!chainSlugToSubsquareSite[chainSlug]}
            icon={
              <img
                alt='Subsquare'
                className={'footer-button-logo'}
                src={DefaultLogosMap.subsquare}
              />
            }
            onClick={onViewSubsquare}
            schema='secondary'
          >
            Subsquare
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ReferendumDetailView = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    height: '100%',
    paddingInline: token.padding,
    display: 'flex',
    flexDirection: 'column',
    gap: token.size,

    '.referendum-detail-header': {
      height: 40,
      marginTop: token.marginXS,

      '.ant-sw-header-left-part': {
        marginLeft: -token.marginXS
      }
    },

    '.referendum-detail-body': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeMS,
      overflowY: 'scroll',
      flex: 1,
      minHeight: 0
    },

    '.referendum-detail-footer': {
      display: 'flex',
      gap: token.sizeSM,
      marginBottom: token.sizeXL,

      '.footer-button-logo': {
        height: 28,
        width: 28,
        marginRight: token.marginXS
      },

      'button:disabled .footer-button-logo': {
        opacity: 0.3
      }
    }

  };
});
