// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _AssetRef, _AssetRefPath, _AssetType, _ChainAsset, _ChainInfo, _MultiChainAsset } from '@subwallet/chain-list/types';
import { AssetSetting, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { _ZK_ASSET_PREFIX } from '@subwallet/extension-base/services/chain-service/constants';
import { _getAssetDecimals, _getOriginChainOfAsset, _isAssetFungibleToken, _isChainEvmCompatible, _isMantaZkAsset, _isTokenTransferredByEvm } from '@subwallet/extension-base/services/chain-service/utils';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { detectTranslate, isSameAddress } from '@subwallet/extension-base/utils';
import { AccountSelector } from '@subwallet/extension-koni-ui/components/Field/AccountSelector';
import { AddressInput } from '@subwallet/extension-koni-ui/components/Field/AddressInput';
import AmountInput from '@subwallet/extension-koni-ui/components/Field/AmountInput';
import { ChainSelector } from '@subwallet/extension-koni-ui/components/Field/ChainSelector';
import { TokenItemType, TokenSelector } from '@subwallet/extension-koni-ui/components/Field/TokenSelector';
import { useGetChainPrefixBySlug, useHandleSubmitTransaction, useNotification, usePreCheckAction, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { useIsMantaPayEnabled } from '@subwallet/extension-koni-ui/hooks/account/useIsMantaPayEnabled';
import { getMaxTransfer, makeCrossChainTransfer, makeTransfer } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ChainItemType, FormCallbacks, SendFundParam, Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { findAccountByAddress, formatBalance, isAccountAll, noop } from '@subwallet/extension-koni-ui/utils';
import { findNetworkJsonByGenesisHash } from '@subwallet/extension-koni-ui/utils/chain/getNetworkJsonByGenesisHash';
import { Button, Form, Icon, Input } from '@subwallet/react-ui';
import { Rule } from '@subwallet/react-ui/es/form';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { PaperPlaneRight, PaperPlaneTilt } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { BN, BN_ZERO } from '@polkadot/util';
import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';

import { FreeBalance, TransactionContent, TransactionFooter } from '../parts';
import { TransactionContext, TransactionFormBaseProps } from '../Transaction';

interface TransferFormProps extends TransactionFormBaseProps {
  to: string;
  destChain: string;
  value: string;
}

type Props = ThemeProps;

function isAssetTypeValid (
  chainAsset: _ChainAsset,
  chainInfoMap: Record<string, _ChainInfo>,
  isAccountEthereum: boolean
) {
  return _isChainEvmCompatible(chainInfoMap[chainAsset.originChain]) === isAccountEthereum;
}

function getTokenItems (
  address: string,
  accounts: AccountJson[],
  chainInfoMap: Record<string, _ChainInfo>,
  assetRegistry: Record<string, _ChainAsset>,
  assetSettingMap: Record<string, AssetSetting>,
  multiChainAssetMap: Record<string, _MultiChainAsset>,
  tokenGroupSlug?: string, // is ether a token slug or a multiChainAsset slug
  isZkModeEnabled?: boolean
): TokenItemType[] {
  const account = findAccountByAddress(accounts, address);

  if (!account) {
    return [];
  }

  const isLedger = !!account.isHardware;
  const validGen: string[] = account.availableGenesisHashes || [];
  const validLedgerNetwork = validGen.map((genesisHash) => findNetworkJsonByGenesisHash(chainInfoMap, genesisHash)?.slug);
  const isAccountEthereum = isEthereumAddress(address);
  const isSetTokenSlug = !!tokenGroupSlug && !!assetRegistry[tokenGroupSlug];
  const isSetMultiChainAssetSlug = !!tokenGroupSlug && !!multiChainAssetMap[tokenGroupSlug];

  if (tokenGroupSlug) {
    if (!(isSetTokenSlug || isSetMultiChainAssetSlug)) {
      return [];
    }

    const chainAsset = assetRegistry[tokenGroupSlug];
    const isValidLedger = isLedger ? (isAccountEthereum || validLedgerNetwork.includes(chainAsset?.originChain)) : true;

    if (isSetTokenSlug) {
      if (isAssetTypeValid(chainAsset, chainInfoMap, isAccountEthereum) && isValidLedger) {
        const { name, originChain, slug, symbol } = assetRegistry[tokenGroupSlug];

        return [
          {
            name,
            slug,
            symbol,
            originChain
          }
        ];
      } else {
        return [];
      }
    }
  }

  const items: TokenItemType[] = [];

  Object.values(assetRegistry).forEach((chainAsset) => {
    const isValidLedger = isLedger ? (isAccountEthereum || validLedgerNetwork.includes(chainAsset?.originChain)) : true;
    const isTokenFungible = _isAssetFungibleToken(chainAsset);

    if (!(isTokenFungible && isAssetTypeValid(chainAsset, chainInfoMap, isAccountEthereum) && isValidLedger)) {
      return;
    }

    if (!isZkModeEnabled && _isMantaZkAsset(chainAsset)) {
      return;
    }

    if (isSetMultiChainAssetSlug) {
      if (chainAsset.multiChainAsset === tokenGroupSlug) {
        items.push({
          name: chainAsset.name,
          slug: chainAsset.slug,
          symbol: chainAsset.symbol,
          originChain: chainAsset.originChain
        });
      }
    } else {
      items.push({
        name: chainAsset.name,
        slug: chainAsset.slug,
        symbol: chainAsset.symbol,
        originChain: chainAsset.originChain
      });
    }
  });

  return items;
}

function getMantaPayDestinationName (assetRef: _AssetRef, chainInfo: _ChainInfo) {
  if (assetRef.destAsset.includes(_ZK_ASSET_PREFIX)) {
    return `${chainInfo.name} (Private)`;
  }

  return `${chainInfo.name} (Public)`;
}

function getTokenAvailableDestinations (tokenSlug: string, assetRefMap: Record<string, _AssetRef>, chainInfoMap: Record<string, _ChainInfo>): ChainItemType[] {
  if (!tokenSlug) {
    return [];
  }

  const result: ChainItemType[] = [];
  const originChain = chainInfoMap[_getOriginChainOfAsset(tokenSlug)];

  // Firstly, push the originChain of token
  result.push({
    name: originChain.name,
    slug: originChain.slug
  });

  Object.values(assetRefMap).forEach((assetRef) => {
    if (assetRef.srcAsset === tokenSlug) {
      const destinationChain = chainInfoMap[assetRef.destChain];

      result.push({
        name: assetRef.path === _AssetRefPath.MANTA_ZK ? getMantaPayDestinationName(assetRef, destinationChain) : destinationChain.name,
        slug: destinationChain.slug,
        type: assetRef.path === _AssetRefPath.MANTA_ZK ? _AssetRefPath.MANTA_ZK : undefined
      });
    }
  });

  return result;
}

const defaultFilterAccount = (account: AccountJson): boolean => !(isAccountAll(account.address) || account.isReadOnly);

const filterAccountFunc = (
  chainInfoMap: Record<string, _ChainInfo>,
  assetRegistry: Record<string, _ChainAsset>,
  multiChainAssetMap: Record<string, _MultiChainAsset>,
  tokenGroupSlug?: string // is ether a token slug or a multiChainAsset slug
): (account: AccountJson) => boolean => {
  const isSetTokenSlug = !!tokenGroupSlug && !!assetRegistry[tokenGroupSlug];
  const isSetMultiChainAssetSlug = !!tokenGroupSlug && !!multiChainAssetMap[tokenGroupSlug];

  if (!tokenGroupSlug) {
    return defaultFilterAccount;
  }

  const chainAssets = Object.values(assetRegistry).filter((chainAsset) => {
    const isTokenFungible = _isAssetFungibleToken(chainAsset);

    if (isTokenFungible) {
      if (isSetTokenSlug) {
        return chainAsset.slug === tokenGroupSlug;
      }

      if (isSetMultiChainAssetSlug) {
        return chainAsset.multiChainAsset === tokenGroupSlug;
      }
    } else {
      return false;
    }

    return false;
  });

  return (account: AccountJson): boolean => {
    const isLedger = !!account.isHardware;
    const isAccountEthereum = isEthereumAddress(account.address);
    const validGen: string[] = account.availableGenesisHashes || [];
    const validLedgerNetwork = validGen.map((genesisHash) => findNetworkJsonByGenesisHash(chainInfoMap, genesisHash)?.slug) || [];

    if (!defaultFilterAccount(account)) {
      return false;
    }

    return chainAssets.some((chainAsset) => {
      const isValidLedger = isLedger ? (isAccountEthereum || validLedgerNetwork.includes(chainAsset?.originChain)) : true;

      return isAssetTypeValid(chainAsset, chainInfoMap, isAccountEthereum) && isValidLedger;
    });
  };
};

const _SendFund = ({ className = '' }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const notification = useNotification();

  const locationState = useLocation().state as SendFundParam;
  const [sendFundSlug] = useState<string | undefined>(locationState?.slug);

  const { asset, chain, from, onDone, setAsset, setChain, setFrom } = useContext(TransactionContext);

  const { chainInfoMap, chainStateMap } = useSelector((root) => root.chainStore);
  const { assetRegistry, assetSettingMap, multiChainAssetMap, xcmRefMap } = useSelector((root) => root.assetRegistry);
  const { accounts, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const [maxTransfer, setMaxTransfer] = useState<string>('0');
  const checkAction = usePreCheckAction(from, true, detectTranslate('The account you are using is {{accountTitle}}, you cannot send assets with it'));
  const isZKModeEnabled = useIsMantaPayEnabled(from);

  const [loading, setLoading] = useState(false);
  const [isTransferAll, setIsTransferAll] = useState(false);
  const [, update] = useState({});
  const [isBalanceReady, setIsBalanceReady] = useState(true);
  const [forceUpdateMaxValue, setForceUpdateMaxValue] = useState<object|undefined>(undefined);
  const chainStatus = useMemo(() => chainStateMap[chain]?.connectionStatus, [chain, chainStateMap]);

  const handleTransferAll = useCallback((value: boolean) => {
    setForceUpdateMaxValue({});
    setIsTransferAll(value);
  }, []);

  const { onError, onSuccess } = useHandleSubmitTransaction(onDone, handleTransferAll);

  const [form] = Form.useForm<TransferFormProps>();
  const formDefault = useMemo((): TransferFormProps => {
    return {
      from: from,
      chain: chain,
      destChain: '',
      asset: '',
      to: '',
      value: ''
    };
  }, [chain, from]);

  const destChain = Form.useWatch('destChain', form);
  const transferAmount = Form.useWatch('value', form);

  const destChainItems = useMemo<ChainItemType[]>(() => {
    return getTokenAvailableDestinations(asset, xcmRefMap, chainInfoMap);
  }, [chainInfoMap, asset, xcmRefMap]);

  const currentChainAsset = useMemo(() => {
    return asset ? assetRegistry[asset] : undefined;
  }, [assetRegistry, asset]);

  const decimals = useMemo(() => {
    return currentChainAsset ? _getAssetDecimals(currentChainAsset) : 0;
  }, [currentChainAsset]);

  const extrinsicType = useMemo((): ExtrinsicType => {
    if (!currentChainAsset) {
      return ExtrinsicType.UNKNOWN;
    } else {
      if (chain !== destChain) {
        return ExtrinsicType.TRANSFER_XCM;
      } else {
        if (currentChainAsset.assetType === _AssetType.NATIVE) {
          return ExtrinsicType.TRANSFER_BALANCE;
        } else {
          return ExtrinsicType.TRANSFER_TOKEN;
        }
      }
    }
  }, [chain, currentChainAsset, destChain]);

  const fromChainNetworkPrefix = useGetChainPrefixBySlug(chain);
  const destChainNetworkPrefix = useGetChainPrefixBySlug(destChain);
  const destChainGenesisHash = chainInfoMap[destChain]?.substrateInfo?.genesisHash || '';

  const tokenItems = useMemo<TokenItemType[]>(() => {
    return getTokenItems(
      from,
      accounts,
      chainInfoMap,
      assetRegistry,
      assetSettingMap,
      multiChainAssetMap,
      sendFundSlug,
      isZKModeEnabled
    );
  }, [accounts, assetRegistry, assetSettingMap, chainInfoMap, from, isZKModeEnabled, multiChainAssetMap, sendFundSlug]);

  const validateRecipientAddress = useCallback((rule: Rule, _recipientAddress: string): Promise<void> => {
    if (!_recipientAddress) {
      return Promise.reject(t('Recipient address is required'));
    }

    // TODO: validate zkAddress

    if (!isAddress(_recipientAddress)) {
      return Promise.reject(t('Invalid Recipient address'));
    }

    const { chain, destChain, from, to } = form.getFieldsValue();

    const _destChain = destChain.split(`____${_AssetRefPath.MANTA_ZK}`)[0];

    if (!from || !chain || !_destChain) {
      return Promise.resolve();
    }

    if (destChain.includes(_AssetRefPath.MANTA_ZK)) {
      if (isSameAddress(from, _recipientAddress)) {
        return Promise.resolve();
      } else {
        return Promise.reject(t('The recipient address must be the same as the sender address'));
      }
    }

    const isOnChain = chain === _destChain;

    const account = findAccountByAddress(accounts, _recipientAddress);

    if (isOnChain) {
      if (isSameAddress(from, _recipientAddress)) {
        // todo: change message later
        return Promise.reject(t('The recipient address can not be the same as the sender address'));
      }

      const isNotSameAddressType = (isEthereumAddress(from) && !!_recipientAddress && !isEthereumAddress(_recipientAddress)) ||
        (!isEthereumAddress(from) && !!_recipientAddress && isEthereumAddress(_recipientAddress));

      if (isNotSameAddressType) {
        // todo: change message later
        return Promise.reject(t('The recipient address must be same type as the current account address.'));
      }
    } else {
      const isDestChainEvmCompatible = _isChainEvmCompatible(chainInfoMap[_destChain]);

      if (isDestChainEvmCompatible !== isEthereumAddress(to)) {
        // todo: change message later
        return Promise.reject(t(`The recipient address must be ${isDestChainEvmCompatible ? 'EVM' : 'substrate'} type`));
      }
    }

    if (account?.isHardware) {
      const destChainInfo = chainInfoMap[_destChain];
      const availableGen: string[] = account.availableGenesisHashes || [];

      if (!isEthereumAddress(account.address) && !availableGen.includes(destChainInfo?.substrateInfo?.genesisHash || '')) {
        const destChainName = destChainInfo?.name || 'Unknown';

        return Promise.reject(t('Wrong network. Your Ledger account is not supported by {{network}}. Please choose another receiving account and try again.', { replace: { network: destChainName } }));
      }
    }

    return Promise.resolve();
  }, [accounts, chainInfoMap, form, t]);

  const validateAmount = useCallback((rule: Rule, amount: string): Promise<void> => {
    if (!amount) {
      return Promise.reject(t('Amount is required'));
    }

    if ((new BigN(amount)).eq(new BigN(0))) {
      return Promise.reject(t('Amount must be greater than 0'));
    }

    if ((new BigN(amount)).gt(new BigN(maxTransfer))) {
      const maxString = formatBalance(maxTransfer, decimals);

      return Promise.reject(t('Amount must be equal or less than {{number}}', { replace: { number: maxString } }));
    }

    return Promise.resolve();
  }, [decimals, maxTransfer, t]);

  const onValuesChange: FormCallbacks<TransferFormProps>['onValuesChange'] = useCallback(
    (part: Partial<TransferFormProps>, values: TransferFormProps) => {
      const validateField: string[] = [];

      if (part.from) {
        setFrom(part.from);
        setForceUpdateMaxValue(undefined);
        form.resetFields(['asset']);
      }

      if (part.asset) {
        const chain = assetRegistry[part.asset].originChain;

        if (values.value) {
          validateField.push('value');
        }

        form.setFieldsValue({
          chain: chain,
          destChain: chain
        });

        if (values.to) {
          validateField.push('to');
        }

        setChain(chain);
        setAsset(part.asset);
        setIsTransferAll(false);
        setForceUpdateMaxValue(undefined);
      }

      if (part.destChain) {
        setForceUpdateMaxValue(isTransferAll ? {} : undefined);

        if (part.destChain.includes(_AssetRefPath.MANTA_ZK)) {
          form.setFieldValue('to', from);
          validateField.push('to');
        }

        if (values.to) {
          validateField.push('to');
        }
      }

      if (validateField.length) {
        form.validateFields(validateField).catch(noop);
      }
    },
    [setFrom, form, assetRegistry, setChain, setAsset, isTransferAll, from]
  );

  // Submit transaction
  const onSubmit: FormCallbacks<TransferFormProps>['onFinish'] = useCallback((values: TransferFormProps) => {
    setLoading(true);
    const { destChain, to, value } = values;

    let sendPromise: Promise<SWTransactionResponse>;

    const account = findAccountByAddress(accounts, from);

    if (!account) {
      setLoading(false);
      notification({
        message: t("Can't find account"),
        type: 'error'
      });

      return;
    }

    const isLedger = !!account.isHardware;
    const isEthereum = isEthereumAddress(account.address);
    const chainAsset = assetRegistry[asset];

    if (chain === destChain.split(`____${_AssetRefPath.MANTA_ZK}`)[0]) {
      if (isLedger) {
        if (isEthereum) {
          if (!_isTokenTransferredByEvm(chainAsset)) {
            setLoading(false);
            notification({
              message: t('Ledger does not support transfer for this token'),
              type: 'warning'
            });

            return;
          }
        }
      }

      // Transfer token or send fund
      sendPromise = makeTransfer({
        from,
        networkKey: destChain,
        to: to,
        tokenSlug: asset,
        value: value,
        transferAll: isTransferAll
      });
    } else {
      if (isLedger) {
        setLoading(false);
        notification({
          message: t('This feature is not available for Ledger account'),
          type: 'warning'
        });

        return;
      }

      // Make cross chain transfer
      sendPromise = makeCrossChainTransfer({
        destinationNetworkKey: destChain,
        from,
        originNetworkKey: chain,
        tokenSlug: asset,
        to,
        value,
        transferAll: isTransferAll
      });
    }

    setTimeout(() => {
      // Handle transfer action
      sendPromise
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        })
      ;
    }, 300);
  }, [accounts, from, assetRegistry, asset, chain, notification, t, isTransferAll, onSuccess, onError]);

  const onFilterAccountFunc = useMemo(() => filterAccountFunc(chainInfoMap, assetRegistry, multiChainAssetMap, sendFundSlug), [assetRegistry, chainInfoMap, multiChainAssetMap, sendFundSlug]);

  const onSetMaxTransferable = useCallback((value: boolean) => {
    const bnMaxTransfer = new BN(maxTransfer);

    if (!bnMaxTransfer.isZero()) {
      setIsTransferAll(value);
    }
  }, [maxTransfer]);

  // TODO: Need to review
  // Auto fill logic
  useEffect(() => {
    const { asset, from } = form.getFieldsValue();

    const updateInfoWithTokenSlug = (tokenSlug: string) => {
      const tokenInfo = assetRegistry[tokenSlug];

      form.setFieldsValue({
        asset: tokenSlug,
        chain: tokenInfo.originChain,
        destChain: tokenInfo.originChain
      });
      setChain(tokenInfo.originChain);
    };

    if (tokenItems.length) {
      let isApplyDefaultAsset = true;

      if (!asset) {
        const account = findAccountByAddress(accounts, from);

        if (account?.originGenesisHash) {
          const network = findNetworkJsonByGenesisHash(chainInfoMap, account.originGenesisHash);

          if (network) {
            const token = tokenItems.find((item) => item.originChain === network.slug);

            if (token) {
              updateInfoWithTokenSlug(token.slug);
              isApplyDefaultAsset = false;
            }
          }
        }
      } else {
        // Apply default asset if current asset is not in token list
        isApplyDefaultAsset = !tokenItems.some((i) => i.slug === asset);
      }

      if (isApplyDefaultAsset) {
        updateInfoWithTokenSlug(tokenItems[0].slug);
      }
    }
  }, [accounts, tokenItems, assetRegistry, form, setChain, chainInfoMap]);

  // Get max transfer value
  useEffect(() => {
    let cancel = false;

    if (from && asset) {
      getMaxTransfer({
        address: from,
        networkKey: assetRegistry[asset].originChain,
        token: asset,
        isXcmTransfer: chain !== destChain,
        destChain
      })
        .then((balance) => {
          !cancel && setMaxTransfer(balance.value);
        })
        .catch(() => {
          !cancel && setMaxTransfer('0');
        })
        .finally(() => {
          if (!cancel) {
            const value = form.getFieldValue('value') as string;

            if (value) {
              setTimeout(() => {
                form.validateFields(['value']).finally(() => update({}));
              }, 100);
            }
          }
        });
    }

    return () => {
      cancel = true;
    };
  }, [asset, assetRegistry, chain, chainStatus, destChain, form, from]);

  useEffect(() => {
    const bnTransferAmount = new BN(transferAmount || '0');
    const bnMaxTransfer = new BN(maxTransfer || '0');

    if (bnTransferAmount.gt(BN_ZERO) && bnTransferAmount.eq(bnMaxTransfer)) {
      setIsTransferAll(true);
    }
  }, [maxTransfer, transferAmount]);

  return (
    <>
      <TransactionContent className={CN(`${className} -transaction-content`)}>
        <div className={'__brief common-text text-light-4 text-center'}>
          {t('You are performing a transfer of a fungible token')}
        </div>

        <Form
          className={'form-container form-space-sm'}
          form={form}
          initialValues={formDefault}
          onFinish={onSubmit}
          onValuesChange={onValuesChange}
        >
          <Form.Item
            className={CN({ hidden: !isAllAccount })}
            name={'from'}
          >
            <AccountSelector
              addressPrefix={fromChainNetworkPrefix}
              disabled={!isAllAccount}
              filter={onFilterAccountFunc}
              label={t('Send from')}
            />
          </Form.Item>

          <div className={'form-row'}>
            <Form.Item name={'asset'}>
              <TokenSelector
                disabled={!tokenItems.length}
                items={tokenItems}
                placeholder={t('Select token')}
                showChainInSelected
                tooltip={t('Select token')}
              />
            </Form.Item>

            <Icon
              className={'middle-item'}
              phosphorIcon={PaperPlaneRight}
              size={'md'}
            />

            <Form.Item name={'destChain'}>
              <ChainSelector
                disabled={!destChainItems.length}
                items={destChainItems}
                title={t('Select destination chain')}
                tooltip={t('Select destination chain')}
              />
            </Form.Item>
          </div>

          <Form.Item
            className={'hidden'}
            name={'chain'}
          >
            <Input
              placeholder={t('value')}
            />
          </Form.Item>

          <Form.Item
            name={'to'}
            rules={[
              {
                validator: validateRecipientAddress
              }
            ]}
            statusHelpAsTooltip={true}
            validateTrigger='onBlur'
          >
            <AddressInput
              addressPrefix={destChainNetworkPrefix}
              label={t('Send to')}
              networkGenesisHash={destChainGenesisHash}
              placeholder={t('Account address')}
              saveAddress={true}
              showAddressBook={true}
              showScanner={true}
            />
          </Form.Item>

          <Form.Item
            name={'value'}
            rules={[
              {
                validator: validateAmount
              }
            ]}
            statusHelpAsTooltip={true}
            validateTrigger='onBlur'
          >
            <AmountInput
              decimals={decimals}
              forceUpdateMaxValue={forceUpdateMaxValue}
              maxValue={maxTransfer}
              onSetMax={onSetMaxTransferable}
              showMaxButton={true}
              tooltip={t('Amount')}
            />
          </Form.Item>
        </Form>

        <FreeBalance
          address={from}
          chain={chain}
          onBalanceReady={setIsBalanceReady}
          tokenSlug={asset}
        />
      </TransactionContent>
      <TransactionFooter
        className={`${className} -transaction-footer`}
        errors={[]}
        warnings={[]}
      >
        <Button
          disabled={!isBalanceReady}
          icon={(
            <Icon
              phosphorIcon={PaperPlaneTilt}
              weight={'fill'}
            />
          )}
          loading={loading}
          onClick={checkAction(form.submit, extrinsicType)}
          schema={isTransferAll ? 'warning' : undefined}
        >
          {isTransferAll ? t('Transfer all') : t('Transfer')}
        </Button>
      </TransactionFooter>
    </>
  );
};

const SendFund = styled(_SendFund)(({ theme }) => {
  const token = (theme as Theme).token;

  return ({
    '.__brief': {
      paddingLeft: token.padding,
      paddingRight: token.padding,
      marginBottom: token.marginMD
    },

    '.form-row': {
      gap: 8
    },

    '.middle-item': {
      marginBottom: token.marginSM
    },

    '&.-transaction-content.-is-zero-balance': {
      '.free-balance .ant-number': {
        '.ant-number-integer, .ant-number-decimal': {
          color: `${token.colorError} !important`
        }
      }
    }
  });
});

export default SendFund;
