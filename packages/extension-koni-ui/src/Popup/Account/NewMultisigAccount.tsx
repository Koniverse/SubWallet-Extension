// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxyType } from '@subwallet/extension-base/types';
import { AccountNameModal, AccountProxyAvatar, AddressSelectorItem, CloseIcon, EmptyList, Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import AddSignerMultisigModal from '@subwallet/extension-koni-ui/components/Modal/AddressBook/AddSignerMultisigModal';
import { ACCOUNT_NAME_MODAL, CONFIRM_TERM_SEED_PHRASE, CREATE_ACCOUNT_MODAL, DEFAULT_ROUTER_PATH, MULTISIG_SIGNERS, SEED_PREVENT_MODAL, TERM_AND_CONDITION_SEED_PHRASE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useAutoNavigateToCreatePassword, useCompleteCreateAccount, useDefaultNavigate, useNotification, useTranslation, useUnlockChecker } from '@subwallet/extension-koni-ui/hooks';
import { createAccountMultisig } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { SeedPhraseTermStorage, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isNoAccount } from '@subwallet/extension-koni-ui/utils';
import { Button, Form, Icon, Input, ModalContext } from '@subwallet/react-ui';
import { Rule } from '@subwallet/react-ui/es/form';
import CN from 'classnames';
import { Book, ListChecks, PlusCircle } from 'phosphor-react';
import React, { SyntheticEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';

type Props = ThemeProps;

const accountNameModalId = ACCOUNT_NAME_MODAL;
const GeneralTermLocalDefault: SeedPhraseTermStorage = { state: 'nonConfirmed', useDefaultContent: false };

interface MultisigParams {
  signerAddress: string;
  thresshold: string;
}

export interface SignerData {
  address: string;
  displayName?: string;
  proxyId?: string;
  formatedAddress: string;
}

const addressBookId = 'input-multisig-account-address-book-modal';

const Component: React.FC<Props> = ({ className }: Props) => {
  useAutoNavigateToCreatePassword();
  const { t } = useTranslation();
  const notify = useNotification();
  const navigate = useNavigate();
  const [confirmedTermSeedPhrase, setConfirmedTermSeedPhrase] = useLocalStorage<SeedPhraseTermStorage>(CONFIRM_TERM_SEED_PHRASE, GeneralTermLocalDefault);
  const { goHome } = useDefaultNavigate();
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const checkUnlock = useUnlockChecker();
  const [form] = Form.useForm<MultisigParams>();
  const [signers, setSigners] = useLocalStorage<SignerData[]>(MULTISIG_SIGNERS, []);

  const formDefault = useMemo<MultisigParams>(() => {
    return {
      signerAddress: '',
      thresshold: ''
    };
  }, []);

  const signerAddressValue = Form.useWatch('signerAddress', form);
  const thresholdValue = Form.useWatch('thresshold', form);

  const onComplete = useCompleteCreateAccount();

  const { accounts } = useSelector((state: RootState) => state.accountState);

  const [preventModalStorage] = useLocalStorage(SEED_PREVENT_MODAL, false);
  const [preventModal] = useState(preventModalStorage);

  const [loading, setLoading] = useState(false);

  const noAccount = useMemo(() => isNoAccount(accounts), [accounts]);

  const signerAddresses = useMemo(
    () => signers.map((s) => s.address),
    [signers]
  );

  const resetMultisigDraft = useCallback(() => {
    setSigners([]);
    form.resetFields();
  }, [setSigners, form]);

  const onBack = useCallback(() => {
    resetMultisigDraft();
    navigate(DEFAULT_ROUTER_PATH);

    if (!preventModal) {
      if (!noAccount) {
        activeModal(CREATE_ACCOUNT_MODAL);
      }
    }
  }, [resetMultisigDraft, navigate, preventModal, noAccount, activeModal]);

  const onGoHome = useCallback(() => {
    resetMultisigDraft();
    goHome();
  }, [resetMultisigDraft, goHome]);

  const onDeleteSigner = useCallback((addressToDelete: string) => () => {
    setSigners((prev) => prev.filter((item) => item.address !== addressToDelete));
  }, [setSigners]);

  const onConfirmSignatory = useCallback(() => {
    checkUnlock().then(() => {
      activeModal(accountNameModalId);
    }).catch(() => {
      // User cancel unlock
    });
  }, [activeModal, checkUnlock]);

  const onOpenAddressBook = useCallback((e?: SyntheticEvent) => {
    e && e.stopPropagation();
    activeModal(addressBookId);
  }, [activeModal]);

  const onConfirmSelectSigners = useCallback((selectedItems: SignerData[]) => {
    setSigners((prev) => {
      const existingAddresses = prev.map((s) => s.address);

      const newItems: SignerData[] = selectedItems
        .filter((item) => !existingAddresses.includes(item.address))
        .map((item) => ({
          address: item.address,
          displayName: item.displayName,
          proxyId: item.proxyId,
          formatedAddress: item.formatedAddress
        }));

      return [...prev, ...newItems];
    });
  }, [setSigners]);

  const onAddManualSigner = useCallback(() => {
    const address = form.getFieldValue('signerAddress') as string;

    setSigners((prev) => [
      ...prev,
      {
        address: address,
        proxyId: address,
        formatedAddress: address
      }
    ]);

    form.resetFields(['signerAddress']);
  }, [form, setSigners]);

  const emptyList = useCallback(() => {
    return (
      <EmptyList
        className={'__empty-list-signatory-list'}
        emptyMessage={t('Select signatories to create your multisig account')}
        emptyTitle={t('Signatory list')}
        phosphorIcon={ListChecks}
      />
    );
  }, [t]);

  const validateSignerAddress = useCallback((rule: Rule): Promise<void> => {
    const { signerAddress } = form.getFieldsValue();

    if (!isAddress(signerAddress) || isEthereumAddress(signerAddress)) {
      return Promise.reject(t('Invalid recipient address'));
    }

    return Promise.resolve();
  }, [form, t]);

  const validateThresshold = useCallback(
    async (_: Rule, value?: string) => {
      if (!value) {
        return Promise.reject(t('Threshold is required'));
      }

      const threshold = Number(value);

      if (!Number.isInteger(threshold)) {
        return Promise.reject(t('Threshold must be a natural number'));
      }

      if (threshold <= 0) {
        return Promise.reject(t('Threshold must be greater than 0'));
      }

      if (threshold > signers.length) {
        return Promise.reject(
          t('Threshold cannot be greater than number of signers')
        );
      }

      return Promise.resolve();
    },
    [signers.length, t]
  );

  const onSubmit = useCallback((accountName: string) => {
    setLoading(true);
    createAccountMultisig({
      signers: signerAddresses,
      threshold: parseInt(thresholdValue),
      name: accountName
    })
      .then(() => {
        onComplete();
      })
      .catch((error: Error): void => {
        notify({
          message: error.message,
          type: 'error'
        });
      })
      .finally(() => {
        setLoading(false);
        inactiveModal(accountNameModalId);
      });
  }, [inactiveModal, notify, onComplete, signerAddresses, thresholdValue]);

  useEffect(() => {
    // Note: This useEffect checks if the data in localStorage has already been migrated from the old "string" structure to the new structure in "SeedPhraseTermStorage".
    const item = localStorage.getItem(CONFIRM_TERM_SEED_PHRASE);

    if (item) {
      const confirmedTermSeedPhrase_ = JSON.parse(item) as string | SeedPhraseTermStorage;

      if (typeof confirmedTermSeedPhrase_ === 'string') {
        setConfirmedTermSeedPhrase({ ...GeneralTermLocalDefault, state: confirmedTermSeedPhrase_ });
      }
    }
  }, [setConfirmedTermSeedPhrase]);

  useEffect(() => {
    if (confirmedTermSeedPhrase.state === 'nonConfirmed') {
      activeModal(TERM_AND_CONDITION_SEED_PHRASE_MODAL);
    }
  }, [confirmedTermSeedPhrase.state, activeModal, inactiveModal, setConfirmedTermSeedPhrase]);

  return (
    <PageWrapper
      className={CN(className)}
    >
      <Layout.WithSubHeaderOnly
        onBack={preventModal ? onGoHome : onBack}
        rightFooterButton={{
          children: t('Continue'),
          onClick: onConfirmSignatory,
          disabled: signers.length === 0 || !thresholdValue
        }}
        subHeaderIcons={preventModal
          ? undefined
          : [
            {
              icon: <CloseIcon />,
              onClick: onGoHome
            }
          ]}
        subHeaderLeft={preventModal ? <CloseIcon /> : undefined }
        title={t('Create multisig account')}
      >
        <div className={'container'}>
          <Form
            form={form}
            initialValues={formDefault}
          >
            <div className={'signatory-label'}>{'Add signatory'.toUpperCase()}</div>
            <div className={'signatory-form-wrapper'}>
              <div className={'signatory-form-left'}>
                <Form.Item
                  className={'signatory-form-address'}
                  name='signerAddress'
                  rules={[
                    {
                      validator: validateSignerAddress
                    }
                  ]}
                  statusHelpAsTooltip={true}
                >
                  <Input
                    placeholder={'Enter address'}
                    prefix={
                      <AccountProxyAvatar
                        size={24}
                        value={signerAddressValue || ''}
                      />
                    }
                    suffix={(
                      <Button
                        disabled={false}
                        icon={(
                          <Icon
                            phosphorIcon={Book}
                            size='sm'
                          />
                        )}
                        onClick={onOpenAddressBook}
                        size='xs'
                        type={'ghost'}
                      />
                    )}
                  />
                </Form.Item>
              </div>
              <div className={'signatory-form-right'}>
                <Button
                  block={true}
                  disabled={!signerAddressValue}
                  icon={(
                    <Icon
                      className={'icon-remove'}
                      customSize={'28px'}
                      phosphorIcon={PlusCircle}
                    />
                  )}
                  onClick={onAddManualSigner}
                  schema='secondary'
                  size={'sm'}
                >
                </Button>
              </div>
            </div>
            <div className={CN('signatory-list-wrapper', { '-is-sinatory-empty': signers.length === 0 })}>
              {signers.length === 0
                ? emptyList()
                : (
                  <>
                    <div className={'signatories-label'}>{'Signatories'.toUpperCase()}</div>
                    <div className='signatory-list-content'>
                      {signers.map((signer) => (
                        <div
                          className='signatory-item-wrapper'
                          key={signer.address}
                        >
                          <AddressSelectorItem
                            address={signer.formatedAddress}
                            avatarValue={signer.proxyId}
                            className={CN('__list-selected-item')}
                            isSelected={false}
                            key={signer.address}
                            name={signer.displayName}
                            onRemoveItem={onDeleteSigner(signer.address)}
                            showRemoveIcon={true}
                          />
                        </div>
                      ))}
                    </div>
                    <div className={'threshold-label'}>{'Set approval thresold'.toUpperCase()}</div>
                    <div className={'threshold-form-wrapper'}>
                      <Form.Item
                        name={'thresshold'}
                        rules={[
                          {
                            validator: validateThresshold
                          }
                        ]}
                      >
                        <Input
                          className={'threshold-form-input'}
                          placeholder={'Enter threshold'}
                          suffix={`/ ${signers.length > 0 ? signers.length : ''}`}
                        />
                      </Form.Item>
                    </div>
                  </>
                )}
            </div>
          </Form>
        </div>
      </Layout.WithSubHeaderOnly>
      <AddSignerMultisigModal
        chainSlug={'polkadot'}
        id={addressBookId}
        onConfirm={onConfirmSelectSigners}
        selectedSigners={signers}
        tokenSlug={'polkadot'}
      />
      <AccountNameModal
        accountType={AccountProxyType.MULTISIG}
        isLoading={loading}
        onSubmit={onSubmit}
      />
    </PageWrapper>
  );
};

const NewMultisigAccount = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.container': {
      padding: token.padding,
      textAlign: 'center'
    },

    '.description': {
      padding: `0 ${token.padding}px`,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      color: token.colorTextDescription,
      marginBottom: token.margin
    },

    '.signatory-form-wrapper': {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: token.marginSM
    },

    '.signatory-label, .threshold-label, .signatories-label': {
      display: 'flex',
      marginBottom: token.marginSM
    },

    '.signatory-form-left': {
      flex: 1,
      '.signatory-form-address': {
        marginBottom: 0
      }
    },

    '.-is-sinatory-empty': {
      backgroundColor: token.colorBgSecondary,
      marginBottom: token.marginSM
    },

    '.__empty-list-signatory-list': {
      marginTop: 0,
      padding: token.padding
    },

    '.threshold-form-input': {
      '.ant-input-suffix': {
        paddingRight: token.paddingSM
      }
    },

    '.signatory-list-content': {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginBottom: token.marginSM
    },

    '.signatory-item-wrapper': {
      flexDirection: 'row',
      display: 'flex'
    },

    '.__list-selected-item': {
      flex: 1,
      '.__address': {
        display: 'flex'
      }
    }
  };
});

export default NewMultisigAccount;
