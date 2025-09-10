// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BasicInputEvent } from '@subwallet/extension-koni-ui/components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, Switch, SwModal, Tooltip } from '@subwallet/react-ui';
import { ALL_TRACK_ID, GovStatusKey, SubsquareApiSdk } from '@subwallet/subsquare-api-sdk';
import CN from 'classnames';
import { FadersHorizontal, Info } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { GovStatusSelector } from './GovStatusSeletor';
import { GovTrackSelector } from './GovTrackSelector';

interface Props extends ThemeProps {
  id: string;
  chain: string;
  onCancel: () => void;
  isEnableTreasuryFilter: boolean;
  isEnableVotedFilter: boolean;
  isEnableDelegatedFilter: boolean;
  title?: string;
  onApplyFilter?: () => void;
  closeIcon?: React.ReactNode;
  applyFilterButtonTitle?: string;
  setIsEnableTreasuryFilter: (value: boolean) => void;
  setIsEnableVotedFilter: (value: boolean) => void;
  setIsEnableDelegatedFilter: (value: boolean) => void;
  statusSelected: GovStatusKey;
  setStatusSelected: (value: GovStatusKey) => void;
  trackSelected: string;
  setTrackSelected: (value: string) => void;
  sdkInstance?: SubsquareApiSdk
}

function Component (props: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { applyFilterButtonTitle, chain, className = '', closeIcon, id, isEnableDelegatedFilter, isEnableTreasuryFilter, isEnableVotedFilter, onApplyFilter, onCancel, sdkInstance, setIsEnableDelegatedFilter, setIsEnableTreasuryFilter, setIsEnableVotedFilter, setStatusSelected, setTrackSelected, statusSelected, title, trackSelected } = props;

  const filterModalFooter = useMemo(() => {
    return (
      <Button
        block={true}
        className={'__apply-button'}
        icon={
          <Icon
            phosphorIcon={FadersHorizontal}
            weight={'bold'}
          />
        }
        onClick={onApplyFilter}
      >
        {applyFilterButtonTitle || t('Apply filter')}
      </Button>
    );
  }, [t, onApplyFilter, applyFilterButtonTitle]);

  const onSelectStatus = useCallback((event: BasicInputEvent) => {
    setStatusSelected(event.target.value as GovStatusKey);
  }, [setStatusSelected]);

  const onSelectTrack = useCallback((event: BasicInputEvent) => {
    const value = event.target.value;

    setTrackSelected(value);

    if (isEnableTreasuryFilter) {
      setIsEnableTreasuryFilter(false);
    }
  }, [setTrackSelected, isEnableTreasuryFilter, setIsEnableTreasuryFilter]);

  const applyTreasuryFilter = useCallback(() => {
    const newValue = !isEnableTreasuryFilter;

    setIsEnableTreasuryFilter(newValue);

    if (newValue) {
      setTrackSelected(ALL_TRACK_ID);
    }
  }, [isEnableTreasuryFilter, setIsEnableTreasuryFilter, setTrackSelected]);

  const applyVotedFilter = useCallback(() => {
    setIsEnableVotedFilter(!isEnableVotedFilter);
  }, [isEnableVotedFilter, setIsEnableVotedFilter]);

  const applyDelegatedFilter = useCallback(() => {
    setIsEnableDelegatedFilter(!isEnableDelegatedFilter);
  }, [isEnableDelegatedFilter, setIsEnableDelegatedFilter]);

  return (
    <SwModal
      className={CN(className)}
      closeIcon={closeIcon}
      footer={filterModalFooter}
      id={id}
      onCancel={onCancel}
      title={title || t('Filter')}
    >
      <div className='__filter-part'>
        <Tooltip
          placement={'topRight'}
          title={t('Only show the referenda that requested treasury')}
        >
          <div className='__filter-left-part'>{t('Treasury-related')}
            <Icon
              iconColor='white'
              phosphorIcon={Info}
              size='sm'
              weight='fill'
            />
          </div>
        </Tooltip>
        <div className='__item-right-part'>
          <Switch
            checked={isEnableTreasuryFilter}
            onClick={applyTreasuryFilter}
          />
        </div>
      </div>
      <div className='__filter-part'>
        <Tooltip
          placement={'topRight'}
          title={t('Voted')}
        >
          <div className='__filter-left-part'>{t('Voted')}
            <Icon
              iconColor='white'
              phosphorIcon={Info}
              size='sm'
              weight='fill'
            />
          </div>
        </Tooltip>
        <div className='__item-right-part'>
          <Switch
            checked={isEnableVotedFilter}
            onClick={applyVotedFilter}
          />
        </div>
      </div>
      <div className='__filter-part'>
        <Tooltip
          placement={'topRight'}
          title={t('Delegated')}
        >
          <div className='__filter-left-part'>{t('Delegated')}
            <Icon
              iconColor='white'
              phosphorIcon={Info}
              size='sm'
              weight='fill'
            />
          </div>
        </Tooltip>
        <div className='__item-right-part'>
          <Switch
            checked={isEnableDelegatedFilter}
            onClick={applyDelegatedFilter}
          />
        </div>
      </div>
      <div className='__status-selectors'>
        <GovStatusSelector
          label='Status'
          onChange={onSelectStatus}
          value={statusSelected}
        />
      </div>
      <GovTrackSelector
        chain={chain}
        label='Track'
        onChange={onSelectTrack}
        sdkInstance={sdkInstance}
        value={trackSelected}
      />
    </SwModal>
  );
}

export const GovFilterModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-body': {
      overflow: 'auto',
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      paddingBottom: token.paddingXS
    },

    '.ant-sw-modal-footer': {
      borderTop: 0
    },

    '.__filter-part': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0px 12px',
      borderRadius: token.borderRadiusLG,
      backgroundColor: token.colorBgSecondary,
      fontSize: token.fontSizeHeading6,
      marginBottom: token.sizeSM,
      minHeight: '53px'
    },

    '.__filter-left-part': {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer',
      fontWeight: 600,
      color: token.colorWhite
    },

    '.__status-selectors': {
      marginBottom: token.sizeSM
    }
  });
});
