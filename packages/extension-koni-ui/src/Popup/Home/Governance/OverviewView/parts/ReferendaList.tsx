// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReferendumItem } from '@subwallet/extension-koni-ui/components/Governance';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  onClickItem: () => void;
};

const Component = ({ className, onClickItem }: Props): React.ReactElement<Props> => {
  const _onClickItem = useCallback(() => {
    return () => {
      onClickItem();
    };
  }, [onClickItem]);

  return (
    <div className={className}>
      <ReferendumItem
        onClick={_onClickItem()}
      />
    </div>
  );
};

export const ReferendaList = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});
