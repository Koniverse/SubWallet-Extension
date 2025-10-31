// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _AssetType, _ChainInfo } from '@subwallet/chain-list/types';
import { _getTokenTypesSupportedByChain, _isChainTestNet, _parseMetadataForAssetId, _parseMetadataForSmartContractAsset } from '@subwallet/extension-base/services/chain-service/utils';
import { isValidSubstrateAddress } from '@subwallet/extension-base/utils';
import { AddressInput, ChainSelector, HiddenInput, Layout, PageWrapper, TokenTypeSelector } from '@subwallet/extension-koni-ui/components';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useChainChecker, useDefaultNavigate, useGetChainPrefixBySlug, useGetFungibleContractSupportedChains, useNotification, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { upsertCustomToken, validateCustomToken } from '@subwallet/extension-koni-ui/messaging';
import { FormCallbacks, FormRule, Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertFieldToError, convertFieldToObject, reformatAddress, simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { reformatContractAddress } from '@subwallet/extension-koni-ui/utils/account/reformatContractAddress';
import { Col, Field, Form, Icon, Input, Row } from '@subwallet/react-ui';
import SwAvatar from '@subwallet/react-ui/es/sw-avatar';
import { PlusCircle } from 'phosphor-react';
import { FieldData } from 'rc-field-form/lib/interface';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import { isEthereumAddress } from '@polkadot/util-crypto';

type Props = ThemeProps

interface TokenImportFormType {
  contractAddress: string;
  chain: string;
  type: _AssetType;
  priceId: string;
  tokenName: string;
  decimals: number;
  symbol: string;
  assetId?: string;
}

interface TokenTypeOption {
  label: string,
  value: _AssetType
}

function isAssetHubChain (chainslug: string) {
  return ['statemint', 'statemine'].includes(chainslug);
}

function getTokenTypeSupported (chainInfo: _ChainInfo) {
  if (!chainInfo) {
    return [];
  }

  const tokenTypes = _getTokenTypesSupportedByChain(chainInfo);
  const result: TokenTypeOption[] = [];

  tokenTypes.forEach((tokenType) => {
    if (tokenType !== _AssetType.GRC20) {
      result.push({
        label: tokenType.toString(),
        value: tokenType
      });
    }
  });

  return result;
}

export interface LocationState {
  isCustomizeModal?: boolean;
}

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { goBack } = useDefaultNavigate();
  const dataContext = useContext(DataContext);
  const { token } = useTheme() as Theme;
  const showNotification = useNotification();
  const location = useLocation() as unknown as { state?: LocationState };

  const isCustomizeModal = location.state?.isCustomizeModal ?? '';
  const chainInfoMap = useGetFungibleContractSupportedChains();

  const [form] = Form.useForm<TokenImportFormType>();

  const formDefault = useMemo((): TokenImportFormType => ({
    contractAddress: '',
    chain: '',
    type: '' as _AssetType,
    priceId: '',
    tokenName: '',
    decimals: -1,
    symbol: ''
  }), []);

  const chains = useMemo(() => Object.values(chainInfoMap), [chainInfoMap]);

  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [fieldDisabled, setFieldDisabled] = useState(true);

  const selectedChain = Form.useWatch('chain', form);
  const symbol = Form.useWatch('symbol', form);
  const decimals = Form.useWatch('decimals', form);
  const tokenName = Form.useWatch('tokenName', form);
  const selectedTokenType = Form.useWatch('type', form);

  const chainChecker = useChainChecker();
  const chainNetworkPrefix = useGetChainPrefixBySlug(selectedChain);
  const handleGoBack = useCallback(() => {
    if (isCustomizeModal) {
      const urlToBack = '/home/tokens';

      goBack(urlToBack, { from: 'tokenImport' });

      return;
    }

    goBack();
  }, [goBack, isCustomizeModal]);

  const tokenTypeOptions = useMemo(() => {
    return getTokenTypeSupported(chainInfoMap[selectedChain]);
  }, [chainInfoMap, selectedChain]);

  const isSelectGearToken = useMemo(() => {
    return selectedTokenType === _AssetType.VFT;
  }, [selectedTokenType]);

  const contractRules = useMemo((): FormRule[] => {
    return [
      ({ getFieldValue }) => ({
        transform: (contractAddress: string) => {
          const selectedChain = getFieldValue('chain') as string;

          return reformatContractAddress(selectedChain, contractAddress);
        },
        validator: (_, contractAddress: string) => {
          return new Promise<void>((resolve, reject) => {
            const selectedTokenType = getFieldValue('type') as _AssetType;
            const selectedChain = getFieldValue('chain') as string;

            const isValidEvmContract = [_AssetType.ERC20].includes(selectedTokenType) && isEthereumAddress(contractAddress);
            const isValidWasmContract = [_AssetType.PSP22].includes(selectedTokenType) && isValidSubstrateAddress(contractAddress);
            const isValidGearContract = [_AssetType.VFT].includes(selectedTokenType) && isValidSubstrateAddress(contractAddress);
            const reformattedAddress = isValidGearContract ? contractAddress : reformatAddress(contractAddress, chainNetworkPrefix);

            if (isValidEvmContract || isValidWasmContract || isValidGearContract) {
              setLoading(true);
              validateCustomToken({
                contractAddress: reformattedAddress,
                originChain: selectedChain,
                type: selectedTokenType
              })
                .then((validationResult) => {
                  setLoading(false);

                  if (validationResult.isExist) {
                    reject(new Error(t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.existedToken')));
                  }

                  if (validationResult.contractError) {
                    reject(new Error(t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.errorValidatingToken')));
                  }

                  if (!validationResult.isExist && !validationResult.contractError) {
                    form.setFieldValue('tokenName', validationResult.name);
                    form.setFieldsValue({
                      tokenName: validationResult.name,
                      decimals: validationResult.decimals,
                      symbol: validationResult.symbol
                    });
                    resolve();
                  }
                })
                .catch(() => {
                  setLoading(false);
                  reject(new Error(t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.errorValidatingToken')));
                });
            } else {
              reject(t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.invalidContractAddress'));
            }
          });
        }
      })
    ];
  }, [chainNetworkPrefix, form, t]);

  const assetIdRules = useMemo((): FormRule[] => {
    return [
      ({ getFieldValue }) => ({
        validator: (_, assetId: string) => {
          return new Promise<void>((resolve, reject) => {
            const selectedTokenType = getFieldValue('type') as _AssetType;

            setLoading(true);
            validateCustomToken({
              originChain: selectedChain,
              type: selectedTokenType,
              assetId: assetId
            })
              .then((validationResult) => {
                setLoading(false);

                if (validationResult.isExist) {
                  reject(new Error(t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.existedToken')));
                }

                if (validationResult.contractError) {
                  reject(new Error(t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.invalidAssetId')));
                }

                if (!validationResult.isExist && !validationResult.contractError) {
                  form.setFieldValue('tokenName', validationResult.name);
                  form.setFieldsValue({
                    tokenName: validationResult.name,
                    decimals: validationResult.decimals,
                    symbol: validationResult.symbol
                  });
                  resolve();
                }
              })
              .catch(() => {
                setLoading(false);
                reject(new Error(t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.errorValidatingToken')));
              });
          });
        }
      })
    ];
  }, [form, selectedChain, t]);

  const hideFields = useMemo(() => !isAssetHubChain(selectedChain) ? ['assetId'] : ['contractAddress'], [selectedChain]);

  const onFieldChange: FormCallbacks<TokenImportFormType>['onFieldsChange'] = useCallback((changedFields: FieldData[], allFields: FieldData[]) => {
    const { empty, error } = simpleCheckForm(allFields, ['--priceId', '--tokenName', '--contractAddress', '--assetId']);

    const changes = convertFieldToObject<TokenImportFormType>(changedFields);
    const all = convertFieldToObject<TokenImportFormType>(allFields);
    const allError = convertFieldToError<TokenImportFormType>(allFields);

    const { chain, contractAddress, type } = changes;
    const { chain: selectedChain } = all;

    const baseResetFields = ['tokenName', 'symbol', 'decimals', 'priceId'];

    if (chain) {
      const nftTypes = getTokenTypeSupported(chainInfoMap[chain]);

      if (nftTypes.length === 1) {
        form.setFieldValue('type', nftTypes[0].value);
      } else {
        form.resetFields(['type']);
      }

      form.resetFields(['contractAddress', ...baseResetFields]);
      form.resetFields(['assetId', ...baseResetFields]);
    }

    if (type) {
      form.resetFields(['contractAddress', ...baseResetFields]);
      form.resetFields(['assetId', ...baseResetFields]);
    }

    if (contractAddress) {
      form.setFieldValue('contractAddress', reformatContractAddress(selectedChain, contractAddress));
    }

    if (allError.contractAddress.length > 0 || allError.assetId.length > 0) {
      form.resetFields([...baseResetFields]);
    }

    setFieldDisabled(!all.chain || !all.type || allError.contractAddress.length > 0 || allError.assetId.length > 0);
    setIsDisabled(empty || error);
  }, [chainInfoMap, form]);

  const onSubmitContractAddress: FormCallbacks<TokenImportFormType>['onFinish'] = useCallback((formValues: TokenImportFormType) => {
    const { chain, contractAddress, decimals, priceId, symbol, tokenName, type } = formValues;

    const reformattedAddress = type === _AssetType.VFT ? contractAddress : reformatAddress(contractAddress, chainNetworkPrefix);

    setLoading(true);

    upsertCustomToken({
      originChain: chain,
      slug: '',
      name: tokenName || symbol,
      symbol,
      decimals,
      priceId: priceId || null,
      minAmount: null,
      assetType: type,
      metadata: _parseMetadataForSmartContractAsset(reformattedAddress),
      multiChainAsset: null,
      hasValue: _isChainTestNet(chainInfoMap[formValues.chain]),
      icon: 'default.png'
    })
      .then((result) => {
        if (result) {
          showNotification({
            message: t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.importedTokenSuccessfully')
          });
          handleGoBack();
        } else {
          showNotification({
            message: t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.anErrorOccurredPleaseTryAgain')
          });
        }
      })
      .catch(() => {
        showNotification({
          message: t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.anErrorOccurredPleaseTryAgain')
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [chainNetworkPrefix, chainInfoMap, showNotification, t, handleGoBack]);

  const onSubmitAssetId: FormCallbacks<TokenImportFormType>['onFinish'] = useCallback((formValues: TokenImportFormType) => {
    const { assetId, chain, decimals, priceId, symbol, tokenName, type } = formValues;

    if (assetId) {
      setLoading(true);

      upsertCustomToken({
        originChain: chain,
        slug: '',
        name: tokenName || symbol,
        symbol,
        decimals,
        priceId: priceId || null,
        minAmount: null,
        assetType: type,
        metadata: _parseMetadataForAssetId(assetId),
        multiChainAsset: null,
        hasValue: _isChainTestNet(chainInfoMap[formValues.chain]),
        icon: 'default.png'
      })
        .then((result) => {
          if (result) {
            showNotification({
              message: t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.importedTokenSuccessfully')
            });
            handleGoBack();
          } else {
            showNotification({
              message: t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.anErrorOccurredPleaseTryAgain')
            });
          }
        })
        .catch(() => {
          showNotification({
            message: t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.anErrorOccurredPleaseTryAgain')
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [chainInfoMap, showNotification, t, handleGoBack]);

  const tokenDecimalsPrefix = useCallback(() => {
    const contractAddress = form.getFieldValue('contractAddress') as string;

    const theme = isEthereumAddress(contractAddress) ? 'ethereum' : 'polkadot';

    return (
      <SwAvatar
        identPrefix={42}
        size={token.fontSizeXL}
        theme={theme}
        value={contractAddress}
      />
    );
  }, [token.fontSizeXL, form]);

  useEffect(() => {
    chainChecker(selectedChain);
  }, [chainChecker, selectedChain]);

  return (
    <PageWrapper
      className={`import_token ${className}`}
      resolve={dataContext.awaitStores(['assetRegistry'])}
    >
      <Layout.WithSubHeaderOnly
        onBack={handleGoBack}
        rightFooterButton={{
          block: true,
          disabled: isDisabled,
          icon: (
            <Icon
              phosphorIcon={PlusCircle}
              weight='fill'
            />
          ),
          loading,
          onClick: form.submit,
          children: t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.importToken')
        }}
        title={t<string>('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.importToken')}
      >
        <div className={'import_token__container'}>
          <Form
            className='form-space-sm'
            form={form}
            initialValues={formDefault}
            name={'token-import'}
            onFieldsChange={onFieldChange}
            onFinish={!isAssetHubChain(selectedChain) ? onSubmitContractAddress : onSubmitAssetId}
          >
            <Form.Item
              name={'chain'}
            >
              <ChainSelector
                className={className}
                id='import-nft-select-chain'
                items={chains}
                label={t<string>('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.network')}
                placeholder={t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.selectNetwork')}
                title={t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.selectNetwork')}
              />
            </Form.Item>

            <Form.Item
              name={'type'}
            >
              <TokenTypeSelector
                className={className}
                disabled={!selectedChain}
                items={tokenTypeOptions}
                placeholder={t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.selectTokenType')}
                title={t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.selectTokenType')}
              />
            </Form.Item>

            <HiddenInput fields={hideFields} />
            {
              !isAssetHubChain(selectedChain)
                ? (
                  <Form.Item
                    name={'contractAddress'}
                    rules={contractRules}
                    statusHelpAsTooltip={true}
                  >
                    <AddressInput
                      addressPrefix={chainNetworkPrefix}
                      disabled={!selectedTokenType}
                      label={isSelectGearToken ? t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.programId') : t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.contractAddress')}
                      showScanner={true}
                    />
                  </Form.Item>
                )
                : <Form.Item
                  name={'assetId'}
                  rules={assetIdRules}
                  statusHelpAsTooltip={true}
                >
                  <AddressInput
                    disabled={!selectedTokenType}
                    label={t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.assetId')}
                    placeholder={t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.typeOrPasteAssetId')}
                    showScanner={true}
                  />
                </Form.Item>
            }

            <Row
              className={'token-symbol-decimals'}
              gutter={token.margin}
            >
              <Col span={12}>
                <Form.Item
                  name={'symbol'}
                >
                  <Field
                    content={symbol}
                    placeholder={t<string>('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.symbol')}
                    prefix={tokenDecimalsPrefix()}
                    tooltip={t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.symbol')}
                    tooltipPlacement={'topLeft'}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={'decimals'}
                >
                  <Field
                    content={decimals === -1 ? '' : decimals}
                    placeholder={t<string>('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.decimals')}
                    tooltip={t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.decimals')}
                    tooltipPlacement={'topLeft'}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name={'tokenName'}
              rules={[
                {
                  required: true,
                  message: t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.tokenNameIsRequired')
                }
              ]}
              statusHelpAsTooltip={true}
            >
              <Field
                content={tokenName}
                placeholder={t<string>('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.tokenName')}
                tooltip={t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.tokenName')}
                tooltipPlacement={'topLeft'}
              />
            </Form.Item>

            <Form.Item
              name={'priceId'}
              statusHelpAsTooltip={true}
            >
              <Input
                disabled={fieldDisabled}
                placeholder={t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.priceId')}
                tooltip={t('ui.SETTINGS.screen.Setting.Tokens.ImportFungible.priceId')}
              />
            </Form.Item>
          </Form>
        </div>
      </Layout.WithSubHeaderOnly>
    </PageWrapper>
  );
}

const FungibleTokenImport = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.import_token__container': {
      paddingTop: token.padding,
      marginLeft: token.margin,
      marginRight: token.margin
    },

    '.import_token__selected_option': {
      color: token.colorTextHeading
    },

    '.ant-field-container.ant-field-size-medium .ant-field-wrapper': {
      padding: token.paddingSM
    },

    '.token_import__selected_option': {
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      color: token.colorText
    }
  });
});

export default FungibleTokenImport;
