// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CONFIRM_TERM_SEED_PHRASE, TERM_AND_CONDITION_SEED_PHRASE_MODAL } from '@subwallet/extension-koni-ui/constants';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { SeedPhraseTermStorage, Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Checkbox, Icon, ModalContext, SwList, SwModal, Web3Block } from '@subwallet/react-ui';
import { CheckboxChangeEvent } from '@subwallet/react-ui/es/checkbox';
import CN from 'classnames';
import { ArrowCircleRight, CheckCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps

const modalId = TERM_AND_CONDITION_SEED_PHRASE_MODAL;

enum TermSeedPhrase {
  TERM_1 = 'term_1',
  TERM_2 = 'term_2',
  TERM_3 = 'term_3',
  TERM_4 = 'term_4'
}

const valueStateTermDefault: Record<TermSeedPhrase, boolean> = {
  [TermSeedPhrase.TERM_1]: false,
  [TermSeedPhrase.TERM_2]: false,
  [TermSeedPhrase.TERM_3]: false,
  [TermSeedPhrase.TERM_4]: false
};
const SeedPhraseTermLocalDefault: SeedPhraseTermStorage = { state: 'nonConfirmed', useDefaultContent: false };

const Component = ({ className }: Props) => {
  const { inactiveModal } = useContext(ModalContext);
  const { t } = useTranslation();
  const [{ useDefaultContent }, setConfirmTermSeedPhrase] = useLocalStorage<SeedPhraseTermStorage>(CONFIRM_TERM_SEED_PHRASE, SeedPhraseTermLocalDefault);
  const [isCheckDontShow, setIsCheckDontShow] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [termsIsChecked, setTermsIsChecked] = useState<Record<TermSeedPhrase, boolean>>(valueStateTermDefault);
  const { token } = useTheme() as Theme;

  const ListTermSeedPhrase: Record<TermSeedPhrase, string> = useMemo(() => ({
    [TermSeedPhrase.TERM_1]: t('ui.Modal.Terms.SeedPhrase.subwalletDoesNotKeepSeed'),
    [TermSeedPhrase.TERM_2]: t('ui.Modal.Terms.SeedPhrase.subwalletCannotRecoverAccount'),
    [TermSeedPhrase.TERM_3]: t('ui.Modal.Terms.SeedPhrase.writeSeedPhraseInOrder'),
    [TermSeedPhrase.TERM_4]: t('ui.Modal.Terms.SeedPhrase.doNotStoreSeedDigitally')
  }), [t]);

  const ListTermItem: TermSeedPhrase[] = useMemo(() => [TermSeedPhrase.TERM_1, TermSeedPhrase.TERM_2, TermSeedPhrase.TERM_3, TermSeedPhrase.TERM_4], []);

  const onCheckedTerm = useCallback((term: TermSeedPhrase) => {
    return () => {
      setTermsIsChecked({ ...termsIsChecked, [term]: !termsIsChecked[term] });
    };
  }, [termsIsChecked]);

  useEffect(() => {
    setIsChecked(Object.values(termsIsChecked).filter((term) => term).length === 4);
  }, [termsIsChecked]);

  const TermIterm = useCallback((term: TermSeedPhrase) => {
    const _leftItem = (
      <div className={'ant-account-item-icon'}>
        <Icon
          iconColor={ termsIsChecked[term] ? token.colorSuccess : token.colorTextLight4}
          phosphorIcon={CheckCircle}
          size='sm'
          type='phosphor'
          weight='fill'
        />
      </div>);

    const _middleItem = (
      <div className={'term-detail'}>
        {ListTermSeedPhrase[term]}
      </div>
    );

    return (
      <Web3Block
        className={'term-box'}
        key={term}
        leftItem={_leftItem}
        middleItem={_middleItem}
        onClick={onCheckedTerm(term)}
      />
    );
  }, [ListTermSeedPhrase, onCheckedTerm, termsIsChecked, token.colorSuccess, token.colorTextLight4]);

  const onCheckedInput = useCallback((e: CheckboxChangeEvent) => {
    setIsCheckDontShow(e.target.checked);
  }, []);

  const onConfirm = useCallback(() => {
    inactiveModal(modalId);
    setConfirmTermSeedPhrase({ state: isCheckDontShow ? 'confirmed' : 'nonConfirmed', useDefaultContent: false });
  }, [inactiveModal, isCheckDontShow, setConfirmTermSeedPhrase]);

  const subTitle = useMemo(() => {
    return useDefaultContent
      ? t('ui.Modal.Terms.SeedPhrase.confirmSeedPhraseImportance')
      : t('ui.Modal.Terms.SeedPhrase.seedPhraseAccount');
  }, [useDefaultContent, t]);

  return (
    <SwModal
      className={CN(className)}
      closable={false}
      id={modalId}
      title={t('ui.Modal.Terms.SeedPhrase.keepYourSeedPhraseSafe')}
    >
      <div
        className={'term-body'}
        ref={scrollRef}
      >
        <div className={'annotation'}>
          {subTitle}
        </div>
        <SwList
          className={'term-list'}
          list={ListTermItem}
          renderItem={TermIterm}
        />
      </div>
      <div className={'term-footer'}>
        <Checkbox
          checked={isCheckDontShow}
          className={'term-footer-checkbox'}
          onChange={onCheckedInput}
        >{t('ui.Modal.Terms.SeedPhrase.dontShowAgain')}</Checkbox>
        <Button
          block={true}
          className={'term-footer-button'}
          disabled={!isChecked}
          icon={ (
            <Icon
              phosphorIcon={ArrowCircleRight}
              weight='fill'
            />
          )}
          onClick={onConfirm}
        >
          {t('ui.Modal.Terms.SeedPhrase.continue')}
        </Button>
      </div>
    </SwModal>
  );
};

export const SeedPhraseTermModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-content': {
      overflow: 'hidden',
      maxHeight: 600,
      paddingBottom: 0,
      overflowY: 'hidden'
    },

    '.ant-sw-header-center-part': {
      width: 300
    },

    '.term-body': {
      height: 380,
      display: 'flex',
      flexDirection: 'column',
      gap: token.padding
    },

    '.annotation': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextLight5,
      textAlign: 'center'
    },

    '.term-list': {
      gap: token.paddingSM,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto'
    },

    '.term-box': {
      backgroundColor: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      WebkitTransition: 'background 0.2s ease-in-out',
      transition: 'background 0.2s ease-in-out',

      '&:hover': {
        backgroundColor: token.colorBgInput
      }
    },

    '.term-detail': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeightLG,
      fontWeight: 500,
      color: token.colorTextLight1
    },

    '.term-footer': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.padding,
      paddingTop: 4,

      '.term-footer-checkbox': {
        alignItems: 'center',
        marginLeft: 0
      },

      '.term-footer-button': {
        marginBottom: token.marginXS
      }
    }
  };
});
