// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _getAssetDecimals, _getAssetSymbol, _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import { BaseStepType, BriefSwapStep, CommonStepType, ProcessStep, SummaryEarningProcessData, SwapStepType, YieldPoolType, YieldStepType } from '@subwallet/extension-base/types';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { toDisplayNumber } from '@subwallet/extension-koni-ui/utils';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const useGetTransactionProcessStepText = () => {
  const { t } = useTranslation();
  const chainInfoMap = useSelector((root) => root.chainStore.chainInfoMap);
  const assetRegistry = useSelector((root: RootState) => root.assetRegistry.assetRegistry);

  return useCallback((processStep: ProcessStep, combineInfo: unknown) => {
    if (([
      CommonStepType.XCM,
      YieldStepType.XCM
    ] as BaseStepType[]).includes(processStep.type)) {
      const analysisMetadata = () => {
        try {
          const { destinationTokenInfo, originTokenInfo, sendingValue } = processStep.metadata as unknown as {
            sendingValue: string,
            originTokenInfo: _ChainAsset,
            destinationTokenInfo: _ChainAsset
          };

          return {
            tokenValue: toDisplayNumber(sendingValue, originTokenInfo.decimals || 0),
            tokenSymbol: _getAssetSymbol(originTokenInfo),
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

    if (processStep.type === SwapStepType.SWAP) {
      const analysisMetadata = () => {
        try {
          const { fromAmount, pair, toAmount } = processStep.metadata as unknown as BriefSwapStep;
          const fromAsset = assetRegistry[pair.from];
          const toAsset = assetRegistry[pair.to];
          const fromChain = chainInfoMap[fromAsset.originChain];
          const toChain = chainInfoMap[toAsset.originChain];

          return {
            fromTokenValue: toDisplayNumber(fromAmount, _getAssetDecimals(fromAsset)),
            fromTokenSymbol: _getAssetSymbol(fromAsset),
            fromChainName: fromChain.name,
            toTokenValue: toDisplayNumber(toAmount, _getAssetDecimals(toAsset)),
            toTokenSymbol: _getAssetSymbol(toAsset),
            toChainName: toChain.name
          };
        } catch (e) {
          console.log('analysisMetadata error', e);

          return {
            fromTokenValue: '',
            fromTokenSymbol: '',
            fromChainName: '',
            toTokenValue: '',
            toTokenSymbol: '',
            toChainName: ''
          };
        }
      };

      return t('Swap {{fromTokenValue}} {{fromTokenSymbol}} on {{fromChainName}} for {{toTokenValue}} {{toTokenSymbol}} on {{toChainName}}', {
        replace: {
          ...analysisMetadata()
        }
      });
    }

    if (([
      CommonStepType.TOKEN_APPROVAL,
      YieldStepType.TOKEN_APPROVAL
    ] as BaseStepType[]).includes(processStep.type)) {
      const analysisMetadata = () => {
        try {
          const { tokenApprove } = processStep.metadata as unknown as {
            tokenApprove: string,
          };

          const asset = assetRegistry[tokenApprove];

          return {
            tokenSymbol: _getAssetSymbol(asset),
            chainName: _getChainName(chainInfoMap[asset.originChain])
          };
        } catch (e) {
          console.log('analysisMetadata error', e);

          return {
            tokenSymbol: '',
            chainName: ''
          };
        }
      };

      /**
       * TODO: Improve check process type
       * At the moment, only swap use `CommonStepType.TOKEN_APPROVAL`.
       * So simple check with this type is enough
       * */
      if (processStep.type === CommonStepType.TOKEN_APPROVAL) {
        return t('Approve {{tokenSymbol}} on {{chainName}} for swap', {
          replace: {
            ...analysisMetadata()
          }
        });
      }

      return t('Approve {{tokenSymbol}} on {{chainName}} for transfer', {
        replace: {
          ...analysisMetadata()
        }
      });
    }

    if (processStep.type === SwapStepType.PERMIT) {
      return t('Sign message to authorize provider');
    }

    if (([
      YieldStepType.NOMINATE,
      YieldStepType.JOIN_NOMINATION_POOL,
      YieldStepType.MINT_VDOT,
      YieldStepType.MINT_VMANTA,
      YieldStepType.MINT_LDOT,
      YieldStepType.MINT_QDOT,
      YieldStepType.MINT_SDOT,
      YieldStepType.MINT_STDOT
    ] as BaseStepType[]).includes(processStep.type)) {
      const analysisMetadata = () => {
        try {
          const { brief } = combineInfo as SummaryEarningProcessData;

          const asset = assetRegistry[brief.token];

          const earnMethodMap: Record<string, string> = {
            [`${YieldPoolType.NOMINATION_POOL}`]: t('Nomination pool'),
            [`${YieldPoolType.NATIVE_STAKING}`]: t('Direct nomination'),
            [`${YieldPoolType.LIQUID_STAKING}`]: t('Liquid staking'),
            [`${YieldPoolType.LENDING}`]: t('Lending'),
            [`${YieldPoolType.PARACHAIN_STAKING}`]: t('Parachain staking'),
            [`${YieldPoolType.SINGLE_FARMING}`]: t('Single farming')
          };

          return {
            tokenValue: toDisplayNumber(brief.amount, _getAssetDecimals(asset)),
            tokenSymbol: _getAssetSymbol(asset),
            earnMethod: earnMethodMap[brief.method]
          };
        } catch (e) {
          console.log('analysisMetadata error', e);

          return {
            tokenValue: '',
            tokenSymbol: '',
            earnMethod: ''
          };
        }
      };

      return t('Stake {{tokenValue}} {{tokenSymbol}} via {{earnMethod}}', {
        replace: {
          ...analysisMetadata()
        }
      });
    }

    return '';
  }, [assetRegistry, chainInfoMap, t]);
};

export default useGetTransactionProcessStepText;
