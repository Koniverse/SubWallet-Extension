// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { useCoreCreateReformatAddress } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { GovAccountAddressItemType, GovVoteStatus } from '@subwallet/extension-koni-ui/types/gov';
import { GOV_QUERY_KEYS } from '@subwallet/extension-koni-ui/utils/gov';
import getSubsquareApi, { ReferendumVoteDetail, SubsquareApiSdk } from '@subwallet/subsquare-api-sdk';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { chainSlugToSubsquareApi } from '../../shared';

type UseGovReferendumVotesParams = {
  chain: string;
  referendumId: string;
  fromAccountProxy: string;
};

export function useGovReferendumVotes ({ chain,
  fromAccountProxy,
  referendumId }: UseGovReferendumVotesParams) {
  const { accountProxies } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((root: RootState) => root.chainStore);

  const getReformatAddress = useCoreCreateReformatAddress();

  const targetAccountProxy = useMemo(() => {
    return accountProxies.find((ap) => {
      if (!fromAccountProxy) {
        return isAccountAll(ap.id);
      }

      return ap.id === fromAccountProxy;
    });
  }, [accountProxies, fromAccountProxy]);

  const sdkInstance: SubsquareApiSdk = useMemo(() => {
    return getSubsquareApi(chainSlugToSubsquareApi[chain]);
  }, [chain]);

  const { data: voteData } = useQuery({
    queryKey: GOV_QUERY_KEYS.referendumVotes(chain, referendumId),
    queryFn: async () => {
      if (!referendumId || !sdkInstance) {
        return undefined;
      }

      return await sdkInstance.getReferendaVotes(`${referendumId}`);
    },
    enabled: !!referendumId && !!chain,
    staleTime: 60 * 1000
  });

  const voteMap = useMemo(() => {
    if (!voteData) {
      return new Map<string, ReferendumVoteDetail>();
    }

    const map = new Map<string, ReferendumVoteDetail>();

    voteData.forEach((vote: ReferendumVoteDetail) => {
      map.set(vote.account.toLowerCase(), vote);
    });

    return map;
  }, [voteData]);

  const accountAddressItems = useMemo(() => {
    const chainInfo = chain ? chainInfoMap[chain] : undefined;

    if (!chainInfo || !targetAccountProxy) {
      return [];
    }

    const result: GovAccountAddressItemType[] = [];

    const updateResult = (ap: AccountProxy) => {
      ap.accounts.forEach((a) => {
        const address = getReformatAddress(a, chainInfo);

        if (address) {
          const voteInfo = voteMap.get(address.toLowerCase());
          const govVoteStatus = voteInfo
            ? voteInfo.isDelegating
              ? GovVoteStatus.DELEGATED
              : GovVoteStatus.VOTED
            : GovVoteStatus.NOT_VOTED;

          result.push({
            accountName: ap.name,
            accountProxyId: ap.id,
            accountProxyType: ap.accountType,
            accountType: a.type,
            address,
            govVoteStatus
          });
        }
      });
    };

    if (isAccountAll(targetAccountProxy.id)) {
      accountProxies.forEach((ap) => {
        if (isAccountAll(ap.id)) {
          return;
        }

        if ([AccountProxyType.READ_ONLY].includes(ap.accountType)) {
          return;
        }

        updateResult(ap);
      });
    } else {
      updateResult(targetAccountProxy);
    }

    return result;
  }, [accountProxies, chainInfoMap, chain, getReformatAddress, targetAccountProxy, voteMap]);

  return { voteMap, accountAddressItems };
}
