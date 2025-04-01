// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TokenPriorityDetails } from '@subwallet/extension-base/background/KoniTypes';
import { BalanceValueInfo } from '@subwallet/extension-koni-ui/types';

export interface SortableTokenItem {
  slug: string,
  symbol: string,
  total?: BalanceValueInfo,
}

export const sortTokenByValue = (a: SortableTokenItem, b: SortableTokenItem): number => {
  if (a.total && b.total) {
    const convertValue = b.total.convertedValue.minus(a.total.convertedValue).toNumber();

    if (convertValue) {
      return convertValue;
    } else {
      return b.total.value.minus(a.total.value).toNumber();
    }
  } else {
    return 0;
  }
};

export const sortTokenAlphabetically = (a: string, b: string): number => {
  const aSymbol = a.toLowerCase();
  const bSymbol = b.toLowerCase();

  if (aSymbol < bSymbol) {
    return -1;
  } else if (aSymbol > bSymbol) {
    return 1;
  } else {
    return 0;
  }
};

export const sortTokenByPriority = (a: string, b: string, aIsPrioritizedToken: boolean, bIsPrioritizedToken: boolean, aPriority: number, bPriority: number): number => {
  if (aIsPrioritizedToken && !bIsPrioritizedToken) {
    return -1;
  } else if (!aIsPrioritizedToken && bIsPrioritizedToken) {
    return 1;
  } else if (!aIsPrioritizedToken && !bIsPrioritizedToken) {
    return sortTokenAlphabetically(a, b);
  } else {
    if (aPriority < bPriority) {
      return -1;
    } else if (aPriority > bPriority) {
      return 1;
    } else {
      return 0;
    }
  }
};

// Todo: Merge sortTokensByStandard and sortTokensByBalanceInSelector to one function
export function sortTokensByStandard (targetTokens: SortableTokenItem[], priorityTokenGroups: TokenPriorityDetails, isTokenGroup = false) {
  const priorityTokenGroupKeys = Object.keys(priorityTokenGroups.tokenGroup);
  const priorityTokenKeys = Object.keys(priorityTokenGroups.token);

  targetTokens.sort((a, b) => {
    const aHasBalance = (a.total && (a.total.convertedValue.toNumber() !== 0 || a.total.value.toNumber() !== 0));
    const bHasBalance = (b.total && (b.total.convertedValue.toNumber() !== 0 || b.total.value.toNumber() !== 0));

    if (aHasBalance && bHasBalance) {
      return sortTokenByValue(a, b);
    } else if (aHasBalance && !bHasBalance) {
      return -1;
    } else if (!aHasBalance && bHasBalance) {
      return 1;
    }

    const aSlug = a.slug;
    const bSlug = b.slug;

    if (isTokenGroup) {
      const aBelongToPrioritizedGroup = priorityTokenGroupKeys.includes(aSlug);
      const bBelongToPrioritizedGroup = priorityTokenGroupKeys.includes(bSlug);

      const aPriority = aBelongToPrioritizedGroup ? priorityTokenGroups.tokenGroup[aSlug] : 0;
      const bPriority = bBelongToPrioritizedGroup ? priorityTokenGroups.tokenGroup[bSlug] : 0;

      return sortTokenByPriority(a.symbol, b.symbol, aBelongToPrioritizedGroup, bBelongToPrioritizedGroup, aPriority, bPriority);
    } else {
      const aIsPrioritizedToken = priorityTokenKeys.includes(aSlug);
      const bIsPrioritizedToken = priorityTokenKeys.includes(bSlug);

      const aPriority = aIsPrioritizedToken ? priorityTokenGroups.token[aSlug] : 0;
      const bPriority = bIsPrioritizedToken ? priorityTokenGroups.token[bSlug] : 0;

      return sortTokenByPriority(a.symbol, b.symbol, aIsPrioritizedToken, bIsPrioritizedToken, aPriority, bPriority);
    }
  });
}

export function sortTokensByBalanceInSelector (targetTokens: SortableTokenItem[], priorityTokenGroups: TokenPriorityDetails) {
  const priorityTokenKeys = Object.keys(priorityTokenGroups.token);

  targetTokens.sort((a, b) => {
    const getTokenGroupLevel = (token: SortableTokenItem): number => {
      if (token.total) {
        const value = token.total.value.toNumber();

        if (value > 0) {
          return 1;
        } // Group 1: Has total.value > 0

        return 2; // Group 2: Has total.value == 0
      }

      return 3; // Group 3: No total
    };

    const aLevel = getTokenGroupLevel(a);
    const bLevel = getTokenGroupLevel(b);

    // Different group levels → sort by group level
    if (aLevel !== bLevel) {
      return aLevel - bLevel;
    }

    // Same group
    if (aLevel === 1) {
      return sortTokenByValue(a, b); // Group 1: sort by value
    }

    // Group 2 or 3: sort by priority
    const aSlug = a.slug;
    const bSlug = b.slug;

    const aIsPrioritized = priorityTokenKeys.includes(aSlug);
    const bIsPrioritized = priorityTokenKeys.includes(bSlug);

    const aPriority = aIsPrioritized ? priorityTokenGroups.token[aSlug] : 0;
    const bPriority = bIsPrioritized ? priorityTokenGroups.token[bSlug] : 0;

    return sortTokenByPriority(
      a.symbol,
      b.symbol,
      aIsPrioritized,
      bIsPrioritized,
      aPriority,
      bPriority
    );
  });
}
