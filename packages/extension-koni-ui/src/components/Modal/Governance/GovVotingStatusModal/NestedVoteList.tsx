// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Search from '@subwallet/extension-koni-ui/components/Search';
import { GOV_DELEGATION_DETAILS_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatBalance, toShort } from '@subwallet/extension-koni-ui/utils';
import { NestedAccount } from '@subwallet/extension-koni-ui/utils/gov/votingStats';
import { Icon, ModalContext, SwList, Web3Block } from '@subwallet/react-ui';
import SwAvatar from '@subwallet/react-ui/es/sw-avatar';
import CN from 'classnames';
import { t } from 'i18next';
import { CaretRight, Copy, UsersThree } from 'phosphor-react';
import React, { forwardRef, useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';

import DelegationDetailsModal from './DelegationDetails';

interface Props extends ThemeProps {
  accounts: NestedAccount[];
  chain: string;
  decimals: number;
  symbol: string;
}

const Component = ({ accounts, chain, className, decimals, symbol }: Props) => {
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);

  const networkPrefix = chainInfoMap[chain]?.substrateInfo?.addressPrefix;
  const [searchText, setSearchText] = useState('');
  const [viewDetailItem, setViewDetailItem] = useState<NestedAccount | undefined>(undefined);

  const { activeModal } = useContext(ModalContext);

  const onClickMore = useCallback((item: NestedAccount) => {
    return () => {
      setViewDetailItem(item);
      activeModal(GOV_DELEGATION_DETAILS_MODAL);
    };
  }, [activeModal]);

  const handleSearch = useCallback((value: string) => {
    setSearchText(value.trim().toLowerCase());
  }, []);

  const renderItem = useCallback((item: NestedAccount) => {
    return <div
      className={CN(className)}
      key={item.accountInfo.account}
    >
      <Web3Block
        className={'vote-item'}
        leftItem={
          <SwAvatar
            identPrefix={networkPrefix}
            size={32}
            value={item.accountInfo.account}
          />
        }
        middleItem={
          <>
            <div className={'vote-item__address-wrapper'}>
              <div className={'vote-item__address'}>
                {toShort(item.accountInfo.account)}
              </div>
            </div>

            <div className={'vote-item__info'}>
              <div className={'vote-item__delegation'}>
                <div className={'vote-item__delegation-row'}>
                  <span className='vote-item__delegated-votes'>
                    ~{formatBalance(item.totalDelegatedVote, decimals)} {symbol}
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
            <Icon
              className={'vote-item__arrow'}
              phosphorIcon={Copy}
              size={'sm'}
            />
            <Icon
              className={'vote-item__arrow'}
              phosphorIcon={CaretRight}
              size={'sm'}
            />
          </div>
        }
      />
    </div>;
  }, [className, decimals, networkPrefix, onClickMore, symbol]);

  const renderEmpty = useCallback(() => {
    return <>No nested data</>;
  }, []);

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
    <div>
      <Search
        autoFocus={true}
        className='__search-box'
        onSearch={handleSearch}
        placeholder={t<string>('Search address/identity')}
        searchValue={searchText}
      />
      <SwList
        list={filteredAccounts}
        renderItem={renderItem}
        renderWhenEmpty={renderEmpty}
      />

      {viewDetailItem && (
        <DelegationDetailsModal
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
    borderRadius: token.borderRadiusLG,
    background: token.colorBgSecondary,

    '.vote-item': {
      borderRadius: token.borderRadiusLG,
      paddingBottom: token.paddingXS,
      paddingTop: token.paddingXS,
      marginBottom: token.marginXS
    },

    '.__search-box': {
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: token.colorBgSecondary,
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingXS
    },

    '.vote-item:first-child': {
      marginTop: token.marginXS
    },

    '.vote-item__address-wrapper': {
      display: 'flex',
      alignItems: 'center'
    },

    '.vote-item__address': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      paddingRight: token.paddingXXS,
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
      color: token.colorSuccess,
      display: 'flex',
      alignItems: 'center'
    },

    '.vote-item__arrow-wrapper': {
      minWidth: '40px',
      display: 'flex',
      justifyContent: 'center',
      marginLeft: token.marginXXS
    },

    '.vote-item__arrow': {
      paddingLeft: token.paddingSM - 2,
      paddingRight: token.paddingSM - 2
    }
  };
});
