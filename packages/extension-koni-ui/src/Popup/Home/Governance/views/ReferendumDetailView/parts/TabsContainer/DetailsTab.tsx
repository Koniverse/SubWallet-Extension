// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { AccountProxyAvatar, MetaInfo, ReferendumTrackTag } from '@subwallet/extension-koni-ui/components';
import { BLOCK_DURATION_SEC } from '@subwallet/extension-koni-ui/constants';
import { useGetAccountByAddress, useNotification, useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon } from '@subwallet/react-ui';
import { ReferendumDetail } from '@subwallet/subsquare-api-sdk';
import CN from 'classnames';
import { ArrowSquareOut, Copy } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  referendumDetail: ReferendumDetail;
  chain: string;
};

const BLOCK_TIME_DEFAULT = 6;

const blocksToDaysLabel = (blocks: number, chainSlug: string) => {
  const days = blocks / (86400 / (BLOCK_DURATION_SEC[chainSlug] || BLOCK_TIME_DEFAULT));

  return Number.isInteger(days) ? `${days} d` : `${days.toFixed(2)} d`;
};

const capitalize = (value: string): string => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const Component = ({ chain, className, referendumDetail }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const notify = useNotification();
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);

  const proposerAddress = referendumDetail.onchainData.info.submissionDeposit?.who || referendumDetail.proposer;
  const decisionAddress = referendumDetail.onchainData.info.decisionDeposit?.who;
  const proposerAccount = useGetAccountByAddress(proposerAddress);
  const decisionAccount = useGetAccountByAddress(decisionAddress);

  const proposalCallContent = useMemo(() => {
    const call = referendumDetail.onchainData?.proposal?.call;
    const trackNames = [call?.section, call?.method].filter(Boolean);

    return trackNames.length > 0
      ? (
        <MetaInfo.Default
          className={'account-info-proposal-call'}
          label={t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.call')}
        >
          {trackNames.map((name) => (
            <ReferendumTrackTag
              className={'referendum-tag'}
              key={name}
              trackName={capitalize(name)}
            />
          ))}
        </MetaInfo.Default>
      )
      : null;
  }, [referendumDetail.onchainData?.proposal?.call, t]);

  const _onClickCopyButton = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();

    navigator.clipboard.writeText(referendumDetail.onchainData.proposalHash)
      .then(() => {
        notify({
          message: t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.copiedToClipboard')
        });
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        notify({
          message: t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.copyFailed')
        });
      });
  }, [notify, t, referendumDetail.onchainData.proposalHash]);

  const _onClickViewOnExplorer = useCallback((address: string) => {
    return (e: React.SyntheticEvent) => {
      e.stopPropagation();
      const chainInfo = chainInfoMap[chain];
      const link = getExplorerLink(chainInfo, address, 'account');

      window.open(link, '_blank');
    };
  }, [chain, chainInfoMap]);

  return (
    <MetaInfo className={className}>
      <MetaInfo
        className='referendum-detail'
        hasBackgroundWrapper={true}
      >
        {!!proposerAddress &&
          <MetaInfo.Default
            className={CN('referendum-detail-item', '-account-info')}
            label={t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.proposer')}
          >
            <div className='__account-item-wrapper'>
              <div className='__account-item'>
                <AccountProxyAvatar
                  className={'__account-avatar'}
                  size={24}
                  value={proposerAccount?.proxyId || proposerAddress}
                />
                {
                  proposerAccount?.name
                    ? <div className={'__account-item-name'}>{proposerAccount.name}</div>
                    : <div className={'__account-item-address'}>{toShort(proposerAddress)}</div>
                }
              </div>
              <Button
                icon={
                  <Icon
                    customSize={'18px'}
                    phosphorIcon={ArrowSquareOut}
                    weight={'fill'}
                  />
                }
                onClick={_onClickViewOnExplorer(proposerAddress)}
                size='xs'
                style={{ minWidth: 'unset' }}
                tooltip={t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.viewOnExplorer')}
                tooltipPlacement={'topRight'}
                type='ghost'
              />
            </div>
          </MetaInfo.Default>
        }
        {!!decisionAddress &&
          <MetaInfo.Default
            className={CN('referendum-detail-item', '-account-info')}
            label={t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.depositor')}
          >
            <div className='__account-item-wrapper'>
              <div className='__account-item'>
                <AccountProxyAvatar
                  className={'__account-avatar'}
                  size={24}
                  value={decisionAccount?.proxyId || decisionAddress}
                />
                {
                  decisionAccount?.name
                    ? <div className={'__account-item-name'}>{decisionAccount.name}</div>
                    : <div className={'__account-item-address'}>{toShort(decisionAddress)}</div>
                }
              </div>
              <Button
                icon={
                  <Icon
                    customSize={'18px'}
                    phosphorIcon={ArrowSquareOut}
                    weight={'fill'}
                  />
                }
                onClick={_onClickViewOnExplorer(decisionAddress)}
                size='xs'
                style={{ minWidth: 'unset' }}
                tooltip={t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.viewOnExplorer')}
                tooltipPlacement={'topRight'}
                type='ghost'
              />
            </div>
          </MetaInfo.Default>}
        {referendumDetail.version === 2 &&
          (
            <>
              <MetaInfo.Default
                label={t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.track')}
              >
                {referendumDetail.trackInfo.name}
              </MetaInfo.Default>
              <MetaInfo.Default
                label={t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.decisionPeriod')}
              >
                {blocksToDaysLabel(referendumDetail.trackInfo.decisionPeriod, chain)}
              </MetaInfo.Default>
              <MetaInfo.Default
                label={t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.confirmationPeriod')}
              >
                {blocksToDaysLabel(referendumDetail.trackInfo.confirmPeriod, chain)}
              </MetaInfo.Default>
              <MetaInfo.Default
                label={t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.enact')}
              >
              After: {referendumDetail.onchainData.info.enactment.after}
              </MetaInfo.Default>
            </>
          )
        }
        {
          referendumDetail.version === 1 && referendumDetail.onchainData.meta &&
          (
            <>
              <MetaInfo.Default
                label={t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.delay')}
              >
                {referendumDetail.onchainData.meta?.delay}
              </MetaInfo.Default>

              <MetaInfo.Default
                label={t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.end')}
              >
                {referendumDetail.onchainData.meta?.end}
              </MetaInfo.Default>
            </>
          )
        }
      </MetaInfo>

      <MetaInfo
        className='referendum-detail'
        hasBackgroundWrapper={true}
      >
        <MetaInfo.Default
          className={'account-info-proposal-hash'}
          label={t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.proposerHash')}
        >
          <div>
            {toShort(referendumDetail.onchainData.proposalHash)}
          </div>
          <Button
            icon={
              <Icon
                customSize={'18px'}
                phosphorIcon={Copy}
              />
            }
            onClick={_onClickCopyButton}
            size='xs'
            style={{ minWidth: 'unset' }}
            tooltip={t('ui.GOVERNANCE.screen.Governance.ReferendumDetail.TabsContainer.DetailsTab.copyProposalHash')}
            tooltipPlacement={'topRight'}
            type='ghost'
          />
        </MetaInfo.Default>
        {proposalCallContent}
      </MetaInfo>
    </MetaInfo>
  );
};

export const DetailsTab = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.referendum-detail-item.-account-info': {
      alignItems: 'center',

      '.__account-item-wrapper': {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline'
      },

      '.__account-item': {
        display: 'flex',
        alignItems: 'center',
        gap: token.sizeXS,
        whiteSpace: 'nowrap'
      },

      '.__col.__value-col': {
        overflow: 'unset'
      }
    },

    '.account-info-proposal-hash .__value': {
      display: 'flex',
      alignItems: 'center'
    },

    '.account-info-proposal-call': {
      '.referendum-tag': {
        marginLeft: 'auto'
      },

      '& .__value-col': {
        overflow: 'unset'
      },

      '& .__value': {
        display: 'flex',
        alignItems: 'center',
        gap: token.sizeXXS,
        flexWrap: 'wrap'
      }
    }
  };
});
