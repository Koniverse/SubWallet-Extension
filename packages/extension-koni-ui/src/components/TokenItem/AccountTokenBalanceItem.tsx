// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _BalanceMetadata, BitcoinBalanceMetadata } from '@subwallet/extension-base/background/KoniTypes';
import { _isChainBitcoinCompatible, _isChainTonCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { AccountProxyAvatar, InfoItemBase } from '@subwallet/extension-koni-ui/components';
import { useGetAccountByAddress, useGetChainPrefixBySlug, useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { BalanceItemWithAddressType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { reformatAddress, toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { ArrowSquareOut } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { MetaInfo } from '../MetaInfo';

interface Props extends ThemeProps {
  item: BalanceItemWithAddressType;
}

interface BalanceDisplayItem {
  label: string;
  value: string;
  key: string;
}

// todo: logic in this file may not be correct in some case, need to recheck
const Component: React.FC<Props> = (props: Props) => {
  const { className, item } = props;

  const { address, addressTypeLabel, free, locked, metadata, schema: _schema, tokenSlug } = item;

  const schema = _schema as InfoItemBase['valueColorSchema'];

  const { t } = useTranslation();
  const { assetRegistry } = useSelector((state) => state.assetRegistry);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const account = useGetAccountByAddress(address);

  const tokenInfo = useMemo((): _ChainAsset|undefined => assetRegistry[tokenSlug], [assetRegistry, tokenSlug]);
  const chainInfo = useMemo(() => {
    if (tokenInfo?.originChain === undefined) {
      return undefined;
    }

    return chainInfoMap[tokenInfo.originChain];
  }, [chainInfoMap, tokenInfo?.originChain]);

  const total = useMemo(() => new BigN(free).plus(locked).toString(), [free, locked]);
  const addressPrefix = useGetChainPrefixBySlug(tokenInfo?.originChain);

  const reformatedAddress = useMemo(() => {
    if (chainInfo && _isChainTonCompatible(chainInfo)) {
      return reformatAddress(address, chainInfo.isTestnet ? 0 : 1);
    }

    return reformatAddress(address, addressPrefix);
  }, [address, addressPrefix, chainInfo]);

  const name = useMemo(() => {
    return account?.name;
  }, [account?.name]);

  const openBlockExplorer = useCallback(
    (link: string) => {
      return () => {
        window.open(link, '_blank');
      };
    },
    []
  );

  const decimals = tokenInfo?.decimals || 0;
  const symbol = tokenInfo?.symbol || '';
  const link = (chainInfo !== undefined) && getExplorerLink(chainInfo, reformatedAddress, 'account');

  const isBitcoinMetadata = (meta: _BalanceMetadata | undefined): meta is BitcoinBalanceMetadata => {
    return !!meta && typeof meta === 'object' && 'runeBalance' in meta && 'inscriptionBalance' in meta;
  };

  const renderBalanceItem = useCallback(
    ({ key, label, value }: BalanceDisplayItem) => (
      <MetaInfo.Number
        className='balance-info'
        decimals={decimals}
        key={key}
        label={label}
        suffix={symbol}
        value={value}
        valueColorSchema='gray'
      />
    ),
    [decimals, symbol]
  );
  const isBitcoinChain = !!chainInfo && _isChainBitcoinCompatible(chainInfo);
  const balanceItems = useMemo<BalanceDisplayItem[]>(() => {
    if (isBitcoinChain && isBitcoinMetadata(metadata)) {
      return [
        { key: 'btc_transferable', label: t('BTC Transferable'), value: free },
        { key: 'btc_rune', label: t('BTC Rune (Locked)'), value: isBitcoinMetadata(metadata) ? String(metadata.runeBalance) : '0' },
        { key: 'btc_inscription', label: t('BTC Inscription (Locked)'), value: isBitcoinMetadata(metadata) ? String(metadata.inscriptionBalance) : '0' },
        { key: 'btc_total', label: t('Total'), value: total }
      ];
    }

    return [
      { key: 'transferable', label: t('Transferable'), value: free },
      { key: 'locked', label: t('Locked'), value: locked }
    ];
  }, [free, isBitcoinChain, locked, metadata, t, total]);

  return (
    <MetaInfo
      className={CN(className, 'account-token-detail', { '__show-button': !!link })}
      hasBackgroundWrapper={true}
      spaceSize='xxs'
    >
      {isBitcoinChain
        ? (
          <MetaInfo.Default
            className={'__quote-rate'}
            label={(
              <div className='account-info'>
                <AccountProxyAvatar
                  size={24}
                  value={account?.proxyId}
                />
                <div className='account-name-address ml-xs'>
                  {
                    name
                      ? (
                        <>
                          <span className='account-name'>{name}</span>
                          <span className='account-address'>&nbsp;({toShort(reformatedAddress, 4, 4)})</span>
                        </>
                      )
                      : (
                        <span className='account-name'>({toShort(reformatedAddress)})</span>
                      )
                  }
                </div>
              </div>
            )}
            valueColorSchema={schema ? `${schema}` : 'default'}
          >
            {addressTypeLabel}
          </MetaInfo.Default>
        )
        : (
          <MetaInfo.Number
            className='account-info'
            decimals={decimals}
            label={(
              <div className='account-info'>
                <AccountProxyAvatar
                  size={24}
                  value={account?.proxyId}
                />
                <div className='account-name-address ml-xs'>
                  {
                    name
                      ? (
                        <>
                          <span className='account-name'>{name}</span>
                          <span className='account-address'>&nbsp;({toShort(reformatedAddress, 4, 4)})</span>
                        </>
                      )
                      : (
                        <span className='account-name'>({toShort(reformatedAddress)})</span>
                      )
                  }
                </div>
              </div>
            )}
            suffix={symbol}
            value={total}
            valueColorSchema='light'
          />
        )}
      {balanceItems.map(renderBalanceItem)}
      {!!link && (
        <Button
          block
          className={'__explorer'}
          disabled={!link}
          icon={
            <Icon
              className={'__icon-button'}
              phosphorIcon={ArrowSquareOut}
            />
          }
          onClick={openBlockExplorer(link)}
          size={'xs'}
          type={'ghost'}
        >
          {t('View on explorer')}
        </Button>
      )}
    </MetaInfo>
  );
};

const AccountTokenBalanceItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '&.meta-info-block': {
      marginTop: token.marginXS,

      '&:first-child': {
        marginTop: 0
      }
    },

    '&.account-token-detail': {
      '.__col:first-child': {
        flex: 2
      },

      '.__row': {
        marginBottom: 0
      }
    },

    '.anticon.__icon-button': {
      height: 20,
      width: 20,
      fontSize: token.fontSizeXL
    },

    '&.__show-button.-has-background-wrapper': {
      paddingBottom: 6
    },
    '.__explorer.ant-btn-ghost': {
      color: token.colorTextTertiary
    },
    '.__explorer.ant-btn-ghost:hover': {
      color: token.colorWhite
    },
    '.__explorer': {
      marginTop: 6
    },
    '.account-info': {
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,

      '.account-name-address': {
        overflow: 'hidden',
        textWrap: 'nowrap',
        display: 'flex',
        flexDirection: 'row'
      },

      '.account-name': {
        color: token.colorText,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      },

      '.account-address': {
        color: token.colorTextTertiary
      },

      '.__value-col': {
        flex: '0 1 auto'
      },

      '.__label': {
        flex: '1',
        'white-space': 'nowrap'
      }
    },

    '.balance-info': {
      paddingLeft: token.paddingXL,

      '.__label': {
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        color: token.colorTextTertiary
      },

      '.__value': {
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM
      },
      '.__value-col': {
        flex: '0 1 auto'
      }
    }
  };
});

export default AccountTokenBalanceItem;
