// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { Layout, MetaInfo, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { CAMERA_CONTROLS_MODEL_VIEWER_PROPS, DEFAULT_MODEL_VIEWER_PROPS, DEFAULT_NFT_PARAMS, NFT_TRANSACTION, ROOT_NFT_TOKEN_ID, SHOW_3D_MODELS_CHAIN } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useNavigateOnChangeAccount } from '@subwallet/extension-koni-ui/hooks';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import {useGetUniqueNftDetail, useGetUniqueNftParent} from '@subwallet/extension-koni-ui/hooks/nft';
import useDefaultNavigate from '@subwallet/extension-koni-ui/hooks/router/useDefaultNavigate';
import useGetChainInfo from '@subwallet/extension-koni-ui/hooks/screen/common/useFetchChainInfo';
import useGetAccountInfoByAddress from '@subwallet/extension-koni-ui/hooks/screen/common/useGetAccountInfoByAddress';
import { INftItemDetail } from '@subwallet/extension-koni-ui/Popup/Home/Nfts/utils';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { SendNftParams, Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getTransactionFromAccountProxyValue } from '@subwallet/extension-koni-ui/utils';
import reformatAddress from '@subwallet/extension-koni-ui/utils/account/reformatAddress';
import { BackgroundIcon, Button, ButtonProps, Icon, Image, ModalContext, SwModal } from '@subwallet/react-ui';
import { getAlphaColor } from '@subwallet/react-ui/lib/theme/themes/default/colorAlgorithm';
import CN from 'classnames';
import { CaretLeft, CaretRight, Info, PaperPlaneTilt, TreeStructure } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps

const NFT_DESCRIPTION_MAX_LENGTH = 30;

const modalCloseButton = <Icon
  customSize={'24px'}
  phosphorIcon={CaretLeft}
  type='phosphor'
  weight={'light'}
/>;

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const state = useLocation().state as INftItemDetail;
  const { collectionInfo, nftItem: _nftItem } = state;
  const parentNft = useGetUniqueNftParent(_nftItem);

  const { t } = useTranslation();
  const notify = useNotification();
  const [rootTokenId] = useLocalStorage(ROOT_NFT_TOKEN_ID, '');

  const navigate = useNavigate();
  const { goBack } = useDefaultNavigate();
  const { extendToken, token } = useTheme() as Theme;

  const dataContext = useContext(DataContext);
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { accounts, currentAccountProxy } = useSelector((root: RootState) => root.accountState);

  const originChainInfo = useGetChainInfo(_nftItem.chain);
  const ownerAccountInfo = useGetAccountInfoByAddress(_nftItem.owner || '');
  const accountExternalUrl = getExplorerLink(originChainInfo, _nftItem.owner, 'account');
  const [, setStorage] = useLocalStorage<SendNftParams>(NFT_TRANSACTION, DEFAULT_NFT_PARAMS);

  const { data: fullNftItemFromApi } = useGetUniqueNftDetail(_nftItem.chain, _nftItem.collectionId, _nftItem.id);


  const nftItem = useMemo((): NftItem => {
    if (!fullNftItemFromApi) {
      return {
        ..._nftItem,
        parent: parentNft
      };
    }

    return {
      ..._nftItem,
      parent: parentNft,
      name: fullNftItemFromApi.name || _nftItem.name,
      description: fullNftItemFromApi.description || _nftItem.description
    };
  }, [_nftItem, fullNftItemFromApi, parentNft]);

  useNavigateOnChangeAccount('/home/nfts/collections');

  const nftDetailImageUrl = useMemo(() => nftItem.image || collectionInfo.image || extendToken.defaultImagePlaceholder, [nftItem.image, collectionInfo.image, extendToken.defaultImagePlaceholder]);

  const finalRootTokenId = useMemo(() => rootTokenId || nftItem.id, [nftItem.id, rootTokenId]);

  const onClickSend = useCallback(() => {
    if (nftItem && nftItem.owner) {
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
    navigate('/transaction/send-nft');
  }, [accounts, currentAccountProxy, navigate, nftItem, notify, setStorage, t]);

  const onShowNFTStructure = useCallback(() => {
    const { chain, collectionId } = collectionInfo;

    navigate(`/nft-view-structure?chain=${chain}&collectionId=${collectionId}&rootTokenId=${finalRootTokenId}`, {
      state: {
        nftItem: nftItem,
        collectionInfo
      }
    });
  }, [collectionInfo, finalRootTokenId, navigate, nftItem]);

  const onGoToParentNFT = useCallback(() => {
    if (!nftItem.parent) {
      return;
    }

    navigate('/home/nfts/bundle-item-detail', {
      state: {
        nftItem: nftItem.parent,
        collectionInfo
      }
    });
  }, [nftItem.parent, navigate, collectionInfo]);

  const handleShowChild = useCallback(
    (childNft: NftItem, parentNft: NftItem) => () => {
      const newChildNft = { ...childNft, parent: parentNft };
      const { chain, collectionId } = collectionInfo;

      navigate(`/home/nfts/bundle-item-detail?chain=${chain}&collectionId=${collectionId}&tokenId=${childNft.id}&rootTokenId=${finalRootTokenId}`, {
        state: {
          nftItem: newChildNft,
          collectionInfo
        }
      });
    },
    [navigate, collectionInfo, finalRootTokenId]
  );

  const subHeaderRightButton: ButtonProps[] = [
    {
      children: t<string>('ui.NFT.screen.NftsItemDetail.send'),
      onClick: onClickSend,
      disabled: (nftItem.nestingLevel ?? 0) > 0
    }
  ];

  const handleClickExternalAccountInfo = useCallback(() => {
    try {
      // eslint-disable-next-line no-void
      void chrome.tabs.create({ url: accountExternalUrl, active: true }).then(() => console.log('redirecting'));
    } catch (e) {
      console.log('error redirecting to a new tab');
    }
  }, [accountExternalUrl]);

  const handleClickExternalCollectionInfo = useCallback(() => {
    try {
      // eslint-disable-next-line no-void
      void chrome.tabs.create({ url: nftItem.externalUrl, active: true }).then(() => console.log('redirecting'));
    } catch (e) {
      console.log('error redirecting to a new tab');
    }
  }, [nftItem.externalUrl]);

  const externalInfoIcon = useCallback((type: 'account' | 'collection') => {
    return (
      <div
        className={'nft_item_detail__external_icon'}
        onClick={type === 'account' ? handleClickExternalAccountInfo : handleClickExternalCollectionInfo}
      >
        <Icon
          customSize={'20px'}
          phosphorIcon={Info}
          type='phosphor'
          weight={'light'}
        />
      </div>
    );
  }, [handleClickExternalAccountInfo, handleClickExternalCollectionInfo]);

  const handleShowNftDescription = useCallback(() => {
    if (nftItem?.description && nftItem.description.length > NFT_DESCRIPTION_MAX_LENGTH) {
      activeModal('nftItemDescription');
    }
  }, [activeModal, nftItem.description]);

  const onCloseNftDescriptionModal = useCallback(() => {
    inactiveModal('nftItemDescription');
  }, [inactiveModal]);

  const onImageClick = useCallback(() => {
    if (nftItem.externalUrl) {
      chrome.tabs.create({ url: nftItem.externalUrl, active: true })
        .then(() => console.log('redirecting'))
        .catch(console.error);
    }
  }, [nftItem.externalUrl]);

  const goBackToNFTCollection = useCallback(() => {
    if (nftItem.parent) {
      navigate('/home/nfts/bundle-item-detail', {
        state: {
          nftItem: nftItem.parent,
          collectionInfo: collectionInfo
        }
      });

      return;
    }

    let targetUrl = '/home/nfts/collection-detail';

    if (collectionInfo.chain && collectionInfo.collectionId) {
      targetUrl = `/home/nfts/collection-detail?chain=${collectionInfo.chain}&collectionId=${collectionInfo.collectionId}`;
    }

    goBack(targetUrl, state);
  }, [collectionInfo, goBack, navigate, nftItem.parent, state]);

  const show3DModel = SHOW_3D_MODELS_CHAIN.includes(nftItem.chain);

  return (
    <PageWrapper
      className={`${className}`}
      resolve={dataContext.awaitStores(['nft', 'accountState', 'chainStore'])}
    >
      <Layout.Base
        onBack={goBackToNFTCollection}
        showBackButton={true}
        showSubHeader={true}
        subHeaderBackground={'transparent'}
        subHeaderCenter={false}
        subHeaderIcons={subHeaderRightButton}
        subHeaderPaddingVertical={true}
        title={nftItem.name || nftItem.id}
      >
        <div className={'nft_item_detail__container'}>
          <div className={'nft-item-img-wrapper'}>
            <div className={'nft_item_detail__nft_image'}>
              {nftItem.nestingLevel !== undefined && <div className='nft-item-level-label'>{t('Level {{nestingLevel}}', {replace: {nestingLevel: nftItem.nestingLevel}})}</div>}
              <Image
                className={CN({ clickable: nftItem.externalUrl })}
                height={358}
                modelViewerProps={show3DModel ? { ...DEFAULT_MODEL_VIEWER_PROPS, ...CAMERA_CONTROLS_MODEL_VIEWER_PROPS } : undefined}
                onClick={onImageClick}
                src={nftDetailImageUrl}
                width={ show3DModel ? 358 : undefined}
              />
            </div>
            <div className={'nft-item-img-footer'}>
              <div className={'nft-item-img-footer-line1-wrapper'}>
                <div className={'nft-item-img-footer-left'}>
                  <div className={'nft-item-img-footer-left-1'}>{nftItem.name}</div>
                  <div className={'nft-item-img-footer-left-2'}>{nftItem.isBundle ? 'Parent' : `Nested in: ${nftItem?.parent?.name || ''}`}</div>
                </div>
                <div className={'nft-item-img-footer-right'}>
                  <Button
                    icon={<Icon
                      customSize={'20px'}
                      iconColor={token.colorTextLabel}
                      phosphorIcon={TreeStructure}
                      type='phosphor'
                      weight={'fill'}
                    />}
                    onClick={onShowNFTStructure}
                    size={'small'}
                    type={'ghost'}
                  >
                  </Button>
                </div>
              </div>
              {!!nftItem?.nestingLevel && nftItem?.nestingLevel >= 1 && (
                <div className={'nft-item-img-footer-line2-wrapper'}>
                  <Button
                    block={true}
                    onClick={onGoToParentNFT}
                    schema={'secondary'}
                    size={'sm'}
                  >
                    {t('Go to Parent')}
                  </Button>
                </div>

              )}
            </div>
          </div>

          <div className={'nft-item-detail-section-label-1'}>{t<string>('ui.NFT.screen.NftsItemDetail.nftDetails')}</div>
          <MetaInfo
            hasBackgroundWrapper={true}
          >
            {
              nftItem.description && (
                <MetaInfo.Default
                  label={t('Description')}
                  valueAlign={'left'}
                >
                  <div
                    className={'nft_item_detail__description_container'}
                    onClick={handleShowNftDescription}
                    style={{ cursor: nftItem.description.length > NFT_DESCRIPTION_MAX_LENGTH ? 'pointer' : 'auto' }}
                  >
                    <div className='nft_item_detail__description_content_wrapper'>
                      <div className='nft_item_detail__description_content'>
                        {nftItem.description}
                      </div>
                      <Icon
                        customSize={'20px'}
                        phosphorIcon={Info}
                        type='phosphor'
                        weight={'light'}
                      />
                    </div>
                  </div>
                </MetaInfo.Default>
              )}
            <MetaInfo.Default label={t('NFT collection name')}>{collectionInfo.collectionName || collectionInfo.collectionId}</MetaInfo.Default>
            <MetaInfo.Default
              className={'nft-bundle-item-owned'}
              label={t('Owned by')}
            >
              <MetaInfo.Account
                address={ownerAccountInfo?.address || ''}
                name={ownerAccountInfo?.name}
              />
              <div className={'nft_item_detail__description'}>{externalInfoIcon('account')}</div>
            </MetaInfo.Default>
            <MetaInfo.Chain
              chain={originChainInfo.slug}
              label={t('Network')}
            />
            <MetaInfo.Default
              label={t('NFT ID')}
            >{nftItem.id}</MetaInfo.Default>
            <MetaInfo.Default
              label={t('Collection ID')}
            >
              {nftItem.collectionId}
            </MetaInfo.Default>
            {
              nftItem.properties &&
              Object.entries(nftItem.properties as Record<string, any>).map(([attName, attValueRaw], index) => {
                const attValue =
                  typeof attValueRaw === 'object' && attValueRaw !== null && 'value' in attValueRaw
                    ? String((attValueRaw as { value: string }).value)
                    : String(attValueRaw);

                return (
                  <MetaInfo.Default
                    key={index}
                    label={attName}
                  >
                    {attValue}
                  </MetaInfo.Default>
                );
              })
            }
          </MetaInfo>

          {!!nftItem?.nestingTokens?.length &&
            <>
              <div className={'nft-item-detail-section-label-2'}>{t<string>('Child NFTs ({{childNumber}})', { replace: { childNumber: nftItem?.nestingTokens?.length } })}</div>
              {nftItem?.nestingTokens.map((nestingItem, index) => (
                <div
                  className={'nft-child-item-wrapper'}
                  key={index}
                >
                  <div className={'nft-child-item-left'}>
                    <Image
                      className={CN({ clickable: nftItem.externalUrl })}
                      height={40}
                      modelViewerProps={show3DModel ? { ...DEFAULT_MODEL_VIEWER_PROPS, ...CAMERA_CONTROLS_MODEL_VIEWER_PROPS } : undefined}
                      onClick={onImageClick}
                      src={nestingItem.image || nftDetailImageUrl}
                      width={ show3DModel ? 40 : undefined}
                    />
                  </div>
                  <div className={'nft-child-item-right'}>
                    <div className={'nft-child-item-right-block-1'}>
                      <div className={'nft-child-item-right-block-1-line-1'}>{nestingItem.name}</div>
                      <div className={'nft-child-item-right-block-1-line-2'}>
                        <span className={'nft-child-item-right-block-1-label'}>{t('Nested in: {{name}} - }', {replace: {name: nftItem?.name || ''}})}</span>
                        <span className={'nft-child-item-right-block-1-value'}>{`${nestingItem?.nestingTokens?.length || 0} ${
                          (nestingItem?.nestingTokens?.length || 0) > 1 ? t('items') : t('item')
                        }`}</span>
                      </div>
                    </div>
                    <div className={'nft-child-item-right-block-2'}>
                      <Button
                        icon={<Icon
                          customSize={'20px'}
                          iconColor={token.colorTextLabel}
                          phosphorIcon={CaretRight}
                          type='phosphor'
                        />}
                        onClick={handleShowChild(nestingItem, nftItem)}
                        size={'small'}
                        type={'ghost'}
                      >
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          }

          <div className={'nft-bundle-item-footer'}>
            <Button
              block
              icon={<Icon
                phosphorIcon={TreeStructure}
                type='phosphor'
                weight={'fill'}
              />}
              onClick={onShowNFTStructure}
              schema={'secondary'}
            >
              <span className={'nft_item_detail__send_text'}>{t('NFT Structure')}</span>
            </Button>
            <Button
              block
              disabled={(nftItem.nestingLevel ?? 0) > 0}
              icon={<Icon
                phosphorIcon={PaperPlaneTilt}
                type='phosphor'
                weight={'fill'}
              />}
              onClick={onClickSend}
            >
              <span className={'nft_item_detail__send_text'}>{t('ui.NFT.screen.NftsItemDetail.send')}</span>
            </Button>
          </div>
        </div>

        <SwModal
          className={CN('nft_item_detail__description_modal')}
          closeIcon={modalCloseButton}
          id={'nftItemDescription'}
          onCancel={onCloseNftDescriptionModal}
          title={t<string>('ui.NFT.screen.NftsItemDetail.description')}
          wrapClassName={className}
        >
          <div className={'nft_item_detail__description_modal_content'}>
            <div className={'nft_item_detail__description_modal_left_icon'}>
              <BackgroundIcon
                backgroundColor={getAlphaColor(token.colorLink, 0.1)}
                iconColor={token.colorLink}
                phosphorIcon={Info}
                size={'lg'}
                type='phosphor'
                weight={'fill'}
              />
            </div>
            <div className={'nft_item_detail_description_modal_container'}>
              <div className={'nft_item_detail__description_modal_title'}>{nftItem.name || nftItem.id}</div>
              <div className={'nft_item_detail__description_modal_detail'}>
                <pre>{nftItem.description}</pre>
              </div>
            </div>
          </div>
        </SwModal>
      </Layout.Base>
    </PageWrapper>
  );
}

const NftBundleItemDetail = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.nft_item_detail__container': {
      marginTop: token.marginSM,
      paddingRight: token.margin,
      paddingLeft: token.margin,
      paddingBottom: token.margin
    },

    '.nft_item_detail__description_container': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG
    },

    '.nft-bundle-item-owned': {
      '.__value': {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        gap: '7px'
      }
    },

    '.nft-item-img-footer': {
      display: 'flex',
      justifyContent: 'space-between',
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: token.colorBgSecondary,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      flexDirection: 'column',
      '.nft-item-img-footer-left': {
        paddingLeft: token.padding,
        gap: 2,
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      },
      '.nft-item-img-footer-left-1': {
        fontSize: token.fontSizeLG,
        color: token.colorText,
        fontWeight: token.fontWeightStrong,
        lineHeight: token.lineHeightLG
      },

      '.nft-item-img-footer-left-2': {
        fontWeight: token.bodyFontWeight,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        color: token.colorTextTertiary
      }
    },

    '.nft-item-img-footer-right': {

    },

    '.nft_item_detail__description_title': {
      'white-space': 'nowrap',
      marginTop: token.margin,
      display: 'flex',
      alignItems: 'center',
      gap: token.marginXXS,
      color: token.colorTextLabel,
      fontSize: token.fontSize,
      fontWeight: token.headingFontWeight,
      lineHeight: token.lineHeight
    },

    '.nft_item_detail__description_content_wrapper': {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flex: 1,
      minWidth: 0
    },

    '.nft_item_detail__description_content': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      color: token.colorTextDescription,
      fontSize: token.fontSize,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight,
      wordBreak: 'break-all'
    },

    '.nft-bundle-item-footer': {
      display: 'flex',
      gap: 12,
      marginTop: 24
    },

    '.clickable': {
      cursor: 'pointer'
    },

    '.nft_item_detail__info_container': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.marginXS,
      marginTop: token.margin,
      marginBottom: token.margin
    },

    '.nft_item_detail__atts_container': {
      marginTop: token.margin,
      display: 'flex',
      flexWrap: 'wrap',
      gap: token.marginXS,
      overflow: 'hidden'
    },

    '.ant-field-container': {
      overflow: 'hidden'
    },

    '.nft-item-detail-section-label-1': {
      fontSize: token.fontSizeLG,
      color: token.colorTextHeading,
      lineHeight: token.lineHeightLG,
      paddingBottom: 8,
      paddingTop: token.padding
    },

    '.nft-item-detail-section-label-2': {
      paddingTop: token.padding,
      paddingBottom: 8
    },

    '.nft_item_detail__send_text': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG
    },

    '.nft_item_detail__prop_section': {
      marginBottom: token.margin
    },

    '.nft_item_detail__owner_address': {
      color: token.colorTextDescription
    },

    '.nft_item_detail__external_icon': {
      cursor: 'pointer'
    },

    '.nft_item_detail__description_modal_content': {
      display: 'flex',
      gap: token.marginXS,
      padding: token.paddingSM,
      backgroundColor: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG
    },

    '.nft_item_detail__description_modal_left_icon': {
      display: 'flex',
      alignItems: 'center'
    },

    '.nft_item_detail__description_modal_title': {
      textAlign: 'left',
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      fontWeight: token.bodyFontWeight,
      color: token.colorTextLight1,
      wordBreak: 'break-all'
    },

    '.nft_item_detail__description_modal_detail': {
      textAlign: 'justify',
      fontWeight: token.bodyFontWeight,
      fontSize: token.fontSizeHeading6,
      color: token.colorTextTertiary,
      wordBreak: 'break-word'
    },

    '.nft_item_detail__nft_image': {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      position: 'relative',
      height: '100%',
      overflow: 'hidden',

      '.ant-image-img': {
        maxWidth: '100%',
        objectFit: 'cover',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
      }
    },

    '.nft_item_detail__id_field .ant-field-wrapper .ant-field-content-wrapper .ant-field-content': {
      overflow: 'scroll',
      textOverflow: 'initial'
    },

    '.nft-child-item-right': {
      display: 'flex',
      flex: 1,
      justifyContent: 'space-between',
      overflow: 'hidden'
    },

    '.nft-child-item-wrapper': {
      backgroundColor: token.colorBgSecondary,
      display: 'flex',
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 10,
      paddingRight: 4,
      borderRadius: 8
    },

    '.nft-child-item-left': {
      paddingRight: 8
    },

    '.nft-child-item-wrapper + .nft-child-item-wrapper': {
      marginTop: 8
    },

    '.nft-child-item-right-block-1-line-1': {
      fontWeight: token.fontWeightStrong,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight
    },

    '.nft-child-item-right-block-1': {
      overflow: 'hidden'
    },

    '.nft-child-item-right-block-1-value': {
      color: token.colorSuccess
    },

    '.nft-child-item-right-block-1-line-2': {
      fontWeight: token.bodyFontWeight,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextDescription,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    },

    '.nft-item-level-label': {
      position: 'absolute',
      zIndex: 10,
      pointerEvents: 'none',
      padding: '2px 8px 2px 8px',
      backgroundColor: token['colorWarning-7'],
      borderRadius: '12px',
      fontSize: token.fontSizeXS,
      fontWeight: 700,
      lineHeight: token.lineHeightXS,
      color: token['green-1'],
      right: 8,
      top: 8
    },

    '.nft-item-img-footer-line1-wrapper': {
      display: 'flex',
      justifyContent: 'space-between'
    },

    '.nft-item-img-footer-line2-wrapper': {
      paddingTop: token.paddingSM,
      paddingLeft: token.padding,
      paddingRight: token.padding,
      paddingBottom: token.paddingXXS,
      '.ant-btn-default.-schema-secondary': {
        backgroundColor: token.colorBgInput
      },
      '.ant-btn-default.-schema-secondary:hover': {
        backgroundColor: token['gray-2']
      }
    }
  });
});

export default NftBundleItemDetail;
