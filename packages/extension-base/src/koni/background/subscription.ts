// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { NftHandler } from '@subwallet/extension-base/koni/api/nft';
import { _EvmApi, _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import DatabaseService from '@subwallet/extension-base/services/storage-service/DatabaseService';

import { logger as createLogger } from '@polkadot/util';
import { Logger } from '@polkadot/util/types';

import KoniState from './handlers/State';

const nftHandler = new NftHandler();

export class KoniSubscription {
  public dbService: DatabaseService;
  private state: KoniState;
  private logger: Logger;

  constructor (state: KoniState, dbService: DatabaseService) {
    this.dbService = dbService;
    this.state = state;
    this.logger = createLogger('Subscription');
  }

  async start () {
    await Promise.all([this.state.eventService.waitCryptoReady, this.state.eventService.waitKeyringReady, this.state.eventService.waitAssetReady]);
  }

  subscribeNft (address: string, substrateApiMap: Record<string, _SubstrateApi>, evmApiMap: Record<string, _EvmApi>, smartContractNfts: _ChainAsset[], chainInfoMap: Record<string, _ChainInfo>) {
    const addresses = this.state.keyringService.context.getDecodedAddresses(address);

    if (!addresses.length) {
      return;
    }

    this.initNftSubscription(addresses, substrateApiMap, evmApiMap, smartContractNfts, chainInfoMap);
  }

  private initNftSubscription (addresses: string[], substrateApiMap: Record<string, _SubstrateApi>, evmApiMap: Record<string, _EvmApi>, smartContractNfts: _ChainAsset[], chainInfoMap: Record<string, _ChainInfo>) {
    nftHandler.setChainInfoMap(chainInfoMap);
    nftHandler.setDotSamaApiMap(substrateApiMap);
    nftHandler.setWeb3ApiMap(evmApiMap);
    nftHandler.setAddresses(addresses);

    nftHandler.handleNfts(
      smartContractNfts,
      (...args) => this.state.updateNftData(...args),
      (...args) => this.state.setNftCollection(...args)
    ).catch(this.logger.log);
  }
}
