// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GearApi } from '@gear-js/api';
import { ActorId, Sails, TransactionBuilder } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';

export class VFT {
  public readonly service: VftService;
  public readonly sails: Sails;

  constructor (
    public readonly api: GearApi,
    public programId: `0x${string}` = '0x',
    sails: Sails
  ) {
    this.sails = sails;
    this.sails.setApi(api);
    this.sails.setProgramId(programId);
    this.service = new VftService(this);
  }

  newCtorFromCode (code: Uint8Array | Buffer, name: string, symbol: string, decimals: number): TransactionBuilder<any> {
    const ctor = this.sails.ctors.New;
    const builder = ctor.fromCode(code, name, symbol, decimals);

    this.programId = builder.programId;

    return builder;
  }

  newCtorFromCodeId (codeId: `0x${string}`, name: string, symbol: string, decimals: number): TransactionBuilder<any> {
    const ctor = this.sails.ctors.New;
    const builder = ctor.fromCodeId(codeId, name, symbol, decimals);

    this.programId = builder.programId;

    return builder;
  }
}
export class VftService {
  private _program: VFT;

  constructor (_program: VFT) {
    this._program = _program;
  }

  private get functions () {
    return this._program.sails.services.Vft.functions;
  }

  private get queries () {
    return this._program.sails.services.Vft.queries;
  }

  public approve (spender: ActorId, value: number | string | bigint): TransactionBuilder<boolean> {
    return this.functions.Approve(spender, value);
  }

  public transfer (to: ActorId, value: number | string | bigint): TransactionBuilder<boolean> {
    return this.functions.Transfer(to, value);
  }

  public transferFrom (from: ActorId, to: ActorId, value: number | string | bigint): TransactionBuilder<boolean> {
    return this.functions.TransferFrom(from, to, value);
  }

  public allowance (owner: ActorId, spender: ActorId, originAddress: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    return this.queries.Allowance(originAddress, BigInt(value || 0), atBlock, owner, spender);
  }

  public balanceOf (account: ActorId, originAddress: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    return this.queries.BalanceOf(originAddress, BigInt(value || 0), atBlock, account);
  }

  public decimals (originAddress: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<number> {
    return this.queries.Decimals(originAddress, BigInt(value || 0), atBlock);
  }

  public name (originAddress: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<string> {
    return this.queries.Name(originAddress, BigInt(value || 0), atBlock);
  }

  public symbol (originAddress: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<string> {
    return this.queries.Symbol(originAddress, BigInt(value || 0), atBlock);
  }

  public totalSupply (originAddress: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    return this.queries.TotalSupply(originAddress, BigInt(value || 0), atBlock);
  }

  public async subscribeToApprovalEvent (callback: (data: { owner: ActorId; spender: ActorId; value: bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.sails.services.Vft.events.Approval.subscribe(callback);
  }

  public async subscribeToTransferEvent (callback: (data: { from: ActorId; to: ActorId; value: bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.sails.services.Vft.events.Transfer.subscribe(callback);
  }
}

// Cache sail
let cachedSails: Sails | null = null;

export async function getSails (): Promise<Sails> {
  if (!cachedSails) {
    const parser = await SailsIdlParser.new();

    cachedSails = new Sails(parser);
    cachedSails.parseIdl(vftIdl);
  }

  return cachedSails;
}

const vftIdl = `
constructor {
  New : (name: str, symbol: str, decimals: u8);
};

service Vft {
  Burn : (from: actor_id, value: u256) -> bool;
  GrantAdminRole : (to: actor_id) -> null;
  GrantBurnerRole : (to: actor_id) -> null;
  GrantMinterRole : (to: actor_id) -> null;
  Mint : (to: actor_id, value: u256) -> bool;
  RevokeAdminRole : (from: actor_id) -> null;
  RevokeBurnerRole : (from: actor_id) -> null;
  RevokeMinterRole : (from: actor_id) -> null;
  Approve : (spender: actor_id, value: u256) -> bool;
  Transfer : (to: actor_id, value: u256) -> bool;
  TransferFrom : (from: actor_id, to: actor_id, value: u256) -> bool;
  query Admins : () -> vec actor_id;
  query Burners : () -> vec actor_id;
  query Minters : () -> vec actor_id;
  query Allowance : (owner: actor_id, spender: actor_id) -> u256;
  query BalanceOf : (account: actor_id) -> u256;
  query Decimals : () -> u8;
  query Name : () -> str;
  query Symbol : () -> str;
  query TotalSupply : () -> u256;

  events {
    Minted: struct {
      to: actor_id,
      value: u256,
    };
    Burned: struct {
      from: actor_id,
      value: u256,
    };
    Approval: struct {
      owner: actor_id,
      spender: actor_id,
      value: u256,
    };
    Transfer: struct {
      from: actor_id,
      to: actor_id,
      value: u256,
    };
  }
};
`;
