// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ImportSeedPhrase from '@subwallet/extension-koni-ui/Popup/Account/ImportSeedPhrase';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';

type Props = ThemeProps;

const ImportSeedPhraseTrust: React.FC<Props> = (props: Props) => {
  return (
    <ImportSeedPhrase
      {...props}
      formName='import-seed-phrase-trust-form'
      mnemonicType='trust-wallet'
      phraseNumberOptions={[12]}
    />
  );
};

export default ImportSeedPhraseTrust;
