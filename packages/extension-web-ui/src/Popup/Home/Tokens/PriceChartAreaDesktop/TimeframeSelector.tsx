// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Dropdown, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretDown, CaretUp } from 'phosphor-react';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { timeframes } from './shared';

type Props = ThemeProps & {
  selectedTimeframe: PriceChartTimeframe,
  onSelect: (timeframe: PriceChartTimeframe) => void,
};

const Component: React.FC<Props> = (props: Props) => {
  const { className, onSelect, selectedTimeframe } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const timeframeLabelMap = useMemo<Record<PriceChartTimeframe, string>>(() => ({
    '1D': '24h',
    '1W': '7d',
    '1M': '1m',
    '3M': '3m',
    '1Y': '1y',
    YTD: 'YTD',
    ALL: 'Max'
  }), []);

  const onClickItem = useCallback((timeframe: PriceChartTimeframe) => {
    return () => {
      onSelect(timeframe);
      setIsDropdownOpen(false);
    };
  }, [onSelect]);

  const dropdownMenu = useMemo(() => {
    return timeframes.map((timeframe) => ({
      key: timeframe,
      label: timeframeLabelMap[timeframe],
      onClick: onClickItem(timeframe),
      className: timeframe === selectedTimeframe ? '-selected' : undefined
    }));
  }, [onClickItem, selectedTimeframe, timeframeLabelMap]);

  const getDropdownPopupContainer = useCallback((trigger: HTMLElement) => {
    return (trigger.parentNode as HTMLElement) || document.body;
  }, []);

  return (
    <>
      <Dropdown
        arrow={false}
        getPopupContainer={getDropdownPopupContainer}
        menu={{ items: dropdownMenu }}
        onOpenChange={setIsDropdownOpen}
        open={isDropdownOpen}
        overlayClassName={CN(className, '-overlay')}
        placement='bottomRight'
        trigger={['click']}
      >
        <div className={CN(className, '-trigger', {
          '-open': isDropdownOpen
        })}
        >
          <span className={'__trigger-label'}>
            {timeframeLabelMap[selectedTimeframe]}
          </span>

          <Icon
            className={'__trigger-arrow'}
            customSize={'12px'}
            phosphorIcon={isDropdownOpen ? CaretUp : CaretDown}
          />
        </div>
      </Dropdown>
    </>
  );
};

export const TimeframeSelector = styled(Component)<ThemeProps>(({ theme: { token } }: ThemeProps) => ({
  '&.-trigger': {
    cursor: 'pointer',
    height: 32,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 16,
    gap: token.sizeXXS,
    backgroundColor: token.colorBgDefault,
    color: token.colorTextLight2,
    justifyContent: 'center',
    paddingInline: token.paddingXS,
    minWidth: 68,
    width: 'fit-content',

    '.__trigger-label': {
      fontWeight: token.bodyFontWeight,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM
    },

    '&.-open': {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0
    }
  },

  '&.-overlay': {
    '.ant-dropdown-menu': {
      paddingInline: 0,
      paddingBottom: 0,
      backgroundColor: token.colorBgDefault,
      borderRadius: 16,

      '&:before': {
        content: '""',
        display: 'block',
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        width: 48,
        marginInline: 'auto',
        marginBottom: token.marginXXS
      }
    },

    '&.ant-dropdown-placement-bottomLeft, &.ant-dropdown-placement-bottomRight, &.ant-dropdown-placement-bottom': {
      '.ant-dropdown-menu': {
        marginTop: -4,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0
      }
    },

    '.ant-dropdown-menu-item.ant-dropdown-menu-item': {
      paddingBlock: 0,
      textAlign: 'center',
      paddingInline: token.paddingXS,
      fontWeight: token.bodyFontWeight,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      borderRadius: 16,
      minHeight: 32,

      '&.-selected': {
        backgroundColor: token.colorBgSecondary
      }
    },

    '.ant-dropdown-menu-item + .ant-dropdown-menu-item': {
      marginTop: token.marginXXS
    }
  }
}));
