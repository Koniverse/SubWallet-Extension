// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { getGovConvictionOptions } from '@subwallet/extension-base/services/open-gov/utils';
import { BN_ZERO } from '@subwallet/extension-base/utils';
import { BasicInputWrapper, NumberDisplay } from '@subwallet/extension-koni-ui/components';
import { useForwardInputRef } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, InputRef, Slider, Tooltip } from '@subwallet/react-ui';
import { BigNumber } from 'bignumber.js';
import { Info } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & BasicInputWrapper<number> & {
  amount?: string;
  assetInfo: _ChainAsset;
};

const Component = (props: Props, ref: ForwardedRef<InputRef>): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { amount, assetInfo, className = '', onChange, value: originValue } = props;

  const inputRef = useForwardInputRef(ref);

  const chain = assetInfo.originChain || assetInfo.slug || '';

  const convictionOptions = useMemo(() => getGovConvictionOptions(chain), [chain]);

  const sliderMax = useMemo(() => Math.max(...convictionOptions.map((o) => o.value)), [convictionOptions]);
  const sliderMin = useMemo(() => Math.min(...convictionOptions.map((o) => o.value)), [convictionOptions]);
  const marks = useMemo(() => {
    return convictionOptions.reduce((acc, opts) => {
      acc[opts.value] = opts.label;

      return acc;
    }, {} as Record<number, string>);
  }, [convictionOptions]);

  const sanitizeValue = useCallback((value?: number): number => (
    value && convictionOptions.some((o) => o.value === value)
      ? value
      : sliderMin
  ), [convictionOptions, sliderMin]);

  const [value, setValue] = useState<number>(() => sanitizeValue(originValue));
  const handleChange = useCallback((val: number) => {
    onChange?.({ target: { value: val } });
  }, [onChange]);

  useEffect(() => {
    if (originValue !== undefined) {
      setValue(sanitizeValue(originValue));
    } else {
      setValue(sliderMin);
    }
  }, [originValue, sanitizeValue, sliderMin]);

  const currentTotalVote = useMemo(() => {
    if (amount && value !== null) {
      let sanitizedConviction = sanitizeValue(value);

      if (sanitizedConviction === 0) {
        sanitizedConviction = 0.1;
      }

      return (new BigNumber(amount)).multipliedBy(sanitizedConviction);
    } else {
      return BN_ZERO;
    }
  }, [amount, sanitizeValue, value]);

  return (
    <div className={className}>
      <div className='__label-wrapper'>
        <div className={'__left-item'}>
          <div className='__label'>{t('ui.GOVERNANCE.components.Field.Governance.GovVoteConvictionSlider.conviction')}</div>
          <Tooltip
            placement={'top'}
            title={t('ui.GOVERNANCE.components.Field.Governance.GovVoteConvictionSlider.multiplyVotesLockDuration')}
          >
            <div>
              <Icon
                className={'__i-info-icon'}
                customSize={'16px'}
                phosphorIcon={Info}
              />
            </div>
          </Tooltip>
        </div>

        <NumberDisplay
          decimal={_getAssetDecimals(assetInfo)}
          size={14}
          suffix={_getAssetSymbol(assetInfo)}
          value={currentTotalVote}
        />

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
      backgroundColor: token['gray-3'],

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
    },

    '.__label': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextLight4
    },

    '.__left-item': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXXS
    },

    '.__label-wrapper': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },

    '.__i-info-icon': {
      color: token.colorTextLight1,
      opacity: 0.65,
      cursor: 'pointer',
      transition: 'opacity 0.1s',

      '&:hover': {
        opacity: 1
      }

    }
  };
});

export default GovVoteConvictionSlider;
