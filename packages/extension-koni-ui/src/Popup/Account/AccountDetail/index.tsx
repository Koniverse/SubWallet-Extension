// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountActions, AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { AccountChainTypeLogos, AccountProxyTypeTag, AddressSelectorItem, CloseIcon, Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { FilterTabItemType, FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useDefaultNavigate, useGetAccountProxyById, useNotification } from '@subwallet/extension-koni-ui/hooks';
import { editAccount, forgetAccount, validateAccountName } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AccountDetailParam, ThemeProps, VoidFunction } from '@subwallet/extension-koni-ui/types';
import { FormCallbacks, FormFieldData } from '@subwallet/extension-koni-ui/types/form';
import { copyToClipboard, findAccountByAddress } from '@subwallet/extension-koni-ui/utils';
import { convertFieldToObject } from '@subwallet/extension-koni-ui/utils/form/form';
import { Button, Form, Icon, Input } from '@subwallet/react-ui';
import CN from 'classnames';
import { Export, GitMerge, Trash } from 'phosphor-react';
import { RuleObject } from 'rc-field-form/lib/interface';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { AccountAddressList } from './AccountAddressList';
import { DerivedAccountList } from './DerivedAccountList';

enum FilterTabType {
  ACCOUNT_ADDRESS = 'account-address',
  DERIVED_ACCOUNT = 'derived-account',
  DERIVATION_INFO = 'derivation-info',
  MULTISIG_INFO = 'multisig-info',
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

// @ts-ignore
enum ActionType {
  EXPORT = 'export',
  DERIVE = 'derive',
  DELETE = 'delete'
}

interface DetailFormState {
  [FormFieldName.NAME]: string;
}

const Component: React.FC<ComponentProps> = ({ accountProxy, onBack, requestViewDerivedAccountDetails, requestViewDerivedAccounts }: ComponentProps) => {
  const showDerivedAccounts = !!accountProxy.children?.length;

  const { t } = useTranslation();

  const notify = useNotification();
  const { goHome } = useDefaultNavigate();
  const navigate = useNavigate();

  const { alertModal, deriveModal: { open: openDeriveModal } } = useContext(WalletModalContext);
  const { accountProxies, accounts } = useSelector((state: RootState) => state.accountState);
  const showDerivationInfoTab = useMemo((): boolean => {
    if (accountProxy.parentId) {
      return !!accountProxies.find((acc) => acc.id === accountProxy.parentId);
    } else {
      return false;
    }
  }, [accountProxies, accountProxy.parentId]);

  const multisigAccount = useMemo(() => {
    if (accountProxy.accountType === AccountProxyType.MULTISIG) {
      return accountProxy.accounts.find(
        (account) => account.isMultisig === true
      );
    }

    return undefined;
  }, [accountProxy.accountType, accountProxy.accounts]);

  const signers = multisigAccount?.signers;
  const isMultisig = multisigAccount?.isMultisig;
  const showMultisigAccountInfoTab = useMemo((): boolean => {
    if (Array.isArray(signers) && signers.every((item) => typeof item === 'string')) {
      return signers.length > 0;
    }

    return false;
  }, [signers]);

  const getDefaultFilterTab = () => {
    if (requestViewDerivedAccounts && showDerivedAccounts) {
      return FilterTabType.DERIVED_ACCOUNT;
    } else if (requestViewDerivedAccountDetails) {
      return FilterTabType.DERIVATION_INFO;
    } else if (showMultisigAccountInfoTab) {
      return FilterTabType.MULTISIG_INFO;
    } else {
      return FilterTabType.ACCOUNT_ADDRESS;
    }
  };

  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(getDefaultFilterTab());

  const [form] = Form.useForm<DetailFormState>();

  const saveTimeOutRef = useRef<NodeJS.Timer>();

  // @ts-ignore
  const [deleting, setDeleting] = useState(false);
  // @ts-ignore
  const [deriving, setDeriving] = useState(false);

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

    if (showMultisigAccountInfoTab) {
      result.push({
        label: t('Multisig members'),
        value: FilterTabType.MULTISIG_INFO
      });
    }

    return result;
  }, [showDerivationInfoTab, showDerivedAccounts, showMultisigAccountInfoTab, t]);

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

  // Todo: Recheck with pending transaction
  const onDelete = useCallback(() => {
    alertModal.open({
      title: isMultisig
        ? t('Remove multisig account')
        : t('ui.ACCOUNT.screen.Account.Detail.confirmation'),
      type: isMultisig ? NotificationType.ERROR : NotificationType.WARNING,
      content: isMultisig
        ? (
          <>
            <div className='description-alert-modal'>
            This account has pending multisig transactions. Removing the account now
            means you’ll have to re-import it later to complete these transactions
            </div>
          </>
        )
        : (
          t('ui.ACCOUNT.screen.Account.Detail.removeAccountAccessWarning')
        ),
      subtitle: isMultisig ? 'Are you sure you want to remove this account?' : undefined,
      okButton: {
        text: t('ui.ACCOUNT.screen.Account.Detail.remove'),
        schema: 'error',
        onClick: () => {
          doDelete();
          alertModal.close();
        }
      }
    });
  }, [alertModal, doDelete, isMultisig, t]);

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

  const onCopyAddress = useCallback((signer: string) => {
    return () => {
      copyToClipboard(signer || '');
      notify({
        message: t('ui.ACCOUNT.screen.Account.Detail.copiedToClipboard')
      });
    };
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
    const { accountType } = accountProxy;
    const isMultisig = accountType === AccountProxyType.MULTISIG;

    const deleteButton = (
      <Button
        block={isMultisig || ![AccountProxyType.UNIFIED, AccountProxyType.SOLO].includes(accountType)}
        className={CN('account-button')}
        icon={<Icon
          phosphorIcon={Trash}
          weight='fill'
        />}
        loading={deleting}
        onClick={onDelete}
        schema='error'
      >
        {isMultisig ? 'Remove' : t('ui.ACCOUNT.screen.Account.Detail.deleteAccount')}
      </Button>
    );

    if (isMultisig || ![AccountProxyType.UNIFIED, AccountProxyType.SOLO].includes(accountType)) {
      return deleteButton;
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
  }, [accountProxy, deleting, deriving, onDelete, onDerive, onExport, t]);

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
    } else if (showMultisigAccountInfoTab) {
      setSelectedFilterTab(FilterTabType.MULTISIG_INFO);
    } else {
      setSelectedFilterTab(FilterTabType.ACCOUNT_ADDRESS);
    }
  }, [requestViewDerivedAccountDetails, requestViewDerivedAccounts, showDerivedAccounts, showMultisigAccountInfoTab]);

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

  const renderSignerAddress = () => {
    if (!Array.isArray(signers)) {
      return null;
    }

    return (
      <div className={'signatory-item-wrapper'}>
        {signers.map((signer: string) => {
          const accountInWallet = findAccountByAddress(accounts, signer);

          return (<div
            className='signatory-item'
            key={signer}
          >
            <AddressSelectorItem
              address={signer}
              avatarValue={signer}
              className={CN('__list-selected-item')}
              isSelected={false}
              key={signer}
              name={accountInWallet?.name || ''}
              onCopyItem={onCopyAddress(signer)}
              showCopyIcon={true}
              showRemoveIcon={false}
            />
          </div>);
        })}
      </div>
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
        selectedFilterTab === FilterTabType.MULTISIG_INFO && (
          renderSignerAddress()
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

    '.signatory-item-wrapper': {
      display: 'flex',
      gap: 8,
      flexDirection: 'column',
      padding: token.padding,
      paddingTop: 12
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
      gap: 0,
      paddingLeft: token.paddingXXS,
      paddingRight: token.paddingXXS,

      '.__tab-item:after': {
        display: 'none'
      },

      '.__tab-item-label': {
        padding: token.paddingSM,
        lineHeight: '20px',
        fontSize: '11px',
        textTransform: 'uppercase'
      }
    }
  };
});

export default AccountDetail;
