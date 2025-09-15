// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVotingInfo } from '@subwallet/extension-base/services/open-gov/interface';
import { Avatar, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { DEFAULT_GOV_UNLOCK_VOTE_PARAMS, GOV_UNLOCK_VOTE_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { useGetChainPrefixBySlug, useGetNativeTokenBasicInfo, useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { useLocalStorage } from '@subwallet/extension-koni-ui/hooks/common/useLocalStorage';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { findAccountByAddress, getTransactionFromAccountProxyValue, toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretLeft, CaretRight, CheckCircle } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
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

function Component ({ chain, className, govLockedInfos }: Props) {
  const { t } = useTranslation();

  const { accounts, isAllAccount } = useSelector((state) => state.accountState);
  const networkPrefix = useGetChainPrefixBySlug(chain);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);
  const { currentAccountProxy } = useSelector((state) => state.accountState);
  const fromAccountProxy = getTransactionFromAccountProxyValue(currentAccountProxy);
  const [, setGovUnlockStorage] = useLocalStorage(GOV_UNLOCK_VOTE_TRANSACTION, DEFAULT_GOV_UNLOCK_VOTE_PARAMS);
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

  const renderAccount = useCallback(
    (item: GovVotingInfo) => {
      const account = findAccountByAddress(accounts, item.address);

      return (
        <>
          <Avatar
            identPrefix={networkPrefix}
            size={24}
            value={item.address}
          />
          <div className={'__account-name'}>
            {account?.name || toShort(item.address)}
          </div>
        </>
      );
    },
    [accounts, networkPrefix]
  );

  const goUnlockVote = useCallback((item: GovVotingInfo) => {
    return () => {
      setGovUnlockStorage({
        ...DEFAULT_GOV_UNLOCK_VOTE_PARAMS,
        from: item.address,
        fromAccountProxy,
        referendumIds: item.summary.unlockable.unlockableReferenda,
        tracks: item.summary.unlockable.trackIds,
        chain: chain,
        amount: item.summary.unlockable.balance
      });
      navigate('/transaction/gov-unlock-vote');
    };
  }, [chain, fromAccountProxy, navigate, setGovUnlockStorage]);

  const accountInfoItemsNode = useMemo(() => {
    return govLockedInfos.map((item) => {
      return (
        <MetaInfo
          className={CN('__account-info-item')}
          hasBackgroundWrapper={true}
          key={item.address}
          labelColorScheme='gray'
          labelFontWeight='regular'
          spaceSize='sm'
          valueColorScheme='light'
        >
          <MetaInfo.Status
            className={'__meta-locked-status-item'}
            label={renderAccount(item)}
            statusIcon={CheckCircle}
            statusName={'Unlockable'}
            valueColorSchema={'success'}
          />

          <MetaInfo.Number
            decimals={decimals}
            label={'Delegated'}
            suffix={symbol}
            value={item.summary.delegated}
            valueColorSchema='even-odd'
          />

          <MetaInfo.Number
            decimals={decimals}
            label={'Voted'}
            suffix={symbol}
            value={item.summary.voted}
            valueColorSchema='even-odd'
          />

          <MetaInfo.Number
            decimals={decimals}
            label={'Unlocking'}
            suffix={symbol}
            value={item.summary.unlocking.balance}
            valueColorSchema='even-odd'
          />

          <MetaInfo.Number
            decimals={decimals}
            label={'Unlockable'}
            suffix={symbol}
            value={item.summary.unlockable.balance}
            valueColorSchema='even-odd'
          />

          <div className={'__unlock-button-wrapper'}>
            <Button
              block={true}
              className={'__unlock-button'}
              onClick={
                goUnlockVote(item)
              }
              size='xs'
            >
              <div className='__unlock-button-label'>
                {t('Unlock')}
              </div>
            </Button>
          </div>

        </MetaInfo>
      );
    });
  }, [govLockedInfos, renderAccount, decimals, symbol, goUnlockVote, t]);

  return (
    <>
      {isAllAccount && govLockedInfos.length > 1
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
    </>
  );
}

export const LockedAccountInfoPart = styled(Component)<Props>(({ theme: { token } }: Props) => ({

}));
