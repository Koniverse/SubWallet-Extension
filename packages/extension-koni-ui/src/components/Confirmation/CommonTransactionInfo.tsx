// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { useGetAccountByAddress, useGetChainPrefixBySlug } from '@subwallet/extension-koni-ui/hooks';
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
  const networkPrefix = useGetChainPrefixBySlug(network);

  const innerContent = (
    <>
      <MetaInfo.Account
        address={account?.address || address}
        label={t('common.Account.label')}
        chainSlug={network}
        name={account?.name}
        networkPrefix={networkPrefix}
      />
      <MetaInfo.Chain
        chain={network}
        label={t('Network')}
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
