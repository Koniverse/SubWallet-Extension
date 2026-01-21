// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicStatus } from '@subwallet/extension-base/background/KoniTypes';
import { PendingMultisigTx } from '@subwallet/extension-base/services/multisig-service';
import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import AccountProxyAvatar from '@subwallet/extension-koni-ui/components/AccountProxy/AccountProxyAvatar';
import { HistoryStatusMap } from '@subwallet/extension-koni-ui/constants';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import HistoryMultisigHeader from '@subwallet/extension-koni-ui/Popup/Home/History/Detail/parts/MultisigHeader';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatHistoryDate, reformatAddress, toShort } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { hexAddPrefix, isHex } from '@polkadot/util';

interface Props extends ThemeProps {
  data: PendingMultisigTx;
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, data } = props;
  const { t } = useTranslation();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { accountProxies } = useSelector((state) => state.accountState);
  const { language } = useSelector((state) => state.settings);

  // Helper to find account information across all proxies
  const getAccountInfo = useCallback((address: string) => {
    const reformatted = reformatAddress(address);

    for (const proxy of accountProxies) {
      const found = proxy.accounts.find((acc) => reformatAddress(acc.address) === reformatted);

      if (found) {
        return found;
      }
    }

    return undefined;
  }, [accountProxies]);

  const chainInfo = useMemo(() => {
    return chainInfoMap[data.chain];
  }, [chainInfoMap, data.chain]);

  const extrinsicHash = useMemo(() => {
    if (!data?.extrinsicHash) {
      return '...';
    }

    return isHex(hexAddPrefix(data.extrinsicHash)) ? toShort(data.extrinsicHash, 8, 9) : '...';
  }, [data]);

  const callData = useMemo(() => {
    if (!data?.callData) {
      return null;
    }

    return toShort(data.callData, 8, 9);
  }, [data]);

  const sortedSigners = useMemo(() => {
    if (!data?.signerAddresses) {
      return [];
    }

    return [...data.signerAddresses].sort((a, b) => {
      const isInitiatorA = a === data.depositor;
      const isInitiatorB = b === data.depositor;
      const isApprovedA = data.approvals.includes(a);
      const isApprovedB = data.approvals.includes(b);

      if (isInitiatorA && !isInitiatorB) {
        return -1;
      }

      if (!isInitiatorA && isInitiatorB) {
        return 1;
      }

      if (isApprovedA && !isApprovedB) {
        return -1;
      }

      if (!isApprovedA && isApprovedB) {
        return 1;
      }

      return 0;
    });
  }, [data]);

  return (
    <div className={CN(className)}>
      <MetaInfo
        className={'meta-info-area'}
        hasBackgroundWrapper
      >
        <MetaInfo.DisplayType
          label={t('ui.HISTORY.screen.HistoryDetail.MultisigLayout.type')}
          typeName={t(data.multisigTxType || 'Unknown')}
        />
        <HistoryMultisigHeader data={data} />

        <MetaInfo.Status
          label={t('ui.HISTORY.screen.HistoryDetail.MultisigLayout.status')}
          statusIcon={HistoryStatusMap[ExtrinsicStatus.PROCESSING].icon}
          statusName={t(HistoryStatusMap[ExtrinsicStatus.PROCESSING].name)}
          valueColorSchema={HistoryStatusMap[ExtrinsicStatus.PROCESSING].schema}
        />

        <MetaInfo.Default
          label={t('ui.HISTORY.screen.HistoryDetail.MultisigLayout.extrinsicHash')}
        >
          {extrinsicHash}
        </MetaInfo.Default>

        {data.callData && (
          <MetaInfo.Default
            label={t('ui.HISTORY.screen.HistoryDetail.MultisigLayout.callData')}
          >
            {callData}
          </MetaInfo.Default>
        )}

        {!!data.timestamp && (
          <MetaInfo.Default label={t('ui.HISTORY.screen.HistoryDetail.MultisigLayout.submittedTime')}>
            {formatHistoryDate(data.timestamp, language, 'detail')}
          </MetaInfo.Default>
        )}

        {/* Multisig Deposit */}
        {data.depositAmount && (
          <MetaInfo.Number
            decimals={chainInfo?.substrateInfo?.decimals || 0}
            label={t('ui.HISTORY.screen.HistoryDetail.MultisigLayout.multisigDeposit')}
            suffix={chainInfo?.substrateInfo?.symbol || ''}
            value={data.depositAmount}
          />
        )}
      </MetaInfo>

      {/* Signatories Section */}
      <div className='signatories-container'>
        <div className='signatories-label'>
          <div className={'signatories-label-left'}>
            {t('ui.HISTORY.screen.HistoryDetail.MultisigLayout.signatories')}
          </div>
          <div className={'signatories-label-right'}>
            {t('ui.HISTORY.screen.HistoryDetail.MultisigLayout.approvalThreshold', { replace: {
              threshold: data.threshold,
              numberSigners: data.signerAddresses.length
            } })}
          </div>
        </div>
        <div className='signatory-item-container'>
          {sortedSigners.map((signer) => {
            const isApproved = data.approvals.includes(signer);
            const isInitiator = signer === data.depositor;
            const accountInfo = getAccountInfo(signer);

            return (
              <div
                className='signatory-item'
                key={signer}
              >
                <div className='signatory-item-left'>
                  <div className={'signatory-account-wrapper'}>
                    <div className={'signatory-account-avatar'}>
                      <AccountProxyAvatar
                        className={'__avatar'}
                        size={24}
                        value={accountInfo?.proxyId || signer}
                      />
                    </div>
                    <span className={'signatory-account-value'}>{accountInfo?.name || toShort(signer, 8, 9)}</span>
                  </div>
                  {(isApproved) && (
                    <div className={CN('__checked-icon-wrapper', {
                      '-selected': isApproved
                    })}
                    >
                      <Icon
                        phosphorIcon={CheckCircle}
                        size='sm'
                        weight='fill'
                      />
                    </div>
                  )}
                </div>
                <div className='signatory-item-right'>
                  {isInitiator && <span className='initiator-tag'>{t('ui.HISTORY.screen.HistoryDetail.MultisigLayout.initiator')}</span>}
                  {!isInitiator && <span className={CN('signer-status', { approved: isApproved })}>
                    {(isApproved ? t('ui.HISTORY.screen.HistoryDetail.MultisigLayout.approved') : t('ui.HISTORY.screen.HistoryDetail.MultisigLayout.waitingForApproval'))}
                  </span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const HistoryMultisigLayout = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.signatories-label': {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      marginBottom: token.marginXS
    },
    '.signatories-label-left': {
      fontWeight: token.fontWeightStrong,
      color: token.colorTextLight2
    },

    '.signatories-label-right': {
      fontWeight: token.bodyFontWeight,
      color: token.colorTextDescription
    },

    '.meta-info-area': {
      marginBottom: token.margin
    },

    '.signatory-account-wrapper': {
      display: 'flex',
      gap: 8,
      overflow: 'hidden'
    },

    '.signatory-account-value': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },

    '.initiator-tag': {
      color: token.colorSuccess
    },
    '.signer-status': {
      fontSize: token.fontSizeSM,
      '&.approved': {
        color: token.colorSuccess
      },
      '&.waiting': {
        color: token.colorWarning
      }
    },
    '.ant-number': {
      fontSize: token.fontSize
    },
    '.signatory-item-container': {
      display: 'flex',
      flexDirection: 'column',
      background: token.colorBgSecondary,
      borderRadius: 8,
      padding: 12,
      gap: 16
    },
    '.signatory-item': {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    },

    '.signatory-item-left': {
      flex: 1,
      overflow: 'hidden',
      display: 'flex'
    },

    '.__checked-icon-wrapper': {
      display: 'flex',
      justifyContent: 'center',
      minWidth: 40,
      marginRight: -token.marginXS,
      color: token.colorTextLight4,

      '&.-selected': {
        color: token.colorSuccess
      }
    },

    '.signatory-item-right': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.fontWeightStrong,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      pointerEvents: 'none',
      minWidth: 60,

      '.initiator-tag': {
        fontSize: token.fontSizeSM,
        color: token.colorSuccess,
        fontWeight: token.fontWeightStrong,
        justifyContent: 'flex-end'
      },

      '.signer-status': {
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        color: token.colorWarning,
        '&.approved': {
          color: token.colorSuccess
        }
      }
    }
  };
});

export default HistoryMultisigLayout;
