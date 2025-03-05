// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { IMigration } from '../databases';
import BaseStore from './BaseStore';

export default class MigrationStore extends BaseStore<IMigration> {
  async hasRunScript (key: string): Promise<boolean> {
    const rs = await this.table.where('key').equals(key).first();

    return !!rs;
  }
}
