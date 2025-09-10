// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createSlice, PayloadAction } from '@reduxjs/toolkit/dist';
import { GovVotingInfo } from '@subwallet/extension-base/services/open-gov/interface';
import { GovernanceStore, ReduxStatus } from '@subwallet/extension-koni-ui/stores/types';

const initialState: GovernanceStore = {
  reduxStatus: ReduxStatus.INIT,
  govLockedInfos: []
};

const governanceSlice = createSlice({
  name: 'openGov',
  initialState,
  reducers: {
    updateGovLockedInfo (state, action: PayloadAction<GovVotingInfo[]>): GovernanceStore {
      return {
        ...state,
        govLockedInfos: action.payload,
        reduxStatus: ReduxStatus.READY
      };
    }
  }
});

export const { updateGovLockedInfo } = governanceSlice.actions;

export default governanceSlice.reducer;
