// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _DelegateInfo, _EnhancedReferendumInfo, _ReferendumInfo } from '@subwallet/extension-base/services/open-gov/type';
import { AccountAddressSelector, BasicInputEvent, ChainSelector, Layout } from '@subwallet/extension-koni-ui/components';
import { useGetNativeTokenSlug, useOpenGovSelection, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { fetchDelegates, fetchReferendums } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import DelegateTab from './Delegates';
import ReferendumTab from './Referendum';
import { calculateTimeLeft, govChainSupportItems } from './utils';

type Props = ThemeProps;

const Component: React.FC<Props> = ({ className }: Props) => {
  const { t } = useTranslation();
  const { isAllAccount } = useSelector((root) => root.accountState);
  const { accountAddressItems, selectedAddress, selectedChain, setSelectedAddress, setSelectedChain } = useOpenGovSelection();
  const [referendums, setReferendums] = useState<_EnhancedReferendumInfo[]>([]);
  const [delegates, setDelegates] = useState<_DelegateInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDelegateLoading, setIsDelegateLoading] = useState(true);
  const { assetRegistry } = useSelector((state) => state.assetRegistry);
  const nativeTokenSlug = useGetNativeTokenSlug(selectedChain);
  const [isReferendumTab, setIsReferendumTab] = useState(true);

  useEffect(() => {
    const loadReferendums = async () => {
      setIsLoading(true);

      try {
        const data = await fetchReferendums(selectedChain);
        const enhancedData = data.map((item: _ReferendumInfo) => ({
          ...item,
          endTime: calculateTimeLeft(
            item.state.indexer.blockTime,
            item.state.indexer.blockHeight,
            item.onchainData.info.alarm ? item.onchainData.info.alarm[0] : null,
            item.state.name
          ).endTime
        }));

        setReferendums(enhancedData);
      } catch (err) {
        setReferendums([]);
        console.error('Failed to load referendums:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReferendums().catch((err) => console.error('Failed to load referendums:', err));
  }, [selectedChain]);

  useEffect(() => {
    const loadDelegates = async () => {
      setIsDelegateLoading(true);

      try {
        const data = await fetchDelegates(selectedChain);

        setDelegates(data);
      } catch (err) {
        setDelegates([]);
        console.error('Failed to load delegates:', err);
      } finally {
        setIsDelegateLoading(false);
      }
    };

    loadDelegates().catch((err) => console.error('Failed to load delegates:', err));
  }, [selectedChain]);

  const onSelectAccount = useCallback((event: BasicInputEvent) => {
    setSelectedAddress(event.target.value);
  }, [setSelectedAddress]);

  const onSelectChain = useCallback((event: BasicInputEvent) => {
    setSelectedChain(event.target.value);
  }, [setSelectedChain]);

  const handleClickReferendum = useCallback(() => {
    setIsReferendumTab(true);
  }, []);

  const handleClickDelegate = useCallback(() => {
    setIsReferendumTab(false);
  }, []);

  const chainAsset = useMemo(() => {
    return assetRegistry[nativeTokenSlug];
  }, [assetRegistry, nativeTokenSlug]);

  const govSelectorsNode = (
    <>
      <ChainSelector
        className={'__gov-chain-selector'}
        items={govChainSupportItems}
        onChange={onSelectChain}
        title={t('Select chain')}
        value={selectedChain}
      />
      {(isAllAccount || accountAddressItems.length > 1) && (
        <AccountAddressSelector
          className={'__gov-address-selector'}
          items={accountAddressItems}
          onChange={onSelectAccount}
          value={selectedAddress}
        />
      )}
    </>
  );

  return (
    <Layout.Base
      className={CN(className)}
      showSubHeader={true}
      subHeaderBackground={'transparent'}
      subHeaderCenter={false}
      subHeaderPaddingVertical={true}
      title={t<string>('Vote')}
    >
      <>
        <div className={'__page-tool-area'}>{govSelectorsNode}</div>
        <div className='__page-tool-area'>
          <button onClick={handleClickReferendum}>
            {t('Referendums')}
          </button>
          <button onClick={handleClickDelegate}>
            {t('Delegates')}
          </button>
        </div>
        {isReferendumTab
          ? (
            <ReferendumTab
              chainAsset={chainAsset}
              className={'referendum-container'}
              isLoading={isLoading}
              referendums={referendums}
              selectedAddress={selectedAddress}
            />
          )
          : (
            <DelegateTab
              chainAsset={chainAsset}
              className={'delegate-container'}
              delegate={delegates}
              isLoading={isDelegateLoading}
              selectedAddress={selectedAddress}
            />
          )}
      </>
    </Layout.Base>
  );
};

const Governance = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '.__page-tool-area': {
      display: 'flex',
      padding: token.padding,
      paddingTop: 0,
      borderBottomLeftRadius: token.size,
      borderBottomRightRadius: token.size,
      backgroundColor: token.colorBgDefault,
      gap: token.sizeSM,
      position: 'relative',
      zIndex: 2,

      '.__gov-address-selector, .__gov-chain-selector': {
        height: 40,
        flex: 1,
        flexBasis: '50%',
        borderRadius: 32,
        overflow: 'hidden',

        '&:before': {
          display: 'none'
        },

        '.ant-select-modal-input-wrapper': {
          paddingLeft: token.padding,
          paddingRight: token.padding
        }
      },

      '.__gov-address-selector': {
        '.__selected-item-address': {
          display: 'none'
        },

        '.ant-field-container:before': {
          display: 'none'
        },

        '.ant-field-wrapper': {
          minHeight: 40,
          paddingTop: 0,
          paddingBottom: 0
        }
      }
    }
  };
});

export default Governance;
