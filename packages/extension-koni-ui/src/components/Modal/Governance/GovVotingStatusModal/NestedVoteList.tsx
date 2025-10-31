// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxyAvatar, EmptyList, NumberDisplay } from '@subwallet/extension-koni-ui/components';
import Search from '@subwallet/extension-koni-ui/components/Search';
import { GOV_DELEGATION_DETAILS_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useNotification, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { findAccountByAddress, getAccountProxyTypeIcon, toShort } from '@subwallet/extension-koni-ui/utils';
import { NestedAccount } from '@subwallet/extension-koni-ui/utils/gov/votingStats';
import { Button, Icon, ModalContext, SwList, Web3Block } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretRight, Copy, ListChecks, UsersThree } from 'phosphor-react';
import { IconWeight } from 'phosphor-react/src/lib';
import React, { forwardRef, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import DelegationDetailsModal from './DelegationDetails';

interface Props extends ThemeProps {
  accounts: NestedAccount[];
  chain: string;
  decimals: number;
  symbol: string;
}

const Component = ({ accounts, chain, className, decimals, symbol }: Props) => {
  const { accountProxies, accounts: accountsState } = useSelector((state) => state.accountState);
  const [searchText, setSearchText] = useState('');
  const [viewDetailItem, setViewDetailItem] = useState<NestedAccount | undefined>(undefined);
  const notify = useNotification();
  const { activeModal } = useContext(ModalContext);
  const { t } = useTranslation();

  const onClickMore = useCallback((item: NestedAccount) => {
    return () => {
      setViewDetailItem(item);
      activeModal(GOV_DELEGATION_DETAILS_MODAL);
    };
  }, [activeModal]);

  const _onClickCopyButton = useCallback((address: string) => {
    return (e: React.SyntheticEvent) => {
      e.stopPropagation();

      navigator.clipboard.writeText(address)
        .then(() => {
          notify({
            message: t('Copied to clipboard')
          });
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
          notify({
            message: t('Copy failed')
          });
        });
    };
  }, [notify, t]);

  const handleSearch = useCallback((value: string) => {
    setSearchText(value.trim().toLowerCase());
  }, []);

  const renderItem = useCallback((item: NestedAccount) => {
    const account = findAccountByAddress(accountsState, item.accountInfo.account);
    let accountProxy;

    if (account) {
      accountProxy = accountProxies.find((ap) => ap.id === account.proxyId);
    }

    const shortAddress = toShort(item.accountInfo.account);
    const accountProxyTypeIconProps = accountProxy ? getAccountProxyTypeIcon(accountProxy) : null;

    return <Web3Block
      className={'vote-item'}
      key={item.accountInfo.account}
      leftItem={
        <div className='__item-avatar-wrapper'>
          <AccountProxyAvatar
            size={32}
            value={accountProxy?.id || item.accountInfo.account}
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
        <>
          <div className={'vote-item__address-wrapper'}>
            <div className={'vote-item__address'}>
              {account?.name || shortAddress}
            </div>
          </div>

          <div className={'vote-item__info'}>
            <div className={'vote-item__delegation'}>
              <div className={'vote-item__delegation-row'}>
                <span className='vote-item__delegated-votes'>
                  <NumberDisplay
                    decimal={decimals}
                    decimalOpacity={0.45}
                    formatType={'balance'}
                    intOpacity={0.45}
                    prefix={'~'}
                    size={12}
                    suffix={symbol}
                    unitOpacity={0.45}
                    value={item.totalDelegatedVote || 0}
                  />
                </span>
                <>
                      |
                  <div className='vote-item__delegator-count'>
                    <Icon
                      phosphorIcon={UsersThree}
                      size='xs'
                      weight='fill'
                    />
                            &nbsp;: {`${item.totalDelegatedAccount}`}
                  </div>
                </>
              </div>
            </div>
          </div>
        </>
      }
      onClick={onClickMore(item)}
      rightItem={
        <div className={'vote-item__arrow-wrapper'}>
          <Button
            icon={
              <Icon
                className={'vote-item__arrow'}
                phosphorIcon={Copy}
                size={'sm'}
              />
            }
            onClick={_onClickCopyButton(item.accountInfo.account)}
            size={'xs'}
            type={'ghost'}
          />

          <Button
            icon={
              <Icon
                className={'vote-item__arrow'}
                phosphorIcon={CaretRight}
                size={'sm'}
              />
            }
            size={'xs'}
            type={'ghost'}
          />
        </div>
      }
    />;
  }, [_onClickCopyButton, accountProxies, accountsState, decimals, onClickMore, symbol]);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyList
        emptyMessage={t('No nested data')}
        phosphorIcon={ListChecks}
      />
    );
  }, [t]);

  const filteredAccounts = useMemo(() => {
    if (!searchText) {
      return accounts;
    }

    return accounts.filter((item) => {
      const shortAddr = toShort(item.accountInfo.account).toLowerCase();

      return (
        item.accountInfo.account.toLowerCase().includes(searchText) ||
        shortAddr.includes(searchText)
      );
    });
  }, [accounts, searchText]);

  return (
    <div className={CN(className, '__nested-vote-list')}>
      <Search
        autoFocus={true}
        className='__search-box'
        onSearch={handleSearch}
        placeholder={t('Search address/identity')}
        searchValue={searchText}
      />
      <SwList
        className={'list-items'}
        list={filteredAccounts}
        renderItem={renderItem}
        renderWhenEmpty={renderEmpty}
      />

      {viewDetailItem && (
        <DelegationDetailsModal
          chain={chain}
          decimals={decimals}
          nestedAccount={viewDetailItem}
          symbol={symbol}
        />
      )}
    </div>
  );
};

export const NestedVoteList = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    maxHeight: 480,
    display: 'flex',
    flexDirection: 'column',

    '.list-items': {
      overflowY: 'auto'
    },

    '.vote-item': {
      borderRadius: token.borderRadiusLG,
      background: token.colorBgSecondary,
      paddingBottom: token.paddingXS,
      paddingTop: token.paddingXS,
      marginBottom: token.marginXS
    },

    '.__search-box': {
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingXS
    },

    '.vote-item__address-wrapper': {
      display: 'flex',
      alignItems: 'center'
    },

    '.vote-item__address': {
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      fontWeight: token.headingFontWeight,
      paddingRight: token.paddingXXS,
      color: token.colorTextLight1,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    },

    '.vote-item__info': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextLight4
    },

    '.vote-item__delegation': {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextLight4
    },

    '.vote-item__delegation-row': {
      display: 'flex',
      alignItems: 'center',
      gap: token.marginXXS
    },

    '.vote-item__delegated-votes': {
      display: 'flex',
      alignItems: 'center'
    },

    '.vote-item__delegator-count': {
      color: token['green-8'],
      display: 'flex',
      alignItems: 'center'
    },

    '.vote-item__arrow-wrapper': {
      minWidth: '40px',
      display: 'flex',
      justifyContent: 'center',
      marginLeft: token.marginXXS,
      color: token.colorTextLight3
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
