// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicStatus, ExtrinsicType, TransactionDirection, TransactionHistoryItem } from '@subwallet/extension-base/background/KoniTypes';
import { YIELD_EXTRINSIC_TYPES } from '@subwallet/extension-base/koni/api/yield/helper/utils';
import { _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { quickFormatAddressToCompare } from '@subwallet/extension-base/utils';
import { AccountAddressSelector, BasicInputEvent, ChainSelector, EmptyList, FilterModal, HistoryItem, Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { DEFAULT_SESSION_VALUE, HISTORY_DETAIL_MODAL, LATEST_SESSION, REMIND_BACKUP_SEED_PHRASE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useFilterModal, useHistorySelection, useSelector, useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { cancelSubscription, subscribeTransactionHistory } from '@subwallet/extension-koni-ui/messaging';
import { SessionStorage, ThemeProps, TransactionHistoryDisplayData, TransactionHistoryDisplayItem } from '@subwallet/extension-koni-ui/types';
import { customFormatDate, formatHistoryDate, isTypeStaking, isTypeTransfer } from '@subwallet/extension-koni-ui/utils';
import { ButtonProps, Icon, ModalContext, SwIconProps, SwList, SwSubHeader } from '@subwallet/react-ui';
import { Aperture, ArrowDownLeft, ArrowsLeftRight, ArrowUpRight, Clock, ClockCounterClockwise, Database, FadersHorizontal, Rocket, Spinner } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { HistoryDetailModal } from './Detail';

type Props = ThemeProps

const IconMap: Record<string, SwIconProps['phosphorIcon']> = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  claim_reward: ClockCounterClockwise,
  staking: Database,
  crowdloan: Rocket,
  nft: Aperture,
  processing: Spinner,
  default: ClockCounterClockwise,
  timeout: ClockCounterClockwise,
  swap: ArrowsLeftRight
};

function getIcon (item: TransactionHistoryItem): SwIconProps['phosphorIcon'] {
  if (item.status === ExtrinsicStatus.PROCESSING || item.status === ExtrinsicStatus.SUBMITTING) {
    return IconMap.processing;
  }

  if (item.status === ExtrinsicStatus.TIMEOUT) {
    return IconMap.timeout;
  }

  if (item.type === ExtrinsicType.SEND_NFT) {
    return IconMap.nft;
  }

  if (item.type === ExtrinsicType.CROWDLOAN) {
    return IconMap.crowdloan;
  }

  if (item.type === ExtrinsicType.STAKING_CLAIM_REWARD) {
    return IconMap.claim_reward;
  }

  if (item.type === ExtrinsicType.SWAP) {
    return IconMap.swap;
  }

  if (isTypeStaking(item.type)) {
    return IconMap.staking;
  }

  return IconMap.default;
}

function getDisplayData (item: TransactionHistoryItem, nameMap: Record<string, string>, titleMap: Record<string, string>): TransactionHistoryDisplayData {
  let displayData: TransactionHistoryDisplayData;
  const displayTime = item.blockTime || item.time;
  const time = customFormatDate(displayTime, '#hhhh#:#mm#');

  const displayStatus = item.status === ExtrinsicStatus.FAIL ? 'fail' : '';

  if (item.type === ExtrinsicType.TRANSFER_BALANCE || item.type === ExtrinsicType.TRANSFER_TOKEN || item.type === ExtrinsicType.TRANSFER_XCM || item.type === ExtrinsicType.EVM_EXECUTE) {
    if (item.direction === TransactionDirection.RECEIVED) {
      displayData = {
        className: `-receive -${item.status}`,
        title: titleMap.received,
        name: nameMap.received,
        typeName: `${nameMap.received} ${displayStatus} - ${time}`,
        icon: IconMap.receive
      };
    } else {
      displayData = {
        className: `-send -${item.status}`,
        title: titleMap.send,
        name: nameMap.send,
        typeName: `${nameMap.send} ${displayStatus} - ${time}`,
        icon: IconMap.send
      };
    }
  } else {
    const typeName = nameMap[item.type] || nameMap.default;

    displayData = {
      className: `-${item.type} -${item.status}`,
      title: titleMap[item.type],
      typeName: `${typeName} ${displayStatus} - ${time}`,
      name: nameMap[item.type],
      icon: getIcon(item)
    };
  }

  if (item.status === ExtrinsicStatus.PROCESSING) {
    displayData.className = '-processing';
    displayData.typeName = nameMap.processing;
  }

  if (item.status === ExtrinsicStatus.TIMEOUT) {
    displayData.className = '-processing';
    displayData.typeName = nameMap.timeout;
  }

  if (item.status === ExtrinsicStatus.SUBMITTING) {
    displayData.className = '-processing';
    displayData.typeName = nameMap.submitting;
  }

  return displayData;
}

const FILTER_MODAL_ID = 'history-filter-id';

enum FilterValue {
  ALL = 'all',
  TOKENS = 'tokens',
  SEND = 'send',
  RECEIVED = 'received',
  NFT = 'nft',
  STAKE = 'stake',
  CLAIM = 'claim',
  CROWDLOAN = 'crowdloan',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  EARN = 'earn',
  SWAP = 'swap'
}

function getHistoryItemKey (item: Pick<TransactionHistoryItem, 'chain' | 'address' | 'extrinsicHash' | 'transactionId'>) {
  return `${item.chain}-${item.address}-${item.transactionId || item.extrinsicHash}`;
}

function filterDuplicateItems (items: TransactionHistoryItem[]): TransactionHistoryItem[] {
  const result: TransactionHistoryItem[] = [];

  const exclusionMap: Record<string, boolean> = {};

  const getExclusionKey = (i: TransactionHistoryItem): string => {
    if (i.type === ExtrinsicType.TRANSFER_TOKEN) {
      return `${i.direction}_${i.blockNumber}_${ExtrinsicType.TRANSFER_BALANCE}_${i.from}_${i.to}`.toLowerCase();
    }

    return `${i.direction}_${i.blockNumber}_${i.type}_${i.from}_${i.to}`.toLowerCase();
  };

  items.forEach((i) => {
    if (i.origin === 'app' && i.blockNumber > 0 && (i.type === ExtrinsicType.TRANSFER_BALANCE || i.type === ExtrinsicType.TRANSFER_TOKEN)) {
      exclusionMap[getExclusionKey(i)] = true;
    }
  });

  if (!Object.keys(exclusionMap).length) {
    return items;
  }

  items.forEach((i) => {
    if (i.origin === 'subscan' && exclusionMap[getExclusionKey(i)]) {
      return;
    }

    result.push(i);
  });

  return result;
}

const PROCESSING_STATUSES: ExtrinsicStatus[] = [
  ExtrinsicStatus.QUEUED,
  ExtrinsicStatus.SUBMITTING,
  ExtrinsicStatus.PROCESSING
];

const modalId = HISTORY_DETAIL_MODAL;
const remindSeedPhraseModalId = REMIND_BACKUP_SEED_PHRASE_MODAL;
const DEFAULT_ITEMS_COUNT = 20;
const NEXT_ITEMS_COUNT = 10;

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  useSetCurrentPage('/home/history');
  const dataContext = useContext(DataContext);
  const { t } = useTranslation();
  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);
  const { accounts, currentAccountProxy, isAllAccount } = useSelector((root) => root.accountState);
  const { chainInfoMap } = useSelector((root) => root.chainStore);
  const { language } = useSelector((root) => root.settings);
  const [loading, setLoading] = useState<boolean>(true);
  const [rawHistoryList, setRawHistoryList] = useState<TransactionHistoryItem[]>([]);
  const isActive = checkActive(modalId);

  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, selectedFilters } = useFilterModal(FILTER_MODAL_ID);

  const filterFunction = useMemo<(item: TransactionHistoryItem) => boolean>(() => {
    return (item) => {
      if (!selectedFilters.length) {
        return true;
      }

      for (const filter of selectedFilters) {
        if (filter === FilterValue.SEND) {
          if (isTypeTransfer(item.type) && item.direction === TransactionDirection.SEND) {
            return true;
          }
        } else if (filter === FilterValue.RECEIVED) {
          if (isTypeTransfer(item.type) && item.direction === TransactionDirection.RECEIVED) {
            return true;
          }
        } else if (filter === FilterValue.NFT) {
          if (item.type === ExtrinsicType.SEND_NFT) {
            return true;
          }
        } else if (filter === FilterValue.STAKE) {
          if (isTypeStaking(item.type)) {
            return true;
          }
        } else if (filter === FilterValue.CLAIM) {
          if (item.type === ExtrinsicType.STAKING_CLAIM_REWARD) {
            return true;
          }
        } else if (filter === FilterValue.CROWDLOAN) {
          if (item.type === ExtrinsicType.CROWDLOAN) {
            return true;
          }
        } else if (filter === FilterValue.SWAP) {
          if (item.type === ExtrinsicType.SWAP) {
            return true;
          }
        } else if (filter === FilterValue.SUCCESSFUL) {
          if (item.status === ExtrinsicStatus.SUCCESS) {
            return true;
          }
        } else if (filter === FilterValue.FAILED) {
          if (item.status === ExtrinsicStatus.FAIL) {
            return true;
          }
        } else if (filter === FilterValue.EARN) {
          if (YIELD_EXTRINSIC_TYPES.includes(item.type)) {
            return true;
          }
        }
      }

      return false;
    };
  }, [selectedFilters]);

  const filterOptions = useMemo(() => {
    return [
      { label: t('ui.History.sendToken'), value: FilterValue.SEND },
      { label: t('ui.History.receiveToken'), value: FilterValue.RECEIVED },
      { label: t('ui.History.nftTransaction'), value: FilterValue.NFT },
      { label: t('ui.History.earningTransaction'), value: FilterValue.STAKE },
      { label: t('ui.History.claimReward'), value: FilterValue.CLAIM },
      { label: t('ui.History.swap'), value: FilterValue.SWAP },
      // { label: t('ui.History.crowdloanTransaction'), value: FilterValue.CROWDLOAN }, // support crowdloan later
      { label: t('ui.History.successful'), value: FilterValue.SUCCESSFUL },
      { label: t('ui.History.failed'), value: FilterValue.FAILED }
    ];
  }, [t]);

  const accountMap = useMemo(() => {
    return accounts.reduce((accMap, cur) => {
      accMap[cur.address.toLowerCase()] = cur.name || '';

      return accMap;
    }, {} as Record<string, string>);
  }, [accounts]);

  const typeNameMap: Record<string, string> = useMemo((): Record<ExtrinsicType | 'default' | 'submitting' | 'processing' | 'timeout' | 'send' | 'received', string> => ({
    default: t('ui.History.transaction'),
    submitting: t('ui.History.submittingEllipsis'),
    processing: t('ui.History.processingEllipsis'),
    timeout: t('ui.History.timeOut'),
    send: t('ui.History.send'),
    received: t('ui.History.receive'),
    [ExtrinsicType.TRANSFER_BALANCE]: t('ui.History.sendToken'),
    [ExtrinsicType.TRANSFER_TOKEN]: t('ui.History.sendToken'),
    [ExtrinsicType.TRANSFER_XCM]: t('ui.History.sendToken'),
    [ExtrinsicType.SEND_NFT]: t('ui.History.nft'),
    [ExtrinsicType.CROWDLOAN]: t('ui.History.crowdloan'),
    [ExtrinsicType.STAKING_JOIN_POOL]: t('ui.History.stake'),
    [ExtrinsicType.STAKING_LEAVE_POOL]: t('ui.History.unstake'),
    [ExtrinsicType.STAKING_BOND]: t('ui.History.stake'),
    [ExtrinsicType.STAKING_UNBOND]: t('ui.History.unstake'),
    [ExtrinsicType.STAKING_CLAIM_REWARD]: t('ui.History.claimReward'),
    [ExtrinsicType.STAKING_WITHDRAW]: t('ui.History.withdraw'),
    [ExtrinsicType.STAKING_POOL_WITHDRAW]: t('ui.History.withdraw'),
    [ExtrinsicType.STAKING_CANCEL_UNSTAKE]: t('ui.History.cancelUnstake'),
    [ExtrinsicType.STAKING_COMPOUNDING]: t('ui.History.compound'),
    [ExtrinsicType.STAKING_CANCEL_COMPOUNDING]: t('ui.History.cancelCompound'),
    [ExtrinsicType.EVM_EXECUTE]: t('ui.History.evmTransaction'),
    [ExtrinsicType.JOIN_YIELD_POOL]: t('ui.History.stake'),
    [ExtrinsicType.MINT_QDOT]: t('ui.History.mintQDot'),
    [ExtrinsicType.MINT_SDOT]: t('ui.History.mintSDot'),
    [ExtrinsicType.MINT_LDOT]: t('ui.History.mintLDot'),
    [ExtrinsicType.MINT_VDOT]: t('ui.History.mintVDot'),
    [ExtrinsicType.MINT_VMANTA]: t('ui.History.mintVManta'),
    [ExtrinsicType.MINT_STDOT]: t('ui.History.mintStDot'),
    [ExtrinsicType.REDEEM_QDOT]: t('ui.History.redeemQDot'),
    [ExtrinsicType.REDEEM_SDOT]: t('ui.History.redeemSDot'),
    [ExtrinsicType.REDEEM_LDOT]: t('ui.History.redeemLDot'),
    [ExtrinsicType.REDEEM_VDOT]: t('ui.History.redeemVDot'),
    [ExtrinsicType.REDEEM_VMANTA]: t('ui.History.redeemVManta'),
    [ExtrinsicType.REDEEM_STDOT]: t('ui.History.redeemStDot'),
    [ExtrinsicType.UNSTAKE_QDOT]: t('ui.History.unstakeQDot'),
    [ExtrinsicType.UNSTAKE_VDOT]: t('ui.History.unstakeVDot'),
    [ExtrinsicType.UNSTAKE_VMANTA]: t('ui.History.unstakeVManta'),
    [ExtrinsicType.UNSTAKE_LDOT]: t('ui.History.unstakeLDot'),
    [ExtrinsicType.UNSTAKE_SDOT]: t('ui.History.unstakeSDot'),
    [ExtrinsicType.UNSTAKE_STDOT]: t('ui.History.unstakeStDot'),
    [ExtrinsicType.TOKEN_SPENDING_APPROVAL]: t('ui.History.tokenApprove'),
    [ExtrinsicType.SWAP]: t('ui.History.swap'),
    [ExtrinsicType.CLAIM_BRIDGE]: t('ui.History.claimToken'),
    [ExtrinsicType.UNKNOWN]: t('ui.History.unknown')
  }), [t]);

  const typeTitleMap: Record<string, string> = useMemo((): Record<ExtrinsicType | 'default' | 'send' | 'received', string> => ({
    default: t('ui.History.transaction'),
    send: t('ui.History.sendToken'),
    received: t('ui.History.receiveToken'),
    [ExtrinsicType.TRANSFER_BALANCE]: t('ui.History.sendToken'),
    [ExtrinsicType.TRANSFER_TOKEN]: t('ui.History.sendToken'),
    [ExtrinsicType.TRANSFER_XCM]: t('ui.History.sendToken'),
    [ExtrinsicType.SEND_NFT]: t('ui.History.nftTransaction'),
    [ExtrinsicType.CROWDLOAN]: t('ui.History.crowdloanTransaction'),
    [ExtrinsicType.STAKING_JOIN_POOL]: t('ui.History.stakeTransaction'),
    [ExtrinsicType.STAKING_LEAVE_POOL]: t('ui.History.unstakeTransaction'),
    [ExtrinsicType.STAKING_BOND]: t('ui.History.stakeTransaction'),
    [ExtrinsicType.STAKING_UNBOND]: t('ui.History.unstakeTransaction'),
    [ExtrinsicType.STAKING_CLAIM_REWARD]: t('ui.History.claimRewardTransaction'),
    [ExtrinsicType.STAKING_WITHDRAW]: t('ui.History.withdrawTransaction'),
    [ExtrinsicType.STAKING_POOL_WITHDRAW]: t('ui.History.withdrawTransaction'),
    [ExtrinsicType.STAKING_CANCEL_UNSTAKE]: t('ui.History.cancelUnstakeTransaction'),
    [ExtrinsicType.STAKING_COMPOUNDING]: t('ui.History.compoundTransaction'),
    [ExtrinsicType.STAKING_CANCEL_COMPOUNDING]: t('ui.History.cancelCompoundTransaction'),
    [ExtrinsicType.EVM_EXECUTE]: t('ui.History.evmTransaction'),
    [ExtrinsicType.JOIN_YIELD_POOL]: t('ui.History.stakeTransaction'),
    [ExtrinsicType.MINT_QDOT]: t('ui.History.mintQDotTransaction'),
    [ExtrinsicType.MINT_SDOT]: t('ui.History.mintSDotTransaction'),
    [ExtrinsicType.MINT_LDOT]: t('ui.History.mintLDotTransaction'),
    [ExtrinsicType.MINT_VDOT]: t('ui.History.mintVDotTransaction'),
    [ExtrinsicType.MINT_VMANTA]: t('ui.History.mintVMantaTransaction'),
    [ExtrinsicType.MINT_STDOT]: t('ui.History.mintStDotTransaction'),
    [ExtrinsicType.REDEEM_QDOT]: t('ui.History.redeemQDotTransaction'),
    [ExtrinsicType.REDEEM_SDOT]: t('ui.History.redeemSDotTransaction'),
    [ExtrinsicType.REDEEM_LDOT]: t('ui.History.redeemLDotTransaction'),
    [ExtrinsicType.REDEEM_VDOT]: t('ui.History.redeemVDotTransaction'),
    [ExtrinsicType.REDEEM_VMANTA]: t('ui.History.redeemVMantaTransaction'),
    [ExtrinsicType.REDEEM_STDOT]: t('ui.History.redeemStDotTransaction'),
    [ExtrinsicType.UNSTAKE_QDOT]: t('ui.History.unstakeQDotTransaction'),
    [ExtrinsicType.UNSTAKE_VDOT]: t('ui.History.unstakeVDotTransaction'),
    [ExtrinsicType.UNSTAKE_VMANTA]: t('ui.History.unstakeVMantaTransaction'),
    [ExtrinsicType.UNSTAKE_LDOT]: t('ui.History.unstakeLDotTransaction'),
    [ExtrinsicType.UNSTAKE_SDOT]: t('ui.History.unstakeSDotTransaction'),
    [ExtrinsicType.UNSTAKE_STDOT]: t('ui.History.unstakeStDotTransaction'),
    [ExtrinsicType.TOKEN_SPENDING_APPROVAL]: t('ui.History.tokenApproveTransaction'),
    [ExtrinsicType.SWAP]: t('ui.History.swapTransaction'),
    [ExtrinsicType.CLAIM_BRIDGE]: t('ui.History.claimTokenTransaction'),
    [ExtrinsicType.UNKNOWN]: t('ui.History.unknownTransaction')
  }), [t]);

  // Fill display data to history list
  const historyMap = useMemo(() => {
    const finalHistoryMap: Record<string, TransactionHistoryDisplayItem> = {};

    rawHistoryList.forEach((item: TransactionHistoryItem) => {
      // Format display name for account by address
      const fromName = accountMap[quickFormatAddressToCompare(item.from) || ''];
      const toName = accountMap[quickFormatAddressToCompare(item.to) || ''];
      const key = getHistoryItemKey(item);
      const displayTime = item.blockTime || item.time;

      finalHistoryMap[key] = { ...item, fromName, toName, displayData: getDisplayData(item, typeNameMap, typeTitleMap), displayTime };
    });

    return finalHistoryMap;
  }, [accountMap, rawHistoryList, typeNameMap, typeTitleMap]);

  const [currentItemDisplayCount, setCurrentItemDisplayCount] = useState<number>(DEFAULT_ITEMS_COUNT);

  const getHistoryItems = useCallback((count: number) => {
    return Object.values(historyMap).filter(filterFunction)
      .sort((a, b) => {
        if (PROCESSING_STATUSES.includes(a.status) && !PROCESSING_STATUSES.includes(b.status)) {
          return -1;
        } else if (PROCESSING_STATUSES.includes(b.status) && !PROCESSING_STATUSES.includes(a.status)) {
          return 1;
        } else if ((!!b.displayTime && !!a.displayTime) && (b.displayTime !== a.displayTime)) {
          return b.displayTime - a.displayTime;
        } else {
          return (a.apiTxIndex ?? 0) - (b.apiTxIndex ?? 0);
        }
      })
      .slice(0, count);
  }, [filterFunction, historyMap]);

  const [historyItems, setHistoryItems] = useState<TransactionHistoryDisplayItem[]>(getHistoryItems(DEFAULT_ITEMS_COUNT));

  const [currentAccountProxyid] = useState(currentAccountProxy?.id);

  // Handle detail modal
  const { chain, extrinsicHashOrId } = useParams();
  const [selectedItem, setSelectedItem] = useState<TransactionHistoryDisplayItem | null>(null);
  const [openDetailLink, setOpenDetailLink] = useState<boolean>(!!chain && !!extrinsicHashOrId);

  const onOpenDetail = useCallback((item: TransactionHistoryDisplayItem) => {
    return () => {
      setSelectedItem(item);
      activeModal(modalId);
    };
  }, [activeModal]);

  const onCloseDetail = useCallback(() => {
    const infoSession = Date.now();

    const { remind, timeBackup, timeCalculate } = (JSON.parse(localStorage.getItem(LATEST_SESSION) || JSON.stringify(DEFAULT_SESSION_VALUE))) as SessionStorage;

    inactiveModal(modalId);

    if (infoSession - timeCalculate >= timeBackup && remind) {
      activeModal(REMIND_BACKUP_SEED_PHRASE_MODAL);
    }

    setSelectedItem(null);
    setOpenDetailLink(false);
  }, [activeModal, inactiveModal]);

  const onClickFilter = useCallback(() => {
    activeModal(FILTER_MODAL_ID);
  }, [activeModal]);

  useEffect(() => {
    if (extrinsicHashOrId && chain && openDetailLink) {
      const existed = Object.values(historyMap).find((item) => item.chain === chain && (item.transactionId === extrinsicHashOrId || item.extrinsicHash === extrinsicHashOrId));

      if (existed) {
        setSelectedItem(existed);
        inactiveModal(REMIND_BACKUP_SEED_PHRASE_MODAL);
        activeModal(modalId);
      }
    }
  }, [activeModal, chain, extrinsicHashOrId, openDetailLink, historyMap, inactiveModal]);

  useEffect(() => {
    if (isActive) {
      setSelectedItem((selected) => {
        if (selected) {
          const key = getHistoryItemKey(selected);

          return historyMap[key] || null;
        } else {
          return selected;
        }
      });
      inactiveModal(remindSeedPhraseModalId);
    }
  }, [isActive, historyMap, inactiveModal]);

  useEffect(() => {
    if (currentAccountProxy?.id !== currentAccountProxyid) {
      inactiveModal(modalId);
      setSelectedItem(null);
    }
  }, [currentAccountProxyid, currentAccountProxy?.id, inactiveModal]);

  const { accountAddressItems, chainItems, selectedAddress, selectedChain, setSelectedAddress,
    setSelectedChain } = useHistorySelection();

  const emptyList = useCallback(() => {
    return (
      <EmptyList
        emptyMessage={t('ui.History.yourTransactionsWillShowUpHere')}
        emptyTitle={t('ui.History.noTransactionsFound')}
        phosphorIcon={Clock}
      />
    );
  }, [t]);

  const renderItem = useCallback(
    (item: TransactionHistoryDisplayItem) => {
      return (
        <HistoryItem
          item={item}
          key={`${item.extrinsicHash}-${item.address}-${item.direction}`}
          onClick={onOpenDetail(item)}
        />
      );
    },
    [onOpenDetail]
  );

  const groupBy = useCallback((item: TransactionHistoryDisplayItem) => {
    if (PROCESSING_STATUSES.includes(item.status)) {
      return t('ui.History.processing');
    }

    return formatHistoryDate(item.displayTime, language, 'list');
  }, [language, t]);

  const groupSeparator = useCallback((group: TransactionHistoryItem[], idx: number, groupLabel: string) => {
    return (
      <div className='__group-separator'>{groupLabel}</div>
    );
  }, []);

  const onSelectAccount = useCallback((event: BasicInputEvent) => {
    setSelectedAddress(event.target.value);
  }, [setSelectedAddress]);

  const onSelectChain = useCallback((event: BasicInputEvent) => {
    setSelectedChain(event.target.value);
  }, [setSelectedChain]);

  const isChainSelectorEmpty = !chainItems.length;

  const historySelectorsNode = (
    <>
      <ChainSelector
        className={'__history-chain-selector'}
        disabled={isChainSelectorEmpty}
        items={chainItems}
        loading={loading}
        onChange={onSelectChain}
        title={t('ui.History.selectChain')}
        value={selectedChain}
      />

      {
        (isAllAccount || accountAddressItems.length > 1) && (
          <AccountAddressSelector
            autoSelectFirstItem={true}
            className={'__history-address-selector'}
            items={accountAddressItems}
            onChange={onSelectAccount}
            value={selectedAddress}
          />
        )
      }
    </>
  );

  const _onApplyFilter = useCallback(() => {
    onApplyFilter();
    setCurrentItemDisplayCount(DEFAULT_ITEMS_COUNT);
  }, [onApplyFilter]);

  const onLoadMoreItems = useCallback(() => {
    setCurrentItemDisplayCount((prev) => {
      const rawItemsLength = rawHistoryList.filter(filterFunction).length;

      if (prev + NEXT_ITEMS_COUNT > rawItemsLength) {
        return rawItemsLength;
      } else {
        return prev + NEXT_ITEMS_COUNT;
      }
    });
  }, [filterFunction, rawHistoryList]);

  const hasMoreItems = useMemo(() => {
    return rawHistoryList.filter(filterFunction).length > historyItems.length;
  }, [filterFunction, historyItems.length, rawHistoryList]);

  const listSection = useMemo(() => (
    <>
      <div className={'__page-list-area'}>
        <SwList
          groupBy={groupBy}
          groupSeparator={groupSeparator}
          hasMoreItems={hasMoreItems}
          list={historyItems}
          loadMoreItems={onLoadMoreItems}
          renderItem={renderItem}
          renderOnScroll={false}
          renderWhenEmpty={emptyList}
        />
      </div>
    </>
  ), [emptyList, groupBy, groupSeparator, hasMoreItems, historyItems, onLoadMoreItems, renderItem]);

  const headerIcons = useMemo<ButtonProps[]>(() => {
    return [
      {
        icon: (
          <Icon
            customSize={'24px'}
            phosphorIcon={FadersHorizontal}
            type='phosphor'
          />
        ),
        onClick: onClickFilter
      }
    ];
  }, [onClickFilter]);

  const isSelectedChainEvm = useMemo(() => {
    const selectedChainInfo = chainInfoMap[selectedChain];

    return selectedChainInfo && _isChainEvmCompatible(selectedChainInfo);
  }, [chainInfoMap, selectedChain]);

  useEffect(() => {
    let id: string;
    let isSubscribed = true;

    if (!selectedChain) {
      setLoading(false);

      return;
    }

    setLoading(true);

    setCurrentItemDisplayCount(DEFAULT_ITEMS_COUNT);

    subscribeTransactionHistory(
      selectedChain,
      selectedAddress,
      (items: TransactionHistoryItem[]) => {
        if (isSubscribed) {
          setRawHistoryList(isSelectedChainEvm ? filterDuplicateItems(items) : items);
        }

        setLoading(false);
      }
    ).then((res) => {
      id = res.id;

      if (isSubscribed) {
        setRawHistoryList(isSelectedChainEvm ? filterDuplicateItems(res.items) : res.items);
      } else {
        cancelSubscription(id).catch(console.log);
      }
    }).catch((e) => {
      console.log('subscribeTransactionHistory error:', e);
    });

    return () => {
      isSubscribed = false;

      if (id) {
        cancelSubscription(id).catch(console.log);
      }
    };
  }, [isSelectedChainEvm, selectedAddress, selectedChain]);

  useEffect(() => {
    setHistoryItems(getHistoryItems(currentItemDisplayCount));
  }, [currentItemDisplayCount, getHistoryItems]);

  return (
    <>
      <PageWrapper
        className={`history ${className}`}
        resolve={dataContext.awaitStores(['price', 'chainStore', 'assetRegistry', 'balance', 'mantaPay'])}
      >
        <Layout.Base>
          <SwSubHeader
            background={'transparent'}
            center={false}
            className={'history-header'}
            paddingVertical
            rightButtons={headerIcons}
            showBackButton={false}
            title={t('ui.History.history')}
          />

          <div className={'__page-background'}></div>

          <div className={'__page-tool-area'}>
            {historySelectorsNode}
          </div>

          {listSection}
        </Layout.Base>
      </PageWrapper>

      <HistoryDetailModal
        data={selectedItem}
        onCancel={onCloseDetail}
      />

      <FilterModal
        id={FILTER_MODAL_ID}
        onApplyFilter={_onApplyFilter}
        onCancel={onCloseFilterModal}
        onChangeOption={onChangeFilterOption}
        optionSelectionMap={filterSelectionMap}
        options={filterOptions}
      />
    </>
  );
}

const History = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    flexDirection: 'column',

    '.__page-background': {
      position: 'relative',
      zIndex: 1,

      '&:before': {
        content: '""',
        display: 'block',
        height: 190,
        top: 0,
        left: 0,
        right: 0,
        position: 'absolute',
        background: 'linear-gradient(180deg, rgba(76, 234, 172, 0.10) 0%, rgba(76, 234, 172, 0.00) 94.17%)'
      }
    },

    '.__page-tool-area': {
      display: 'flex',
      padding: token.padding,
      paddingTop: 0,
      borderBottomLeftRadius: token.size,
      borderBottomRightRadius: token.size,
      backgroundColor: token.colorBgDefault,
      gap: token.sizeSM,
      position: 'relative',
      zIndex: 2,

      '.__history-address-selector, .__history-chain-selector': {
        height: 40,
        flex: 1,
        flexBasis: '50%',
        borderRadius: 32,
        overflow: 'hidden',

        '&:before': {
          display: 'none'
        },

        '.ant-select-modal-input-wrapper': {
          paddingLeft: token.padding,
          paddingRight: token.padding
        }
      },

      '.__history-address-selector': {
        '.__selected-item-address': {
          display: 'none'
        },

        '.ant-field-container:before': {
          display: 'none'
        },

        '.ant-field-wrapper': {
          minHeight: 40,
          paddingTop: 0,
          paddingBottom: 0
        }
      }
    },

    '.__loading-area': { display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' },

    '.__page-list-area': {
      flex: 1,
      overflow: 'auto',
      position: 'relative',
      zIndex: 2
    },

    '.ant-sw-list': {
      height: '100%',
      overflow: 'auto',
      paddingBottom: token.padding,
      paddingLeft: token.padding,
      paddingRight: token.padding,
      paddingTop: token.paddingSM,

      '.__infinite-loader': {
        opacity: 0
      }
    },

    '.ant-sw-screen-layout-body': {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },

    '.history-header.ant-sw-sub-header-container': {
      marginBottom: 0
    },

    '.ant-sw-list-section': {
      flex: 1
    },
    '.ant-sw-sub-header-container': {
      marginBottom: token.marginXS
    },
    '.history-item + .history-item, .history-item + .___list-separator': {
      marginTop: token.marginXS
    },
    '.___list-separator': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextLight3,
      fontWeight: token.headingFontWeight,
      marginBottom: token.marginXS
    }
  });
});

export default History;
