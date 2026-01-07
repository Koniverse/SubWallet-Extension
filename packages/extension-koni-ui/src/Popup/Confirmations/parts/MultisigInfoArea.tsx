// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { useGetNativeTokenBasicInfo } from '@subwallet/extension-koni-ui/hooks/';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  signatoryAddress?: string;
  multisigDeposit: string;
  chain: string;
}

function Component ({ chain, className, multisigDeposit, signatoryAddress }: Props) {
  const { t } = useTranslation();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);

  if (!signatoryAddress) {
    return <></>;
  }

  return (
    <>
      <MetaInfo.Account
        address={signatoryAddress}
        chainSlug={chain}
        className={CN(className, 'signatory-address-info')}
        label={t('ui.Confirmations.SubmitApiArea.signatory')}
      />

      <MetaInfo.Number
        className={CN(className, 'multisig-deposit-info')}
        decimals={decimals}
        label={t('ui.Confirmations.SubmitApiArea.multisigDeposit')}
        suffix={symbol}
        value={multisigDeposit}
      />
    </>
  );
}

const MultisigInfoArea = styled(Component)<Props>(({ theme }: ThemeProps) => {
  return {};
});

export default MultisigInfoArea;
