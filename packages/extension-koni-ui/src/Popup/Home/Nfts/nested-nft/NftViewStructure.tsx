// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { ROOT_NFT_TOKEN_ID } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useGetNftByAccount, useNavigateOnChangeAccount } from '@subwallet/extension-koni-ui/hooks';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import useDefaultNavigate from '@subwallet/extension-koni-ui/hooks/router/useDefaultNavigate';
import { INftItemDetail } from '@subwallet/extension-koni-ui/Popup/Home/Nfts';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, Image } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretDown, CaretRight, CheckCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps;

interface TreeNodeProps {
  item: NftItem;
  parent?: NftItem;
  selectedId: string;
  depth?: number;
  isLastChild?: boolean;
  onClick: (item: NftItem) => void;
}

const TreeNode = ({ depth = 0, isLastChild = false, item, onClick, parent, selectedId }: TreeNodeProps) => {
  const { token } = useTheme() as Theme;
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = item.nestingTokens && item.nestingTokens.length > 0;
  const isSelected = item.id === selectedId;
  const childrenCount = item.nestingTokens?.length || 0;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleItemClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(item);
  }, [item, onClick]);

  return (
    <div className={CN('tree-node-wrapper', { 'is-last-child': isLastChild })}>
      <div className='node-content-row'>
        {depth > 0 && <div className='connector-line-horizontal' />}

        {depth > 0 && <div
          className='expand-icon-wrapper'
          onClick={hasChildren ? toggleExpand : undefined}
        >
          {hasChildren
            ? (
              <Icon
                customSize={'16px'}
                phosphorIcon={isExpanded ? CaretDown : CaretRight}
              />
            )
            : (
              <div className='dot-placeholder' />
            )}
        </div>}

        <div
          className={CN('nft-tree-card', { selected: isSelected })}
          onClick={handleItemClick}
        >
          <Image
            className='nft-thumb'
            height={40}
            shape='square'
            src={item.image || ''}
            width={40}
          />

          <div className='nft-info'>
            <div className='nft-title'>{item.name || item.id}</div>
            <div className='nft-subtitle'>
              {depth === 0 ? t('ui.NFT.screen.nested.NftViewStructure.parent') : t('ui.NFT.screen.nested.NftViewStructure.nestedInParent', {replace: {parentId: parent?.name || parent?.id}})}
            </div>
          </div>

          {isSelected
            ? (
              <div className={'nft-info-icon'}>
                <Icon
                  iconColor={token.colorSuccess}
                  phosphorIcon={CheckCircle}
                  size='xs'
                  // customSize={'16px'}
                  weight='fill'
                />
              </div>
            )
            : (
              childrenCount > 0 && (
                <div className='badge-count'>
                  {childrenCount.toString().padStart(2, '0')}
                </div>
              )
            )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className='children-container'>
          <div className='vertical-line-guide' />

          {item.nestingTokens?.map((child, index) => (
            <TreeNode
              depth={depth + 1}
              isLastChild={index === ((item.nestingTokens?.length ?? 0) - 1)}
              item={child}
              key={child.id}
              onClick={onClick}
              parent={item}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const location = useLocation();
  const state = location.state as INftItemDetail & { rootTokenId?: string };
  const [rootTokenId] = useLocalStorage(ROOT_NFT_TOKEN_ID, '');

  useNavigateOnChangeAccount();

  const navigate = useNavigate();
  const { collectionInfo, nftItem } = state || {};

  const { t } = useTranslation();
  const { goBack } = useDefaultNavigate();
  const dataContext = useContext(DataContext);
  const { nftItems } = useGetNftByAccount();

  const rootNft = useMemo(() => {
    if (!rootTokenId || !nftItems.length) {
      return null;
    }

    return nftItems.find((n) =>
      n.id === rootTokenId &&
      n.collectionId === collectionInfo.collectionId &&
      n.chain === collectionInfo.chain
    );
  }, [rootTokenId, collectionInfo, nftItems]);

  const countTotalNodes = useCallback((node: NftItem): number => {
    let count = 1;

    if (node.nestingTokens) {
      node.nestingTokens.forEach((child) => {
        count += countTotalNodes(child);
      });
    }

    return count;
  }, []);

  const totalCount = useMemo(() => rootNft ? countTotalNodes(rootNft) : 0, [rootNft, countTotalNodes]);

  const handleOnClickNft = useCallback((clickedItem: NftItem) => {
    const { chain, collectionId } = collectionInfo;
    const tokenId = clickedItem.id;

    const base = '/home/nfts/bundle-item-detail';
    const url = `${base}?chain=${chain}&collectionId=${collectionId}&tokenId=${tokenId}`;

    navigate(url, {
      state: {
        nftItem: clickedItem,
        collectionInfo: collectionInfo
      }
    });
  }, [collectionInfo, navigate]);

  return (
    <PageWrapper
      className={`nft-structure ${className}`}
      resolve={dataContext.awaitStores(['nft'])}
    >
      <Layout.Base
        onBack={goBack}
        showBackButton={true}
        showSubHeader={true}
        subHeaderBackground={'transparent'}
        subHeaderCenter={true}
        subHeaderPaddingVertical={true}
        title={t('ui.NFT.screen.nested.NftViewStructure.nftStructureWithCount', {replace: {totalCount: totalCount}})}
      >
        <div className='tree-structure-container'>
          {rootNft
            ? (
              <TreeNode
                depth={0}
                item={rootNft}
                onClick={handleOnClickNft}
                selectedId={nftItem?.id || ''}
              />
            )
            : (
              <div className='empty-state'>{t('ui.NFT.screen.nested.NftViewStructure.noStructureDataFound')}</div>
            )}
        </div>
      </Layout.Base>
    </PageWrapper>
  );
}

const NftStructureScreen = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.tree-structure-container': {
      padding: token.padding,
      paddingBottom: token.paddingLG,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    },

    '.tree-node-wrapper': {
      position: 'relative'
    },

    '.node-content-row': {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 12,
      zIndex: 2
    },

    '.children-container': {
      paddingLeft: 24,
      position: 'relative'
    },

    '.vertical-line-guide': {
      position: 'absolute',
      left: 7,
      top: 0,
      bottom: 2,
      width: 1,
      backgroundColor: token.colorTextLight4,
      opacity: 0.3,
      zIndex: 1
    },

    '.nft-info-icon': {
      width: '40px',
      height: '40px',
      marginLeft: 12,
      marginRight: -10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    // '.connector-line-horizontal': {
    //   position: 'absolute',
    //   left: -13,
    //   width: 12,
    //   height: 1,
    //   backgroundColor: token.colorTextLight4,
    //   opacity: 0.3,
    //   top: '50%'
    // },

    '.is-last-child > .node-content-row .connector-line-vertical-overlay': {
    },

    '.expand-icon-wrapper': {
      width: 16,
      height: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      cursor: 'pointer',
      zIndex: 5
    },

    '.dot-placeholder': {
      width: 4,
      height: 4,
      borderRadius: '50%',
      backgroundColor: token.colorTextLight4
    },

    '.nft-tree-card': {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '8px 10px',
      backgroundColor: token.colorBgSecondary,
      borderRadius: 8,
      border: '1px solid transparent',
      transition: 'all 0.2s ease',
      cursor: 'default',
      overflow: 'hidden',

      '&:hover': {
        backgroundColor: token.colorBgInput
      },

      '&.selected': {
        borderColor: token.colorSuccess,
        backgroundColor: token.colorBgSecondary
      }
    },

    '.nft-thumb': {
      borderRadius: 8,
      marginRight: 8,
      objectFit: 'cover',

      '.ant-image-img': {
        borderRadius: 8
      }
    },

    '.nft-info': {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      overflow: 'hidden'
    },

    '.nft-title': {
      color: token.colorTextLight1,
      fontWeight: token.headingFontWeight,
      fontSize: token.fontSize,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: token.lineHeight
    },

    '.nft-subtitle': {
      color: token.colorTextLight4,
      fontSize: token.fontSizeSM,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      lineHeight: token.lineHeightSM
    },

    '.badge-count': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: '2px 8px',
      borderRadius: 10,
      fontSize: 11,
      fontWeight: 'bold',
      color: token.colorTextLight3
    },

    '.empty-state': {
      textAlign: 'center',
      color: token.colorTextLight4,
      marginTop: 32
    }
  });
});

export default NftStructureScreen;
