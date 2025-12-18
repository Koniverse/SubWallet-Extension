// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ActionType } from '@subwallet/extension-base/core/types';
import { _isChainInfoCompatibleWithAccountInfo } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountSignMode, AnalyzeAddress, AnalyzedGroup } from '@subwallet/extension-base/types';
import { _reformatAddressWithChain, getAccountChainTypeForAddress } from '@subwallet/extension-base/utils';
import { AddressSelectorItem } from '@subwallet/extension-koni-ui/components';
import { useChainInfo, useCoreCreateReformatAddress, useFilterModal, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { useGetExcludedTokens } from '@subwallet/extension-koni-ui/hooks/assets';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getSignModeByAccountProxy, isAccountAll, sortFuncAnalyzeAddress } from '@subwallet/extension-koni-ui/utils';
import { getKeypairTypeByAddress } from '@subwallet/keyring';
import { Button, Icon, ModalContext, SwList, SwModal } from '@subwallet/react-ui';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import CN from 'classnames';
import { PlusCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { GeneralEmptyList } from '../../EmptyList';

interface Props extends ThemeProps {
  value?: string;
  id: string;
  chainSlug?: string;
  tokenSlug?: string;
  actionType?: ActionType;
  selectedSigners?: string[]
  onConfirm: (addresses: string[]) => void;
}

const renderEmpty = () => <GeneralEmptyList />;

const Component: React.FC<Props> = (props: Props) => {
  const { actionType, chainSlug, className, id, onConfirm, selectedSigners = [], tokenSlug = '', value = '' } = props;
  const [checkedAddresses, setCheckedAddresses] = React.useState<string[]>([]);

  const { t } = useTranslation();

  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);

  const isActive = checkActive(id);

  const { accountProxies, contacts, recent } = useSelector((state) => state.accountState);

  const chainInfo = useChainInfo(chainSlug);

  const getReformatAddress = useCoreCreateReformatAddress();

  const getExcludedTokenByAccountProxy = useGetExcludedTokens();

  const filterModal = useMemo(() => `${id}-filter-modal`, [id]);

  const { onResetFilter, selectedFilters } = useFilterModal(filterModal);

  const sectionRef = useRef<SwListSectionRef>(null);

  const items = useMemo((): AnalyzeAddress[] => {
    if (!chainInfo) {
      return [];
    }

    const result: AnalyzeAddress[] = [];

    (!selectedFilters.length || selectedFilters.includes(AnalyzedGroup.RECENT)) && recent.forEach((acc) => {
      const chains = acc.recentChainSlugs || [];

      if (chainSlug && chains.includes(chainSlug)) {
        result.push({
          displayName: acc.name,
          formatedAddress: _reformatAddressWithChain(acc.address, chainInfo),
          address: acc.address,
          analyzedGroup: AnalyzedGroup.RECENT
        });
      }
    });

    (!selectedFilters.length || selectedFilters.includes(AnalyzedGroup.CONTACT)) && contacts.forEach((acc) => {
      if (_isChainInfoCompatibleWithAccountInfo(chainInfo, {
        chainType: getAccountChainTypeForAddress(acc.address),
        type: getKeypairTypeByAddress(acc.address)
      })) {
        result.push({
          displayName: acc.name,
          formatedAddress: _reformatAddressWithChain(acc.address, chainInfo),
          address: acc.address,
          analyzedGroup: AnalyzedGroup.CONTACT
        });
      }
    });

    (!selectedFilters.length || selectedFilters.includes(AnalyzedGroup.WALLET)) && accountProxies.forEach((ap) => {
      if (isAccountAll(ap.id)) {
        return;
      }

      // todo: recheck with ledger
      const excludedTokens = getExcludedTokenByAccountProxy([chainInfo.slug], ap);

      if (excludedTokens.includes(tokenSlug)) {
        return;
      }

      if (actionType === ActionType.SEND_NFT) {
        const signMode = getSignModeByAccountProxy(ap);

        if (signMode === AccountSignMode.ECDSA_SUBSTRATE_LEDGER) {
          return;
        }
      }

      ap.accounts.forEach((acc) => {
        const formatedAddress = getReformatAddress(acc, chainInfo);

        if (formatedAddress) {
          result.push({
            displayName: acc.name,
            formatedAddress,
            address: acc.address,
            analyzedGroup: AnalyzedGroup.WALLET,
            proxyId: ap.id
          });
        }
      });
    });

    // todo: may need better solution for this sorting below

    return result
      .sort(sortFuncAnalyzeAddress);
  }, [accountProxies, actionType, chainInfo, chainSlug, contacts, getExcludedTokenByAccountProxy, getReformatAddress, recent, selectedFilters, tokenSlug]);

  const onClose = useCallback(() => {
    inactiveModal(id);
    onResetFilter();
  }, [id, inactiveModal, onResetFilter]);

  const onAddSigner = useCallback(() => {
    onConfirm(checkedAddresses);
    inactiveModal(id);
  }, [checkedAddresses, onConfirm, inactiveModal, id]);

  const onClickItem = useCallback((item: AnalyzeAddress) => {
    return () => {
      // Nếu address đã có trong danh sách selectedSigners (đã add vào form rồi) thì bỏ qua
      if (selectedSigners.includes(item.address)) {
        return;
      }

      setCheckedAddresses((prev) => {
        if (prev.includes(item.address)) {
          return prev.filter((addr) => addr !== item.address); // Bỏ chọn
        } else {
          return [...prev, item.address]; // Chọn thêm
        }
      });
    };
  }, [selectedSigners]);

  const renderItem = useCallback((item: AnalyzeAddress) => {
    // Item được coi là selected nếu nó nằm trong state local HOẶC đã có sẵn ở form cha
    const isChecked = checkedAddresses.includes(item.address);
    const isDisabled = selectedSigners.includes(item.address);

    return (
      <AddressSelectorItem
        address={item.address}
        className={CN('__list-item', { '-disabled': isDisabled })}
        isSelected={isChecked || isDisabled} // Hiển thị tick xanh
        key={item.address}
        name={item.displayName}
        onClick={onClickItem(item)}
        // isSelected={true} // Props giả định để hiện icon check
      />
    );
  }, [checkedAddresses, selectedSigners, onClickItem]);

  useEffect(() => {
    if (!isActive) {
      setTimeout(() => {
        sectionRef.current?.setSearchValue('');
      }, 100);
    }
  }, [isActive, sectionRef]);

  useEffect(() => {
    if (isActive) {
      setCheckedAddresses([]);
    }
  }, [isActive]);

  return (
    <>
      <SwModal
        className={CN(className, 'add-signer-multisig-modal')}
        footer={(
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
              {'Cancel'}
            </Button>
            <Button
              block
              icon={(
                <Icon
                  phosphorIcon={PlusCircle}
                  weight={'fill'}
                />
              )}
              onClick={onAddSigner}
            >
              {'Add signer'}
            </Button>
          </div>
        )}
        id={id}
        onCancel={onClose}
        title={t('Select account')}
      >
        <SwList
          className={'account-list'}
          list={items}
          renderItem={renderItem}
          renderWhenEmpty={renderEmpty}
        />
      </SwModal>
    </>
  );
};

const AddSignerMultisigModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-body': {
      display: 'flex'
    },

    '.ant-sw-list-section': {
      flex: 1
    },

    '.ant-sw-list': {
      paddingBottom: 0
    },

    '.___list-separator + .__list-item, .__list-item + .__list-item, .__list-item + .___list-separator': {
      marginTop: token.marginXS
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
      flex: '1'
    }
  };
});

export default AddSignerMultisigModal;
