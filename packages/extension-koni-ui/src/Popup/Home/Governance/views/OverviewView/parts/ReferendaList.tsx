// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReferendumItem } from '@subwallet/extension-koni-ui/components/Governance';
import { ReferendaCategory } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Referendum } from '@subwallet/subsquare-api-sdk';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  onClickItem: (item: Referendum) => void;
  items: Referendum[];
  selectedReferendaCategory: ReferendaCategory
};

type WrapperProps = Omit<Props, 'items'> & {
  items?: Referendum[];
};

const Component = ({ className, items, onClickItem, selectedReferendaCategory }: Props): React.ReactElement<Props> => {
  const _onClickItem = useCallback((item: Referendum) => {
    return () => {
      onClickItem(item);
    };
  }, [onClickItem]);

  const filteredItems = useMemo(() => {
    const filterFunc = (item: Referendum) => {
      const stateName = item.state.name;

      if (selectedReferendaCategory === ReferendaCategory.ONGOING) {
        return ['Preparing', 'Submitted', 'Queueing', 'Deciding', 'Confirming'].includes(stateName);
      }

      if (selectedReferendaCategory === ReferendaCategory.COMPLETED) {
        return ['Approved', 'Rejected', 'Cancelled', 'TimedOut', 'Killed'].includes(stateName);
      }

      if (selectedReferendaCategory === ReferendaCategory.VOTED) {
        return false;
      }

      return false;
    };

    return items.filter(filterFunc);
  }, [items, selectedReferendaCategory]);

  return (
    <div className={className}>
      {
        filteredItems.map((item, index) => (
          <ReferendumItem
            className={'__referendum-item'}
            item={item}
            key={item.referendumIndex}
            onClick={_onClickItem(item)}
          />
        ))
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
    '.__referendum-item + .__referendum-item': {
      marginTop: token.marginXS
    }
  };
});
