// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { useCoreCreateReformatAddress, useSelector, useTransactionContext } from '@subwallet/extension-koni-ui/hooks';
import { chainSlugToSubsquareNetwork } from '@subwallet/extension-koni-ui/Popup/Home/Governance/shared';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { GovReferendumVoteParams, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GovAccountAddressItemType, GovVoteStatus } from '@subwallet/extension-koni-ui/types/gov';
import { GOV_QUERY_KEYS } from '@subwallet/extension-koni-ui/utils/gov';
import getSubsquareApi, { SubsquareApiSdk } from '@subwallet/subsquare-api-sdk';
import { ReferendumVoteDetail } from '@subwallet/subsquare-api-sdk/interface';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';

type WrapperProps = ThemeProps;

type ComponentProps = {
  className?: string;
};

const Component = (props: ComponentProps): React.ReactElement<ComponentProps> => {
  const { defaultData } = useTransactionContext<GovReferendumVoteParams>();
  const { accountProxies } = useSelector((state: RootState) => state.accountState);

  const { chainInfoMap } = useSelector((root) => root.chainStore);

  const getReformatAddress = useCoreCreateReformatAddress();

  const chain = defaultData.chain;
  const referendumId = defaultData.referendumId;

  const targetAccountProxy = useMemo(() => {
    return accountProxies.find((ap) => {
      if (!defaultData.fromAccountProxy) {
        return isAccountAll(ap.id);
      }

      return ap.id === defaultData.fromAccountProxy;
    });
  }, [accountProxies, defaultData.fromAccountProxy]);

  const sdkInstant: SubsquareApiSdk = useMemo(() => {
    return getSubsquareApi(chainSlugToSubsquareNetwork[chain]);
  }, [chain]);

  const { data: voteData } = useQuery({
    queryKey: GOV_QUERY_KEYS.referendumVotes(chain, referendumId),
    queryFn: async () => {
      if (!referendumId) {
        return undefined;
      }

      return await sdkInstant?.getReferendaVotes(`${referendumId}`);
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
            ? (voteInfo.isDelegating ? GovVoteStatus.DELEGATED : GovVoteStatus.VOTED)
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

  return (
    <>
      <Outlet context={{ voteMap, accountAddressItems }} />
    </>
  );
};

const Wrapper: React.FC<WrapperProps> = (props: WrapperProps) => {
  const { className } = props;

  return (
    <Component
      className={className}
    />
  );
};

const ReferendumVote = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return {

  };
});

export default ReferendumVote;
