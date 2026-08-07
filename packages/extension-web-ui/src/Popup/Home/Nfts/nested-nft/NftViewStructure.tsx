// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { Layout, PageWrapper } from '@subwallet/extension-web-ui/components';
import { ROOT_NFT_TOKEN_ID } from '@subwallet/extension-web-ui/constants';
import { DataContext } from '@subwallet/extension-web-ui/contexts/DataContext';
import { useNavigateOnChangeAccount } from '@subwallet/extension-web-ui/hooks';
import useTranslation from '@subwallet/extension-web-ui/hooks/common/useTranslation';
import useDefaultNavigate from '@subwallet/extension-web-ui/hooks/router/useDefaultNavigate';
import { Theme, ThemeProps } from '@subwallet/extension-web-ui/types';
import { Icon, Image } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretDown, CaretRight, CheckCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { INftItemDetail } from '../utils';

type Props = ThemeProps;

type NftOutletContext = {
  setDetailTitle?: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  setShowSearchInput?: React.Dispatch<React.SetStateAction<boolean>>;
  nftCollections: NftCollection[];
  nftItems: NftItem[];
};

type TreeNodeProps = {
  item: NftItem;
  parent?: NftItem;
  selectedId: string;
  depth?: number;
  onClick: (item: NftItem) => void;
};

function findNftDeep (items: NftItem[], nftId: string, collectionId: string, chain?: string): NftItem | undefined {
  for (const item of items) {
    if (item.id === nftId && item.collectionId === collectionId && (!chain || item.chain === chain)) {
      return item;
    }

    const child = findNftDeep(item.nestingTokens || [], nftId, collectionId, chain);

    if (child) {
      return child;
    }
  }

  return undefined;
}

function countTotalNodes (node?: NftItem): number {
  if (!node) {
    return 0;
  }

  return 1 + (node.nestingTokens || []).reduce((total, child) => total + countTotalNodes(child), 0);
}

function TreeNode ({ depth = 0, item, onClick, parent, selectedId }: TreeNodeProps) {
  const { token } = useTheme() as Theme;
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = (item.nestingTokens?.length || 0) > 0;
  const isSelected = item.id === selectedId;

  const toggleExpand = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsExpanded((value) => !value);
  }, []);

  const handleClick = useCallback(() => {
    onClick(item);
  }, [item, onClick]);

  return (
    <div className='tree-node-wrapper'>
      <div className='node-content-row'>
        {depth > 0 && <div className='connector-line-horizontal' />}

        {depth > 0 && (
          <div
            className='expand-icon-wrapper'
            onClick={hasChildren ? toggleExpand : undefined}
          >
            {hasChildren
              ? <Icon
                customSize='16px'
                phosphorIcon={isExpanded ? CaretDown : CaretRight}
                />
              : <div className='dot-placeholder' />}
          </div>
        )}

        <div
          className={CN('nft-tree-card', { selected: isSelected })}
          onClick={handleClick}
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
              {depth === 0 ? t('ui.NFT.screen.nested.NftViewStructure.parent') : t('ui.NFT.screen.nested.NftViewStructure.nestedInParent', { replace: { parentId: parent?.name || parent?.id } })}
            </div>
          </div>

          {isSelected
            ? (
              <Icon
                iconColor={token.colorSuccess}
                phosphorIcon={CheckCircle}
                size='xs'
                weight='fill'
              />
            )
            : (
              hasChildren && <div className='badge-count'>{String(item.nestingTokens?.length || 0).padStart(2, '0')}</div>
            )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className='children-container'>
          <div className='vertical-line-guide' />
          {item.nestingTokens?.map((child) => (
            <TreeNode
              depth={depth + 1}
              item={child}
              key={`${child.chain}_${child.collectionId}_${child.id}`}
              onClick={onClick}
              parent={item}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const location = useLocation();
  const navigate = useNavigate();
  const dataContext = useContext(DataContext);
  const outletContext = useOutletContext<NftOutletContext>();
  const { t } = useTranslation();
  const { goBack } = useDefaultNavigate();
  const setDetailTitle = outletContext?.setDetailTitle;
  const setShowSearchInput = outletContext?.setShowSearchInput;
  const [rootTokenId] = useLocalStorage(ROOT_NFT_TOKEN_ID, '');
  const state = location.state as INftItemDetail | undefined;

  useNavigateOnChangeAccount('/home/nfts/collections');

  const collectionInfo = useMemo(() => {
    if (!state?.collectionId) {
      return undefined;
    }

    return outletContext.nftCollections?.find((item) => item.collectionId === state.collectionId && (!state.chain || item.chain === state.chain));
  }, [outletContext.nftCollections, state?.chain, state?.collectionId]);

  const rootNft = useMemo(() => {
    if (!rootTokenId || !collectionInfo) {
      return undefined;
    }

    return findNftDeep(outletContext.nftItems || [], rootTokenId, collectionInfo.collectionId, collectionInfo.chain);
  }, [collectionInfo, outletContext.nftItems, rootTokenId]);

  const totalCount = useMemo(() => countTotalNodes(rootNft), [rootNft]);

  const handleOnClickNft = useCallback((clickedItem: NftItem) => {
    if (!collectionInfo) {
      return;
    }

    navigate('/home/nfts/bundle-item-detail', {
      state: {
        chain: collectionInfo.chain,
        collectionId: collectionInfo.collectionId,
        nftId: clickedItem.id
      } as INftItemDetail
    });
  }, [collectionInfo, navigate]);

  useEffect(() => {
    setShowSearchInput?.(false);
    setDetailTitle?.(t('ui.NFT.screen.nested.NftViewStructure.nftStructureWithCount', { replace: { totalCount } }));
  }, [setDetailTitle, setShowSearchInput, t, totalCount]);

  return (
    <PageWrapper
      className={`nft-structure ${className}`}
      resolve={dataContext.awaitStores(['nft'])}
    >
      <Layout.Base
        onBack={goBack}
        showBackButton
      >
        <div className='tree-structure-container'>
          {rootNft
            ? (
              <TreeNode
                item={rootNft}
                onClick={handleOnClickNft}
                selectedId={state?.nftId || ''}
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

const NftViewStructure = styled(Component)<Props>(({ theme: { token } }: Props) => ({
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

  '.connector-line-horizontal': {
    width: 16,
    height: 1,
    backgroundColor: token.colorTextLight4,
    opacity: 0.3
  },

  '.expand-icon-wrapper': {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: token.colorTextLight3,
    cursor: 'pointer'
  },

  '.dot-placeholder': {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: token.colorTextLight4,
    opacity: 0.5
  },

  '.nft-tree-card': {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: token.sizeSM,
    minWidth: 0,
    padding: token.paddingSM,
    borderRadius: token.borderRadiusLG,
    backgroundColor: token.colorBgSecondary,
    cursor: 'pointer',

    '&.selected': {
      boxShadow: `inset 0 0 0 1px ${token.colorSuccess}`
    }
  },

  '.nft-info': {
    flex: 1,
    minWidth: 0
  },

  '.nft-title': {
    color: token.colorTextLight1,
    fontWeight: token.fontWeightStrong,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  '.nft-subtitle': {
    color: token.colorTextLight4,
    fontSize: token.fontSizeSM
  },

  '.badge-count': {
    minWidth: 28,
    padding: '2px 8px',
    borderRadius: 12,
    backgroundColor: token.colorBgElevated,
    color: token.colorTextLight3,
    textAlign: 'center',
    fontSize: token.fontSizeSM
  },

  '.empty-state': {
    color: token.colorTextLight4,
    textAlign: 'center',
    padding: token.paddingLG
  }
}));

export default NftViewStructure;
