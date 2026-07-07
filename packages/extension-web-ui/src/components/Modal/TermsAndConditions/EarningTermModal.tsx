// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LANGUAGE } from '@subwallet/extension-base/constants';
import { fetchStaticData } from '@subwallet/extension-base/utils/fetchStaticData';
import { BaseModal } from '@subwallet/extension-web-ui/components';
import { EARNING_TERM_AND_CONDITION_MODAL } from '@subwallet/extension-web-ui/constants';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Button, Checkbox, Icon, ModalContext, Typography } from '@subwallet/react-ui';
import { CheckboxChangeEvent } from '@subwallet/react-ui/es/checkbox';
import CN from 'classnames';
import { ArrowCircleRight, CaretDown } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import styled from 'styled-components';

interface Props extends ThemeProps {
  onOk: () => void
}

const modalId = EARNING_TERM_AND_CONDITION_MODAL;

interface StaticDataInterface {
  md: string,
}

const Component = ({ className, onOk }: Props) => {
  const { inactiveModal } = useContext(ModalContext);
  const { isWebUI } = useContext(ScreenContext);
  const [staticData, setStaticData] = useState({} as StaticDataInterface);
  const [isChecked, setIsChecked] = useState(false);
  const [isScrollEnd, setIsScrollEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStaticData<string>('compliance-term-and-condition', `${localStorage.getItem(LANGUAGE) || 'en'}.md`, false)
      .then((md) => setStaticData({ md }))
      .catch((e) => console.log('fetch _complianceTermAndCondition error:', e));
  }, []);

  const onCheckedInput = useCallback((e: CheckboxChangeEvent) => {
    setIsChecked(e.target.checked);
  }, []);

  const onScrollToAcceptButton = useCallback(() => {
    if (!scrollRef?.current) {
      return;
    }

    setIsScrollEnd(scrollRef.current.scrollTop >= scrollRef.current.scrollHeight - 500);
  }, []);

  const onScrollContent = useCallback(() => {
    scrollRef?.current?.scroll({ top: scrollRef?.current?.scrollHeight, left: 0 });
  }, [scrollRef]);

  const onConfirm = useCallback(() => {
    inactiveModal(modalId);
    onOk();
  }, [inactiveModal, onOk]);

  return (
    <BaseModal
      center={true}
      className={CN(className, {
        '-desktop-term': isWebUI
      })}
      closable={false}
      id={modalId}
      title={'Compliance Confirmation'}
      width={isWebUI ? 784 : undefined}
    >
      <div
        className={'term-body'}
        onScroll={onScrollToAcceptButton}
        ref={scrollRef}
      >
        <Typography.Text className={'term-subheading'}>
          Before using staking, earning, or any third-party protocol services through SubWallet, please review and confirm the following:
        </Typography.Text>
        <Typography.Text>
          <Markdown>{staticData && staticData.md}</Markdown>
        </Typography.Text>
        {!isScrollEnd && (
          <Button
            className={'term-body-caret-button'}
            icon={<Icon phosphorIcon={CaretDown} />}
            onClick={onScrollContent}
            schema={'secondary'}
            shape={'circle'}
            size={'xs'}
          />
        )}
      </div>
      <div className={'term-footer'}>
        <Checkbox
          checked={isChecked}
          className={'term-footer-checkbox'}
          onChange={onCheckedInput}
        >I have read, understood, and agree to the above, and confirm that all representations made by me are true, accurate, and complete to the best of my knowledge.</Checkbox>
        <div className={'term-footer-button-group'}>
          <Button
            block={true}
            className={'term-footer-button'}
            disabled={!isChecked || !isScrollEnd}
            icon={(
              <Icon
                phosphorIcon={ArrowCircleRight}
                weight='fill'
              />
            )}
            onClick={onConfirm}
          >
            I Agree & Continue
          </Button>
          <span className={'term-footer-annotation'}>Scroll to read all sections</span>
        </div>
      </div>
    </BaseModal>
  );
};

export const EarningTermModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-content': {
      overflow: 'hidden',
      maxHeight: 600,
      paddingBottom: 0
    },

    '.ant-modal-title, .ant-sw-modal-title, .ant-sw-sub-header-title, .ant-sw-sub-header-title-content': {
      overflow: 'visible !important',
      textOverflow: 'clip !important',
      whiteSpace: 'nowrap !important'
    },

    '.ant-sw-sub-header-title-content': {
      fontSize: token.fontSizeLG,
      lineHeight: '24px'
    },

    '.term-subheading': {
      color: token.colorTextLight4,
      display: 'block',
      fontSize: token.fontSizeSM,
      marginBottom: token.marginSM
    },

    '.term-body': {
      maxHeight: 294,
      h3: {
        color: token.colorWhite,
        fontSize: token.fontSize,
        gap: token.margin
      },
      'p, li': {
        color: token.colorTextLight4,
        fontSize: token.fontSizeSM
      },

      display: 'block',
      overflowY: 'scroll',
      scrollBehavior: 'smooth'
    },

    '.term-body-caret-button': {
      position: 'absolute',
      top: '60%',
      right: '5%'
    },

    '.term-footer': {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      marginTop: token.marginXS,
      gap: token.margin
    },

    '.term-footer-checkbox': {
      alignItems: 'center',
      alignSelf: 'flex-start'
    },

    '.term-footer-button-group': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingLeft: token.padding,
      paddingRight: token.padding,
      width: 390,
      height: 80,
      justifyContent: 'space-between'
    },

    '.term-footer-annotation': {
      color: token.colorTextLight4,
      fontSize: token.fontSizeSM
    },

    '&.-desktop-term .ant-sw-modal-content': {
      maxHeight: 746,
      width: '100%',

      '.term-body': {
        maxHeight: 496
      },

      '.term-body-caret-button': {
        top: '75%'
      },

      '.ant-sw-modal-body': {
        padding: '16px 24px'
      }
    }
  };
});

export default EarningTermModal;
