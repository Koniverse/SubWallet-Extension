// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVotingInfo, UnlockingReferendaData } from '@subwallet/extension-base/services/open-gov/interface';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { AccountProxyAvatar, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { BN_ZERO, DEFAULT_GOV_UNLOCK_VOTE_PARAMS, GOV_UNLOCK_VOTE_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { useGetChainPrefixBySlug, useGetNativeTokenBasicInfo, useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { useLocalStorage } from '@subwallet/extension-koni-ui/hooks/common/useLocalStorage';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { findAccountByAddress, getTransactionFromAccountProxyValue, toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import BigN, { BigNumber } from 'bignumber.js';
import CN from 'classnames';
import { CaretLeft, CaretRight, Info } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router';
import Slider, { CustomArrowProps, Settings } from 'react-slick';
import styled from 'styled-components';

type Props = ThemeProps & {
  govLockedInfos: GovVotingInfo[];
  chain: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NextArrow = ({ currentSlide, slideCount, ...props }: CustomArrowProps) => (
  <div {...props}>
    <div className={'__right-arrow'}>
      <div className={'__circle-icon'}>
        <Icon
          customSize={'20px'}
          phosphorIcon={CaretRight}
        />
      </div>
    </div>
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PrevArrow = ({ currentSlide, slideCount, ...props }: CustomArrowProps) => (
  <div {...props}>
    <div className={'__left-arrow'}>
      <div className={'__circle-icon'}>
        <Icon
          customSize={'20px'}
          phosphorIcon={CaretLeft}
        />
      </div>
    </div>
  </div>
);

const calculateTimeRemaining = (timestamp: number): string => {
  const diffMs = timestamp - Date.now();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  return diffMs <= 0
    ? ''
    : diffDays > 0
      ? `${diffDays}d ${diffHrs % 24}h`
      : diffHrs > 0
        ? `${diffHrs}h ${diffMins % 60}m`
        : `${diffMins}m ${diffSecs % 60}s`;
};

const UNLOCKING_MODAL_ID = 'unlocking-modal';

function Component ({ chain, className, govLockedInfos }: Props) {
  const { t } = useTranslation();

  const { accounts, isAllAccount } = useSelector((state) => state.accountState);
  const networkPrefix = useGetChainPrefixBySlug(chain);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);
  const { currentAccountProxy } = useSelector((state) => state.accountState);
  const fromAccountProxy = getTransactionFromAccountProxyValue(currentAccountProxy);
  const [, setGovUnlockStorage] = useLocalStorage(GOV_UNLOCK_VOTE_TRANSACTION, DEFAULT_GOV_UNLOCK_VOTE_PARAMS);
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const [unlockingModalData, setUnlockingModalData] = React.useState<UnlockingReferendaData[]>([]);
  const navigate = useNavigate();

  const sliderSettings: Settings = useMemo(() => {
    return {
      dots: false,
      infinite: false,
      speed: 500,
      centerPadding: '22px',
      centerMode: true,
      slidesToShow: 1,
      nextArrow: <NextArrow />,
      prevArrow: <PrevArrow />
    };
  }, []);

  const onCancelUnlockingModal = useCallback(() => {
    inactiveModal(UNLOCKING_MODAL_ID);
    setUnlockingModalData([]);
  }, [inactiveModal]);

  const onShowUnlockingModal = useCallback((item: UnlockingReferendaData[]) => {
    return () => {
      setUnlockingModalData(item);
      activeModal(UNLOCKING_MODAL_ID);
    };
  }, [activeModal]);

  const renderAccount = useCallback(
    (item: GovVotingInfo) => {
      const account = findAccountByAddress(accounts, item.address);

      return (
        <>
          <AccountProxyAvatar
            size={24}
            value={account?.proxyId || ''}
          />
          <div className={'__account-name'}>
            {account?.name || toShort(item.address)}
          </div>
        </>
      );
    },
    [accounts]
  );

  const goUnlockVote = useCallback((item: GovVotingInfo) => {
    return () => {
      setGovUnlockStorage({
        ...DEFAULT_GOV_UNLOCK_VOTE_PARAMS,
        from: reformatAddress(item.address, networkPrefix),
        fromAccountProxy,
        referendumIds: item.summary.unlockable.unlockableReferenda,
        tracks: item.summary.unlockable.trackIds,
        chain: chain,
        amount: item.summary.unlockable.balance
      });
      navigate('/transaction/gov-unlock-vote');
    };
  }, [chain, fromAccountProxy, navigate, networkPrefix, setGovUnlockStorage]);

  const accountInfoItemsNode = useMemo(() => {
    return govLockedInfos
      .filter((item) => {
        return (
          new BigN(item.summary.totalLocked).gt(BN_ZERO)
        );
      })
      .map((item) => {
        const maxUnlockingBalance = item.summary.unlocking.unlockingReferenda.length
          ? item.summary.unlocking.unlockingReferenda
            .map((unlockingReferenda) => new BigN(unlockingReferenda.balance))
            .reduce((max, cur) => (cur.gt(max) ? cur : max), BN_ZERO)
            .toString()
          : '0';

        const lockedAmount = new BigN(item.summary?.unlockable?.balance || BN_ZERO);

        return (
          <MetaInfo
            className={CN('__account-info-item')}
            hasBackgroundWrapper={true}
            key={item.address}
            labelColorScheme='gray'
            labelFontWeight='semibold'
            spaceSize='sm'
            valueColorScheme='light'
          >
            <MetaInfo.Status
              className={'__meta-locked-status-item'}
              label={renderAccount(item)}
              statusName={lockedAmount.gt(BN_ZERO) ? t('ui.GOVERNANCE.screen.Governance.UnlockToken.LockedAccountInfoPart.unlockable') : ''}
              valueColorSchema={'success'}
            />

            <MetaInfo.Number
              decimalOpacity={0.45}
              decimals={decimals}
              label={t('ui.GOVERNANCE.screen.Governance.UnlockToken.LockedAccountInfoPart.delegated')}
              suffix={symbol}
              value={item.summary.delegated}
              valueColorSchema='even-odd'
            />

            <MetaInfo.Number
              decimalOpacity={0.45}
              decimals={decimals}
              label={t('ui.GOVERNANCE.screen.Governance.UnlockToken.LockedAccountInfoPart.voted')}
              suffix={symbol}
              value={item.summary.voted}
              valueColorSchema='even-odd'
            />

            <MetaInfo.Number
              decimalOpacity={0.45}
              decimals={decimals}
              label={(
                <span>{t('ui.GOVERNANCE.screen.Governance.UnlockToken.LockedAccountInfoPart.unlocking')}
                  {
                    new BigNumber(maxUnlockingBalance).gt(BN_ZERO) && (
                      <span
                        className='unlocking-detail-button'
                        onClick={onShowUnlockingModal(item.summary.unlocking.unlockingReferenda)}
                      >
                        &nbsp;&nbsp;
                        <Icon
                          customSize={'18px'}
                          phosphorIcon={Info}
                          weight='bold'
                        />
                      </span>
                    )
                  }
                </span>
              )}
              suffix={symbol}
              value={maxUnlockingBalance}
              valueColorSchema='even-odd'
            />

            <MetaInfo.Number
              decimalOpacity={0.45}
              decimals={decimals}
              label={t('ui.GOVERNANCE.screen.Governance.UnlockToken.LockedAccountInfoPart.unlockable')}
              suffix={symbol}
              value={lockedAmount}
              valueColorSchema='even-odd'
            />

            <div className={'__unlock-button-wrapper'}>
              <Button
                block={true}
                className={'__unlock-button'}
                disabled={lockedAmount.eq(BN_ZERO)}
                onClick={goUnlockVote(item)}
              >
                <div className='__unlock-button-label'>
                  {t('ui.GOVERNANCE.screen.Governance.UnlockToken.LockedAccountInfoPart.unlock')}
                </div>
              </Button>
            </div>

          </MetaInfo>
        );
      });
  }, [govLockedInfos, renderAccount, t, decimals, symbol, onShowUnlockingModal, goUnlockVote]);

  const unlockingModalContent = useMemo(() => {
    return [...unlockingModalData]
      .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
      .map((item, index) => {
        const timeRemainingContent = calculateTimeRemaining(item.timestamp);

        return (
          <MetaInfo.Number
            decimalOpacity={0.45}
            decimals={decimals}
            key={item.id}
            label={t('ui.GOVERNANCE.screen.Governance.UnlockToken.LockedAccountInfoPart.unlockableInDate', { date: timeRemainingContent })}
            suffix={symbol}
            value={item.balance}
            valueColorSchema='even-odd'
          />
        );
      });
  }, [unlockingModalData, decimals, symbol, t]);

  return (
    <div className={CN(className, {
      '-horizontal-mode': isAllAccount,
      '-has-one-item': accountInfoItemsNode.length === 1
    })}
    >
      {isAllAccount && accountInfoItemsNode.length > 1
        ? (
          <div className={'__slider-container'}>
            <Slider
              className={'__carousel-container'}
              {...sliderSettings}
            >
              {accountInfoItemsNode}
            </Slider>
          </div>
        )
        : (
          accountInfoItemsNode
        )}

      <SwModal
        className={CN(className, '__unlocking-modal')}
        closable={true}
        id={UNLOCKING_MODAL_ID}
        onCancel={onCancelUnlockingModal}
        title={t('ui.GOVERNANCE.screen.Governance.UnlockToken.LockedAccountInfoPart.unlocking')}
      >
        <MetaInfo
          className={CN('__unlocking-modal-container')}
          hasBackgroundWrapper={true}
          labelColorScheme='gray'
          labelFontWeight='semibold'
          valueColorScheme='light'
        >
          {unlockingModalContent}
        </MetaInfo>
      </SwModal>
    </div>
  );
}

export const LockedAccountInfoPart = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  '&.-horizontal-mode': {
    '.__panel-body': {
      overflowX: 'auto',
      display: 'flex',
      gap: token.sizeSM
    }
  },

  '&.-horizontal-mode:not(.-has-one-item)': {
    '.__panel-body': {
      paddingLeft: 0,
      paddingRight: 0
    }
  },

  '&.-horizontal-mode.-has-one-item': {
    '.__account-info-item.-box-mode': {
      flex: 1
    }
  },

  '.__slider-container': {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },

  '.__circle-icon': {
    width: 40,
    height: 40,
    backgroundColor: token['gray-2'],
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  '.slick-slide > div': {
    paddingLeft: 6,
    paddingRight: 6
  },

  '.__carousel-container': {
    '.slick-prev, .slick-next': {
      width: 40,
      height: 0,
      position: 'absolute',
      top: 'calc(50% - 20px)',
      bottom: 0,
      cursor: 'pointer',
      zIndex: 20
    },

    '.slick-prev': {
      left: 0
    },

    '.slick-next': {
      right: token.size
    },

    '.slick-disabled .__right-arrow': {
      display: 'none'
    },

    '.slick-disabled .__left-arrow': {
      display: 'none'
    },

    '.__left-arrow, .__right-arrow': {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },

  '.__separator': {
    height: 2,
    backgroundColor: 'rgba(33, 33, 33, 0.80)'
  },

  '.__meta-locked-status-item': {
    '.__label': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXS
    },

    '.__account-name': {
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      color: token.colorTextLight1
    }
  },

  '.__unlock-button-wrapper': {
    marginTop: token.margin
  },

  '.unlocking-detail-button': {
    cursor: 'pointer',
    color: token.colorTextLight1,
    opacity: 0.65,

    '&:hover': {
      opacity: 1
    }
  }
}));
