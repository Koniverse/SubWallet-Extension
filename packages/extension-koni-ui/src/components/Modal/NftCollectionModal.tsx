// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { EmptyList } from '@subwallet/extension-koni-ui/components';
import Search from '@subwallet/extension-koni-ui/components/Search';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { INftCollectionDetail } from '@subwallet/extension-koni-ui/Popup/Home/Nfts';
import { NftGalleryWrapper } from '@subwallet/extension-koni-ui/Popup/Home/Nfts/component/NftGalleryWrapper';
import { AssetsTab } from '@subwallet/extension-koni-ui/Popup/Home/Tokens';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ButtonProps, Icon, SwList, SwModal } from '@subwallet/react-ui';
import { PlusCircle } from 'phosphor-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps & {
  id: string,
  onCancel: () => void,
  nftCollections: NftCollection[],
  nftItems: NftItem[]
}

function Component ({ className = '', id, nftCollections, nftItems, onCancel }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSearchText, setCurrentSearchText] = useState<string>('');

  // todo: auto clear search when closing modal, may need update reactUI swList component
  const handleSearch = useCallback((value: string) => {
    setCurrentSearchText(value);
  }, []);

  const emptyButtonProps = useMemo((): ButtonProps => {
    return {
      icon: (
        <Icon
          phosphorIcon={PlusCircle}
          weight='fill'
        />
      ),
      children: t('Import NFT'),
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
        emptyMessage={t('Click [+] on the top right corner to import your NFT')}
        emptyTitle={t('ui.NFT.screen.NftsCollections.noNftsFound')}
      />
    );
  }, [emptyButtonProps, t]);

  const getNftsByCollection = useCallback((nftCollection: NftCollection) => {
    const nftList: NftItem[] = [];

    nftItems.forEach((nftItem) => {
      if (nftItem.collectionId === nftCollection.collectionId && nftItem.chain === nftCollection.chain) {
        nftList.push(nftItem);
      }
    });

    return nftList;
  }, [nftItems]);

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
        className={'nft-gallery-wrapper'}
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

  const filteredNftCollections = useMemo(() => {
    return nftCollections.filter((collection) => {
      const searchTextLowerCase = currentSearchText.toLowerCase();

      return (
        collection.collectionName?.toLowerCase().includes(searchTextLowerCase) ||
        collection.collectionId.toLowerCase().includes(searchTextLowerCase)
      );
    });
  }, [currentSearchText, nftCollections]);

  const onPressCancel = useCallback(() => {
    setCurrentSearchText('');
    onCancel && onCancel();
  }, [onCancel]);

  return (
    <SwModal
      className={className}
      destroyOnClose={true}
      id={id}
      onCancel={onPressCancel}
      title={t('Select NFT Collections')}
    >
      <Search
        autoFocus={true}
        className={'__search-box'}
        onSearch={handleSearch}
        placeholder={t('Search collection name')}
        searchValue={currentSearchText}
      />
      <SwList
        className={('nft_collection_list__container __list-container')}
        displayGrid={true}
        enableSearchInput={true}
        gridGap={'14px'}
        list={filteredNftCollections}
        minColumnWidth={'160px'}
        renderItem={renderNftCollection}
        renderOnScroll={true}
        renderWhenEmpty={emptyNft}
        searchFunction={searchCollection}
        searchMinCharactersCount={2}
        searchPlaceholder={t<string>('ui.NFT.screen.NftsCollections.searchCollectionName')}
      />
    </SwModal>
  );
}

const NftCollectionModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-content': {
      height: '100vh'
    },

    '.ant-sw-modal-body': {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      paddingBottom: 0
    },

    '.ant-sw-list-section': {
      flex: 1
    },

    '.ant-sw-list-search-input': {
      paddingBottom: token.paddingXS
    },

    '.ant-sw-list': {
      paddingBottom: 0
    },

    '.__search-box': {
      marginBottom: token.marginXS
    },

    '.__list-container': {
      flex: 1
    }
  });
});

export default NftCollectionModal;
