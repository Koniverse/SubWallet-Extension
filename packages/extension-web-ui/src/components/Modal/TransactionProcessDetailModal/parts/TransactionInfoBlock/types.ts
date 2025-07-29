// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProcessTransactionData } from '@subwallet/extension-base/types';
import { ThemeProps } from '@subwallet/extension-web-ui/types';

export type TransactionInfoBlockProps = ThemeProps & {
  processData: ProcessTransactionData
}
