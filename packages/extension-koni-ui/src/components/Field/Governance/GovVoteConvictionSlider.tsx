// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { govConvictionOptions } from '@subwallet/extension-base/services/open-gov/interface';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components';
import { useForwardInputRef } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { InputRef, Slider } from '@subwallet/react-ui';
import React, { ForwardedRef, forwardRef, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & BasicInputWrapper<number>;

const sliderMax = Math.max(...govConvictionOptions.map((o) => o.value));
const sliderMin = Math.min(...govConvictionOptions.map((o) => o.value));
const marks = govConvictionOptions.reduce((acc, opts) => {
  acc[opts.value] = opts.label;

  return acc;
}, {} as Record<number, string>);

const sanitizeValue = (value?: number): number => (
  value && govConvictionOptions.some((o) => o.value === value)
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
          tooltip={{ open: false }}
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
    paddingBottom: token.paddingSM,

    '.ant-slider.ant-slider.ant-slider': {
      marginInline: 2,
      marginTop: 18,
      marginBottom: 32
    },

    '.ant-slider-rail.ant-slider-rail': {
      backgroundColor: token.colorBgInput
    },

    '.ant-slider-track, .ant-slider:hover .ant-slider-track': {
      backgroundColor: token.colorPrimary
    },

    '.ant-slider-handle.ant-slider-handle': {
      width: 24,
      height: 24,
      borderRadius: 8,
      top: -6,
      border: '1px solid',
      borderColor: token.colorWhite,
      backgroundColor: token.colorPrimary,

      '&:before, &:after': {
        height: 9,
        width: 3,
        boxShadow: 'none',
        borderRadius: 1,
        top: 6.5,
        backgroundColor: token.colorWhite
      },

      '&:before': {
        left: 7,
        right: 'auto'
      },

      '&:after': {
        left: 'auto',
        right: 7
      }
    },

    '.ant-slider-dot.ant-slider-dot': {
      border: 0,
      height: 10,
      width: 4,
      top: -3,
      borderRadius: 1,
      backgroundColor: '#4D4D4D',

      '&.ant-slider-dot-active': {
        backgroundColor: token.colorWhite
      }
    },

    '.ant-slider-mark.ant-slider-mark': {
      top: 20
    },

    '.ant-slider-mark-text.ant-slider-mark-text': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextLight2,

      '&:first-of-type': {
        transform: 'none !important'
      },

      '&:last-of-type': {
        transform: 'translateX(-100%) !important'
      }
    }
  };
});

export default GovVoteConvictionSlider;
