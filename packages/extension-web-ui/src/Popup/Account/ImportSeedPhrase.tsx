// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountProxyType, ResponseMnemonicValidateV2 } from '@subwallet/extension-base/types';
import { AccountNameModal, CloseIcon, InstructionContentType, Layout, PageWrapper, PhraseNumberSelector, SeedPhraseInput } from '@subwallet/extension-web-ui/components';
import InstructionContainer from '@subwallet/extension-web-ui/components/InstructionContainer';
import { ACCOUNT_NAME_MODAL, IMPORT_ACCOUNT_MODAL, IMPORT_SEED_MODAL } from '@subwallet/extension-web-ui/constants';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { WalletModalContext } from '@subwallet/extension-web-ui/contexts/WalletModalContextProvider';
import { useAutoNavigateToCreatePassword, useCompleteCreateAccount, useDefaultNavigate, useFocusFormItem, useGoBackFromCreateAccount, useNotification, useTranslation, useUnlockChecker } from '@subwallet/extension-web-ui/hooks';
import { createAccountSuriV2, validateSeedV2 } from '@subwallet/extension-web-ui/messaging';
import { FormCallbacks, FormFieldData, FormRule, ThemeProps } from '@subwallet/extension-web-ui/types';
import { convertFieldToObject, noop, simpleCheckForm } from '@subwallet/extension-web-ui/utils';
import { Button, Form, Icon, Input, ModalContext } from '@subwallet/react-ui';
import { wordlists } from 'bip39';
import CN from 'classnames';
import { CheckCircle, Eye, EyeSlash, FileArrowDown, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const FooterIcon = (
  <Icon
    phosphorIcon={FileArrowDown}
    weight='fill'
  />
);

const formName = 'import-seed-phrase-form';
const fieldNamePrefix = 'seed-phrase-';
const accountNameModalId = ACCOUNT_NAME_MODAL;

interface FormState extends Record<`seed-phrase-${number}`, string> {
  phraseNumber: string;
  trigger: string; // Use for trigger validate when change phraseNumber
}

const words = wordlists.english;
const phraseNumberOptions = [12, 15, 24];

const instructionContent: InstructionContentType[] = [
  {
    title: 'What is a seed phrase?',
    description: 'Seed phrase is a 12- or 24-word phrase that can be used to restore your wallet.',
    type: 'warning'
  },
  {
    title: 'Is it safe to enter it into SubWallet?',
    description: 'Yes. It will be stored locally and never leave your device without your explicit permission.',
    type: 'warning'
  }
];

const Component: React.FC<Props> = ({ className }: Props) => {
  useAutoNavigateToCreatePassword();

  const { t } = useTranslation();
  const { goHome } = useDefaultNavigate();
  const { isWebUI } = useContext(ScreenContext);
  const notify = useNotification();

  const onComplete = useCompleteCreateAccount();
  const onBack = useGoBackFromCreateAccount(isWebUI ? IMPORT_ACCOUNT_MODAL : IMPORT_SEED_MODAL);
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { alertModal } = useContext(WalletModalContext);

  const [form] = Form.useForm<FormState>();

  const phraseNumber = Form.useWatch('phraseNumber', form);

  const [submitting, setSubmitting] = useState(false);
  const [accountCreating, setAccountCreating] = useState(false);
  const [seedValidationResponse, setSeedValidationResponse] = useState<undefined | ResponseMnemonicValidateV2>();
  const [disabled, setDisabled] = useState(true);
  const [showSeed, setShowSeed] = useState(false);
  const checkUnlock = useUnlockChecker();

  const phraseNumberItems = useMemo(() => phraseNumberOptions.map((value) => ({
    label: t('{{number}} words', { replace: { number: value } }),
    value: `${value}`
  })), [t]);

  const formDefault: FormState = useMemo(() => ({
    phraseNumber: `${phraseNumberOptions[0]}`,
    trigger: 'trigger'
  }), []);

  const onFieldsChange: FormCallbacks<FormState>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    const { empty, error } = simpleCheckForm(allFields);

    const { phraseNumber } = convertFieldToObject<FormState>(changedFields);

    if (phraseNumber) {
      form.validateFields(['trigger']).finally(noop);
    }

    setDisabled(empty || error);
  }, [form]);

  const seedValidator = useCallback((rule: FormRule, value: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!value) {
        reject(new Error(t('This field is required')));
      }

      if (!words.includes(value)) {
        reject(new Error(t('Invalid word')));
      }

      resolve();
    });
  }, [t]);

  const handlePaste = useCallback((words: string[]) => {
    if (phraseNumberOptions.includes(words.length)) {
      try {
        form.setFieldValue('phraseNumber', `${words.length}`);
      } catch (error) {
        console.error('Error updating phraseNumber field:', error);
      }
    }
  }, [form]);

  const onSubmit: FormCallbacks<FormState>['onFinish'] = useCallback((values: FormState) => {
    const { phraseNumber: _phraseNumber } = values;
    const seedKeys = Object.keys(values).filter((key) => key.startsWith(fieldNamePrefix));
    const phraseNumber = parseInt(_phraseNumber);

    if (![12, 15, 18, 21, 24].includes(seedKeys.length)) {
      throw Error(t('Mnemonic needs to contain 12, 15, 18, 21, 24 words'));
    }

    const seeds: string[] = [];

    for (let i = 0; i < phraseNumber; i++) {
      seeds.push(values[`${fieldNamePrefix}${i}`]);
    }

    if (seeds.some((value) => !value)) {
      throw Error(t('Mnemonic needs to contain 12, 15, 18, 21, 24 words'));
    }

    const seed = seeds.join(' ');

    if (seed) {
      checkUnlock()
        .then(() => {
          setSubmitting(true);
          validateSeedV2(seed).then((response) => {
            setSeedValidationResponse(response);

            if (response.mnemonicTypes === 'general') {
              alertModal.open({
                closable: false,
                title: t('Incompatible seed phrase'),
                type: NotificationType.WARNING,
                content: (
                  <>
                    <div>
                      {t('This seed phrase generates a unified account that can be used on multiple ecosystems in SubWallet including TON.')}
                    </div>
                    <br />
                    <div>
                      {t('Note that you can’t import this seed phrase into TON-native wallets as this seed phrase is incompatible with TON-native wallets.')}
                    </div>
                  </>
                ),
                cancelButton: {
                  text: t('Go back'),
                  icon: XCircle,
                  iconWeight: 'fill',
                  onClick: () => {
                    alertModal.close();
                    setSubmitting(false);
                  },
                  schema: 'secondary'
                },
                okButton: {
                  text: t('Import'),
                  icon: CheckCircle,
                  iconWeight: 'fill',
                  onClick: () => {
                    activeModal(accountNameModalId);
                    alertModal.close();
                  },
                  schema: 'primary'
                }
              });
            } else {
              activeModal(accountNameModalId);
            }
          })
            .catch((error: Error): void => {
              const message = error.message;

              setSeedValidationResponse(undefined);
              setSubmitting(false);
              notify({
                type: 'error',
                message
              });
            });
        })
        .catch(() => {
          // Unlock is cancelled
        });
    }
  }, [t, checkUnlock, alertModal, activeModal, notify]);

  const onCreateAccount = useCallback((accountName: string) => {
    if (!seedValidationResponse) {
      return;
    }

    setAccountCreating(true);
    createAccountSuriV2({
      name: accountName,
      suri: seedValidationResponse.mnemonic,
      type: seedValidationResponse.mnemonicTypes === 'ton' ? 'ton-native' : undefined,
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
        setSeedValidationResponse(undefined);
        setAccountCreating(false);
        setSubmitting(false);
        inactiveModal(accountNameModalId);
      });
  }, [inactiveModal, notify, onComplete, seedValidationResponse]);

  const toggleShow = useCallback(() => {
    setShowSeed((value) => !value);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      form.submit();
    }
  }, [form]);

  useFocusFormItem(form, `${fieldNamePrefix}0`);

  const buttonProps = {
    children: t('Import account'),
    icon: FooterIcon,
    onClick: form.submit,
    disabled: disabled,
    loading: submitting
  };

  return (
    <PageWrapper className={CN(className)}>
      <Layout.WithSubHeaderOnly
        onBack={onBack}
        rightFooterButton={isWebUI ? undefined : buttonProps}
        subHeaderIcons={isWebUI
          ? undefined
          : ([
            {
              icon: <CloseIcon />,
              onClick: goHome
            }
          ])}
        title={t<string>('Import from seed phrase')}
      >
        <div className='container'>
          <div className='description'>
            {!isWebUI && t('To import an existing account,\n please enter seed phrase.')}
            { isWebUI && t('To import an existing existing account, please select account type and enter the recovery seed phrase here:')}
          </div>
          <Form
            className='form-container form-space-xs'
            form={form}
            initialValues={formDefault}
            name={formName}
            onFieldsChange={onFieldsChange}
            onFinish={onSubmit}
            onKeyDown={handleKeyDown}
          >
            <Form.Item name={'phraseNumber'}>
              <PhraseNumberSelector
                items={phraseNumberItems}
              />
            </Form.Item>
            <Form.Item
              hidden={true}
              name='trigger'
            >
              <Input />
            </Form.Item>
            <div className='content-container'>
              <div className='button-container'>
                <Button
                  icon={(
                    <Icon
                      customSize={isWebUI ? '28px' : undefined}
                      phosphorIcon={showSeed ? EyeSlash : Eye}
                      size='sm'
                    />
                  )}
                  onClick={toggleShow}
                  size='xs'
                  type='ghost'
                >
                  {showSeed ? t('Hide seed phrase') : t('Show seed phrase')}
                </Button>
              </div>
              <div className='seed-container'>
                {
                  new Array(parseInt(phraseNumber || '12')).fill(null).map((value, index) => {
                    const name = fieldNamePrefix + String(index);

                    return (
                      <Form.Item
                        key={index}
                        name={name}
                        rules={[{
                          validator: seedValidator
                        }]}
                        statusHelpAsTooltip={isWebUI}
                        validateTrigger={['onChange']}
                      >
                        <SeedPhraseInput
                          form={form}
                          formName={formName}
                          handlePaste={handlePaste}
                          hideText={!showSeed}
                          index={index}
                          prefix={fieldNamePrefix}
                        />
                      </Form.Item>
                    );
                  })
                }
              </div>
            </div>
          </Form>

          {isWebUI && (
            <>
              <Button
                {...buttonProps}
                block={true}
                className='__submit-button'
                disabled={disabled}
              />
            </>
          )}
        </div>

        {isWebUI && (
          <InstructionContainer contents={instructionContent} />
        )}
      </Layout.WithSubHeaderOnly>
      <AccountNameModal
        accountType={seedValidationResponse
          ? seedValidationResponse.mnemonicTypes === 'general' ? AccountProxyType.UNIFIED : AccountProxyType.SOLO
          : undefined}
        isLoading={accountCreating}
        onSubmit={onCreateAccount}
      />
    </PageWrapper>
  );
};

const ImportSeedPhrase = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.container': {
      padding: token.padding
    },

    '.ant-form-item:last-child': {
      marginBottom: 0
    },

    '.description': {
      padding: `0 ${token.padding}px`,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      color: token.colorTextDescription,
      textAlign: 'center',
      whiteSpaceCollapse: 'break-spaces'
    },

    '.form-container': {
      marginTop: token.margin
    },

    '.content-container': {
      padding: token.paddingXS,
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeXS,
      backgroundColor: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG
    },

    '.button-container': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },

    '.seed-container': {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: token.sizeXS,
      marginLeft: token.marginSM,
      marginRight: token.marginSM,

      '.ant-form-item': {
        minWidth: 0,
        marginBottom: 0
      }
    },

    '.web-ui-enable &': {
      '.ant-sw-sub-header-container': {
        marginBottom: 24
      },

      '.ant-sw-screen-layout-body': {
        maxWidth: 784,
        gap: token.size,
        width: '100%',
        flexDirection: 'row',
        marginLeft: 'auto',
        marginRight: 'auto'
      },

      '.container': {
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
        flex: 1
      },

      '.form-container': {
        marginBottom: token.margin
      },

      '.description': {
        paddingLeft: 0,
        paddingRight: 0,
        textAlign: 'left'
      },

      '.__submit-button': {
        marginTop: token.margin,
        marginBottom: token.margin
      },

      '.instruction-container': {
        flex: 1
      }
    }
  };
});

export default ImportSeedPhrase;
