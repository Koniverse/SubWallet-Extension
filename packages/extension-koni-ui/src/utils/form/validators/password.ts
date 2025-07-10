// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FormRule } from '@subwallet/extension-koni-ui/types';
import { TFunction } from 'react-i18next';

export const MinPasswordLength = 8;

// (?=.*\d): should contain at least one digit
// (?=.*[a-z]): should contain at least one lower case
// (?=.*[A-Z]): should contain at least one upper case
// (?=.*[~!@#$%^&*]): should contain at least one special character in listed
// [A-Za-z\d~!@#$%^&*]{8,}: should contain at least 8 from the mentioned characters

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])[A-Za-z\d~!@#$%^&*]{8,}$/;

export const renderBasePasswordRules = (fieldName: string, t: TFunction): FormRule[] => {
  return [
    {
      message: t('ui.util.validator.password.fieldMinLength', { replace: { minLen: MinPasswordLength, fieldName: fieldName } }),
      min: MinPasswordLength
    },
    {
      message: t('ui.util.validator.password.fieldIsRequired', { replace: { fieldName: fieldName } }),
      required: true
    },
    {
      message: t('ui.util.validator.password.fieldPasswordPolicy', { replace: { fieldName: fieldName } }),
      pattern: passwordRegex,
      warningOnly: true
    }
  ];
};

export const renderBaseConfirmPasswordRules = (passwordFieldName: string, t: TFunction): FormRule[] => {
  return [
    ...renderBasePasswordRules(t('ui.util.validator.password.confirmPassword'), t),
    ({ getFieldValue }) => ({
      validator: (_, value) => {
        const password = getFieldValue(passwordFieldName) as string;

        if (!value || password === value) {
          return Promise.resolve();
        }

        return Promise.reject(new Error(t('ui.util.validator.password.confirmPasswordDoNotMatch')));
      }
    })
  ];
};
