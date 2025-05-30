// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { YieldPoolInfo, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { AccountInfoPart } from './AccountInfoPart';
import { NominationInfoPart } from './NominationInfoPart';
import { SelectedValidatorInfoPart } from './SelectedValidatorInfoPart';

type Props = ThemeProps & {
  compound: YieldPositionInfo;
  list: YieldPositionInfo[];
  poolInfo: YieldPoolInfo;
  inputAsset: _ChainAsset;
};

function Component ({ className, compound, inputAsset, list, poolInfo }: Props) {
  const { type } = compound;
  const isValidator = useMemo(() => [YieldPoolType.NATIVE_STAKING, YieldPoolType.SUBNET_STAKING].includes(type), [type]);

  return (
    <div
      className={CN(className)}
    >
      <AccountInfoPart
        compound={compound}
        inputAsset={inputAsset}
        list={list}
        poolInfo={poolInfo}
      />
      {isValidator
        ? <SelectedValidatorInfoPart
          compound={compound}
          inputAsset={inputAsset}
          poolInfo={poolInfo}
        />
        : <NominationInfoPart
          compound={compound}
          inputAsset={inputAsset}
          poolInfo={poolInfo}
        />}
    </div>
  );
}

export const AccountAndNominationInfoPart = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  borderRadius: token.borderRadiusLG,
  backgroundColor: token.colorBgSecondary
}));
