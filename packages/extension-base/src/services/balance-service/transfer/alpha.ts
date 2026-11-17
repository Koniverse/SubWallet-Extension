// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { BasicTxErrorType } from '@subwallet/extension-base/types';
import { formatMinimum, formatNumber, isSameAddress, readOptional } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { t } from 'i18next';

import { AlphaTransferCheck, AlphaTransferState, checkAlphaTransfer, getLockedToMove } from './alpha-check';

/** `MAX_THIRD_PARTY_STAKING_HOTKEYS` (v478 `lib.rs`): the hotkeys others may stake a coldkey into */
const MAX_THIRD_PARTY_STAKING_HOTKEYS = 128;
/** `ACCOUNT_FLAGS_ACCEPT_LOCKED_ALPHA`: an account takes locked alpha only once it sets this flag */
const ACCOUNT_FLAGS_ACCEPT_LOCKED_ALPHA = 1;

export interface AlphaTransferReadParams {
  substrateApi: _SubstrateApi;
  from: string;
  to: string;
  netuid: number;
  /** The hotkey the recipient receives the stake on */
  hotkey: string;
  /** In alpha rao */
  amount: string;
}

export interface AlphaTransferParams extends AlphaTransferReadParams {
  decimals: number;
  symbol: string;
}

/**
 * Reads what `checkAlphaTransfer` needs in one round; the recipient's lock settings only when locked alpha
 * would move. A read the runtime no longer has, or that fails, leaves its field out.
 */
async function readAlphaTransferState ({ amount, from, hotkey, netuid, substrateApi, to }: AlphaTransferReadParams): Promise<AlphaTransferState> {
  const { api } = await substrateApi.isReady;
  const toOtherColdkey = !isSameAddress(from, to);
  // The sender's lock and the recipient's hotkeys matter only when the stake changes coldkey
  const [toggleCodec, priceCodec, availabilityCodec, recipientHotkeysCodec] = await Promise.all([
    readOptional(() => api.query.subtensorModule.transferToggle(netuid)),
    readOptional(() => api.call.swapRuntimeApi.currentAlphaPrice(netuid)),
    toOtherColdkey ? readOptional(() => api.call.stakeInfoRuntimeApi.getStakeAvailabilityForColdkeys([from], [netuid])) : undefined,
    toOtherColdkey ? readOptional(() => api.query.subtensorModule.stakingHotkeys(to)) : undefined
  ]);
  const value = new BigN(amount);
  const minTransferCodec = api.consts.subtensorModule.initialMinTransfer;
  // { coldkey: { netuid: { total, locked, available } } } for the sender
  const availability = Object.values((availabilityCodec?.toPrimitive() ?? {}) as Record<string, Record<string, { available: number | string, locked: number | string }>>)[0]?.[netuid];
  const available = availability ? new BigN(availability.available) : undefined;
  const locked = availability ? new BigN(availability.locked) : undefined;
  const recipientHotkeys = recipientHotkeysCodec ? (recipientHotkeysCodec.toPrimitive() as string[] | null) || [] : undefined;
  const state: AlphaTransferState = {
    amount: value,
    toOtherColdkey,
    transferEnabled: toggleCodec ? !!toggleCodec.toPrimitive() : undefined,
    // Price is rao of TAO per alpha
    taoPerAlpha: priceCodec ? new BigN(priceCodec.toString()).dividedBy(1e9) : undefined,
    minTransfer: minTransferCodec ? new BigN(minTransferCodec.toString()) : undefined,
    available,
    locked,
    recipientHotkeyLimitReached: recipientHotkeys
      ? !recipientHotkeys.some((item) => isSameAddress(item, hotkey)) && recipientHotkeys.length >= MAX_THIRD_PARTY_STAKING_HOTKEYS
      : undefined
  };

  if (toOtherColdkey && getLockedToMove(value, available, locked).gt(0)) {
    const [flagsCodec, recipientLockKeys] = await Promise.all([
      readOptional(() => api.query.subtensorModule.accountFlags(to)),
      readOptional(() => api.query.subtensorModule.lock.keys(to, netuid))
    ]);
    const recipientLockHotkey = recipientLockKeys?.[0]?.args[2]?.toString();

    state.recipientAcceptsLocked = flagsCodec
      ? (Number(flagsCodec.toPrimitive() ?? 0) & ACCOUNT_FLAGS_ACCEPT_LOCKED_ALPHA) === ACCOUNT_FLAGS_ACCEPT_LOCKED_ALPHA
      : undefined;
    state.recipientLockOnOtherHotkey = recipientLockKeys ? !!recipientLockHotkey && !isSameAddress(recipientLockHotkey, hotkey) : undefined;
  }

  return state;
}

/** The transfer as the chain will judge it, and the locked alpha it carries to the recipient (EXT-12) */
export async function getAlphaTransferCheck (params: AlphaTransferReadParams): Promise<AlphaTransferCheck> {
  return checkAlphaTransfer(await readAlphaTransferState(params));
}

/**
 * What the chain checks inside `transfer_stake` and would refuse only in the block, with the fee paid
 * (EXT-12): its transaction extension pre-checks none of it.
 * - `TransferToggle(netuid)` off → `TransferDisallowed`;
 * - worth less than `InitialMinTransfer` at spot → `AmountTooLow`;
 * - more than the sender's unlocked alpha: the locked part follows the stake (`transfer_lock`), which
 *   fails `AccountRejectsLockedAlpha` unless the recipient opted in, and `LockHotkeyMismatch` when the
 *   recipient holds a lock on another hotkey on the subnet;
 * - a recipient others already staked into on 128 hotkeys → `TooManyStakingHotkeys`.
 * A check whose read the runtime no longer has, or that fails, is skipped: the chain still decides.
 */
export async function validateAlphaTransfer ({ decimals, symbol, ...params }: AlphaTransferParams): Promise<TransactionError[]> {
  const state = await readAlphaTransferState(params);
  const { minimum, refusal } = checkAlphaTransfer(state);
  const available = formatNumber((state.available ?? new BigN(0)).toFixed(0), decimals);
  const key = 'bg.BALANCE.services.service.balance.transfer.alpha.';

  switch (refusal) {
    case 'transferDisabled':
      return [new TransactionError(BasicTxErrorType.UNSUPPORTED, t(`${key}transferDisabled`, { replace: { symbol } }))];
    case 'amountBelowMinimum':
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t(`${key}amountBelowMinimum`, { replace: { minimum: minimum ? formatMinimum(minimum, decimals) : '-', symbol } }))];
    case 'recipientRejectsLocked':
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t(`${key}recipientRejectsLocked`, { replace: { available, symbol } }))];
    case 'recipientLockOnOtherValidator':
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t(`${key}recipientLockOnOtherValidator`, { replace: { available, symbol } }))];
    case 'recipientTooManyValidators':
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t(`${key}recipientTooManyValidators`))];
    default:
      return [];
  }
}
