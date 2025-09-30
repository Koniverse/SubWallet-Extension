// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EmptyList } from '@subwallet/extension-koni-ui/components';
import { ReferendumItem } from '@subwallet/extension-koni-ui/components/Governance';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ReferendumWithVoting } from '@subwallet/extension-koni-ui/types/gov';
import { Referendum } from '@subwallet/subsquare-api-sdk';
import { ListChecks } from 'phosphor-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  onClickItem: (item: Referendum) => void;
  chain: string;
  items: ReferendumWithVoting[];
};

type WrapperProps = Omit<Props, 'items'> & {
  items?: Referendum[];
};

const Component = ({ chain, className, items, onClickItem }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();

  const _onClickItem = useCallback((item: Referendum) => {
    return () => {
      onClickItem(item);
    };
  }, [onClickItem]);

  return (
    <div className={className}>
      {
        items.length > 0
          ? items.map((item) => (
            <ReferendumItem
              chain={chain}
              className={'__referendum-item'}
              item={item}
              key={item.referendumIndex}
              onClick={_onClickItem(item)}
            />
          ))
          : <EmptyList
            className={'__emptyList'}
            emptyMessage={t('Explore ongoing referenda and cast your vote')}
            emptyTitle={t('You haven’t voted yet!')}
            phosphorIcon={ListChecks}
          />
      }
    </div>
  );
};

const Wrapper: React.FC<WrapperProps> = (props: WrapperProps) => {
  const { items, ...restProps } = props;

  if (!items) {
    return (
      <></>
    );
  }

  return (
    <Component
      {...restProps}
      items={items}
    />
  );
};

export const ReferendaList = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return {
    paddingLeft: token.padding,
    paddingRight: token.padding,
    marginBottom: token.margin,

    '.__referendum-item + .__referendum-item': {
      marginTop: token.marginSM
    },

    '.__emptyList': {
      marginTop: token.margin
    }
  };
});
