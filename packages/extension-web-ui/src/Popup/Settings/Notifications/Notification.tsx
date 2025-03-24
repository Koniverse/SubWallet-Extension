// Copyright 2019-2022 @polkadot/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { isClaimedPosBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/posBridge';
import { _NotificationInfo, BridgeTransactionStatus, ClaimAvailBridgeNotificationMetadata, ClaimPolygonBridgeNotificationMetadata, NotificationActionType, NotificationSetup, NotificationTab, WithdrawClaimNotificationMetadata } from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import { GetNotificationParams, RequestSwitchStatusParams } from '@subwallet/extension-base/types/notification';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { BaseModal, EmptyList, PageWrapper } from '@subwallet/extension-web-ui/components';
import { FilterTabItemType, FilterTabs } from '@subwallet/extension-web-ui/components/FilterTabs';
import Search from '@subwallet/extension-web-ui/components/Search';
import { BN_ZERO, CLAIM_BRIDGE_TRANSACTION, CLAIM_REWARD_TRANSACTION, DEFAULT_CLAIM_AVAIL_BRIDGE_PARAMS, DEFAULT_CLAIM_REWARD_PARAMS, DEFAULT_UN_STAKE_PARAMS, DEFAULT_WITHDRAW_PARAMS, NOTIFICATION_DETAIL_MODAL, WITHDRAW_TRANSACTION } from '@subwallet/extension-web-ui/constants';
import { DataContext } from '@subwallet/extension-web-ui/contexts/DataContext';
import { TransactionModalContext } from '@subwallet/extension-web-ui/contexts/TransactionModalContextProvider';
import { WalletModalContext } from '@subwallet/extension-web-ui/contexts/WalletModalContextProvider';
import { useDefaultNavigate, useGetChainSlugsByAccount, useSelector } from '@subwallet/extension-web-ui/hooks';
import { useLocalStorage } from '@subwallet/extension-web-ui/hooks/common/useLocalStorage';
import { enableChain, saveNotificationSetup } from '@subwallet/extension-web-ui/messaging';
import { fetchInappNotifications, getIsClaimNotificationStatus, markAllReadNotification, switchReadNotificationStatus } from '@subwallet/extension-web-ui/messaging/transaction/notification';
import { NotificationItem, NotificationSetting } from '@subwallet/extension-web-ui/Popup/Settings/Notifications/index';
import { NotificationItemActionsModal, NotificationItemActionsModalProps } from '@subwallet/extension-web-ui/Popup/Settings/Notifications/NotificationItemActionsModal';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { Theme, ThemeProps } from '@subwallet/extension-web-ui/types';
import { getTotalWidrawable, getYieldRewardTotal } from '@subwallet/extension-web-ui/utils/notification';
import { ActivityIndicator, Button, Icon, ModalContext, SwList, SwSubHeader } from '@subwallet/react-ui';
import { SwIconProps } from '@subwallet/react-ui/es/icon';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { ArrowSquareDownLeft, ArrowSquareUpRight, BellSimpleRinging, BellSimpleSlash, CheckCircle, Checks, Coins, DownloadSimple, FadersHorizontal, GearSix, Gift, ListBullets, XCircle } from 'phosphor-react';
import React, { SyntheticEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

type Props = {
  isInModal?: boolean;
  modalProps?: WrapperProps['modalProps'];
  refreshNotifications: VoidFunction;
  refreshNotificationsTriggerKey: string;
  notificationItemActionsModal: {
    open: (props: NotificationItemActionsModalProps) => void;
    close: VoidFunction;
  },
  openNotificationSettingModal: VoidFunction;
};

type WrapperProps = ThemeProps & {
  isModal?: boolean;
  modalProps?: {
    modalId: string;
    onCancel: VoidFunction;
  };
};

export interface NotificationInfoItem extends _NotificationInfo {
  backgroundColor: string;
  leftIcon?: SwIconProps['phosphorIcon'];
  disabled?: boolean;
}

export enum NotificationIconBackgroundColorMap {
  SEND = 'colorSuccess',
  RECEIVE = 'lime-7',
  WITHDRAW = 'blue-8',
  CLAIM = 'yellow-7',
  CLAIM_AVAIL_BRIDGE_ON_AVAIL = 'yellow-7', // temporary set
  CLAIM_AVAIL_BRIDGE_ON_ETHEREUM = 'yellow-7',
  CLAIM_POLYGON_BRIDGE = 'yellow-7'
}

export const NotificationIconMap = {
  SEND: ArrowSquareUpRight,
  RECEIVE: ArrowSquareDownLeft,
  WITHDRAW: DownloadSimple,
  CLAIM: Gift,
  CLAIM_AVAIL_BRIDGE_ON_AVAIL: Coins, // temporary set
  CLAIM_AVAIL_BRIDGE_ON_ETHEREUM: Coins,
  CLAIM_POLYGON_BRIDGE: Coins
};

function Component ({ isInModal,
  modalProps, notificationItemActionsModal, openNotificationSettingModal,
  refreshNotifications, refreshNotificationsTriggerKey }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goBack } = useDefaultNavigate();
  const { token } = useTheme() as Theme;
  const { alertModal } = useContext(WalletModalContext);
  const chainsByAccountType = useGetChainSlugsByAccount();
  const { claimBridgeModal, claimRewardModal, withdrawModal } = useContext(TransactionModalContext);

  const [, setClaimRewardStorage] = useLocalStorage(CLAIM_REWARD_TRANSACTION, DEFAULT_CLAIM_REWARD_PARAMS);
  const [, setWithdrawStorage] = useLocalStorage(WITHDRAW_TRANSACTION, DEFAULT_WITHDRAW_PARAMS);
  const [, setClaimAvailBridgeStorage] = useLocalStorage(CLAIM_BRIDGE_TRANSACTION, DEFAULT_CLAIM_AVAIL_BRIDGE_PARAMS);

  const { notificationSetup } = useSelector((state: RootState) => state.settings);
  const { accounts, currentAccountProxy, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { earningRewards, poolInfoMap, yieldPositions } = useSelector((state) => state.earning);
  const { chainInfoMap, chainStateMap } = useSelector((state) => state.chainStore);

  const filterTabItems = useMemo<FilterTabItemType[]>(() => {
    return [
      {
        label: t('All'),
        value: NotificationTab.ALL
      },
      {
        label: t('Unread'),
        value: NotificationTab.UNREAD
      },
      {
        label: t('Read'),
        value: NotificationTab.READ
      }
    ];
  }, [t]);

  const [selectedFilterTab, setSelectedFilterTab] = useState<NotificationTab>(NotificationTab.ALL);
  const [notifications, setNotifications] = useState<_NotificationInfo[]>([]);
  const [currentProxyId] = useState<string | undefined>(currentAccountProxy?.id);
  const [loadingNotification, setLoadingNotification] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSearchText, setCurrentSearchText] = useState<string>('');
  // use this to trigger get date when click read/unread
  const [currentTimestampMs, setCurrentTimestampMs] = useState(Date.now());

  const enableNotification = notificationSetup.isEnabled;

  const notificationItems = useMemo((): NotificationInfoItem[] => {
    const filterTabFunction = (item: NotificationInfoItem) => {
      if (selectedFilterTab === NotificationTab.ALL) {
        return true;
      } else if (selectedFilterTab === NotificationTab.UNREAD) {
        return !item.isRead;
      } else {
        return item.isRead;
      }
    };

    const sortByTimeFunc = (itemA: NotificationInfoItem, itemB: NotificationInfoItem) => {
      return itemB.time - itemA.time;
    };

    return notifications.map((item) => {
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        address: item.address,
        time: item.time,
        extrinsicType: item.extrinsicType,
        isRead: item.isRead,
        actionType: item.actionType,
        backgroundColor: token[NotificationIconBackgroundColorMap[item.actionType]],
        leftIcon: NotificationIconMap[item.actionType],
        metadata: item.metadata,
        proxyId: item.proxyId
      };
    }).filter(filterTabFunction).sort(sortByTimeFunc);
  }, [notifications, selectedFilterTab, token]);

  const filteredNotificationItems = useMemo(() => {
    return notificationItems.filter((item) => {
      const searchTextLowerCase = currentSearchText.toLowerCase();

      return item.title?.toLowerCase().includes(searchTextLowerCase);
    });
  }, [currentSearchText, notificationItems]);

  const openNotificationSetting = useCallback(() => {
    if (isInModal) {
      openNotificationSettingModal();
    } else {
      navigate('/settings/notification-config');
    }
  }, [isInModal, navigate, openNotificationSettingModal]);

  const onEnableNotification = useCallback(() => {
    const newNotificationSetup: NotificationSetup = {
      ...notificationSetup,
      isEnabled: true
    };

    setLoadingNotification(true);
    saveNotificationSetup(newNotificationSetup)
      .catch(console.error)
      .finally(() => {
        openNotificationSetting();
        setLoadingNotification(false);
      });
  }, [notificationSetup, openNotificationSetting]);

  const handleSearch = useCallback((value: string) => {
    setCurrentSearchText(value);
  }, []);

  const onSelectFilterTab = useCallback((value: string) => {
    setSelectedFilterTab(value as NotificationTab);
    setLoading(true);
    fetchInappNotifications({
      proxyId: currentProxyId,
      notificationTab: value
    } as GetNotificationParams)
      .then((rs) => {
        setNotifications(rs);
        setTimeout(() => setLoading(false), 300);
      })
      .catch(console.error);
  }, [currentProxyId]);

  const onClickBack = useCallback(() => {
    setCurrentSearchText('');
    goBack();
  }, [goBack]);

  const showActiveChainModal = useCallback((chainSlug: string, action: NotificationActionType.WITHDRAW | NotificationActionType.CLAIM) => {
    const onOk = () => {
      alertModal.updatePartially({
        okLoading: true,
        cancelDisabled: true
      });

      enableChain(chainSlug, false)
        .then(() => {
          setTimeout(() => {
            alertModal.updatePartially({
              okLoading: false,
              cancelDisabled: false
            });
            alertModal.close();
          }, 2000);
        })
        .catch(() => {
          alertModal.updatePartially({
            okLoading: false,
            cancelDisabled: false
          });
        });
    };

    const chainInfo = chainInfoMap[chainSlug];

    const content = action === NotificationActionType.WITHDRAW
      ? detectTranslate('{{networkName}} network is currently disabled. Enable the network and then re-click the notification to start withdrawing your funds')
      : detectTranslate('{{networkName}} network is currently disabled. Enable the network and then re-click the notification to start claiming your funds');

    alertModal.open({
      title: t('Enable network'),
      type: NotificationType.WARNING,
      content: t(content, { replace: { networkName: chainInfo?.name || chainSlug } }),
      closable: false,
      maskClosable: false,
      cancelButton: {
        icon: XCircle,
        onClick: alertModal.close,
        schema: 'secondary',
        text: t('Cancel')
      },
      okButton: {
        icon: CheckCircle,
        onClick: onOk,
        text: t('Enable')
      }
    });
  }, [chainInfoMap, alertModal, t]);

  const showWarningModal = useCallback((action: string) => {
    alertModal.open({
      title: t('You’ve {{action}} tokens', { replace: { action: action } }),
      type: NotificationType.INFO,
      content: t('You’ve already {{action}} your tokens. Check for unread notifications to stay updated on any important', { replace: { action: action } }),
      okButton: {
        text: t('I understand'),
        onClick: alertModal.close,
        icon: CheckCircle
      }
    });
  }, [alertModal, t]);

  const onClickItem = useCallback((item: NotificationInfoItem) => {
    return () => {
      const slug = (item.metadata as WithdrawClaimNotificationMetadata).stakingSlug;
      const totalWithdrawable = getTotalWidrawable(slug, poolInfoMap, yieldPositions, currentAccountProxy, isAllAccount, chainsByAccountType, currentTimestampMs);
      const switchStatusParams: RequestSwitchStatusParams = {
        id: item.id,
        isRead: false
      };

      // Check chain active status before navigate
      switch (item.actionType) {
        case NotificationActionType.WITHDRAW: {
          const metadata = item.metadata as WithdrawClaimNotificationMetadata;

          const chainSlug = metadata.stakingSlug.split('___')[2];

          if (chainStateMap[chainSlug]?.active) {
            break;
          } else {
            showActiveChainModal(chainSlug, item.actionType);

            return;
          }
        }
      }

      // Check data available before navigate
      switch (item.actionType) {
        case NotificationActionType.WITHDRAW: {
          if (totalWithdrawable && BigN(totalWithdrawable).gt(BN_ZERO)) {
            const metadata = item.metadata as WithdrawClaimNotificationMetadata;

            setWithdrawStorage({
              ...DEFAULT_UN_STAKE_PARAMS,
              slug: metadata.stakingSlug,
              chain: metadata.stakingSlug.split('___')[2],
              from: item.address
            });
            switchReadNotificationStatus(switchStatusParams).then(() => {
              if (isInModal) {
                withdrawModal.open({
                  onBack: withdrawModal.close,
                  onCancel: () => {
                    withdrawModal.close();
                    modalProps?.onCancel();
                  },
                  onDoneCallback: modalProps?.onCancel
                });
              } else {
                navigate('/transaction/withdraw');
              }
            }).catch(console.error);
          } else {
            showWarningModal('withdrawn');
          }

          break;
        }

        case NotificationActionType.CLAIM: {
          const unclaimedReward = getYieldRewardTotal(slug, earningRewards, poolInfoMap, accounts, isAllAccount, currentAccountProxy, chainsByAccountType);
          const metadata = item.metadata as WithdrawClaimNotificationMetadata;
          const chainSlug = metadata.stakingSlug.split('___')[2];

          if (unclaimedReward && BigN(unclaimedReward).gt(BN_ZERO)) {
            setClaimRewardStorage({
              ...DEFAULT_CLAIM_REWARD_PARAMS,
              slug: metadata.stakingSlug,
              chain: chainSlug,
              from: item.address
            });
            switchReadNotificationStatus(switchStatusParams).then(() => {
              if (isInModal) {
                claimRewardModal.open({
                  onBack: claimRewardModal.close,
                  onCancel: () => {
                    claimRewardModal.close();
                    modalProps?.onCancel();
                  },
                  onDoneCallback: modalProps?.onCancel
                });
              } else {
                navigate('/transaction/claim-reward');
              }
            }).catch(console.error);
          } else {
            if (chainStateMap[chainSlug]?.active) {
              showWarningModal('claimed');
            } else {
              showActiveChainModal(chainSlug, item.actionType);

              return;
            }
          }

          break;
        }

        case NotificationActionType.CLAIM_POLYGON_BRIDGE: {
          const handleClaimPolygonBridge = async () => {
            try {
              const metadata = item.metadata as ClaimPolygonBridgeNotificationMetadata;
              let isClaimed = false;

              if (metadata.bridgeType === 'POS') {
                const isTestnet = metadata.chainSlug === COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA;

                isClaimed = await isClaimedPosBridge(metadata._id, metadata.userAddress, isTestnet) || false;
              } else {
                isClaimed = await getIsClaimNotificationStatus({ chainslug: metadata.chainSlug, counter: metadata.counter ?? 0, sourceNetwork: metadata.sourceNetwork ?? 0 });
              }

              if (!isClaimed) {
                setClaimAvailBridgeStorage({
                  chain: metadata.chainSlug,
                  asset: metadata.tokenSlug,
                  notificationId: item.id,
                  fromAccountProxy: item.proxyId,
                  from: item.address
                });

                await switchReadNotificationStatus(switchStatusParams);

                if (isInModal) {
                  claimBridgeModal.open({
                    onBack: claimBridgeModal.close,
                    onCancel: () => {
                      claimBridgeModal.close();
                      modalProps?.onCancel();
                    },
                    onDoneCallback: modalProps?.onCancel
                  });
                } else {
                  navigate('/transaction/claim-bridge');
                }
              } else {
                showWarningModal('claimed');
              }
            } catch (error) {
              console.error(error);
            }
          };

          handleClaimPolygonBridge().catch((err) => {
            console.error('Error:', err);
          });
          break;
        }

        case NotificationActionType.CLAIM_AVAIL_BRIDGE_ON_ETHEREUM:

        // eslint-disable-next-line no-fallthrough
        case NotificationActionType.CLAIM_AVAIL_BRIDGE_ON_AVAIL: {
          const metadata = item.metadata as ClaimAvailBridgeNotificationMetadata;

          if (metadata.status === BridgeTransactionStatus.READY_TO_CLAIM) {
            setClaimAvailBridgeStorage({
              chain: metadata.chainSlug,
              asset: metadata.tokenSlug,
              notificationId: item.id,
              fromAccountProxy: item.proxyId,
              from: item.address
            });
            switchReadNotificationStatus(switchStatusParams).then(() => {
              if (isInModal) {
                claimBridgeModal.open({
                  onBack: claimBridgeModal.close,
                  onCancel: () => {
                    claimBridgeModal.close();
                    modalProps?.onCancel();
                  },
                  onDoneCallback: modalProps?.onCancel
                });
              } else {
                navigate('/transaction/claim-bridge');
              }
            }).catch(console.error);
          } else {
            showWarningModal('claimed');
          }

          break;
        }
      }

      if (!item.isRead) {
        switchReadNotificationStatus(item)
          .catch(console.error)
          .finally(() => {
            refreshNotifications();
          });
      }
    };
  }, [poolInfoMap, yieldPositions, currentAccountProxy, isAllAccount, chainsByAccountType, currentTimestampMs, chainStateMap, showActiveChainModal, setWithdrawStorage, isInModal, withdrawModal, modalProps, navigate, showWarningModal, earningRewards, accounts, setClaimRewardStorage, claimRewardModal, setClaimAvailBridgeStorage, claimBridgeModal, refreshNotifications]);

  const onClickMore = useCallback((item: NotificationInfoItem) => {
    return (e: SyntheticEvent) => {
      e.stopPropagation();

      notificationItemActionsModal.open({
        onCancel: notificationItemActionsModal.close,
        notificationItem: item,
        refreshNotifications,
        onClickAction: onClickItem(item)
      });
    };
  }, [notificationItemActionsModal, onClickItem, refreshNotifications]);

  const renderItem = useCallback((item: NotificationInfoItem) => {
    return (
      <NotificationItem
        actionType={item.actionType}
        address={item.address}
        backgroundColor={item.backgroundColor}
        className={CN('item', { '-read-item': item.isRead })}
        description={item.description}
        extrinsicType={item.extrinsicType}
        id={item.id}
        isRead={item.isRead}
        key={item.id}
        leftIcon={item.leftIcon}
        metadata={item.metadata}
        onClick={onClickItem(item)}
        onClickMoreBtn={onClickMore(item)}
        proxyId={item.proxyId}
        time={item.time}
        title={item.title}
      />
    );
  }, [onClickItem, onClickMore]);

  const renderEmptyList = useCallback(() => {
    return (
      <EmptyList
        className={'notification-empty-list'}
        emptyMessage={t('Your notifications will appear here')}
        emptyTitle={t('No notifications yet')}
        phosphorIcon={ListBullets}
      />
    );
  }, [t]);

  const renderEnableNotification = useCallback(() => {
    return (
      <EmptyList
        buttonProps={{
          icon: (
            <Icon
              customSize={'20px'}
              phosphorIcon={BellSimpleRinging}
              weight={'fill'}
            />),
          onClick: onEnableNotification,
          loading: loadingNotification,
          size: 'xs',
          shape: 'circle',
          children: t('Enable notifications')
        }}
        className={'notification-empty-with-button'}
        emptyMessage={t('Enable notifications now to not miss anything!')}
        emptyTitle={t('Notifications are disabled')}
        phosphorIcon={BellSimpleSlash}
      />
    );
  }, [loadingNotification, onEnableNotification, t]);

  const handleSwitchClick = useCallback(() => {
    markAllReadNotification(currentProxyId || ALL_ACCOUNT_KEY)
      .catch(console.error);

    setLoading(true);

    // todo: refactor this logic, may not have to place fetchInappNotifications here
    fetchInappNotifications({
      proxyId: currentProxyId,
      notificationTab: selectedFilterTab
    } as GetNotificationParams)
      .then((rs) => {
        setNotifications(rs);
        setTimeout(() => setLoading(false), 300);
      })
      .catch(console.error);
  }, [currentProxyId, selectedFilterTab]);

  useEffect(() => {
    let isSync = true;

    setLoading(true);
    fetchInappNotifications({
      proxyId: currentProxyId,
      notificationTab: NotificationTab.ALL
    } as GetNotificationParams)
      .then((rs) => {
        if (isSync) {
          setNotifications(rs);
          setTimeout(() => setLoading(false), 300);
        }
      })
      .catch(console.error);

    return () => {
      isSync = false;
    };
  }, [currentProxyId, isAllAccount, refreshNotificationsTriggerKey]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestampMs(Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      {!isInModal && (
        <SwSubHeader
          background={'transparent'}
          center
          onBack={onClickBack}
          paddingVertical
          rightButtons={[
            {
              icon: (
                <Icon
                  customSize={'24px'}
                  phosphorIcon={GearSix}
                  type='phosphor'
                  weight={'bold'}
                />
              ),
              onClick: openNotificationSetting
            }
          ]}
          showBackButton
          title={t('Notifications')}
        />
      )}

      <div className={'tool-area'}>
        <FilterTabs
          className={'filter-tabs-container'}
          items={filterTabItems}
          onSelect={onSelectFilterTab}
          selectedItem={selectedFilterTab}
        />
        <Button
          className={'__filter-tab-mark-read-button'}
          icon={ (
            <Icon
              phosphorIcon={Checks}
              weight={'fill'}
            />
          )}
          onClick={handleSwitchClick}
          schema={'secondary'}
          size='xs'
          type='ghost'
        >
          {t('Mark all as read')}
        </Button>
      </div>

      {enableNotification
        ? (
          <>
            <div className={'list-container-wrapper'}>
              <Search
                actionBtnIcon={<Icon phosphorIcon={FadersHorizontal} />}
                className={'__search-box'}
                onSearch={handleSearch}
                placeholder={t<string>('Search notification')}
                searchValue={currentSearchText}
                simpleLayout
              />
              {loading
                ? <div className={'indicator-wrapper'}><ActivityIndicator size={32} /></div>
                : (
                  <SwList
                    className={'__list-container'}
                    list={filteredNotificationItems}
                    renderItem={renderItem}
                    renderWhenEmpty={renderEmptyList}
                    searchableMinCharactersCount={2}
                  />
                )}
            </div>
          </>
        )
        : (
          renderEnableNotification()
        )}
    </>
  );
}

const Wrapper = (props: WrapperProps) => {
  const dataContext = useContext(DataContext);
  const { className, isModal, modalProps } = props;
  const { t } = useTranslation();
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const [refreshNotificationsTriggerKey, setRefreshNotificationsTriggerKey] = useState('');
  const [notificationItemActionsModalProps, setNotificationItemActionsModalProps] = useState<NotificationItemActionsModalProps | undefined>();
  const [isNotificationSettingModalVisible, setIsNotificationSettingModalVisible] = useState<boolean>(false);

  const refreshNotifications = useCallback(() => {
    setRefreshNotificationsTriggerKey(`${Date.now()}`);
  }, []);

  const openNotificationItemActionsModal = useCallback((_props: NotificationItemActionsModalProps) => {
    setNotificationItemActionsModalProps(_props);
    activeModal(NOTIFICATION_DETAIL_MODAL);
  }, [activeModal]);

  const closeNotificationItemActionsModal = useCallback(() => {
    inactiveModal(NOTIFICATION_DETAIL_MODAL);
    setNotificationItemActionsModalProps(undefined);
  }, [inactiveModal]);

  const notificationItemActionsModalHandler = useMemo<Props['notificationItemActionsModal']>(() => ({
    open: openNotificationItemActionsModal,
    close: closeNotificationItemActionsModal
  }), [closeNotificationItemActionsModal, openNotificationItemActionsModal]);

  const notificationSettingModalId = useMemo(() => {
    return `${modalProps?.modalId || ''}_setting`;
  }, [modalProps?.modalId]);

  const openNotificationSettingModal = useCallback(() => {
    setIsNotificationSettingModalVisible(true);
    activeModal(notificationSettingModalId);
  }, [activeModal, notificationSettingModalId]);

  const closeNotificationSettingModal = useCallback(() => {
    inactiveModal(notificationSettingModalId);
    setIsNotificationSettingModalVisible(true);
  }, [inactiveModal, notificationSettingModalId]);

  const notificationSettingModalProps = useMemo(() => ({
    modalId: notificationSettingModalId,
    onBack: closeNotificationSettingModal,
    onCancel: () => {
      closeNotificationSettingModal();
      modalProps?.onCancel();
    }
  }), [closeNotificationSettingModal, modalProps, notificationSettingModalId]);

  const mainComponent = (
    <PageWrapper
      className={isModal ? '__layout-container' : CN(className, '-screen-container')}
      hideLoading={true}
      resolve={dataContext.awaitStores(['earning'])}
    >
      <Component
        isInModal={isModal}
        modalProps={modalProps}
        notificationItemActionsModal={notificationItemActionsModalHandler}
        openNotificationSettingModal={openNotificationSettingModal}
        refreshNotifications={refreshNotifications}
        refreshNotificationsTriggerKey={refreshNotificationsTriggerKey}
      />
    </PageWrapper>
  );

  return (
    <>
      {
        isModal && !!modalProps
          ? (
            <BaseModal
              className={CN(className, '-modal-container')}
              destroyOnClose={true}
              id={modalProps.modalId}
              onCancel={modalProps.onCancel}
              rightIconProps={{
                icon: (
                  <Icon
                    customSize={'24px'}
                    phosphorIcon={GearSix}
                    type='phosphor'
                    weight={'bold'}
                  />
                ),
                onClick: openNotificationSettingModal
              }}
              title={t('Notifications')}
            >
              {mainComponent}
            </BaseModal>
          )
          : mainComponent
      }

      {
        !!notificationItemActionsModalProps && (
          <NotificationItemActionsModal
            {...notificationItemActionsModalProps}
          />
        )
      }

      {
        isNotificationSettingModalVisible && (
          <NotificationSetting
            isModal
            modalProps={notificationSettingModalProps}
          />
        )
      }
    </>
  );
};

const Notification = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return ({
    '.tool-area': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },

    '.filter-tabs-container': {
      '.__tab-item-label': {
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        paddingTop: 0,
        paddingBottom: 4
      },

      '.__tab-item:after': {
        borderColor: token.colorSecondary
      },

      '.__filter-tab-mark-read-button': {
        paddingRight: 0
      }
    },

    '.notification-empty-with-button': {
      '.empty-list-inner': {
        gap: 0
      },
      '.empty_icon_wrapper': {
        paddingBottom: 26
      },
      '.empty_text_container': {
        paddingBottom: 24
      }
    },

    '.notification-empty-list': {
      marginTop: 4,
      flexDirection: 'row',
      '.empty-list-inner': {
        gap: 26
      }
    },

    '.ant-sw-list-section': {
      paddingTop: token.padding,
      flex: 1,
      marginBottom: token.margin
    },

    '.ant-sw-list-section .ant-sw-list': {
      paddingBottom: 0
    },

    '.item + .item': {
      marginTop: token.marginXS
    },

    '.-read-item': {
      opacity: 0.4
    },

    '.list-container-wrapper': {
      paddingTop: token.paddingSM,
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      overflow: 'auto'
    },

    '.__list-container': {
      flex: 1,
      overflow: 'auto',

      '> div + div': {
        marginTop: token.marginXS
      }
    },

    '.__search-box': {
      marginBottom: token.marginXS
    },

    '.indicator-wrapper': {
      display: 'flex',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },

    '&.-modal-container': {
      '.__layout-container': {
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        overflow: 'auto'
      },

      '.ant-sw-modal-body': {
        flex: 1
      },

      '.tool-area': {
        marginRight: -token.margin
      },

      '.list-container-wrapper': {
        paddingTop: token.paddingSM
      }
    },

    '&.-screen-container': {
      height: '100%',
      backgroundColor: token.colorBgDefault,
      display: 'flex',
      flexDirection: 'column',

      '.tool-area': {
        paddingLeft: token.padding
      },

      '.list-container-wrapper': {
        paddingLeft: token.padding,
        paddingRight: token.padding,
        paddingBottom: token.padding
      }
    }
  });
});

export default Notification;
