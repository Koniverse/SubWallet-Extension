// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';

type WrapperProps = ThemeProps;

type ComponentProps = {
  className?: string;
};

const Component = (props: ComponentProps): React.ReactElement<ComponentProps> => {
  return (
    <>
      <Outlet />
    </>
  );
};

const Wrapper: React.FC<WrapperProps> = (props: WrapperProps) => {
  const { className } = props;

  return (
    <Component
      className={className}
    />
  );
};

const ReferendumVote = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return {

  };
});

export default ReferendumVote;
