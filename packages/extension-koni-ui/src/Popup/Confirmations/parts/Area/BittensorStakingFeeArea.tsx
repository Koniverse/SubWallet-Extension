// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType, RequestBondingSubmit, RequestUnbondingSubmit } from '@subwallet/extension-base/background/KoniTypes';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { SubmitBittensorChangeValidatorStaking } from '@subwallet/extension-base/types';
import { AlertBox } from '@subwallet/extension-koni-ui/components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends ThemeProps {
  transaction: SWTransactionResult;
}

interface StakingFeeNote {
  title: string;
  description: string;
}

/**
 * The fee a Bittensor stake, unstake or validator change takes from the stake. The confirmation shows it last, under
 * the signer a proxy or a multisig adds, not between the transaction's details and that signer.
 */
function Component ({ className, transaction }: Props) {
  const { t } = useTranslation();

  const note = useMemo((): StakingFeeNote | undefined => {
    switch (transaction.extrinsicType) {
      case ExtrinsicType.STAKING_BOND: {
        const fee = (transaction.data as RequestBondingSubmit).subnetData?.stakingFee;

        return fee
          ? {
            title: t('ui.TRANSACTION.Confirmations.Bond.taoStakingFee'),
            description: t('ui.TRANSACTION.Confirmations.Bond.taoStakingFeeDeductedInfo', { replace: { fee } })
          }
          : undefined;
      }

      case ExtrinsicType.STAKING_UNBOND: {
        const fee = (transaction.data as RequestUnbondingSubmit).stakingFee;

        return fee
          ? {
            title: t('ui.TRANSACTION.Confirmations.Unbond.taoUnstakingFee'),
            description: t('ui.TRANSACTION.Confirmations.Unbond.taoUnstakingFeeDeductedInfo', { replace: { fee } })
          }
          : undefined;
      }

      case ExtrinsicType.CHANGE_EARNING_VALIDATOR: {
        const fee = (transaction.data as SubmitBittensorChangeValidatorStaking).subnetData?.stakingFee;

        return fee
          ? {
            title: t('ui.TRANSACTION.Confirmations.Earning.Validator.Change.validatorChangeFee'),
            description: t('ui.TRANSACTION.Confirmations.Earning.Validator.Change.validatorChangeFeeInfo', { replace: { number: fee } })
          }
          : undefined;
      }

      default:
        return undefined;
    }
  }, [t, transaction.data, transaction.extrinsicType]);

  if (!note) {
    return null;
  }

  return (
    <AlertBox
      className={className}
      description={note.description}
      title={note.title}
      type='info'
    />
  );
}

const BittensorStakingFeeArea = Component;

export default BittensorStakingFeeArea;
