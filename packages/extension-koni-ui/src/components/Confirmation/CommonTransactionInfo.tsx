// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { reformatAddress } from '@subwallet/extension-base/utils';
import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { useCoreCreateReformatAddress, useGetAccountByAddress, useGetChainPrefixBySlug, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps{
  address: string;
  network: string;
  onlyReturnInnerContent?: boolean;
}

const Component: React.FC<Props> = (props: Props) => {
  const { address, className, network, onlyReturnInnerContent } = props;

  const { t } = useTranslation();
  const account = useGetAccountByAddress(address);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const getReformatAddress = useCoreCreateReformatAddress();

  const networkPrefix = useGetChainPrefixBySlug(network);
  const displayAddress = account ? getReformatAddress(account, chainInfoMap[network]) : address;

  const innerContent = (
    <>
      <MetaInfo.Account
        address={displayAddress || address}
        chainSlug={network}
        label={t('ui.components.Confirmation.CommonTransactionInfo.account')}
        name={account?.name}
        networkPrefix={networkPrefix}
      />
      <MetaInfo.Chain
        chain={network}
        label={t('ui.components.Confirmation.CommonTransactionInfo.network')}
      />
    </>
  );

  if (onlyReturnInnerContent) {
    return innerContent;
  }

  return (
    <MetaInfo
      className={CN(className)}
      hasBackgroundWrapper={true}
    >
      {innerContent}
    </MetaInfo>
  );
};

const CommonTransactionInfo = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.address-field': {
      whiteSpace: 'nowrap'
    }
  };
});

export default CommonTransactionInfo;
