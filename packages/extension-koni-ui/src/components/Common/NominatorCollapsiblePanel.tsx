// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { PencilSimpleLine } from 'phosphor-react';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

interface Props extends ThemeProps {
  title: string;
  children?: React.ReactNode | React.ReactNode[];
  modalId: string;
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, modalId, title } = props;
  const { activeModal } = useContext(ModalContext);

  const handleIconClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      activeModal(modalId);
    },
    [activeModal, modalId]
  );

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
            onClick={handleIconClick}
          >
            <Icon
              phosphorIcon={PencilSimpleLine}
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
      alignItems: 'center',
      gap: token.sizeXS,
      padding: token.paddingXXS,
      paddingLeft: token.padding
    },

    '.__panel-title': {
      'white-space': 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      flex: 1,
      color: token.colorTextLight2
    },

    '.__panel-icon': {
      cursor: 'pointer',
      minWidth: 40,
      height: 40,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: token.colorTextLight3
    },

    '.__panel-body': {
      padding: token.padding,
      paddingTop: token.paddingXXS,
      paddingLeft: 24
    }
  });
});

export default NominatorCollapsiblePanel;
