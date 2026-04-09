// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _getContractAddressOfToken, _isCustomAsset, _isSmartContractToken } from '@subwallet/extension-base/services/chain-service/utils';
import { Layout, PageWrapper } from '@subwallet/extension-web-ui/components';
import { DataContext } from '@subwallet/extension-web-ui/contexts/DataContext';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import useNotification from '@subwallet/extension-web-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-web-ui/hooks/common/useTranslation';
import useConfirmModal from '@subwallet/extension-web-ui/hooks/modal/useConfirmModal';
import useDefaultNavigate from '@subwallet/extension-web-ui/hooks/router/useDefaultNavigate';
import useFetchChainInfo from '@subwallet/extension-web-ui/hooks/screen/common/useFetchChainInfo';
import useGetChainAssetInfo from '@subwallet/extension-web-ui/hooks/screen/common/useGetChainAssetInfo';
import { deleteCustomAssets, upsertCustomToken } from '@subwallet/extension-web-ui/messaging';
import { Theme, ThemeProps } from '@subwallet/extension-web-ui/types';
import { Button, ButtonProps, Col, Field, Icon, Input, Logo, Row, Tooltip } from '@subwallet/react-ui';
import SwAvatar from '@subwallet/react-ui/es/sw-avatar';
import { CheckCircle, Copy, Trash } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import { isEthereumAddress } from '@polkadot/util-crypto';

type Props = ThemeProps

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { isWebUI } = useContext(ScreenContext);
  const dataContext = useContext(DataContext);
  const { token } = useTheme() as Theme;
  const goBack = useDefaultNavigate().goBack;
  const location = useLocation();
  const showNotification = useNotification();

  const tokenSlug = useMemo(() => {
    return location.state as string;
  }, [location.state]);
  const tokenInfo = useGetChainAssetInfo(tokenSlug) as _ChainAsset;

  useEffect(() => {
    if (!tokenInfo) {
      goBack();
    }
  }, [goBack, tokenInfo]);

  const originChainInfo = useFetchChainInfo(tokenInfo?.originChain || '');

  const [priceId, setPriceId] = useState(tokenInfo?.priceId || '');
  const [loading, setLoading] = useState(false);

  const { handleSimpleConfirmModal } = useConfirmModal({
    title: t<string>('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.deleteToken'),
    maskClosable: true,
    closable: true,
    type: 'error',
    subTitle: t<string>('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.youAreAboutToDeleteThisToken'),
    content: t<string>('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.confirmDeleteThisToken'),
    okText: t<string>('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.remove')
  });

  const handleDeleteToken = useCallback(() => {
    if (!tokenInfo?.slug) {
      return;
    }

    handleSimpleConfirmModal().then(() => {
      deleteCustomAssets(tokenInfo.slug)
        .then((result) => {
          if (result) {
            goBack();
            showNotification({
              message: t('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.deletedTokenSuccessfully')
            });
          } else {
            showNotification({
              message: t('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.deletedTokenUnsuccessfully')
            });
          }
        })
        .catch(() => {
          showNotification({
            message: t('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.deletedTokenUnsuccessfully')
          });
        });
    }).catch(console.log);
  }, [goBack, handleSimpleConfirmModal, showNotification, t, tokenInfo?.slug]);

  const subHeaderButton: ButtonProps[] = useMemo(() => {
    return [
      {
        icon: <Icon
          customSize={`${token.fontSizeHeading3}px`}
          phosphorIcon={Trash}
          type='phosphor'
          weight={'light'}
        />,
        onClick: handleDeleteToken,
        disabled: !(_isCustomAsset(tokenInfo.slug) && _isSmartContractToken(tokenInfo)),
        tooltip: isWebUI ? t('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.deleteToken') : undefined
      }
    ];
  }, [handleDeleteToken, isWebUI, t, token.fontSizeHeading3, tokenInfo]);

  const contractAddressIcon = useCallback(() => {
    const contractAddress = _getContractAddressOfToken(tokenInfo);
    const theme = isEthereumAddress(contractAddress) ? 'ethereum' : 'polkadot';

    return (
      <SwAvatar
        identPrefix={42}
        size={token.fontSizeXL}
        theme={theme}
        value={contractAddress}
      />
    );
  }, [token.fontSizeXL, tokenInfo]);

  const contractAddressInfo = useCallback(() => {
    const contractAddress = _getContractAddressOfToken(tokenInfo);

    return (
      <span>{`${contractAddress.slice(0, 10)}...${contractAddress.slice(-10)}`}</span>
    );
  }, [tokenInfo]);

  const handleCopyContractAddress = useCallback(() => {
    const contractAddress = _getContractAddressOfToken(tokenInfo);

    navigator?.clipboard?.writeText(contractAddress).then().catch(console.error);

    showNotification({
      message: t('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.copiedToClipboard')
    });
  }, [showNotification, t, tokenInfo]);

  const contractAddressSuffix = useCallback(() => {
    return (
      <Button
        icon={<Icon
          customSize={'20px'}
          iconColor={token.colorIcon}
          phosphorIcon={Copy}
          type='phosphor'
          weight={'light'}
        />}
        onClick={handleCopyContractAddress}
        size={'xs'}
        type={'ghost'}
      />
    );
  }, [handleCopyContractAddress, token.colorIcon]);

  const onChangePriceId = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setPriceId(e.currentTarget.value);
  }, []);

  const isSubmitDisabled = useCallback(() => {
    return tokenInfo?.priceId === priceId || priceId.length === 0;
  }, [priceId, tokenInfo?.priceId]);

  const onSubmit = useCallback(() => {
    if (!tokenInfo) {
      return;
    }

    setLoading(true);

    upsertCustomToken({
      ...tokenInfo,
      priceId
    })
      .then((result) => {
        if (result) {
          setLoading(false);
          goBack();
        } else {
          setLoading(false);
          showNotification({
            message: t('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.error')
          });
        }
      })
      .catch(() => {
        setLoading(false);
        showNotification({
          message: t('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.error')
        });
      });
  }, [goBack, priceId, showNotification, t, tokenInfo]);

  const leftFooterButtonProps = useCallback(() => {
    if (!tokenInfo?.slug) {
      return;
    }

    return _isCustomAsset(tokenInfo.slug)
      ? {
        onClick: goBack,
        children: t('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.cancel')
      }
      : undefined;
  }, [goBack, tokenInfo?.slug, t]);

  const rightFooterButtonProps = useCallback(() => {
    if (!tokenInfo?.slug) {
      return;
    }

    return _isCustomAsset(tokenInfo.slug)
      ? {
        block: true,
        disabled: isSubmitDisabled(),
        icon: (
          <Icon
            phosphorIcon={CheckCircle}
            weight='fill'
          />
        ),
        loading,
        onClick: onSubmit,
        children: t('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.save')
      }
      : undefined;
  }, [isSubmitDisabled, loading, onSubmit, t, tokenInfo?.slug]);

  if (!tokenInfo || !originChainInfo) {
    return (<></>);
  }

  return (
    <PageWrapper
      className={`token_detail ${className}`}
      resolve={dataContext.awaitStores(['assetRegistry'])}
    >
      <Layout.Base
        leftFooterButton={leftFooterButtonProps()}
        onBack={goBack}
        rightFooterButton={rightFooterButtonProps()}
        showBackButton={true}
        showSubHeader={true}
        subHeaderBackground={'transparent'}
        subHeaderCenter={true}
        subHeaderIcons={subHeaderButton}
        subHeaderPaddingVertical={true}
        title={t<string>('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.tokenDetail')}
      >
        <div className={'token_detail__container'}>
          <div className={'token_detail__header_container'}>
            <div className={'token_detail__header_icon_wrapper'}>
              <Logo
                size={112}
                token={tokenInfo.slug.toLowerCase()}
              />
            </div>

            <div className={'token_detail__header_text_container'}>
              {tokenInfo.symbol}
            </div>
          </div>

          <div className={'token_detail__content_container'}>
            {
              _isSmartContractToken(tokenInfo) && <Field
                content={contractAddressInfo()}
                label={t<string>('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.contractAddress')}
                placeholder={t<string>('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.contractAddress')}
                prefix={contractAddressIcon()}
                suffix={contractAddressSuffix()}
              />
            }
            <Field
              content={originChainInfo.name}
              label={t<string>('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.network')}
              placeholder={t<string>('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.network')}
              prefix={<Logo
                network={originChainInfo.slug}
                size={20}
              />}
            />

            <Row gutter={token.marginSM}>
              <Col span={12}>
                <Tooltip
                  open={isWebUI ? undefined : false}
                  placement={'topLeft'}
                  title={t('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.symbol')}
                >
                  <div>
                    <Field
                      content={tokenInfo.symbol}
                      placeholder={t<string>('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.symbol')}
                      prefix={(
                        <Logo
                          size={20}
                          token={tokenInfo.slug.toLowerCase()}
                        />
                      )}
                    />
                  </div>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip
                  open={isWebUI ? undefined : false}
                  placement={'topLeft'}
                  title={t('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.tokenName')}
                >
                  <div>
                    <Field
                      content={tokenInfo.name}
                      placeholder={t<string>('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.tokenName')}
                    />
                  </div>
                </Tooltip>
              </Col>
            </Row>
            <Row gutter={token.marginSM}>
              <Col span={12}>
                <Tooltip
                  open={isWebUI ? undefined : false}
                  placement={'topLeft'}
                  title={t('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.priceId')}
                >
                  <div>
                    <Input
                      disabled={!_isCustomAsset(tokenInfo.slug)}
                      onChange={onChangePriceId}
                      placeholder={t('ui.TOKEN_DETAIL.Popup.Settings.Tokens.TokenDetail.priceId')}
                      value={priceId}
                    />
                  </div>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip
                  open={isWebUI ? undefined : false}
                  placement={'topLeft'}
                  title={t('ui.SETTINGS.screen.Setting.Tokens.TokenDetail.decimals')}
                >
                  <div>
                    <Field
                      content={tokenInfo.decimals}
                      placeholder={t<string>('ui.SETTINGS.screen.Setting.Tokens.TokenDetail.decimals')}
                    />
                  </div>
                </Tooltip>
              </Col>
            </Row>
          </div>
        </div>
      </Layout.Base>
    </PageWrapper>
  );
}

const TokenDetail = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.token_detail__container': {
      marginLeft: token.margin,
      marginRight: token.margin
    },

    '.token_detail__header_container': {
      marginTop: 30,
      display: 'flex',
      flexWrap: 'wrap',
      gap: token.padding,
      flexDirection: 'column',
      alignContent: 'center',
      marginBottom: token.marginLG
    },

    '.token_detail__header_text_container': {
      fontWeight: token.headingFontWeight,
      textAlign: 'center',
      fontSize: token.fontSizeHeading3,
      color: token.colorText
    },

    '.token_detail__header_icon_wrapper': {
      display: 'flex',
      justifyContent: 'center'
    },

    '.token_detail__content_container': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.marginSM
    },

    '.ant-field-wrapper .ant-btn': {
      margin: -token.marginXS,
      height: 'auto'
    },

    '.web-ui-enable &': {
      '.ant-sw-screen-layout-body': {
        flex: '0 0 auto',
        marginBottom: token.marginSM
      }
    }
  });
});

export default TokenDetail;
