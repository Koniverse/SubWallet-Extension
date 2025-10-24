// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { _chainInfoToAccountChainType } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountActions, AccountChainType, AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { AccountChainTypeLogos, AccountProxyTypeTag, CloseIcon, Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { FilterTabItemType, FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import { ADD_PROXY_TRANSACTION, DEFAULT_ADD_PROXY_PARAMS, DEFAULT_REMOVE_PROXY_PARAMS, REMOVE_PROXY_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useCoreCreateReformatAddress, useDefaultNavigate, useGetAccountProxyById, useNotification } from '@subwallet/extension-koni-ui/hooks';
import { editAccount, forgetAccount, validateAccountName } from '@subwallet/extension-koni-ui/messaging';
import { ProxyAccountList, ProxyItemSelector } from '@subwallet/extension-koni-ui/Popup/Account/AccountDetail/ProxyAccountList';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AccountDetailParam, AddProxyParams, RemoveProxyParams, ThemeProps, VoidFunction } from '@subwallet/extension-koni-ui/types';
import { FormCallbacks, FormFieldData } from '@subwallet/extension-koni-ui/types/form';
import { convertFieldToObject } from '@subwallet/extension-koni-ui/utils/form/form';
import { Button, Form, Icon, Input } from '@subwallet/react-ui';
import CN from 'classnames';
import { Export, GitMerge, Trash, TreeStructure, XCircle } from 'phosphor-react';
import { RuleObject } from 'rc-field-form/lib/interface';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { AccountAddressList } from './AccountAddressList';
import { DerivedAccountList } from './DerivedAccountList';

enum FilterTabType {
  ACCOUNT_ADDRESS = 'account-address',
  DERIVED_ACCOUNT = 'derived-account',
  DERIVATION_INFO = 'derivation-info',
  MANAGE_PROXIES = 'manage-proxies'
}

type Props = ThemeProps;
type ComponentProps = {
  accountProxy: AccountProxy;
  onBack: VoidFunction;
  requestViewDerivedAccountDetails?: boolean;
  requestViewDerivedAccounts?: boolean;
};

enum FormFieldName {
  NAME = 'name',
  DERIVED_SURI = 'derived-suri',
  DERIVED_NAME = 'derived-name',
}

interface DetailFormState {
  [FormFieldName.NAME]: string;
}

const Component: React.FC<ComponentProps> = ({ accountProxy,
  onBack,
  requestViewDerivedAccountDetails,
  requestViewDerivedAccounts }: ComponentProps) => {
  const showDerivedAccounts = !!accountProxy.children?.length;

  const { t } = useTranslation();

  const notify = useNotification();
  const { goHome } = useDefaultNavigate();
  const navigate = useNavigate();

  const { alertModal, deriveModal: { open: openDeriveModal } } = useContext(WalletModalContext);
  const [, setAddProxyParamsStorage] = useLocalStorage<AddProxyParams>(ADD_PROXY_TRANSACTION, DEFAULT_ADD_PROXY_PARAMS);
  const [, setRemoveProxyParamsStorage] = useLocalStorage<RemoveProxyParams>(REMOVE_PROXY_TRANSACTION, DEFAULT_REMOVE_PROXY_PARAMS);
  const getReformatAddress = useCoreCreateReformatAddress();
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const showDerivationInfoTab = useMemo((): boolean => {
    if (accountProxy.parentId) {
      return !!accountProxies.find((acc) => acc.id === accountProxy.parentId);
    } else {
      return false;
    }
  }, [accountProxies, accountProxy.parentId]);

  const getDefaultFilterTab = () => {
    if (requestViewDerivedAccounts && showDerivedAccounts) {
      return FilterTabType.DERIVED_ACCOUNT;
    } else if (requestViewDerivedAccountDetails) {
      return FilterTabType.DERIVATION_INFO;
    } else {
      return FilterTabType.ACCOUNT_ADDRESS;
    }
  };

  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(getDefaultFilterTab());

  const [proxyAccountsSelected, setProxyAccountsSelected] = useState<Record<string, ProxyItemSelector>>({});
  const [networkSelected, setNetworkSelected] = useState<string>();

  const [form] = Form.useForm<DetailFormState>();

  const saveTimeOutRef = useRef<NodeJS.Timer>();

  // @ts-ignore
  const [deleting, setDeleting] = useState(false);
  // @ts-ignore
  const [deriving, setDeriving] = useState(false);

  const addressFormated = useMemo(() => {
    if (!networkSelected) {
      return;
    }

    const chainInfoSelected = chainInfoMap[networkSelected];

    if (!chainInfoSelected || !chainInfoSelected.substrateInfo) {
      return;
    }

    const compatibleChainTypes = _chainInfoToAccountChainType(chainInfoSelected);
    const accountSubstrate = accountProxy.accounts.find(({ chainType }) => chainType === compatibleChainTypes);

    if (!accountSubstrate) {
      return;
    }

    return getReformatAddress(accountSubstrate, chainInfoSelected);
  }, [accountProxy.accounts, chainInfoMap, getReformatAddress, networkSelected]);

  const canManageProxies = useMemo(() => {
    if (accountProxy?.chainTypes.includes(AccountChainType.SUBSTRATE)) {
      return true;
    }

    if (accountProxy.chainTypes.includes(AccountChainType.ETHEREUM)) {
      if (accountProxy.accountType === AccountProxyType.LEDGER) {
        return accountProxy.accounts[0].isSubstrateECDSA;
      }

      return true;
    }

    return false;
  }, [accountProxy]);

  const filterTabItems = useMemo<FilterTabItemType[]>(() => {
    const result = [
      {
        label: t('ui.ACCOUNT.screen.Account.Detail.accountAddress'),
        value: FilterTabType.ACCOUNT_ADDRESS
      }
    ];

    if (showDerivedAccounts) {
      result.push({
        label: t('ui.ACCOUNT.screen.Account.Detail.derivedAccount'),
        value: FilterTabType.DERIVED_ACCOUNT
      });
    }

    if (showDerivationInfoTab) {
      result.push({
        label: t('ui.ACCOUNT.screen.Account.Detail.derivationInfo'),
        value: FilterTabType.DERIVATION_INFO
      });
    }

    if (canManageProxies) {
      result.push(
        {
          label: t('ui.ACCOUNT.screen.Account.Detail.manageProxies'),
          value: FilterTabType.MANAGE_PROXIES
        });
    }

    return result;
  }, [canManageProxies, showDerivationInfoTab, showDerivedAccounts, t]);

  const onAddProxyAccount = useCallback(() => {
    if (!addressFormated || !networkSelected) {
      return;
    }

    setAddProxyParamsStorage({
      ...DEFAULT_ADD_PROXY_PARAMS,
      chain: networkSelected,
      from: addressFormated
    });

    navigate('/transaction/add-proxy');
  }, [addressFormated, navigate, networkSelected, setAddProxyParamsStorage]);

  const onRemoveProxyAccounts = useCallback(() => {
    if (!addressFormated || !networkSelected) {
      return;
    }

    const proxyAddressKeys = Object.keys(proxyAccountsSelected).filter((key) => proxyAccountsSelected[key].isSelected);

    setRemoveProxyParamsStorage({
      ...DEFAULT_REMOVE_PROXY_PARAMS,
      chain: networkSelected,
      proxyAddressKeys,
      from: addressFormated
    });

    navigate('/transaction/remove-proxy');
  }, [addressFormated, navigate, networkSelected, proxyAccountsSelected, setRemoveProxyParamsStorage]);

  const onCancelRemoveProxyAccounts = useCallback(() => {
    setProxyAccountsSelected((prevState) => {
      const newState: Record<string, ProxyItemSelector> = {};

      Object.keys(prevState).forEach((key) => {
        newState[key] = {
          ...prevState[key],
          isSelected: false
        };
      });

      return newState;
    });
  }, []);

  const onSelectFilterTab = useCallback((value: string) => {
    setSelectedFilterTab(value);
  }, []);

  const doDelete = useCallback(() => {
    setDeleting(true);
    forgetAccount(accountProxy.id)
      .then(() => {
        goHome();
      })
      .catch((e: Error) => {
        notify({
          message: e.message,
          type: 'error'
        });
      })
      .finally(() => {
        setDeleting(false);
      });
  }, [accountProxy.id, goHome, notify]);

  const onDelete = useCallback(() => {
    alertModal.open({
      title: t('ui.ACCOUNT.screen.Account.Detail.confirmation'),
      type: NotificationType.WARNING,
      content: t('ui.ACCOUNT.screen.Account.Detail.removeAccountAccessWarning'),
      okButton: {
        text: t('ui.ACCOUNT.screen.Account.Detail.remove'),
        onClick: () => {
          doDelete();
          alertModal.close();
        },
        schema: 'error'
      }
    });
  }, [alertModal, doDelete, t]);

  const onDerive = useCallback(() => {
    if (accountProxy) {
      openDeriveModal({
        proxyId: accountProxy.id
      });
    }
  }, [accountProxy, openDeriveModal]);

  const onExport = useCallback(() => {
    if (accountProxy?.id) {
      navigate(`/accounts/export/${accountProxy.id}`);
    }
  }, [accountProxy?.id, navigate]);

  // @ts-ignore
  const onCopyAddress = useCallback(() => {
    notify({
      message: t('ui.ACCOUNT.screen.Account.Detail.copiedToClipboard')
    });
  }, [notify, t]);

  const parentDerivedAccountProxy = useMemo(() => {
    if (showDerivationInfoTab) {
      return accountProxies.find((acc) => acc.id === accountProxy.parentId);
    }

    return null;
  }, [accountProxies, accountProxy.parentId, showDerivationInfoTab]);

  const accountNameValidator = useCallback(async (validate: RuleObject, value: string) => {
    const accountProxyId = accountProxy.id;

    if (value) {
      try {
        const { isValid } = await validateAccountName({ name: value, proxyId: accountProxyId });

        if (!isValid) {
          return Promise.reject(t('ui.ACCOUNT.screen.Account.Detail.accountNameInUse'));
        }
      } catch (e) {
        return Promise.reject(t('ui.ACCOUNT.screen.Account.Detail.accountNameInvalid'));
      }
    }

    return Promise.resolve();
  }, [accountProxy.id, t]);

  const onUpdate: FormCallbacks<DetailFormState>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    const changeMap = convertFieldToObject<DetailFormState>(changedFields);

    if (changeMap[FormFieldName.NAME]) {
      clearTimeout(saveTimeOutRef.current);

      const isValidForm = form.getFieldsError().every((field) => !field.errors.length);

      if (isValidForm) {
        saveTimeOutRef.current = setTimeout(() => {
          form.submit();
        }, 1000);
      }
    }
  }, [form]);

  const onSubmit: FormCallbacks<DetailFormState>['onFinish'] = useCallback((values: DetailFormState) => {
    clearTimeout(saveTimeOutRef.current);
    const name = values[FormFieldName.NAME];

    if (name === accountProxy.name) {
      return;
    }

    const accountProxyId = accountProxy.id;

    if (!accountProxyId) {
      return;
    }

    editAccount(accountProxyId, name.trim())
      .catch((error: Error) => {
        form.setFields([{ name: FormFieldName.NAME, errors: [error.message] }]);
      });
  }, [accountProxy.id, accountProxy.name, form]);

  const footerNode = useMemo(() => {
    if (selectedFilterTab === FilterTabType.MANAGE_PROXIES) {
      const proxyAccounts = Object.values(proxyAccountsSelected);
      const haveNoProxyAccounts = proxyAccounts.length === 0;

      if (haveNoProxyAccounts) {
        return <></>;
      }

      const isAnyProxyAccountSelected = Object.values(proxyAccountsSelected).some(({ isSelected }) => isSelected);

      if (isAnyProxyAccountSelected) {
        return (
          <>
            <Button
              block={true}
              className={CN('account-button')}
              icon={(
                <Icon
                  phosphorIcon={XCircle}
                  weight='fill'
                />
              )}
              onClick={onCancelRemoveProxyAccounts}
              schema='secondary'
            >
              {t('ui.ACCOUNT.screen.Account.Detail.cancelRemoveProxy')}
            </Button>
            <Button
              block={true}
              className={CN('account-button')}
              icon={(
                <Icon
                  phosphorIcon={Trash}
                  weight='fill'
                />
              )}
              onClick={onRemoveProxyAccounts}
              schema='error'
            >
              {t('ui.ACCOUNT.screen.Account.Detail.removeProxy')}
            </Button>
          </>
        );
      }

      return (
        <Button
          block={true}
          className={CN('account-button')}
          disabled={accountProxy.accountType === AccountProxyType.READ_ONLY}
          icon={(
            <Icon
              phosphorIcon={TreeStructure}
              weight='fill'
            />
          )}
          onClick={onAddProxyAccount}
          schema='primary'
        >
          {t('ui.ACCOUNT.screen.Account.Detail.addProxy')}
        </Button>
      );
    }

    if (![AccountProxyType.UNIFIED, AccountProxyType.SOLO].includes(accountProxy.accountType)) {
      return (
        <Button
          block={true}
          className={CN('account-button')}
          disabled={false}
          icon={(
            <Icon
              phosphorIcon={Trash}
              weight='fill'
            />
          )}
          loading={deleting}
          onClick={onDelete}
          schema='error'
        >
          {t('ui.ACCOUNT.screen.Account.Detail.deleteAccount')}
        </Button>
      );
    }

    return <>
      <Button
        className={CN('account-button')}
        disabled={false}
        icon={(
          <Icon
            phosphorIcon={Trash}
            weight='fill'
          />
        )}
        loading={deleting}
        onClick={onDelete}
        schema='error'
      />
      <Button
        block={true}
        className={CN('account-button')}
        disabled={!accountProxy.accountActions.includes(AccountActions.DERIVE)}
        icon={(
          <Icon
            phosphorIcon={GitMerge}
            weight='fill'
          />
        )}
        loading={deriving}
        onClick={onDerive}
        schema='secondary'
      >
        {t('ui.ACCOUNT.screen.Account.Detail.derive')}
      </Button>
      <Button
        block={true}
        className={CN('account-button')}
        icon={(
          <Icon
            phosphorIcon={Export}
            weight='fill'
          />
        )}
        onClick={onExport}
        schema='secondary'
      >
        {t('ui.ACCOUNT.screen.Account.Detail.export')}
      </Button>
    </>;
  }, [accountProxy.accountActions, accountProxy.accountType, deleting, deriving, onAddProxyAccount, onCancelRemoveProxyAccounts, onDelete, onDerive, onExport, onRemoveProxyAccounts, proxyAccountsSelected, selectedFilterTab, t]);

  useEffect(() => {
    if (accountProxy) {
      form.setFieldValue(FormFieldName.NAME, accountProxy.name);
    }
  }, [accountProxy, form]);

  useEffect(() => {
    if (requestViewDerivedAccounts && showDerivedAccounts) {
      setSelectedFilterTab(FilterTabType.DERIVED_ACCOUNT);
    } else if (requestViewDerivedAccountDetails) {
      setSelectedFilterTab(FilterTabType.DERIVATION_INFO);
    } else {
      setSelectedFilterTab(FilterTabType.ACCOUNT_ADDRESS);
    }
  }, [requestViewDerivedAccountDetails, requestViewDerivedAccounts, showDerivedAccounts]);

  const renderDetailDerivedAccount = () => {
    return (
      <>
        <Form
          className={'derivation-info-form form-space-sm'}
          form={form}
          initialValues={{
            [FormFieldName.DERIVED_SURI]: accountProxy.suri || '',
            [FormFieldName.DERIVED_NAME]: parentDerivedAccountProxy?.name || ''

          }}
          name='derivation-info-form'
        >
          <Form.Item
            name={'derived-suri'}
            statusHelpAsTooltip={true}
          >
            <Input
              disabled={true}
              label={t('ui.ACCOUNT.screen.Account.Detail.derivationPath')}
              placeholder={t('ui.ACCOUNT.screen.Account.Detail.derivationPath')}
            />
          </Form.Item>
          {!!parentDerivedAccountProxy && <Form.Item
            name={'derived-name'}
            statusHelpAsTooltip={true}
          >
            <Input
              disabled={true}
              label={t('ui.ACCOUNT.screen.Account.Detail.parentAccount')}
              placeholder={t('ui.ACCOUNT.screen.Account.Detail.parentAccount')}
            />
          </Form.Item>}
        </Form>
      </>
    );
  };

  return (
    <Layout.WithSubHeaderOnly
      disableBack={false}
      footer={footerNode}
      subHeaderIcons={[
        {
          icon: <CloseIcon />,
          onClick: onBack,
          disabled: false
        }
      ]}
      title={t('ui.ACCOUNT.screen.Account.Detail.accountDetails')}
    >
      <Form
        className={'account-detail-form'}
        form={form}
        initialValues={{
          [FormFieldName.NAME]: accountProxy.name || ''
        }}
        name='account-detail-form'
        onFieldsChange={onUpdate}
        onFinish={onSubmit}
      >
        <div className='account-field-wrapper'>
          <div className='account-type-tag-wrapper'>
            <AccountProxyTypeTag
              className={'account-type-tag'}
              type={accountProxy.accountType}
            />
          </div>
          <Form.Item
            className={CN('account-field')}
            name={FormFieldName.NAME}
            rules={[
              {
                message: t('ui.ACCOUNT.screen.Account.Detail.accountNameRequired'),
                transform: (value: string) => value.trim(),
                required: true
              },
              {
                validator: accountNameValidator
              }
            ]}
            statusHelpAsTooltip={true}
          >
            <Input
              className='account-name-input'
              disabled={false}
              label={t('ui.ACCOUNT.screen.Account.Detail.accountName')}
              onBlur={form.submit}
              placeholder={t('ui.ACCOUNT.screen.Account.Detail.accountName')}
              suffix={(
                <AccountChainTypeLogos
                  chainTypes={accountProxy.chainTypes}
                  className={'__account-item-chain-type-logos'}
                />
              )}
            />
          </Form.Item>
        </div>
      </Form>

      <FilterTabs
        className={'filter-tabs-container'}
        items={filterTabItems}
        onSelect={onSelectFilterTab}
        selectedItem={selectedFilterTab}
      />
      {
        selectedFilterTab === FilterTabType.ACCOUNT_ADDRESS && (
          <AccountAddressList
            accountProxy={accountProxy}
            className={'list-container'}
          />
        )
      }
      {
        selectedFilterTab === FilterTabType.DERIVED_ACCOUNT && (
          <DerivedAccountList
            accountProxy={accountProxy}
            className={'list-container'}
          />
        )
      }
      {
        selectedFilterTab === FilterTabType.DERIVATION_INFO && (
          renderDetailDerivedAccount()
        )
      }
      {
        selectedFilterTab === FilterTabType.MANAGE_PROXIES && (
          <ProxyAccountList
            accountProxy={accountProxy}
            address={addressFormated || ''}
            className={'list-container'}
            networkSelected={networkSelected}
            proxyAccountsSelected={proxyAccountsSelected}
            setNetworkSelected={setNetworkSelected}
            setProxyAccountsSelected={setProxyAccountsSelected}
          />
        )
      }
    </Layout.WithSubHeaderOnly>
  );
};

const Wrapper = ({ className }: Props) => {
  const { goHome } = useDefaultNavigate();
  const { accountProxyId } = useParams();
  const accountProxy = useGetAccountProxyById(accountProxyId);
  const locationState = useLocation().state as AccountDetailParam | undefined;

  useEffect(() => {
    if (!accountProxy) {
      goHome();
    }
  }, [accountProxy, goHome]);

  if (!accountProxy) {
    return (
      <></>
    );
  }

  return (
    <PageWrapper
      className={CN(className)}
    >
      <Component
        accountProxy={accountProxy}
        onBack={goHome}
        requestViewDerivedAccountDetails={locationState?.requestViewDerivedAccountDetails}
        requestViewDerivedAccounts={locationState?.requestViewDerivedAccounts}
      />
    </PageWrapper>
  );
};

const AccountDetail = styled(Wrapper)<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-screen-layout-body': {
      display: 'flex',
      overflow: 'hidden',
      flexDirection: 'column'
    },
    '.derivation-wrapper': {
      paddingLeft: token.padding,
      paddingRight: token.padding
    },
    '.derivation-info-form.derivation-info-form': {
      paddingTop: 0
    },

    '.ant-sw-screen-layout-footer': {
      paddingTop: token.paddingSM,
      paddingBottom: 24
    },

    '.ant-sw-screen-layout-footer-content': {
      display: 'flex',
      gap: token.sizeSM
    },

    '.__account-item-chain-type-logos': {
      minHeight: 20,
      marginRight: 12,
      marginLeft: 12
    },

    '.account-detail-form, .derivation-info-form': {
      paddingTop: token.padding,
      paddingLeft: token.padding,
      paddingRight: token.padding
    },

    '.account-detail-form .ant-form-item': {
      marginBottom: 0
    },

    '.account-field-wrapper': {
      position: 'relative'
    },

    '.account-type-tag-wrapper': {
      position: 'absolute',
      zIndex: 1,
      right: token.sizeSM,
      top: token.sizeXS,
      display: 'flex'
    },

    '.account-type-tag': {
      marginRight: 0
    },

    '.account-type-tag + .derived-account-flag': {
      marginLeft: token.marginXS,
      color: token.colorTextLight3
    },

    '.account-name-input .ant-input-suffix .anticon': {
      minWidth: 40,
      justifyContent: 'center'
    },

    '.list-container': {
      flex: 1
    },

    '.filter-tabs-container': {
      paddingInline: token.paddingXXS - 2,
      marginInline: token.margin,

      '.__tab-item:after': {
        display: 'none'
      },

      '.__tab-item-label': {
        lineHeight: '20px',
        fontSize: '11px',
        textTransform: 'uppercase'
      }
    }
  };
});

export default AccountDetail;
