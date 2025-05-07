// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { BasicTxErrorType, TransactionData } from '@subwallet/extension-base/types';

import { ServiceStatus } from '../base/types';
import { EventService } from '../event-service';
import BaseOpenGovHandler from './handler';
import { _DelegateInfo, _ReferendumInfo, DelegateRequest, GetAbstainTotalRequest, GetLockedBalanceRequest, LockedDetail, RemoveVoteRequest, SplitAbstainVoteRequest, StandardVoteRequest, UndelegateRequest, UnlockBalanceRequest, UnlockVoteRequest } from './type';
import { govChainSupportItems } from './utils';

class OpenGovChainHandler extends BaseOpenGovHandler {
  public readonly slug: string;

  constructor (state: KoniState, chain: string) {
    super(state, chain);
    this.slug = chain;
  }
}
export default class OpenGovService {
  protected readonly state: KoniState;
  private eventService: EventService;
  protected readonly handlers: Record<string, OpenGovChainHandler> = {};

  constructor (state: KoniState) {
    this.state = state;
    this.eventService = state.eventService;
  }

  status: ServiceStatus = ServiceStatus.NOT_INITIALIZED;

  async init (): Promise<void> {
    this.status = ServiceStatus.INITIALIZING;
    this.eventService.emit('open-gov.ready', true);
    await this.initHandlers();

    this.status = ServiceStatus.INITIALIZED;
  }

  private async initHandlers (): Promise<void> {
    await this.eventService.waitChainReady;
    const chains: string[] = [];

    for (const chain of Object.values(this.state.getChainInfoMap())) {
      if (chain.chainStatus === 'ACTIVE' && govChainSupportItems.some((item) => item.slug === chain.slug)) {
        chains.push(chain.slug);
      }
    }

    for (const chain of chains) {
      this.handlers[chain] = new OpenGovChainHandler(this.state, chain);
    }
  }

  public async fetchReferendums (chain: string): Promise<_ReferendumInfo[]> {
    const handler = this.handlers[chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.fetchReferendums();
  }

  public async getAbstainTotal (request: GetAbstainTotalRequest): Promise<string> {
    const handler = this.handlers[request.chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.getAbstainTotal(request);
  }

  public async handleStandardVote (request: StandardVoteRequest): Promise<TransactionData> {
    const handler = this.handlers[request.chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.handleStandardVote(request);
  }

  public async handleSplitAbstainVote (request: SplitAbstainVoteRequest): Promise<TransactionData> {
    const handler = this.handlers[request.chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.handleSplitAbstainVote(request);
  }

  public async handleRemoveVote (request: RemoveVoteRequest): Promise<TransactionData> {
    const handler = this.handlers[request.chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.handleRemoveVote(request);
  }

  public async handleUnlockVote (request: UnlockVoteRequest): Promise<TransactionData> {
    const handler = this.handlers[request.chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.handleUnlockVote(request);
  }

  public async fetchDelegates (chain: string): Promise<_DelegateInfo[]> {
    const handler = this.handlers[chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.fetchDelegates();
  }

  public async handleDelegate (request: DelegateRequest): Promise<TransactionData> {
    const handler = this.handlers[request.chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.handleDelegate(request);
  }

  public async handleUndelegate (request: UndelegateRequest): Promise<TransactionData> {
    const handler = this.handlers[request.chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.handleUndelegate(request);
  }

  public async handleEditDelegate (request: DelegateRequest): Promise<TransactionData> {
    const handler = this.handlers[request.chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.handleEditDelegate(request);
  }

  public async getLockedBalance (request: GetLockedBalanceRequest): Promise<LockedDetail[]> {
    const handler = this.handlers[request.chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.getLockedBalance(request);
  }

  public async handleUnlockBalance (request: UnlockBalanceRequest): Promise<TransactionData> {
    const handler = this.handlers[request.chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.handleUnlockBalance(request);
  }
}
