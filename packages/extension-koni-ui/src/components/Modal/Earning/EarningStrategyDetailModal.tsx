// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { STRATEGY_DETAIL_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetChainPrefixBySlug } from '@subwallet/extension-koni-ui/hooks';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { StrategyDataType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext, SwModal } from '@subwallet/react-ui';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  onCancel?: () => void;
  strategyItem: StrategyDataType;
  chain: string;
};

function Component (props: Props): React.ReactElement<Props> {
  const { chain, className, onCancel, strategyItem } = props;
  const { address: validatorAddress,
    constituents,
    decimals,
    expectedReturn: earningEstimated = '',
    identity: validatorName = '',
    minBond: minStake, symbol } = strategyItem;
  const { t } = useTranslation();

  const { inactiveModal } = useContext(ModalContext);

  const networkPrefix = useGetChainPrefixBySlug(chain);

  const _onCancel = useCallback(() => {
    inactiveModal(STRATEGY_DETAIL_MODAL);

    onCancel && onCancel();
  }, [inactiveModal, onCancel]);

  return (
    <SwModal
      className={className}
      id={STRATEGY_DETAIL_MODAL}
      onCancel={_onCancel}
      title={t('ui.EARNING.components.Modal.Earning.StrategyDetail.strategyDetails')}
    >
      <MetaInfo
        hasBackgroundWrapper
        spaceSize={'xs'}
        valueColorScheme={'light'}
      >
        <MetaInfo.Account
          address={validatorAddress}
          label={t('ui.EARNING.components.Modal.Earning.StrategyDetail.strategy')}
          name={validatorName}
          networkPrefix={networkPrefix}
        />
        <MetaInfo.Number
          decimals={decimals}
          label={t('ui.EARNING.components.Modal.Earning.StrategyDetail.minimumStakeRequired')}
          suffix={symbol}
          value={minStake}
          valueColorSchema={'even-odd'}
        />
        <MetaInfo.Default
          label={t('ui.EARNING.components.Modal.Earning.StrategyDetail.constituents')}
        >
          {constituents.length} {constituents.length > 1 ? t('ui.EARNING.components.Modal.Earning.StrategyDetail.subnets') : t('ui.EARNING.components.Modal.Earning.StrategyDetail.subnet')}
        </MetaInfo.Default>
        {!!earningEstimated && (
          <MetaInfo.Number
            label={t('ui.EARNING.components.Modal.Earning.StrategyDetail.estimatedApy')}
            suffix={'%'}
            value={earningEstimated}
            valueColorSchema={'even-odd'}
          />
        )}
      </MetaInfo>
    </SwModal>
  );
}

const EarningStrategyDetailModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.__maximum-validator .__value': {
      display: 'flex'
    },
    '.__tooltip-label': {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      gap: token.sizeXXS
    }
  });
});

export default EarningStrategyDetailModal;
