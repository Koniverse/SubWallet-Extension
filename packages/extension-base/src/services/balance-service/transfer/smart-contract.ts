// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { getERC20Contract } from '@subwallet/extension-base/koni/api/contract-handler/evm/web3';
import { _ERC721_ABI } from '@subwallet/extension-base/koni/api/contract-handler/utils';
import { getPSP34ContractPromise } from '@subwallet/extension-base/koni/api/contract-handler/wasm';
import { getWasmContractGasLimit } from '@subwallet/extension-base/koni/api/contract-handler/wasm/utils';
import { EVM_REFORMAT_DECIMALS } from '@subwallet/extension-base/services/chain-service/constants';
import { _EvmApi, _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { EvmEIP1559FeeOption, EvmFeeInfo, FeeInfo, TransactionFee } from '@subwallet/extension-base/types';
import { combineEthFee } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { t } from 'i18next';
import { TransactionConfig } from 'web3-core';
import { ContractSendMethod } from 'web3-eth-contract';

interface TransferEvmProps extends TransactionFee {
  chain: string;
  from: string;
  feeInfo: FeeInfo;
  to: string;
  transferAll: boolean;
  value: string;
  evmApi: _EvmApi;
  fallbackFee?: boolean;
}

// hot fix gas settings for Energy Web Chain
const gasSettingsForEWC = {
  gasLimit: 4900000,
  maxFeePerGas: '10000000'
};

export async function getEVMTransactionObject ({ chain,
  evmApi,
  fallbackFee,
  feeCustom: _feeCustom,
  feeInfo: _feeInfo,
  feeOption,
  from,
  to,
  transferAll,
  value }: TransferEvmProps): Promise<[TransactionConfig, string, string]> {
  const isEnergyWebChain = chain === 'energy_web_chain'; // hot fix gas settings for Energy Web Chain
  const feeCustom = _feeCustom as EvmEIP1559FeeOption;
  const feeInfo = _feeInfo as EvmFeeInfo;
  const feeCombine = combineEthFee(feeInfo, feeOption, feeCustom);
  let errorOnEstimateFee = '';

  if (isEnergyWebChain) {
    feeCombine.maxFeePerGas = gasSettingsForEWC.maxFeePerGas;
  }

  const transactionObject = {
    to: to,
    value: value,
    from: from,
    ...feeCombine
  } as TransactionConfig;

  let gasLimit: number;

  if (isEnergyWebChain) {
    gasLimit = gasSettingsForEWC.gasLimit;
  } else {
    gasLimit = await evmApi.api.eth.estimateGas(transactionObject).catch((e: Error) => {
      console.log('Cannot estimate fee with native transfer on', chain, e);

      if (fallbackFee) {
        errorOnEstimateFee = e.message;

        return 21000;
      } else {
        throw Error('Unable to estimate fee for this transaction. Edit fee and try again.');
      }
    });
  }

  transactionObject.gas = gasLimit;

  let estimateFee: BigN;

  if (feeCombine.maxFeePerGas) {
    const maxFee = new BigN(feeCombine.maxFeePerGas);

    estimateFee = maxFee.multipliedBy(gasLimit);
  } else {
    estimateFee = new BigN(feeCombine.gasPrice || '0').multipliedBy(gasLimit);
  }

  transactionObject.value = transferAll ? new BigN(value).minus(estimateFee).toString() : value;

  if (EVM_REFORMAT_DECIMALS.acala.includes(chain)) {
    const numberReplace = 18 - 12;

    transactionObject.value = transactionObject.value.substring(0, transactionObject.value.length - 6) + new Array(numberReplace).fill('0').join('');
  }

  return [transactionObject, transactionObject.value.toString(), errorOnEstimateFee];
}

export async function getERC20TransactionObject (
  { assetAddress,
    chain,
    evmApi,
    fallbackFee,
    feeCustom: _feeCustom,
    feeInfo: _feeInfo,
    feeOption,
    from,
    to,
    transferAll,
    value }: TransferERC20Props
): Promise<[TransactionConfig, string, string]> {
  const isEnergyWebChain = chain === 'energy_web_chain'; // hot fix gas settings for Energy Web Chain
  const erc20Contract = getERC20Contract(assetAddress, evmApi);
  const feeCustom = _feeCustom as EvmEIP1559FeeOption;

  let freeAmount = new BigN(0);
  let transferValue = value;
  let errorOnEstimateFee = '';

  if (transferAll) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const bal = await erc20Contract.methods.balanceOf(from).call() as string;

    freeAmount = new BigN(bal || '0');
    transferValue = freeAmount.toFixed(0) || '0';
  }

  function generateTransferData (to: string, transferValue: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    return erc20Contract.methods.transfer(to, transferValue).encodeABI() as string;
  }

  const transferData = generateTransferData(to, transferValue);
  let gasLimit: number;

  if (isEnergyWebChain) {
    gasLimit = gasSettingsForEWC.gasLimit;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    gasLimit = await (erc20Contract.methods.transfer(to, transferValue) as ContractSendMethod).estimateGas({ from })
      .catch((e: Error) => {
        console.log('Cannot estimate fee with token contract', assetAddress, chain, e);

        if (fallbackFee) {
          errorOnEstimateFee = e.message;

          return 70000;
        } else {
          throw Error('Unable to estimate fee for this transaction. Edit fee and try again.');
        }
      });
  }

  const feeInfo = _feeInfo as EvmFeeInfo;
  const feeCombine = combineEthFee(feeInfo, feeOption, feeCustom);

  if (isEnergyWebChain) {
    feeCombine.maxFeePerGas = gasSettingsForEWC.maxFeePerGas;
  }

  const transactionObject = {
    gas: gasLimit,
    from,
    value: '0',
    to: assetAddress,
    data: transferData,
    ...feeCombine
  } as TransactionConfig;

  if (transferAll) {
    transferValue = freeAmount.toFixed(0);
    transactionObject.data = generateTransferData(to, transferValue);
  }

  return [transactionObject, transferValue, errorOnEstimateFee];
}

interface TransferERC20Props extends TransactionFee {
  assetAddress: string;
  chain: string;
  evmApi: _EvmApi;
  from: string;
  feeInfo: FeeInfo;
  to: string;
  transferAll: boolean;
  value: string;
  fallbackFee?: boolean;
}

export async function getERC721Transaction (
  web3Api: _EvmApi,
  chain: string,
  contractAddress: string,
  senderAddress: string,
  recipientAddress: string,
  tokenId: string,
  _feeInfo: FeeInfo): Promise<TransactionConfig> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const contract = new web3Api.api.eth.Contract(_ERC721_ABI, contractAddress);

  let gasLimit: number;

  try {
    [gasLimit] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      contract.methods.safeTransferFrom(senderAddress, recipientAddress, tokenId).estimateGas({ from: senderAddress }) as number
    ]);
  } catch (e) {
    const error = e as Error;

    if (error.message.includes('transfer to non ERC721Receiver implementer')) {
      error.message = t('bg.BALANCE.services.service.balance.transfer.smartContract.nftNotSupportedOnRecipient');
    }

    throw error;
  }

  const feeInfo = _feeInfo as EvmFeeInfo;
  const feeCombine = combineEthFee(feeInfo);

  return {
    from: senderAddress,
    gas: gasLimit,
    to: contractAddress,
    value: '0x00',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    data: contract.methods.safeTransferFrom(senderAddress, recipientAddress, tokenId).encodeABI(),
    ...feeCombine
  };
}

const mustFormatNumberReg = /^-?[0-9][0-9,.]+$/;

export async function getPSP34TransferExtrinsic (substrateApi: _SubstrateApi, senderAddress: string, recipientAddress: string, params: Record<string, any>) {
  const contractAddress = params.contractAddress as string;
  const onChainOption = params.onChainOption as Record<string, string>;

  for (const [key, value] of Object.entries(onChainOption)) {
    if (mustFormatNumberReg.test(value)) {
      onChainOption[key] = value.replaceAll(',', '');
    }
  }

  try {
    const contractPromise = getPSP34ContractPromise(substrateApi.api, contractAddress);
    // @ts-ignore
    const gasLimit = await getWasmContractGasLimit(substrateApi.api, senderAddress, 'psp34::transfer', contractPromise, {}, [recipientAddress, onChainOption, {}]);

    // @ts-ignore
    return contractPromise.tx['psp34::transfer']({ gasLimit }, recipientAddress, onChainOption, {});
  } catch (e) {
    console.debug(e);

    return null;
  }
}
