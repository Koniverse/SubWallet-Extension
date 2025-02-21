// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertHexColorToRGBA, toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, Logo, Tag } from '@subwallet/react-ui';
import CN from 'classnames';
import { Copy, QrCode } from 'phosphor-react';
import React from 'react';
import styled from 'styled-components';

interface Props extends ThemeProps {
  onClick?: VoidFunction;
  tokenSlug: string;
  chainName: string;
  address: string;
  isNewFormat?: boolean;
  onClickCopyButton?: VoidFunction;
  onClickQrButton?: VoidFunction;
}

const Component = ({ address, chainName, className, isNewFormat, onClick, onClickCopyButton, onClickQrButton, tokenSlug }: Props) => {
  const { t } = useTranslation();

  const _onClickCopyButton: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement> = React.useCallback((event) => {
    event.stopPropagation();
    onClickCopyButton?.();
  }, [onClickCopyButton]);

  const _onClickQrButton: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement> = React.useCallback((event) => {
    event.stopPropagation();
    onClickQrButton?.();
  }, [onClickQrButton]);

  return (
    <div
      className={CN(className)}
      onClick={onClick}
    >
      <div className='__item-left-part'>
        <Logo
          network={tokenSlug.toLowerCase()}
          shape={'squircle'}
          size={40}
        />
      </div>
      <div className='__item-center-part'>
        <div className='__chain-name-wrapper'>
          <span>{chainName}</span>
          <div className={'__address-tag'}>
            <Tag
              bgType={'default'}
              className={CN(className, '__item-tag')}
              color={isNewFormat ? 'green' : 'yellow'}
            >
              {t(isNewFormat ? 'New' : 'Legacy')}
            </Tag>
          </div>
        </div>
        <div className='__address-format'>
          {toShort(address, 9, 9)}
        </div>
      </div>
      <div className='__item-right-part'>
        <Button
          icon={
            <Icon
              phosphorIcon={QrCode}
              size='sm'
            />
          }
          onClick={_onClickQrButton}
          size='xs'
          type='ghost'
        />
        <Button
          icon={
            <Icon
              phosphorIcon={Copy}
              size='sm'
            />
          }
          onClick={_onClickCopyButton}
          size='xs'
          type='ghost'
        />
      </div>
    </div>
  );
};

const AccountChainAddressWithStatusItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    backgroundColor: token.colorBgSecondary,
    borderRadius: token.borderRadiusLG,
    padding: token.paddingSM,
    cursor: 'pointer',
    gap: token.sizeXS,
    transition: `background ${token.motionDurationMid} ease-in-out`,
    alignItems: 'center',

    '.__item-center-part': {
      overflow: 'hidden',
      flex: 1
    },

    '.__address-tag': {
      alignItems: 'center',
      display: 'flex'
    },

    '&.ant-tag-default': {
      backgroundColor: convertHexColorToRGBA(token['gray-6'], 0.1)
    },

    '.__item-tag': {
      marginRight: 0,
      'white-space': 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minWidth: 39,
      padding: `2px ${token.paddingXS}px`,
      fontSize: token.fontSizeXS,
      fontWeight: 700,
      lineHeight: token.lineHeightXS
    },

    '.__chain-name-wrapper': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      color: token.colorTextLight1,
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis',
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: token.fontWeightStrong
    },

    '.__address-format': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextTertiary,
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis'
    },

    '&:hover': {
      background: token.colorBgInput
    }
  });
});

export default AccountChainAddressWithStatusItem;
