// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SlippageType } from '@subwallet/extension-base/types';
import { SlippageModal } from '@subwallet/extension-koni-ui/components/Modal/Swap';
import { EARNING_SLIPPAGE_MODAL } from '@subwallet/extension-koni-ui/constants';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, ModalContext, Number, Tooltip, Typography } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { PencilSimpleLine } from 'phosphor-react';
import React, { useCallback, useContext, useState } from 'react';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  label?: string;
  bondedBalance?: string | number | BigN;
  decimals: number;
  symbol: string;
  maxSlippage?: SlippageType;
  setMaxSlippage: (slippage: SlippageType) => void;
  isSlippageAcceptable?: boolean;
  isSubnetStaking?: boolean;
};

const Component = ({ bondedBalance, className, decimals, isSlippageAcceptable, isSubnetStaking, label, maxSlippage, setMaxSlippage, symbol }: Props) => {
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;

  // For subnet staking
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const [isSlippageModalVisible, setIsSlippageModalVisible] = useState<boolean>(false);

  const onSelectSlippage = useCallback((slippage: SlippageType) => {
    setMaxSlippage(slippage);
  }, [setMaxSlippage]);

  const closeSlippageModal = useCallback(() => {
    inactiveModal(EARNING_SLIPPAGE_MODAL);
    setIsSlippageModalVisible(false);
  }, [inactiveModal]);

  const onOpenSlippageModal = useCallback(() => {
    setIsSlippageModalVisible(true);
    activeModal(EARNING_SLIPPAGE_MODAL);
  }, [activeModal]);

  const slippageValue = maxSlippage || { slippage: new BigN(0.005), isCustomType: true };
  // For subnet staking

  return (
    <Typography.Paragraph className={CN(className, 'bonded-balance')}>
      <div className='balance-wrapper'>
        <div className='balance-value'>
          <Number
            decimal={decimals}
            decimalColor={token.colorTextTertiary}
            intColor={token.colorTextTertiary}
            size={14}
            suffix={symbol}
            unitColor={token.colorTextTertiary}
            value={bondedBalance || 0}
          />
          {label || t('ui.TRANSACTION.screen.Transaction.part.BondedBalance.staked')}
        </div>

        {isSubnetStaking && (
          <Tooltip
            placement={'topRight'}
            title={'Transaction will not be executed if the price changes more than this slippage'}
          >
            <div className='slippage-info'>
              <span className='slippage-label'>{t('ui.TRANSACTION.screen.Transaction.part.BondedBalance.slippage')}: </span>
              <Number
                className='slippage-value'
                decimal={0}
                decimalColor={isSlippageAcceptable ? token['gray-5'] : token.colorError}
                intColor={isSlippageAcceptable ? token['gray-5'] : token.colorError}
                size={14}
                suffix={'%'}
                unitColor={isSlippageAcceptable ? token['gray-5'] : token.colorError}
                value={maxSlippage ? (maxSlippage.slippage.toNumber() * 100) : 0}
              />
              <div
                className='__slippage-editor-button'
                onClick={onOpenSlippageModal}
              >
                <Icon
                  className='__slippage-editor-button-icon'
                  iconColor={token['gray-5']}
                  phosphorIcon={PencilSimpleLine}
                  size='xs'
                />
              </div>
            </div>
          </Tooltip>
        )}
      </div>
      {isSlippageModalVisible && (
        <SlippageModal
          modalId={EARNING_SLIPPAGE_MODAL}
          onApplySlippage={onSelectSlippage}
          onCancel={closeSlippageModal}
          slippageValue={slippageValue}
        />
      )}
    </Typography.Paragraph>
  );
};

const BondedBalance = styled(Component)(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    color: token.colorTextTertiary,

    '&.ant-typography': {
      marginBottom: 0
    },

    '.ant-number': {
      marginRight: '0.3em'
    },

    '.balance-wrapper': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%'
    },

    '.balance-value': {
      display: 'flex',
      alignItems: 'center',
      maxWidth: '10.625rem'
    },

    '.slippage-info': {
      display: 'flex',
      alignItems: 'center',
      maxWidth: '9.375rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    } as const,

    '.slippage-label': {
      marginRight: '0.1rem'
    },

    '.slippage-value': {
      marginRight: '0.25rem'
    },

    '.__slippage-editor-button': {
      cursor: 'pointer'
    }
  });
});

export default BondedBalance;
