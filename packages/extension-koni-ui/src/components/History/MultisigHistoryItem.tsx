// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MultisigTxType, PendingMultisigTx } from '@subwallet/extension-base/services/multisig-service';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, Logo, Number, Web3Block } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowUpRight, HardDrives, Question } from 'phosphor-react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  item: PendingMultisigTx;
  onClick?: () => void;
};

const Component = ({ className = '', item, onClick }: Props) => {
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
  const totalSigners = item.signerAddresses?.length || 0;
  const percent = totalSigners > 0 ? (currentApprovals / totalSigners) * 100 : 0;
  const isApproved = currentApprovals === totalSigners;

  const amountValue = item.decodedCallData?.args?.value?.toString().replace(/,/g, '') || '0';

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
              <div className={'__account-name'}>
                {`${item.multisigAddress}`}
              </div>
              <div className={'__meta'}>
                {`${txInfo.name} - ${item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Processing'}`}
              </div>
            </div>
            <div className={'__value-group'}>
              <Number
                className={'__value'}
                decimal={10}
                suffix={item.chain.includes('paseo') ? 'PAS' : 'DOT'}
                value={amountValue}
              />
              <Number
                className={'__fee'}
                decimal={10}
                suffix={'UNIT'}
                value={item.depositAmount}
              />
            </div>
          </div>

          {/* Progress Section */}
          <div className={'__progress-section'}>
            <div className={'__label-row'}>
              <span>Approval status</span>
              <span className={'__count'}>{`${currentApprovals}/${totalSigners} Approval`}</span>
            </div>
            <div className={'__bar-track'}>
              <div
                className={'__bar-fill'}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Status Section */}
          <div className={'__status-row'}>
            <span>Signatory approval</span>
            <div className={CN('__status-text', isApproved ? '-approved' : '-waiting')}>
              {isApproved ? 'Approved' : 'Waiting for approval'}
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
  borderRadius: token.borderRadiusLG,
  padding: '12px 16px',
  marginBottom: token.sizeXS,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',

  '&:hover': {
    backgroundColor: token.colorBgInput
  },

  '.__container': {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },

  '.__header': {
    display: 'flex',
    alignItems: 'center',
    gap: 12,

    '.__icon-wrapper': {
      position: 'relative',
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(74, 201, 155, 0.1)',
      borderRadius: '50%',

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
        fontSize: token.fontSizeSM
      }
    },

    '.__value-group': {
      textAlign: 'right',
      '.__value': { color: token.colorTextLight1, fontSize: token.fontSizeHeading5 },
      '.__fee': { color: token.colorTextLight4, fontSize: token.fontSizeSM, opacity: 0.45 }
    }
  },

  '.__progress-section': {
    '.__label-row': {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: token.fontSizeSM,
      marginBottom: 6,
      color: token.colorTextLight4,
      '.__count': { color: token.colorWarning }
    },
    '.__bar-track': {
      height: 6,
      backgroundColor: token.colorBgInput,
      borderRadius: 10,
      overflow: 'hidden'
    },
    '.__bar-fill': {
      height: '100%',
      backgroundColor: token.colorPrimary,
      borderRadius: 10
    }
  },

  '.__status-row': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: token.fontSizeSM,
    color: token.colorTextLight4,
    '.__status-text': {
      fontWeight: 600,
      '&.-waiting': { color: token.colorWarning },
      '&.-approved': { color: token.colorSuccess }
    }
  }
}));
