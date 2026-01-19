// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MultisigTxType, PendingMultisigTx } from '@subwallet/extension-base/services/multisig-service';
import AccountProxyAvatar from '@subwallet/extension-koni-ui/components/AccountProxy/AccountProxyAvatar';
import { useGetAccountByAddress } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { customFormatDate, toShort } from '@subwallet/extension-koni-ui/utils';
import { Icon, Logo, Web3Block } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowUpRight, HardDrives, Question } from 'phosphor-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  item: PendingMultisigTx;
  onClick?: () => void;
};

const Component = ({ className = '', item, onClick }: Props) => {
  const { t } = useTranslation();
  const txInfo = useMemo(() => {
    const method = item.decodedCallData?.method || '';

    if (item.multisigTxType === MultisigTxType.TRANSFER || method.includes('transfer')) {
      return { icon: ArrowUpRight, name: 'Send' };
    }

    if (item.multisigTxType === MultisigTxType.STAKING) {
      return { icon: HardDrives, name: 'Stake' };
    }

    return { icon: Question, name: 'Unknown' };
  }, [item]);

  const currentApprovals = item.approvals.length;
  const threshold = item.threshold;
  const percent = threshold > 0 ? (currentApprovals / threshold) * 100 : 0;
  const isApproved = currentApprovals === threshold;

  const currentSignerInWallet = useGetAccountByAddress(item.currentSigner);
  const multisigAccInWallet = useGetAccountByAddress(item.multisigAddress);

  return (
    <Web3Block
      className={CN('multisig-item', className)}
      middleItem={
        <div className={'__container'}>
          {/* Header Section */}
          <div className={'__header'}>
            <div className={'__icon-wrapper'}>
              <Icon
                className={'__main-icon'}
                phosphorIcon={txInfo.icon}
                size={'md'}
              />
              <Logo
                className={'__chain-logo'}
                network={item.chain}
                size={16}
              />
            </div>
            <div className={'__info'}>
              <div className={'__account-name-container'}>
                <div className={'__account-name'}>
                  {currentSignerInWallet?.name || `${toShort(item.currentSigner)}`}
                </div>
                <div className={'__status-row'}>
                  <div className={CN('__status-text', isApproved ? '-approved' : '-waiting')}>
                    {isApproved ? t('ui.HISTORY.components.MultisigItem.approved') : t('ui.HISTORY.components.MultisigItem.waitingForApproval')}
                  </div>
                </div>
              </div>
              <div className={'__meta'}>
                {`${txInfo.name} - ${item.timestamp ? customFormatDate(item.timestamp, '#hhhh#:#mm#') : t('ui.HISTORY.components.MultisigItem.processing')}`}
              </div>
            </div>
            <div className={'__value-group'}>
              {/* <Number */}
              {/*  className={'__value'} */}
              {/*  decimal={10} */}
              {/*  suffix={item.chain.includes('paseo') ? 'PAS' : 'DOT'} */}
              {/*  value={amountValue} */}
              {/* /> */}
              {/* <Number */}
              {/*  className={'__deposit-amount'} */}
              {/*  decimal={chainInfo?.substrateInfo?.decimals || 0} */}
              {/*  suffix={chainInfo?.substrateInfo?.symbol || ''} */}
              {/*  value={item.depositAmount} */}
              {/* /> */}
            </div>
          </div>

          {/* Progress Section */}
          <div className={'__progress-section'}>
            <div className={'__label-row'}>
              <span>{t('ui.HISTORY.components.MultisigItem.approvalStatus')}</span>
              <span className={'__count'}>{t('ui.HISTORY.components.MultisigItem.approvalCount', { replace: {
                currentApprovals: currentApprovals,
                threshold: threshold
              } })}</span>
            </div>
            <div className={'__bar-track'}>
              <div
                className={'__bar-fill'}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
          <div className={'__divider-line'}></div>
          <div className={'__status-row'}>
            <span>{t('ui.HISTORY.components.MultisigItem.multisigAccount')}</span>
            <div className={'multisig-account-wrapper'}>
              <div className={'multisig-account-avatar'}>
                <AccountProxyAvatar
                  className={'__avatar'}
                  size={24}
                  value={multisigAccInWallet?.proxyId || multisigAccInWallet?.address}
                />
              </div>
              <span className={'multisig-account-value'}>{multisigAccInWallet?.name || toShort(multisigAccInWallet?.address || '', 8, 9)}</span>
            </div>
          </div>
        </div>
      }
      onClick={onClick}
    />
  );
};

export const MultisigHistoryItem = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  backgroundColor: token.colorBgSecondary,
  borderRadius: 12,
  padding: '12px 12px 16px 12px',
  marginBottom: token.marginSM,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',

  '.__account-name-container': {
    display: 'flex',
    justifyContent: 'space-between'
  },

  '.multisig-account-wrapper': {
    display: 'flex',
    gap: 8,
    overflow: 'hidden'
  },

  '.multisig-account-value': {
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  '&:hover': {
    backgroundColor: token.colorBgInput
  },

  '.__container': {
    display: 'flex',
    flexDirection: 'column'
  },

  '.__header': {
    display: 'flex',
    alignItems: 'center',
    marginBottom: token.marginXS,

    '.__icon-wrapper': {
      position: 'relative',
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(74, 201, 155, 0.1)',
      borderRadius: '50%',
      marginRight: 14,

      '.__main-icon': {
        color: token.colorSuccess
      }
    },

    '.__chain-logo': {
      position: 'absolute',
      right: -2,
      bottom: -2
    },

    '.__info': {
      flex: 1,
      overflow: 'hidden',
      '.__account-name': {
        color: token.colorTextLight1,
        fontSize: token.fontSizeHeading5,
        fontWeight: token.headingFontWeight,
        textOverflow: 'ellipsis',
        overflow: 'hidden'
      },
      '.__meta': {
        color: token.colorTextLight4,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM
      }
    },

    '.__value-group': {
      textAlign: 'right',
      '.__value': { color: token.colorTextLight1, fontSize: token.fontSizeHeading5 },
      '.__deposit-amount': { color: token.colorTextLight4, fontSize: token.fontSizeSM, opacity: 0.45 }
    }
  },

  '.__progress-section': {
    backgroundColor: token.colorTextDark1,
    paddingTop: token.paddingXS,
    paddingBottom: token.paddingSM,
    paddingLeft: token.paddingXS,
    paddingRight: token.paddingXS,
    borderRadius: token.borderRadiusLG,
    marginBottom: 12,
    '.__label-row': {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: token.fontSizeSM,
      marginBottom: 8,
      color: token.colorTextLight4,
      lineHeight: token.lineHeightSM,
      '.__count': { color: token.colorWarningText }
    },
    '.__bar-track': {
      height: 8,
      backgroundColor: token.colorBgInput,
      borderRadius: token.borderRadiusSM,
      overflow: 'hidden'
    },
    '.__bar-fill': {
      height: '100%',
      backgroundColor: token.colorPrimary,
      borderRadius: 10
    }
  },

  '.__divider-line': {
    border: '2px solid',
    borderColor: token.colorBgDivider,
    marginBottom: 10
  },

  '.__status-row': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: token.fontSizeSM,
    color: token.colorTextLight4,
    lineHeight: token.lineHeightSM,
    '.__status-text': {
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: token.borderRadiusLG,
      '&.-waiting': { color: token.colorWarningText, backgroundColor: token['colorWarning-2'] },
      '&.-approved': { color: token.colorSuccess, backgroundColor: token['cyan-2'] }
    }
  }
}));
