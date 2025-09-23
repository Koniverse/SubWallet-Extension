// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { EmptyList, NftCollectionModal } from '@subwallet/extension-koni-ui/components';
import { useGetNftByAccount } from '@subwallet/extension-koni-ui/hooks';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { NftGalleryWrapper } from '@subwallet/extension-koni-ui/Popup/Home/Nfts/component/NftGalleryWrapper';
import { INftCollectionDetail } from '@subwallet/extension-koni-ui/Popup/Home/Nfts/utils';
import { AssetsTab } from '@subwallet/extension-koni-ui/Popup/Home/Tokens';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ButtonProps, Icon, ModalContext, SwList } from '@subwallet/react-ui';
import classNames from 'classnames';
import { PlusCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps & {
  id: string;
}

function Component ({ className = '', id }: Props): React.ReactElement<Props> {
  const { nftCollections, nftItems } = useGetNftByAccount();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const getNftsByCollection = useCallback((nftCollection: NftCollection) => {
    const nftList: NftItem[] = [];

    nftItems.forEach((nftItem) => {
      if (nftItem.collectionId === nftCollection.collectionId && nftItem.chain === nftCollection.chain) {
        nftList.push(nftItem);
      }
    });

    return nftList;
  }, [nftItems]);

  const onCloseNftModal = useCallback(() => {
    inactiveModal(id);
  }, [id, inactiveModal]);

  const emptyButtonProps = useMemo((): ButtonProps => {
    return {
      icon: (
        <Icon
          phosphorIcon={PlusCircle}
          weight='fill'
        />
      ),
      children: t('ui.NFT.screen.NftsCollections.importNFT'),
      shape: 'circle',
      size: 'xs',
      onClick: () => {
        navigate('/settings/tokens/import-nft', { state: { assetsTab: AssetsTab.NFTS } });
      }
    };
  }, [navigate, t]);

  const emptyNft = useCallback(() => {
    return (
      <EmptyList
        buttonProps={emptyButtonProps}
        className={'empty-nft-list'}
        emptyMessage={t('ui.NFT.screen.NftsCollections.clickToImportNFT')}
        emptyTitle={t('ui.NFT.screen.NftsCollections.noNftsFound')}
      />
    );
  }, [emptyButtonProps, t]);

  const handleOnClickCollection = useCallback((state: INftCollectionDetail) => {
    navigate('/home/nfts/collection-detail', { state });
  }, [navigate]);

  const renderNftCollection = useCallback((nftCollection: NftCollection) => {
    const nftList = getNftsByCollection(nftCollection);

    let fallbackImage: string | undefined;

    for (const nft of nftList) { // fallback to any nft image
      if (nft.image) {
        fallbackImage = nft.image;
        break;
      }
    }

    const state: INftCollectionDetail = { collectionInfo: nftCollection, nftList };

    return (
      <NftGalleryWrapper
        fallbackImage={fallbackImage}
        handleOnClick={handleOnClickCollection}
        image={nftCollection.image}
        itemCount={nftList.length}
        key={`${nftCollection.collectionId}_${nftCollection.chain}`}
        routingParams={state}
        title={nftCollection.collectionName || nftCollection.collectionId}
      />
    );
  }, [getNftsByCollection, handleOnClickCollection]);

  const searchCollection = useCallback((collection: NftCollection, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();

    return (
      collection.collectionName?.toLowerCase().includes(searchTextLowerCase) ||
      collection.collectionId.toLowerCase().includes(searchTextLowerCase)
    );
  }, []);

  return (
    <>
      <SwList
        className={classNames('nft_collection_list__container')}
        displayGrid={true}
        enableSearchInput={true}
        gridGap={'14px'}
        list={nftCollections}
        minColumnWidth={'160px'}
        renderItem={renderNftCollection}
        renderOnScroll={true}
        renderWhenEmpty={emptyNft}
        searchFunction={searchCollection}
        searchMinCharactersCount={2}
        searchPlaceholder={t<string>('ui.NFT.screen.NftsCollections.searchCollectionName')}
      />
      <NftCollectionModal
        id={id}
        nftCollections={nftCollections}
        nftItems={nftItems}
        onCancel={onCloseNftModal}
      />
    </>
  );
}

const NftCollectionList = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    color: token.colorTextLight1,
    fontSize: token.fontSizeLG,

    '.ant-sw-sub-header-container': {
      paddingBottom: token.paddingXS,
      paddingTop: token.paddingXS,
      minHeight: 56,
      marginBottom: token.marginXS
    },

    '&__inner': {
      display: 'flex',
      flexDirection: 'column'
    },

    '.nft_collection_list__container': {
      height: '100%',
      flex: 1,

      '.ant-sw-list': {
        paddingBottom: 1,
        marginBottom: -1
      }
    },

    '.nft-banner-wrapper': {
      paddingLeft: token.padding,
      paddingRight: token.padding,
      marginBottom: token.sizeXS
    }
  });
});

export default NftCollectionList;
