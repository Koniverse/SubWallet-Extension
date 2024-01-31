// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { ChainStakingMetadata, NominationInfo, NominatorMetadata, StakingStatus, StakingType, ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import { getStakingStatusByNominations, ParachainStakingStakeOption } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import fetch from 'cross-fetch';

import { Codec } from '@polkadot/types/types';
import { BN, BN_ZERO } from '@polkadot/util';

// interface DelegateInfo {
//   address: {
//     name: string,
//     url: string,
//     description: string,
//       signature: string
//     }
//   }

const fetchDelegates = async () => {
  return new Promise(function (resolve) {
    fetch('https://raw.githubusercontent.com/opentensor/bittensor-delegates/main/public/delegates.json', { // Todo: check if this is exactly active validator list info or not
      method: 'GET'
    }).then((resp) => {
      resolve(resp.json());
    }).catch(console.error);
  });
};

const fetchStakingInfo = async (): Promise<Array<Record<string, string>>> => {
  return new Promise(function (resolve) {
    fetch('https://taostats.io/data.json', {
      method: 'GET'
    }).then((resp) => {
      resolve(resp.json());
    }).catch(console.error);
  });
};

export async function subscribeTaoStakingMetadata (chain: string, substrateApi: _SubstrateApi, callback: (chain: string, rs: ChainStakingMetadata) => void) {
  // _TODO: optimize case subscribe an API in a subscription -> Rxjs or fetch interval
  return substrateApi.api.query.subtensorModule.networkImmunityPeriod(async (_iPeriod: Codec) => {
    const iPeriod = parseInt(_iPeriod.toString());

    const _expectedReturn = (await fetchStakingInfo())[0];
    const expectedReturn = _expectedReturn.staking_apy as unknown as number;

    // Note for reviewer: This staking different on Staking metadata structure, should we create another interface like TaoStakingMetadata (do not have era, unlocking infor, etc.)?
    callback(chain, {
      chain,
      type: StakingType.NOMINATED,
      era: iPeriod,
      minStake: '0',
      maxValidatorPerNominator: Infinity,
      maxWithdrawalRequestPerValidator: 1,
      allowCancelUnstaking: false,
      expectedReturn,
      unstakingPeriod: 0
    });
  });
}

export function subscribeTaoDelegatorMetadata (chainInfo: _ChainInfo, address: string, substrateApi: _SubstrateApi, delegatorState: ParachainStakingStakeOption[]) {
  // _TODO: do not have unstaking list
  // _TODO: check identities

  const nominationList: NominationInfo[] = [];
  let allActiveStake = BN_ZERO;

  for (let i = 0; i < delegatorState.length; i++) {
    const delegate = delegatorState[i];

    const activeStake = delegate.amount.toString();
    const bnActiveStake = new BN(activeStake);
    let delegationStatus = StakingStatus.NOT_EARNING;

    if (bnActiveStake.gt(BN_ZERO)) {
      delegationStatus = StakingStatus.EARNING_REWARD;
      allActiveStake = allActiveStake.add(bnActiveStake);
    }

    nominationList.push({
      status: delegationStatus,
      chain: chainInfo.slug,
      validatorAddress: delegate.owner,
      activeStake: activeStake,
      validatorMinStake: '0'
    });
  }

  const stakingStatus = getStakingStatusByNominations(allActiveStake, nominationList);

  return {
    chain: chainInfo.slug,
    type: StakingType.NOMINATED,
    status: stakingStatus,
    address: address,
    activeStake: allActiveStake.toString(),
    nominations: nominationList,
    unstakings: []
  } as NominatorMetadata;
}

export async function getTaoDelegateInfo (chain: string, substrateApi: _SubstrateApi): Promise<ValidatorInfo[]> {
  // const chainApi = await substrateApi.isReady;

  const allDelegatesInfo: ValidatorInfo[] = [];
  const allDelegatesPromise = fetchDelegates();

  const _allDelegates = await allDelegatesPromise;

  const allDelegates = _allDelegates as Record<string, Record<string, string>>;
  const allDelegateAddresses: string[] = Object.keys(allDelegates);

  for (const address of allDelegateAddresses) {
    const name = allDelegates[address].name;
    // const url = allDelegates[address].url;
    // const description = allDelegates[address].description;
    // const signature = allDelegates[address].signature;

    allDelegatesInfo.push({
      address: address,
      chain: chain,

      totalStake: '0',
      ownStake: '0',
      otherStake: '0',

      minBond: '0',
      nominatorCount: 0,
      commission: 0,

      blocked: false,
      isVerified: false,

      identity: name,
      isCrowded: false
    });
  }

  return allDelegatesInfo;
}

export async function getTaoBondingExtrinsic (substrateApi: _SubstrateApi, amount: string, selectedValidatorInfo: ValidatorInfo) {
  const chainApi = await substrateApi.isReady;
  const bnAmount = new BN(amount);
  const hotkey = selectedValidatorInfo.address;

  return chainApi.api.tx.subtensorModule.addStake(hotkey, bnAmount);
}

export async function getTaoUnbondingExtrinsic (substrateApi: _SubstrateApi, amount: string, hotkey: string) {
  const chainApi = await substrateApi.isReady;
  const bnAmount = new BN(amount);

  return chainApi.api.tx.subtensorModule.removeStake(hotkey, bnAmount);
}
