// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@subwallet/extension-chains/types';

import { _ChainInfo } from '@subwallet/chain-list/types';
import { getMetadata, getMetadataRaw } from '@subwallet/extension-web-ui/messaging';
import { useEffect, useMemo, useState } from 'react';

import { useGetChainInfoByGenesisHash } from '../../chain';

interface Result {
  chain: Chain | null;
  loadingChain: boolean;
}

const WAITING_TIME = 3 * 1000;

export default function useMetadata (genesisHash?: string | null, specVersion?: number): Result {
  const [chain, setChain] = useState<Chain | null>(null);
  const [loadingChain, setLoadingChain] = useState(true);
  const _chainInfo = useGetChainInfoByGenesisHash(genesisHash || '');
  const [chainInfo, setChainInfo] = useState<_ChainInfo | null>(_chainInfo);
  const chainString = useMemo(() => JSON.stringify(chainInfo), [chainInfo]);

  useEffect(() => {
    const updated = JSON.stringify(_chainInfo);

    if (updated !== chainString) {
      setChainInfo(_chainInfo);
    }
  }, [_chainInfo, chainString]);

  useEffect(() => {
    let cancel = false;

    setLoadingChain(true);

    if (genesisHash) {
      const getChainByMetaStore = async () => {
        try {
          return await getMetadata(genesisHash);
        } catch (error) {
          console.error(error);

          return null;
        }
      };

      const fetchChain = async () => {
        const [chainFromRaw, chainFromMetaStore] = await Promise.all([getMetadataRaw(chainInfo, genesisHash), getChainByMetaStore()]);

        let chain: Chain | null;

        if (cancel) {
          return null;
        }

        if (chainFromRaw && chainFromMetaStore) {
          if (chainFromRaw.specVersion >= chainFromMetaStore.specVersion) {
            chain = chainFromRaw;
          } else {
            chain = chainFromMetaStore;
          }
        } else {
          chain = chainFromRaw || chainFromMetaStore || null;
        }

        return chain;
      };

      fetchChain()
        .then(async (chain): Promise<boolean> => {
          if (cancel) {
            return false;
          }

          setChain(chain);

          if (specVersion) {
            if (chain?.specVersion === specVersion) {
              return false;
            }

            return new Promise<boolean>((resolve) => setTimeout(() => {
              return resolve(true);
            }, WAITING_TIME)); // wait metadata ready to avoid spamming warning alert
          } else {
            return false;
          }
        })
        .then((needRetry) => {
          if (needRetry) {
            fetchChain()
              .then((chain) => {
                if (cancel) {
                  return;
                }

                setChain(chain);
                setLoadingChain(false);
              })
              .catch(() => {
                if (cancel) {
                  return;
                }

                setChain(null);
                setLoadingChain(false);
              });
          } else {
            setLoadingChain(false);
          }
        })
        .catch((err) => {
          console.error(err);

          if (cancel) {
            return;
          }

          setChain(null);
          setLoadingChain(false);
        });
    }

    return () => {
      cancel = true;
    };
  }, [chainInfo, genesisHash, specVersion]);

  return useMemo(() => ({ chain, loadingChain }), [chain, loadingChain]);
}
