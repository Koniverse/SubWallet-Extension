// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ModalContext } from '@subwallet/react-ui';
import React, { useCallback, useContext, useState } from 'react';

import { ChainSelectorModal } from './ChainSelectorModal';
import { ChainSelectorTrigger } from './ChainSelectorTrigger';

type Props = {
  triggerClassname?: string;
  selectedChain: string;
  onChangeChain: (chainSlug: string) => void;
};

const modalId = 'governance-modal-id';

const Component = ({ onChangeChain, selectedChain, triggerClassname = '' }: Props): React.ReactElement<Props> => {
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = useCallback(() => {
    setIsModalVisible(true);
    activeModal(modalId);
  }, [activeModal]);

  const closeModal = useCallback(() => {
    inactiveModal(modalId);
    setIsModalVisible(false);
  }, [inactiveModal]);

  return (
    <>
      <ChainSelectorTrigger
        className={triggerClassname}
        onClick={openModal}
        selectedChain={selectedChain}
      />

      {
        isModalVisible && (
          <ChainSelectorModal
            modalId={modalId}
            onCancel={closeModal}
            onChangeChain={onChangeChain}
          />
        )
      }
    </>
  );
};

export const ChainSelector = (Component);
