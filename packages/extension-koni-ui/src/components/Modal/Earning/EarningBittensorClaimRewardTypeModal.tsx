// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BittensorRootClaimType } from '@subwallet/extension-base/types';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { BackgroundIcon, Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowsClockwise, ArrowsLeftRight, CheckCircle, LockKey } from 'phosphor-react';
import React, { Context, useCallback, useContext, useMemo } from 'react';
import styled, { ThemeContext } from 'styled-components';

type Props = ThemeProps & {
  modalId: string;
  rootClaimType: BittensorRootClaimType;
};

function Component ({ className, modalId }: Props) {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;

  const closeModal = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal, modalId]);

  const onChangeClaimRewardType = useCallback(() => {
    console.log('Change claim reward type');
  }, []);

  return (
    <SwModal
      className={CN(className, '__earning-bittensor-claim-reward-type-modal')}
      footer={
        <Button
          block
          className='__change-claim-reward-type-button'
          icon={
            <Icon
              phosphorIcon={ArrowsClockwise}
              weight='fill'
            />
          }
          onClick={onChangeClaimRewardType}
        >
          {t('Change claim type')}
        </Button>
      }
      id={modalId}
      onCancel={closeModal}
      title={'Claim rewards type'}
    >
      <div className='__claim-reward-type-description'>
        {t('ui.EARNING.components.Modal.Earning.BittensorClaimRewardType.description')}
      </div>

      {/* Swap Box */}
      <div className='__claim-reward-type-box'>
        <div className='__box-icon'>
          <BackgroundIcon
            backgroundColor={token['green-6']}
            phosphorIcon={ArrowsLeftRight}
            size='lg'
            weight='fill'
          />
        </div>
        <div className='__box-content'>
          <div className='__box-title'>Swap
            <Icon
              iconColor={token.colorSuccess}
              phosphorIcon={CheckCircle}
              size='sm'
              weight='fill'
            />
          </div>
          <div className='__box-description'>
            Your accumulated alpha rewards will be swapped to TAO and added to your stake automatically
          </div>
        </div>
      </div>

      {/* Keep Box */}
      <div className='__claim-reward-type-box'>
        <div className='__box-icon'>
          <BackgroundIcon
            backgroundColor={token['geekblue-6']}
            phosphorIcon={LockKey}
            size='lg'
            weight='fill'
          />
        </div>
        <div className='__box-content'>
          <div className='__box-title'>Keep</div>
          <div className='__box-description'>
            Your accumulated alpha rewards will be kept and staked on the subnets that generated them
          </div>
        </div>
      </div>
    </SwModal>
  );
}

export const EarningBittensorClaimRewardTypeModal = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  '.__claim-reward-type-description': {
    textAlign: 'center',
    lineHeight: token.lineHeightHeading6,
    color: token.colorTextTertiary,
    fontSize: token.fontSizeHeading6,
    marginBottom: token.padding
  },

  '.__claim-reward-type-box': {
    display: 'flex',
    gap: token.sizeSM,
    backgroundColor: token.colorBgSecondary,
    padding: `${token.paddingSM}px`,
    borderRadius: token.borderRadiusLG,
    marginBottom: token.padding,
    border: '1px solid',
    borderColor: `${token.colorSecondary}`,

    '.__box-icon': {
      display: 'flex',
      alignItems: 'center'
    },

    '.__box-content': {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },

    '.__box-title': {
      fontSize: token.fontSizeHeading5,
      fontWeight: 600,
      marginBottom: 4,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },

    '.__box-description': {
      fontSize: token.fontSizeHeading6,
      color: token.colorTextDescription
    }
  }
}));
