// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { BittensorRootClaimType, RequestChangeBittensorRootClaimType } from '@subwallet/extension-base/types';
import { CHANGE_BITTENSOR_ROOT_CLAIM_TYPE_TRANSACTION, DEFAULT_CHANGE_BITTENSOR_ROOT_CLAIM_TYPE_PARAMS } from '@subwallet/extension-koni-ui/constants';
import { useHandleSubmitTransaction, usePreCheckAction } from '@subwallet/extension-koni-ui/hooks';
import { changeBittensorRootClaimType } from '@subwallet/extension-koni-ui/messaging';
import Transaction from '@subwallet/extension-koni-ui/Popup/Transaction/Transaction';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { BackgroundIcon, Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import { GlobalToken } from '@subwallet/react-ui/es/theme/interface';
import { ArrowClockwise, ArrowsLeftRight, CheckCircle, IconProps, LockKey, X } from 'phosphor-react';
import React, { Context, ForwardedRef, forwardRef, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { ThemeContext } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps & {
  modalId: string;
  bittensorRootClaimType: BittensorRootClaimType;
  poolSlug: string;
  address: string;
  chain: string;
};

const ClaimOptionCard = ({ description, isIconFilled = false, phosphorIcon, showCheck = false, title, token }:
{ title: string;
  description: React.ReactNode;
  phosphorIcon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>
  >;
  token: GlobalToken;
  showCheck?: boolean;
  isIconFilled?: boolean
}) => {
  return (
    <div className={`claim-option-item ${showCheck ? 'active' : ''}`}>
      <div className='claim-option-icon'>
        <BackgroundIcon
          backgroundColor={showCheck ? '#2DA73F' : token['geekblue-6']}
          iconColor={token.colorWhite}
          phosphorIcon={phosphorIcon}
          size={'sm'}
          weight={isIconFilled ? 'fill' : 'regular'}
        />
      </div>

      <div className='claim-option-content'>
        <div className='claim-option-header'>
          <span className='claim-option-title'>{title}</span>

          {showCheck && (
            <Icon
              className='claim-option-check'
              phosphorIcon={CheckCircle}
              size='sm'
              weight='fill'
            />
          )}
        </div>

        <div className='claim-option-description'>{description}</div>
      </div>
    </div>
  );
};

const Component = (props: Props, ref: ForwardedRef<any>) => {
  const { address, bittensorRootClaimType, chain, className = '', modalId, poolSlug } = props;
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const isSwapOptions = useMemo(() => bittensorRootClaimType === 'Swap', [bittensorRootClaimType]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [, setClaimAvailBridgeStorage] = useLocalStorage(CHANGE_BITTENSOR_ROOT_CLAIM_TYPE_TRANSACTION, DEFAULT_CHANGE_BITTENSOR_ROOT_CLAIM_TYPE_PARAMS);
  const { onError, onSuccess } = useHandleSubmitTransaction();
  const onPreCheck = usePreCheckAction(address);

  const onCancel = useCallback(() => {
    setClaimAvailBridgeStorage(DEFAULT_CHANGE_BITTENSOR_ROOT_CLAIM_TYPE_PARAMS);
    inactiveModal(modalId);
  }, [inactiveModal, modalId, setClaimAvailBridgeStorage]);

  const onChangeRootClaimType = useCallback(() => {
    setSubmitLoading(true);

    const submitData: RequestChangeBittensorRootClaimType = {
      chain,
      address,
      slug: poolSlug,
      bittensorRootClaimType: bittensorRootClaimType === 'Swap' ? 'Keep' : 'Swap'
    };

    changeBittensorRootClaimType(submitData)
      .then(onSuccess)
      .catch(onError)
      .finally(() => {
        setSubmitLoading(false);
        inactiveModal(modalId);
      });
  }, [chain, address, poolSlug, bittensorRootClaimType, onError, onSuccess, inactiveModal, modalId]);

  return (
    <SwModal
      className={`${className}`}
      closeIcon={
        <Icon
          phosphorIcon={X}
          size='md'
        />
      }
      footer={
        <Button
          block
          className='__right-button'
          icon={
            <Icon
              phosphorIcon={ArrowClockwise}
              weight='fill'
            />
          }
          loading={submitLoading}
          onClick={onPreCheck(onChangeRootClaimType, ExtrinsicType.CHANGE_BITTENSOR_ROOT_CLAIM_TYPE)}
        >
          {t('ui.EARNING.components.Modal.Earning.BittensorClaimRewardType.submit')}
        </Button>
      }
      id={modalId}
      onCancel={onCancel}
      title={t('ui.EARNING.components.Modal.Earning.BittensorClaimRewardType.title')}
    >
      <div className='claim-rewards-modal__description'>
        {t('ui.EARNING.components.Modal.Earning.BittensorClaimRewardType.description')}
      </div>
      <div className='claim-rewards-modal__options'>
        <ClaimOptionCard
          description={t('ui.EARNING.components.Modal.Earning.BittensorClaimRewardType.swapCardDescription')}
          phosphorIcon={ArrowsLeftRight}
          showCheck={isSwapOptions}
          title='Swap'
          token={token}
        />

        <ClaimOptionCard
          description={t('ui.EARNING.components.Modal.Earning.BittensorClaimRewardType.keepCardDescription')}
          isIconFilled={true}
          phosphorIcon={LockKey}
          showCheck={!isSwapOptions}
          title='Keep'
          token={token}
        />
      </div>
    </SwModal>
  );
};

const Wrapper = (props: Props, ref: ForwardedRef<any>) => {
  return (
    <Transaction
      modalContent={true}
      modalId={props.modalId}
      transactionType={ExtrinsicType.CHANGE_BITTENSOR_ROOT_CLAIM_TYPE}
    >
      <Component
        {...props}
      />
    </Transaction>
  );
};

const EarningBittensorClaimRewardTypeModal = styled(forwardRef(Wrapper))<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-header': {
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingSM
    },

    '.ant-sw-modal-body': {
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 0
    },

    '.claim-rewards-modal__description': {
      textAlign: 'center',
      lineHeight: token.lineHeightHeading6,
      color: token.colorTextTertiary,
      fontSize: 12
    },

    '.ant-sw-modal-footer': {
      display: 'flex',
      gap: token.sizeXS,
      borderTop: 0
    },

    '.claim-rewards-modal__options': {
      marginTop: token.margin,
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeSM
    },

    '.claim-option-item': {
      backgroundColor: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      padding: `${token.padding}px ${token.paddingSM}px`,
      display: 'flex',
      flexDirection: 'row',
      gap: token.sizeSM
    },

    '.claim-option-item.active': {
      border: `1px solid ${token.colorSecondary}`
    },

    '.claim-option-icon': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    },

    '.claim-option-content': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeXS,
      flex: 1
    },

    '.claim-option-header': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },

    '.claim-option-title': {
      fontSize: token.fontSizeHeading5,
      lineHeight: '24px',
      fontWeight: 600
    },

    '.claim-option-description': {
      fontSize: 12,
      lineHeight: '20px',
      color: token.colorTextDescription,
      fontWeight: 500
    },

    '.claim-option-check': {
      color: token.colorSuccess
    }
  };
});

export default EarningBittensorClaimRewardTypeModal;
