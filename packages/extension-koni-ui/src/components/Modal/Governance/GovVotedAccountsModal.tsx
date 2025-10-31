// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxyAvatar } from '@subwallet/extension-koni-ui/components';
import ReferendumVoteSummary from '@subwallet/extension-koni-ui/components/Governance/ReferendumVoteSummary';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { UserVoting } from '@subwallet/extension-koni-ui/types/gov';
import { findAccountByAddress, getAccountProxyTypeIcon, toShort } from '@subwallet/extension-koni-ui/utils';
import { Icon, ModalContext, SwList, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { IconWeight } from 'phosphor-react/src/lib';
import React, { forwardRef, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  usersVoted: UserVoting[],
  modalId: string,
  chain: string
}

const Component = (props: Props) => {
  const { chain, className = '', modalId, usersVoted } = props;
  const { accountProxies, accounts } = useSelector((state) => state.accountState);
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal, modalId]);

  const renderItem = useCallback((userVoting: UserVoting) => {
    const account = findAccountByAddress(accounts, userVoting.address);
    let accountProxy;

    if (account) {
      accountProxy = accountProxies.find((ap) => ap.id === account.proxyId);
    }

    const shortAddress = toShort(userVoting.address);
    const accountProxyTypeIconProps = accountProxy ? getAccountProxyTypeIcon(accountProxy) : null;

    return (
      <div
        className={'__account-vote-item'}
        key={userVoting.address}
      >
        <div className='__item-avatar-wrapper'>
          <AccountProxyAvatar
            size={32}
            value={accountProxy?.id || userVoting.address}
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
        <div className={'__account-vote-content'}>
          <div className={'__account-vote-identity'}>
            { account?.name ? account.name : shortAddress }
          </div>
          <ReferendumVoteSummary
            chain={chain}
            iconVoteStatSize={'16px'}
            userVoting={[userVoting]}
          />
        </div>
      </div>
    );
  }, [accountProxies, accounts, chain]);

  return (
    <SwModal
      className={`${className}`}
      id={modalId}
      onCancel={onCancel}
      title={
        (<span className={'__account-vote-title'}>
          {t('Voted accounts')} <span className={'__account-voted-count'}>({usersVoted.length})</span>
        </span>)
      }
    >
      <SwList
        className={'__account-voted-list'}
        list={usersVoted}
        renderItem={renderItem}
        rowGap='var(--row-gap)'
      />
    </SwModal>
  );
};

const GovVotedAccountsModal = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-header': {
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingSM
    },

    '.ant-sw-modal-body': {
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: 544
    },

    '.__account-voted-list': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeXS
    },

    '.__account-vote-item': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeSM,
      padding: `${token.paddingXS}px ${token.paddingSM}px`,
      borderRadius: token.borderRadiusLG,
      backgroundColor: token.colorBgSecondary,

      '.__account-vote-content': {
        display: 'flex',
        flexDirection: 'column',

        '.__i-vote-summary, .__i-vote-stat-value .ant-typography': {
          fontSize: `${token.fontSizeSM}px !important`,
          lineHeight: `${token.lineHeightSM} !important`,
          fontWeight: `${token.bodyFontWeight} !important`,
          color: `${token.colorTextLight4} !important`
        },

        '.__i-vote-summary': {
          alignItems: 'baseline'
        },

        '.__i-vote-stat': {
          alignItems: 'center'
        }
      },

      '.__account-vote-identity': {
        fontSize: token.fontSizeHeading6,
        fontWeight: 600,
        lineHeight: token.lineHeightHeading6
      }
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
    },

    '.__account-vote-title': {
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      fontWeight: token.headingFontWeight,

      '.__account-voted-count': {
        color: token.colorTextLight4
      }
    }

  };
});

export default GovVotedAccountsModal;
