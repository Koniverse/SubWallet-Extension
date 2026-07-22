// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  bytes: string;
}

const Component: React.FC<Props> = (props: Props) => {
  const { bytes, className } = props;

  const { t } = useTranslation();

  const message = useMemo(
    () => {
      const buffer = Buffer.from(bytes, 'hex');

      return buffer.toString('ascii');
    },
    [bytes]
  );

  return (
    <MetaInfo className={CN(className)}>
      <MetaInfo.Data label={t('ui.DAPP.Confirmations.Detail.Cardano.Message.message')}>
        {message}
      </MetaInfo.Data>
    </MetaInfo>
  );
};

const CardanoMessageDetail = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {};
});

export default CardanoMessageDetail;
