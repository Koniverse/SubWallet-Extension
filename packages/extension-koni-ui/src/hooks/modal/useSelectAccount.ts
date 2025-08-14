// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { AccountProxyType } from '@subwallet/extension-base/types';
import { BasicOnChangeFunction } from '@subwallet/extension-koni-ui/components/Field/Base';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { isAccountAll } from '@subwallet/extension-koni-ui/utils';
import { ModalContext } from '@subwallet/react-ui';
import { useCallback, useContext, useMemo, useState } from 'react';

export function useSelectAccount (getAllAddress: string[], modalId: string, onChange?: BasicOnChangeFunction, isSingleSelect?: boolean) {
  const { accountProxies } = useSelector((state) => state.accountState);
  const [selected, setSelected] = useState<string[]>([]);
  const [changeAccounts, setChangeAccounts] = useState<string[]>([]);
  const { inactiveModal } = useContext(ModalContext);
  const accountProxiesCanExport = useMemo(() => {
    return accountProxies.filter((item) => {
      return item.accountType !== AccountProxyType.LEDGER;
    });
  }, [accountProxies]);

  const onChangeSelectedAccounts = useCallback((changeVal: string) => {
    setChangeAccounts((changeAccounts) => {
      let result: string[];
      const isAll = isAccountAll(changeVal);

      if (!changeAccounts.includes(changeVal) && changeAccounts.length === accountProxiesCanExport.length - 2) {
        result = getAllAddress;
      } else if (!changeAccounts.includes(changeVal)) {
        if (!changeVal) {
          result = [];
        } else if (isAll) {
          result = getAllAddress;
        } else if (isSingleSelect) {
          result = [changeVal];
        } else {
          result = [...changeAccounts, changeVal];
        }
      } else {
        if (isAll || isSingleSelect) {
          result = [];
        } else {
          result = changeAccounts.filter((item) => item !== changeVal && item !== ALL_ACCOUNT_KEY);
        }
      }

      return result;
    });
  }, [accountProxiesCanExport.length, getAllAddress, isSingleSelect]);

  const onApplyChangeAccounts = useCallback(() => {
    onChange && onChange({ target: { value: changeAccounts.join(',') } });

    setSelected(changeAccounts);
    inactiveModal(modalId);
  }, [changeAccounts, inactiveModal, modalId, onChange]);

  const onCancelSelectAccount = useCallback(() => {
    setChangeAccounts(selected);
    inactiveModal(modalId);
  }, [selected, inactiveModal, modalId]);

  const onInitAccount = useCallback((defaultValue: string, selected: string) => {
    const _selected = !selected ? [] : selected.split(',');

    setChangeAccounts(_selected);
    setSelected(_selected);
  }, []);

  return {
    onChangeSelectedAccounts,
    changeAccounts,
    onApplyChangeAccounts,
    onCancelSelectAccount,
    onInitAccount
  };
}
