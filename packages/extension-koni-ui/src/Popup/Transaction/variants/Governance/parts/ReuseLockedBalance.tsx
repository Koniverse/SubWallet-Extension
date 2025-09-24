// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { NumberDisplay } from '@subwallet/extension-koni-ui/components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { SwNumberProps } from '@subwallet/react-ui/es/number';
import CN from 'classnames';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollContainer } from 'react-indiana-drag-scroll';
import styled from 'styled-components';

type WrapperProps = ThemeProps;

type ComponentProps = {
  className?: string;
  assetInfo?: _ChainAsset;
  govLockedValue?: SwNumberProps['value'];
  allLockedValue?: SwNumberProps['value'];
  onReuseGovLockedValue?: (value: SwNumberProps['value']) => void;
  onReuseAllLockedValue?: (value: SwNumberProps['value']) => void;
};

const Component = ({ allLockedValue = 0, assetInfo, className, govLockedValue = 0, onReuseAllLockedValue, onReuseGovLockedValue }: ComponentProps): React.ReactElement<ComponentProps> => {
  const { t } = useTranslation();

  const reuseGovLockedValue = useCallback(() => {
    onReuseGovLockedValue?.(govLockedValue);
  }, [govLockedValue, onReuseGovLockedValue]);

  const reuseAllLockedValue = useCallback(() => {
    !!allLockedValue && onReuseAllLockedValue && onReuseAllLockedValue?.(allLockedValue);
  }, [allLockedValue, onReuseAllLockedValue]);

  return (
    <div className={CN(className)}>
      <ScrollContainer>
        <button
          className={'__action-button __gov-locked-value-button'}
          onClick={reuseGovLockedValue}
        >
          <span className='__action-button-label'>
            {t('Reuse governance lock')}:
          </span>

          <NumberDisplay
            className={'__action-button-balance-value'}
            decimal={_getAssetDecimals(assetInfo)}
            suffix={_getAssetSymbol(assetInfo)}
            value={govLockedValue}
          />
        </button>

        {
          <button
            className={'__action-button __all-locked-value-button'}
            onClick={reuseAllLockedValue}
          >
            <span className='__action-button-label'>
              {t('Reuse all locks')}:
            </span>

            <NumberDisplay
              className={'__action-button-balance-value'}
              decimal={_getAssetDecimals(assetInfo)}
              suffix={_getAssetSymbol(assetInfo)}
              value={allLockedValue}
            />
          </button>
        }
      </ScrollContainer>
    </div>
  );
};

export const ReuseLockedBalance = styled(Component)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return {
    '.ant-number': {
      '&, .ant-typography': {
        display: 'inline',
        fontSize: 'inherit !important',
        fontWeight: 'inherit !important',
        lineHeight: 'inherit'
      },

      '.ant-typography': {
        color: 'inherit !important'
      }
    },

    '.indiana-scroll-container': {
      overflow: 'auto',
      whiteSpace: 'nowrap'
    },

    '.__action-button': {
      borderRadius: token.borderRadiusLG,
      backgroundColor: token.colorBgInput,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextLight4,
      border: 0,
      paddingInline: token.paddingSM,
      paddingBlock: 6,
      cursor: 'pointer',

      '& + &': {
        marginLeft: token.marginXS
      }
    },

    '.__action-button + .__action-button': {
      marginLeft: token.marginXS
    },

    '.__action-button-balance-value': {
      color: token.colorTextLight1,
      marginLeft: 2
    }
  };
});
