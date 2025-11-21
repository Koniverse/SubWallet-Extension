// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { APIItemState } from '@subwallet/extension-base/background/KoniTypes';
import { _isChainBitcoinCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { LockedBalanceDetails } from '@subwallet/extension-base/types';
import { AccountTokenBalanceItem, EmptyList, NumberDisplay, RadioGroup } from '@subwallet/extension-koni-ui/components';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { BalanceItemWithAddressType, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { TokenBalanceItemType } from '@subwallet/extension-koni-ui/types/balance';
import { getBitcoinAccountDetails, getBitcoinKeypairAttributes, isAccountAll } from '@subwallet/extension-koni-ui/utils';
import { getKeypairTypeByAddress, isBitcoinAddress } from '@subwallet/keyring';
import { Form, Icon, ModalContext, Number, SwModal, Tooltip, useExcludeModal } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { ArrowCircleLeft, CaretDown, CaretUp, Coins, Info } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { LockedBalanceDetailsModal } from './LockedBalanceDetailsModal';

type Props = ThemeProps & {
  id: string,
  onCancel: () => void,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
  currentTokenInfo?: {
    symbol: string;
    slug: string;
  }
}

type ItemType = {
  symbol: string,
  label: string,
  key: string,
  value: BigN
}

enum ViewValue {
  OVERVIEW = 'Overview',
  DETAIL = 'Detail'
}

interface ViewOption {
  label: string;
  value: ViewValue;
}

interface FormState {
  view: ViewValue
}

const lockedDetailsModalId = 'locked-details-modal';

// todo: need to recheck account balance logic again
function Component ({ className = '', currentTokenInfo, id, onCancel, tokenBalanceMap }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [showLockedDetails, setShowLockedDetails] = useState(false);

  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);

  const isActive = checkActive(id);

  const { accounts, currentAccountProxy, isAllAccount } = useSelector((state) => state.accountState);
  const { balanceMap } = useSelector((state) => state.balance);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [form] = Form.useForm<FormState>();
  const viewValue = Form.useWatch('view', form);

  const balanceInfo = useMemo(
    () => (currentTokenInfo ? tokenBalanceMap[currentTokenInfo.slug] : undefined),
    [currentTokenInfo, tokenBalanceMap]
  );

  const chainInfo = useMemo(
    () => (balanceInfo?.chain ? chainInfoMap[balanceInfo.chain] : undefined),
    [balanceInfo, chainInfoMap]
  );

  const isBitcoinChain = useMemo(() => {
    if (!chainInfo) {
      return false;
    }

    return _isChainBitcoinCompatible(chainInfo);
  }, [chainInfo]);

  const currentView = useMemo(() => {
    if (isBitcoinChain) {
      return ViewValue.DETAIL;
    } else {
      return viewValue;
    }
  }, [isBitcoinChain, viewValue]);

  const defaultValues = useMemo((): FormState => ({
    view: isBitcoinChain ? ViewValue.DETAIL : ViewValue.OVERVIEW
  }), [isBitcoinChain]);

  const viewOptions = useMemo((): ViewOption[] => {
    return [
      {
        label: t('ui.BALANCE.screen.Tokens.DetailModal.tokenDetailsTitle'),
        value: ViewValue.OVERVIEW
      },
      {
        label: t('ui.BALANCE.screen.Tokens.DetailModal.accountDetailsTitle'),
        value: ViewValue.DETAIL
      }
    ];
  }, [t]);

  const overviewItems = useMemo((): ItemType[] => {
    const symbol = currentTokenInfo?.symbol || '';
    const createItem = (key: string, label: string, value: BigN): ItemType => ({
      key,
      symbol,
      label,
      value
    });

    const transferableValue = balanceInfo?.free.value ?? new BigN(0);
    const lockedValue = balanceInfo?.locked.value ?? new BigN(0);

    return [
      createItem('transferable', t('ui.BALANCE.screen.Tokens.DetailModal.transferable'), transferableValue),
      createItem('locked', t('ui.BALANCE.screen.Tokens.DetailModal.locked'), lockedValue)
    ];
  }, [balanceInfo?.free.value, balanceInfo?.locked.value, currentTokenInfo?.symbol, t]);

  const detailItems = useMemo((): BalanceItemWithAddressType[] => {
    if (!currentAccountProxy || !currentTokenInfo?.slug) {
      return [];
    }

    const result: BalanceItemWithAddressType[] = [];

    for (const [accountId, info] of Object.entries(balanceMap)) {
      // Check if account is valid
      const isValidAccount = isAllAccount
        ? !isAccountAll(accountId) && accounts.some((a) => a.address === accountId)
        : currentAccountProxy.accounts.some((a) => a.address === accountId);

      if (!isValidAccount) {
        continue;
      }

      const item = info[currentTokenInfo.slug];

      if (!item || item.state !== APIItemState.READY) {
        continue;
      }

      const totalBalance = new BigN(item.free).plus(BigN(item.locked));

      // Check if balance is greater than 0
      if (totalBalance.lte(0) && (!isBitcoinChain || isAllAccount)) {
        continue;
      }

      // Extend item with addressTypeLabel if needed
      const resultItem: BalanceItemWithAddressType = { ...item };

      if (isBitcoinAddress(item.address)) {
        const keyPairType = getKeypairTypeByAddress(item.address);

        const attributes = getBitcoinKeypairAttributes(keyPairType);

        resultItem.addressTypeLabel = attributes.label;
        resultItem.schema = attributes.schema;
      }

      result.push(resultItem);
    }

    // Sort by total balance in descending order
    return result
      .sort((a, b) => {
        const _isABitcoin = isBitcoinAddress(a.address);
        const _isBBitcoin = isBitcoinAddress(b.address);

        if (_isABitcoin && _isBBitcoin) {
          const aKeyPairType = getKeypairTypeByAddress(a.address);
          const bKeyPairType = getKeypairTypeByAddress(b.address);

          const aDetails = getBitcoinAccountDetails(aKeyPairType);
          const bDetails = getBitcoinAccountDetails(bKeyPairType);

          return aDetails.order - bDetails.order;
        }

        return 0;
      })
      .sort((a, b) => {
        const aTotal = new BigN(a.free).plus(BigN(a.locked));
        const bTotal = new BigN(b.free).plus(BigN(b.locked));

        return bTotal.minus(aTotal).toNumber();
      });
  }, [accounts, balanceMap, currentAccountProxy, currentTokenInfo?.slug, isAllAccount, isBitcoinChain]);

  const symbol = currentTokenInfo?.symbol || '';

  // renderLockedDetails: Renders locked balance as a collapsible section under the main "Locked" balance row.
  const renderLockedDetails = (lockedDetails: LockedBalanceDetails, symbol: string) => {
    if (!lockedDetails) {
      return null;
    }

    const { democracy, governance, others, staking } = lockedDetails;

    const items = [
      { label: t('ui.BALANCE.screen.Tokens.DetailModal.staking'), value: staking },
      { label: t('ui.BALANCE.screen.Tokens.DetailModal.governance'), value: governance },
      { label: t('ui.BALANCE.screen.Tokens.DetailModal.democracy'), value: democracy },
      {
        label: (
          <Tooltip
            placement='topLeft'
            title={t('ui.BALANCE.screen.Tokens.DetailModal.othersTooltipTitle')}
          >
            <span className='__locked-others'>
              {t('ui.BALANCE.screen.Tokens.DetailModal.others')}
              <Icon
                className='__locked-others-icon'
                phosphorIcon={Info}
                size='xs'
              />
            </span>
          </Tooltip>
        ),
        value: others
      }
    ];

    return (
      <div className='__locked-details'>
        {items
          .filter(({ value }) => new BigN(value || 0).gt(0))
          .map(({ label, value }, index) => (
            <div
              className='__row'
              key={index}
            >
              <div className='__label text-accent'>{label}</div>
              <div className='__balance'>
                <NumberDisplay
                  className='__value'
                  decimal={0}
                  decimalOpacity={0.45}
                  intOpacity={0.85}
                  size={14}
                  suffix={symbol}
                  unitOpacity={0.85}
                  value={value || 0}
                />
              </div>
            </div>
          ))}
      </div>
    );
  };

  // Locked Balance Details Modal handlers
  const handleShowLockedDetails = useCallback(() => {
    setShowLockedDetails((prev) => !prev);
  }, []);

  const [lockedDetailsModalVisible, setLockedDetailsModalVisible] = useState(false);
  const [selectedAccountLockedDetails, setSelectedAccountLockedDetails] = useState<LockedBalanceDetails | null>(null);

  const handleOpenLockedDetailsModal = useCallback(
    (details: LockedBalanceDetails) => () => {
      setSelectedAccountLockedDetails(details);
      setLockedDetailsModalVisible(true);
      activeModal(lockedDetailsModalId);
    },
    [activeModal]
  );

  const handleCloseLockedDetailsModal = useCallback(() => {
    setLockedDetailsModalVisible(false);
    inactiveModal(lockedDetailsModalId);
  }, [inactiveModal]);

  useEffect(() => {
    if (!isActive) {
      form?.resetFields();
    }
  }, [form, isActive]);

  useExcludeModal(id);

  return (
    <>
      <SwModal
        className={CN(className, { 'fix-height': isAllAccount })}
        id={id}
        onCancel={onCancel}
        title={(isAllAccount && isBitcoinChain) ? t('ui.BALANCE.screen.Tokens.DetailModal.accountDetailsTitle') : t('ui.BALANCE.screen.Tokens.DetailModal.tokenDetails')}
      >
        <Form
          form={form}
          initialValues={defaultValues}
          name='token-detail-form'
        >
          <Form.Item
            hidden={!isAllAccount || isBitcoinChain}
            name='view'
          >
            <RadioGroup
              optionType='button'
              options={viewOptions}
            />
          </Form.Item>
        </Form>
        <div className='content-container'>
          {
            currentView === ViewValue.OVERVIEW && (
              <>
                <div className={'__container'}>
                  {overviewItems.map((item) => (
                    <React.Fragment key={item.key}>
                      <div className='__row'>
                        <div className='__label'>{item.label}</div>

                        <div className='__balance'>
                          <Number
                            className='__value'
                            decimal={0}
                            decimalOpacity={0.45}
                            intOpacity={0.85}
                            size={14}
                            suffix={item.symbol}
                            unitOpacity={0.85}
                            value={item.value}
                          />
                          {item.key === 'locked' && !!(balanceInfo?.lockedDetails) && (
                            <div
                              className='__locked-balance-details-icon'
                              onClick={handleShowLockedDetails}
                            >
                              <Icon
                                phosphorIcon={showLockedDetails ? CaretUp : CaretDown}
                                size='md'
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {item.key === 'locked' && showLockedDetails && balanceInfo?.lockedDetails && (
                        renderLockedDetails(balanceInfo.lockedDetails, item.symbol)
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </>
            )
          }
          {
            currentView === ViewValue.DETAIL && (
              <>
                {detailItems.length
                  ? (detailItems.map((item) => (
                    <AccountTokenBalanceItem
                      item={item}
                      key={item.address}
                      onShowLockedDetailsModal={
                        item.lockedDetails ? handleOpenLockedDetailsModal(item.lockedDetails) : undefined
                      }
                    />
                  )))
                  : (
                    <>
                      <EmptyList
                        buttonProps={{
                          icon: <Icon
                            phosphorIcon={ArrowCircleLeft}
                            weight={'fill'}
                          />,
                          onClick: onCancel,
                          size: 'xs',
                          shape: 'circle',
                          children: t('ui.BALANCE.screen.Tokens.DetailModal.backToHome')
                        }}
                        className='__empty-list'
                        emptyMessage={t('ui.BALANCE.screen.Tokens.DetailModal.switchTokenToSeeBalance')}
                        emptyTitle={t('ui.BALANCE.screen.Tokens.DetailModal.noAccountWithSymbolBalance', {
                          replace: {
                            symbol: symbol
                          }
                        })}
                        key='empty-list'
                        phosphorIcon={Coins}
                      />
                    </>
                  )}
              </>
            )
          }
        </div>
      </SwModal>

      {!!(lockedDetailsModalVisible && currentTokenInfo && selectedAccountLockedDetails) && (
        <LockedBalanceDetailsModal
          currentTokenInfo={currentTokenInfo}
          id={lockedDetailsModalId}
          lockedDetails={selectedAccountLockedDetails}
          onCancel={handleCloseLockedDetailsModal}
        />
      )}
    </>
  );
}

export const DetailModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '&.fix-height': {
      '.ant-sw-modal-body': {
        height: 470
      }
    },

    '.ant-sw-modal-body': {
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },

    '.content-container': {
      overflow: 'auto',
      flex: 1
    },

    '.__container': {
      borderRadius: token.borderRadiusLG,
      backgroundColor: token.colorBgSecondary,
      padding: '12px 12px 4px'
    },

    '.__explorer-link': {
      marginTop: token.margin
    },

    '.__row': {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: token.marginSM
    },

    '.__label': {
      paddingRight: token.paddingSM
    },

    '.__locked-details': {
      marginTop: 4,

      '.__label': {
        color: token.colorTextLight3
      },

      '.__locked-others': {
        cursor: 'pointer'
      },

      '.__locked-others-icon': {
        color: token.colorTextLight3,
        marginLeft: token.marginXXS
      }
    },

    '.__balance': {
      display: 'flex',
      justifyContent: 'center'
    },

    '.__locked-balance-details-icon': {
      color: token.colorTextLight3,
      cursor: 'pointer',
      marginLeft: token.marginXXS
    }
  });
});
