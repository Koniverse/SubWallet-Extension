// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import useDefaultNavigate from '@subwallet/extension-koni-ui/hooks/router/useDefaultNavigate';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, Image } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretDown, CaretRight, CheckCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps;

interface LocationState {
  nftItem: NftItem;
  collectionInfo: any;
}

// Hàm tiện ích: Tìm NFT gốc (Root) bằng cách leo ngược lên parent
const findRootNft = (item: NftItem): NftItem => {
  let current = item;
  // Giới hạn loop để tránh treo nếu dữ liệu bị lỗi circular reference vô tận
  let safeGuard = 0;

  while (current.parent && safeGuard < 10) {
    current = current.parent;
    safeGuard++;
  }

  return current;
};

// ==========================================
// COMPONENT: TREE NODE (Đệ quy)
// ==========================================
interface TreeNodeProps {
  item: NftItem;
  selectedId: string;
  depth?: number;
  isLastChild?: boolean;
}

const TreeNode = ({ depth = 0, isLastChild = false, item, selectedId }: TreeNodeProps) => {
  const { token } = useTheme() as Theme;
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = item.nestingTokens && item.nestingTokens.length > 0;
  const isSelected = item.id === selectedId;
  const childrenCount = item.nestingTokens?.length || 0;

  // Toggle mở rộng/thu gọn
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={CN('tree-node-wrapper', { 'is-last-child': isLastChild })}>
      {/* 1. Phần hiển thị Card của Node hiện tại */}
      <div className='node-content-row'>
        {/* Đường kẻ ngang nối từ trục dọc vào Card (chỉ hiện với item con) */}
        {depth > 0 && <div className='connector-line-horizontal' />}

        {/* Nút toggle expand (chỉ hiện nếu có con) */}
        <div
          className='expand-icon-wrapper'
          onClick={hasChildren ? toggleExpand : undefined}
        >
          {hasChildren ? (
            <Icon
              iconColor={token.colorTextLight4}
              phosphorIcon={isExpanded ? CaretDown : CaretRight}
              size='sm'
            />
          ) : (
            // Nếu không có con thì hiển thị chấm tròn nhỏ hoặc khoảng trắng
            <div className='dot-placeholder' />
          )}
        </div>

        {/* NFT CARD */}
        <div className={CN('nft-tree-card', { selected: isSelected })}>
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
              {depth === 0 ? 'Parent' : 'Nested in parent'}
            </div>
          </div>

          {/* Badge hoặc Checkmark */}
          {isSelected
            ? (
              <Icon
                iconColor={token.colorSuccess}
                phosphorIcon={CheckCircle}
                size='md'
                weight='fill'
              />
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

      {/* 2. Phần render con (Đệ quy) */}
      {hasChildren && isExpanded && (
        <div className='children-container'>
          {/* Đường kẻ dọc nối các con với nhau */}
          <div className='vertical-line-guide' />

          {item.nestingTokens!.map((child, index) => (
            <TreeNode
              depth={depth + 1}
              isLastChild={index === item.nestingTokens!.length - 1}
              item={child}
              key={child.id}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// COMPONENT: MAIN SCREEN
// ==========================================
function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const location = useLocation();
  const state = location.state as LocationState;
  const { nftItem } = state || {}; // NFT đang được chọn ban đầu

  const { t } = useTranslation();
  const { goBack } = useDefaultNavigate();
  const dataContext = useContext(DataContext);
  const { token } = useTheme() as Theme;

  // Logic: Tìm ra Root của cây từ NFT hiện tại
  const rootNft = useMemo(() => {
    if (!nftItem) {
      return null;
    }

    return findRootNft(nftItem);
  }, [nftItem]);

  // Đếm tổng số lượng (Optional)
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

  return (
    <PageWrapper
      className={`${className}`}
      resolve={dataContext.awaitStores(['nft'])}
    >
      <Layout.Base
        onBack={goBack}
        showBackButton={true}
        showSubHeader={true}
        subHeaderBackground={'transparent'}
        subHeaderCenter={true}
        subHeaderPaddingVertical={true}
        title={`${t('NFT Structure')} (${totalCount})`} // Hiển thị số lượng
      >
        <div className='tree-structure-container'>
          {rootNft
            ? (
              <TreeNode
                depth={0}
                item={rootNft}
                selectedId={nftItem?.id || ''}
              />
            )
            : (
              <div className='empty-state'>{t('No structure data found')}</div>
            )}
        </div>
      </Layout.Base>
    </PageWrapper>
  );
}

// ==========================================
// STYLES
// ==========================================
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
      marginBottom: 8, // Khoảng cách giữa các row
      position: 'relative',
      zIndex: 2
    },

    // --- Line Styles (Vẽ đường kẻ) ---
    '.children-container': {
      paddingLeft: 24, // Thụt đầu dòng cho cấp con
      position: 'relative'
    },

    '.vertical-line-guide': {
      position: 'absolute',
      left: 11, // Căn giữa icon mở rộng (khoảng 24px/2)
      top: 0,
      bottom: 16, // Không kéo dài hết xuống dưới cùng
      width: 1,
      backgroundColor: token.colorTextLight4,
      opacity: 0.3,
      zIndex: 1
    },

    '.connector-line-horizontal': {
      position: 'absolute',
      left: -13, // Nối từ đường dọc cha vào
      width: 12,
      height: 1,
      backgroundColor: token.colorTextLight4,
      opacity: 0.3,
      top: '50%'
    },

    // Ẩn đường dọc thừa ở item cuối cùng trong nhóm
    '.is-last-child > .node-content-row .connector-line-vertical-overlay': {
      // Logic xử lý đường line ở item cuối phức tạp,
      // ở đây dùng position absolute của vertical-line-guide trong children-container sẽ dễ hơn.
    },

    // --- Expand Icon ---
    '.expand-icon-wrapper': {
      width: 24,
      height: 24,
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

    // --- Card Styles ---
    '.nft-tree-card': {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      backgroundColor: token.colorBgSecondary,
      borderRadius: 12, // Bo tròn nhiều hơn
      border: '1px solid transparent',
      transition: 'all 0.2s ease',
      cursor: 'default',

      '&:hover': {
        backgroundColor: token.colorBgInput // Sáng hơn xíu khi hover
      },

      '&.selected': {
        borderColor: token.colorSuccess, // Viền xanh lá
        backgroundColor: token.colorBgSecondary // Giữ nền tối
      }
    },

    '.nft-thumb': {
      borderRadius: 8,
      marginRight: 12,
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
      textOverflow: 'ellipsis'
    },

    '.nft-subtitle': {
      color: token.colorTextLight4,
      fontSize: token.fontSizeSM,
      marginTop: 2
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
