// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxyAvatar } from '@subwallet/extension-koni-ui/components';
import { useCoreCreateReformatAddress, useGetAccountByAddress, useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps, WrappedTransactionSigner } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { Context, useContext, useMemo } from 'react';
import styled, { ThemeContext } from 'styled-components';

type Props = ThemeProps & {
  signerItem: WrappedTransactionSigner;
  isSelected?: boolean;
  chainSlug: string;
  showUnselectIcon?: boolean;
  showCheckedIcon?: boolean;
  onClick?: VoidFunction;
};

function Component (props: Props): React.ReactElement<Props> {
  const { chainSlug, className, isSelected, onClick, showCheckedIcon = true, showUnselectIcon, signerItem } = props;
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const { t } = useTranslation();
  const accountInfo = useGetAccountByAddress(signerItem.address);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const getReformatAddress = useCoreCreateReformatAddress();
  const displayAddress = useMemo(
    () => {
      if (!accountInfo) {
        return signerItem.address;
      }

      const reformatted = getReformatAddress(accountInfo, chainInfoMap[chainSlug]);

      return reformatted || signerItem.address;
    },
    [accountInfo, chainInfoMap, chainSlug, signerItem.address, getReformatAddress]
  );

  const checkedIconNode = ((showUnselectIcon || isSelected) && (
    <div className='__checked-icon-wrapper'>
      <Icon
        iconColor={isSelected ? token.colorSuccess : token.colorTextLight4}
        phosphorIcon={CheckCircle}
        size='sm'
        weight='fill'
      />
    </div>
  ));

  const accountProxyTypeLabel = useMemo<string>(() => {
    if (signerItem.kind === 'signatory') {
      return t('ui.ACCOUNT.components.AccountProxy.SelectorItem.signatory');
    }

    if (signerItem.isProxiedAccount) {
      return t('ui.ACCOUNT.components.AccountProxy.SelectorItem.proxiedAccount');
    }

    if (signerItem.substrateProxyType) {
      return `${t('ui.ACCOUNT.components.AccountProxy.SelectorItem.proxyType')}: ${signerItem.substrateProxyType}`;
    }

    return '';
  }, [signerItem, t]);

  return (
    <div
      className={CN(className, {
        '-readonly': !showCheckedIcon
      })}
      key={signerItem.address}
      onClick={showCheckedIcon ? onClick : undefined}
    >
      <div className='__item-left-part'>
        <AccountProxyAvatar
          size={32}
          value={signerItem.proxyId || signerItem.address}
        />
      </div>
      <div className='__item-middle-part'>
        <div className='__item-identity-part'>
          <div className={CN('__item-name', {
            '-has-address': !!accountInfo?.name
          })}
          >
            {accountInfo?.name || toShort(displayAddress, 9, 9)}
          </div>
          {!!accountInfo?.name && <div className='__item-address'>
            ({toShort(signerItem.address, 4, 5)})
          </div>}
        </div>
        <div className={CN('__account-type', `-${signerItem.kind}`, {
          '-is-main': signerItem.isProxiedAccount
        })}
        >
          {accountProxyTypeLabel}
        </div>
      </div>
      <div className='__item-right-part'>
        {showCheckedIcon && checkedIconNode}
      </div>
    </div>
  );
}

const WrappedTransactionSignerSelectorItem = styled(Component)<Props>(({ theme }) => {
  const { token } = theme as Theme;

  return {
    background: token.colorBgSecondary,
    padding: token.paddingSM,
    paddingRight: token.paddingSM,
    borderRadius: token.borderRadiusLG,
    alignItems: 'center',
    display: 'flex',
    cursor: 'pointer',
    transition: `background ${token.motionDurationMid} ease-in-out`,
    gap: token.sizeSM,

    '.__item-middle-part': {
      flex: 1,
      textAlign: 'left',
      'white-space': 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'flex',
      flexDirection: 'column'
    },

    '.__item-identity-part': {
      display: 'flex',
      overflowX: 'hidden',
      'white-space': 'nowrap',
      gap: token.sizeXXS,
      flex: 1,
      alignItems: 'baseline'
    },

    '.__item-name': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight4,
      'white-space': 'nowrap',
      overflow: 'hidden',
      fontWeight: token.headingFontWeight,
      textOverflow: 'ellipsis',

      '&.-has-address': {
        color: token.colorTextLight1
      }
    },

    '.__item-address': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight4,
      fontWeight: token.headingFontWeight
    },

    '.__account-type': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: '#D92079',

      '&.-is-main': {
        color: '#86C338'
      },

      '&.-signatory': {
        color: token['geekblue-9']
      }

    },

    '.__item-right-part': {
      display: 'flex'
    },

    '.__item-chain-type-logos': {
      minHeight: 20
    },

    '.__checked-icon-wrapper': {
      display: 'flex',
      justifyContent: 'center',
      minWidth: 40,
      marginRight: -token.marginXS
    },

    '&:hover': {
      background: token.colorBgInput,
      '.__item-actions-overlay': {
        opacity: 0
      },
      '.-show-on-hover': {
        opacity: 1
      }
    },

    '&.-readonly': {
      cursor: 'default'
    }
  };
});

export default WrappedTransactionSignerSelectorItem;
