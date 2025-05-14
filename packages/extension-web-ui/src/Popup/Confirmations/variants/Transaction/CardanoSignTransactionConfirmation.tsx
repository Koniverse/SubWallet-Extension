// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddressCardanoTransactionBalance, CardanoSignTransactionRequest, ConfirmationsQueueItem } from '@subwallet/extension-base/background/KoniTypes';
import { CardanoBalanceItem } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/cardano/types';
import { Button, Number } from '@subwallet/react-ui';
import { BigNumber } from 'bignumber.js';
import CN from 'classnames';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { CardanoSignatureSupportType, ThemeProps } from '@subwallet/extension-web-ui/types';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { useOpenDetailModal } from '@subwallet/extension-web-ui/hooks';
import { findAccountByAddress } from '@subwallet/extension-web-ui/utils';
import {
  AccountItemWithProxyAvatar,
  ConfirmationGeneralInfo,
  MetaInfo,
  ViewDetailIcon
} from '@subwallet/extension-web-ui/components';
import { BaseDetailModal, CardanoSignArea } from '@subwallet/extension-web-ui/Popup/Confirmations/parts';

interface Props extends ThemeProps {
  type: CardanoSignatureSupportType
  request: ConfirmationsQueueItem<CardanoSignTransactionRequest>
}

const filterAddresses = (inputs: Record<string, AddressCardanoTransactionBalance>, key: keyof AddressCardanoTransactionBalance): string[] => {
  return Object.entries(inputs).map(([address, input]) => {
    return input[key] ? address : null;
  }).filter(Boolean) as string[];
};

// TODO: Support displaying any native token, not just ADA/TADA.
const calculateAccountBalance = (value: CardanoBalanceItem[]) => {
  const lovelaceAmount = value.find((item) => item.unit === 'lovelace');

  if (!lovelaceAmount) {
    return '0';
  }

  return new BigNumber(lovelaceAmount.quantity).toString();
};

function Component ({ className, request, type }: Props) {
  const { id, payload: { errors, estimateCardanoFee, networkKey, txInputs, txOutputs, value } } = request;
  const { t } = useTranslation();

  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { accounts } = useSelector((state: RootState) => state.accountState);

  const chainInfo = useMemo(() => chainInfoMap[networkKey], [chainInfoMap, networkKey]);
  const onClickDetail = useOpenDetailModal();
  const ownerAddresses = useMemo(() => filterAddresses(txInputs, 'isOwner'), [txInputs]);
  const recipientAddresses = useMemo(() => filterAddresses(txOutputs, 'isRecipient'), [txOutputs]);

  const amount = useMemo(() => calculateAccountBalance(value), [value]);

  const renderAccountTransactionDetail = useCallback((accountMap: Record<string, AddressCardanoTransactionBalance>) => {
    return (
      <div className={'transaction-detail-container'}>
        {
          Object.entries(accountMap).map(([address, balances]) => {
            const account = findAccountByAddress(accounts, address);
            const amount = calculateAccountBalance(balances.values);

            return (
              <AccountItemWithProxyAvatar
                account={account}
                accountAddress={address}
                className='account-item'
                key={address}
                rightPartNode={amount
                  ? <Number
                    decimal={chainInfo.cardanoInfo?.decimals || 0}
                    suffix={chainInfo.cardanoInfo?.symbol || ''}
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
  }, [accounts, chainInfo.cardanoInfo?.decimals, chainInfo.cardanoInfo?.symbol]);

  return (
    <>
      <div className={CN('confirmation-content', className)}>
        <ConfirmationGeneralInfo request={request} />
        <div className='title'>
          {t('Transaction request')}
        </div>
        <MetaInfo className={'confirmation-content-body'}>
          <MetaInfo.Number
            decimals={chainInfo?.cardanoInfo?.decimals}
            label={t('Amount')}
            suffix={chainInfo?.cardanoInfo?.symbol}
            value={amount}
          />
          <div className='input-transaction'>
            <div className='account-label'>{t('From account')}</div>
            <div className={'account-list'}>
              {
                ownerAddresses.map((address) => (
                  <MetaInfo.Account
                    address={address}
                    className={'account-info-item'}
                    key={address}
                  />
                ))
              }
            </div>
          </div>
          <div className='output-transaction'>
            <div className='account-label'>{t('To account')}</div>
            <div className={'account-list'}>
              {
                recipientAddresses.map((address) => (
                  <MetaInfo.Account
                    address={address}
                    className={'account-info-item'}
                    key={address}
                  />
                ))
              }
            </div>

          </div>

          <MetaInfo.Number
            decimals={chainInfo?.cardanoInfo?.decimals}
            label={t('Estimated fee')}
            suffix={chainInfo?.cardanoInfo?.symbol}
            value={estimateCardanoFee || '0'}
          />
        </MetaInfo>

        {(!errors || errors.length === 0) && <div>
          <Button
            icon={<ViewDetailIcon />}
            onClick={onClickDetail}
            size='xs'
            type='ghost'
          >
            {t('View details')}
          </Button>
        </div>
        }
      </div>
      <CardanoSignArea
        id={id}
        payload={request}
        type={type}
      />
      {(!errors || errors.length === 0) &&
        <BaseDetailModal
          className={CN(className, 'transaction-detail-modal')}
          title={t('Transaction details')}
        >
          <MetaInfo>
            <MetaInfo.Data label={t('Input')}>
              {renderAccountTransactionDetail(txInputs)}
            </MetaInfo.Data>
            <MetaInfo.Data label={t('Output')}>
              {renderAccountTransactionDetail(txOutputs)}
            </MetaInfo.Data>

          </MetaInfo>
        </BaseDetailModal>
      }
    </>
  );
}

const EvmTransactionConfirmation = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
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

export default EvmTransactionConfirmation;
