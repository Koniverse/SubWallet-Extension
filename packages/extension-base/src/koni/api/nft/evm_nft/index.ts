// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _AssetType, _ChainAsset } from '@subwallet/chain-list/types';
import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { _ERC721_ABI, _ERC721_EXTENDED_ABI } from '@subwallet/extension-base/koni/api/contract-handler/utils';
import { getRandomIpfsGateway } from '@subwallet/extension-base/koni/api/nft/config';
import { BaseNftApi, HandleNftParams } from '@subwallet/extension-base/koni/api/nft/nft';
import { _EvmApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getContractAddressOfToken } from '@subwallet/extension-base/services/chain-service/utils';
import { isUrl } from '@subwallet/extension-base/utils';
import pLimit from 'p-limit'; // Thư viện để giới hạn số lượng request đồng thời
import { AbiItem } from 'web3-utils';

import { isEthereumAddress } from '@polkadot/util-crypto';

// Địa chỉ contract Multicall (cần thay bằng địa chỉ thực tế trên chain tương ứng)
// const MULTICALL_ADDRESS = '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441'; // Ethereum mainnet
// Địa chỉ Multicall3 (cập nhật cho chain của bạn)
const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11'; // Multicall3 trên Ethereum mainnet
const MULTICALL_ABI: AbiItem[] | AbiItem = [
  {
    constant: true,
    inputs: [
      {
        components: [
          { name: 'target', type: 'address' },
          { name: 'callData', type: 'bytes' }
        ],
        name: 'calls',
        type: 'tuple[]'
      }
    ],
    name: 'tryAggregate',
    outputs: [
      {
        components: [
          { name: 'success', type: 'bool' },
          { name: 'returnData', type: 'bytes' }
        ],
        name: 'returnData',
        type: 'tuple[]'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
];

export class EvmNftApi extends BaseNftApi {
  evmContracts: _ChainAsset[] = [];

  constructor (evmApi: _EvmApi | null, addresses: string[], chain: string) {
    super(chain, undefined, addresses);

    this.evmApi = evmApi;
    this.isEthereum = true;
  }

  setSmartContractNfts (evmContracts: _ChainAsset[]) {
    this.evmContracts = evmContracts;
  }

  override parseUrl (input: string): string | undefined {
    if (!input) {
      return undefined;
    }

    if (isUrl(input)) {
      return input;
    }

    if (input.includes('ipfs://')) {
      return getRandomIpfsGateway() + input.split('ipfs://')[1];
    }

    return undefined;
  }

  private parseMetadata (data: Record<string, any>): NftItem {
    const traitList = data.traits ? data.traits as Record<string, any>[] : data.attributes as Record<string, any>[];
    const propertiesMap: Record<string, any> = {};

    if (traitList) {
      traitList.forEach((traitMap) => {
        propertiesMap[traitMap.trait_type as string] = {
          value: traitMap.value as string
          // rarity: traitMap.trait_count / itemTotal
        };
      });
    }

    // extra fields
    if (data.dna) {
      propertiesMap.dna = {
        value: data.dna as string
      };
    }

    // if (data.compiler) {
    //   propertiesMap.compiler = {
    //     value: data.compiler as string
    //   };
    // }

    return {
      name: data.name as string | undefined,
      image: data.image_url ? this.parseUrl(data.image_url as string) : this.parseUrl(data.image as string),
      description: data.description as string | undefined,
      properties: propertiesMap,
      externalUrl: data.external_url as string | undefined,
      chain: this.chain
    } as NftItem;
  }

  private async safeGetTokenURI (contract: any, tokenId: number): Promise<string> {
    try {
      // Nếu contract có renderingContract thì ưu tiên gọi ở đó
      if (typeof contract.methods.renderingContract === 'function') {
        const renderingAddr = await contract.methods.renderingContract().call();

        console.log('renderingAddr', renderingAddr);

        if (renderingAddr && renderingAddr !== '0x0000000000000000000000000000000000000000') {
          const renderingContract = new this.evmApi.api.eth.Contract(_ERC721_EXTENDED_ABI, renderingAddr);

          return await renderingContract.methods.tokenURI(tokenId).call();
        }
      }

      // Check ownerOf trước để tránh revert
      await contract.methods.ownerOf(tokenId).call();

      // Nếu không throw thì gọi tokenURI
      return await contract.methods.tokenURI(tokenId).call();
    } catch (e) {
      console.warn(`safeGetTokenURI: tokenId ${tokenId} không lấy được tokenURI`, e);

      return '';
    }
  }

  private parseTokenURI (tokenURI: string): string {
    if (!tokenURI) {
      return '';
    }

    // Case 1: JSON base64
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const jsonStr = atob(tokenURI.replace('data:application/json;base64,', ''));

      try {
        const obj = JSON.parse(jsonStr);

        return obj.image || '';
      } catch {
        return '';
      }
    }

    // Case 2: JSON utf-8 (data-uri text)
    if (tokenURI.startsWith('data:application/json;utf-8,')) {
      const jsonStr = decodeURIComponent(tokenURI.replace('data:application/json;utf-8,', ''));

      try {
        const obj = JSON.parse(jsonStr);

        return obj.image || '';
      } catch {
        return '';
      }
    }

    // Case 3: Image base64
    if (tokenURI.startsWith('data:image/')) {
      return tokenURI;
    }

    // Case 4: JSON text
    if (tokenURI.trim().startsWith('{')) {
      try {
        const obj = JSON.parse(tokenURI);

        return obj.image || '';
      } catch {
        return '';
      }
    }

    // Case 4: URL
    if (tokenURI.startsWith('http') || tokenURI.startsWith('ipfs://')) {
      return tokenURI;
    }

    // Case fallback
    return '';
  }

  private async getItemsByCollection (tokenInfo: _ChainAsset, collectionName: string | undefined, nftParams: HandleNftParams) {
    if (!this.evmApi || !this.evmApi.api) {
      console.error(`evmApi không được khởi tạo trên chain ${this.chain || 'unknown'}`);

      return;
    }

    if (!this.chain) {
      console.error('this.chain không được khởi tạo');

      return;
    }

    const smartContract = _getContractAddressOfToken(tokenInfo);
    const contract = new this.evmApi.api.eth.Contract(_ERC721_ABI, smartContract);
    let ownItem = false;
    let collectionImage: string | undefined;
    const nftOwnerMap: Record<string, string[]> = {};
    const MAX_TOKEN_ID_SCAN = 10000;
    const CONCURRENT_LIMIT = 5;
    const BATCH_SIZE = 200; // Giảm batch size để giảm khả năng revert
    const limit = pLimit(CONCURRENT_LIMIT);

    // Cache metadata và tokenId
    const metadataCache = new Map<string, any>();
    const tokenIdCache = new Map<string, number[]>(); // Cache tokenId theo địa chỉ

    // Kiểm tra hỗ trợ Multicall3
    const supportsMulticall = async (): Promise<boolean> => {
      try {
        const multicallContract = new this.evmApi.api.eth.Contract(MULTICALL_ABI, MULTICALL_ADDRESS);

        // Thử một lệnh gọi đơn giản để kiểm tra
        await multicallContract.methods.tryAggregate([]).call();

        return true;
      } catch (e) {
        console.warn(`Multicall3 không được hỗ trợ trên chain ${this.chain}:`, e);

        return false;
      }
    };

    // Kiểm tra hỗ trợ totalSupply
    const supportsTotalSupply = async (): Promise<number | null> => {
      try {
        const totalSupply = await contract.methods.totalSupply().call();

        return Number(totalSupply);
      } catch (e) {
        console.warn(`Contract ${smartContract} không hỗ trợ totalSupply trên chain ${this.chain}:`, e);

        return null;
      }
    };

    // Kiểm tra hỗ trợ tokenOfOwnerByIndex
    const supportsTokenOfOwnerByIndex = async (): Promise<boolean> => {
      try {
        await contract.methods.tokenOfOwnerByIndex('0x0000000000000000000000000000000000000000', 0).call();

        return true;
      } catch (e) {
        return false;
      }
    };

    // Lấy tokenId từ sự kiện Transfer
    const getTokenIdsFromEvents = async (address: string): Promise<number[] | null> => {
      try {
        const latestBlock = await this.evmApi.api.eth.getBlockNumber();
        const BLOCK_RANGE = 10000; // Giới hạn cho free tier
        const fromBlock = Math.max(0, latestBlock - BLOCK_RANGE);
        const events = await contract.getPastEvents('Transfer', {
          filter: { to: address },
          fromBlock,
          toBlock: 'latest'
        });
        const tokenIds = events.map((event) => Number(event.returnValues.tokenId)).filter((id) => id !== null);

        if (tokenIds.length > 0) {
          tokenIdCache.set(address, tokenIds); // Cache tokenId
        }

        return tokenIds;
      } catch (e) {
        console.warn(`Không thể lấy sự kiện Transfer cho địa chỉ ${address} trên chain ${this.chain}:`, e);

        return null;
      }
    };

    // Quét tokenId bằng ownerOf (Multicall3 hoặc riêng lẻ)
    const scanTokenIds = async (address: string, balance: number, maxTokenId: number): Promise<number[]> => {
      if (!this.evmApi || !this.evmApi.api) {
        console.error(`evmApi không được khởi tạo trên chain ${this.chain}`);

        return [];
      }

      if (tokenIdCache.has(address)) {
        return tokenIdCache.get(address)!.slice(0, balance);
      }

      const tokenIds: number[] = [];
      const useMulticall = await supportsMulticall();

      if (useMulticall) {
        // Sử dụng Multicall3
        const multicallContract = new this.evmApi.api.eth.Contract(MULTICALL_ABI, MULTICALL_ADDRESS);
        let currentId = 0;

        while (currentId < maxTokenId && tokenIds.length < balance) {
          const calls: { target: string; callData: string }[] = [];
          const batchIds: number[] = [];
          const endId = Math.min(currentId + BATCH_SIZE, maxTokenId);

          for (let i = currentId; i < endId; i++) {
            batchIds.push(i);
            const callData = contract.methods.ownerOf(i).encodeABI();

            calls.push({ target: smartContract, callData });
          }

          try {
            const returnData = await multicallContract.methods.tryAggregate(calls).call();

            returnData.forEach(({ returnData, success }: { success: boolean; returnData: string }, index: number) => {
              if (success) {
                try {
                  const owner = this.evmApi.api.eth.abi.decodeParameter('address', returnData) as string;

                  if (owner.toLowerCase() === address.toLowerCase()) {
                    tokenIds.push(batchIds[index]);
                  }
                } catch (e) {
                  // Bỏ qua lỗi decode
                }
              }
            });
          } catch (e) {
            console.warn(`Lỗi nghiêm trọng khi quét tokenId từ ${currentId} đến ${endId} trên chain ${this.chain}:`, e);
          }

          currentId += BATCH_SIZE;
        }
      } else {
        // Fallback: Gọi ownerOf riêng lẻ
        for (let tokenId = 0; tokenId < maxTokenId && tokenIds.length < balance; tokenId++) {
          try {
            const owner = await contract.methods.ownerOf(tokenId).call();

            if (owner.toLowerCase() === address.toLowerCase()) {
              tokenIds.push(tokenId);
            }
          } catch (e) {
            // Bỏ qua tokenId không hợp lệ
          }
        }
      }

      if (tokenIds.length > 0) {
        tokenIdCache.set(address, tokenIds);
      }

      return tokenIds;
    };

    // Lấy tokenURI bằng Multicall3 hoặc riêng lẻ
    const getTokenURIs = async (tokenIds: number[]): Promise<string[]> => {
      if (!this.evmApi || !this.evmApi.api) {
        console.error(`evmApi không được khởi tạo trên chain ${this.chain}`);

        return tokenIds.map(() => '');
      }

      const useMulticall = await supportsMulticall();


      if (useMulticall) {
        const multicallContract = new this.evmApi.api.eth.Contract(MULTICALL_ABI, MULTICALL_ADDRESS);
        const calls: { target: string; callData: string }[] = [];

        for (const tokenId of tokenIds) {
          const callData = contract.methods.tokenURI(tokenId).encodeABI();

          calls.push({ target: smartContract, callData });
        }

        try {
          const returnData = await multicallContract.methods.tryAggregate(calls).call();

          return returnData.map(({ returnData, success }: { success: boolean; returnData: string }) => {
            if (success) {
              try {
                const decoded = this.evmApi.api.eth.abi.decodeParameter('string', returnData) as string;

                return this.parseTokenURI(decoded);
              } catch {
                return '';
              }
            }

            return '';
          });
        } catch (e) {
          console.error(`Lỗi khi lấy tokenURIs trên chain ${this.chain}:`, e);

          return tokenIds.map(() => '');
        }
      } else {
        // Fallback: Gọi tokenURI riêng lẻ
        const tokenURIs: string[] = [];

        for (const tokenId of tokenIds) {
          try {
            console.log('tokenId', tokenId);
            const tokenURI = await this.safeGetTokenURI(contract, tokenId);

            console.log('tokenURI, tokenId', tokenURI, tokenId);
            const parsed = this.parseTokenURI(tokenURI);

            tokenURIs.push(parsed);
          } catch (e) {
            console.log('token uri catch......', e);
            tokenURIs.push('');
          }
        }

        return tokenURIs;
      }
    };

    const useTokenOfOwnerByIndex = await supportsTokenOfOwnerByIndex();
    const totalSupply = await supportsTotalSupply();

    console.log('useTokenOfOwnerByIndex', useTokenOfOwnerByIndex);
    console.log('totalSupply', totalSupply);
    const maxTokenId = totalSupply !== null ? Math.min(totalSupply, MAX_TOKEN_ID_SCAN) : MAX_TOKEN_ID_SCAN;

    console.log('maxTokenId', maxTokenId);

    await Promise.all(this.addresses.map((address) =>
      limit(async () => {
        if (!isEthereumAddress(address)) {
          return;
        }

        const nftIds: string[] = [];
        const balance = await contract.methods.balanceOf(address).call() as number;

        if (Number(balance) === 0) {
          return;
        }

        try {
          let tokenIds: number[] = [];

          if (useTokenOfOwnerByIndex) {
          // Sử dụng tokenOfOwnerByIndex
            for (let i = 0; i < balance; i++) {
              try {
                const tokenId = await contract.methods.tokenOfOwnerByIndex(address, i).call() as number;

                tokenIds.push(Number(tokenId));
              } catch (e) {
                console.warn(`Lỗi khi lấy tokenId thứ ${i} cho địa chỉ ${address} trên chain ${this.chain}:`, e);
              }
            }
          } else {
          // Thử lấy tokenId từ sự kiện Transfer
            const eventTokenIds = await getTokenIdsFromEvents(address);

            if (eventTokenIds && eventTokenIds.length > 0) {
              tokenIds = eventTokenIds.slice(0, balance);
            } else {
            // Fallback sang quét tokenId
              tokenIds = await scanTokenIds(address, balance, maxTokenId);
            }
          }

          console.log('tokenIds', tokenIds);

          const tokenURIs = await getTokenURIs(tokenIds);

          console.log('tokenURIs', tokenURIs);

          await Promise.all(tokenURIs.map(async (tokenURI, index) => {
            const tokenId = tokenIds[index];

            if (!tokenId || !tokenURI) {
              return;
            }

            const nftId = tokenId.toString();
            const detailUrl = this.parseUrl(tokenURI);

            nftIds.push(nftId);
            console.log('detailUrl', detailUrl);

            if (detailUrl) {
              try {
                let itemDetail: Record<string, any> | undefined;

                // Kiểm tra cache
                if (metadataCache.has(detailUrl)) {
                  itemDetail = metadataCache.get(detailUrl);
                } else {
                  const resp = await fetch(detailUrl);

                  itemDetail = (resp && resp.ok && await resp.json()) as Record<string, any>;

                  if (itemDetail) {
                    metadataCache.set(detailUrl, itemDetail);
                  }
                }

                if (!itemDetail) {
                  return;
                }

                const parsedItem = this.parseMetadata(itemDetail);

                console.log('parsedItem', parsedItem);

                parsedItem.collectionId = smartContract;
                parsedItem.id = nftId;
                parsedItem.owner = address;
                parsedItem.type = _AssetType.ERC721;
                parsedItem.originAsset = tokenInfo.slug;

                if (parsedItem) {
                  if (parsedItem.image) {
                    collectionImage = parsedItem.image;
                  }

                  nftParams.updateItem(this.chain, parsedItem, address);
                  ownItem = true;
                }
              } catch (e) {
                console.error(`Lỗi khi lấy metadata cho tokenId ${tokenId} trên chain ${this.chain}:`, e);
              }
            } else {
              // Nếu tokenURI là image trực tiếp (base64 hoặc link ảnh)
              const parsedItem = {
                collectionId: smartContract,
                id: nftId,
                owner: address,
                originAsset: tokenInfo.slug,
                image: tokenURI,
                chain: this.chain
              };

              collectionImage = tokenURI;
              nftParams.updateItem(this.chain, parsedItem, address);
              ownItem = true;
            }
          }));

          nftOwnerMap[address] = nftIds;
        } catch (e) {
          console.error(`Lỗi khi xử lý địa chỉ ${address} trên chain ${this.chain}:`, e);
        }
      })
    ));
    console.log('ownItem', ownItem);

    if (ownItem) {
      const nftCollection = {
        collectionId: smartContract,
        collectionName,
        image: collectionImage || undefined,
        chain: this.chain,
        originAsset: tokenInfo.slug
      } as NftCollection;

      console.log('nftCollection', nftCollection);

      nftParams.updateCollection(this.chain, nftCollection);
    }
  }

  async handleNfts (params: HandleNftParams): Promise<void> {
    if (!this.evmContracts || this.evmContracts.length === 0) {
      return;
    }

    console.log('this.evmContracts', this.evmContracts);

    await Promise.all(this.evmContracts.map(async (tokenInfo) => {
      return await this.getItemsByCollection(tokenInfo, tokenInfo.name, params);
    }));
  }

  public async fetchNfts (params: HandleNftParams): Promise<number> {
    try {
      await this.handleNfts(params);
    } catch (e) {
      return 0;
    }

    return 1;
  }
}
