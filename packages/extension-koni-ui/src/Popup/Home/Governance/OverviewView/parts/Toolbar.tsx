// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import { ReferendaCategory } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import { FadersHorizontal, MagnifyingGlass } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  onChangeCategory: (category: ReferendaCategory) => void;
  selectedReferendaCategory: ReferendaCategory
};

const Component = ({ className, onChangeCategory, selectedReferendaCategory }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();

  const filterTabItems = useMemo(() => {
    return [
      {
        label: t('Ongoing'),
        value: ReferendaCategory.ONGOING
      },
      {
        label: t('Completed'),
        value: ReferendaCategory.COMPLETED
      },
      {
        label: t('Voted'),
        value: ReferendaCategory.VOTED
      }
    ];
  }, [t]);

  const onSelectFilterTab = useCallback((value: string) => {
    onChangeCategory(value as ReferendaCategory);
  }, [onChangeCategory]);

  return (
    <div className={className}>
      <FilterTabs
        className={'__filter-tabs-bar'}
        items={filterTabItems}
        onSelect={onSelectFilterTab}
        selectedItem={selectedReferendaCategory}
      />

      <div className='__buttons-wrapper'>
        <Button
          icon={(
            <Icon
              customSize={'20px'}
              phosphorIcon={MagnifyingGlass}
            />
          )}
          size={'xs'}
          type={'ghost'}
        />

        <Button
          icon={(
            <Icon
              customSize={'20px'}
              phosphorIcon={FadersHorizontal}
            />
          )}
          size={'xs'}
          type={'ghost'}
        />
      </div>

    </div>
  );
};

export const Toolbar = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'flex',

    '.__filter-tabs-bar': {
      flex: 1
    }

  };
});
