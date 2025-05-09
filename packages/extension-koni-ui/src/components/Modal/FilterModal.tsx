// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GeneralEmptyList } from '@subwallet/extension-koni-ui/components';
import Search from '@subwallet/extension-koni-ui/components/Search';
import { useIsModalInactive } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Checkbox, Icon, SwList, SwModal } from '@subwallet/react-ui';
import { CheckboxChangeEvent } from '@subwallet/react-ui/es/checkbox';
import CN from 'classnames';
import { FadersHorizontal } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export type OptionType = {
  label: string,
  value: string,
};

interface Props extends ThemeProps {
  id: string;
  onCancel: () => void;
  title?: string;
  applyFilterButtonTitle?: string;
  onApplyFilter?: () => void;
  optionSelectionMap: Record<string, boolean>;
  options: OptionType[];
  onChangeOption: (value: string, isChecked: boolean) => void;
  closeIcon?: React.ReactNode;
  searchBox?: {
    placeholder: string;
    searchFunction?: (searchValue: string, option: OptionType) => boolean;
  }
}

const renderEmpty = () => <GeneralEmptyList />;

function Component (props: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { applyFilterButtonTitle, className = '', closeIcon, id, onApplyFilter, onCancel, onChangeOption, optionSelectionMap, options, searchBox, title } = props;
  const [currentSearchText, setCurrentSearchText] = useState<string>('');
  const handleSearch = useCallback((value: string) => {
    setCurrentSearchText(value);
  }, []);
  const isModalInactive = useIsModalInactive(id);

  const _onChangeOption = useCallback((e: CheckboxChangeEvent) => {
    onChangeOption(e.target.value as string, e.target.checked);
  }, [onChangeOption]);

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

  const renderItem = useCallback((option: OptionType) => {
    return (
      <div
        className={'__option-item'}
        key={option.value}
      >
        <Checkbox
          checked={optionSelectionMap[option.value]}
          onChange={_onChangeOption}
          value={option.value}
        >
          <span className={'__option-label'}>{option.label}</span>
        </Checkbox>
      </div>
    );
  }, [_onChangeOption, optionSelectionMap]);

  const listItems = useMemo(() => {
    if (!searchBox || !currentSearchText) {
      return options;
    }

    return options.filter((o) => {
      if (searchBox?.searchFunction) {
        return searchBox?.searchFunction?.(currentSearchText, o);
      }

      return o.label.toLowerCase().includes(currentSearchText.toLowerCase());
    });
  }, [currentSearchText, options, searchBox]);

  useEffect(() => {
    if (isModalInactive) {
      setTimeout(() => {
        setCurrentSearchText('');
      }, 100);
    }
  }, [isModalInactive]);

  return (
    <SwModal
      className={CN(className, {
        '-has-search-box': !!searchBox
      })}
      closeIcon={closeIcon}
      footer={filterModalFooter}
      id={id}
      onCancel={onCancel}
      title={title || t('Filter')}
    >
      {
        !!searchBox && (
          <Search
            autoFocus={true}
            className={'__search-box'}
            onSearch={handleSearch}
            placeholder={searchBox.placeholder}
            searchValue={currentSearchText}
          />
        )
      }

      <SwList
        className={'__list-container'}
        list={listItems}
        renderItem={renderItem}
        renderWhenEmpty={renderEmpty}
      />
    </SwModal>
  );
}

export const FilterModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
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

    '.__search-box': {
      marginBottom: token.marginXS
    },

    '.__list-container': {
      flex: 1,
      overflow: 'auto'
    },

    '.__option-item': {
      display: 'flex'
    },

    '.__option-item + .__option-item': {
      marginTop: token.sizeLG
    },

    '.ant-checkbox-wrapper': {
      display: 'flex',
      alignItems: 'center'
    },

    '&.-has-search-box': {
      '.ant-sw-modal-content': {
        height: '100vh'
      },

      '.__list-container': {
        paddingTop: token.padding
      }
    }
  });
});
