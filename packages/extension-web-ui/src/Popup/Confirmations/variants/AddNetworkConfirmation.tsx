// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ConfirmationDefinitions, ConfirmationResult } from '@subwallet/extension-base/background/KoniTypes';
import { _CHAIN_VALIDATION_ERROR } from '@subwallet/extension-base/services/chain-service/handler/types';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { AlertBox, ConfirmationGeneralInfo } from '@subwallet/extension-web-ui/components';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { completeConfirmation } from '@subwallet/extension-web-ui/messaging';
import { Theme, ThemeProps } from '@subwallet/extension-web-ui/types';
import { ActivityIndicator, Button, Col, Field, Icon, Row } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, Globe, ShareNetwork, WifiHigh, WifiSlash, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

interface Props extends ThemeProps {
  request: ConfirmationDefinitions['addNetworkRequest'][0];
}

const handleConfirm = async ({ id }: ConfirmationDefinitions['addNetworkRequest'][0]) => {
  return await completeConfirmation('addNetworkRequest', { id, isApproved: true } as ConfirmationResult<null>);
};

const handleCancel = async ({ id }: ConfirmationDefinitions['addNetworkRequest'][0]) => {
  return await completeConfirmation('addNetworkRequest', { id, isApproved: false } as ConfirmationResult<null>);
};

const IMPORTED_NETWORK_GUIDE_URL = 'https://docs.subwallet.app/main/web-dashboard-user-guide/network-management/customize-your-networks/import-custom-networks';

const Component: React.FC<Props> = (props: Props) => {
  const { className, request } = props;
  const { payload: { chainEditInfo, chainSpec, mode, providerError, unconfirmed } } = request;

  const { t } = useTranslation();
  const { isWebUI } = useContext(ScreenContext);

  const { token } = useTheme() as Theme;

  const [loading, setLoading] = useState(false);

  const isUnsupportedChain = useMemo(() => {
    return providerError === _CHAIN_VALIDATION_ERROR.UNSUPPORTED_CHAIN_CANNOT_ADD;
  }, [providerError]);

  const handleErrorMessage = useCallback((errorCode?: _CHAIN_VALIDATION_ERROR) => {
    if (!errorCode) {
      return '';
    }

    switch (errorCode) {
      case _CHAIN_VALIDATION_ERROR.CONNECTION_FAILURE:
        return t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.cannotConnectToThisProvider');
      case _CHAIN_VALIDATION_ERROR.EXISTED_PROVIDER:
        return t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.thisProviderHasAlreadyBeenAdded');
      case _CHAIN_VALIDATION_ERROR.EXISTED_CHAIN:
        return t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.thisChainHasAlreadyBeenAdded');
      default:
        return t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.errorValidatingThisProvider');
    }
  }, [t]);

  const onCancel = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      handleCancel(request).finally(() => {
        setLoading(false);
      });
    }, 300);
  }, [request]);

  const onApprove = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      handleConfirm(request).finally(() => {
        setLoading(false);
      });
    }, 300);
  }, [request]);

  const providerSuffix = useMemo(() => {
    if (unconfirmed) {
      return <ActivityIndicator size={token.sizeMD} />;
    }

    if (providerError) {
      return (
        <Icon
          iconColor={token.colorError}
          phosphorIcon={WifiSlash}
          size='sm'
          weight='bold'
        />
      );
    }

    return (
      <Icon
        iconColor={token.colorSuccess}
        phosphorIcon={WifiHigh}
        size='sm'
        weight='bold'
      />
    );
  }, [token, providerError, unconfirmed]);

  return (
    <>
      <div className={CN(className, 'confirmation-content')}>
        <ConfirmationGeneralInfo request={request} />
        <Field
          content={chainEditInfo.providers[chainEditInfo.currentProvider]}
          placeholder={t<string>('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.providerUrl')}
          prefix={(
            <Icon
              customSize={'24px'}
              iconColor={token['gray-4']}
              phosphorIcon={ShareNetwork}
              type={'phosphor'}
              weight={'bold'}
            />
          )}
          status={providerError ? 'error' : ''}
          statusHelp={handleErrorMessage(providerError)}
          suffix={providerSuffix}
          tooltip={isWebUI ? t<string>('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.providerUrl') : undefined}
          tooltipPlacement='topLeft'
        />
        <Row gutter={token.paddingSM}>
          <Col span={16}>
            <Field
              content={chainEditInfo.name || ''}
              placeholder={t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.networkName')}
              prefix={(
                <Icon
                  customSize={'24px'}
                  iconColor={token['gray-4']}
                  phosphorIcon={Globe}
                  type={'phosphor'}
                  weight={'bold'}
                />
              )}
              tooltip={isWebUI ? t<string>('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.networkName') : undefined}
              tooltipPlacement='topLeft'
            />
          </Col>
          <Col span={8}>
            <Field
              content={chainEditInfo.symbol || ''}
              placeholder={t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.symbol')}
              tooltip={isWebUI ? t<string>('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.symbol') : undefined}
              tooltipPlacement='topLeft'
            />
          </Col>
        </Row>
        <Row gutter={token.paddingSM}>
          <Col span={12}>
            <Field
              content={chainSpec?.decimals || 0}
              placeholder={t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.decimals')}
              tooltip={isWebUI ? t<string>('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.decimals') : undefined}
              tooltipPlacement='topLeft'
            />
          </Col>
          <Col span={12}>
            <Field
              content={chainSpec?.evmChainId || 0}
              placeholder={t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.chainId')}
              tooltip={isWebUI ? t<string>('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.chainId') : undefined}
              tooltipPlacement='topLeft'
            />
          </Col>
        </Row>
        <Field
          content={chainEditInfo.chainType}
          placeholder={t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.networkType')}
          tooltip={isWebUI ? t<string>('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.networkType') : undefined}
          tooltipPlacement='topLeft'
        />
        <Field
          content={chainEditInfo.blockExplorer}
          placeholder={t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.blockExplorer')}
          tooltip={isWebUI ? t<string>('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.blockExplorer') : undefined}
          tooltipPlacement='topLeft'
        />
        <Field
          content={chainEditInfo.crowdloanUrl}
          placeholder={t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.crowdloanUrl')}
          tooltip={isWebUI ? t<string>('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.crowdloanUrl') : undefined}
          tooltipPlacement='topLeft'
        />
      </div>
      <div className='confirmation-footer'>
        {mode === 'update' && (<div className={'warning-message'}>
          {t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.theNetworkAlreadyExists')}
        </div>)}
        {
          isUnsupportedChain && (
            <AlertBox
              className={'alert-box'}
              description={(
                <Trans
                  components={{
                    highlight: (
                      <a
                        className='link'
                        href={IMPORTED_NETWORK_GUIDE_URL}
                        target='__blank'
                      />
                    )
                  }}
                  i18nKey={detectTranslate('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.thisNetworkIsNotYetSupportedOnSubwalletImportTheNetworkUsingThisHighlightGuideHighlightAndTryAgain')}
                />
              )

              }
              title={t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.networkNotSupported')}
              type={'error'}
            />
          )
        }
        {
          isUnsupportedChain
            ? <Button
              disabled={loading}
              onClick={onCancel}
              schema={'primary'}
            >
              {t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.iUnderstand')}
            </Button>
            : <Button
              disabled={loading}
              icon={(
                <Icon
                  phosphorIcon={XCircle}
                  weight='fill'
                />
              )}
              onClick={onCancel}
              schema={'secondary'}
            >
              {t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.cancel')}
            </Button>
        }

        {!isUnsupportedChain && <Button
          disabled={mode === 'update' || unconfirmed || !!providerError}
          icon={(
            <Icon
              phosphorIcon={CheckCircle}
              weight='fill'
            />
          )}
          loading={loading}
          onClick={onApprove}
        >
          {t('ui.ADD_NETWORK_CONFIRMATION.Popup.Confirmations.variants.AddNetworkConfirmation.approve')}
        </Button>}
      </div>
    </>
  );
};

const AddNetworkConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '--content-gap': `${token.size}px`,

    '.ant-field-container': {
      textAlign: 'left',
      overflow: 'unset'
    }
  };
});

export default AddNetworkConfirmation;
