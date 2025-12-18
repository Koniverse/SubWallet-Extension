// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxyType, AnalyzeAddress } from '@subwallet/extension-base/types';
import { AccountNameModal, AccountProxyAvatar, AddressBookModal, CloseIcon, EmptyList, Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import AddSignerMultisigModal from '@subwallet/extension-koni-ui/components/Modal/AddressBook/AddSignerMultisigModal';
import { SeedPhraseTermModal } from '@subwallet/extension-koni-ui/components/Modal/TermsAndConditions/SeedPhraseTermModal';
import { ACCOUNT_NAME_MODAL, CONFIRM_TERM_SEED_PHRASE, CREATE_ACCOUNT_MODAL, DEFAULT_MNEMONIC_TYPE, DEFAULT_ROUTER_PATH, SEED_PREVENT_MODAL, SELECTED_MNEMONIC_TYPE, TERM_AND_CONDITION_SEED_PHRASE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useAutoNavigateToCreatePassword, useCompleteCreateAccount, useDefaultNavigate, useExtensionDisplayModes, useNotification, useTranslation, useUnlockChecker } from '@subwallet/extension-koni-ui/hooks';
import { createAccountMultisig, createSeedV2, windowOpen } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { SeedPhraseTermStorage, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isFirefox, isNoAccount } from '@subwallet/extension-koni-ui/utils';
import { Button, Form, Icon, Input, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { Book, ListChecks, PlusCircle } from 'phosphor-react';
import React, { SyntheticEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps;

const accountNameModalId = ACCOUNT_NAME_MODAL;
const GeneralTermLocalDefault: SeedPhraseTermStorage = { state: 'nonConfirmed', useDefaultContent: false };
const isEmpty = true;
const threshold = 10;

interface MultisigParams {
  signerAddress: string;
  thresshold: string;
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
  const [signers, setSigners] = useState<string[]>([]);

  const formDefault = useMemo<MultisigParams>(() => {
    return {
      signerAddress: '',
      thresshold: ''
    };
  }, []);

  const signerAddressValue = Form.useWatch('signerAddress', form);
  const thresholdValue = Form.useWatch('thresshold', form);

  const onComplete = useCompleteCreateAccount();
  const { isPopupMode } = useExtensionDisplayModes();

  const { accounts, hasMasterPassword } = useSelector((state: RootState) => state.accountState);

  const isOpenWindowRef = useRef(false);

  const [selectedMnemonicType] = useLocalStorage(SELECTED_MNEMONIC_TYPE, DEFAULT_MNEMONIC_TYPE);
  const [preventModalStorage] = useLocalStorage(SEED_PREVENT_MODAL, false);
  const [preventModal] = useState(preventModalStorage);

  const [seedPhrase, setSeedPhrase] = useState('');
  const [loading, setLoading] = useState(false);

  const noAccount = useMemo(() => isNoAccount(accounts), [accounts]);

  const onBack = useCallback(() => {
    navigate(DEFAULT_ROUTER_PATH);

    if (!preventModal) {
      if (!noAccount) {
        activeModal(CREATE_ACCOUNT_MODAL);
      }
    }
  }, [preventModal, navigate, noAccount, activeModal]);

  const onConfirmSignatory = useCallback(() => {
    if (!seedPhrase) {
      return;
    }

    checkUnlock().then(() => {
      activeModal(accountNameModalId);
    }).catch(() => {
      // User cancel unlock
    });
  }, [activeModal, checkUnlock, seedPhrase]);

  const onAddSigner = useCallback(() => {
    setSigners([...signers, signerAddressValue]);

    form.resetFields(['signerAddress']);
  }, [form, signerAddressValue, signers]);

  const onOpenAddressBook = useCallback((e?: SyntheticEvent) => {
    e && e.stopPropagation();
    activeModal(addressBookId);
  }, [activeModal]);

  const onSelectAddressBook = useCallback((_value: string, item: AnalyzeAddress) => {

  }, []);

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

  const onSubmit = useCallback((accountName: string) => {
    setLoading(true);
    createAccountMultisig({
      signers: signers,
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
  }, [inactiveModal, notify, onComplete, signers, thresholdValue]);

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

  useEffect(() => {
    createSeedV2(undefined, undefined, selectedMnemonicType)
      .then((response): void => {
        const phrase = response.mnemonic;

        setSeedPhrase(phrase);
      })
      .catch((e: Error) => {
        console.error(e);
      });
  }, [selectedMnemonicType]);

  useEffect(() => {
    if (isPopupMode && isFirefox() && hasMasterPassword && !isOpenWindowRef.current) {
      isOpenWindowRef.current = true;
      windowOpen({ allowedPath: '/accounts/new-seed-phrase' }).then(window.close).catch(console.log);
    }
  }, [isPopupMode, hasMasterPassword]);

  const waitReady = useMemo(() => {
    return new Promise((resolve) => {
      if (seedPhrase) {
        resolve(true);
      }
    });
  }, [seedPhrase]);

  return (
    <PageWrapper
      className={CN(className)}
      resolve={waitReady}
    >
      <Layout.WithSubHeaderOnly
        onBack={preventModal ? goHome : onBack}
        rightFooterButton={{
          children: t('Continue'),
          onClick: onConfirmSignatory,
          disabled: signers.length === 0 && !thresholdValue
        }}
        subHeaderIcons={preventModal
          ? undefined
          : [
            {
              icon: <CloseIcon />,
              onClick: goHome
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
                  rules={[]} // todo: add validate for address
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
                      className={'icon-submit'}
                      customSize={'28px'}
                      phosphorIcon={PlusCircle}
                      weight='fill'
                    />
                  )}
                  onClick={onAddSigner}
                  schema='secondary'
                  size={'sm'}
                >
                </Button>
              </div>
            </div>
            <div className={'signatory-list'}>
              {isEmpty && emptyList()}
            </div>
            <div className={'threshold-label'}>{'Set approval thresold'.toUpperCase()}</div>
            <div className={'threshold-form-wrapper'}>
              <Form.Item
                name={'thresshold'}
              >
                <Input
                  className={'threshold-form-input'}
                  placeholder={'Enter threshold'}
                  suffix={`/ ${threshold}`}
                />
              </Form.Item>
            </div>
          </Form>
        </div>
      </Layout.WithSubHeaderOnly>
      <AddSignerMultisigModal
        chainSlug={'polkadot'}
        id={addressBookId}
        onSelect={onSelectAddressBook}
        tokenSlug={'polkadot'}
      />
      <AccountNameModal
        accountType={selectedMnemonicType === 'general' ? AccountProxyType.UNIFIED : AccountProxyType.SOLO}
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

    '.signatory-label, .threshold-label': {
      display: 'flex',
      marginBottom: token.marginSM
    },

    '.signatory-form-left': {
      flex: 1,
      '.signatory-form-address': {
        marginBottom: 0
      }
    },

    '.signatory-list': {
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
    }
  };
});

export default NewMultisigAccount;
