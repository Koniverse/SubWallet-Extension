// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { isAscii, u8aToString, u8aToU8a } from '@polkadot/util';

interface Props extends ThemeProps {
  data: string;
  context?: string;
  url: string;
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, context, data, url } = props;

  const { t } = useTranslation();

  // the origin is what binds the derived key: show the exact value the wallet signs over, not the
  // full url, so the user can tell `http://` and `https://` on the same host apart
  const origin = useMemo(() => {
    try {
      return new URL(url).origin;
    } catch {
      return url;
    }
  }, [url]);

  // the VRF payload is never `wrapBytes`-framed, so it is decoded as-is
  const message = useMemo(() => isAscii(data) ? u8aToString(u8aToU8a(data)) : data, [data]);

  return (
    <MetaInfo className={CN(className)}>
      <MetaInfo.Data label={t('ui.DAPP.Confirmations.Detail.Substrate.Vrf.boundTo')}>
        {origin}
      </MetaInfo.Data>
      <MetaInfo.Data label={t('ui.DAPP.Confirmations.Detail.Substrate.Message.rawData')}>
        {data}
      </MetaInfo.Data>
      <MetaInfo.Data label={t('ui.DAPP.Confirmations.Detail.Substrate.Message.message')}>
        {message}
      </MetaInfo.Data>
      {!!context && (
        <MetaInfo.Data label={t('ui.DAPP.Confirmations.Detail.Substrate.Vrf.context')}>
          {context}
        </MetaInfo.Data>
      )}
    </MetaInfo>
  );
};

const VrfDetail = styled(Component)<Props>(() => {
  return {};
});

export default VrfDetail;
