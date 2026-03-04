// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { HistoryStatusMap, TxTypeNameMap } from '@subwallet/extension-koni-ui/constants';
import { useNotification, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { CallDataLayout } from '@subwallet/extension-koni-ui/Popup/Home/History/Detail/parts/CallDataLayout';
import SwapLayout from '@subwallet/extension-koni-ui/Popup/Home/History/Detail/parts/SwapLayout';
import { ThemeProps, TransactionHistoryDisplayItem } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard, formatHistoryDate, isAbleToShowFee, toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { Copy } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { hexAddPrefix, isHex } from '@polkadot/util';

import HistoryDetailAmount from './Amount';
import HistoryDetailFee from './Fee';
import { GovVoteLayout } from './GovVoteLayout';
import HistoryDetailHeader from './Header';

interface Props extends ThemeProps {
  data: TransactionHistoryDisplayItem;
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, data } = props;

  const { t } = useTranslation();

  const { language } = useSelector((state) => state.settings);
  const notify = useNotification();

  const extrinsicHash = useMemo(() => {
    const hash = data.extrinsicHash || '';

    return isHex(hexAddPrefix(hash)) ? toShort(data.extrinsicHash, 6, 6) : '...';
  }, [data.extrinsicHash]);

  const onCopyAddress = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    copyToClipboard(extrinsicHash);
    notify({
      message: t('ui.ACCOUNT.components.SubstrateProxyAccount.SelectorItem.copiedToClipboard')
    });
  }, [extrinsicHash, notify, t]);

  if (data.type === ExtrinsicType.SWAP) {
    return (
      <SwapLayout data={data} />
    );
  }

  return (
    <MetaInfo className={CN(className)}>
      <MetaInfo.DisplayType
        label={t('ui.HISTORY.screen.HistoryDetail.Layout.transactionType')}
        typeName={t(TxTypeNameMap[data.type])}
      />
      <HistoryDetailHeader data={data} />
      <MetaInfo.Status
        label={t('ui.HISTORY.screen.HistoryDetail.Layout.transactionStatus')}
        statusIcon={HistoryStatusMap[data.status].icon}
        statusName={t(HistoryStatusMap[data.status].name)}
        valueColorSchema={HistoryStatusMap[data.status].schema}
      />
      <MetaInfo.Default
        className={'extrinsic-hash-wrapper'}
        label={t('ui.HISTORY.screen.HistoryDetail.Layout.extrinsicHash')}
      >
        {extrinsicHash}
        {extrinsicHash !== '...' && <Button
          className={'extrinsic-hash-copy-button'}
          icon={<Icon
            className={'extrinsic-hash-copy-icon'}
            customSize={'18px'}
            phosphorIcon={Copy}
          />}
          onClick={onCopyAddress}
          size={'sm'}
          type={'ghost'}
        />}
      </MetaInfo.Default>
      <CallDataLayout data={data} />
      {!!data.time && (<MetaInfo.Default label={t('ui.HISTORY.screen.HistoryDetail.Layout.submittedTime')}>{formatHistoryDate(data.time, language, 'detail')}</MetaInfo.Default>)}
      {!!data.blockTime && (<MetaInfo.Default label={t('ui.HISTORY.screen.HistoryDetail.Layout.blockTime')}>{formatHistoryDate(data.blockTime, language, 'detail')}</MetaInfo.Default>)}

      <GovVoteLayout data={data} />
      <HistoryDetailAmount data={data} />

      {
        isAbleToShowFee(data) && (<HistoryDetailFee data={data} />)
      }
    </MetaInfo>
  );
};

const HistoryDetailLayout = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.extrinsic-hash-copy-button': {
      height: '18px !important',
      width: '18px !important',
      minWidth: 'unset !important',
      color: token.colorTextLight4,
      transform: 'all 0.3s ease-in-out',
      '.call-data-info-icon, .extrinsic-hash-copy-icon': {
        height: '18px !important'
      },

      '&:hover': {
        color: token.colorTextLight2
      }
    },

    '.extrinsic-hash-wrapper': {
      '.__value': {
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }
  };
});

export default HistoryDetailLayout;
