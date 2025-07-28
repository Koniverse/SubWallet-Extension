// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { YieldPoolInfo } from '@subwallet/extension-base/types';
import { useGetChainPrefixBySlug, useGetNativeTokenBasicInfo } from '@subwallet/extension-koni-ui/hooks';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatBalance, toShort } from '@subwallet/extension-koni-ui/utils';
import { Icon, Web3Block } from '@subwallet/react-ui';
import SwAvatar from '@subwallet/react-ui/es/sw-avatar';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { CheckCircle, CurrencyCircleDollar } from 'phosphor-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  nominationInfo: NominationInfo;
  isSelected?: boolean;
  isSelectable?: boolean;
  poolInfo: YieldPoolInfo
  isChangeValidator?: boolean
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, isChangeValidator, isSelectable = true, isSelected, nominationInfo, poolInfo } = props;
  const { chain } = nominationInfo;
  const networkPrefix = useGetChainPrefixBySlug(chain);

  const { token } = useTheme() as Theme;
  const { t } = useTranslation();

  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);

  const subnetSymbol = poolInfo.metadata.subnetData?.subnetSymbol;

  return (
    <div
      className={CN(className)}
    >
      <Web3Block
        className={'validator-item-content'}
        leftItem={
          <SwAvatar
            identPrefix={networkPrefix}
            size={32}
            value={nominationInfo.validatorAddress}
          />
        }
        middleItem={
          <>
            <div className={'middle-item__name-wrapper'}>
              <div className={'middle-item__name'}>
                {nominationInfo.validatorIdentity || toShort(nominationInfo.validatorAddress)}
              </div>
            </div>

            <div className={'middle-item__info'}>
              {
                isChangeValidator
                  ? (
                    <div className={'middle-item__change-validator'}>
                      <div className={'middle-item'}>
                        <span className='middle-item__commission'>
                          <Icon
                            phosphorIcon={CurrencyCircleDollar}
                            size='xs'
                            weight='fill'
                          />
                            &nbsp;: {nominationInfo.commission !== undefined ? `${nominationInfo.commission}%` : 'N/A'}
                        </span>
                        <>
                            -
                          <div className='middle-item__apy'>
                            &nbsp;{t('ui.EARNING.components.StakingItem.Nomination.apy')}: {nominationInfo.expectedReturn ? formatBalance(nominationInfo.expectedReturn, 0) : '0'}%
                          </div>
                        </>
                      </div>
                      {new BigN(nominationInfo.activeStake).gt(0) && (
                        <span className={'middle-item__active-stake'}>
                          {formatBalance(nominationInfo.activeStake, decimals)} {subnetSymbol || symbol}
                        </span>
                      )}
                    </div>
                  )
                  : (
                    new BigN(nominationInfo.activeStake).gt(0) && (
                      <div className={'middle-item__active-stake'}>
                        <span>{t('ui.EARNING.components.StakingItem.Nomination.staked')}</span>
                        <span>&nbsp;{formatBalance(nominationInfo.activeStake, decimals)}&nbsp;</span>
                        <span>{subnetSymbol || symbol}</span>
                      </div>
                    )
                  )
              }
            </div>
          </>
        }

        rightItem={
          isSelectable &&
            (
              <div className={'right-item__selected-icon-wrapper'}>
                {(isSelected && (
                  <Icon
                    className={'right-item__select-icon'}
                    iconColor={token.colorSuccess}
                    phosphorIcon={CheckCircle}
                    size={'sm'}
                    weight={'fill'}
                  />
                ))
                }
              </div>
            )}
      />
    </div>
  );
};

const StakingNominationItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    borderRadius: token.borderRadiusLG,
    background: token.colorBgSecondary,

    '.validator-item-content': {
      borderRadius: token.borderRadiusLG,
      paddingBottom: '0px',
      paddingTop: '0px',
      minHeight: '58px'
    },

    '.middle-item__name-wrapper': {
      display: 'flex',
      alignItems: 'center'
    },

    '.middle-item__name': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      paddingRight: token.paddingXXS,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    },

    '.middle-item__info': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextLight4
    },

    '.middle-item__active-stake': {
      color: token.colorTextLight4,
      paddingRight: token.paddingXXS
    },

    '.right-item__selected-icon-wrapper': {
      minWidth: '40px',
      display: 'flex',
      justifyContent: 'center',
      marginLeft: token.marginXXS
    },

    '.right-item__select-icon': {
      paddingLeft: token.paddingSM - 2,
      paddingRight: token.paddingSM - 2
    },

    '.middle-item__change-validator': {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextLight4
    },

    '.middle-item': {
      display: 'flex',
      alignItems: 'center',
      gap: token.marginXXS
    },

    '.middle-item__commission': {
      display: 'flex',
      alignItems: 'center'
    },

    '.middle-item__apy': {
      color: token.colorSuccess,
      display: 'flex',
      alignItems: 'center'
    }
  };
});

export default StakingNominationItem;
