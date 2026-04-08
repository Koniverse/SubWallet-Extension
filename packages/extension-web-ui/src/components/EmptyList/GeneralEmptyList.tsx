// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MagnifyingGlass } from 'phosphor-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import EmptyList from './EmptyList';

const GeneralEmptyList: React.FC = () => {
  const { t } = useTranslation();

  return (
    <EmptyList
      emptyMessage={t('ui.GENERAL_EMPTY_LIST.components.EmptyList.GeneralEmptyList.changeYourSearchCriteriaAndTryAgain')}
      emptyTitle={t('ui.GENERAL_EMPTY_LIST.components.EmptyList.GeneralEmptyList.noResultsFound')}
      phosphorIcon={MagnifyingGlass}
    />
  );
};

export default GeneralEmptyList;
