// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetworkGroup } from '@subwallet/extension-koni-ui/components/MetaInfo/parts';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, Logo } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowRight } from 'phosphor-react';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  chains: string[];
};

const Component: FC<Props> = (props: Props) => {
  const { chains, className } = props;
  const { t } = useTranslation();

  const isMode1 = chains.length < 6;

  return (
    <div
      className={CN(className, {
        '-mode-1': isMode1,
        '-mode-2': !isMode1
      })}
    >
      {
        isMode1
          ? chains.map((item, index) => (
            <React.Fragment key={index}>
              <Logo
                className={'__chain-logo'}
                network={item.toLowerCase()}
                shape={'circle'}
                size={16}
              />

              {
                (index !== chains.length - 1) && (
                  <Icon
                    className={'__separator-icon'}
                    customSize={'12px'}
                    phosphorIcon={ArrowRight}
                  />
                )
              }

            </React.Fragment>
          ))
          : (
            <>
              <NetworkGroup
                chains={chains}
                className={'__chain-logo-group'}
              />
              <div className='__steps-label'>
                {`${chains.length} ${t('steps')}`}
              </div>
            </>
          )
      }
    </div>
  );
};

export const TransactionProcessPreview = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    alignItems: 'center',

    '.__chain-logo': {
      '.ant-image, img': {
        display: 'block'
      }
    },

    '.__separator-icon': {
      paddingLeft: 2,
      paddingRight: 2
    },

    '&.-mode-2': {
      gap: token.sizeXS
    }
  });
});
