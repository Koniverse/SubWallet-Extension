// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CircleHalf, ThumbsDown, ThumbsUp } from 'phosphor-react';
import {PhosphorIcon} from "@subwallet/extension-koni-ui/types";

const VOTE_MAP: Record<GovVoteType, { icon: PhosphorIcon; label: string; className: string }> = {
  [GovVoteType.AYE]: {
    icon: ThumbsUp,
    label: 'Aye:',
    className: '-aye'
  },
  [GovVoteType.NAY]: {
    icon: ThumbsDown,
    label: 'Nay:',
    className: '-nay'
  },
  [GovVoteType.ABSTAIN]: {
    icon: CircleHalf,
    label: 'Abstain',
    className: '-abstain'
  },
  [GovVoteType.SPLIT]: {
    icon: CircleHalf,
    label: 'Split',
    className: '-split'
  }
};

const VoteMetaInfo = ({ type }: { type: GovVoteType }) {
  const { className, icon, label } = VOTE_MAP[type];
  const { t } = useTranslation();

  return (
    <MetaInfo.Default
      label={
        <>
          <Icon
            className={CN('voting-stats__icon', className)}
            customSize={'16px'}
            phosphorIcon={icon}
            weight={'fill'}
          />
          <div className={CN('voting-stats__label', className)}>
            {t(label)}
          </div>
        </>
      }
    />
  );
}

export default VoteMetaInfo;
