// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components';
import { useForwardInputRef } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { InputRef, Slider } from '@subwallet/react-ui';
import React, { ForwardedRef, forwardRef, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & BasicInputWrapper<number>;

const options = [
  { value: 0, label: '0.1x' },
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 3, label: '3x' },
  { value: 4, label: '4x' },
  { value: 5, label: '5x' },
  { value: 6, label: '6x' }
];

const sliderMax = Math.max(...options.map((o) => o.value));
const sliderMin = Math.min(...options.map((o) => o.value));
const marks = options.reduce((acc, opts) => {
  acc[opts.value] = opts.label;

  return acc;
}, {} as Record<number, string>);

const sanitizeValue = (value?: number): number => (
  value && options.some((o) => o.value === value)
    ? value
    : sliderMin
);

const Component = (props: Props, ref: ForwardedRef<InputRef>): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { className = '', onChange, value: originValue } = props;
  const [value, setValue] = useState<number>(() => sanitizeValue(originValue));
  const inputRef = useForwardInputRef(ref);

  const handleChange = useCallback((val: number) => {
    onChange?.({ target: { value: val } });
  }, [onChange]);

  useEffect(() => {
    if (originValue !== undefined) {
      setValue(sanitizeValue(originValue));
    }
  }, [originValue]);

  return (
    <div className={className}>
      <div className='__label-wrapper'>
        <div className='__label'>{t('Conviction')}</div>
      </div>
      <div className='__input-container'>
        <Slider
          marks={marks}
          max={sliderMax}
          min={sliderMin}
          onChange={handleChange}
          ref={inputRef}
          step={null}
          value={value}
        />
      </div>
    </div>
  );
};

const GovVoteConvictionSlider = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    backgroundColor: token.colorBgSecondary,
    borderRadius: 8,
    paddingLeft: token.paddingSM,
    paddingRight: token.paddingSM,
    paddingTop: token.paddingXS,
    paddingBottom: token.paddingSM
  };
});

export default GovVoteConvictionSlider;
