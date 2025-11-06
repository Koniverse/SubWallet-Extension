// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { govConvictionOptions } from '@subwallet/extension-base/services/open-gov/interface';
import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { AccountProxyAvatar, EmptyList, NumberDisplay } from '@subwallet/extension-koni-ui/components';
import { useNotification, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { findAccountByAddress, getAccountProxyTypeIcon, toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, SwList, Web3Block } from '@subwallet/react-ui';
import { ReferendumVoteDetail } from '@subwallet/subsquare-api-sdk';
import CN from 'classnames';
import { ArrowSquareOut, Copy, ListChecks } from 'phosphor-react';
import { IconWeight } from 'phosphor-react/src/lib';
import React, { forwardRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  accounts: ReferendumVoteDetail[];
  decimal: number;
  symbol: string;
  chain: string;
}

const Component = ({ accounts, chain, className = '', decimal, symbol }: Props) => {
  const { accountProxies, accounts: accountsState } = useSelector((state) => state.accountState);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const notify = useNotification();
  const { t } = useTranslation();

  const _onClickViewOnExplorer = useCallback((address: string) => {
    return (e: React.SyntheticEvent) => {
      e.stopPropagation();
      const chainInfo = chainInfoMap[chain];
      const link = getExplorerLink(chainInfo, address, 'account');

      window.open(link, '_blank');
    };
  }, [chain, chainInfoMap]);

  const _onClickCopyButton = useCallback((address: string) => {
    return (e: React.SyntheticEvent) => {
      e.stopPropagation();

      navigator.clipboard.writeText(address)
        .then(() => {
          notify({
            message: t('ui.GOVERNANCE.components.Modal.Governance.GovVotingStatusModal.FlattenedVoteList.copiedToClipboard')
          });
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
          notify({
            message: t('ui.GOVERNANCE.components.Modal.Governance.GovVotingStatusModal.FlattenedVoteList.copyFailed')
          });
        });
    };
  }, [notify, t]);

  const renderItem = useCallback((item: ReferendumVoteDetail) => {
    const convictionOption = govConvictionOptions.find((opt) => opt.value === item.conviction);
    const convictionLabel = convictionOption ? convictionOption.label : `${item.conviction}x`;
    const account = findAccountByAddress(accountsState, item.account);
    let accountProxy;

    if (account) {
      accountProxy = accountProxies.find((ap) => ap.id === account.proxyId);
    }

    const shortAddress = toShort(item.account);
    const accountProxyTypeIconProps = accountProxy ? getAccountProxyTypeIcon(accountProxy) : null;

    return (
      <Web3Block
        className='vote-item'
        key={item.account}
        leftItem={
          <div className='__item-avatar-wrapper'>
            <AccountProxyAvatar
              size={32}
              value={accountProxy?.id || item.account}
            />

            {
              !!accountProxyTypeIconProps && (
                <div className={CN('__item-avatar-icon', accountProxyTypeIconProps.className, {
                  '-is-derived': !!accountProxy?.parentId
                })}
                >
                  <Icon
                    customSize={'12px'}
                    phosphorIcon={accountProxyTypeIconProps.value}
                    weight={accountProxyTypeIconProps.weight as IconWeight}
                  />
                </div>
              )
            }
          </div>
        }
        middleItem={
          <div className='vote-item__info'>
            <div className='vote-item__address'>{account?.name || shortAddress}</div>
            <div className='vote-item__meta'>
              <div className='vote-item__meta-row'>
                <span className='vote-item__label'>{t('ui.GOVERNANCE.components.Modal.Governance.GovVotingStatusModal.FlattenedVoteList.votes')}</span>
                <NumberDisplay
                  decimal={decimal}
                  formatType={'balance'}
                  size={12}
                  suffix={symbol}
                  value={item.votes || 0}
                />
              </div>
              <div className='vote-item__meta-row'>
                <span className='vote-item__label'>{t('ui.GOVERNANCE.components.Modal.Governance.GovVotingStatusModal.FlattenedVoteList.conviction')}</span>
                <span>{convictionLabel}</span>
              </div>
              <div className='vote-item__meta-row'>
                <span className='vote-item__label'>{t('ui.GOVERNANCE.components.Modal.Governance.GovVotingStatusModal.FlattenedVoteList.capital')}</span>
                <NumberDisplay
                  decimal={decimal}
                  formatType={'balance'}
                  size={12}
                  suffix={symbol}
                  value={item.balance || 0}
                />
              </div>
            </div>
          </div>
        }
        rightItem={
          <div className={'vote-item__arrow-wrapper'}>
            <Button
              icon={ <Icon
                className={'vote-item__arrow'}
                phosphorIcon={Copy}
                size={'sm'}
              />}
              onClick={_onClickCopyButton(item.account)}
              size={'xs'}
              type={'ghost'}
            />

            <Button
              icon={ <Icon
                className={'vote-item__arrow'}
                phosphorIcon={ArrowSquareOut}
                size={'sm'}
              />}
              onClick={_onClickViewOnExplorer(item.account)}
              size={'xs'}
              type={'ghost'}
            />

          </div>
        }
      />
    );
  }, [_onClickCopyButton, _onClickViewOnExplorer, accountProxies, accountsState, decimal, symbol, t]);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyList
        emptyMessage={t('ui.GOVERNANCE.components.Modal.Governance.GovVotingStatusModal.FlattenedVoteList.noNestedData')}
        phosphorIcon={ListChecks}
      />
    );
  }, [t]);

  return (
    <div className={`${className} __flattened-vote-list`}>
      <SwList
        list={accounts}
        renderItem={renderItem}
        renderWhenEmpty={renderEmpty}
      />
    </div>
  );
};

export const FlattenedVoteList = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    overflowY: 'auto',
    maxHeight: '92%',

    '.vote-item': {
      display: 'flex',
      alignItems: 'flex-start',
      borderRadius: token.borderRadiusLG,
      padding: token.paddingSM,
      marginBottom: token.marginXS,
      background: token.colorBgSecondary
    },

    '.vote-item__address': {
      fontSize: token.fontSizeLG,
      fontWeight: token.fontWeightStrong,
      marginBottom: token.marginXS,
      color: token.colorTextLight1
    },

    '.vote-item__meta': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.marginXXS
    },

    '.vote-item__meta-row': {
      display: 'grid',
      gridTemplateColumns: '78px auto',
      columnGap: token.sizeXS,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextLight2
    },

    '.vote-item__label': {
      color: token.colorTextLight4
    },

    '.vote-item__arrow-wrapper': {
      display: 'flex',
      alignItems: 'flex-start',
      marginTop: '-8px'
    },

    '.__item-avatar-wrapper': {
      position: 'relative'
    },
    '.__item-avatar-icon': {
      color: token.colorWhite,
      width: 16,
      height: 16,
      position: 'absolute',
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '100%',

      '&.-is-unified': {
        color: token.colorSuccess
      },

      '&.-is-solo': {
        color: token['blue-9']
      },

      '&.-is-derived': {
        color: token.colorWarning
      }
    }
  };
});
