// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Slider } from '@subwallet/react-ui';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & BasicInputWrapper<number>;

const options = [0.1, 1, 2, 3, 4, 5, 6];
const sliderMax = Math.max(...options);
const sliderMin = Math.min(...options);
const marks = options.reduce((result, val, idx) => {
  result[val] = `${options[idx]}x`;

  return result;
}, {} as Record<number, string>);

const sanitizeValue = (value?: number): number => (
  value && options.includes(value) ? value : sliderMin
);

const Component = (props: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { className = '', onChange, value: originValue } = props;
  const [value, setValue] = useState<number>(() => sanitizeValue(originValue));

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
      <div className={'__label-wrapper'}>
        <div className='__label'>{t('Conviction')}</div>
      </div>
      <div className='__input-container'>
        <Slider
          marks={marks}
          max={sliderMax}
          min={sliderMin}
          onChange={handleChange}
          step={null}
          value={value}
        />
      </div>
    </div>
  );
};

const ConvictionSlider = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    backgroundColor: token.colorBgSecondary,
    borderRadius: 8,
    paddingLeft: token.paddingSM,
    paddingRight: token.paddingSM,
    paddingTop: token.paddingXS,
    paddingBottom: token.paddingSM
  };
});

export default ConvictionSlider;
