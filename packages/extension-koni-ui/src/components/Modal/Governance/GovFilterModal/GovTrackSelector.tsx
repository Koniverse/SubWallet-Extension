// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EmptyList } from '@subwallet/extension-koni-ui/components';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field';
import { useSelectModalInputHelper } from '@subwallet/extension-koni-ui/hooks';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GOV_QUERY_KEYS } from '@subwallet/extension-koni-ui/utils/gov';
import { Icon, InputRef, SelectModal } from '@subwallet/react-ui';
import { ALL_TRACK_ID, SubsquareApiSdk, TrackInfo } from '@subwallet/subsquare-api-sdk';
import { useQuery } from '@tanstack/react-query';
import CN from 'classnames';
import { CaretRight, CheckCircle, ListChecks } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

interface Props extends ThemeProps, BasicInputWrapper {
  chain: string;
  loading?: boolean;
  sdkInstance?: SubsquareApiSdk
}

function Component (props: Props, ref: ForwardedRef<InputRef>): React.ReactElement<Props> {
  const { chain, className = '', disabled, id = 'gov-track-input', label, loading, placeholder, sdkInstance, statusHelp, title, tooltip, value } = props;
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;
  const { onSelect } = useSelectModalInputHelper(props, ref);

  const { data: items } = useQuery({
    queryKey: GOV_QUERY_KEYS.tracks(chain),
    queryFn: async () => {
      return await sdkInstance?.getTracks();
    },
    enabled: !!chain,
    staleTime: 60 * 1000
  });

  const renderSelected = useCallback((item: TrackInfo) => {
    if (loading) {
      return <div className='__loading-text'>{t('ui.GOVERNANCE.components.Modal.Governance.GovFilter.GovTrackSelector.loading')}</div>;
    }

    return <div className='__selected-item'>{item.name}</div>;
  }, [loading, t]);

  const searchFunction = useCallback((item: TrackInfo, searchText: string) => {
    if (!searchText) {
      return true;
    }

    const keyword = searchText.toLowerCase();
    const name = item.name?.toLowerCase() ?? '';
    const formatted = item.name.toLowerCase();

    return name.includes(keyword) || formatted.includes(keyword);
  }, []);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyList
        className={'__emptyList'}
        emptyMessage={t('ui.GOVERNANCE.components.Modal.Governance.GovFilter.GovTrackSelector.noTrackFound')}
        phosphorIcon={ListChecks}
      />
    );
  }, [t]);

  const renderItem = useCallback((item: TrackInfo, selected: boolean) => {
    return (
      <div className={CN('__status-item', { '-selected': selected })}>
        <div className='__status-left'>
          {item.name}
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
      className={`${className} gov-track-selector-modal`}
      disabled={disabled}
      id={id}
      inputClassName={`${className} gov-track-selector-input`}
      itemKey={'id'}
      items={items || []}
      label={label}
      loading={loading}
      onSelect={onSelect}
      placeholder={placeholder || t('ui.GOVERNANCE.components.Modal.Governance.GovFilter.GovTrackSelector.selectTrack')}
      renderItem={renderItem}
      renderSelected={renderSelected}
      renderWhenEmpty={renderEmpty}
      searchFunction={searchFunction}
      searchMinCharactersCount={2}
      searchPlaceholder={t('ui.GOVERNANCE.components.Modal.Governance.GovFilter.GovTrackSelector.searchTrack')}
      selected={value ?? ALL_TRACK_ID}
      statusHelp={statusHelp}
      suffix={
        <Icon
          phosphorIcon={CaretRight}
        />
      }
      title={title || label || placeholder || t('ui.GOVERNANCE.components.Modal.Governance.GovFilter.GovTrackSelector.selectTrack')}
      tooltip={tooltip}
    />
  );
}

export const GovTrackSelector = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return ({
    '&.gov-track-selector-input': {
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
      padding: '14px 4px 14px 12px',
      borderRadius: token.borderRadiusLG,
      cursor: 'pointer',
      transition: 'background-color .05s ease',

      '&.-selected, &:hover': {
        backgroundColor: token.colorBgSecondary
      }
    },

    '.__status-label': {
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      fontWeight: token.fontWeightStrong
    },

    '.__status-left': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXS
    },

    '.__check-icon': {
      display: 'flex',
      width: 40,
      justifyContent: 'center'
    }
  });
});
