// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { GovTrackVoting } from '@subwallet/extension-base/services/open-gov/interface';
import { AccountChainType, AccountProxyType } from '@subwallet/extension-base/types';
import { detectTranslate, isAccountAll, reformatAddress } from '@subwallet/extension-base/utils';
import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import GovAccountSelectorModal from '@subwallet/extension-koni-ui/components/Modal/Governance/GovAccountSelector';
import { DEFAULT_GOV_REFERENDUM_VOTE_PARAMS, GOV_REFERENDUM_VOTE_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useGetGovLockedInfos, useNotification, useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { chainSlugToPolkassemblySite, chainSlugToSubsquareSite } from '@subwallet/extension-koni-ui/Popup/Home/Governance/shared';
import { ViewBaseType } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GovAccountAddressItemType, GovVoteStatus } from '@subwallet/extension-koni-ui/types/gov';
import { getTransactionFromAccountProxyValue } from '@subwallet/extension-koni-ui/utils';
import { GOV_QUERY_KEYS } from '@subwallet/extension-koni-ui/utils/gov';
import { Button, ModalContext, SwSubHeader } from '@subwallet/react-ui';
import { useQuery } from '@tanstack/react-query';
import React, { Context, useCallback, useContext, useEffect, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeContext } from 'styled-components';
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
  const { accountProxies, currentAccountProxy } = useSelector((state) => state.accountState);
  const navigate = useNavigate();
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const { t } = useTranslation();
  const fromAccountProxy = getTransactionFromAccountProxyValue(currentAccountProxy);
  const govLockedInfos = useGetGovLockedInfos(chainSlug);
  const { chainInfoMap } = useSelector((root: RootState) => root.chainStore);
  const notify = useNotification();
  const { accountAddressItems, voteMap } = useGovReferendumVotes({
    chain: chainSlug,
    referendumId: referendumId,
    fromAccountProxy
  });

  const isOnlyReadOnlyAccount = useMemo(() => {
    const substrateAccountProxies = accountProxies.filter((ap) => ap.chainTypes.includes(AccountChainType.SUBSTRATE) && !isAccountAll(ap.id));

    if (substrateAccountProxies.length === 0) {
      return false;
    }

    return substrateAccountProxies.every((ap) => ap.accountType === AccountProxyType.READ_ONLY);
  }, [accountProxies]);

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

  /**
   * Builds an extended account list that includes delegated voting status updates.
   *
   * - Splits accounts into `voted` and `notVoted`
   * - Marks "not voted" accounts as delegated if they have delegation info
   * - Merges them back into a single unified list
   */
  const extendedAccountAddressItems = useMemo(() => {
    if (!data) {
      return accountAddressItems;
    }

    const trackId = Number(data.trackInfo.id);
    const chainInfo = chainInfoMap[chainSlug];

    // Build a quick lookup record of account → track voting info
    const govTrackByAddress = govLockedInfos.reduce<Record<string, GovTrackVoting>>((acc, info) => {
      const track = info.tracks.find((t) => Number(t.trackId) === trackId);
      const reformattedAddress = reformatAddress(info.address, chainInfo.substrateInfo?.addressPrefix);

      if (track) {
        acc[reformattedAddress] = track;
      }

      return acc;
    }, {});

    // Separate into voted and not voted while updating delegation info on the fly
    const voted: GovAccountAddressItemType[] = [];
    const notVoted: GovAccountAddressItemType[] = [];

    for (const item of accountAddressItems) {
      if (item.govVoteStatus === GovVoteStatus.NOT_VOTED) {
        const govInfo = govTrackByAddress[item.address];
        const isDelegated = !!govInfo?.delegation?.target;

        notVoted.push(
          isDelegated
            ? { ...item, govVoteStatus: GovVoteStatus.DELEGATED }
            : item
        );
      } else {
        voted.push(item);
      }
    }

    // Merge voted accounts first, then newly delegated / not voted ones
    return [...voted, ...notVoted];
  }, [accountAddressItems, chainInfoMap, chainSlug, data, govLockedInfos]);

  const onViewPolkassembly = useCallback(() => {
    const site = chainSlugToPolkassemblySite[chainSlug];

    window.open(`https://${site}.polkassembly.io/referenda/${data?.referendumIndex ?? ''}`, '_blank');
  }, [chainSlug, data?.referendumIndex]);

  const onViewSubsquare = useCallback(() => {
    const basePath = sdkInstance?.isLegacyGov ? 'democracy/' : '';
    const referendumPath = data?.referendumIndex || '';

    window.open(`https://${chainSlugToSubsquareSite[chainSlug]}.subsquare.io/${basePath}referenda/${referendumPath}`, '_blank');
  }, [chainSlug, data?.referendumIndex, sdkInstance?.isLegacyGov]);

  const onSelectGovItem = useCallback((item: GovAccountAddressItemType) => {
    if (item.accountProxyType === AccountProxyType.READ_ONLY) {
      notify({
        message: t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.watchOnlyAccountFeatureRestriction'),
        type: 'info'
      });

      return;
    }

    if (item.govVoteStatus === GovVoteStatus.DELEGATED) {
      openAlert({
        title: t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.unableToVote'),
        type: NotificationType.ERROR,
        content:
          <Trans
            className={className}
            components={{
              highlight: (
                <span style={{ color: token.colorTextLight2 }} />
              )
            }}
            i18nKey={detectTranslate('You\'re delegating votes for the referendum\'s track with account named "<highlight>{{name}}</highlight>". Ask your delegatee to vote or remove your delegated votes, then try again')}
            values={{ name: item.accountName }}
          />,
        okButton: {
          text: t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.iUnderstand'),
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
  }, [chainSlug, className, closeAlert, data?.track, fromAccountProxy, navigate, notify, openAlert, referendumId, setGovRefVoteStorage, t, token.colorTextLight2]);

  const onClickVote = useCallback(() => {
    if (extendedAccountAddressItems.length > 1) {
      activeModal(modalId);
    } else if (extendedAccountAddressItems.length === 1) {
      onSelectGovItem(extendedAccountAddressItems[0]);
    } else if (isOnlyReadOnlyAccount) {
      notify({
        message: t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.watchOnlyAccountFeatureRestriction'),
        type: 'info'
      });
    }
  }, [extendedAccountAddressItems, isOnlyReadOnlyAccount, activeModal, onSelectGovItem, notify, t]);

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
        title={t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.referendaId', { replace: { id: data.referendumIndex } })}
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
            voteMap={voteMap}
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

        <GovAccountSelectorModal
          items={extendedAccountAddressItems}
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
      marginTop: 'auto',

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
