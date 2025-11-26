// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { BittensorRootClaimType, RequestChangeBittensorRootClaimType } from '@subwallet/extension-base/types';
import { TransactionContext } from '@subwallet/extension-koni-ui/contexts/TransactionContext';
import { useHandleSubmitTransaction, usePreCheckAction } from '@subwallet/extension-koni-ui/hooks';
import { changeBittensorRootClaimType } from '@subwallet/extension-koni-ui/messaging';
import Transaction from '@subwallet/extension-koni-ui/Popup/Transaction/Transaction';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { BackgroundIcon, Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import { ArrowClockwise, ArrowsLeftRight, CheckCircle, IconProps, LockKey, X } from 'phosphor-react';
import React, { Context, ForwardedRef, forwardRef, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeContext } from 'styled-components';

type Props = ThemeProps & {
  modalId: string;
  rootClaimType: BittensorRootClaimType;
  slug: string;
  address: string;
  chain: string;
};

const Component = (props: Props, ref: ForwardedRef<any>) => {
  const { address, chain, className = '', modalId, rootClaimType, slug } = props;
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const isSwapOptions = useMemo(() => rootClaimType === 'Swap', [rootClaimType]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { onError, onSuccess } = useHandleSubmitTransaction();
  const onPreCheck = usePreCheckAction(address);
  const navigate = useNavigate();

  const ClaimOptionCard = ({ description, isIconFilled = false, phosphorIcon, showCheck = false, title }:
  { title: string;
    description: React.ReactNode;
    phosphorIcon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>
    >;
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

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal, modalId]);

  const onDone = useCallback(
    (extrinsicHash: string) => {
      navigate(`/transaction-done/${address}/${chain}/${extrinsicHash}`, { replace: true });
    },
    [navigate, address, chain]
  );

  const onChangeRootClaimType = useCallback(() => {
    setSubmitLoading(true);

    const submitData: RequestChangeBittensorRootClaimType = {
      chain,
      address,
      slug,
      rootClaimType: rootClaimType === 'Swap' ? 'Keep' : 'Swap'
    };

    console.log('submitData', submitData);

    changeBittensorRootClaimType(submitData)
      .then((res) => {
        onSuccess(res);
        const hash = res?.extrinsicHash;

        if (hash) {
          onDone(hash);
        }
      })
      .catch(onError)
      .finally(() => {
        setSubmitLoading(false);
        inactiveModal(modalId);
      });
  }, [chain, address, slug, rootClaimType, onError, onSuccess, onDone, inactiveModal, modalId]);

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
        />

        <ClaimOptionCard
          description={t('ui.EARNING.components.Modal.Earning.BittensorClaimRewardType.keepCardDescription')}
          isIconFilled={true}
          phosphorIcon={LockKey}
          showCheck={!isSwapOptions}
          title='Keep'
        />
      </div>
    </SwModal>
  );
};

const EarningBittensorClaimRewardTypeModal = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
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
