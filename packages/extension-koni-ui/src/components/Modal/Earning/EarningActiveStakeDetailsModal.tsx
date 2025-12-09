// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { YieldPositionInfo } from '@subwallet/extension-base/types';
import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { EARNING_ACITVE_STAKE_DETAILS_MODAL } from '@subwallet/extension-koni-ui/constants';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, SwModal, Tooltip } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import { Info } from 'phosphor-react';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  positionInfo: YieldPositionInfo;
  decimals: number;
  symbol: string;
  onCancel: VoidFunction;
};

const modalId = EARNING_ACITVE_STAKE_DETAILS_MODAL;

const Component: FC<Props> = (props: Props) => {
  const { className, decimals, onCancel, positionInfo, symbol } = props;

  const { t } = useTranslation();

  return (
    <SwModal
      className={className}
      destroyOnClose={true}
      footer={(
        <Button
          block={true}
          onClick={onCancel}
        >
          {t('ui.EARNING.components.Modal.Earning.ActiveStakeDetails.close')}
        </Button>
      )}
      id={modalId}
      onCancel={onCancel}
      title={t('ui.EARNING.components.Modal.Earning.ActiveStakeDetails.title')}
    >
      <MetaInfo
        className={'__active-stake-info-block'}
        hasBackgroundWrapper={true}
        labelColorScheme={'gray'}
        labelFontWeight={'regular'}
        spaceSize={'ms'}
        valueColorScheme={'light'}
      >
        {
          !!positionInfo.metadata?.manualStake && new BigN(positionInfo.metadata?.manualStake).gt(0) &&
          <MetaInfo.Number
            decimals={decimals}
            label={t('ui.EARNING.components.Modal.Earning.ActiveStakeDetails.manualStake')}
            suffix={symbol}
            value={positionInfo.metadata?.manualStake}
            valueColorSchema={'even-odd'}
          />
        }
        {
          !!positionInfo.metadata?.compoundingStake && new BigN(positionInfo.metadata?.compoundingStake).gt(0) &&
          <MetaInfo.Number
            decimals={decimals}
            label={t('ui.EARNING.components.Modal.Earning.ActiveStakeDetails.compoundingStake')}
            suffix={symbol}
            value={positionInfo.metadata?.compoundingStake}
            valueColorSchema={'even-odd'}
          />
        }
        {
          !!positionInfo.metadata?.pendingStake && new BigN(positionInfo.metadata?.pendingStake).gt(0) &&
          <MetaInfo.Number
            decimals={decimals}
            label={
              <Tooltip
                placement={'topRight'}
                title={t('ui.EARNING.components.Modal.Earning.ActiveStakeDetails.pendingStakeTooltipTitle')}
              >
                <div className={ '__label-wrapper'}>
                  <div>{t('ui.EARNING.components.Modal.Earning.ActiveStakeDetails.pendingStake')}</div>
                  {
                    <Icon
                      className={'__info-icon'}
                      customSize={'16px'}
                      phosphorIcon={Info}
                      size='sm'
                    />
                  }
                </div>
              </Tooltip>
            }
            suffix={symbol}
            value={positionInfo.metadata?.pendingStake}
            valueColorSchema={'even-odd'}
          />
        }
      </MetaInfo>
    </SwModal>
  );
};

const EarningActiveStakeDetailsModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-body.ant-sw-modal-body': {
      paddingBottom: 8
    },

    '.ant-sw-modal-footer.ant-sw-modal-footer': {
      borderTop: 0
    },

    '.__label-wrapper': {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  });
});

export default EarningActiveStakeDetailsModal;
