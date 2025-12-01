// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CRON_REFRESH_MULTISIG_PENDING_TX_INTERVAL } from '@subwallet/extension-base/constants';
import { CronServiceInterface, ServiceStatus } from '@subwallet/extension-base/services/base/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { EventService } from '@subwallet/extension-base/services/event-service';

// todo: deploy online
const MULTISIG_SUPPORTED_CHAINS = ['statemint', 'statemine', 'paseo_assethub', 'paseoTest'];

export class MultisigService implements CronServiceInterface {
  status: ServiceStatus;
  private refreshPendingMultisigTimeout: NodeJS.Timeout | undefined;

  constructor (
    private readonly eventService: EventService,
    private readonly chainService: ChainService,
    private readonly cronInterval: number = CRON_REFRESH_MULTISIG_PENDING_TX_INTERVAL
  ) {
    this.status = ServiceStatus.NOT_INITIALIZED;
  }

  async init (): Promise<void> {
    this.status = ServiceStatus.INITIALIZING;

    await this.eventService.waitAccountReady;

    this.status = ServiceStatus.INITIALIZED;

    await this.start();
  }

  async start (): Promise<void> {
    if (this.status === ServiceStatus.STARTED) {
      return;
    }

    try {
      this.status = ServiceStatus.STARTING;
      await this.startCron();
      this.status = ServiceStatus.STARTED;
    } catch (error) {
      console.error('Failed to start Multisig Service', error);
    }
  }

  async startCron (): Promise<void> {
    this.cronFetchPendingMultisigTransactions();

    return Promise.resolve();
  }

  async stop (): Promise<void> {
    try {
      this.status = ServiceStatus.STOPPING;
      await this.stopCron();
      this.status = ServiceStatus.STOPPED;
    } catch (error) {
      console.error('Failed to stop Multisig Service', error);
    }
  }

  stopCron (): Promise<void> {
    clearTimeout(this.refreshPendingMultisigTimeout);

    return Promise.resolve(undefined);
  }

  async fetchPendingMultisigTxs (): Promise<void> {
    // TODO: implement blockchain fetch logic
    const multisigAddresses: string[] = ['1627ti7gKnn5aTp7a7SUVsgnM9wE6BCNw6CgCzKiVeJz5DDA']; // todo: getAllMultisigAddresses this.keyringService.context.getAllMultisigAddresses();

    if (!multisigAddresses.length) {
      return;
    }

    // Todo: for each address
    const multisigAddress = multisigAddresses[0];

    for (const chain of MULTISIG_SUPPORTED_CHAINS) {
      const substrateApi = await this.chainService.getSubstrateApi(chain).isReady();

      const mt = await substrateApi.multisig.multisigs.entries(address);
    }

    return Promise.resolve();
  }

  private cronFetchPendingMultisigTransactions () {
    clearTimeout(this.refreshPendingMultisigTimeout);

    this.fetchPendingMultisigTxs().catch((e) => console.error('Failed to fetch pending multisig transactions', e));
    this.refreshPendingMultisigTimeout = setTimeout(this.cronFetchPendingMultisigTransactions.bind(this), this.cronInterval);
  }
}
