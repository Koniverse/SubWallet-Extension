// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { EarningRewardHistoryItem } from '@subwallet/extension-base/types';
import { BaseModal, MetaInfo } from '@subwallet/extension-web-ui/components';
import { useTranslation } from '@subwallet/extension-web-ui/hooks';
import { ThemeProps, VoidFunction } from '@subwallet/extension-web-ui/types';
import { customFormatDate } from '@subwallet/extension-web-ui/utils';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowSquareOut } from 'phosphor-react';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  modalId: string;
  rewardHistories: EarningRewardHistoryItem[];
  inputAsset: _ChainAsset;
  onClickViewExplore?: VoidFunction;
};

function Component ({ className, inputAsset, modalId, onClickViewExplore, rewardHistories }: Props) {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);

  const closeModal = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal, modalId]);

  return (
    <BaseModal
      className={CN(className, '__rewards-history-modal')}
      footer={
        <Button
          block={true}
          className={'__view-explorer-button'}
          icon={(
            <Icon
              phosphorIcon={ArrowSquareOut}
            />
          )}
          onClick={onClickViewExplore}
        >
          {t('View on explorer')}
        </Button>
      }
      id={modalId}
      onCancel={closeModal}
      title={'Reward history'}
    >
      <MetaInfo
        labelColorScheme='gray'
        labelFontWeight='regular'
        spaceSize='sm'
        valueColorScheme='light'
      >
        {rewardHistories.map((item, index) => (
          <MetaInfo.Number
            decimals={inputAsset.decimals || 0}
            key={`${item.slug}-${index}`}
            label={customFormatDate(new Date(item.blockTimestamp), '#DD# #MMM#, #YYYY#')}
            suffix={inputAsset.symbol}
            value={item.amount}
            valueColorSchema={'even-odd'}
          />
        ))}
      </MetaInfo>
    </BaseModal>
  );
}

export const EarningRewardsHistoryModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '&.__rewards-history-modal .ant-sw-modal-footer': {
      borderTop: 0
    }
  };
});
