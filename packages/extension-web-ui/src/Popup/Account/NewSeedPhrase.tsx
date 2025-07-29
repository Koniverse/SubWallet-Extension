// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxyType } from '@subwallet/extension-base/types';
import { AccountNameModal, CloseIcon, InstructionContainer, InstructionContentType, Layout, PageWrapper, WordPhrase } from '@subwallet/extension-web-ui/components';
import { SeedPhraseTermModal } from '@subwallet/extension-web-ui/components/Modal/TermsAndConditions/SeedPhraseTermModal';
import { ACCOUNT_NAME_MODAL, CONFIRM_TERM_SEED_PHRASE, CREATE_ACCOUNT_MODAL, DEFAULT_MNEMONIC_TYPE, DEFAULT_ROUTER_PATH, SEED_PREVENT_MODAL, SELECTED_MNEMONIC_TYPE, TERM_AND_CONDITION_SEED_PHRASE_MODAL } from '@subwallet/extension-web-ui/constants';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { useAutoNavigateToCreatePassword, useCompleteCreateAccount, useDefaultNavigate, useIsPopup, useNotification, useTranslation, useUnlockChecker } from '@subwallet/extension-web-ui/hooks';
import { createAccountSuriV2, createSeedV2, windowOpen } from '@subwallet/extension-web-ui/messaging';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { SeedPhraseTermStorage, ThemeProps } from '@subwallet/extension-web-ui/types';
import { isFirefox, isNoAccount } from '@subwallet/extension-web-ui/utils';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { saveAs } from 'file-saver';
import { CheckCircle, Download } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps;

const FooterIcon = (
  <Icon
    phosphorIcon={CheckCircle}
    weight='fill'
  />
);

const accountNameModalId = ACCOUNT_NAME_MODAL;
const GeneralTermLocalDefault: SeedPhraseTermStorage = { state: 'nonConfirmed', useDefaultContent: false };

const Component: React.FC<Props> = ({ className }: Props) => {
  useAutoNavigateToCreatePassword();
  const { t } = useTranslation();
  const notify = useNotification();
  const navigate = useNavigate();
  const [confirmedTermSeedPhrase, setConfirmedTermSeedPhrase] = useLocalStorage<SeedPhraseTermStorage>(CONFIRM_TERM_SEED_PHRASE, GeneralTermLocalDefault);
  const { goHome } = useDefaultNavigate();
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const checkUnlock = useUnlockChecker();
  const { isWebUI } = useContext(ScreenContext);

  const onComplete = useCompleteCreateAccount();
  const isPopup = useIsPopup();

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
  }, [navigate, preventModal, noAccount, activeModal]);

  const onClickToSave = useCallback(() => {
    const blob = new Blob([seedPhrase], { type: 'text/plain' });

    saveAs(blob, 'mnemonic-seed.txt');
  }, [seedPhrase]);

  const instructionContent: InstructionContentType[] = useMemo(() => {
    return [
      {
        title: 'What is a seed phrase?',
        description: 'Seed phrase is a 12- or 24-word phrase that can be used to restore your wallet. The recovery phrase alone can give anyone full access to your wallet and the funds.',
        type: 'warning'
      },
      {
        title: 'What if I lose the seed phrase?',
        description:
          <div>
            {t('There is no way to get back your seed phrase if you lose it. Make sure you store them at someplace safe which is accessible only to you. ')}
            <u
              className={'__instruction-content-download'}
              onClick={onClickToSave}
              style={{ textDecoration: 'underline' }}
            >{t('Download seed phrase ')}
              <Icon
                phosphorIcon={Download}
                size='sm'
                type='phosphor'
                weight='fill'
              />
            </u>
          </div>,
        type: 'warning'
      }
    ];
  }, [onClickToSave, t]);

  const onConfirmSeedPhrase = useCallback(() => {
    if (!seedPhrase) {
      return;
    }

    checkUnlock().then(() => {
      activeModal(accountNameModalId);
    }).catch(() => {
      // User cancel unlock
    });
  }, [seedPhrase, checkUnlock, activeModal]);

  const onSubmit = useCallback((accountName: string) => {
    setLoading(true);
    createAccountSuriV2({
      name: accountName,
      suri: seedPhrase,
      type: selectedMnemonicType === 'ton' ? 'ton-native' : undefined,
      isAllowed: true
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
  }, [inactiveModal, notify, onComplete, seedPhrase, selectedMnemonicType]);

  const buttonProps = {
    children: t('I have saved it somewhere safe'),
    icon: FooterIcon,
    onClick: onConfirmSeedPhrase,
    disabled: !seedPhrase,
    loading: loading
  };

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
    if (isPopup && isFirefox && hasMasterPassword && !isOpenWindowRef.current) {
      isOpenWindowRef.current = true;
      windowOpen({ allowedPath: '/accounts/new-seed-phrase' }).then(window.close).catch(console.log);
    }
  }, [isPopup, hasMasterPassword]);

  return (
    <PageWrapper
      className={CN(className)}
      resolve={new Promise((resolve) => !!seedPhrase && resolve(true))}
    >
      <Layout.WithSubHeaderOnly
        onBack={preventModal ? goHome : onBack}
        {...(!isWebUI
          ? {
            rightFooterButton: buttonProps,
            showBackButton: true,
            subHeaderPaddingVertical: true,
            showSubHeader: true,
            subHeaderCenter: true,
            subHeaderBackground: 'transparent'
          }
          : {})}
        subHeaderIcons={preventModal
          ? undefined
          : [
            !isWebUI
              ? {
                icon: <CloseIcon />,
                onClick: goHome
              }
              : {}
          ]}
        subHeaderLeft={preventModal ? !isWebUI ? <CloseIcon /> : undefined : undefined }
        title={t('Your seed phrase')}
      >
        <div className={CN('container', {
          '__web-ui': isWebUI
        })}
        >
          <div className={'seed-phrase-container'}>
            <div className='description'>
              {t('Keep your seed phrase in a safe place, and never disclose it. Anyone with this phrase can take control of your assets.')}
            </div>
            <WordPhrase
              enableDownload={true}
              seedPhrase={seedPhrase}
            />

            {isWebUI && (
              <Button
                {...buttonProps}
                className='action'
              />
            )}
          </div>

          {isWebUI && (
            <InstructionContainer contents={instructionContent} />
          )}
        </div>

      </Layout.WithSubHeaderOnly>
      <SeedPhraseTermModal />
      <AccountNameModal
        accountType={selectedMnemonicType === 'general' ? AccountProxyType.UNIFIED : AccountProxyType.SOLO}
        isLoading={loading}
        onSubmit={onSubmit}
      />
    </PageWrapper>
  );
};

const NewSeedPhrase = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    '.container': {
      padding: `0 ${token.padding}px`,
      textAlign: 'center',
      width: extendToken.twoColumnWidth,
      maxWidth: '100%',
      margin: '0 auto',

      '.seed-phrase-container': {
        paddingTop: token.paddingXS,
        textAlign: 'center',
        flex: 1

      },

      '&.__web-ui': {
        display: 'flex',
        justifyContent: 'center',
        maxWidth: '60%',
        margin: '0 auto',
        gap: token.padding,

        '.action': {
          marginTop: 40,
          width: '100%'
        },

        '.instruction-container': {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }
      }
    },

    '.description': {
      padding: `0 ${token.padding}px`,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      color: token.colorTextDescription,
      marginBottom: token.margin
    },

    '.__instruction-content-download': {
      cursor: 'pointer',
      display: 'inline-flex',
      gap: token.paddingSM - 6
    }
  };
});

export default NewSeedPhrase;
