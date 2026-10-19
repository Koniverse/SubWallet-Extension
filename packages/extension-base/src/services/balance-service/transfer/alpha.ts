// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { BasicTxErrorType } from '@subwallet/extension-base/types';
import { formatMinimum, formatNumber, isSameAddress, readOptional } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { t } from 'i18next';

/** `MAX_THIRD_PARTY_STAKING_HOTKEYS` (v478 `lib.rs`): the hotkeys others may stake a coldkey into */
const MAX_THIRD_PARTY_STAKING_HOTKEYS = 128;
/** `ACCOUNT_FLAGS_ACCEPT_LOCKED_ALPHA`: an account takes locked alpha only once it sets this flag */
const ACCOUNT_FLAGS_ACCEPT_LOCKED_ALPHA = 1;

export interface AlphaTransferParams {
  substrateApi: _SubstrateApi;
  from: string;
  to: string;
  netuid: number;
  /** The hotkey the recipient receives the stake on */
  hotkey: string;
  /** In alpha rao */
  amount: string;
  decimals: number;
  symbol: string;
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
export async function validateAlphaTransfer ({ amount, decimals, from, hotkey, netuid, substrateApi, symbol, to }: AlphaTransferParams): Promise<TransactionError[]> {
  const { api } = await substrateApi.isReady;
  const isOtherColdkey = !isSameAddress(from, to);
  // The sender's lock and the recipient's hotkeys matter only when the stake changes coldkey
  const [toggleCodec, priceCodec, availabilityCodec, recipientHotkeysCodec] = await Promise.all([
    readOptional(() => api.query.subtensorModule.transferToggle(netuid)),
    readOptional(() => api.call.swapRuntimeApi.currentAlphaPrice(netuid)),
    isOtherColdkey ? readOptional(() => api.call.stakeInfoRuntimeApi.getStakeAvailabilityForColdkeys([from], [netuid])) : undefined,
    isOtherColdkey ? readOptional(() => api.query.subtensorModule.stakingHotkeys(to)) : undefined
  ]);
  const value = new BigN(amount);
  const format = (alpha: BigN) => formatNumber(alpha.toFixed(0), decimals);

  if (toggleCodec && !toggleCodec.toPrimitive()) {
    return [new TransactionError(BasicTxErrorType.UNSUPPORTED, t('bg.BALANCE.services.service.balance.transfer.alpha.transferDisabled', { replace: { symbol } }))];
  }

  const minTransferCodec = api.consts.subtensorModule.initialMinTransfer;

  if (priceCodec && minTransferCodec) {
    // The chain values the stake at spot, with no slippage: price is rao of TAO per alpha
    const taoPerAlpha = new BigN(priceCodec.toString()).dividedBy(1e9);
    const minTransfer = new BigN(minTransferCodec.toString());

    if (value.multipliedBy(taoPerAlpha).integerValue(BigN.ROUND_FLOOR).lt(minTransfer)) {
      const minimum = taoPerAlpha.gt(0) ? minTransfer.dividedBy(taoPerAlpha).integerValue(BigN.ROUND_CEIL) : undefined;

      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t('bg.BALANCE.services.service.balance.transfer.alpha.amountBelowMinimum', { replace: { minimum: minimum ? formatMinimum(minimum, decimals) : '-', symbol } }))];
    }
  }

  if (!isOtherColdkey) {
    return [];
  }

  // { coldkey: { netuid: { total, locked, available } } } for the sender
  const availability = Object.values((availabilityCodec?.toPrimitive() ?? {}) as Record<string, Record<string, { available: number | string }>>)[0]?.[netuid];
  const available = availability ? new BigN(availability.available) : undefined;

  if (available && value.gt(available)) {
    // Only a transfer that carries locked alpha needs the recipient's lock settings
    const [flagsCodec, recipientLockKeys] = await Promise.all([
      readOptional(() => api.query.subtensorModule.accountFlags(to)),
      readOptional(() => api.query.subtensorModule.lock.keys(to, netuid))
    ]);
    const acceptsLocked = (Number(flagsCodec?.toPrimitive() ?? 0) & ACCOUNT_FLAGS_ACCEPT_LOCKED_ALPHA) === ACCOUNT_FLAGS_ACCEPT_LOCKED_ALPHA;

    if (flagsCodec && !acceptsLocked) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t('bg.BALANCE.services.service.balance.transfer.alpha.recipientRejectsLocked', { replace: { available: format(available), symbol } }))];
    }

    const recipientLockHotkey = recipientLockKeys?.[0]?.args[2]?.toString();

    if (recipientLockHotkey && !isSameAddress(recipientLockHotkey, hotkey)) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t('bg.BALANCE.services.service.balance.transfer.alpha.recipientLockOnOtherValidator', { replace: { available: format(available), symbol } }))];
    }
  }

  const recipientHotkeys = (recipientHotkeysCodec?.toPrimitive() as string[] | null) || [];

  if (!recipientHotkeys.some((item) => isSameAddress(item, hotkey)) && recipientHotkeys.length >= MAX_THIRD_PARTY_STAKING_HOTKEYS) {
    return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, t('bg.BALANCE.services.service.balance.transfer.alpha.recipientTooManyValidators'))];
  }

  return [];
}
