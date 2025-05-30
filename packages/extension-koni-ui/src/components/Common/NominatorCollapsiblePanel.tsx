// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { Info, PencilSimpleLine } from 'phosphor-react';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

interface Props extends ThemeProps {
  modalId: string;
  title: string;
  children?: React.ReactNode | React.ReactNode[];
  disabledButton?: boolean;
  maxValidator?: number;
  totalValidator?: number;
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, disabledButton, maxValidator, modalId, title, totalValidator } = props;
  const { activeModal } = useContext(ModalContext);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      activeModal(modalId);
    },
    [activeModal, modalId]
  );
  const countText = totalValidator
    ? maxValidator
      ? `${totalValidator} (max ${maxValidator}) `
      : `${totalValidator} `
    : '';

  return (
    <>
      <div
        className={CN(className)}
      >
        <div
          className={'__panel-header'}
        >
          <div className='__panel-title'>{title}</div>
          <div
            className='__panel-icon'
            onClick={onClick}
          >
            <div className='__panel-count'>
              {countText}
            </div>
            <Icon
              phosphorIcon={disabledButton ? Info : PencilSimpleLine}
              size='sm'
            />
          </div>
        </div>
      </div>
    </>
  );
};

const NominatorCollapsiblePanel = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    borderRadius: token.borderRadiusLG,
    backgroundColor: token.colorBgSecondary,

    '.__panel-header': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: token.sizeXS,
      padding: `${token.paddingXS}px ${token.padding}px`,
      height: 46
    },

    '&.nomination-info-part .__panel-header': {
      padding: `${token.paddingXS}px ${token.paddingSM}px`,
      height: 46
    },

    '.__panel-title': {
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight2,
      textAlign: 'start'
    },

    '.__panel-icon': {
      cursor: 'pointer',
      minWidth: 40,
      height: 40,
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      color: token.colorTextLight3
    },

    '.__panel-count': {
      marginRight: token.sizeXXS
    }
  });
});

export default NominatorCollapsiblePanel;
