// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _getAssetDecimals, _getAssetSymbol, _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import { BriefSwapStep, CommonStepType, ProcessStep, StepStatus, SwapStepType } from '@subwallet/extension-base/types';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toDisplayNumber } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import { SwIconProps } from '@subwallet/react-ui/es/icon';
import CN from 'classnames';
import { CheckCircle, ProhibitInset, SpinnerGap } from 'phosphor-react';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  item: ProcessStep,
  index: number,
  isLastItem?: boolean;
};

const Component: FC<Props> = (props: Props) => {
  const { className, index, isLastItem, item } = props;
  const { t } = useTranslation();
  const chainInfoMap = useSelector((root) => root.chainStore.chainInfoMap);
  const assetRegistry = useSelector((root: RootState) => root.assetRegistry.assetRegistry);

  const iconProp = useMemo<SwIconProps>(() => {
    const iconInfo: SwIconProps = (() => {
      if (item.status === StepStatus.COMPLETE) {
        return {
          phosphorIcon: CheckCircle,
          weight: 'fill'
        };
      } else if (item.status === StepStatus.FAILED) {
        return {
          phosphorIcon: ProhibitInset,
          weight: 'fill'
        };
      } else if (item.status === 'PROCESSING') {
        return {
          phosphorIcon: SpinnerGap,
          weight: 'fill'
        };
      }

      return {
        type: 'customIcon',
        customIcon: (
          <span className={'__step-ordinal-wrapper'}>
            <span className='__step-ordinal'>
              {index + 1}
            </span>
          </span>
        )
      };
    })();

    return {
      ...iconInfo,
      size: 'xs'
    };
  }, [index, item.status]);

  const text = useMemo(() => {
    if (item.type === CommonStepType.XCM) {
      const analysisMetadata = () => {
        try {
          const { destinationTokenInfo, originTokenInfo, sendingValue } = item.metadata as unknown as {
            sendingValue: string,
            originTokenInfo: _ChainAsset,
            destinationTokenInfo: _ChainAsset
          };

          return {
            tokenValue: toDisplayNumber(sendingValue, originTokenInfo.decimals || 0),
            tokenSymbol: originTokenInfo.symbol,
            chainName: _getChainName(chainInfoMap[originTokenInfo.originChain]),
            destChainName: _getChainName(chainInfoMap[destinationTokenInfo.originChain])
          };
        } catch (e) {
          console.log('analysisMetadata error', e);

          return {
            tokenValue: '',
            tokenSymbol: '',
            chainName: '',
            destChainName: ''
          };
        }
      };

      return t('Transfer {{tokenValue}} {{tokenSymbol}} from {{chainName}} to {{destChainName}}', {
        replace: {
          ...analysisMetadata()
        }
      });
    }

    if (item.type === SwapStepType.SWAP) {
      const analysisMetadata = () => {
        try {
          const { fromAmount, pair, toAmount } = item.metadata as unknown as BriefSwapStep;
          const fromAsset = assetRegistry[pair.from];
          const toAsset = assetRegistry[pair.to];

          return {
            fromTokenValue: toDisplayNumber(fromAmount, _getAssetDecimals(fromAsset)),
            fromTokenSymbol: _getAssetSymbol(fromAsset),
            toTokenValue: toDisplayNumber(toAmount, _getAssetDecimals(toAsset)),
            toTokenSymbol: _getAssetSymbol(toAsset)
          };
        } catch (e) {
          console.log('analysisMetadata error', e);

          return {
            fromTokenValue: '',
            fromTokenSymbol: '',
            toTokenValue: '',
            toTokenSymbol: ''
          };
        }
      };

      return t('Swap {{fromTokenValue}} {{fromTokenSymbol}} for {{toTokenValue}} {{toTokenSymbol}}', {
        replace: {
          ...analysisMetadata()
        }
      });
    }

    return '';
  }, [assetRegistry, chainInfoMap, item.metadata, item.type, t]);

  return (
    <div
      className={CN(className, {
        '-last-item': isLastItem
      })}
    >
      <div className={CN('__item-left-part', {
        '-pending': [StepStatus.QUEUED, StepStatus.PREPARE].includes(item.status),
        '-processing': item.status === StepStatus.PROCESSING,
        '-complete': item.status === StepStatus.COMPLETE,
        '-failed': item.status === StepStatus.FAILED
      })}
      >
        <Icon
          {...iconProp}
          className={CN('__icon')}
        />

        {
          !isLastItem && (
            <div className='__line'></div>
          )
        }
      </div>
      <div className='__item-right-part'>
        <div className='__text'>{text}</div>
      </div>
    </div>
  );
};

export const ProgressStepItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    gap: token.sizeXS,
    minHeight: 36,

    '.__item-left-part': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },

    '.__icon': {
      border: '1px solid currentcolor',
      minWidth: 24,
      minHeight: 24,
      borderRadius: '100%',
      alignItems: 'center',
      justifyContent: 'center'
    },

    '.__line': {
      width: 1,
      flex: 1,
      backgroundColor: 'currentcolor',
      marginTop: 2,
      marginBottom: 2
    },

    '.__step-ordinal-wrapper': {
      width: '1em',
      height: '1em',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'currentcolor',
      borderRadius: '100%'
    },

    '.__step-ordinal': {
      color: token.colorTextLight1,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM
    },

    '.__item-left-part.-pending': {
      color: token.colorTextLight7
    },

    '.__item-left-part.-processing': {
      color: token.colorWarning
    },

    '.__item-left-part.-complete': {
      color: token.colorSuccess
    },

    '.__item-left-part.-failed': {
      color: token.colorError
    },

    '.__item-right-part': {
      paddingBottom: 12
    },

    '.__text': {
      marginTop: -8,
      minHeight: 40,
      display: 'flex',
      alignItems: 'center',
      color: token.colorTextLight3,
      fontSize: token.sizeSM,
      lineHeight: token.lineHeightSM
    },

    '&.-last-item': {
      '.__item-right-part': {
        paddingBottom: 0
      }
    }
  });
});
