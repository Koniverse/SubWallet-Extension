// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { _isCustomAsset, _isSmartContractToken } from '@subwallet/extension-base/services/chain-service/utils';
import { EmptyList, Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { SHOW_3D_MODELS_CHAIN } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useGetNftByAccount, useNavigateOnChangeAccount, useSelector } from '@subwallet/extension-koni-ui/hooks';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import useConfirmModal from '@subwallet/extension-koni-ui/hooks/modal/useConfirmModal';
import useDefaultNavigate from '@subwallet/extension-koni-ui/hooks/router/useDefaultNavigate';
import useGetChainAssetInfo from '@subwallet/extension-koni-ui/hooks/screen/common/useGetChainAssetInfo';
import { deleteCustomAssets, getFullNftList } from '@subwallet/extension-koni-ui/messaging';
import { NftGalleryWrapper } from '@subwallet/extension-koni-ui/Popup/Home/Nfts/component/NftGalleryWrapper';
import { INftItemDetail } from '@subwallet/extension-koni-ui/Popup/Home/Nfts/utils';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ButtonProps, Icon, SwList } from '@subwallet/react-ui';
import CN from 'classnames';
import { Image, Trash } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps

const subHeaderRightButton = <Icon
  customSize={'24px'}
  phosphorIcon={Trash}
  type='phosphor'
  weight={'light'}
/>;

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

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const [searchParams] = useSearchParams();
  const chain = searchParams.get('chain');
  const collectionId = searchParams.get('collectionId');
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goBack } = useDefaultNavigate();
  const showNotification = useNotification();

  const dataContext = useContext(DataContext);
  const [isFetching, setIsFetching] = useState(false);

  const { nftCollections, nftItems } = useGetNftByAccount();

  nftItems.push(nftItemsFake);
  const isExisted = nftCollections.some((collection) => {
    return collection.collectionId === fakeCollection.collectionId;
  });

  if (!isExisted) {
    nftCollections.push(fakeCollection);
  }
  // const nftItems = [...nftItems, nftItemsFake]

  useNavigateOnChangeAccount('/home/nfts/collections');

  const getNftsByCollection = useCallback((nftCollection: NftCollection) => {
    const nftList: NftItem[] = [];

    nftItems.forEach((nftItem) => {
      if (nftItem.collectionId === nftCollection.collectionId && nftItem.chain === nftCollection.chain) {
        nftList.push(nftItem);
      }
    });

    return nftList;
  }, [nftItems]);

  const collectionInfo = useMemo(() => {
    return (
      nftCollections?.find(
        (nftCollection) =>
          nftCollection.collectionId === collectionId && nftCollection.chain === chain
      )
    );
  }, [nftCollections, collectionId, chain]);

  const nftList = useMemo(() => {
    return collectionInfo ? getNftsByCollection(collectionInfo) : [];
  }, [collectionInfo, getNftsByCollection]);

  const ownerAddresses = useMemo(() => {
    const ownerSet = new Set<string>();

    for (const item of nftList) {
      if (item.owner) {
        ownerSet.add(item.owner);
      }
    }

    return Array.from(ownerSet);
  }, [nftList]);

  const originAssetInfo = useGetChainAssetInfo(collectionInfo?.originAsset);

  const { handleSimpleConfirmModal } = useConfirmModal({
    title: t<string>('ui.NFT.screen.NftsCollectionDetail.deleteNft'),
    maskClosable: true,
    closable: true,
    type: 'error',
    subTitle: t<string>('ui.NFT.screen.NftsCollectionDetail.aboutToDeleteNftCollection'),
    content: t<string>('ui.NFT.screen.NftsCollectionDetail.confirmDeleteNftCollection'),
    okText: t<string>('ui.NFT.screen.NftsCollectionDetail.remove')
  });

  const searchNft = useCallback((nftItem: NftItem, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();

    return (
      nftItem.name?.toLowerCase().includes(searchTextLowerCase) ||
      nftItem.id.toLowerCase().includes(searchTextLowerCase)
    );
  }, []);

  const handleOnClickNft = useCallback((state: INftItemDetail) => {
    const { chain, collectionId } = state.collectionInfo;
    const tokenId = state.nftItem.id;
    const isBundle = state.nftItem?.isBundle;

    const base = `/home/nfts/${isBundle ? 'bundle-item-detail' : 'item-detail'}`;
    const url = `${base}?chain=${chain}&collectionId=${collectionId}&tokenId=${tokenId}`;

    navigate(url, { state: { ...state, nftList } });
  }, [navigate, nftList]);

  const renderNft = useCallback((nftItem: NftItem) => {
    const routingParams = { collectionInfo, nftItem } as INftItemDetail;

    return (
      <NftGalleryWrapper
        fallbackImage={collectionInfo?.image}
        handleOnClick={handleOnClickNft}
        have3dViewer={SHOW_3D_MODELS_CHAIN.includes(nftItem.chain)}
        image={nftItem.image}
        isBundle={nftItem?.isBundle}
        key={`${nftItem.chain}_${nftItem.collectionId}_${nftItem.id}`}
        routingParams={routingParams}
        title={nftItem.name || nftItem.id}
      />
    );
  }, [collectionInfo, handleOnClickNft]);

  const onBack = useCallback(() => {
    navigate('/home/tokens', { state: { from: 'nfts' } });
  }, [navigate]);

  const emptyNft = useCallback(() => {
    return (
      <EmptyList
        emptyMessage={t('ui.NFT.screen.NftsCollectionDetail.yourNftCollectibleWillAppearHere')}
        emptyTitle={t('ui.NFT.screen.NftsCollectionDetail.noNftCollectible')}
        phosphorIcon={Image}
      />
    );
  }, [t]);

  const handleDeleteNftCollection = useCallback(() => {
    handleSimpleConfirmModal().then(() => {
      if (collectionInfo?.originAsset) {
        deleteCustomAssets(collectionInfo?.originAsset)
          .then((result) => {
            if (result) {
              goBack();
              showNotification({
                message: t('ui.NFT.screen.NftsCollectionDetail.deletedNftCollectionSuccessfully')
              });
            } else {
              showNotification({
                message: t('ui.NFT.screen.NftsCollectionDetail.deletedNftCollectionUnsuccessfully')
              });
            }
          })
          .catch(console.log);
      }
    }).catch(console.log);
  }, [collectionInfo?.originAsset, goBack, handleSimpleConfirmModal, showNotification, t]);

  const subHeaderButton: ButtonProps[] = [
    {
      icon: subHeaderRightButton,
      onClick: handleDeleteNftCollection,
      disabled: !(originAssetInfo && _isSmartContractToken(originAssetInfo) && _isCustomAsset(originAssetInfo.slug))
    }
  ];

  useEffect(() => {
    let isMounted = true;

    if (!collectionInfo || isFetching) {
      return;
    }

    const chainInfo = chainInfoMap[collectionInfo?.chain];

    if (!chainInfo || ownerAddresses.length === 0) {
      return;
    }

    setIsFetching(true);
    getFullNftList({ contractAddress: collectionInfo?.collectionId, owners: ownerAddresses, chainInfo: chainInfo })
      .catch(console.error)
      .finally(() => {
        if (isMounted) {
          setIsFetching(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [chainInfoMap, collectionInfo, isFetching, nftList.length, ownerAddresses]);

  return (
    <PageWrapper
      className={`${className}`}
      resolve={dataContext.awaitStores(['nft'])}
    >
      <Layout.Base
        onBack={onBack}
        showBackButton={true}
        showSubHeader={true}
        subHeaderBackground={'transparent'}
        subHeaderCenter={false}
        subHeaderIcons={subHeaderButton}
        subHeaderPaddingVertical={true}
        title={(
          <div className={CN('header-content')}>
            <div className={CN('collection-name')}>
              {collectionInfo?.collectionName || collectionInfo?.collectionId}
            </div>
            <div className={CN('collection-count')}>
              &nbsp;({nftList.length})
            </div>
          </div>
        )}
      >
        <SwList.Section
          className={CN('nft_item_list__container')}
          displayGrid={true}
          enableSearchInput={true}
          gridGap={'14px'}
          list={nftList}
          minColumnWidth={'160px'}
          renderItem={renderNft}
          renderOnScroll={true}
          renderWhenEmpty={emptyNft}
          searchFunction={searchNft}
          searchMinCharactersCount={2}
          searchPlaceholder={t<string>('ui.NFT.screen.NftsCollectionDetail.searchNftNameOrId')}
        />
      </Layout.Base>
    </PageWrapper>
  );
}

const NftCollectionDetail = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    color: token.colorTextLight1,
    fontSize: token.fontSizeLG,

    '.ant-sw-sub-header-container': {
      paddingBottom: token.paddingXS,
      paddingTop: token.paddingXS,
      minHeight: 56,
      marginBottom: token.marginXS
    },

    '.header-content': {
      color: token.colorTextBase,
      fontWeight: token.fontWeightStrong,
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden'
    },

    '.collection-name': {
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },

    '.nft_item_list__container': {
      flex: 1,
      height: '100%',

      '.ant-sw-list': {
        paddingBottom: 1,
        marginBottom: -1
      }
    },

    '&__inner': {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  });
});

export default NftCollectionDetail;
