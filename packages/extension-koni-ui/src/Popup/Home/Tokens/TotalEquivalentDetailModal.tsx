// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { BalanceType } from '@subwallet/extension-base/types';
import { NumberDisplay } from '@subwallet/extension-koni-ui/components';
import { useGetBalance } from '@subwallet/extension-koni-ui/hooks';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ActivityIndicator, SwModal } from '@subwallet/react-ui';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  id: string;
  onCancel: () => void;
  address?: string;
  chain?: string;
  tokenSlug?: string;
  isSubscribe?: boolean;
  extrinsicType?: ExtrinsicType;
  symbol: string;
  decimals?: number;
};

function Component ({ address, chain, className, decimals, extrinsicType, id, isSubscribe, onCancel, symbol, tokenSlug }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { error: errorFree, isLoading: isLoadingFree, nativeTokenBalance: transferableNative } = useGetBalance(chain, address, tokenSlug, isSubscribe, extrinsicType, BalanceType.TRANSFERABLE);
  const { error: errorTotal, isLoading: isLoadingTotal, nativeTokenBalance: totalStakedInNative } = useGetBalance(chain, address, tokenSlug, isSubscribe, extrinsicType, BalanceType.TOTAL_STAKE_EQUIVALENT);

  const isLoading = isLoadingFree || isLoadingTotal;
  const error = errorFree || errorTotal;

  const transferableValue = useMemo(() => {
    return transferableNative?.value || 0;
  }, [transferableNative]);

  const stakedValue = useMemo(() => {
    return totalStakedInNative?.value || 0;
  }, [totalStakedInNative]);

  const overviewItems = useMemo(() => ([
    {
      key: 'transferable',
      label: t('ui.BALANCE.screen.Tokens.TotalEquivalentDetailModal.transferable'),
      value: transferableValue
    },
    {
      key: 'staked',
      label: t('ui.BALANCE.screen.Tokens.TotalEquivalentDetailModal.staked'),
      value: stakedValue
    }
  ]), [t, transferableValue, stakedValue]);

  return (
    <SwModal
      id={id}
      onCancel={onCancel}
      title={t('ui.BALANCE.screen.Tokens.TotalEquivalentDetailModal.balanceDetails')}
    >
      <div className={className}>
        <div className='content-container'>
          <div className='__container'>
            {isLoading && (
              <div className='__loading'>
                <ActivityIndicator size={24} />
              </div>
            )}

            {!isLoading && error && (
              <div className='error-message'>{error}</div>
            )}

            {!isLoading && !error && overviewItems.map((item) => (
              <div
                className='__row'
                key={item.key}
              >
                <div className='__label'>{item.label}</div>

                <NumberDisplay
                  className='__value'
                  decimal={decimals || 18}
                  decimalOpacity={0.45}
                  intOpacity={0.85}
                  size={14}
                  suffix={symbol}
                  unitOpacity={0.85}
                  value={item.value}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SwModal>
  );
}

export const TotalEquivalentDetailModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.__container': {
      borderRadius: token.borderRadiusLG,
      backgroundColor: token.colorBgSecondary,
      padding: '12px',
      minHeight: 80
    },

    '.__loading': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 60
    },

    '.__row': {
      display: 'flex',
      justifyContent: 'space-between'
    },

    '.__row:not(:last-child)': {
      marginBottom: token.margin
    },

    '.__label': {
      paddingRight: token.paddingSM
    },

    '.__locked-others': {
      cursor: 'pointer'
    },

    '.error-message': {
      color: token.colorError
    },

    '.__locked-others-icon': {
      color: token.colorTextLight3,
      marginLeft: token.marginXXS
    },

    '.__balance': {
      display: 'flex',
      justifyContent: 'flex-end'
    }
  });
});
