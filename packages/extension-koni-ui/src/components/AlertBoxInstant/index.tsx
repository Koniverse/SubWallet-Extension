// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AlertBox } from '@subwallet/extension-koni-ui/components';
import { FAQ_URL } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import React from 'react';

interface Props {
  type: 'new-address-format',
  className?: string,
}

const AlertBoxInstant: React.FC<Props> = (props: Props) => {
  const { className, type } = props;
  const { t } = useTranslation();

  if (type === 'new-address-format') {
    return (
      <AlertBox
        className={className}
        description={
          <>
            {t('This network has 2 address formats, a Legacy format and a New format that starts with 1. SubWallet automatically transforms Legacy formats into New one without affecting your transfer. ')}
            <a
              href={FAQ_URL}
              rel='noreferrer'
              style={{ textDecoration: 'underline' }}
              target={'_blank'}
            >Learn more</a>
          </>
        }
        title={t('New address format')}
        type={'info'}
      />
    );
  }

  return null;
};

export default AlertBoxInstant;
