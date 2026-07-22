// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { Layout, PageWrapper } from '@subwallet/extension-web-ui/components';
import { BaseModal } from '@subwallet/extension-web-ui/components/Modal/BaseModal';
import { DEFAULT_NFT_PARAMS, NFT_TRANSACTION, ROOT_NFT_TOKEN_ID, TRANSFER_NFT_MODAL } from '@subwallet/extension-web-ui/constants';
import { DataContext } from '@subwallet/extension-web-ui/contexts/DataContext';
import { useNavigateOnChangeAccount } from '@subwallet/extension-web-ui/hooks';
import useNotification from '@subwallet/extension-web-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-web-ui/hooks/common/useTranslation';
import useDefaultNavigate from '@subwallet/extension-web-ui/hooks/router/useDefaultNavigate';
import useGetChainInfo from '@subwallet/extension-web-ui/hooks/screen/common/useFetchChainInfo';
import useGetAccountInfoByAddress from '@subwallet/extension-web-ui/hooks/screen/common/useGetAccountInfoByAddress';
import Transaction from '@subwallet/extension-web-ui/Popup/Transaction/Transaction';
import SendNFT from '@subwallet/extension-web-ui/Popup/Transaction/variants/SendNFT';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { SendNftParams, Theme, ThemeProps } from '@subwallet/extension-web-ui/types';
import { getTransactionFromAccountProxyValue } from '@subwallet/extension-web-ui/utils';
import reformatAddress from '@subwallet/extension-web-ui/utils/account/reformatAddress';
import { Button, Field, Icon, Image, Logo, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { GitFork, PaperPlaneTilt } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { INftItemDetail } from '../utils';

type Props = ThemeProps;

type ComponentProps = Props & {
  collectionInfo: NftCollection;
  nftItem: NftItem;
  originChainInfo: _ChainInfo;
};

type NftOutletContext = {
  setDetailTitle?: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  setShowSearchInput?: React.Dispatch<React.SetStateAction<boolean>>;
  nftCollections: NftCollection[];
  nftItems: NftItem[];
};

const modalId = TRANSFER_NFT_MODAL;
const NFT_DESCRIPTION_MAX_LENGTH = 140;

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

const shortAddress = (address?: string) => address ? `${address.slice(0, 6)}...${address.slice(-6)}` : '';

function Component ({ className = '', collectionInfo, nftItem, originChainInfo }: ComponentProps): React.ReactElement<ComponentProps> {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goBack } = useDefaultNavigate();
  const notify = useNotification();
  const { extendToken } = useTheme() as Theme;
  const ownerAccountInfo = useGetAccountInfoByAddress(nftItem.owner || '');
  const { accounts, currentAccountProxy } = useSelector((root: RootState) => root.accountState);
  const { activeModal, addExclude, checkActive, inactiveModal, removeExclude } = useContext(ModalContext);
  const [, setStorage] = useLocalStorage<SendNftParams>(NFT_TRANSACTION, DEFAULT_NFT_PARAMS);
  const [sendNftKey, setSendNftKey] = useState('send-nft-bundle');
  const isSendNftModalActive = checkActive(modalId);

  const imageUrl = nftItem.image || collectionInfo.image || extendToken.defaultImagePlaceholder;
  const isNestedChild = (nftItem.nestingLevel ?? 0) > 0;

  const ownerInfo = useMemo(() => {
    if (!nftItem.owner) {
      return '';
    }

    return ownerAccountInfo?.name ? `${ownerAccountInfo.name} (${shortAddress(nftItem.owner)})` : shortAddress(nftItem.owner);
  }, [nftItem.owner, ownerAccountInfo?.name]);

  const onClickSend = useCallback(() => {
    if (isNestedChild) {
      return;
    }

    if (nftItem.owner) {
      const ownerAddress = reformatAddress(nftItem.owner, 42);
      const owner = accounts.find((a) => a.address === ownerAddress);

      if (owner?.isReadOnly) {
        notify({
          message: t('ui.NFT.screen.NftsItemDetail.nftOwnerIsWatchOnly'),
          type: 'info',
          duration: 3
        });

        return;
      }
    }

    setStorage({
      asset: '',
      collectionId: nftItem.collectionId,
      from: nftItem.owner,
      itemId: nftItem.id,
      to: '',
      chain: nftItem.chain,
      fromAccountProxy: getTransactionFromAccountProxyValue(currentAccountProxy)
    });

    activeModal(modalId);
  }, [accounts, activeModal, currentAccountProxy, isNestedChild, nftItem, notify, setStorage, t]);

  const handleCancelModal = useCallback(() => {
    inactiveModal(modalId);
    setSendNftKey(`send-nft-bundle-${Date.now()}`);
  }, [inactiveModal]);

  const openStructure = useCallback(() => {
    navigate('/home/nfts/view-structure', {
      state: {
        chain: collectionInfo.chain,
        collectionId: collectionInfo.collectionId,
        nftId: nftItem.id
      } as INftItemDetail
    });
  }, [collectionInfo.chain, collectionInfo.collectionId, navigate, nftItem.id]);

  const openChild = useCallback((child: NftItem) => {
    return () => {
      navigate('/home/nfts/bundle-item-detail', {
        state: {
          chain: collectionInfo.chain,
          collectionId: collectionInfo.collectionId,
          nftId: child.id
        } as INftItemDetail
      });
    };
  }, [collectionInfo.chain, collectionInfo.collectionId, navigate]);

  useEffect(() => {
    addExclude(modalId);

    return () => {
      removeExclude(modalId);
    };
  }, [addExclude, removeExclude]);

  return (
    <Layout.Base
      onBack={goBack}
      showBackButton
    >
      <div className={CN(className, 'nft-bundle-detail')}>
        <div className='__media'>
          <Image
            height={384}
            src={imageUrl}
          />

          {nftItem.nestingLevel !== undefined && (
            <div className='__level'>{t('ui.NFT.screen.nested.NftBundleItemDetail.level', { replace: { nestingLevel: nftItem.nestingLevel } })}</div>
          )}

          <Button
            block
            disabled={isNestedChild}
            icon={<Icon phosphorIcon={PaperPlaneTilt} weight='fill' />}
            onClick={onClickSend}
          >
            {t('ui.NFT.screen.NftsItemDetail.send')}
          </Button>
        </div>

        <div className='__content'>
          {!!nftItem.description && (
            <div className='__description'>
              {nftItem.description.length > NFT_DESCRIPTION_MAX_LENGTH ? `${nftItem.description.slice(0, NFT_DESCRIPTION_MAX_LENGTH)}...` : nftItem.description}
            </div>
          )}

          <div className='__fields'>
            <Field
              content={collectionInfo.collectionName || collectionInfo.collectionId}
              label={t('ui.NFT.screen.nested.NftBundleItemDetail.nftCollectionName')}
            />
            <Field
              content={ownerInfo}
              label={t('ui.NFT.screen.nested.NftBundleItemDetail.ownedBy')}
            />
            <Field
              content={originChainInfo.name}
              label={t('ui.NFT.screen.nested.NftBundleItemDetail.network')}
              prefix={<Logo network={originChainInfo.slug} shape='circle' size={20} />}
            />
            <Field
              content={nftItem.id}
              label={t('ui.NFT.screen.nested.NftBundleItemDetail.nftId')}
            />
            <Field
              content={nftItem.collectionId}
              label={t('ui.NFT.screen.nested.NftBundleItemDetail.collectionId')}
            />
          </div>

          {!!nftItem.nestingTokens?.length && (
            <div className='__children'>
              <div className='__section-title'>
                {t('ui.NFT.screen.nested.NftBundleItemDetail.childNfts', { replace: { childNumber: nftItem.nestingTokens.length } })}
              </div>

              {nftItem.nestingTokens.map((child) => {
                const count = child.nestingTokens?.length || 0;

                return (
                  <button
                    className='__child'
                    key={`${child.chain}_${child.collectionId}_${child.id}`}
                    onClick={openChild(child)}
                    type='button'
                  >
                    <Image
                      height={56}
                      shape='square'
                      src={child.image || imageUrl}
                      width={56}
                    />
                    <span className='__child-info'>
                      <span className='__child-name'>{child.name || child.id}</span>
                      <span className='__child-meta'>
                        {t('ui.NFT.screen.nested.NftBundleItemDetail.nestedIn', { replace: { name: nftItem.name || nftItem.id } })}
                        {`${count} ${count > 1 ? t('ui.NFT.screen.nested.NftBundleItemDetail.items') : t('ui.NFT.screen.nested.NftBundleItemDetail.item')}`}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <Button
            block
            icon={<Icon phosphorIcon={GitFork} weight='fill' />}
            onClick={openStructure}
          >
            {t('ui.NFT.screen.nested.NftBundleItemDetail.nftStructure')}
          </Button>
        </div>
      </div>

      <BaseModal
        destroyOnClose
        id={modalId}
        onCancel={handleCancelModal}
        title={t('ui.TRANSACTION.constant.transaction.transfer')}
      >
        {isSendNftModalActive && (
          <Transaction
            key={sendNftKey}
            modalContent
          >
            <SendNFT
              modalContent
              nftDetail={nftItem}
            />
          </Transaction>
        )}
      </BaseModal>
    </Layout.Base>
  );
}

function WrapperComponent (props: Props): React.ReactElement<Props> {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dataContext = useContext(DataContext);
  const outletContext = useOutletContext<NftOutletContext>();
  const setDetailTitle = outletContext?.setDetailTitle;
  const setShowSearchInput = outletContext?.setShowSearchInput;
  const [rootTokenId] = useLocalStorage(ROOT_NFT_TOKEN_ID, '');
  const state = location.state as INftItemDetail | undefined;

  useNavigateOnChangeAccount('/home/nfts/collections');

  const chain = state?.chain || searchParams.get('chain') || undefined;
  const collectionId = state?.collectionId || searchParams.get('collectionId') || '';
  const nftId = state?.nftId || searchParams.get('tokenId') || '';

  const collectionInfo = useMemo(() => {
    return outletContext.nftCollections?.find((item) => item.collectionId === collectionId && (!chain || item.chain === chain));
  }, [chain, collectionId, outletContext.nftCollections]);

  const rootNft = useMemo(() => {
    if (!rootTokenId || !collectionInfo) {
      return undefined;
    }

    return findNftDeep(outletContext.nftItems || [], rootTokenId, collectionInfo.collectionId, collectionInfo.chain);
  }, [collectionInfo, outletContext.nftItems, rootTokenId]);

  const nftItem = useMemo(() => {
    if (!collectionInfo || !nftId) {
      return undefined;
    }

    return findNftDeep(rootNft ? [rootNft] : outletContext.nftItems || [], nftId, collectionInfo.collectionId, collectionInfo.chain);
  }, [collectionInfo, nftId, outletContext.nftItems, rootNft]);

  const originChainInfo = useGetChainInfo(collectionInfo?.chain || '');

  useEffect(() => {
    setShowSearchInput?.(false);

    if (nftItem) {
      setDetailTitle?.(nftItem.name || nftItem.id);
    }
  }, [nftItem, setDetailTitle, setShowSearchInput]);

  useEffect(() => {
    if (!collectionInfo || !nftItem) {
      navigate('/home/nfts/collections');
    }
  }, [collectionInfo, navigate, nftItem]);

  const isEmptyInfo = !collectionInfo || !nftItem || !originChainInfo;

  return (
    <PageWrapper
      className={props.className || ''}
      resolve={dataContext.awaitStores(['nft', 'accountState', 'chainStore'])}
    >
      {!isEmptyInfo && (
        <Component
          {...props}
          collectionInfo={collectionInfo}
          nftItem={nftItem}
          originChainInfo={originChainInfo}
        />
      )}
    </PageWrapper>
  );
}

const NftBundleItemDetail = styled(WrapperComponent)<Props>(({ theme: { token } }: Props) => ({
  '.nft-bundle-detail': {
    display: 'grid',
    gridTemplateColumns: 'minmax(320px, 384px) minmax(0, 1fr)',
    gap: token.sizeLG,
    padding: token.padding,

    '@media (max-width: 767px)': {
      gridTemplateColumns: '1fr'
    }
  },

  '.__media': {
    display: 'flex',
    flexDirection: 'column',
    gap: token.sizeSM,
    position: 'relative'
  },

  '.__level': {
    position: 'absolute',
    top: 8,
    left: 8,
    padding: '2px 8px',
    borderRadius: 12,
    background: token.colorBgSecondary,
    color: token.colorTextLight2,
    fontSize: token.fontSizeSM
  },

  '.__content': {
    display: 'flex',
    flexDirection: 'column',
    gap: token.size
  },

  '.__description': {
    color: token.colorTextLight3,
    lineHeight: token.lineHeight
  },

  '.__fields': {
    display: 'flex',
    flexDirection: 'column',
    gap: token.sizeXS
  },

  '.__children': {
    display: 'flex',
    flexDirection: 'column',
    gap: token.sizeSM
  },

  '.__section-title': {
    color: token.colorTextLight1,
    fontWeight: token.fontWeightStrong
  },

  '.__child': {
    display: 'flex',
    alignItems: 'center',
    gap: token.sizeSM,
    padding: token.paddingSM,
    border: 0,
    borderRadius: token.borderRadiusLG,
    background: token.colorBgSecondary,
    color: 'inherit',
    cursor: 'pointer',
    textAlign: 'left'
  },

  '.__child-info': {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  },

  '.__child-name': {
    color: token.colorTextLight1,
    fontWeight: token.fontWeightStrong,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  '.__child-meta': {
    color: token.colorTextLight4,
    fontSize: token.fontSizeSM
  }
}));

export default NftBundleItemDetail;
