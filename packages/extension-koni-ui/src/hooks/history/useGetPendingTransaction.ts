// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicStatus, ExtrinsicType, TransactionHistoryItem } from '@subwallet/extension-base/background/KoniTypes';
import { cancelSubscription, subscribeTransactionHistory } from '@subwallet/extension-koni-ui/messaging';
import { useEffect, useMemo, useState } from 'react';

export default function useGetPendingTransaction (address: string, chain: string, extrinsicType: ExtrinsicType) {
  const [rawHistoryList, setRawHistoryList] = useState<TransactionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to transaction history
  useEffect(() => {
    let subId: string | undefined;
    let isSubscribed = true;

    if (!chain) {
      setRawHistoryList([]);
      setLoading(false);

      return;
    }

    setLoading(true);

    subscribeTransactionHistory(
      chain,
      address,
      (items: TransactionHistoryItem[]) => {
        if (isSubscribed) {
          setRawHistoryList(items);
          setLoading(false);
        }
      }
    )
      .then((res) => {
        subId = res.id;

        if (isSubscribed) {
          setRawHistoryList(res.items);
        } else {
          cancelSubscription(subId).catch(console.error);
        }
      })
      .catch((e) => {
        console.error('subscribeTransactionHistory error:', e);
        setLoading(false);
      });

    return () => {
      isSubscribed = false;

      if (subId) {
        cancelSubscription(subId).catch(console.error);
      }
    };
  }, [chain, address]);

  // Filter for pending transactions
  const pendingTx = useMemo(() => {
    if (!rawHistoryList.length) {
      return [];
    }

    return rawHistoryList.filter((item) => {
      const isPending =
        item.status === ExtrinsicStatus.QUEUED ||
        item.status === ExtrinsicStatus.SUBMITTING ||
        item.status === ExtrinsicStatus.PROCESSING;

      if (!isPending) {
        return false;
      }

      // Filter by extrinsic type if provided
      if (extrinsicType && item.type !== extrinsicType) {
        return false;
      }

      return true;
    });
  }, [rawHistoryList, extrinsicType]);

  return {
    pendingTx,
    rawHistoryList,
    loading
  };
}
