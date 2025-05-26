// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubmitJoinNativeStaking } from '@subwallet/extension-base/types';
import CommonTransactionInfo from '@subwallet/extension-koni-ui/components/Confirmation/CommonTransactionInfo';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { EARNING_SELECTED_VALIDATOR_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useSelector, useYieldPositionDetail } from '@subwallet/extension-koni-ui/hooks';
import useGetNativeTokenBasicInfo from '@subwallet/extension-koni-ui/hooks/common/useGetNativeTokenBasicInfo';
import { NominationInfoPart } from '@subwallet/extension-koni-ui/Popup/Home/Earning/EarningPositionDetail/AccountAndNominationInfoPart/NominationInfoPart';
import CN from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const isSingular = (count: number, singular: string, plural: string) => {
  return count === 1 ? singular : plural;
};

const Component: React.FC<Props> = (props: Props) => {
  const { className, transaction } = props;
  const data = transaction.data as SubmitJoinNativeStaking;
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

  return (
    <div>
      <div className={CN(className)}>
        <CommonTransactionInfo
          address={transaction.address}
          network={transaction.chain}
        />

        <MetaInfo
          className={'meta-info'}
          hasBackgroundWrapper
        >
          <MetaInfo.Number
            decimals={decimals}
            label={t('Estimated fee')}
            suffix={symbol}
            value={transaction.estimateFee?.value || 0}
          />
        </MetaInfo>

        {compound && (
          <MetaInfo
            className={'nomination-wrapper'}
          >
            <NominationInfoPart
              addresses={newValidatorAddresses}
              className='nomination-info-part'
              compound={compound}
              disabledButton={true}
              maxValidator={poolInfo.statistic?.maxCandidatePerFarmer}
              modalId={`${EARNING_SELECTED_VALIDATOR_MODAL}-total`}
              poolInfo={poolInfo}
              title={isSingular(deselectedCount, 'Total validator selected', 'Total validators selected')}
              totalValidator={totalSelectedCount}
            />

            {deselectedCount > 0 && (
              <NominationInfoPart
                addresses={deselectedAddresses}
                className='nomination-info-part'
                compound={compound}
                disabledButton={true}
                modalId={`${EARNING_SELECTED_VALIDATOR_MODAL}-deselected`}
                poolInfo={poolInfo}
                title={isSingular(deselectedCount, 'Validator deselected', 'Validators deselected')}
                totalValidator={deselectedCount}
              />
            )}

            {newlySelectedCount > 0 && (
              <NominationInfoPart
                addresses={newlySelectedAddresses}
                className='nomination-info-part'
                compound={compound}
                disabledButton={true}
                modalId={`${EARNING_SELECTED_VALIDATOR_MODAL}-newly`}
                poolInfo={poolInfo}
                title={isSingular(newlySelectedCount, 'Validator newly selected', 'Validators newly selected')}
                totalValidator={newlySelectedCount}
              />
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
    }
  };
});

export default ChangeValidatorTransactionConfirmation;
