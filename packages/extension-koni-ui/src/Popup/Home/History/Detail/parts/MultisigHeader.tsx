// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {_getChainName} from '@subwallet/extension-base/services/chain-service/utils';
import {MetaInfo} from '@subwallet/extension-koni-ui/components';
import {RootState} from '@subwallet/extension-koni-ui/stores';
import {ThemeProps} from '@subwallet/extension-koni-ui/types';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import styled from 'styled-components';
import {PendingMultisigTx} from "@subwallet/extension-base/services/multisig-service";
import {useGetAccountByAddress} from "@subwallet/extension-koni-ui/hooks";

interface Props extends ThemeProps {
  data: PendingMultisigTx;
}

const Component: React.FC<Props> = (props: Props) => {
  const { data } = props;

  const { t } = useTranslation();
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const senderAccount = useGetAccountByAddress(data.multisigAddress);

  const recipientAddress = useMemo(() => {
    const args = data?.decodedCallData?.args;

    if (args && typeof args === 'object' && !Array.isArray(args)) {
      const argsRecord = args as Record<string, any>;

      const dest = argsRecord.dest;

      if (dest && typeof dest === 'object' && dest.Id) {
        return String(dest.Id);
      }

      return String(dest || '');
    }

    return '';
  }, [data?.decodedCallData]);

  const recipientAccount = useGetAccountByAddress(recipientAddress);

  return (
    <>
      {data.chain && <MetaInfo.Chain
        chain={data.chain}
        label={t('ui.HISTORY.screen.HistoryDetail.Header.network')}
      />}

      <MetaInfo.Transfer
        destinationChain={{
          slug: data.chain,
          name: _getChainName(chainInfoMap[data.chain])
        }}
        originChain={{
          slug: data.chain,
          name: _getChainName(chainInfoMap[data.chain])
        }}
        recipientAddress={recipientAccount?.address || recipientAddress}
        recipientName={recipientAccount?.name}
        senderAddress={data.depositor}
        senderName={senderAccount?.name}
      />

    </>
  );
};

const HistoryMultisigHeader = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});

export default HistoryMultisigHeader;
