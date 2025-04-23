// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const govChainSupportItems = [
  { name: 'Polkadot', slug: 'polkadot' },
  { name: 'Kusama', slug: 'kusama' },
  { name: 'Westend', slug: 'westend' }
];

export const calculateTimeLeft = (blockTime: number, currentBlock: number, alarmBlock: number | null, decisionPeriod: number, state: string, blockDuration = 6): { timeLeft: string; endTime: number } => {
  let endTime: number;

  if (alarmBlock && (isGovOngoing(state)) && currentBlock < alarmBlock) {
    const blocksLeft = alarmBlock - currentBlock;

    endTime = blockTime + blocksLeft * blockDuration * 1000;
  } else {
    endTime = 0;
  }

  const now = Date.now();
  const timeLeftMs = endTime - now;

  if (timeLeftMs <= 0) {
    return { timeLeft: 'Ended', endTime };
  }

  const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

  let timeLeft: string;

  if (days >= 2) {
    timeLeft = `${days} days ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (days === 1) {
    timeLeft = `1 day ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    timeLeft = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return { timeLeft, endTime };
};

export const isGovOngoing = (state: string) => {
  return state === 'Deciding' || state === 'Confirming' || state === 'Preparing';
};
