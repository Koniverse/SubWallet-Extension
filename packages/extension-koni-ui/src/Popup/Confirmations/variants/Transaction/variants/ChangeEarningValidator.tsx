// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubmitBittensorChangeValidatorStaking } from '@subwallet/extension-base/types';
import CommonTransactionInfo from '@subwallet/extension-koni-ui/components/Confirmation/CommonTransactionInfo';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { EARNING_SELECTED_VALIDATOR_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useSelector, useYieldPositionDetail } from '@subwallet/extension-koni-ui/hooks';
import useGetNativeTokenBasicInfo from '@subwallet/extension-koni-ui/hooks/common/useGetNativeTokenBasicInfo';
import { SelectedValidatorInfoPart } from '@subwallet/extension-koni-ui/Popup/Home/Earning/EarningPositionDetail/AccountAndNominationInfoPart/SelectedValidatorInfoPart';
import BigN from 'bignumber.js';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-10)}`;

const Component: React.FC<Props> = (props: Props) => {
  const { className, transaction } = props;
  const data = transaction.data as SubmitBittensorChangeValidatorStaking;
  const slug = data.slug;

  const { compound } = useYieldPositionDetail(slug, data.address);
  const { poolInfoMap } = useSelector((state) => state.earning);
  const poolInfo = poolInfoMap[slug];

  const { t } = useTranslation();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  const oldValidatorAddresses = compound?.nominations?.map((item) => item.validatorAddress) || [];
  const newValidatorAddresses = data.selectedValidators.map((v) => v.address);

  const totalSelectedCount = data.selectedValidators.length;
  const deselectedCount = oldValidatorAddresses.filter((addr) => !newValidatorAddresses.includes(addr)).length;
  const newlySelectedCount = newValidatorAddresses.filter((addr) => !oldValidatorAddresses.includes(addr)).length;

  const deselectedAddresses = oldValidatorAddresses.filter((addr) => !newValidatorAddresses.includes(addr));
  const newlySelectedAddresses = newValidatorAddresses.filter((addr) => !oldValidatorAddresses.includes(addr));

  const isBittensorChain = useMemo(() => {
    return transaction.chain === 'bittensor' || transaction.chain === 'bittensor_testnet';
  }, [transaction.chain]);

  const isShowAmount = useMemo(() => {
    return new BigN(data.amount).gt(0);
  }, [data.amount]);

  return (
    <div>
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
          {(compound && !isBittensorChain) && (<SelectedValidatorInfoPart
            addresses={newValidatorAddresses}
            className='nomination-info-part'
            compound={compound}
            disabledButton={true}
            maxValidator={poolInfo.statistic?.maxCandidatePerFarmer}
            modalId={`${EARNING_SELECTED_VALIDATOR_MODAL}-total`}
            poolInfo={poolInfo}
            title={'Total validators selected'}
            totalValidator={totalSelectedCount}
          />)}
        </MetaInfo>

        {compound && (
          <MetaInfo
            className={'nomination-wrapper'}
          >
            {(deselectedCount > 0 || data.originValidator) && (
              data.originValidator
                ? (
                  <MetaInfo.Default
                    className='__validator-address deselected'
                    label='From validator'
                  >
                    {truncateAddress(data.originValidator)}
                  </MetaInfo.Default>
                )
                : deselectedCount === 1
                  ? (
                    <MetaInfo.Default
                      className='__validator-address deselected'
                      label='From validator'
                    >
                      {truncateAddress(deselectedAddresses[0])}
                    </MetaInfo.Default>
                  )
                  : (
                    <SelectedValidatorInfoPart
                      addresses={deselectedAddresses}
                      className='nomination-info-part'
                      compound={compound}
                      disabledButton={true}
                      modalId={`${EARNING_SELECTED_VALIDATOR_MODAL}-deselected`}
                      poolInfo={poolInfo}
                      title={'Validators deselected'}
                      totalValidator={deselectedCount}
                    />
                  )
            )}

            {newlySelectedCount > 0 && (
              newlySelectedCount === 1
                ? (
                  <MetaInfo.Default
                    className='__validator-address newly-selected'
                    label='To validator'
                  >
                    {truncateAddress(newlySelectedAddresses[0])}
                  </MetaInfo.Default>
                )
                : (
                  <SelectedValidatorInfoPart
                    addresses={newlySelectedAddresses}
                    className='nomination-info-part'
                    compound={compound}
                    disabledButton={true}
                    modalId={`${EARNING_SELECTED_VALIDATOR_MODAL}-newly`}
                    poolInfo={poolInfo}
                    title={'Newly selected validators'}
                    totalValidator={newlySelectedCount}
                  />
                )
            )}
          </MetaInfo>
        )}
      </div>
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
    }
  };
});

export default ChangeValidatorTransactionConfirmation;
