// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EARNING_CONSTITUENTS_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useCreateGetSubnetStakingTokenName, useSelector } from '@subwallet/extension-koni-ui/hooks';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getAssetDisplayName } from '@subwallet/extension-koni-ui/utils';
import { Logo, ModalContext, SwModal } from '@subwallet/react-ui';
import React, { useCallback, useContext, useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  constituents: string[];
};

function Component (props: Props): React.ReactElement<Props> {
  const { className, constituents } = props;
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const getSubnetStakingTokenName = useCreateGetSubnetStakingTokenName();
  const assetRegistryMap = useSelector((state) => state.assetRegistry.assetRegistry);

  const assetRegistryLowerMap = useMemo(() => {
    const rs: Record<string, (typeof assetRegistryMap)[string]> = {};

    Object.entries(assetRegistryMap).forEach(([key, value]) => {
      rs[key.toLowerCase()] = value;
    });

    return rs;
  }, [assetRegistryMap]);

  const constituentsData = useMemo(() => {
    return constituents.map((item) => {
      const netuid = Number(item);
      const token = Number.isNaN(netuid) ? undefined : getSubnetStakingTokenName('bittensor', netuid);
      const subnetAsset = token ? assetRegistryLowerMap[token.toLowerCase()] : undefined;
      const netuidText = Number.isNaN(netuid) ? item : String(netuid);
      const shortLabel = getAssetDisplayName(subnetAsset, `SN${netuidText}`);

      return {
        key: `${item}`,
        netuid: netuidText,
        shortLabel,
        token
      };
    });
  }, [assetRegistryLowerMap, constituents, getSubnetStakingTokenName]);

  const onCloseConstituentsModal = useCallback(() => {
    inactiveModal(EARNING_CONSTITUENTS_MODAL);
  }, [inactiveModal]);

  return (
    <SwModal
      className={className}
      id={EARNING_CONSTITUENTS_MODAL}
      onCancel={onCloseConstituentsModal}
      title={t('ui.EARNING.components.Modal.Earning.EarningConstituentsModal.constituents')}
    >
      <div className={'__constituents-list'}>
        {constituentsData.map((item) => (
          <div
            className={'__constituent-item'}
            key={item.key}
          >
            <div className={'__constituent-left'}>
              <Logo
                className='__item-logo'
                isShowSubLogo={false}
                network={'bittensor'}
                shape='circle'
                size={24}
                token={item.token}
              />
              <span className={'__constituent-name'}>{item.shortLabel}</span>
            </div>
            <span className={'__constituent-netuid'}>{item.netuid.padStart(2, '0')}</span>
          </div>
        ))}
      </div>
    </SwModal>
  );
}

const EarningConstituentsModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.__constituents-list': {
      background: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      padding: token.paddingSM,
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeSM
    },

    '.__constituent-item': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: token.sizeSM
    },

    '.__constituent-left': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXS,
      minWidth: 0
    },

    '.__constituent-name': {
      color: token.colorTextTertiary,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },

    '.__constituent-netuid': {
      minWidth: 34,
      textAlign: 'center',
      borderRadius: token.borderRadiusSM,
      padding: '2px 8px',
      background: 'rgba(217, 217, 217, 0.1)',
      color: token.colorTextLight2,
      fontSize: token.fontSizeSM,
      fontWeight: token.headingFontWeight
    }
  });
});

export default EarningConstituentsModal;
