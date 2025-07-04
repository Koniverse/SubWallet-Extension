// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountAuthType } from '@subwallet/extension-base/background/types';

export const BASE_SECOND_INTERVAL = 1000;
export const BASE_MINUTE_INTERVAL = 60 * BASE_SECOND_INTERVAL;
export const CRON_REFRESH_PRICE_INTERVAL = 30000;
export const CRON_AUTO_RECOVER_DOTSAMA_INTERVAL = 60000;
export const CRON_AUTO_RECOVER_WEB3_INTERVAL = 90000;
export const ACALA_REFRESH_CROWDLOAN_INTERVAL = 300000;
export const ASTAR_REFRESH_BALANCE_INTERVAL = 60000;
export const BITCOIN_REFRESH_BALANCE_INTERVAL = 600000;
export const SUB_TOKEN_REFRESH_BALANCE_INTERVAL = 60000;
export const CRON_REFRESH_NFT_INTERVAL = 7200000;
export const CRON_REFRESH_MKT_CAMPAIGN_INTERVAL = 15 * BASE_MINUTE_INTERVAL;
export const CRON_REFRESH_STAKING_REWARD_INTERVAL = 900000;
export const CRON_REFRESH_STAKING_REWARD_FAST_INTERVAL = 90000;
export const CRON_REFRESH_HISTORY_INTERVAL = 900000;
export const CRON_GET_API_MAP_STATUS = 10000;
export const CRON_REFRESH_CHAIN_STAKING_METADATA = 90000;
export const CRON_REFRESH_CHAIN_NOMINATOR_METADATA = 1800000;
export const CRON_RECOVER_HISTORY_INTERVAL = 30000;
export const CRON_SYNC_MANTA_PAY = 300000;
export const MANTA_PAY_BALANCE_INTERVAL = 30000;
export const BITTENSOR_REFRESH_STAKE_INFO = 30000;
export const BITTENSOR_REFRESH_STAKE_APY = 30000;
export const CRON_REFRESH_EARNING_REWARD_HISTORY_INTERVAL = 15 * BASE_MINUTE_INTERVAL;
export const CRON_LISTEN_AVAIL_BRIDGE_CLAIM = 1800000;

export const ALL_ACCOUNT_KEY = 'ALL';
export const ALL_NETWORK_KEY = 'all';
export const ALL_GENESIS_HASH = null;
export const IGNORE_GET_SUBSTRATE_FEATURES_LIST: string[] = ['astarEvm', 'ethereum', 'ethereum_goerli', 'binance', 'binance_test', 'boba_rinkeby', 'boba', 'bobabase', 'bobabeam'];
export const ALL_ACCOUNT_AUTH_TYPES: AccountAuthType[] = ['evm', 'substrate', 'ton'];

export const IGNORE_QR_SIGNER: string[] = [];

export const XCM_MIN_AMOUNT_RATIO = 1.2;
export const XCM_FEE_RATIO = 2;

export const GAS_PRICE_RATIO = 1 + (2 / 100);
export const MAX_COLLATERAL_AMOUNT = '5000000';
export const NETWORK_MULTI_GAS_FEE = ['*'];

export const ORDINAL_COLLECTION = '__Ordinal__';
export const ORDINAL_METHODS = ['drc-20', 'pol-20'];

export const PERMISSIONS_TO_REVOKE = ['eth_accounts'];

export const _SUPPORT_TOKEN_PAY_FEE_GROUP = {
  assetHub: ['paseo_assethub', 'westend_assethub', 'rococo_assethub', 'statemine', 'statemint'],
  hydration: ['hydradx_main', 'hydradx_rococo']
};

export const getSupportTokenPayFeeChain = () => {
  return Object.values(_SUPPORT_TOKEN_PAY_FEE_GROUP).flat();
};

export const isChainSupportTokenPayFee = (chainSlug: string): boolean => {
  if (!chainSlug) {
    console.error('You must provide chain slug!');

    return false;
  }

  return getSupportTokenPayFeeChain().includes(chainSlug);
};

export * from './blocked-actions';
export * from './environment';
export * from './signing';
export * from './staking';
export * from './storage';
export * from './remind-notification-time';
export * from './bitcoin';
