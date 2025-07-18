// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { YieldPoolInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import EarningValidatorSelectedModal from '@subwallet/extension-koni-ui/components/Modal/Earning/EarningValidatorSelectedModal';
import { EARNING_SELECTED_VALIDATOR_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { PencilSimpleLine } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  compound: YieldPositionInfo;
  poolInfo: YieldPoolInfo;
  inputAsset?: _ChainAsset;
  maxValidator?: number;
  totalValidator?: number;
  addresses?: string[]
};

function Component ({ addresses, className, compound, poolInfo }: Props) {
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);

  const onClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    activeModal(EARNING_SELECTED_VALIDATOR_MODAL);
  }, [activeModal]);

  const isAllAccount = useMemo(() => isAccountAll(compound.address), [compound.address]);

  const haveNomination = useMemo(() => {
    return [YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING, YieldPoolType.SUBNET_STAKING].includes(poolInfo.type);
  }, [poolInfo.type]);

  const noNomination = useMemo(() => {
    return !haveNomination || isAllAccount || !compound.nominations.length;
  }, [compound.nominations.length, haveNomination, isAllAccount]);

  if (noNomination) {
    return null;
  }

  const title = 'Your validators';

  return (
    <>
      <div className={CN(className)}>
        <div
          className='__panel-header'
          onClick={onClick}
        >
          <div className='__panel-title'>{t(title)}</div>
          <div className='__panel-icon'>
            <Icon
              phosphorIcon={PencilSimpleLine}
              size='sm'
            />
          </div>
        </div>
      </div>

      <EarningValidatorSelectedModal
        addresses={addresses}
        chain={poolInfo.chain}
        compound={compound}
        disabled={false}
        displayType={'nomination'}
        from={compound.address}
        modalId={EARNING_SELECTED_VALIDATOR_MODAL}
        nominations={compound.nominations}
        slug={poolInfo.slug}
        title={title}
      />
    </>
  );
}

export const SelectedValidatorInfoPart = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  '.__nomination-item': {
    gap: token.sizeSM,

    '.__label': {
      'white-space': 'nowrap',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: token.sizeXS,
      overflow: 'hidden'
    },

    '.__value-col': {
      flex: '0 1 auto'
    }
  },

  '.__nomination-item.-hide-number': {
    '.__value-col': {
      display: 'none'
    }
  },

  '.__nomination-name': {
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },

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
  }
}));
