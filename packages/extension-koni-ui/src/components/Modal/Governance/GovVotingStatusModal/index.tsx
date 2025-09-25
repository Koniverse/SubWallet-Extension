// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field/Base';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { VoteBucket } from '@subwallet/extension-koni-ui/utils/gov/votingStats';
import { Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretLeft } from 'phosphor-react';
import React, { forwardRef, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

import { FlattenedVoteList } from './FlattenedVoteList';
import { NestedVoteList } from './NestedVoteList';

interface Props extends ThemeProps, BasicInputWrapper {
  modalId: string;
  title: string;
  readOnly?: boolean;
  voteData: VoteBucket;
  decimal: number;
  symbol: string;
  chain: string;
}

const Component = (props: Props) => {
  const { chain, className = '', decimal, modalId, symbol, title = '', voteData } = props;
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const { token } = useTheme() as Theme;

  const [isNested, setIsNested] = useState(true);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal, modalId]);

  const handleSetNested = useCallback(() => {
    setIsNested(true);
  }, []);

  const handleSetFlattened = useCallback(() => {
    setIsNested(false);
  }, []);

  return (
    <SwModal
      className={`${className} modal-full`}
      closeIcon={(
        <Icon
          phosphorIcon={CaretLeft}
          size='md'
        />
      )}
      id={modalId}
      onCancel={onCancel}
      title={
        (<span className={'__voting-status-title'}>
          {t(title)} <span className={'__voting-status-count'}>({voteData.totalVotedAccounts})</span>
        </span>)
      }
    >
      <div className='__view-toggle'>
        <div
          className={CN('__view-toggle-btn', { '-active': isNested })}
          onClick={handleSetNested}
        >
          Nested {`(${voteData.accounts.nested.length})`}
        </div>
        <div
          className={CN('__view-toggle-btn', { '-active': !isNested })}
          onClick={handleSetFlattened}
        >
          Flattened {`(${voteData.accounts.flattened.length})`}
        </div>
        <div
          className='__view-toggle-bg'
          style={{
            left: isNested ? '0.25rem' : 'calc(50% + 0.25rem)',
            background: token.colorBgInput
          }}
        />
      </div>

      <div className='__list-wrapper'>
        {isNested
          ? <NestedVoteList
            accounts={voteData.accounts.nested}
            chain={chain}
            decimals={decimal}
            symbol={symbol}
          />
          : <FlattenedVoteList
            accounts={voteData.accounts.flattened}
            chain={chain}
            decimal={decimal}
            symbol={symbol}
          />
        }
      </div>
    </SwModal>
  );
};

const GovVotingStatusModal = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-header': {
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingSM
    },

    '.ant-sw-modal-body': {
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },

    '.__view-toggle': {
      position: 'relative',
      display: 'flex',
      justifyContent: 'space-between',
      background: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      marginInline: token.margin,
      marginBottom: token.margin,
      overflow: 'hidden',
      flexShrink: 0
    },

    '.__list-wrapper': {
      height: '100%',
      paddingInline: token.padding,
      paddingBottom: token.padding
    },

    '.__view-toggle-btn': {
      flex: 1,
      textAlign: 'center',
      padding: '0.5rem',
      cursor: 'pointer',
      zIndex: 2,
      transition: 'color 0.3s ease-in-out',
      userSelect: 'none'
    },

    '.__view-toggle-bg': {
      position: 'absolute',
      top: '0.25rem',
      left: '0.25rem',
      width: 'calc(50% - 0.5rem)',
      height: 'calc(100% - 0.5rem)',
      borderRadius: '0.5rem',
      zIndex: 1,
      transition: 'left 0.3s ease-in-out, background 0.3s ease-in-out'
    },

    '.__voting-status-title': {
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      fontWeight: token.headingFontWeight,

      '.__voting-status-count': {
        color: token.colorTextLight4
      }
    }
  };
});

export default GovVotingStatusModal;
