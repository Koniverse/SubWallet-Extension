// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { NominationInfo, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { _KNOWN_CHAIN_INFLATION_PARAMS, _SUBSTRATE_DEFAULT_INFLATION_PARAMS, _SubstrateInflationParams } from '@subwallet/extension-base/services/chain-service/constants';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getChainNativeTokenBasicInfo } from '@subwallet/extension-base/services/chain-service/utils';
import { _STAKING_CHAIN_GROUP, RELAY_HANDLER_DIRECT_STAKING_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import { EarningStatus, LendingYieldPoolInfo, LiquidYieldPoolInfo, NativeYieldPoolInfo, NominationYieldPoolInfo, PalletIdentityRegistration, PalletIdentitySuper, UnstakingStatus, YieldAction, YieldAssetExpectedEarning, YieldCompoundingPeriod, YieldPoolInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { balanceFormatter, detectTranslate, formatNumber, reformatAddress } from '@subwallet/extension-base/utils';
import BigNumber from 'bignumber.js';
import { t } from 'i18next';

import { Codec } from '@polkadot/types/types';
import { BN, BN_BILLION, BN_HUNDRED, BN_MILLION, BN_THOUSAND, hexToString, isHex } from '@polkadot/util';

export function calculateReward (apr: number, amount = 0, compoundingPeriod = YieldCompoundingPeriod.YEARLY, isApy = false): YieldAssetExpectedEarning {
  if (!apr) {
    return {};
  }

  if (!isApy) {
    const periodApr = apr / 365 * compoundingPeriod; // APR is always annually
    const earningRatio = (periodApr / 100) / compoundingPeriod;

    const periodApy = (1 + earningRatio) ** compoundingPeriod - 1;

    const reward = periodApy * amount;

    return {
      apy: periodApy * 100,
      rewardInToken: reward
    };
  } else {
    const reward = (apr / 100) * amount;

    return {
      apy: apr,
      rewardInToken: reward * (compoundingPeriod / YieldCompoundingPeriod.YEARLY)
    };
  }
}

/**
 * @returns
 * <p>
 * [0] - identity
 * </p>
 * <p>
 * [1] - isReasonable (isVerified)
 * </p>
 *  */
export async function parseIdentity (substrateApi: _SubstrateApi, address: string, children?: string): Promise<[string | undefined, boolean]> {
  const compactResult = (rs?: string) => {
    const result: string[] = [];

    if (rs) {
      result.push(rs);
    }

    if (children) {
      result.push(children);
    }

    if (result.length > 0) {
      return result.join('/');
    } else {
      return undefined;
    }
  };

  if (substrateApi.api.query.identity) {
    let identity;
    const _parent = await substrateApi.api.query.identity.superOf(address);

    const parentInfo = _parent?.toHuman() as unknown as PalletIdentitySuper;

    if (parentInfo) {
      const [parentAddress, { Raw: data }] = parentInfo;
      const child = isHex(data) ? hexToString(data) : data;

      // TODO: Re-check
      if (address !== parentAddress) {
        const [rs, isReasonable] = await parseIdentity(substrateApi, parentAddress, child);

        return [compactResult(rs), isReasonable];
      }
    }

    let identityInfo;

    const _identity = await substrateApi.api.query.identity.identityOf(address);
    const identityOfMetadata = substrateApi.api.query.identity.identityOf.creator.meta;
    const identityOfReturnType = substrateApi.api.registry.lookup.getName(identityOfMetadata.type.asMap.value);

    if (identityOfReturnType === 'PalletIdentityRegistration') {
      identityInfo = _identity.toHuman() as unknown as PalletIdentityRegistration;
    } else {
      const _identityInfo = _identity?.toHuman() as unknown as [PalletIdentityRegistration, any];

      identityInfo = _identityInfo ? _identityInfo[0] : undefined;
    }

    if (identityInfo) {
      const displayName = identityInfo.info?.display?.Raw;
      const web = identityInfo.info?.web?.Raw;
      const riot = identityInfo.info?.riot?.Raw;
      const twitter = identityInfo.info?.twitter?.Raw;
      const isReasonable = identityInfo.judgements?.length > 0;

      if (displayName) {
        identity = isHex(displayName) ? hexToString(displayName) : displayName;
      } else {
        identity = twitter || web || riot;
      }

      return [compactResult(identity), isReasonable];
    }
  }

  return [undefined, false];
}

export function isActionFromValidator (stakingType: YieldPoolType, chain: string) {
  if (stakingType === YieldPoolType.NOMINATION_POOL || stakingType === YieldPoolType.LIQUID_STAKING || stakingType === YieldPoolType.LENDING) {
    return false;
  }

  if (_STAKING_CHAIN_GROUP.astar.includes(chain)) {
    return true;
  } else if (_STAKING_CHAIN_GROUP.amplitude.includes(chain)) {
    return true;
  } else if (_STAKING_CHAIN_GROUP.para.includes(chain)) {
    return true;
  } else if (_STAKING_CHAIN_GROUP.bittensor.includes(chain)) {
    return true;
  } else if (_STAKING_CHAIN_GROUP.mythos.includes(chain)) {
    return true;
  } else if (_STAKING_CHAIN_GROUP.energy.includes(chain)) {
    return true;
  } else if (_STAKING_CHAIN_GROUP.tanssi.includes(chain)) {
    return true;
  }

  return false;
}

export const isNominationPool = (pool: YieldPoolInfo): pool is NominationYieldPoolInfo => {
  return pool.type === YieldPoolType.NOMINATION_POOL;
};

export const isNativeStakingPool = (pool: YieldPoolInfo): pool is NativeYieldPoolInfo => {
  return pool.type === YieldPoolType.NATIVE_STAKING;
};

export const isLiquidPool = (pool: YieldPoolInfo): pool is LiquidYieldPoolInfo => {
  return pool.type === YieldPoolType.LIQUID_STAKING;
};

export const isLendingPool = (pool: YieldPoolInfo): pool is LendingYieldPoolInfo => {
  return pool.type === YieldPoolType.LENDING;
};

export function applyDecimal (bnNumber: BN, decimals: number) {
  const bnDecimals = new BN((10 ** decimals).toString());

  return bnNumber.div(bnDecimals);
}

function getInflationParams (networkKey: string): _SubstrateInflationParams {
  return _KNOWN_CHAIN_INFLATION_PARAMS[networkKey] || _SUBSTRATE_DEFAULT_INFLATION_PARAMS;
}

function calcInflationUniformEraPayout (totalIssuance: BN, yearlyInflationInTokens: number): number {
  const totalIssuanceInTokens = totalIssuance.div(BN_BILLION).div(BN_THOUSAND).toNumber();

  return (totalIssuanceInTokens === 0 ? 0.0 : yearlyInflationInTokens / totalIssuanceInTokens);
}

function calcInflationRewardCurve (minInflation: number, stakedFraction: number, idealStake: number, idealInterest: number, falloff: number) {
  return (minInflation + (
    stakedFraction <= idealStake
      ? (stakedFraction * (idealInterest - (minInflation / idealStake)))
      : (((idealInterest * idealStake) - minInflation) * Math.pow(2, (idealStake - stakedFraction) / falloff))
  ));
}

export function calculateInflation (totalEraStake: BN, totalIssuance: BN, numAuctions: number, networkKey: string) {
  const inflationParams = getInflationParams(networkKey);
  const { auctionAdjust, auctionMax, falloff, maxInflation, minInflation, stakeTarget } = inflationParams;
  const idealStake = stakeTarget - (Math.min(auctionMax, numAuctions) * auctionAdjust);
  const idealInterest = maxInflation / idealStake;
  const stakedFraction = totalEraStake.mul(BN_MILLION).div(totalIssuance).toNumber() / BN_MILLION.toNumber();

  if (_STAKING_CHAIN_GROUP.aleph.includes(networkKey)) {
    if (inflationParams.yearlyInflationInTokens) {
      return 100 * calcInflationUniformEraPayout(totalIssuance, inflationParams.yearlyInflationInTokens);
    } else {
      return 100 * calcInflationRewardCurve(minInflation, stakedFraction, idealStake, idealInterest, falloff);
    }
  } else {
    return 100 * (minInflation + (
      stakedFraction <= idealStake
        ? (stakedFraction * (idealInterest - (minInflation / idealStake)))
        : (((idealInterest * idealStake) - minInflation) * Math.pow(2, (idealStake - stakedFraction) / falloff))
    ));
  }
}

export async function calculateChainStakedReturnV2 (chainInfo: _ChainInfo, totalIssuance: string, erasPerDay: number, lastTotalStaked: string, validatorEraReward: BigNumber, inflation: BigNumber, isCompound?: boolean) {
  if (chainInfo.slug === 'analog_timechain') {
    return await calculateAnalogChainStakedReturn();
  }

  const DAYS_PER_YEAR = 365;
  const { decimals } = _getChainNativeTokenBasicInfo(chainInfo);

  const lastTotalStakedUnit = (new BigNumber(lastTotalStaked)).dividedBy(new BigNumber(10 ** decimals));
  const totalIssuanceUnit = (new BigNumber(totalIssuance)).dividedBy(new BigNumber(10 ** decimals));
  const supplyStaked = lastTotalStakedUnit.dividedBy(totalIssuanceUnit);

  const dayRewardRate = validatorEraReward.multipliedBy(erasPerDay).dividedBy(totalIssuance).multipliedBy(100);

  let inflationToStakers: BigNumber;

  if (!isCompound) {
    inflationToStakers = dayRewardRate.multipliedBy(DAYS_PER_YEAR);
  } else {
    const multiplier = dayRewardRate.dividedBy(100).plus(1).exponentiatedBy(365);

    inflationToStakers = new BigNumber(100).multipliedBy(multiplier).minus(100);
  }

  const averageRewardRate = (['avail_mainnet', 'dentnet'].includes(chainInfo.slug) ? inflation : inflationToStakers).dividedBy(supplyStaked);

  return averageRewardRate.toNumber();
}

export function calculateAlephZeroValidatorReturn (chainStakedReturn: number, commission: number) {
  return chainStakedReturn * (100 - commission) / 100;
}

export function calculateEnergyWebCollatorReturn (annualReward: string, collatorCommission: number, numberCollators: number, totalStake: string): number {
  const rewardForNominators = new BigNumber(annualReward).multipliedBy(1 - collatorCommission);
  const rewardPerNominator = rewardForNominators.div(numberCollators);

  return rewardPerNominator.div(totalStake).shiftedBy(2).toNumber();
}

export function calculateTernoaValidatorReturn (rewardPerValidator: number, validatorStake: number, commission: number) {
  const percentRewardForNominators = (100 - commission) / 100;
  const rewardForNominators = rewardPerValidator * percentRewardForNominators;

  const stakeRatio = rewardForNominators / validatorStake;

  return stakeRatio * 365 * 100;
}

export async function calculateAnalogChainStakedReturn (): Promise<number | undefined> {
  const url = 'https://explorer-api.analog.one/api/nominations?projection=apy,rewardsClaimed,eraEndsTime';

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const apyInfo = await response.json() as {
      data: {
        apy: number;
      }
    };

    return apyInfo?.data?.apy as number | undefined;
  } catch (e) {
    console.error('Fetch error:', e);

    return undefined;
  }
}

export function calculateValidatorStakedReturn (chainStakedReturn: number, totalValidatorStake: BN, avgStake: BN, commission: number) {
  const bnAdjusted = avgStake.mul(BN_HUNDRED).div(totalValidatorStake);
  const adjusted = bnAdjusted.toNumber() * chainStakedReturn;
  // todo: should calculated in bignumber instead number?
  const stakedReturn = (adjusted > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : adjusted) / 100;

  return stakedReturn * (100 - commission) / 100; // Deduct commission
}

export function getCommission (commissionString: string) {
  return parseFloat(commissionString.split('%')[0]); // Example: 12%
}

export function getBondedValidators (nominations: NominationInfo[]) {
  const bondedValidators: string[] = [];
  let nominationCount = 0;

  for (const nomination of nominations) {
    nominationCount += 1;
    bondedValidators.push(reformatAddress(nomination.validatorAddress, 0));
  }

  return {
    nominationCount,
    bondedValidators
  };
}

export function isUnstakeAll (selectedValidator: string, nominations: NominationInfo[], unstakeAmount: string) {
  let isUnstakeAll = false;

  for (const nomination of nominations) {
    const parsedValidatorAddress = reformatAddress(nomination.validatorAddress, 0);
    const parsedSelectedValidator = reformatAddress(selectedValidator, 0);

    if (parsedValidatorAddress === parsedSelectedValidator) {
      if (unstakeAmount === nomination.activeStake) {
        isUnstakeAll = true;
      }

      break;
    }
  }

  return isUnstakeAll;
}

export function getEarningStatusByNominations (bnTotalActiveStake: BN, nominationList: NominationInfo[]): EarningStatus {
  let stakingStatus: EarningStatus = EarningStatus.EARNING_REWARD;

  if (bnTotalActiveStake.isZero()) {
    stakingStatus = EarningStatus.NOT_EARNING;
  } else {
    let invalidDelegationCount = 0;

    for (const nomination of nominationList) {
      if (nomination.status === EarningStatus.NOT_EARNING) {
        invalidDelegationCount += 1;
      }
    }

    if (invalidDelegationCount > 0 && invalidDelegationCount < nominationList.length) {
      stakingStatus = EarningStatus.PARTIALLY_EARNING;
    } else if (invalidDelegationCount === nominationList.length) {
      stakingStatus = EarningStatus.NOT_EARNING;
    }
  }

  return stakingStatus;
}

export function getAvgValidatorEraReward (supportedDays: number, eraRewardHistory: Codec[]) {
  let sumEraReward = new BigNumber(0);
  let failEra = 0;

  for (const _item of eraRewardHistory) {
    const item = _item.toString();

    if (!item) {
      failEra += 1;
    } else {
      const eraReward = new BigNumber(item);

      sumEraReward = sumEraReward.plus(eraReward);
    }
  }

  return sumEraReward.dividedBy(new BigNumber(supportedDays - failEra));
}

export function getSupportedDaysByHistoryDepth (erasPerDay: number, maxSupportedEras: number, liveDay?: number) {
  const maxSupportDay = Math.floor(maxSupportedEras / erasPerDay);

  if (liveDay && liveDay <= 30) {
    return Math.min(Math.floor(liveDay - 1), maxSupportDay);
  }

  if (maxSupportDay > 30) {
    return 30;
  } else {
    return maxSupportDay;
  }
}

export const getMinStakeErrorMessage = (chainInfo: _ChainInfo, bnMinStake: BN): string => {
  const tokenInfo = _getChainNativeTokenBasicInfo(chainInfo);
  const number = formatNumber(bnMinStake.toString(), tokenInfo.decimals || 0, balanceFormatter);

  return t('bg.EARNING.koni.api.staking.bonding.utils.insufficientStakeToEarn', {
    replace: {
      tokenSymbol: tokenInfo.symbol,
      number
    }
  });
};

export function getYieldAvailableActionsByType (yieldPoolInfo: YieldPoolInfo): YieldAction[] {
  if ([YieldPoolType.NATIVE_STAKING, YieldPoolType.NOMINATION_POOL].includes(yieldPoolInfo.type)) {
    if (yieldPoolInfo.type === YieldPoolType.NOMINATION_POOL) {
      return [YieldAction.STAKE, YieldAction.CLAIM_REWARD, YieldAction.UNSTAKE, YieldAction.WITHDRAW];
    }

    const chain = yieldPoolInfo.chain;

    if (_STAKING_CHAIN_GROUP.para.includes(chain)) {
      return [YieldAction.STAKE, YieldAction.UNSTAKE, YieldAction.WITHDRAW, YieldAction.CANCEL_UNSTAKE];
    } else if (_STAKING_CHAIN_GROUP.energy.includes(chain)) {
      return [YieldAction.STAKE, YieldAction.UNSTAKE, YieldAction.WITHDRAW, YieldAction.CANCEL_UNSTAKE];
    } else if (_STAKING_CHAIN_GROUP.astar.includes(chain)) {
      return [YieldAction.STAKE, YieldAction.CLAIM_REWARD, YieldAction.UNSTAKE, YieldAction.WITHDRAW];
    } else if (_STAKING_CHAIN_GROUP.amplitude.includes(chain)) {
      return [YieldAction.STAKE, YieldAction.UNSTAKE, YieldAction.WITHDRAW];
    }
  }

  if (yieldPoolInfo.type === YieldPoolType.LENDING) {
    return [YieldAction.START_EARNING, YieldAction.WITHDRAW_EARNING];
  } else if (yieldPoolInfo.type === YieldPoolType.LIQUID_STAKING) {
    return [YieldAction.START_EARNING, YieldAction.UNSTAKE, YieldAction.WITHDRAW];
  }

  return [YieldAction.STAKE, YieldAction.UNSTAKE, YieldAction.WITHDRAW, YieldAction.CANCEL_UNSTAKE];
}

export function getYieldAvailableActionsByPosition (yieldPosition: YieldPositionInfo, yieldPoolInfo: YieldPoolInfo, unclaimedReward?: string): YieldAction[] {
  const result: YieldAction[] = [];

  if ([YieldPoolType.NATIVE_STAKING, YieldPoolType.NOMINATION_POOL].includes(yieldPoolInfo.type)) {
    result.push(YieldAction.STAKE);

    const bnActiveStake = new BigNumber(yieldPosition.activeStake);

    if (yieldPosition.activeStake && bnActiveStake.gt('0')) {
      result.push(YieldAction.UNSTAKE);

      const isAstarNetwork = _STAKING_CHAIN_GROUP.astar.includes(yieldPosition.chain);
      const isAmplitudeNetwork = _STAKING_CHAIN_GROUP.amplitude.includes(yieldPosition.chain);
      const bnUnclaimedReward = new BigNumber(unclaimedReward || '0');

      if (
        ((yieldPosition.type === YieldPoolType.NOMINATION_POOL || isAmplitudeNetwork) && bnUnclaimedReward.gt('0')) ||
        isAstarNetwork
      ) {
        result.push(YieldAction.CLAIM_REWARD);
      }
    }

    if (yieldPosition.unstakings.length > 0) {
      result.push(YieldAction.CANCEL_UNSTAKE);
      const hasClaimable = yieldPosition.unstakings.some((unstaking) => unstaking.status === UnstakingStatus.CLAIMABLE);

      if (hasClaimable) {
        result.push(YieldAction.WITHDRAW);
      }
    }
  } else if (yieldPoolInfo.type === YieldPoolType.LIQUID_STAKING) {
    result.push(YieldAction.START_EARNING);

    const activeBalance = new BigNumber(yieldPosition.activeStake);

    if (activeBalance.gt('0')) {
      result.push(YieldAction.UNSTAKE);
    }

    const hasWithdrawal = yieldPosition.unstakings.some((unstakingInfo) => unstakingInfo.status === UnstakingStatus.CLAIMABLE);

    if (hasWithdrawal) {
      result.push(YieldAction.WITHDRAW);
    }

    // TODO: check has unstakings to withdraw
  } else {
    result.push(YieldAction.START_EARNING);
    result.push(YieldAction.WITHDRAW_EARNING); // TODO
  }

  return result;
}

export function getValidatorLabel (chain: string) {
  if (_STAKING_CHAIN_GROUP.astar.includes(chain)) {
    return 'dApp';
  } else if (RELAY_HANDLER_DIRECT_STAKING_CHAINS.includes(chain) || _STAKING_CHAIN_GROUP.bittensor.includes(chain)) {
    return 'Validator';
  }

  return 'Collator';
}

export const getMaxValidatorErrorMessage = (chainInfo: _ChainInfo, max: number): string => {
  let message = detectTranslate('bg.EARNING.koni.api.staking.bonding.utils.maxValidatorsSelection');
  const label = getValidatorLabel(chainInfo.slug);

  if (max > 1) {
    switch (label) {
      case 'dApp':
        message = detectTranslate('bg.EARNING.koni.api.staking.bonding.utils.maxDappsSelection');
        break;
      case 'Collator':
        message = detectTranslate('bg.EARNING.koni.api.staking.bonding.utils.maxCollatorsSelection');
        break;
      case 'Validator':
        message = detectTranslate('bg.EARNING.koni.api.staking.bonding.utils.maxValidatorsSelection');
        break;
    }
  } else {
    switch (label) {
      case 'dApp':
        message = detectTranslate('bg.EARNING.koni.api.staking.bonding.utils.maxOneDappSelection');
        break;
      case 'Collator':
        message = detectTranslate('bg.EARNING.koni.api.staking.bonding.utils.maxOneCollatorSelection');
        break;
      case 'Validator':
        message = detectTranslate('bg.EARNING.koni.api.staking.bonding.utils.maxOneValidatorSelection');
        break;
    }
  }

  return t(message, { replace: { number: max } });
};

export const getExistUnstakeErrorMessage = (chain: string, type?: StakingType, isStakeMore?: boolean): string => {
  // todo: update all .staking.bonding translate key
  const label = getValidatorLabel(chain);

  if (!isStakeMore) {
    switch (label) {
      case 'dApp':
        return t('bg.EARNING.koni.api.staking.bonding.utils.unstakeFromDappOnce');
      case 'Collator':
        return t('bg.EARNING.koni.api.staking.bonding.utils.unstakeFromCollatorOnce');

      case 'Validator': {
        if (type === StakingType.POOLED) {
          return t('bg.EARNING.koni.api.staking.bonding.utils.unstakeFromPoolOnce');
        }

        return t('bg.EARNING.koni.api.staking.bonding.utils.unstakeFromValidatorOnce');
      }
    }
  } else {
    switch (label) {
      case 'dApp':
        return t('bg.EARNING.koni.api.staking.bonding.utils.cannotStakeMoreOnUnstakingDapp');
      case 'Collator':
        return t('bg.EARNING.koni.api.staking.bonding.utils.cannotStakeMoreOnUnstakingCollator');

      case 'Validator': {
        if (type === StakingType.POOLED) {
          return t('bg.EARNING.koni.api.staking.bonding.utils.cannotStakeMoreOnUnstakingPool');
        }

        return t('bg.EARNING.koni.api.staking.bonding.utils.cannotStakeMoreOnUnstakingValidator');
      }
    }
  }
};
