// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { BitcoinSignPsbtRequest, ConfirmationsQueueItem, PsbtTransactionArg } from '@subwallet/extension-base/background/KoniTypes';
import { AccountItemWithProxyAvatar, ConfirmationGeneralInfo, MetaInfo, ViewDetailIcon } from '@subwallet/extension-web-ui/components';
import { useGetAccountByAddress, useOpenDetailModal } from '@subwallet/extension-web-ui/hooks';
import { BitcoinSignArea } from '@subwallet/extension-web-ui/Popup/Confirmations/parts';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { BitcoinSignatureSupportType, ThemeProps } from '@subwallet/extension-web-ui/types';
import { findAccountByAddress } from '@subwallet/extension-web-ui/utils';
import { Button, Number } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { BaseDetailModal } from '../parts';

interface Props extends ThemeProps {
  type: BitcoinSignatureSupportType
  request: ConfirmationsQueueItem<BitcoinSignPsbtRequest>
}

function Component ({ className, request, type }: Props) {
  const { id, payload } = request;
  const { t } = useTranslation();
  const { address, errors } = payload;
  const { tokenSlug, txInput, txOutput } = request.payload.payload;
  const account = useGetAccountByAddress(address);
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const assetRegistry = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const onClickDetail = useOpenDetailModal();
  const assetInfo: _ChainAsset | undefined = useMemo(() => {
    return assetRegistry[tokenSlug];
  }, [assetRegistry, tokenSlug]);
  const renderAccountTransactionDetail = useCallback((accountsPsbt: PsbtTransactionArg[]) => {
    return (
      <div className={'transaction-detail-container'}>
        {
          accountsPsbt.map(({ address, amount }) => {
            const account = findAccountByAddress(accounts, address);

            return (<AccountItemWithProxyAvatar
              account={account}
              accountAddress={address}
              className='account-item'
              key={address}
              rightPartNode={amount
                ? <Number
                  decimal={assetInfo.decimals || 0}
                  suffix={assetInfo.symbol || ''}
                  value={amount}
                />
                : <></>}
              showUnselectIcon={false}
            />);
          }
          )
        }

      </div>
    );
  }, [accounts, assetInfo?.decimals, assetInfo?.symbol]);

  return (
    <>
      <div className={CN('confirmation-content', className)}>
        <ConfirmationGeneralInfo request={request} />
        <div className='title'>
          {t('Signature required')}
        </div>
        <div className='description'>
          {t('You are approving a request with the following account')}
        </div>
        <AccountItemWithProxyAvatar
          account={account}
          accountAddress={address}
          className='account-item'
          isSelected={true}
        />
        {!errors?.length && <div>
          <Button
            icon={<ViewDetailIcon />}
            onClick={onClickDetail}
            size='xs'
            type='ghost'
          >
            {t('View details')}
          </Button>
        </div>}
      </div>
      <BitcoinSignArea
        id={id}
        payload={request}
        type={type}
      />
      <BaseDetailModal
        className={CN(className, 'transaction-detail-modal')}
        title={t('PSBT details')}
      >
        <MetaInfo>
          <MetaInfo.Data label={t('Input')}>
            {renderAccountTransactionDetail(txInput)}
          </MetaInfo.Data>
          <MetaInfo.Data label={t('Output')}>
            {renderAccountTransactionDetail(txOutput)}
          </MetaInfo.Data>

        </MetaInfo>
      </BaseDetailModal>
    </>
  );
}

const BitcoinSignPsbtConfirmation = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
  '.account-list': {
    display: 'flex',
    flexDirection: 'column',
    gap: token.marginXS,

    '.__prop-label': {
      marginRight: token.marginMD,
      width: '50%',
      float: 'left'
    },

    '.account-info-item': {
      marginTop: 0
    }
  },

  '.__label': {
    textAlign: 'left'
  },

  '.confirmation-content-body': {
    display: 'flex',
    flexDirection: 'column',
    gap: token.size
  },

  '.__account-item-name': {
    maxWidth: 155
  },

  '.account-info-item, .to-account': {
    '.__account-item-address': {
      textAlign: 'right'
    }
  },

  '.input-transaction, .output-transaction': {
    display: 'flex',
    justifyContent: 'space-between'
  },

  '.transaction-detail-container': {
    display: 'flex',
    flexDirection: 'column',
    gap: token.sizeXS,

    '.account-item': {
      backgroundColor: token.colorBgSecondary,

      '.__item-middle-part': {
        flex: '0 1 auto',
        minWidth: 0
      },

      '.__item-right-part': {
        flex: '1 1 auto',
        whiteSpace: 'nowrap',

        '.ant-number': {
          marginLeft: 'auto'
        }
      }
    },

    '.__account-name-item': {
      fontWeight: 600,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      color: token.colorTextLight1,
      fontFamily: token.fontFamily
    },

    '.account-item-address-wrapper': {
      fontWeight: 600,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      fontFamily: token.fontFamily
    },

    '.__item-right-part .ant-number': {
      color: token.colorTextLight1
    }
  },

  '&.transaction-detail-modal': {
    '.__col.__value-col, .-type-data': {
      marginTop: `${token.marginXS}px !important`
    }
  }
}));

export default BitcoinSignPsbtConfirmation;
