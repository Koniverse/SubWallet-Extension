// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Number, SwNumberProps, Typography } from '@subwallet/react-ui';
import { toBNString } from '@subwallet/react-ui/es/_util/number';
import { ConfigContext } from '@subwallet/react-ui/es/config-provider';
import useStyle from '@subwallet/react-ui/es/number/style';
import { useToken } from '@subwallet/react-ui/es/theme/internal';
import BigN, { type BigNumber } from 'bignumber.js';
import CN from 'classnames';
import React, { useMemo } from 'react';
import styled from 'styled-components';

// TODO: This component is a hotfix for the limitations of the Number component
//  in @subwallet/react-ui. It should be updated directly in @subwallet/react-ui in the future.

type Props = ThemeProps & SwNumberProps;

interface LocaleNumberFormat {
  decimal: string;
  thousand: string;
}

const intToLocaleString = (str: string, separator: string) =>
  str.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

const getNumberSeparators = () => {
  // default
  const res: LocaleNumberFormat = {
    decimal: '.',
    thousand: ''
  };

  // convert a number formatted according to locale
  const str = parseFloat('1234.56').toLocaleString();

  // if the resulting number does not contain previous number
  // (i.e. in some Arabic formats), return defaults
  if (!str.match('1')) {
    return res;
  }

  // get decimal and thousand separators
  res.decimal = str.replace(/.*4(.*)5.*/, '$1');
  res.thousand = str.replace(/.*1(.*)2.*/, '$1');

  // return results
  return res;
};

const { decimal: decimalSeparator, thousand: thousandSeparator } = getNumberSeparators();

function roundFraction (raw: string, digits: number): string {
  const numStr = `0.${raw}`;
  const rounded = new BigN(numStr).decimalPlaces(digits, BigN.ROUND_HALF_UP);

  return rounded.toFixed(digits).split('.')[1];
}

type DecimalParts = {
  integerPart: string;
  subZeroCount?: number;
  fractionPart?: string;
};

function analyzeDecimal (value: string | number | BigNumber): DecimalParts {
  const str = new BigN(value).toFixed();
  const [intPart, fracRaw = ''] = str.split('.');
  const intVal = +intPart;

  if (!fracRaw || /^0*$/.test(fracRaw)) {
    return { integerPart: intPart };
  }

  if (intVal > 0) {
    if (/^0{3,}$/.test(fracRaw)) {
      return { integerPart: intPart, fractionPart: '000' };
    }

    return {
      integerPart: intPart,
      fractionPart: roundFraction(fracRaw, 4)
    };
  }

  const zeroMatch = fracRaw.match(/^(0{3,})/);
  const subCount = zeroMatch?.[1].length;
  const rest = subCount ? fracRaw.slice(subCount) : fracRaw;
  const maxLen = subCount ? 2 : 4;
  const rounded = roundFraction(rest, maxLen);

  return {
    integerPart: intPart,
    subZeroCount: subCount,
    fractionPart: rounded || (subCount ? '' : undefined)
  };
}

const Component: React.FC<Props> = (props: Props) => {
  const { getPrefixCls } = React.useContext(ConfigContext);
  const [, token] = useToken();
  const { decimal,
    size: integerFontSize = 16,
    prefix,
    suffix,
    subFloatNumber,
    value,
    className,
    prefixCls: customizePrefixCls,
    intColor = token.colorTextLight1,
    intOpacity = 1,
    decimalColor = token.colorTextLight1,
    decimalOpacity = 1,
    unitColor = token.colorTextLight1,
    unitOpacity = 1,
    weight = 500 } = props;

  const intStyle = useMemo(
    (): React.CSSProperties => ({
      color: intColor,
      opacity: intOpacity
    }),
    [intColor, intOpacity]
  );

  const decimalStyle = useMemo(
    (): React.CSSProperties => ({
      color: decimalColor,
      opacity: decimalOpacity
    }),
    [decimalColor, decimalOpacity]
  );

  const unitStyle = useMemo(
    (): React.CSSProperties => ({
      color: unitColor,
      opacity: unitOpacity
    }),
    [unitColor, unitOpacity]
  );

  const prefixCls = getPrefixCls('number', customizePrefixCls);
  const [, hashId] = useStyle(prefixCls);

  const classNameExtend = useMemo(
    (): string => CN(hashId, className, prefixCls),
    [hashId, className, prefixCls]
  );
  const decimalFontSize = useMemo((): number => {
    if (subFloatNumber) {
      return (integerFontSize * 24) / 38;
    }

    return integerFontSize;
  }, [subFloatNumber, integerFontSize]);

  const [_int, _dec] = useMemo((): [string, React.ReactNode] => {
    const { fractionPart, integerPart, subZeroCount } = analyzeDecimal(value);
    const decPart = (() => {
      if (subZeroCount !== undefined) {
        return (
          <>
            0<sub>{subZeroCount}</sub>{fractionPart}
          </>
        );
      }

      return fractionPart;
    })();

    return [intToLocaleString(integerPart, thousandSeparator), decPart];
  }, [value]);

  return (
    <div
      className={CN(classNameExtend)}
      data-value={toBNString(value, decimal)}
    >
      {prefix && (
        <Typography.Text
          className={CN(`${prefixCls}-prefix`)}
          style={{ ...unitStyle, fontWeight: weight, fontSize: integerFontSize }}
        >
          {prefix}
        </Typography.Text>
      )}
      <Typography.Text
        className={CN(`${prefixCls}-integer`)}
        style={{ ...intStyle, fontWeight: weight, fontSize: integerFontSize }}
      >
        {_int}
      </Typography.Text>
      {!!_dec && (
        <Typography.Text
          className={CN(`${prefixCls}-decimal`)}
          style={{ ...decimalStyle, fontWeight: weight, fontSize: decimalFontSize }}
        >
          {decimalSeparator}
          {_dec}
        </Typography.Text>
      )}
      {/* {!!_abbreviation && ( */}
      {/*   <Typography.Text */}
      {/*     className={CN(`${prefixCls}-integer`)} */}
      {/*     style={{ ...intStyle, fontWeight: weight, fontSize: integerFontSize }} */}
      {/*   > */}
      {/*     {` ${_abbreviation}`} */}
      {/*   </Typography.Text> */}
      {/* )} */}
      {suffix && (
        <Typography.Text
          className={CN(`${prefixCls}-suffix`)}
          style={{ ...unitStyle, fontWeight: weight, fontSize: decimalFontSize }}
        >
          &nbsp;{suffix}
        </Typography.Text>
      )}
    </div>
  );
};

const Wrapper: React.FC<Props> = (props: Props) => {
  const { hide, value } = props;

  const isDefaultComponentUsed = useMemo(() => {
    if (hide) {
      return true;
    }

    return new BigN(value).gte(1);
  }, [hide, value]);

  if (isDefaultComponentUsed) {
    return (
      <Number
        {...props}
      />
    );
  }

  return (
    <Component
      {...props}
    />
  );
};

const NumberDisplay = styled(Wrapper)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});

export default NumberDisplay;
