// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubmitBittensorChangeValidatorStaking, YieldPoolInfo, YieldPositionInfo } from '@subwallet/extension-base/types';
import CommonTransactionInfo from '@subwallet/extension-koni-ui/components/Confirmation/CommonTransactionInfo';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import EarningValidatorSelectedModal from '@subwallet/extension-koni-ui/components/Modal/Earning/EarningValidatorSelectedModal';
import { EARNING_SELECTED_VALIDATOR_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useSelector, useYieldPositionDetail } from '@subwallet/extension-koni-ui/hooks';
import useGetNativeTokenBasicInfo from '@subwallet/extension-koni-ui/hooks/common/useGetNativeTokenBasicInfo';
import { Icon, ModalContext } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { Info } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-10)}`;

type ValidatorGroupProps = {
  addresses: string[];
  compound: YieldPositionInfo;
  poolInfo: YieldPoolInfo;
  modalId: string;
  title: string;
  total: number;
  label?: string;
  className?: string;
  isBittensorChain?: boolean
  maxValidator?: number
};

const ValidatorAddress = ({ addresses, className, label, title }: ValidatorGroupProps) => (
  <MetaInfo.Default
    className={CN('__validator-address', className)}
    label={label || title}
  >
    {truncateAddress(addresses[0])}
  </MetaInfo.Default>
);

const ValidatorGroupModal = ({ addresses, className, compound, maxValidator, modalId, poolInfo, title, total }: ValidatorGroupProps) => {
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);

  const onClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    activeModal(modalId || EARNING_SELECTED_VALIDATOR_MODAL);
  }, [activeModal, modalId]);

  const totalValidatorSelected = maxValidator
    ? `${total} (max ${maxValidator}) `
    : `${total} `;

  return (
    <>
      <div className={CN(className)}>
        <div
          className='__panel-header'
          onClick={onClick}
        >
          <div className='__panel-title'>{t(title)}</div>
          <div className='__panel-icon'>
            <div className='__panel-total-validator'>{totalValidatorSelected}</div>
            <Icon
              phosphorIcon={Info}
              size='sm'
            />
          </div>
        </div>
      </div>

      <EarningValidatorSelectedModal
        addresses={addresses}
        chain={poolInfo.chain}
        compound={compound}
        disabled={false}
        from={compound.address}
        modalId={modalId || EARNING_SELECTED_VALIDATOR_MODAL}
        nominations={compound.nominations}
        readOnly={true}
        slug={poolInfo.slug}
        title={title}
      />
    </>
  );
};

const ValidatorGroup = (props: ValidatorGroupProps) => {
  const { isBittensorChain, total } = props;

  if (total === 0) {
    return null;
  }

  if (total === 1 || isBittensorChain) {
    return <ValidatorAddress {...props} />;
  }

  return <ValidatorGroupModal {...props} />;
};

const Component: React.FC<Props> = (props: Props) => {
  const { className, transaction } = props;
  const data = transaction.data as SubmitBittensorChangeValidatorStaking;
  const slug = data.slug;

  const { compound } = useYieldPositionDetail(slug, data.address);
  const { poolInfoMap } = useSelector((state) => state.earning);
  const poolInfo = poolInfoMap[slug];

  const { t } = useTranslation();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  const { deselectedAddresses, deselectedCount, newlySelectedAddresses, newlySelectedCount, totalSelectedCount } = useMemo(() => {
    const oldValidatorAddresses = compound?.nominations?.map((item) => item.validatorAddress) || [];
    const newValidatorAddresses = data.selectedValidators.map((v) => v.address);

    const totalSelectedCount = newValidatorAddresses.length;

    const deselectedAddresses = oldValidatorAddresses.filter((addr) => !newValidatorAddresses.includes(addr));
    const newlySelectedAddresses = newValidatorAddresses.filter((addr) => !oldValidatorAddresses.includes(addr));

    return {
      totalSelectedCount,
      deselectedCount: deselectedAddresses.length,
      newlySelectedCount: newlySelectedAddresses.length,
      deselectedAddresses,
      newlySelectedAddresses
    };
  }, [compound?.nominations, data.selectedValidators]);

  const isBittensorChain = useMemo(() => {
    return transaction.chain === 'bittensor' || transaction.chain === 'bittensor_testnet';
  }, [transaction.chain]);

  const isShowAmount = useMemo(() => {
    return new BigN(data.amount).gt(0);
  }, [data.amount]);

  return (
    <div className={CN(className)}>
      <CommonTransactionInfo
        address={transaction.address}
        network={transaction.chain}
      />

      <MetaInfo
        className={'nomination-wrapper'}
      >
        <MetaInfo
          className={'meta-info'}
          hasBackgroundWrapper
        >
          {isShowAmount && (
            <MetaInfo.Number
              decimals={decimals}
              label={t('Amount')}
              suffix={data.metadata?.subnetSymbol || symbol}
              value={data.amount}
            />
          )}
          <MetaInfo.Number
            decimals={decimals}
            label={t('Estimated fee')}
            suffix={symbol}
            value={transaction.estimateFee?.value || 0}
          />
        </MetaInfo>
        {(compound && !isBittensorChain) && (
          <ValidatorGroup
            addresses={newlySelectedAddresses}
            compound={compound}
            maxValidator={poolInfo.statistic?.maxCandidatePerFarmer}
            modalId={`${EARNING_SELECTED_VALIDATOR_MODAL}-total`}
            poolInfo={poolInfo}
            title={'Total validators selected'}
            total={totalSelectedCount}
          />
        )}
      </MetaInfo>

      {compound && (
        <MetaInfo className='nomination-wrapper'>
          <ValidatorGroup
            addresses={deselectedAddresses}
            className='deselected'
            compound={compound}
            isBittensorChain={isBittensorChain}
            label='From validator'
            modalId={`${EARNING_SELECTED_VALIDATOR_MODAL}-deselected`}
            poolInfo={poolInfo}
            title='Deselected validators'
            total={deselectedCount}
          />

          <ValidatorGroup
            addresses={newlySelectedAddresses}
            className='newly-selected'
            compound={compound}
            label='To validator'
            modalId={`${EARNING_SELECTED_VALIDATOR_MODAL}-newly`}
            poolInfo={poolInfo}
            title='Newly selected validators'
            total={newlySelectedCount}
          />
        </MetaInfo>
      )}
    </div>
  );
};

const ChangeValidatorTransactionConfirmation = styled(Component)<BaseTransactionConfirmationProps>(({ theme: { token } }: BaseTransactionConfirmationProps) => {
  return {
    '.nomination-wrapper': {
      background: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      marginTop: token.marginSM,
      whiteSpace: 'nowrap'
    },
    '.form-space-sm .ant-form-item': {
      marginBottom: '0px'
    },

    '.__validator-address': {
      paddingLeft: '12px',
      paddingRight: '12px'
    },

    '.__validator-address.deselected': {
      paddingTop: '12px'
    },

    '.__validator-address.newly-selected': {
      paddingBottom: '12px'
    },

    '.__nomination-item': {
      gap: token.sizeSM,

      '.__label': {
        'white-space': 'nowrap',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: token.sizeXS,
        overflow: 'hidden'
      },

      '.__value-col': {
        flex: '0 1 auto'
      }
    },

    '.__nomination-item.-hide-number': {
      '.__value-col': {
        display: 'none'
      }
    },

    '.__nomination-name': {
      textOverflow: 'ellipsis',
      overflow: 'hidden'
    },

    '.__panel-header': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: token.sizeXS,
      padding: `${token.paddingXS}px ${token.padding}px`,
      height: 46
    },

    '&.nomination-info-part .__panel-header': {
      padding: `${token.paddingXS}px ${token.paddingSM}px`,
      height: 46
    },

    '.__panel-title': {
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight2,
      textAlign: 'start'
    },

    '.__panel-icon': {
      cursor: 'pointer',
      minWidth: 40,
      height: 40,
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      color: token.colorTextLight3
    },

    '.__panel-total-validator': {
      marginRight: token.sizeXXS
    }
  };
});

export default ChangeValidatorTransactionConfirmation;
