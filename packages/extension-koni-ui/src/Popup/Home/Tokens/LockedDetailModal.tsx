// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LockedDetails } from '@subwallet/extension-base/types';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, Number, SwModal, Tooltip } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { Info } from 'phosphor-react';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  id: string;
  onCancel: () => void;
  lockedDetails: LockedDetails;
  symbol: string;
  decimal: number ;
};

function Component ({ className = '', decimal, id, lockedDetails, onCancel, symbol }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const { governance, others, staking } = lockedDetails;

  const items = [
    { label: t('ui.BALANCE.screen.Tokens.LockedDetailModal.staking'), value: staking },
    { label: t('ui.BALANCE.screen.Tokens.LockedDetailModal.governance'), value: governance },
    {
      label: (
        <Tooltip
          placement='topLeft'
          title={t('ui.BALANCE.screen.Tokens.LockedDetailModal.othersTooltipTitle')}
        >
          <span className='__locked-others'>
            {t('ui.BALANCE.screen.Tokens.LockedDetailModal.others')}
            <Icon
              className='__locked-others-icon'
              phosphorIcon={Info}
              size='xs'
            />
          </span>
        </Tooltip>
      ),
      value: others
    }
  ];

  const visibleItems = items.filter(({ value }) => new BigN(value || 0).gt(0));

  return (
    <SwModal
      className={CN(className)}
      id={id}
      onCancel={onCancel}
      title={t('ui.BALANCE.screen.Tokens.LockedDetailModal.lockedDetails')}
    >
      <div className='__container'>
        {visibleItems.map((item, index) => (
          <div
            className='__row'
            key={index}
          >
            <div className='__label'>{item.label}</div>
            <div className='__balance'>
              <Number
                className='__value'
                decimal={decimal || 0}
                decimalOpacity={0.45}
                intOpacity={0.85}
                size={14}
                suffix={symbol}
                unitOpacity={0.85}
                value={new BigN(item.value || 0)}
              />
            </div>
          </div>
        ))}
      </div>
    </SwModal>
  );
}

export const LockedDetailModal = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  '.__container': {
    borderRadius: token.borderRadiusLG,
    backgroundColor: token.colorBgSecondary,
    padding: '12px'
  },

  '.__row': {
    display: 'flex',
    justifyContent: 'space-between'
  },

  '.__row:not(:last-child)': {
    marginBottom: token.margin
  },

  '.__label': {
    paddingRight: token.paddingSM
  },

  '.__locked-others': {
    cursor: 'pointer'
  },

  '.__locked-others-icon': {
    color: token.colorTextLight3,
    marginLeft: token.marginXXS
  },

  '.__balance': {
    display: 'flex',
    justifyContent: 'flex-end'
  }
}));
