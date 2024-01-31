// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { APIItemState, NominatorMetadata, StakingItem, StakingRewardItem, StakingStatus, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { BITTENSOR_REFRESH_STAKE_INFO } from '@subwallet/extension-base/constants';
import { subscribeAmplitudeNominatorMetadata } from '@subwallet/extension-base/koni/api/staking/bonding/amplitude';
import { subscribeAstarNominatorMetadata } from '@subwallet/extension-base/koni/api/staking/bonding/astar';
import { subscribeParaChainNominatorMetadata } from '@subwallet/extension-base/koni/api/staking/bonding/paraChain';
import { subscribeTaoDelegatorMetadata } from '@subwallet/extension-base/koni/api/staking/bonding/tao';
import { KrestDelegateState, PalletDappsStakingAccountLedger, PalletParachainStakingDelegator, ParachainStakingStakeOption } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getChainNativeTokenBasicInfo } from '@subwallet/extension-base/services/chain-service/utils';
import { reformatAddress } from '@subwallet/extension-base/utils';
import fetch from 'cross-fetch';

import { Codec } from '@polkadot/types/types';
import { BN, BN_ZERO } from '@polkadot/util';
import { isEthereumAddress } from '@polkadot/util-crypto';

interface RawDelegateState {
  data: {
    delegateBalances: {
      nodes:
      Array<Record<string, string>>
    }
  }
}

const query = (address: string) => {
  return {
    query: 'query ($first: Int!, $after: Cursor, $filter: DelegateBalanceFilter, $order: [DelegateBalancesOrderBy!]!) {  delegateBalances(first: $first, after: $after, filter: $filter, orderBy: $order) { nodes { id account delegate amount updatedAt delegateFrom } pageInfo { endCursor hasNextPage hasPreviousPage } totalCount } }',
    variables: {
      first: 10,
      filter: {
        account: {
          equalTo: address
        },
        amount: {
          greaterThan: 1000000
        },
        updatedAt: {
          greaterThan: 0
        }
      },
      order: 'AMOUNT_DESC'
    }
  };
};

const fetchDelegateState = async (address: string): Promise<RawDelegateState> => {
  return new Promise(function (resolve) {
    fetch('https://api.subquery.network/sq/TaoStats/bittensor-indexer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query(address))
    }).then((resp) => {
      resolve(resp.json());
    }).catch(console.error);
  });
};

function getSingleStakingAmplitude (substrateApi: _SubstrateApi, address: string, chainInfoMap: Record<string, _ChainInfo>, chain: string, stakingCallback: (networkKey: string, rs: StakingItem) => void, nominatorStateCallback: (nominatorMetadata: NominatorMetadata) => void) {
  return substrateApi.api.queryMulti([
    [substrateApi.api.query.parachainStaking.delegatorState, address],
    [substrateApi.api.query.parachainStaking.unstaking, address]
  ], async ([_delegatorState, _unstaking]) => {
    let delegatorState: ParachainStakingStakeOption[] = [];

    if (_STAKING_CHAIN_GROUP.krest_network.includes(chain)) {
      const krestDelegatorState = _delegatorState.toPrimitive() as unknown as KrestDelegateState;

      const delegates = krestDelegatorState?.delegations as unknown as ParachainStakingStakeOption[];

      if (delegates) {
        delegatorState = delegatorState.concat(delegates);
      }
    } else {
      const delegate = _delegatorState.toPrimitive() as unknown as ParachainStakingStakeOption;

      if (delegate) {
        delegatorState.push(delegate);
      }
    }

    const unstakingInfo = _unstaking.toPrimitive() as Record<string, number>;
    const { symbol } = _getChainNativeTokenBasicInfo(chainInfoMap[chain]);
    const owner = reformatAddress(address, 42);

    if (!delegatorState && !unstakingInfo) {
      stakingCallback(chain, {
        name: chainInfoMap[chain].name,
        chain: chain,
        balance: '0',
        activeBalance: '0',
        unlockingBalance: '0',
        nativeToken: symbol,
        unit: symbol,
        state: APIItemState.READY,
        type: StakingType.NOMINATED,
        address: owner
      } as StakingItem);

      nominatorStateCallback({
        chain,
        type: StakingType.NOMINATED,
        address: owner,
        status: StakingStatus.NOT_STAKING,
        activeStake: '0',
        nominations: [],
        unstakings: []
      } as NominatorMetadata);
    } else {
      let activeBalance = BN_ZERO;
      let unstakingBalance = BN_ZERO;

      for (const delegate of delegatorState) {
        const amount = new BN(delegate.amount?.toString());

        activeBalance = activeBalance.add(amount);
      }

      if (unstakingInfo) {
        Object.values(unstakingInfo).forEach((unstakingAmount) => {
          const bnUnstakingAmount = new BN(unstakingAmount.toString());

          unstakingBalance = unstakingBalance.add(bnUnstakingAmount);
        });
      }

      const totalBalance = activeBalance.add(unstakingBalance);

      const stakingItem = {
        name: chainInfoMap[chain].name,
        chain: chain,
        balance: totalBalance.toString(),
        activeBalance: activeBalance.toString(),
        unlockingBalance: unstakingBalance.toString(),
        nativeToken: symbol,
        unit: symbol,
        state: APIItemState.READY,
        type: StakingType.NOMINATED,
        address: owner
      } as StakingItem;

      stakingCallback(chain, stakingItem);

      const nominatorMetadata = await subscribeAmplitudeNominatorMetadata(chainInfoMap[chain], owner, substrateApi, delegatorState, unstakingInfo);

      nominatorStateCallback(nominatorMetadata);
    }
  });
}

function getMultiStakingAmplitude (substrateApi: _SubstrateApi, useAddresses: string[], chainInfoMap: Record<string, _ChainInfo>, chain: string, stakingCallback: (networkKey: string, rs: StakingItem) => void, nominatorStateCallback: (nominatorMetadata: NominatorMetadata) => void) {
  return substrateApi.api.query.parachainStaking.delegatorState.multi(useAddresses, async (ledgers: Codec[]) => {
    if (ledgers) {
      const { symbol } = _getChainNativeTokenBasicInfo(chainInfoMap[chain]);
      const _unstakingStates = await substrateApi.api.query.parachainStaking.unstaking.multi(useAddresses);

      await Promise.all(ledgers.map(async (_delegatorState, i) => {
        const owner = reformatAddress(useAddresses[i], 42);
        let delegatorState: ParachainStakingStakeOption[] = [];

        if (_STAKING_CHAIN_GROUP.krest_network.includes(chain)) {
          const krestDelegatorState = _delegatorState.toPrimitive() as unknown as KrestDelegateState;

          const delegates = krestDelegatorState?.delegations as unknown as ParachainStakingStakeOption[];

          if (delegates) {
            delegatorState = delegatorState.concat(delegates);
          }
        } else {
          const delegate = _delegatorState.toPrimitive() as unknown as ParachainStakingStakeOption;

          if (delegate) {
            delegatorState.push(delegate);
          }
        }

        const unstakingInfo = _unstakingStates[i].toPrimitive() as unknown as Record<string, number>;

        if (!delegatorState && !unstakingInfo) {
          stakingCallback(chain, {
            name: chainInfoMap[chain].name,
            chain: chain,
            balance: '0',
            activeBalance: '0',
            unlockingBalance: '0',
            nativeToken: symbol,
            unit: symbol,
            state: APIItemState.READY,
            type: StakingType.NOMINATED,
            address: owner
          } as StakingItem);

          nominatorStateCallback({
            chain,
            type: StakingType.NOMINATED,
            address: owner,
            status: StakingStatus.NOT_STAKING,
            activeStake: '0',
            nominations: [],
            unstakings: []
          } as NominatorMetadata);
        } else {
          let activeBalance = BN_ZERO;
          let unstakingBalance = BN_ZERO;

          for (const delegate of delegatorState) {
            const amount = new BN(delegate.amount?.toString());

            activeBalance = activeBalance.add(amount);
          }

          if (unstakingInfo) {
            Object.values(unstakingInfo).forEach((unstakingAmount) => {
              const bnUnstakingAmount = new BN(unstakingAmount.toString());

              unstakingBalance = unstakingBalance.add(bnUnstakingAmount);
            });
          }

          const totalBalance = activeBalance.add(unstakingBalance);

          const stakingItem = {
            name: chainInfoMap[chain].name,
            chain: chain,
            balance: totalBalance.toString(),
            activeBalance: activeBalance.toString(),
            unlockingBalance: unstakingBalance.toString(),
            nativeToken: symbol,
            unit: symbol,
            state: APIItemState.READY,
            type: StakingType.NOMINATED,
            address: owner
          } as StakingItem;

          stakingCallback(chain, stakingItem);

          const nominatorMetadata = await subscribeAmplitudeNominatorMetadata(chainInfoMap[chain], owner, substrateApi, delegatorState, unstakingInfo);

          nominatorStateCallback(nominatorMetadata);
        }
      }));
    }
  });
}

export function getAmplitudeStakingOnChain (parentApi: _SubstrateApi, useAddresses: string[], networks: Record<string, _ChainInfo>, chain: string, callback: (networkKey: string, rs: StakingItem) => void, nominatorStateCallback: (nominatorMetadata: NominatorMetadata) => void) {
  if (useAddresses.length === 1) {
    return getSingleStakingAmplitude(parentApi, useAddresses[0], networks, chain, callback, nominatorStateCallback);
  }

  return getMultiStakingAmplitude(parentApi, useAddresses, networks, chain, callback, nominatorStateCallback);
}

export async function getAmplitudeUnclaimedStakingReward (substrateApiMap: Record<string, _SubstrateApi>, addresses: string[], networks: Record<string, _ChainInfo>, chains: string[], callBack: (rs: StakingRewardItem) => void): Promise<StakingRewardItem[]> {
  if (chains.length === 0) {
    return [];
  }

  const useAddresses: string[] = [];

  addresses.forEach((address) => {
    if (!isEthereumAddress(address)) {
      useAddresses.push(address);
    }
  });

  const unclaimedRewardList: StakingRewardItem[] = [];

  await Promise.all(chains.map(async (chain) => {
    if (_STAKING_CHAIN_GROUP.amplitude.includes(chain) && !_STAKING_CHAIN_GROUP.kilt.includes(chain) && !_STAKING_CHAIN_GROUP.krest_network.includes(chain)) {
      const networkInfo = networks[chain];
      const apiProps = await substrateApiMap[chain].isReady;

      await Promise.all(useAddresses.map(async (address) => {
        const _unclaimedReward = await apiProps.api.query.parachainStaking.rewards(address);

        callBack({
          chain,
          name: networkInfo.name,
          state: APIItemState.READY,
          type: StakingType.NOMINATED,
          address: reformatAddress(address, 42),
          unclaimedReward: _unclaimedReward.toString()
        } as StakingRewardItem);
      }));
    }
  }));

  return unclaimedRewardList;
}

export function getParaStakingOnChain (substrateApi: _SubstrateApi, useAddresses: string[], chainInfoMap: Record<string, _ChainInfo>, chain: string, stakingCallback: (networkKey: string, rs: StakingItem) => void, nominatorStateCallback: (nominatorMetadata: NominatorMetadata) => void) {
  const { symbol } = _getChainNativeTokenBasicInfo(chainInfoMap[chain]);

  return substrateApi.api.query.parachainStaking.delegatorState.multi(useAddresses, async (ledgers: Codec[]) => {
    if (ledgers) {
      await Promise.all(ledgers.map(async (_delegatorState, i) => {
        const delegatorState = _delegatorState.toPrimitive() as unknown as PalletParachainStakingDelegator;
        const owner = reformatAddress(useAddresses[i], 42);

        if (delegatorState) {
          const _totalBalance = delegatorState.total;
          // let _unlockingBalance = delegatorState.lessTotal ? delegatorState.lessTotal : delegatorState.requests.lessTotal;
          const _unlockingBalance = delegatorState.lessTotal;

          const totalBalance = new BN(_totalBalance.toString());
          const unlockingBalance = new BN(_unlockingBalance.toString());
          const activeBalance = totalBalance.sub(unlockingBalance);

          stakingCallback(chain, {
            name: chainInfoMap[chain].name,
            chain: chain,
            balance: totalBalance.toString(),
            activeBalance: activeBalance.toString(),
            unlockingBalance: unlockingBalance.toString(),
            nativeToken: symbol,
            unit: symbol,
            state: APIItemState.READY,
            type: StakingType.NOMINATED,
            address: owner
          } as StakingItem);

          const nominatorMetadata = await subscribeParaChainNominatorMetadata(chainInfoMap[chain], owner, substrateApi, delegatorState);

          nominatorStateCallback(nominatorMetadata);
        } else {
          stakingCallback(chain, {
            name: chainInfoMap[chain].name,
            chain: chain,
            balance: '0',
            activeBalance: '0',
            unlockingBalance: '0',
            nativeToken: symbol,
            unit: symbol,
            state: APIItemState.READY,
            type: StakingType.NOMINATED,
            address: owner
          } as StakingItem);

          nominatorStateCallback({
            chain,
            type: StakingType.NOMINATED,
            address: owner,
            status: StakingStatus.NOT_STAKING,
            activeStake: '0',
            nominations: [],
            unstakings: []
          } as NominatorMetadata);
        }
      }));
    }
  });
}

export function getAstarStakingOnChain (substrateApi: _SubstrateApi, useAddresses: string[], chainInfoMap: Record<string, _ChainInfo>, chain: string, stakingCallback: (networkKey: string, rs: StakingItem) => void, nominatorStateCallback: (nominatorMetadata: NominatorMetadata) => void) {
  const { symbol } = _getChainNativeTokenBasicInfo(chainInfoMap[chain]);

  return substrateApi.api.query.dappsStaking.ledger.multi(useAddresses, async (ledgers: Codec[]) => {
    if (ledgers) {
      await Promise.all(ledgers.map(async (_ledger, i) => {
        let bnUnlockingBalance = BN_ZERO;
        const owner = reformatAddress(useAddresses[i], 42);

        const ledger = _ledger.toPrimitive() as unknown as PalletDappsStakingAccountLedger;

        if (ledger && ledger.locked > 0) {
          const unlockingChunks = ledger.unbondingInfo.unlockingChunks;
          const _totalStake = ledger.locked;
          const bnTotalStake = new BN(_totalStake.toString());

          for (const chunk of unlockingChunks) {
            const bnChunk = new BN(chunk.amount.toString());

            bnUnlockingBalance = bnUnlockingBalance.add(bnChunk);
          }

          const bnActiveStake = bnTotalStake.sub(bnUnlockingBalance);

          stakingCallback(chain, {
            name: chainInfoMap[chain].name,
            chain: chain,
            balance: bnTotalStake.toString(),
            activeBalance: bnActiveStake.toString(),
            unlockingBalance: bnUnlockingBalance.toString(),
            nativeToken: symbol,
            unit: symbol,
            state: APIItemState.READY,
            type: StakingType.NOMINATED,
            address: owner
          } as StakingItem);

          const nominatorMetadata = await subscribeAstarNominatorMetadata(chainInfoMap[chain], owner, substrateApi, ledger);

          nominatorStateCallback(nominatorMetadata);
        } else {
          stakingCallback(chain, {
            name: chainInfoMap[chain].name,
            chain,
            balance: '0',
            activeBalance: '0',
            unlockingBalance: '0',
            nativeToken: symbol,
            unit: symbol,
            state: APIItemState.READY,
            type: StakingType.NOMINATED,
            address: owner
          } as StakingItem);

          nominatorStateCallback({
            chain,
            type: StakingType.NOMINATED,
            address: owner,
            status: StakingStatus.NOT_STAKING,
            activeStake: '0',
            nominations: [],
            unstakings: []
          } as NominatorMetadata);
        }
      }));
    }
  });
}

function getSingleStakingTao (substrateApi: _SubstrateApi, useAddress: string, chainInfoMap: Record<string, _ChainInfo>, chain: string, stakingCallback: (networkKey: string, rs: StakingItem) => void, nominatorStateCallback: (nominatorMetadata: NominatorMetadata) => void) {
  const { symbol } = _getChainNativeTokenBasicInfo(chainInfoMap[chain]);
  const owner = reformatAddress(useAddress, 42);

  async function _getStakingTaoInterval () {
    const rawDelegateStateInfo = await fetchDelegateState(useAddress);

    if (!rawDelegateStateInfo) {
      stakingCallback(chain, {
        name: chainInfoMap[chain].name,
        chain: chain,
        balance: '0',
        activeBalance: '0',
        unlockingBalance: '0',
        nativeToken: symbol,
        unit: symbol,
        state: APIItemState.READY,
        type: StakingType.NOMINATED,
        address: owner
      } as StakingItem);

      nominatorStateCallback({
        chain: chain,
        type: StakingType.NOMINATED,
        address: owner,
        status: StakingStatus.NOT_STAKING,
        activeStake: '0',
        nominations: [],
        unstakings: []
      } as NominatorMetadata);
    } else {
      const delegatorState: ParachainStakingStakeOption[] = [];
      let bnTotalBalance = BN_ZERO;
      const delegateStateInfo = rawDelegateStateInfo?.data?.delegateBalances?.nodes;

      for (const delegate of delegateStateInfo) {
        bnTotalBalance = bnTotalBalance.add(new BN(delegate.amount));
        delegatorState.push({
          owner: delegate.delegate,
          amount: Number(delegate.amount)
        });
      }

      stakingCallback(chain, {
        name: chainInfoMap[chain].name,
        chain: chain,
        balance: bnTotalBalance.toString(),
        activeBalance: bnTotalBalance.toString(),
        unlockingBalance: '0',
        nativeToken: symbol,
        unit: symbol,
        state: APIItemState.READY,
        type: StakingType.NOMINATED,
        address: owner
      } as StakingItem);
      // console.log(owner, useAddress);
      const nominatorMetadata = subscribeTaoDelegatorMetadata(chainInfoMap[chain], owner, substrateApi, delegatorState);

      nominatorStateCallback(nominatorMetadata);
    }
  }

  function getStakingTaoInterval () {
    _getStakingTaoInterval().catch(console.error);
  }

  getStakingTaoInterval();
  const interval = setInterval(getStakingTaoInterval, BITTENSOR_REFRESH_STAKE_INFO);

  return () => {
    clearInterval(interval);
  };
}

// _TODO temporary disable
function getMultiStakingTao (substrateApi: _SubstrateApi, useAddresses: string[], chainInfoMap: Record<string, _ChainInfo>, chain: string, stakingCallback: (networkKey: string, rs: StakingItem) => void, nominatorStateCallback: (nominatorMetadata: NominatorMetadata) => void) {
  async function _getStakingTaoInterval () {
    const rawDelegateStateInfos = await Promise.all(useAddresses.map((address) => {
      return fetchDelegateState(address);
    }));

    if (rawDelegateStateInfos) {
      const { symbol } = _getChainNativeTokenBasicInfo(chainInfoMap[chain]);

      rawDelegateStateInfos.map((rawDelegateStateInfo, i) => {
        const owner = reformatAddress(useAddresses[i], 42);
        const delegatorState: ParachainStakingStakeOption[] = [];
        let bnTotalBalance = BN_ZERO;
        const delegateStateInfo = rawDelegateStateInfo?.data?.delegateBalances?.nodes;

        for (const delegate of delegateStateInfo) {
          bnTotalBalance = bnTotalBalance.add(new BN(delegate.amount));
          delegatorState.push({
            owner: delegate.delegate,
            amount: Number(delegate.amount)
          });
        }

        stakingCallback(chain, {
          name: chainInfoMap[chain].name,
          chain: chain,
          balance: bnTotalBalance.toString(),
          activeBalance: bnTotalBalance.toString(),
          unlockingBalance: '0',
          nativeToken: symbol,
          unit: symbol,
          state: APIItemState.READY,
          type: StakingType.NOMINATED,
          address: owner
        } as StakingItem);
        // console.log(owner, useAddress);
        const nominatorMetadata = subscribeTaoDelegatorMetadata(chainInfoMap[chain], owner, substrateApi, delegatorState);

        nominatorStateCallback(nominatorMetadata);
      });
    }
  }

  function getStakingTaoInterval () {
    _getStakingTaoInterval().catch(console.error);
  }

  getStakingTaoInterval();
  const interval = setInterval(getStakingTaoInterval, BITTENSOR_REFRESH_STAKE_INFO);

  return () => {
    clearInterval(interval);
  };
}

export function getTaoStakingOnChain (parentApi: _SubstrateApi, useAddresses: string[], networks: Record<string, _ChainInfo>, chain: string, callback: (networkKey: string, rs: StakingItem) => void, nominatorStateCallback: (nominatorMetadata: NominatorMetadata) => void) {
  if (useAddresses.length === 1) {
    return getSingleStakingTao(parentApi, useAddresses[0], networks, chain, callback, nominatorStateCallback);
  }

  return getMultiStakingTao(parentApi, useAddresses, networks, chain, callback, nominatorStateCallback);
}
