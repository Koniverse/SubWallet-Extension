// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVotingInfo } from '@subwallet/extension-base/services/open-gov/interface';
import { BN_ZERO } from '@subwallet/extension-base/utils';
import { useNotification } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { noop } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import { SwIconProps } from '@subwallet/react-ui/es/icon';
import { BigNumber } from 'bignumber.js';
import CN from 'classnames';
import { CaretRight, LockKey, UserCircleGear } from 'phosphor-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  onGoUnlockToken: VoidFunction;
  govLockedInfos: GovVotingInfo[];
};
type ItemType = {
  icon: SwIconProps['phosphorIcon'];
  label: string;
  key: string;
  onClick?: VoidFunction;
  disabled?: boolean;
}

const Component = ({ className, govLockedInfos, onGoUnlockToken }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const notify = useNotification();
  const hasUnlockableAccount = useMemo(() => {
    return govLockedInfos.some((lockInfo) => new BigNumber(lockInfo.summary.totalLocked).gt(BN_ZERO));
  }, [govLockedInfos]);

  const items = useMemo<ItemType[]>(() => {
    return [
      {
        icon: UserCircleGear,
        key: 'delegations',
        label: t('Delegations'),
        onClick: () => {
          notify({
            message: t('Coming soon')
          });
        }
      },
      {
        icon: LockKey,
        key: 'locked',
        label: t('Locked'),
        onClick: hasUnlockableAccount ? onGoUnlockToken : noop,
        disabled: !hasUnlockableAccount
      }
    ];
  }, [hasUnlockableAccount, notify, onGoUnlockToken, t]);

  return (
    <div className={className}>
      {
        items.map((i) => (
          <div
            className={CN('__action-item', { '-disabled': i.disabled })}
            key={i.key}
            onClick={i.onClick}
          >
            <div className='__action-item-icon-wrapper'>
              <Icon
                className='__action-item-icon'
                customSize={'16px'}
                phosphorIcon={i.icon}
                weight={'fill'}
              />
            </div>

            <div className='__action-item-label'>
              {i.label}
            </div>

            <div className='__action-item-caret-wrapper'>
              <Icon
                className='__action-item-caret'
                customSize={'20px'}
                phosphorIcon={CaretRight}
              />
            </div>
          </div>
        ))
      }
    </div>
  );
};

export const QuickActionsContainer = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    background: token.colorBgSecondary,
    borderRadius: 12,

    '.__action-item': {
      cursor: 'pointer',
      display: 'flex',
      height: 48,
      alignItems: 'center',
      paddingLeft: token.paddingSM,
      paddingRight: token.paddingXXS,
      gap: token.sizeSM,

      '&.-disabled': {
        cursor: 'not-allowed',
        opacity: 0.3
      }
    },

    '.__action-item-icon-wrapper, .__action-item-caret-wrapper': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    '.__action-item-icon-wrapper': {
      minWidth: 24,
      height: 24,
      borderRadius: '100%',
      backgroundColor: token['gray-2'],
      color: token.colorTextLight1
    },

    '.__action-item-label': {
      fontSize: token.fontSize,
      color: token.colorTextLight1,
      fontWeight: token.headingFontWeight,
      lineHeight: token.lineHeight,
      flex: 1,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      'white-space': 'nowrap'
    },

    '.__action-item-caret-wrapper': {
      height: 40,
      minWidth: 40,
      color: token.colorTextLight3
    }
  };
});
