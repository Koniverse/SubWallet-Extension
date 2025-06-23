// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';
import { BASE_FETCH_ORDINAL_EVENT_DATA } from '@subwallet/extension-base/koni/api/nft/ordinal_nft/constants';
import { SUBSCAN_API_CHAIN_MAP } from '@subwallet/extension-base/services/subscan-service/subscan-chain-map';
import { CrowdloanContributionsResponse, ExtrinsicItem, ExtrinsicsListResponse, IMultiChainBalance, RequestBlockRange, RewardHistoryListResponse, SubscanResponse, TransferItem, TransfersListResponse } from '@subwallet/extension-base/services/subscan-service/types';
import { BaseApiRequestContext } from '@subwallet/extension-base/strategy/api-request-strategy/context/base';
import { BaseApiRequestStrategyV2 } from '@subwallet/extension-base/strategy/api-request-strategy-v2';
import { SubscanEventBaseItemData, SubscanEventListResponse, SubscanExtrinsicParam, SubscanExtrinsicParamResponse } from '@subwallet/extension-base/types';
import { wait } from '@subwallet/extension-base/utils';

const QUERY_ROW = 100;

interface SubscanError {
  code: number;
  message: string;
}

export class SubscanService extends BaseApiRequestStrategyV2 {
  constructor (private subscanChainMap: Record<string, string>, options?: {limitRate?: number, intervalCheck?: number, maxRetry?: number}) {
    const context = new BaseApiRequestContext(options);

    super(context);
  }

  private getApiUrl (chain: string, path: string) {
    const subscanChain = this.subscanChainMap[chain];

    if (!subscanChain) {
      throw new SWError('NOT_SUPPORTED', 'Chain is not supported');
    }

    return `https://${subscanChain}.api.subscan.io/${path}`;
  }

  private postRequest (url: string, body: any) {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  }

  isRateLimited (e: Error): boolean {
    const error = JSON.parse(e.message) as SubscanError;

    return error.code === 20008;
  }

  public checkSupportedSubscanChain (chain: string): boolean {
    return !!this.subscanChainMap[chain];
  }

  public setSubscanChainMap (subscanChainMap: Record<string, string>) {
    this.subscanChainMap = subscanChainMap;
  }

  // Implement Subscan API
  public getMultiChainBalance (address: string): Promise<IMultiChainBalance[]> {
    return this.addRequest(async () => {
      const rs = await this.postRequest(this.getApiUrl('polkadot', 'api/scan/multiChain/account'), { address });

      if (rs.status !== 200) {
        throw new SWError('SubscanService.getMultiChainBalance', await rs.text());
      }

      const jsonData = (await rs.json()) as SubscanResponse<IMultiChainBalance[]>;

      return jsonData.data;
    }, 1);
  }

  public getCrowdloanContributions (relayChain: string, address: string, page = 0): Promise<CrowdloanContributionsResponse> {
    return this.addRequest<CrowdloanContributionsResponse>(async () => {
      const rs = await this.postRequest(this.getApiUrl(relayChain, 'api/scan/account/contributions'), {
        include_total: true,
        page,
        row: QUERY_ROW,
        who: address
      });

      if (rs.status !== 200) {
        throw new SWError('SubscanService.getCrowdloanContributions', await rs.text());
      }

      const jsonData = (await rs.json()) as SubscanResponse<CrowdloanContributionsResponse>;

      return jsonData.data;
    }, 2);
  }

  public getExtrinsicsList (groupId: number, chain: string, address: string, page = 0, blockRange?: RequestBlockRange): Promise<ExtrinsicsListResponse> {
    const _blockRange = (() => {
      if (!blockRange || !blockRange.to) {
        return null;
      }

      return `${blockRange.from || 0}-${blockRange.to}`;
    })();

    return this.addRequest<ExtrinsicsListResponse>(async () => {
      const rs = await this.postRequest(this.getApiUrl(chain, 'api/v2/scan/extrinsics'), {
        page,
        row: QUERY_ROW,
        address,
        block_range: _blockRange
      });

      if (rs.status !== 200) {
        throw new SWError('SubscanService.getExtrinsicsList', await rs.text());
      }

      const jsonData = (await rs.json()) as SubscanResponse<ExtrinsicsListResponse>;

      return jsonData.data;
    }, 0, groupId);
  }

  public async fetchAllPossibleExtrinsicItems (
    groupId: number,
    chain: string,
    address: string,
    cbAfterEachRequest?: (items: ExtrinsicItem[]) => void,
    limit = {
      page: 10,
      record: 1000
    }
  ): Promise<ExtrinsicItem[]> {
    let maxCount = 0;
    let currentCount = 0;
    const blockRange: RequestBlockRange = {
      from: null,
      to: null
    };
    const resultMap: Record<string, ExtrinsicItem> = {};

    const _getExtrinsicItems = async (page: number) => {
      const res = await this.getExtrinsicsList(groupId, chain, address, page, blockRange);

      if (!res || !res.count || !res.extrinsics || !res.extrinsics.length) {
        return;
      }

      if (res.count > maxCount) {
        maxCount = res.count;
      }

      const extrinsics = res.extrinsics;
      const extrinsicIndexes = extrinsics.map((item) => item.extrinsic_index);
      const extrinsicParams = await this.getExtrinsicParams(groupId, chain, extrinsicIndexes, 0);

      for (const data of extrinsicParams) {
        const { extrinsic_index: extrinsicIndex, params } = data;

        const extrinsic = extrinsics.find((item) => item.extrinsic_index === extrinsicIndex);

        if (extrinsic) {
          extrinsic.params = JSON.stringify(params);
        }
      }

      // Call callback after each request, for parse data
      cbAfterEachRequest?.(extrinsics);

      for (const item of extrinsics) {
        resultMap[item.extrinsic_hash] = item;
      }

      currentCount += extrinsics.length;

      if (page > limit.page || currentCount > limit.record) {
        return;
      }

      if (currentCount < maxCount) {
        await wait(100);

        if (page === 0) {
          blockRange.to = res.extrinsics[0].block_num;
        }

        await _getExtrinsicItems(++page);
      }
    };

    await _getExtrinsicItems(0);

    return Object.values(resultMap);
  }

  public getTransfersList (groupId: number, chain: string, address: string, page = 0, direction?: 'sent' | 'received', blockRange?: RequestBlockRange): Promise<TransfersListResponse> {
    return this.addRequest<TransfersListResponse>(async () => {
      const rs = await this.postRequest(this.getApiUrl(chain, 'api/v2/scan/transfers'), {
        page,
        row: QUERY_ROW,
        address,
        direction: direction || null,
        from_block: blockRange?.from || null,
        to_block: blockRange?.to || null
      });

      if (rs.status !== 200) {
        throw new SWError('SubscanService.getTransfersList', await rs.text());
      }

      const jsonData = (await rs.json()) as SubscanResponse<TransfersListResponse>;

      return jsonData.data;
    }, 0, groupId);
  }

  public async fetchAllPossibleTransferItems (
    groupId: number,
    chain: string,
    address: string,
    direction?: 'sent' | 'received',
    cbAfterEachRequest?: (items: TransferItem[]) => void,
    limit = {
      page: 10,
      record: 1000
    }
  ): Promise<Record<string, TransferItem[]>> {
    let maxCount = 0;
    let currentCount = 0;
    const blockRange: RequestBlockRange = {
      from: null,
      to: null
    };
    const resultMap: Record<string, TransferItem[]> = {};

    const _getTransferItems = async (page: number) => {
      const res = await this.getTransfersList(groupId, chain, address, page, direction, blockRange);

      if (!res || !res.count || !res.transfers || !res.transfers.length) {
        return;
      }

      if (res.count > maxCount) {
        maxCount = res.count;
      }

      cbAfterEachRequest?.(res.transfers);
      res.transfers.forEach((item) => {
        if (!resultMap[item.hash]) {
          resultMap[item.hash] = [item];
        } else {
          resultMap[item.hash].push(item);
        }
      });

      currentCount += res.transfers.length;

      if (page > limit.page || currentCount > limit.record) {
        return;
      }

      if (currentCount < maxCount) {
        await wait(100);

        if (page === 0) {
          blockRange.to = res.transfers[0].block_num;
        }

        await _getTransferItems(++page);
      }
    };

    await _getTransferItems(0);

    return resultMap;
  }

  public getRewardHistoryList (groupId: number, chain: string, address: string, page = 0): Promise<RewardHistoryListResponse> {
    return this.addRequest<RewardHistoryListResponse>(async () => {
      const rs = await this.postRequest(this.getApiUrl(chain, 'api/scan/account/reward_slash'), {
        page,
        category: 'Reward',
        row: 10,
        address
      });

      if (rs.status !== 200) {
        throw new SWError('SubscanService.getRewardHistoryList', await rs.text());
      }

      const jsonData = (await rs.json()) as SubscanResponse<RewardHistoryListResponse>;
      const returnData = jsonData.data;

      if (!returnData) {
        return { count: 0, list: null } as RewardHistoryListResponse;
      }

      return jsonData.data;
    }, 2, groupId);
  }

  public getAccountRemarkEvents (groupId: number, chain: string, address: string): Promise<SubscanEventBaseItemData[]> {
    return this.addRequest<SubscanEventBaseItemData[]>(async () => {
      const rs = await this.postRequest(this.getApiUrl(chain, 'api/v2/scan/events'), {
        ...BASE_FETCH_ORDINAL_EVENT_DATA,
        address
      });

      if (rs.status !== 200) {
        throw new SWError('SubscanService.getAccountRemarkEvents', await rs.text());
      }

      const jsonData = (await rs.json()) as SubscanEventListResponse;

      return jsonData.data.events;
    }, 3, groupId);
  }

  public getExtrinsicParams (groupId: number, chain: string, extrinsicIndexes: string[], ordinal = 3): Promise<SubscanExtrinsicParam[]> {
    return this.addRequest<SubscanExtrinsicParam[]>(async () => {
      const rs = await this.postRequest(this.getApiUrl(chain, 'api/scan/extrinsic/params'), {
        extrinsic_index: extrinsicIndexes
      });

      if (rs.status !== 200) {
        throw new SWError('SubscanService.getExtrinsicParams', await rs.text());
      }

      const jsonData = (await rs.json()) as SubscanExtrinsicParamResponse;

      return jsonData.data;
    }, ordinal, groupId);
  }

  // Singleton
  private static _instance: SubscanService;

  public static getInstance () {
    if (!SubscanService._instance) {
      SubscanService._instance = new SubscanService(SUBSCAN_API_CHAIN_MAP);
    }

    return SubscanService._instance;
  }
}
