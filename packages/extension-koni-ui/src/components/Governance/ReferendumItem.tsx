// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  onClick?: VoidFunction;
};

const Component = ({ className, onClick }: Props): React.ReactElement<Props> => {
  return (
    <div
      className={className}
      onClick={onClick}
    >
      Referendum Item
    </div>
  );
};

const ReferendumItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    backgroundColor: token.colorBgSecondary,
    borderRadius: token.borderRadiusLG,
    minHeight: 80
  };
});

export default ReferendumItem;
