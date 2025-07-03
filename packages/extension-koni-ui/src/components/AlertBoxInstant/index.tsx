// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AlertBox } from '@subwallet/extension-koni-ui/components';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import React from 'react';
import { Trans } from 'react-i18next';

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
            <Trans
              components={{
                highlight: (
                  <a
                    className='link'
                    href='https://docs.subwallet.app/main/extension-user-guide/faqs#the-transfer-confirmation-screen-displayed-a-different-recipient-address-than-the-address-i-entered'
                    rel='noopener noreferrer'
                    style={{ textDecoration: 'underline' }}
                    target='_blank'
                  />
                )
              }}
              i18nKey={('This network has 2 address formats. SubWallet automatically transforms Legacy formats into New format without affecting your transfer. <highlight>Learn more</highlight>')}
            />
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
