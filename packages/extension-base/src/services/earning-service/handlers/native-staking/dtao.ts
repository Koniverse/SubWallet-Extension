// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { BITTENSOR_REFRESH_STAKE_APY, BITTENSOR_REFRESH_STAKE_INFO } from '@subwallet/extension-base/constants';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { BaseYieldPositionInfo, BasicTxErrorType, EarningStatus, NativeYieldPoolInfo, RequestEarningImpact, TransactionData, YieldPoolInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { reformatAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';

import { BN_ZERO } from '@polkadot/util';

import TaoNativeStakingPoolHandler, { DEFAULT_DTAO_MINBOND, RateSubnetData, TaoStakeInfo, TaoStakingStakeOption } from './tao';

export interface SubnetData {
  netuid: number;
  name: string;
  symbol: string;
  ownerHotkey: string;
  maxAllowedValidators: number;
  taoIn: number;
  taoInEmission: number;
}

interface DynamicInfo {
  netuid: number;
  ownerHotkey: string;
  subnetName: number[];
  tokenSymbol: number[];
  subnetIdentity?: {
    subnetName: `0x${string}`;
  },
  taoIn: number;
  taoInEmission: number;
}

interface SubnetsInfo {
  netuid: number;
  maxAllowedValidators: number;
}

export interface EarningImpactResult {
  slippage: number;
  rate: number;
  stakingTaoFee?: string;
}

interface SubnetPosition {
  delegatorState: TaoStakingStakeOption[];
  totalBalance: BigN;
  originalTotalStake: BigN;
}

const getAlphaToTaoRateMap = async (substrateApi: _SubstrateApi): Promise<Record<number, string>> => {
  const allSubnets = (await substrateApi.api.call.subnetInfoRuntimeApi.getAllDynamicInfo()).toJSON() as RateSubnetData[] | undefined;

  if (!allSubnets || allSubnets.length === 0) {
    return {};
  }

  const result = Object.create(null) as Record<number, string>;

  for (const subnet of allSubnets) {
    const netuid = subnet?.netuid;

    if (netuid === undefined) {
      continue;
    }

    const taoIn = subnet?.taoIn ? new BigN(subnet.taoIn) : new BigN(0);
    const alphaIn = subnet?.alphaIn ? new BigN(subnet.alphaIn) : new BigN(0);

    result[netuid] = netuid === 0 || alphaIn.lte(0) ? '1' : taoIn.dividedBy(alphaIn).toString();
  }

  return result;
};

export default class SubnetTaoStakingPoolHandler extends TaoNativeStakingPoolHandler {
  // @ts-ignore
  public override readonly type = YieldPoolType.SUBNET_STAKING;
  public override slug: string;
  protected override name: string;
  protected override shortName: string;
  public subnetData: SubnetData[] = [];
  private isInit = false;

  constructor (state: KoniState, chain: string) {
    super(state, chain);

    const symbol = this.nativeToken.symbol;
    const chainSlug = this.chainInfo.slug;

    this.slug = `${symbol}___subnet_staking___${chainSlug}`;
    this.name = 'Subnet Tao Staking';
    this.shortName = 'dTAO Staking';
  }

  public override canHandleSlug (slug: string): boolean {
    return slug.startsWith(`${this.slug}__`);
  }

  public override async getEarningImpact (params: RequestEarningImpact): Promise<EarningImpactResult> {
    const substrateApi = await this.substrateApi.isReady;
    const subnetInfo = (await substrateApi.api.call.subnetInfoRuntimeApi.getDynamicInfo(params.netuid)).toJSON() as RateSubnetData | undefined;

    const alphaIn = new BigN(subnetInfo?.alphaIn || 0);
    const taoIn = new BigN(subnetInfo?.taoIn || 0);
    const k = alphaIn.multipliedBy(taoIn);

    const value = new BigN(params.value);
    const rate = taoIn.dividedBy(alphaIn);

    const feeRate = await this.bittensorCache.fetchSubnetFeeRate(params.netuid);

    if (params.type === ExtrinsicType.STAKING_BOND) {
      const newTaoIn = taoIn.plus(value);
      const newAlphaIn = k.dividedBy(newTaoIn);
      const alphaReturned = alphaIn.minus(newAlphaIn);
      const alphaIdeal = value.multipliedBy(alphaIn).dividedBy(taoIn);
      const slippage = alphaIdeal.minus(alphaReturned).dividedBy(alphaIdeal);

      const bnStakingTaoFee = value.multipliedBy(feeRate);

      return {
        slippage: slippage.plus(0.0001).toNumber(),
        rate: rate.toNumber(),
        stakingTaoFee: bnStakingTaoFee.toString()
      };
    } else if (params.type === ExtrinsicType.STAKING_UNBOND) {
      const newAlphaIn = alphaIn.plus(value);
      const newTaoReserve = k.dividedBy(newAlphaIn);
      const taoReturned = taoIn.minus(newTaoReserve);
      const taoIdeal = value.multipliedBy(taoIn).dividedBy(alphaIn);
      const slippage = taoIdeal.minus(taoReturned).dividedBy(taoIdeal);

      const taoAmount = value.multipliedBy(rate);
      const bnStakingTaoFee = taoAmount.multipliedBy(feeRate);

      return {
        slippage: slippage.plus(0.0001).toNumber(),
        rate: rate.toNumber(),
        stakingTaoFee: bnStakingTaoFee.toString()
      };
    }

    return {
      slippage: 0,
      rate: 1
    };
  }

  private async init (forceRefresh = false): Promise<void> {
    try {
      if ((this.isInit && !forceRefresh) || !this.substrateApi) {
        return;
      }

      const substrateApi = await this.substrateApi.isReady;
      const dynamicInfo = (await substrateApi.api.call.subnetInfoRuntimeApi.getAllDynamicInfo()).toJSON() as DynamicInfo[] | undefined;
      const subnetsInfo = (await substrateApi.api.call.subnetInfoRuntimeApi.getSubnetsInfoV2()).toJSON() as SubnetsInfo[] | undefined;

      if (dynamicInfo && subnetsInfo) {
        const mergedData = dynamicInfo
          .filter((dynInfo) => dynInfo.netuid !== 0)
          .map((dynInfo) => {
            const extraInfo = subnetsInfo.find((subnet) => subnet.netuid === dynInfo.netuid);

            const nameRaw = dynInfo.subnetIdentity?.subnetName || String.fromCharCode(...dynInfo.subnetName);
            const identityName = dynInfo.subnetIdentity?.subnetName
              ? Buffer.from(dynInfo.subnetIdentity.subnetName.slice(2), 'hex').toString('utf-8')
              : '';
            const formattedIdentityName = identityName
              ? identityName.charAt(0).toUpperCase() + identityName.slice(1).toLowerCase()
              : '';
            const name = formattedIdentityName || nameRaw.charAt(0).toUpperCase() + nameRaw.slice(1);
            const symbol = new TextDecoder('utf-8').decode(Uint8Array.from(dynInfo.tokenSymbol));

            return {
              netuid: dynInfo.netuid,
              name,
              symbol,
              ownerHotkey: dynInfo.ownerHotkey,
              maxAllowedValidators: extraInfo ? extraInfo.maxAllowedValidators : 0,
              taoIn: dynInfo.taoIn,
              taoInEmission: dynInfo.taoInEmission
            };
          });

        this.subnetData = mergedData;
        this.isInit = true;
      }
    } catch (err) {
      console.error(err);
      this.isInit = false;
    }
  }

  protected override getDescription (): string {
    return 'Stake TAO to earn yield on dTAO';
  }

  /* Subscribe pool info */

  override async subscribePoolInfo (callback: (data: YieldPoolInfo) => void): Promise<VoidFunction> {
    await this.substrateApi.isReady;
    let cancel = false;

    const updateStakingInfo = async () => {
      await this.init(true);

      if (cancel) {
        return;
      }

      try {
        for (const subnet of this.subnetData) {
          const netuid = subnet.netuid.toString().padStart(2, '0');
          const subnetSlug = `${this.slug}__subnet_${netuid}`;
          const subnetName = `${subnet.name || 'Unknown'} ${netuid}`;
          const bnTaoIn = new BigN(subnet.taoIn);
          const emission = new BigN(subnet.taoInEmission).dividedBy(new BigN(10).pow(7));

          const data: NativeYieldPoolInfo = {
            ...this.baseInfo,
            type: this.type,
            slug: subnetSlug,
            metadata: {
              ...this.metadataInfo,
              name: subnetName,
              shortName: subnetName,
              description: this.getDescription(),
              subnetData: {
                netuid: subnet.netuid,
                subnetSymbol: subnet.symbol || 'dTAO'
              },
              minValidate: DEFAULT_DTAO_MINBOND
            },
            statistic: {
              assetEarning: [{ slug: this.nativeToken.slug }],
              maxCandidatePerFarmer: subnet.maxAllowedValidators,
              maxWithdrawalRequestPerFarmer: 1,
              earningThreshold: {
                join: DEFAULT_DTAO_MINBOND,
                defaultUnstake: '0',
                fastUnstake: '0'
              },
              eraTime: 24,
              era: 0,
              unstakingPeriod: 1.2,
              tvl: bnTaoIn.toString(),
              totalApy: emission.toNumber()
            }
          };

          callback(data);
        }
      } catch (error) {
        console.error('Error updating staking info:', error);
      }
    };

    const subscribeStakingMetadataInterval = () => {
      updateStakingInfo().catch(console.error);
    };

    subscribeStakingMetadataInterval();
    const interval = setInterval(subscribeStakingMetadataInterval, BITTENSOR_REFRESH_STAKE_APY);

    return () => {
      cancel = true;
      clearInterval(interval);
    };
  }

  /* Subscribe pool position */

  override async parseNominatorMetadata (chainInfo: _ChainInfo, delegatorState: TaoStakingStakeOption[], netuid?: number): Promise<Omit<YieldPositionInfo, keyof BaseYieldPositionInfo>> {
    const bnMinBond = await this.getMinBond(netuid);

    return this.parseNominatorMetadataBase(chainInfo, delegatorState, bnMinBond.toString(), true);
  }

  override async subscribePoolPosition (useAddresses: string[], rsCallback: (rs: YieldPositionInfo) => void): Promise<VoidFunction> {
    await this.init();
    let cancel = false;
    const substrateApi = await this.substrateApi.isReady;

    const defaultInfo = this.baseInfo;
    const chainInfo = this.chainInfo;
    const _delegateInfo = await this.bittensorCache.get();

    const getPoolPosition = async () => {
      const rawDelegateStateInfos = await substrateApi.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkeys(useAddresses);
      const delegateStateInfos = rawDelegateStateInfos.toPrimitive() as Array<[string, TaoStakeInfo[]]>;

      const alphaToTaoRateMap = await getAlphaToTaoRateMap(this.substrateApi);

      if (!delegateStateInfos || delegateStateInfos.length === 0) {
        return;
      }

      delegateStateInfos.forEach(([coldkey, stakeInfos]) => {
        const owner = reformatAddress(coldkey, 42);

        const subnetPositions: Record<number, SubnetPosition> = {};

        for (const delegate of stakeInfos) {
          const hotkey = delegate.hotkey;
          const netuid = delegate.netuid;

          if (netuid === 0) {
            continue;
          }

          const stake = new BigN(delegate.stake);
          const alphaToTaoPrice = new BigN(alphaToTaoRateMap[netuid]);

          if (!subnetPositions[netuid]) {
            subnetPositions[netuid] = {
              delegatorState: [],
              totalBalance: BigN(0),
              originalTotalStake: BigN(0)
            };
          }

          let identity = '';

          if (_delegateInfo) {
            const delegateInfo = _delegateInfo.data.find((info) => info.hotkey.ss58 === hotkey);

            identity = delegateInfo ? delegateInfo.name : '';
          }

          subnetPositions[netuid].delegatorState.push({
            owner: hotkey,
            amount: stake.toString(),
            rate: alphaToTaoPrice,
            identity
          });

          subnetPositions[netuid].totalBalance = subnetPositions[netuid].totalBalance.plus(new BigN(stake.toString()));
          subnetPositions[netuid].originalTotalStake = subnetPositions[netuid].originalTotalStake.plus(new BigN(stake.toString()));
        }

        Object.values(this.subnetData).forEach((subnet) => {
          const netuid = subnet.netuid;
          const subnetSlug = `${this.slug}__subnet_${netuid.toString().padStart(2, '0')}`;
          const subnetName = `${subnet.name || 'Unknown'} ${netuid}`;
          const subnetSymbol = subnet.symbol || 'dTAO';

          const { delegatorState = [], originalTotalStake = BN_ZERO } = subnetPositions[netuid] || {};

          if (delegatorState.length > 0) {
            this.parseNominatorMetadata(chainInfo, delegatorState, netuid)
              .then((nominatorMetadata) => {
                rsCallback({
                  ...defaultInfo,
                  ...nominatorMetadata,
                  address: owner,
                  type: this.type,
                  slug: subnetSlug,
                  subnetData: {
                    subnetSymbol,
                    subnetShortName: subnetName,
                    originalTotalStake: originalTotalStake.toString()
                  }
                });
              })
              .catch(console.error);
          } else {
            rsCallback({
              ...defaultInfo,
              type: this.type,
              address: owner,
              balanceToken: this.nativeToken.slug,
              totalStake: '0',
              activeStake: '0',
              unstakeBalance: '0',
              status: EarningStatus.NOT_STAKING,
              isBondedBefore: false,
              nominations: [],
              unstakings: [],
              slug: subnetSlug,
              subnetData: {
                subnetSymbol,
                subnetShortName: subnetName,
                originalTotalStake: '0'
              }
            });
          }
        });
      });
    };

    const getStakingPositionInterval = async () => {
      if (cancel) {
        return;
      }

      await getPoolPosition();
    };

    getStakingPositionInterval().catch(console.error);

    const intervalId = setInterval(() => {
      getStakingPositionInterval().catch(console.error);
    }, BITTENSOR_REFRESH_STAKE_INFO);

    return () => {
      cancel = true;
      clearInterval(intervalId);
    };
  }

  /* Subscribe pool position */

  /* Unimplemented function  */

  public override handleChangeRootClaimType (): Promise<TransactionData> {
    return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
  }

  /* Unimplemented function  */
}
