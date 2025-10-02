// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { GOV_DELEGATION_DETAILS_MODAL } from '@subwallet/extension-koni-ui/constants';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { NestedAccount } from '@subwallet/extension-koni-ui/utils/gov/votingStats';
import { ModalContext, SwModal } from '@subwallet/react-ui';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

import { FlattenedVoteList } from './FlattenedVoteList';

type Props = ThemeProps & {
  onCancel?: () => void;
  nestedAccount: NestedAccount;
  decimals: number;
  symbol: string;
  chain: string;
};

function Component (props: Props): React.ReactElement<Props> {
  const { chain, className, decimals, nestedAccount, onCancel, symbol } = props;
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);

  const _onCancel = useCallback(() => {
    inactiveModal(GOV_DELEGATION_DETAILS_MODAL);

    onCancel && onCancel();
  }, [inactiveModal, onCancel]);

  return (
    <SwModal
      className={`${className ?? ''} modal-full`}
      id={GOV_DELEGATION_DETAILS_MODAL}
      onCancel={_onCancel}
      title={t('Delegation details')}
    >
      <div className={'section-title'}>{t('SELF VOTES')}</div>
      <MetaInfo
        className='meta-block'
        hasBackgroundWrapper
        spaceSize={'xs'}
      >
        <MetaInfo.Number
          className={'__delegation-item-votes'}
          decimals={decimals}
          label={t('Votes')}
          suffix={symbol}
          value={nestedAccount.accountInfo.votes || 0}
        />
        <MetaInfo.Default
          className={'__delegation-item-votes'}
          label={t('Conviction')}
        >
          {nestedAccount.accountInfo.conviction}
        </MetaInfo.Default>
        <MetaInfo.Number
          className={'__delegation-item-votes'}
          decimals={decimals}
          label={t('Capital')}
          suffix={symbol}
          value={nestedAccount.accountInfo.balance || 0}
        />
      </MetaInfo>
      <div className={'section-title'}>{t('DELEGATION VOTES')}</div>
      <MetaInfo
        className='meta-block'
        hasBackgroundWrapper
        spaceSize={'xs'}
      >
        <MetaInfo.Number
          className={'__delegation-item-votes'}
          decimals={decimals}
          label={t('Votes')}
          suffix={symbol}
          value={nestedAccount.accountInfo.delegations?.votes || 0}
        />
        <MetaInfo.Default
          className={'__delegation-item-votes'}
          label={t('Delegators')}
        >
          {nestedAccount.totalDelegatedAccount}
        </MetaInfo.Default>
        <MetaInfo.Number
          className={'__delegation-item-votes'}
          decimals={decimals}
          label={t('Capital')}
          suffix={symbol}
          value={nestedAccount.accountInfo.delegations?.capital || 0 }
        />
      </MetaInfo>
      {nestedAccount.totalDelegatedAccount > 0 && (
        <>
          <div className={'section-title'}>{t('DELEGATION LIST ')}
            <span className={'__delegation-account-total'}>
              ({nestedAccount.totalDelegatedAccount})
            </span>
          </div>
          <FlattenedVoteList
            accounts={nestedAccount.delegatedAccount}
            chain={chain}
            decimal={decimals}
            symbol={symbol}
          />
        </>
      )}
    </SwModal>
  );
}

const DelegationDetailsModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-header': {
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingSM
    },

    '.ant-sw-modal-body': {
      paddingInline: token.padding
    },

    '.section-title': {
      fontSize: token.fontSizeSM,
      lineHeight: '20px',
      fontWeight: 600,
      color: token.colorTextLight1,
      marginBottom: token.marginXS
    },

    '.__delegation-item-votes': {
      '.__label': {
        color: token.colorTextLight4
      },

      '.__value': {
        color: token.colorTextLight1
      }
    },

    '.__delegation-account-total': {
      color: token.colorTextLight4
    },

    '.meta-block': {
      marginBottom: token.marginSM
    }
  });
});

export default DelegationDetailsModal;
