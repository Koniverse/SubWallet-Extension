// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field';
import { useSelectModalInputHelper } from '@subwallet/extension-koni-ui/hooks';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, InputRef, SelectModal } from '@subwallet/react-ui';
import { CaretRight, CheckCircle, ClipboardText, ClockAfternoon, HourglassHigh, IconProps, Prohibit, RocketLaunch, Scales, Skull, Stack, XCircle } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

interface Props extends ThemeProps, BasicInputWrapper {
  loading?: boolean;
}

export enum GovStatusKey {
  ALL = 'All',
  PREPARING = 'Preparing',
  DECIDING = 'Deciding',
  CONFIRMING = 'Confirming',
  APPROVED = 'Approved',
  QUEUEING = 'Queueing',
  EXECUTED = 'Executed',
  REJECTED = 'Rejected',
  TIMEDOUT = 'Timedout',
  CANCELLED = 'Cancelled',
  KILLED = 'Killed',
}

export interface GovStatusItem {
  key: GovStatusKey;
  label: string;
  icon?: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
  colorToken?: keyof Theme['token'];
}

export const govStatusItems: GovStatusItem[] = [
  { key: GovStatusKey.ALL, label: 'All status' },
  { key: GovStatusKey.PREPARING, label: 'Preparing', icon: HourglassHigh, colorToken: 'gold-6' },
  { key: GovStatusKey.DECIDING, label: 'Deciding', icon: Scales, colorToken: 'blue-7' },
  { key: GovStatusKey.CONFIRMING, label: 'Confirming', icon: ClipboardText, colorToken: 'geekblue-7' },
  { key: GovStatusKey.APPROVED, label: 'Approved', icon: CheckCircle, colorToken: 'lime-7' },
  { key: GovStatusKey.QUEUEING, label: 'Queueing', icon: Stack, colorToken: 'green-6' },
  { key: GovStatusKey.EXECUTED, label: 'Executed', icon: RocketLaunch, colorToken: 'colorSecondaryText' },
  { key: GovStatusKey.REJECTED, label: 'Rejected', icon: Prohibit, colorToken: 'magenta-6' },
  { key: GovStatusKey.TIMEDOUT, label: 'TimedOut', icon: ClockAfternoon, colorToken: 'gray-6' },
  { key: GovStatusKey.CANCELLED, label: 'Cancelled', icon: XCircle, colorToken: 'orange-6' },
  { key: GovStatusKey.KILLED, label: 'Killed', icon: Skull, colorToken: 'red-6' }
];

function Component (props: Props, ref: ForwardedRef<InputRef>): React.ReactElement<Props> {
  const { className = '', disabled, id = 'gov-status-input', label, loading, placeholder, statusHelp, title, tooltip, value } = props;
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;
  const { onSelect } = useSelectModalInputHelper(props, ref);

  const renderSelected = useCallback((item: GovStatusItem) => {
    if (loading) {
      return <div className='__loading-text'>{t('Loading ...')}</div>;
    }

    return <div className='__selected-item'>{item.label}</div>;
  }, [loading, t]);

  const renderItem = useCallback((item: GovStatusItem, selected: boolean) => {
    const StatusIcon = item.icon;
    const color = item.colorToken && token[item.colorToken] ? (token[item.colorToken] as string) : token.colorText;

    return (
      <div className='__status-item'>
        <div className='__status-left'>
          {StatusIcon && (
            <Icon
              customSize='16.25px'
              iconColor={color}
              phosphorIcon={StatusIcon}
              weight='fill'
            />
          )}
          <span style={{ marginLeft: 8, color }}>{item.label}</span>
        </div>
        {selected && (
          <div className='__check-icon'>
            <Icon
              customSize='20px'
              iconColor={token.colorSuccess}
              phosphorIcon={CheckCircle}
              type='phosphor'
              weight='fill'
            />
          </div>
        )}
      </div>
    );
  }, [token]);

  return (
    <SelectModal
      className={`${className} gov-status-selector-modal`}
      disabled={disabled}
      id={id}
      inputClassName={`${className} gov-status-selector-input`}
      itemKey={'key'}
      items={govStatusItems}
      label={label}
      loading={loading}
      onSelect={onSelect}
      placeholder={placeholder || t('Select status')}
      renderItem={renderItem}
      renderSelected={renderSelected}
      selected={value || 'All'}
      statusHelp={statusHelp}
      suffix={
        <Icon
          phosphorIcon={CaretRight}
        />
      }
      title={title || label || placeholder || t('Select status')}
      tooltip={tooltip}
    />
  );
}

export const GovStatusSelector = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return ({
    '&.gov-status-selector-input': {
      '.__selected-item, .__loading-text': {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      },

      '.__selected-item': {
        color: token.colorText
      },

      '.__loading-text': {
        color: token.colorTextLight4
      }
    },

    '.__status-item': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 8px'
    },

    '.__check-icon': {
      display: 'flex',
      width: 24,
      justifyContent: 'center'
    }
  });
});
