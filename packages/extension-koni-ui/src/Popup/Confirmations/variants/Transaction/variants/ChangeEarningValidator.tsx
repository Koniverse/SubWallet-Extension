// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubmitBittensorChangeValidatorStaking, YieldPoolInfo, YieldPositionInfo } from '@subwallet/extension-base/types';
import { AlertBox } from '@subwallet/extension-koni-ui/components';
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

const truncateAddress = (addr?: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-10)}` : '-';

type ValidatorGroupProps = {
  addresses: string[];
  compound: YieldPositionInfo;
  poolInfo: YieldPoolInfo;
  modalId: string;
  title: string;
  total: number;
  label?: string;
  className?: string;
  maxValidator?: number
};

type ValidatorAddressProps = Pick<ValidatorGroupProps, 'addresses' | 'className' | 'label' | 'title'>;

const ValidatorAddress = ({ addresses, className, label, title }: ValidatorAddressProps) => (
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
    activeModal(modalId);
  }, [activeModal, modalId]);

  const totalValidatorSelected = maxValidator
    ? `${total} (max ${maxValidator}) `
    : `${total} `;

  return (
    <>
      <MetaInfo.Default
        className={CN(className, 'meta-info_validator-group')}
        label={t(title)}
      >
        <div
          className='validator-group__info'
          onClick={onClick}
        >
          {totalValidatorSelected}
          <Icon
            className='validator-group__icon'
            phosphorIcon={Info}
            size='sm'
          />
        </div>
      </MetaInfo.Default>

      <EarningValidatorSelectedModal
        addresses={addresses}
        chain={poolInfo.chain}
        compound={compound}
        disabled={false}
        displayType={'validator'}
        from={compound.address}
        modalId={modalId}
        nominations={compound.nominations}
        readOnly={true}
        slug={poolInfo.slug}
        title={title}
      />
    </>
  );
};

// const ValidatorGroup = (props: ValidatorGroupProps) => {
//   const { total } = props;

//   if (total === 0) {
//     return null;
//   }

//   if (total === 1) {
//     return <ValidatorAddress {...props} />;
//   }

//   return <ValidatorGroupModal {...props} />;
// };

const Component: React.FC<Props> = (props: Props) => {
  const { className, transaction } = props;
  const data = transaction.data as SubmitBittensorChangeValidatorStaking;
  const slug = data.slug;

  const { compound } = useYieldPositionDetail(slug, data.address);
  const { poolInfoMap } = useSelector((state) => state.earning);
  const poolInfo = poolInfoMap[slug];

  const { t } = useTranslation();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  const { deselectedAddresses, newValidatorAddresses, totalSelectedCount } = useMemo(() => {
    const oldValidatorAddresses = compound?.nominations?.map((item) => item.validatorAddress) || [];
    const newValidatorAddresses = data.selectedValidators.map((v) => v.address);

    const totalSelectedCount = newValidatorAddresses.length;

    const deselectedAddresses = oldValidatorAddresses.filter((addr) => !newValidatorAddresses.includes(addr));
    // const newlySelectedAddresses = newValidatorAddresses.filter((addr) => !oldValidatorAddresses.includes(addr));

    return {
      totalSelectedCount,
      // deselectedCount: deselectedAddresses.length,
      // newlySelectedCount: newlySelectedAddresses.length,
      deselectedAddresses,
      // newlySelectedAddresses,
      newValidatorAddresses
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
              label={t('ui.TRANSACTION.Confirmations.Earning.Validator.Change.amount')}
              suffix={data.metadata?.subnetSymbol || symbol}
              value={data.amount}
            />
          )}
          <MetaInfo.Number
            decimals={decimals}
            label={t('ui.TRANSACTION.Confirmations.Earning.Validator.Change.estimatedFee')}
            suffix={symbol}
            value={transaction.estimateFee?.value || 0}
          />
          {(compound && !isBittensorChain) && (
            <ValidatorGroupModal
              addresses={newValidatorAddresses}
              compound={compound}
              maxValidator={poolInfo.statistic?.maxCandidatePerFarmer}
              modalId={`${EARNING_SELECTED_VALIDATOR_MODAL}-total`}
              poolInfo={poolInfo}
              title={'Total validators selected'}
              total={totalSelectedCount}
            />
          )}
        </MetaInfo>
      </MetaInfo>

      {isBittensorChain && (
        <>
          <MetaInfo
            className='nomination-wrapper'
            hasBackgroundWrapper
          >
            <ValidatorAddress
              addresses={deselectedAddresses}
              className='deselected'
              label='From validator'
              title='Deselected validators'
            />

            <ValidatorAddress
              addresses={newValidatorAddresses}
              className='newly-selected'
              label='To validator'
              title='Newly selected validators'
            />
          </MetaInfo>
          <AlertBox
            className={'alert-box'}
            description={t('ui.TRANSACTION.Confirmations.Earning.Validator.Change.validatorChangeFeeInfo', {replace: {number: 0.00005}})}
            title={t('ui.TRANSACTION.Confirmations.Earning.Validator.Change.validatorChangeFee')}
            type='info'
          />
        </>
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
      marginBottom: token.marginSM,
      whiteSpace: 'nowrap'
    },

    '.form-space-sm .ant-form-item': {
      marginBottom: '0px'
    },

    '.validator-group__info': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXXS,
      cursor: 'pointer'
    }
  };
});

export default ChangeValidatorTransactionConfirmation;
