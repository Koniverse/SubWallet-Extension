// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { detectTranslate, isAccountAll } from '@subwallet/extension-base/utils';
import { AlertModal, EmptyList, FilterModal, Layout } from '@subwallet/extension-koni-ui/components';
import { EarningPositionItem } from '@subwallet/extension-koni-ui/components/Earning';
import BannerGenerator from '@subwallet/extension-koni-ui/components/StaticContent/BannerGenerator';
import { ASTAR_PORTAL_URL, BN_TEN, EARNING_WARNING_ANNOUNCEMENT } from '@subwallet/extension-koni-ui/constants';
import { useAlert, useFilterModal, useGetBannerByScreen, useGetYieldPositionForSpecificAccount, useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { reloadCron } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { EarningEntryView, EarningPositionDetailParam, ExtraYieldPositionInfo, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isRelatedToAstar, openInNewTab } from '@subwallet/extension-koni-ui/utils';
import { Button, ButtonProps, Icon, ModalContext, SwList } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { ArrowsClockwise, FadersHorizontal, Plus, PlusCircle, Vault } from 'phosphor-react';
import React, { SyntheticEvent, useCallback, useContext, useEffect, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps & {
  earningPositions: YieldPositionInfo[];
  setEntryView: React.Dispatch<React.SetStateAction<EarningEntryView>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const FILTER_MODAL_ID = 'earning-positions-filter-modal';
const alertModalId = 'earning-positions-alert-modal';

const getOrdinalChainTypeValue = (item: ExtraYieldPositionInfo, chainInfoMap: Record<string, _ChainInfo>): number => {
  const chainInfo = chainInfoMap[item.chain];

  return chainInfo?.isTestnet ? 0 : 1;
};

function Component ({ className, earningPositions, setEntryView, setLoading }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { activeModal } = useContext(ModalContext);

  const isShowBalance = useSelector((state) => state.settings.isShowBalance);
  const { currencyData, priceMap } = useSelector((state) => state.price);
  const { assetRegistry: assetInfoMap } = useSelector((state) => state.assetRegistry);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const currentAccountProxy = useSelector((state) => state.accountState.currentAccountProxy);
  const accounts = useSelector((root: RootState) => root.accountState.accounts);
  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, selectedFilters } = useFilterModal(FILTER_MODAL_ID);
  const { alertProps, closeAlert, openAlert } = useAlert(alertModalId);
  const specificList = useGetYieldPositionForSpecificAccount();
  const { banners, dismissBanner, onClickBanner } = useGetBannerByScreen('earning');
  const [announcement, setAnnouncement] = useLocalStorage(EARNING_WARNING_ANNOUNCEMENT, 'nonConfirmed');

  const items: ExtraYieldPositionInfo[] = useMemo(() => {
    if (!earningPositions.length) {
      return [];
    }

    return earningPositions
      .map((item): ExtraYieldPositionInfo => {
        const priceToken = assetInfoMap[item.balanceToken];
        const price = priceMap[priceToken?.priceId || ''] || 0;

        return {
          ...item,
          asset: priceToken,
          price,
          currency: currencyData
        };
      })
      .filter((item) => !!item.asset)
      .sort((firstItem, secondItem) => {
        const getValue = (item: ExtraYieldPositionInfo): number => {
          return new BigN(item.totalStake)
            .dividedBy(BN_TEN.pow(item.asset.decimals || 0))
            .multipliedBy(item.price)
            .toNumber();
        };

        return getOrdinalChainTypeValue(secondItem, chainInfoMap) - getOrdinalChainTypeValue(firstItem, chainInfoMap) ||
          getValue(secondItem) - getValue(firstItem);
      });
  }, [assetInfoMap, chainInfoMap, currencyData, earningPositions, priceMap]);

  const chainStakingBoth = useMemo(() => {
    if (!currentAccountProxy) {
      return null;
    }

    const chains = ['polkadot', 'kusama'];

    const findChainWithStaking = (list: YieldPositionInfo[]) => {
      const hasNativeStaking = (chain: string) => list.some((item) => item.chain === chain && item.type === YieldPoolType.NATIVE_STAKING);
      const hasNominationPool = (chain: string) => list.some((item) => item.chain === chain && item.type === YieldPoolType.NOMINATION_POOL);

      for (const chain of chains) {
        if (hasNativeStaking(chain) && hasNominationPool(chain)) {
          return chain;
        }
      }

      return null;
    };

    if (isAccountAll(currentAccountProxy.id)) {
      return findChainWithStaking(specificList);
    }

    for (const acc of accounts) {
      if (isAccountAll(acc.address)) {
        continue;
      }

      const listStaking = specificList.filter((item) => item.address === acc.address);
      const chain = findChainWithStaking(listStaking);

      if (chain) {
        return chain;
      }
    }

    return null;
  }, [accounts, currentAccountProxy, specificList]);

  const learnMore = useCallback(() => {
    window.open('https://support.polkadot.network/support/solutions/articles/65000188140-changes-for-nomination-pool-members-and-opengov-participation');
  }, []);

  const onCancel = useCallback(() => {
    closeAlert();
    setAnnouncement('confirmed');
  }, [closeAlert, setAnnouncement]);

  useEffect(() => {
    if (chainStakingBoth && announcement.includes('nonConfirmed')) {
      const chainInfo = chainStakingBoth && chainInfoMap[chainStakingBoth];

      const symbol = (!!chainInfo && chainInfo?.substrateInfo?.symbol) || '';
      const originChain = (!!chainInfo && chainInfo?.name) || '';

      openAlert({
        type: NotificationType.WARNING,
        onCancel: onCancel,
        content:
          (<>
            <div className={CN(className, 'earning-alert-content')}>
              <Trans
                components={{
                  openlink: (
                    <a
                      href='https://docs.subwallet.app/main/mobile-app-user-guide/manage-staking/unstake'
                      rel='noopener noreferrer'
                      style={{ textDecoration: 'underline', cursor: 'pointer' }}
                      target='_blank'
                    ></a>
                  ),
                  highlight: <span className='__info-highlight' />
                }}
                i18nKey={detectTranslate('ui.EARNING.screen.EarningPositions.dualStakingNotSupportedWarning')}
                values={{ originChain, symbol }}
              />
            </div>

          </>),
        title: t('ui.EARNING.screen.EarningPositions.unstakeYourTokenNow', { replace: { tokenSymbol: symbol } }),
        okButton: {
          text: t('ui.EARNING.screen.EarningPositions.readUpdate'),
          onClick: () => {
            learnMore();
            setAnnouncement('confirmed');
            closeAlert();
          }
        },
        cancelButton: {
          text: t('ui.EARNING.screen.EarningPositions.dismiss'),
          onClick: () => {
            closeAlert();
            setAnnouncement('confirmed');
          }
        }
      });
    }
  }, [announcement, chainInfoMap, chainStakingBoth, className, closeAlert, learnMore, onCancel, openAlert, setAnnouncement, t]);

  const lastItem = useMemo(() => {
    return items[items.length - 1];
  }, [items]);

  const filterOptions = [
    { label: t('ui.EARNING.screen.EarningPositions.nominationPool'), value: YieldPoolType.NOMINATION_POOL },
    { label: t('ui.EARNING.screen.EarningPositions.directNomination'), value: YieldPoolType.NATIVE_STAKING },
    { label: t('ui.EARNING.screen.EarningPositions.liquidStaking'), value: YieldPoolType.LIQUID_STAKING },
    { label: t('ui.EARNING.screen.EarningPositions.lending'), value: YieldPoolType.LENDING },
    { label: t('ui.EARNING.screen.EarningPositions.parachainStaking'), value: YieldPoolType.PARACHAIN_STAKING },
    { label: t('ui.EARNING.screen.EarningPositions.singleFarming'), value: YieldPoolType.SINGLE_FARMING },
    { label: t('ui.EARNING.screen.EarningPositions.subnetStaking'), value: YieldPoolType.SUBNET_STAKING }
  ];

  const filterFunction = useMemo<(item: ExtraYieldPositionInfo) => boolean>(() => {
    const filterMap: Record<string, boolean> = Object.fromEntries(selectedFilters.map((filter) => [filter, true]));

    return (item) => !selectedFilters.length || filterMap[item.type] || false;
  }, [selectedFilters]);

  const onClickItem = useCallback((item: ExtraYieldPositionInfo) => {
    return () => {
      if (isRelatedToAstar(item.slug)) {
        openAlert({
          title: t('ui.EARNING.screen.EarningPositions.enterAstarPortal'),
          content: t('ui.EARNING.screen.EarningPositions.navigateToAstarPortal'),
          cancelButton: {
            text: t('ui.EARNING.screen.EarningPositions.cancel'),
            schema: 'secondary',
            onClick: closeAlert
          },
          okButton: {
            text: t('ui.EARNING.screen.EarningPositions.enterAstarPortal'),
            onClick: () => {
              openInNewTab(ASTAR_PORTAL_URL)();
              closeAlert();
            }
          }
        });
      } else {
        navigate('/home/earning/position-detail', { state: {
          earningSlug: item.slug
        } as EarningPositionDetailParam });
      }
    };
  }, [closeAlert, navigate, openAlert, t]);
  const onClickExploreEarning = useCallback(() => {
    setEntryView(EarningEntryView.OPTIONS);
  }, [setEntryView]);

  const renderItem = useCallback(
    (item: ExtraYieldPositionInfo) => {
      return (
        <React.Fragment key={item.slug}>
          <EarningPositionItem
            className={'earning-position-item'}
            isShowBalance={isShowBalance}
            onClick={onClickItem(item)}
            positionInfo={item}
          />
          {item.slug === lastItem.slug && <div className={'__footer-button'}>
            <Button
              icon={(
                <Icon
                  phosphorIcon={Plus}
                  size='sm'
                />
              )}
              onClick={onClickExploreEarning}
              size={'xs'}
              type={'ghost'}
            >
              {t('ui.EARNING.screen.EarningPositions.exploreEarningOptions')}
            </Button>
          </div>}
        </React.Fragment>
      );
    },
    [lastItem.slug, isShowBalance, onClickItem, onClickExploreEarning, t]
  );

  const emptyList = useCallback(() => {
    return (
      <EmptyList
        buttonProps={{
          icon: (
            <Icon
              phosphorIcon={PlusCircle}
              weight={'fill'}
            />),
          onClick: () => {
            setEntryView(EarningEntryView.OPTIONS);
          },
          size: 'xs',
          shape: 'circle',
          children: t('ui.EARNING.screen.EarningPositions.exploreEarningOptions')
        }}
        emptyMessage={t('ui.EARNING.screen.EarningPositions.changeSearchOrExplore')}
        emptyTitle={t('ui.EARNING.screen.EarningPositions.noEarningPositionFound')}
        phosphorIcon={Vault}
      />
    );
  }, [setEntryView, t]);

  // SEARCH LOGIC HERE
  const searchFunction = useCallback(({ balanceToken, chain: _chain, subnetData }: ExtraYieldPositionInfo, searchText: string) => {
    const chainInfo = chainInfoMap[_chain];
    const assetInfo = assetInfoMap[balanceToken];
    const search = searchText.toLowerCase();

    return [
      chainInfo?.name.replace(' Relay Chain', '').toLowerCase(),
      assetInfo?.symbol.toLowerCase(),
      subnetData?.subnetShortName?.toLowerCase()
    ].some((value) => value?.includes(search));
  }, [assetInfoMap, chainInfoMap]);

  const subHeaderButtons: ButtonProps[] = useMemo(() => {
    return [
      {
        icon: (
          <Icon
            phosphorIcon={ArrowsClockwise}
            size='sm'
            type='phosphor'
          />
        ),
        onClick: () => {
          setLoading(true);
          reloadCron({ data: 'staking' })
            .catch(console.error).finally(() => {
              setTimeout(() => {
                setLoading(false);
              }, 1000);
            });
        }
      },
      {
        icon: (
          <Icon
            phosphorIcon={Plus}
            size='sm'
            type='phosphor'
          />
        ),
        onClick: () => {
          setEntryView(EarningEntryView.OPTIONS);
        }
      }
    ];
  }, [setEntryView, setLoading]);

  const onClickFilterButton = useCallback(
    (e?: SyntheticEvent) => {
      e && e.stopPropagation();
      activeModal(FILTER_MODAL_ID);
    },
    [activeModal]
  );

  return (
    <>
      <Layout.Base
        className={CN(className)}
        showSubHeader={true}
        subHeaderBackground={'transparent'}
        subHeaderCenter={false}
        subHeaderIcons={subHeaderButtons}
        subHeaderPaddingVertical={true}
        title={t<string>('ui.EARNING.screen.EarningPositions.yourEarningPositions')}
      >
        {!!banners.length && (
          <div className={'earning-banner-wrapper'}>
            <BannerGenerator
              banners={banners}
              dismissBanner={dismissBanner}
              onClickBanner={onClickBanner}
            />
          </div>
        )}
        <SwList.Section
          actionBtnIcon={<Icon phosphorIcon={FadersHorizontal} />}
          className={'__section-list-container'}
          enableSearchInput
          filterBy={filterFunction}
          list={items}
          onClickActionBtn={onClickFilterButton}
          renderItem={renderItem}
          renderWhenEmpty={emptyList}
          searchFunction={searchFunction}
          searchMinCharactersCount={2}
          searchPlaceholder={t<string>('ui.EARNING.screen.EarningPositions.searchToken')}
          showActionBtn
        />
        <FilterModal
          applyFilterButtonTitle={t('ui.EARNING.screen.EarningPositions.applyFilter')}
          id={FILTER_MODAL_ID}
          onApplyFilter={onApplyFilter}
          onCancel={onCloseFilterModal}
          onChangeOption={onChangeFilterOption}
          optionSelectionMap={filterSelectionMap}
          options={filterOptions}
          title={t('ui.EARNING.screen.EarningPositions.filter')}
        />
      </Layout.Base>

      {
        !!alertProps && (
          <AlertModal
            modalId={alertModalId}
            {...alertProps}
          />
        )
      }
    </>
  );
}

const EarningPositions = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  '.ant-sw-sub-header-container': {
    marginBottom: token.marginXS
  },

  '.__section-list-container': {
    height: '100%',
    flex: 1
  },

  '&.earning-alert-content': {
    '.__info-highlight': {
      fontWeight: token.fontWeightStrong
    }
  },

  '.__footer-button': {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: token.size,
    marginTop: token.marginXS
  },

  '.earning-position-item': {
    '+ .earning-position-item': {
      marginTop: token.marginXS
    }
  },

  '.earning-banner-wrapper': {
    paddingLeft: token.padding,
    paddingRight: token.padding,
    marginBottom: token.sizeXS
  }
}));

export default EarningPositions;
