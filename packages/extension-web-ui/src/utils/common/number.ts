// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AmountData } from '@subwallet/extension-base/background/KoniTypes';
import { balanceFormatter, formatNumber } from '@subwallet/react-ui';
import BigN from 'bignumber.js';

export const formatBalance = (value: string | number | BigN, decimals: number) => {
  return formatNumber(value, decimals, balanceFormatter);
};

export const formatAmount = (amountData?: AmountData): string => {
  if (!amountData) {
    return '';
  }

  const { decimals, symbol, value } = amountData;
  const displayValue = formatBalance(value, decimals);

  return `${displayValue} ${symbol}`;
};

const getNumberSeparators = () => {
  // default
  const res = {
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
const intToLocaleString = (str: string, separator: string) =>
  str.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

export function toDisplayNumber (num?: number | string, decimals = 0): string {
  if (num === undefined) {
    return '';
  }

  const formatNumberString = formatNumber(num, decimals, balanceFormatter);

  const [int, decAndAbb] = formatNumberString.split('.');
  const [dec, abbreviation] = decAndAbb ? decAndAbb.split(' ') : [''];

  let result = intToLocaleString(int, thousandSeparator);

  if (dec) {
    result = `${result}${decimalSeparator}${dec}`;
  }

  if (abbreviation) {
    result = `${result} ${abbreviation}`;
  }

  return result;
}
