// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BasicInputEvent, BasicInputWrapper } from '@subwallet/extension-koni-ui/components';
import { useForwardInputRef } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { InputRef, Logo } from '@subwallet/react-ui';
import React, { ForwardedRef, forwardRef } from 'react';
import styled from 'styled-components';

import AmountInput from '../AmountInput';

type Props = ThemeProps & BasicInputWrapper & {
  decimals: number;
  defaultInvalidOutputValue?: string;
  logoKey?: string;
  tokenSymbol?: string;
  topRightPart?: React.ReactNode;
  onChange?: (event: BasicInputEvent<string>, isUserInput?: boolean) => void
}

const Component = (props: Props, ref: ForwardedRef<InputRef>): React.ReactElement<Props> => {
  const { className = '', decimals,
    defaultInvalidOutputValue,
    label,
    logoKey,
    onChange,
    tokenSymbol,
    topRightPart,
    value } = props;

  const inputRef = useForwardInputRef(ref);

  return (
    <div className={className}>
      {
        !!topRightPart && (
          <div className={'__top-right-part-wrapper'}>
            {topRightPart}
          </div>
        )
      }

      <AmountInput
        className={'__amount-input-inner'}
        decimals={decimals}
        defaultInvalidOutputValue={defaultInvalidOutputValue}
        label={label}
        onChange={onChange}
        prefix={!!logoKey && (
          <Logo
            className={'__logo'}
            network={logoKey}
            shape={'circle'}
            size={20}
            token={logoKey}
          />
        )}
        ref={inputRef}
        suffix={ !!tokenSymbol && (
          <span className={'__symbol'}>
            {tokenSymbol}
          </span>
        )}
        value={value}
      />
    </div>
  );
};

const GovAmountInput = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    position: 'relative',

    '.__top-right-part-wrapper': {
      position: 'absolute',
      top: 0,
      right: 0,
      zIndex: 3
    },

    '.__amount-input-inner': {
      zIndex: 1
    }
  };
});

export default GovAmountInput;
