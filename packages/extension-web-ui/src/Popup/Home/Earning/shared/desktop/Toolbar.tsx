// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Search from '@subwallet/extension-web-ui/components/Search';
import { useTranslation } from '@subwallet/extension-web-ui/hooks';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { FadersHorizontal, Question } from 'phosphor-react';
import React, { useCallback } from 'react';
import styled from 'styled-components';

interface Props extends ThemeProps{
  onClickFilter: VoidFunction;
  onSearch: (value: string) => void;
  inputPlaceholder: string;
  searchValue: string;
  showReload?: boolean; // todo: later
}

function Component ({ className, inputPlaceholder, onClickFilter, onSearch, searchValue }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const onClickHelp = useCallback(() => {
    // todo: open earning doc
  }, []);

  return (
    <div className={CN(className)}>
      <Search
        actionBtnIcon={(
          <Icon
            phosphorIcon={FadersHorizontal}
            size='sm'
          />
        )}
        extraButton={
          <Button
            icon={(
              <Icon
                customSize={'28px'}
                phosphorIcon={Question}
              />
            )}
            onClick={onClickHelp}
            size='xs'
            type='ghost'
          >
            {t('Help')}
          </Button>
        }
        onClickActionBtn={onClickFilter}
        onSearch={onSearch}
        placeholder={inputPlaceholder}
        searchValue={searchValue}
        showActionBtn
        showExtraButton={true}
      />
    </div>
  );
}

export const Toolbar = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: token.sizeXS
  };
});
