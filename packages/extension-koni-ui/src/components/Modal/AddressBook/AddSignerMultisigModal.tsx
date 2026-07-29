// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ActionType } from '@subwallet/extension-base/core/types';
import { AccountProxyType, AccountSignMode } from '@subwallet/extension-base/types';
import { AddressSelectorItem } from '@subwallet/extension-koni-ui/components';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { SignerData } from '@subwallet/extension-koni-ui/Popup/Account/NewMultisigAccount';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getSignModeByAccountProxy, isAccountAll, reformatAddress } from '@subwallet/extension-koni-ui/utils';
import { isSubstrateAddress } from '@subwallet/keyring';
import { Button, Icon, ModalContext, SwList, SwModal } from '@subwallet/react-ui';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import CN from 'classnames';
import { Eye, GitCommit, Needle, PlusCircle, QrCode, Question, Strategy, Swatches, UserSwitch, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { GeneralEmptyList } from '../../EmptyList';

interface Props extends ThemeProps {
  value?: string;
  id: string;
  actionType?: ActionType;
  selectedSigners?: SignerData[]
  onConfirm: (selectedItems: SignerData[]) => void;
}

const renderEmpty = () => <GeneralEmptyList />;

type GroupKey =
  | AccountProxyType.SOLO
  | AccountProxyType.UNIFIED
  | AccountProxyType.QR
  | AccountProxyType.MULTISIG
  | AccountProxyType.LEDGER
  | AccountProxyType.READ_ONLY
  | AccountProxyType.INJECTED
  | AccountProxyType.UNKNOWN;

interface SignerItem {
  displayName?: string;
  formatedAddress: string;
  address: string;
  proxyId?: string;
  accountType: GroupKey;
  analyzedGroup: GroupKey;
}

const Component: React.FC<Props> = (props: Props) => {
  const { actionType, className, id, onConfirm, selectedSigners = [] } = props;
  const [checkedSigners, setCheckedSigners] = useState<SignerData[]>([]);
  const disabledAddressList = useMemo(() => {
    return selectedSigners.map((s) => s.address);
  }, [selectedSigners]);

  const { t } = useTranslation();

  const { checkActive, inactiveModal } = useContext(ModalContext);

  const isActive = checkActive(id);

  const { accountProxies } = useSelector((state) => state.accountState);

  const sectionRef = useRef<SwListSectionRef>(null);

  const items = useMemo((): SignerItem[] => {
    const result: SignerItem[] = [];

    accountProxies.forEach((ap) => {
      if (isAccountAll(ap.id)) {
        return;
      }

      if (ap.accountType === AccountProxyType.LEDGER) {
        const account = ap.accounts[0];

        if (account.signMode !== AccountSignMode.GENERIC_LEDGER) {
          return;
        }
      }

      if (actionType === ActionType.SEND_NFT) {
        const signMode = getSignModeByAccountProxy(ap);

        if (signMode === AccountSignMode.ECDSA_SUBSTRATE_LEDGER) {
          return;
        }
      }

      ap.accounts.forEach((acc) => {
        const formatedAddress = reformatAddress(acc.address);

        if (isSubstrateAddress(formatedAddress)) {
          result.push({
            displayName: ap.name || acc.name,
            formatedAddress,
            address: acc.address,
            accountType: ap.accountType as GroupKey,
            analyzedGroup: ap.accountType as GroupKey,
            proxyId: ap.id
          });
        }
      });
    });

    return result.sort((a, b) => {
      const groupCompare = a.analyzedGroup.localeCompare(b.analyzedGroup);

      if (groupCompare !== 0) {
        return groupCompare;
      }

      return (a.displayName || a.formatedAddress).localeCompare(b.displayName || b.formatedAddress);
    });
  }, [accountProxies, actionType]);

  const onClose = useCallback(() => {
    inactiveModal(id);
  }, [id, inactiveModal]);

  const onAddSigner = useCallback(() => {
    onConfirm(checkedSigners);
    inactiveModal(id);
  }, [checkedSigners, onConfirm, inactiveModal, id]);

  const onClickItem = useCallback((item: SignerItem) => {
    return () => {
      if (disabledAddressList.includes(item.address)) {
        return;
      }

      setCheckedSigners((prev) => {
        const isExists = prev.some((s) => s.address === item.address);

        if (isExists) {
          return prev.filter((s) => s.address !== item.address);
        } else {
          const newSigner: SignerData = {
            address: item.address,
            displayName: item.displayName,
            proxyId: item.proxyId,
            formatedAddress: item.formatedAddress
          };

          return [...prev, newSigner];
        }
      });
    };
  }, [disabledAddressList]);

  const renderItem = useCallback((item: SignerItem) => {
    const isChecked = checkedSigners.some((s) => s.address === item.address);
    const isDisabled = disabledAddressList.includes(item.address);
    const iconMap: Record<GroupKey, { className?: string; icon: typeof Strategy }> = {
      [AccountProxyType.UNIFIED]: {
        className: '-is-unified',
        icon: Strategy
      },
      [AccountProxyType.SOLO]: {
        className: '-is-solo',
        icon: GitCommit
      },
      [AccountProxyType.QR]: {
        icon: QrCode
      },
      [AccountProxyType.READ_ONLY]: {
        icon: Eye
      },
      [AccountProxyType.LEDGER]: {
        icon: Swatches
      },
      [AccountProxyType.INJECTED]: {
        icon: Needle
      },
      [AccountProxyType.MULTISIG]: {
        className: '-is-multisig',
        icon: UserSwitch
      },
      [AccountProxyType.UNKNOWN]: {
        icon: Question
      }
    };

    const itemIcon = iconMap[item.accountType];

    return (
      <div
        className={CN('__list-item-wrapper', { '-disabled': isDisabled })}
        key={item.address}
      >
        <AddressSelectorItem
          address={item.formatedAddress}
          avatarValue={item.proxyId || item.formatedAddress}
          className={CN('__list-item', { '-disabled': isDisabled })}
          isSelected={isChecked || isDisabled}
          name={item.displayName}
          onClick={onClickItem(item)}
          showUnselectIcon={true}
        />

        <div className='__item-account-type-icon-wrapper'>
          <div className={CN('__item-account-type-icon', itemIcon.className)}>
            <Icon
              customSize='10px'
              phosphorIcon={itemIcon.icon}
              weight='fill'
            />
          </div>
        </div>
      </div>
    );
  }, [checkedSigners, disabledAddressList, onClickItem]);

  const searchFunction = useCallback((item: SignerItem, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();

    return (
      item.formatedAddress.toLowerCase().includes(searchTextLowerCase) ||
      (item.displayName
        ? item.displayName.toLowerCase().includes(searchTextLowerCase)
        : false)
    );
  }, []);

  const groupSeparator = useCallback((group: SignerItem[], _idx: number, groupKey: string) => {
    const _group = groupKey as GroupKey;

    const groupMap: Record<GroupKey, { label: string }> = {
      [AccountProxyType.UNIFIED]: {
        label: t('ui.ACCOUNT.components.AccountProxy.TypeTag.unifiedAccount')
      },
      [AccountProxyType.SOLO]: {
        label: t('ui.ACCOUNT.components.AccountProxy.TypeTag.soloAccount')
      },
      [AccountProxyType.QR]: {
        label: t('ui.ACCOUNT.components.AccountProxy.TypeTag.qrSignerAccount')
      },
      [AccountProxyType.READ_ONLY]: {
        label: t('ui.ACCOUNT.components.AccountProxy.TypeTag.watchOnlyAccount')
      },
      [AccountProxyType.LEDGER]: {
        label: t('ui.ACCOUNT.components.AccountProxy.TypeTag.ledgerAccount')
      },
      [AccountProxyType.INJECTED]: {
        label: t('ui.ACCOUNT.components.AccountProxy.TypeTag.injectedAccount')
      },
      [AccountProxyType.MULTISIG]: {
        label: t('ui.ACCOUNT.components.AccountProxy.TypeTag.multisigAccount')
      },
      [AccountProxyType.UNKNOWN]: {
        label: t('ui.ACCOUNT.components.AccountProxy.TypeTag.unknownAccount')
      }
    };

    const groupMeta = groupMap[_group];

    return (
      <div className='address-book-group-separator'>
        <span className='address-book-group-label'>{groupMeta.label}</span>
      </div>
    );
  }, [t]);

  const footerModal = useMemo(() => {
    const isAddButtonDisabled = (() => {
      return !checkedSigners.filter((i) => !disabledAddressList.includes(i.address)).length;
    })();

    return (
      <div className={'footer-button-wrapper'}>
        <Button
          block
          icon={(
            <Icon
              phosphorIcon={XCircle}
              weight={'fill'}
            />
          )}
          onClick={onClose}
          schema='secondary'
        >
          {t('ui.components.Modal.AddressBook.AddSignerMultisigModal.cancel')}
        </Button>
        <Button
          block
          disabled={isAddButtonDisabled}
          icon={(
            <Icon
              phosphorIcon={PlusCircle}
              weight={'fill'}
            />
          )}
          onClick={onAddSigner}
        >
          {t('ui.components.Modal.AddressBook.AddSignerMultisigModal.addSigner')}
        </Button>
      </div>
    );
  }, [checkedSigners, disabledAddressList, onAddSigner, onClose, t]);

  useEffect(() => {
    if (!isActive) {
      setTimeout(() => {
        sectionRef.current?.setSearchValue('');
      }, 100);
    }
  }, [isActive, sectionRef]);

  useEffect(() => {
    if (isActive) {
      setCheckedSigners([]);
    }
  }, [isActive]);

  return (
    <>
      <SwModal
        className={CN(className, 'add-signer-multisig-modal')}
        footer={footerModal}
        id={id}
        onCancel={onClose}
        title={t('ui.components.Modal.AddressBook.AddSignerMultisigModal.selectAccount')}
      >
        <SwList.Section
          className={'account-list'}
          enableSearchInput={true}
          groupBy='analyzedGroup'
          groupSeparator={groupSeparator}
          list={items}
          ref={sectionRef}
          renderItem={renderItem}
          renderWhenEmpty={renderEmpty}
          searchFunction={searchFunction}
          searchMinCharactersCount={2}
          searchPlaceholder={t<string>('ui.components.Modal.AddressBook.Selector.accountName')}
          showActionBtn={false}
        />
      </SwModal>
    </>
  );
};

const AddSignerMultisigModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-body': {
      display: 'flex',
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0
    },

    '.ant-sw-list-section': {
      flex: 1
    },

    '.ant-sw-list': {
      paddingBottom: 0
    },

    '.__list-item': {
      paddingTop: 0,
      paddingBottom: 0,
      '&.-disabled': {
        cursor: 'not-allowed',
        opacity: 0.4
      }
    },

    '.__list-item-wrapper': {
      position: 'relative',

      '.__item-account-type-icon-wrapper': {
        position: 'absolute',
        left: token.padding,
        bottom: token.paddingXS,
        width: 24,
        height: 24,
        pointerEvents: 'none'
      },

      '.__item-account-type-icon': {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 16,
        height: 16,
        borderRadius: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        color: token.colorWhite,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',

        '&.-is-unified': {
          color: token.colorSuccess
        },

        '&.-is-solo': {
          color: token['blue-9']
        },

        '&.-is-multisig': {
          color: token['geekblue-9']
        }
      },

      '&.-disabled .__item-account-type-icon': {
        opacity: 0.5
      }
    },

    '.___list-separator + .__list-item-wrapper, .__list-item-wrapper + .__list-item-wrapper, .__list-item-wrapper + .___list-separator': {
      marginTop: token.sizeXS
    },

    '.ant-sw-list-section-search-wrapper': {
      marginBottom: token.sizeXS
    },

    '.ant-sw-list-section-search-wrapper + .___list-separator': {
      marginTop: token.sizeXS
    },

    '.footer-button-wrapper': {
      display: 'flex',
      gap: 4
    },

    '.ant-sw-modal-footer': {
      borderTop: 0
    },

    '.account-list': {
      display: 'flex',
      flexDirection: 'column',
      flex: '1',
      overflow: 'hidden'
    },

    '.address-book-group-separator': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXXS,
      fontWeight: token.fontWeightStrong,
      fontSize: 11,
      lineHeight: '20px',
      textTransform: 'uppercase',

      '.address-book-group-label': {
        color: token.colorTextTertiary
      },

      '.address-book-group-counter': {
        color: token.colorTextTertiary
      }
    }
  };
});

export default AddSignerMultisigModal;
