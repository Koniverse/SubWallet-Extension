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

export const nftItemsFake: NftItem = {
  id: 'nft-root-00',
  name: 'Space Station Alpha',
  chain: 'unique_network',
  collectionId: '3857',
  owner: '5CFh4qpiB5PxsQvPEs6dWAhzgAVLHZa8tZKxeE9XsHBg4n9t',
  image: 'https://robohash.org/station?set=set2&bg=set1',
  description: 'The main headquarters floating in space. (Level 0)',
  rarity: 'Legendary',
  isBundle: true,
  nestingLevel: 0,
  nestingTokens: [
    {
      // --- LEVEL 1 ---
      id: 'nft-level-01',
      name: 'Hangar Bay 7',
      chain: 'unique_network',
      collectionId: '3857',
      owner: '5CFh4qpiB5PxsQvPEs6dWAhzgAVLHZa8tZKxeE9XsHBg4n9t',
      image: 'https://robohash.org/hangar?set=set2&bg=set1',
      description: 'A secure area for starships. (Level 1)',
      isBundle: true,
      nestingLevel: 1,
      nestingTokens: [
        {
          // --- LEVEL 2 ---
          id: 'nft-level-02',
          name: 'Starship "Voyager"',
          chain: 'unique_network',
          collectionId: '3857',
          owner: '5CFh4qpiB5PxsQvPEs6dWAhzgAVLHZa8tZKxeE9XsHBg4n9t',
          image: 'https://robohash.org/starship?set=set2&bg=set1',
          description: 'Interstellar travel vehicle. (Level 2)',
          rarity: 'Epic',
          isBundle: true,
          nestingLevel: 2,
          nestingTokens: [
            {
              // --- LEVEL 3 ---
              id: 'nft-level-03',
              name: 'Captain Koni',
              chain: 'unique_network',
              collectionId: '3857',
              owner: '5CFh4qpiB5PxsQvPEs6dWAhzgAVLHZa8tZKxeE9XsHBg4n9t',
              image: 'https://robohash.org/captain?set=set4&bg=set1',
              description: 'The pilot of the ship. (Level 3)',
              rarity: 'Rare',
              isBundle: true,
              nestingLevel: 3,
              nestingTokens: [
                {
                  // --- LEVEL 4 (Item 1) ---
                  id: 'nft-level-04-a',
                  name: 'Exo-Suit Mk.IV',
                  chain: 'unique_network',
                  collectionId: '3857',
                  owner: '5CFh4qpiB5PxsQvPEs6dWAhzgAVLHZa8tZKxeE9XsHBg4n9t',
                  image: 'https://robohash.org/suit?set=set2&bg=set1',
                  description: 'Heavy armor for the captain. (Level 4)',
                  isBundle: true,
                  nestingLevel: 4,
                  nestingTokens: [
                    {
                      // --- LEVEL 5 ---
                      id: 'nft-level-05',
                      name: 'Fusion Core Gem',
                      chain: 'unique_network',
                      collectionId: '3857',
                      owner: '5CFh4qpiB5PxsQvPEs6dWAhzgAVLHZa8tZKxeE9XsHBg4n9t',
                      image: 'https://robohash.org/gem?set=set2&bg=set1',
                      description: 'Power source for the suit. (Level 5)',
                      rarity: 'Mythic',
                      isBundle: false,
                      nestingLevel: 5,
                      nestingTokens: [] // Hết (Leaf node)
                    },
                    {
                      // --- LEVEL 5 ---
                      id: 'nft-level-05-1',
                      name: 'Fusion Core Gem Fusion Core Gem (2)',
                      chain: 'unique_network',
                      collectionId: '3857',
                      owner: '5CFh4qpiB5PxsQvPEs6dWAhzgAVLHZa8tZKxeE9XsHBg4n9t',
                      image: 'https://robohash.org/gem?set=set2&bg=set1',
                      description: 'Power source for the suit. (Level 5)',
                      rarity: 'Mythic',
                      isBundle: false,
                      nestingLevel: 5,
                      nestingTokens: [] // Hết (Leaf node)
                    }
                  ]
                },
                {
                  // --- LEVEL 4 (Item 2 - Sibling) ---
                  id: 'nft-level-04-b',
                  name: 'Plasma Rifle',
                  chain: 'unique_network',
                  collectionId: '3857',
                  owner: '5CFh4qpiB5PxsQvPEs6dWAhzgAVLHZa8tZKxeE9XsHBg4n9t',
                  image: 'https://robohash.org/gun?set=set2&bg=set1',
                  description: 'Standard issue weapon. (Level 4)',
                  isBundle: false,
                  nestingLevel: 4,
                  nestingTokens: []
                },
                {
                  // --- LEVEL 5 ---
                  id: 'nft-level-04-c',
                  name: 'Fusion Core Gem (3)',
                  chain: 'unique_network',
                  collectionId: '3857',
                  owner: '5CFh4qpiB5PxsQvPEs6dWAhzgAVLHZa8tZKxeE9XsHBg4n9t',
                  image: 'https://robohash.org/gem?set=set2&bg=set1',
                  description: 'Power source for the suit. (Level 5)',
                  rarity: 'Mythic',
                  isBundle: false,
                  nestingLevel: 4,
                  nestingTokens: [] // Hết (Leaf node)
                }
              ]
            }
          ]
        }
      ]
    },
    {
      // --- LEVEL 1 (Sibling) ---
      id: 'nft-level-01-b',
      name: 'Maintenance Droid',
      chain: 'unique_network',
      collectionId: '3857',
      owner: '5CFh4qpiB5PxsQvPEs6dWAhzgAVLHZa8tZKxeE9XsHBg4n9t',
      image: 'https://robohash.org/droid?set=set1&bg=set1',
      description: 'Nested directly in Station. (Level 1)',
      nestingLevel: 1,
      nestingTokens: []
    }
  ]
};

const fakeCollection = {
  collectionId: '3857',
  chain: 'unique_network',
  collectionName: 'The Duck Dynasty',
  image: 'https://robohash.org/droid?set=set1&bg=set1'
};

function Component ({ className = '', id }: Props): React.ReactElement<Props> {
  const { nftCollections, nftItems } = useGetNftByAccount();

  nftItems.push(nftItemsFake);
  const isExisted = nftCollections.some((collection) => {
    return collection.collectionId === fakeCollection.collectionId;
  });

  if (!isExisted) {
    nftCollections.push(fakeCollection);
  }

  // const nftItems = [...nftItems, nftItemsFake]
  // console.log('nftItems', nftItems);
  // console.log('nftCollections', nftCollections);

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
    navigate(`/home/nfts/collection-detail?chain=${state.collectionInfo.chain}&collectionId=${state.collectionInfo.collectionId}`);
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
