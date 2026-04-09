// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubmitJoinNominationPool, SummaryEarningProcessData } from '@subwallet/extension-base/types';
import CommonTransactionInfo from '@subwallet/extension-web-ui/components/Confirmation/CommonTransactionInfo';
import MetaInfo from '@subwallet/extension-web-ui/components/MetaInfo/MetaInfo';
import { useGetTransactionProcessSteps } from '@subwallet/extension-web-ui/hooks';
import useGetNativeTokenBasicInfo from '@subwallet/extension-web-ui/hooks/common/useGetNativeTokenBasicInfo';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseProcessConfirmationProps } from '../Base';

type Props = BaseProcessConfirmationProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className, process } = props;
  const combinedInfo = useMemo(() => process.combineInfo as SummaryEarningProcessData, [process.combineInfo]);
  const chain = useMemo(() => combinedInfo.brief.chain, [combinedInfo.brief.chain]);
  const data = useMemo(() => combinedInfo.data as unknown as SubmitJoinNominationPool, [combinedInfo]);

  const { t } = useTranslation();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);

  const getTransactionProcessSteps = useGetTransactionProcessSteps();

  const stepItems = useMemo(() => {
    return getTransactionProcessSteps(process.steps, process.combineInfo, false);
  }, [getTransactionProcessSteps, process.combineInfo, process.steps]);

  return (
    <div className={CN(className)}>
      <CommonTransactionInfo
        address={data.address}
        network={chain}
      />
      <MetaInfo
        className={'meta-info'}
        hasBackgroundWrapper
      >
        <MetaInfo.Account
          address={data.selectedPool.address}
          label={t('ui.JOIN_POOL.Popup.Confirmations.variants.Process.Earn.JoinPool.pool')}
          networkPrefix={42}
        />

        {/* <MetaInfo.AccountGroup */}
        {/*  accounts={data.address} */}
        {/*  content={t('ui.TRANSACTION.Confirmations.Process.Earn.Bond.numberSelectedValidator', { replace: { number: data.selectedValidators.length, validatorLabel: 'validators' } })} */}
        {/*  label={t('ui.TRANSACTION.screen.Transaction.Earn.pool')} */}
        {/* /> */}

        <MetaInfo.Number
          decimals={decimals}
          label={t('ui.JOIN_POOL.Popup.Confirmations.variants.Process.Earn.JoinPool.amount')}
          suffix={symbol}
          value={data.amount}
        />

        {
          /**
           * TODO: Convert value from steps' fee
           * */
        }
        <MetaInfo.Number
          decimals={decimals}
          label={t('ui.JOIN_POOL.Popup.Confirmations.variants.Process.Earn.JoinPool.estimatedFee')}
          suffix={symbol}
          value={0}
        />

        <MetaInfo.TransactionProcess
          items={stepItems}
          type={process.type}
        />
      </MetaInfo>
    </div>
  );
};

const NominationPoolProcessConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {};
});

export default NominationPoolProcessConfirmation;
