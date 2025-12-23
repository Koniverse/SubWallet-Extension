// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubstrateProxyType } from '@subwallet/extension-base/types';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field/Base';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { useSelectModalInputHelper } from '@subwallet/extension-koni-ui/hooks/form/useSelectModalInputHelper';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, InputRef, SelectModal, Web3Block } from '@subwallet/react-ui';
import { CheckCircle } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';

interface Props extends ThemeProps, BasicInputWrapper {
  chain: string;
}

interface SubstrateProxyTypeExtended {
  type: SubstrateProxyType;
  label: string;
  unSupportedChains?: string[]
}

const substrateProxyTypeItem: SubstrateProxyTypeExtended[] = [
  {
    type: 'Any',
    label: 'Any'
  },
  {
    type: 'NonTransfer',
    label: 'Non - transfer'
  },
  {
    type: 'Governance',
    label: 'Governance'
  },
  {
    type: 'Staking',
    label: 'Staking',
    unSupportedChains: ['astar'] // TODO: can improve to get all support type onchain, need improve later
  }
];

function Component(props: Props, ref: ForwardedRef<InputRef>): React.ReactElement<Props> {
  const { className = '', disabled, id = 'address-input', label, placeholder, statusHelp, title, tooltip, value, chain } = props;
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;
  const { onSelect } = useSelectModalInputHelper(props, ref);

  const renderSubstrateProxyTypeSelected = useCallback((item: SubstrateProxyTypeExtended) => {
    return (
      <div className={'__selected-item'}>{item.label}</div>
    );
  }, []);

  const renderItem = useCallback((item: SubstrateProxyTypeExtended, selected: boolean) => {
    return (
      <Web3Block
        className={'__proxy-type-item'}
        leftItem={<div className={'__proxy-type-label'}>
          {item.label}
        </div>}
        rightItem={selected && (<div className={'__check-icon'}>
          <Icon
            customSize={'20px'}
            iconColor={token.colorSuccess}
            phosphorIcon={CheckCircle}
            type='phosphor'
            weight='fill'
          />
        </div>)}
      />
    );
  }, [token.colorSuccess]);

  const filteredProxyTypes = useMemo(() => {
    if (!chain) {
      return substrateProxyTypeItem;
    }

    return substrateProxyTypeItem.filter((item) => {
      if (!item.unSupportedChains?.length) {
        return true;
      }

      return !item.unSupportedChains.includes(chain);
    });
  }, [chain]);

  return (
    <SelectModal
      className={`${className} proxy-type-selector-modal selector-${id}-modal`}
      disabled={disabled}
      id={id}
      inputClassName={`${className} proxy-type-selector-input`}
      itemKey={'type'}
      items={filteredProxyTypes}
      label={label}
      onSelect={onSelect}
      placeholder={placeholder || t('ui.TRANSACTION.screen.Transaction.part.SubstrateProxyTypeSelector.selectSubstrateProxyType')}
      renderItem={renderItem}
      renderSelected={renderSubstrateProxyTypeSelected}
      selected={value || ''}
      statusHelp={statusHelp}
      title={title || placeholder || t('ui.TRANSACTION.screen.Transaction.part.SubstrateProxyTypeSelector.selectSubstrateProxyType')}
      tooltip={tooltip}
    />
  );
}

export const SubstrateProxyTypeSelector = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return ({
    '&.ant-select-modal-input-container .ant-select-modal-input-wrapper': {
      paddingLeft: 12,
      paddingRight: 12
    },

    '&.proxy-type-selector-input': {
      '.__selected-item, .__loading-text': {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      },

      '.__selected-item': {
        color: token.colorText,
        fontWeight: 500,
        lineHeight: token.lineHeightHeading6
      }
    },

    '.ant-sw-list-wrapper': {
      flex: 'unset'
    },

    '.chain-logo': {
      margin: '-1px 0'
    },

    '.__proxy-type-item': {
      backgroundColor: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      justifyContent: 'space-between',
      transition: '0.3s all ease-in-out',

      '&:hover': {
        backgroundColor: token.colorBgInput
      },

      '& .__check-icon': {
        display: 'flex',
        width: 40,
        justifyContent: 'center'
      }
    }
  });
});
