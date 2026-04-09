// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { _STAKING_CHAIN_GROUP, RELAY_HANDLER_DIRECT_STAKING_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import { BaseModal, MetaInfo } from '@subwallet/extension-web-ui/components';
import { VALIDATOR_DETAIL_MODAL } from '@subwallet/extension-web-ui/constants';
import { useGetChainPrefixBySlug } from '@subwallet/extension-web-ui/hooks';
import useTranslation from '@subwallet/extension-web-ui/hooks/common/useTranslation';
import { ThemeProps, ValidatorDataType } from '@subwallet/extension-web-ui/types';
import { Icon, ModalContext, Number, Tooltip } from '@subwallet/react-ui';
import { Info } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  onCancel?: () => void;
  validatorItem: ValidatorDataType;
  chain: string;
  maxPoolMembersValue?: number;
};

function Component (props: Props): React.ReactElement<Props> {
  const { chain, className, maxPoolMembersValue, onCancel, validatorItem } = props;
  const { address: validatorAddress,
    commission,
    decimals,
    expectedReturn: earningEstimated = '',
    identity: validatorName = '',
    isMissingInfo,
    minBond: minStake,
    nominatorCount,
    otherStake,
    ownStake,
    symbol, totalStake } = validatorItem;
  const { t } = useTranslation();

  const { inactiveModal } = useContext(ModalContext);

  const networkPrefix = useGetChainPrefixBySlug(chain);

  const isRelayChain = useMemo(() => {
    return RELAY_HANDLER_DIRECT_STAKING_CHAINS.includes(chain);
  }, [chain]);

  const isParaChain = useMemo(() => {
    return _STAKING_CHAIN_GROUP.para.includes(chain) || _STAKING_CHAIN_GROUP.amplitude.includes(chain);
  }, [chain]);

  const isBittensorChain = useMemo(() => {
    return chain === 'bittensor' || chain === 'bittensor_testnet';
  }, [chain]);

  const title = useMemo(() => {
    const label = getValidatorLabel(chain);

    switch (label) {
      case 'dApp':
        return t('ui.EARNING_VALIDATOR_DETAIL_MODAL.components.Modal.Earning.EarningValidatorDetailModal.dappDetails');
      case 'Collator':
        return t('ui.EARNING_VALIDATOR_DETAIL_MODAL.components.Modal.Earning.EarningValidatorDetailModal.collatorDetails');
      case 'Validator':
        return t('ui.EARNING_VALIDATOR_DETAIL_MODAL.components.Modal.Earning.EarningValidatorDetailModal.validatorDetails');
    }
  }, [t, chain]);

  const _onCancel = useCallback(() => {
    inactiveModal(VALIDATOR_DETAIL_MODAL);

    onCancel && onCancel();
  }, [inactiveModal, onCancel]);

  const ratePercent = useMemo(() => {
    const rate = maxPoolMembersValue && (nominatorCount / maxPoolMembersValue);

    if (rate !== undefined) {
      if (rate < 0.9) {
        return 'default';
      } else if (rate >= 0.9 && rate < 1) {
        return 'gold';
      } else {
        return 'danger';
      }
    }

    return undefined;
  }, [maxPoolMembersValue, nominatorCount]);

  return (
    <BaseModal
      className={className}
      id={VALIDATOR_DETAIL_MODAL}
      onCancel={_onCancel}
      title={title}
    >
      <MetaInfo
        hasBackgroundWrapper
        spaceSize={'xs'}
        valueColorScheme={'light'}
      >
        <MetaInfo.Account
          address={validatorAddress}
          label={t(getValidatorLabel(chain))}
          name={validatorName}
          networkPrefix={networkPrefix}
        />

        {/* <MetaInfo.Status */}
        {/*  label={t('ui.EARNING.components.Modal.Earning.ValidatorDetail.status')} */}
        {/*  statusIcon={StakingStatusUi[status].icon} */}
        {/*  statusName={StakingStatusUi[status].name} */}
        {/*  valueColorSchema={StakingStatusUi[status].schema} */}
        {/* /> */}
        {!isMissingInfo
          ? (
            <>
              <MetaInfo.Number
                decimals={decimals}
                label={t('ui.EARNING_VALIDATOR_DETAIL_MODAL.components.Modal.Earning.EarningValidatorDetailModal.minimumStakeRequired')}
                suffix={symbol}
                value={minStake}
                valueColorSchema={'even-odd'}
              />

              {totalStake !== '0' && (
                <MetaInfo.Number
                  decimals={decimals}
                  label={isBittensorChain ? t('ui.EARNING_VALIDATOR_DETAIL_MODAL.components.Modal.Earning.EarningValidatorDetailModal.totalStakeWeight') : t('ui.EARNING_VALIDATOR_DETAIL_MODAL.components.Modal.Earning.EarningValidatorDetailModal.totalStake')}
                  suffix={symbol}
                  value={totalStake}
                  valueColorSchema={'even-odd'}
                />
              )}

              <MetaInfo.Number
                decimals={decimals}
                label={
                  isBittensorChain
                    ? (
                      <Tooltip
                        placement='topLeft'
                        title={t('ui.EARNING_VALIDATOR_DETAIL_MODAL.components.Modal.Earning.EarningValidatorDetailModal.calculatedAs18OfTheRootStake')}
                      >
                        <span className={'__tooltip-label'}>
                          {t('ui.EARNING_VALIDATOR_DETAIL_MODAL.components.Modal.Earning.EarningValidatorDetailModal.rootWeight')}
                          <Icon phosphorIcon={Info} />
                        </span>
                      </Tooltip>
                    )
                    : t('ui.EARNING_VALIDATOR_DETAIL_MODAL.components.Modal.Earning.EarningValidatorDetailModal.ownStake')
                }
                suffix={symbol}
                value={ownStake}
                valueColorSchema='even-odd'
              />

              {otherStake !== '0' && (
                <MetaInfo.Number
                  decimals={decimals}
                  label={isBittensorChain ? t('ui.EARNING_VALIDATOR_DETAIL_MODAL.components.Modal.Earning.EarningValidatorDetailModal.subnetStake') : t('ui.EARNING_VALIDATOR_DETAIL_MODAL.components.Modal.Earning.EarningValidatorDetailModal.stakeFromOthers')}
                  suffix={symbol}
                  value={otherStake}
                  valueColorSchema={'even-odd'}
                />
              )}

              {earningEstimated > 0 && earningEstimated !== '' && (
                <MetaInfo.Number
                  label={t('ui.EARNING_VALIDATOR_DETAIL_MODAL.components.Modal.Earning.EarningValidatorDetailModal.estimatedApy')}
                  suffix={'%'}
                  value={earningEstimated}
                  valueColorSchema={'even-odd'}
                />
              )}

              <MetaInfo.Number
                label={t('ui.EARNING_VALIDATOR_DETAIL_MODAL.components.Modal.Earning.EarningValidatorDetailModal.commission')}
                suffix={'%'}
                value={commission}
                valueColorSchema={'even-odd'}
              />
            </>
          )
          : <MetaInfo.Default
            label={t('ui.EARNING_VALIDATOR_DETAIL_MODAL.components.Modal.Earning.EarningValidatorDetailModal.commission')}
          >
          N/A
          </MetaInfo.Default>
        }

        {!maxPoolMembersValue && (isParaChain || isRelayChain) &&
          <MetaInfo.Number
            label={t(isParaChain ? 'Delegator' : 'Nominator')}
            value={nominatorCount}
            valueColorSchema={'even-odd'}
          />}

        {
          !!maxPoolMembersValue && !!ratePercent && (isParaChain || isRelayChain) && (
            <MetaInfo.Default
              className={'__maximum-validator'}
              label={t(isParaChain ? 'Delegator' : 'Nominator')}
              labelAlign='top'
              valueColorSchema={`${ratePercent}`}
            >
              <Number
                decimal={0}
                value={nominatorCount}
              /> &nbsp;/&nbsp; <Number
                decimal={0}
                value={maxPoolMembersValue}
              />
            </MetaInfo.Default>
          )
        }
      </MetaInfo>
    </BaseModal>
  );
}

const EarningValidatorDetailModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.__maximum-validator .__value': {
      display: 'flex'
    },
    '.__tooltip-label': {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      gap: token.sizeXXS
    }
  });
});

export default EarningValidatorDetailModal;
