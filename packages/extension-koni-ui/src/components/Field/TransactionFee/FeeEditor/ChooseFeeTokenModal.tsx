// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ChooseFeeTokenItem from '@subwallet/extension-koni-ui/components/Field/TransactionFee/FeeEditor/ChooseFeeTokenItem';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  modalId: string,
  items: string[] | undefined,
  onSelectItem?: (slug: string) => void,
  selectedItem?: string,
  onSetTokenPayFee?: (token: string) => void
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, items, modalId, onSetTokenPayFee, selectedItem } = props;
  const { inactiveModal } = useContext(ModalContext);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal, modalId]);

  return (
    <>
      <SwModal
        className={CN(className, 'choose-fee-token-container')}
        closable={true}
        destroyOnClose={true}
        id={modalId}
        onCancel={onCancel}
        title={'Choose token pay fee'}
      >
        <div className={'__choose-fee-wrapper'}>
          <div className={'__estimate-fee'}>
          </div>
          {items && items.map((item, index) => (
            <ChooseFeeTokenItem
              key={index}
              onSelect={onSetTokenPayFee}
              selected={selectedItem === item}
              slug={item}
            />
          ))}
        </div>
      </SwModal>
    </>
  );
};

const ChooseFeeTokenModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__estimate-fee': {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24
    },
    '.__title': {
      fontSize: 14,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight,
      color: token.colorTextTertiary
    },
    '.__pay-with': {
      fontSize: 14,
      fontWeight: token.fontWeightStrong,
      lineHeight: token.lineHeight,
      color: token.colorTextTertiary
    },
    '.__value': {
      fontSize: token.fontSizeHeading2,
      lineHeight: token.lineHeightHeading2,
      fontWeight: token.fontWeightStrong,
      color: token.colorTextLight1,

      '.ant-number-integer, ant-number-prefix': {
        color: 'inherit !important',
        fontSize: 'inherit !important',
        fontWeight: `${token.fontWeightStrong}px !important`,
        lineHeight: 'inherit'
      },

      '.ant-number-decimal': {
        color: `${token.colorTextLight3} !important`,
        fontSize: `${token.fontSizeHeading3}px !important`,
        fontWeight: 'inherit !important',
        lineHeight: token.lineHeightHeading3
      }
    }

  };
});

export default ChooseFeeTokenModal;
