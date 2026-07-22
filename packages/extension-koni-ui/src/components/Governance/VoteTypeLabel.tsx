// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { governanceVoteIconMap } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  type: GovVoteType;
};

const Component = ({ className, type }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const labelMap = useMemo(() => ({
    [GovVoteType.AYE]: t('ui.GOVERNANCE.components.Governance.VoteTypeLabel.aye'),
    [GovVoteType.NAY]: t('ui.GOVERNANCE.components.Governance.VoteTypeLabel.nay'),
    [GovVoteType.ABSTAIN]: t('ui.GOVERNANCE.components.Governance.VoteTypeLabel.abstain'),
    [GovVoteType.SPLIT]: t('ui.GOVERNANCE.components.Governance.VoteTypeLabel.split')
  }), [t]);

  return (
    <div className={CN(className, `-type-${type}`)}>
      <Icon
        className={'__icon'}
        phosphorIcon={governanceVoteIconMap[type]}
        weight={'fill'}
      />

      <div className='__type-label'>
        {labelMap[type]}
      </div>
    </div>
  );
};

const VoteTypeLabel = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'inline-flex',
    gap: token.sizeXXS,

    '.__icon': {
      fontSize: 16
    },

    '&.-type-aye': {
      color: token['green-7']
    },

    '&.-type-nay': {
      color: token['red-7']
    },

    '&.-type-abstain, &.-type-split': {
      color: token.colorTextLight2
    }
  };
});

export default VoteTypeLabel;
