// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountAuthType } from '@subwallet/extension-base/background/types';
import { AuthUrlInfo } from '@subwallet/extension-base/services/request-service/types';
import { AccountChainType, AccountJson, AccountProxy, AccountSignMode } from '@subwallet/extension-base/types';
import { AccountProxyItem, DAppConfigurationModal, EmptyList, Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { DAPP_CONFIGURATION_MODAL } from '@subwallet/extension-koni-ui/constants';
import useDefaultNavigate from '@subwallet/extension-koni-ui/hooks/router/useDefaultNavigate';
import { changeAuthorizationPerSite } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ManageWebsiteAccessDetailParam } from '@subwallet/extension-koni-ui/types/navigation';
import { convertAuthorizeTypeToChainTypes, getSignMode, getSignModeByAccountProxy } from '@subwallet/extension-koni-ui/utils';
import { Icon, ModalContext, Switch, SwList } from '@subwallet/react-ui';
import { GearSix, MagnifyingGlass } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps & ManageWebsiteAccessDetailParam & {
  authInfo: AuthUrlInfo;
  goBack: () => void
};

type WrapperProps = ThemeProps;

interface AccountAddressValidationConditions {
  accountAuthTypes: AccountAuthType[];
  isSubstrateConnector?: boolean;
  accountSignMode?: AccountSignMode;
}

const isValidAccountChainType = (chainType: AccountChainType, conditions: AccountAddressValidationConditions): boolean => {
  const { accountAuthTypes, accountSignMode, isSubstrateConnector } = conditions;

  if (!accountAuthTypes) {
    return false;
  }

  switch (chainType) {
    case AccountChainType.SUBSTRATE: return accountAuthTypes.includes('substrate');
    case AccountChainType.ETHEREUM: return accountAuthTypes.includes('evm') && (isSubstrateConnector || accountSignMode !== AccountSignMode.ECDSA_SUBSTRATE_LEDGER);
    case AccountChainType.TON: return accountAuthTypes.includes('ton');
    case AccountChainType.CARDANO: return accountAuthTypes.includes('cardano');
  }

  return false;
};

const dAppConfigurationModalId = DAPP_CONFIGURATION_MODAL;

function Component ({ accountAuthTypes, authInfo, className = '', goBack, origin, siteName }: Props): React.ReactElement<Props> {
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const [pendingMap, setPendingMap] = useState<Record<string, boolean>>({});
  const { activeModal } = useContext(ModalContext);
  const { t } = useTranslation();
  const accountProxyItems = useMemo(() => {
    return accountProxies.filter((ap) => {
      const accountSignMode = getSignModeByAccountProxy(ap);

      return ap.id !== 'ALL' && ap.chainTypes.some((chainType) => isValidAccountChainType(chainType, {
        accountAuthTypes,
        accountSignMode,
        isSubstrateConnector: authInfo.isSubstrateConnector
      }));
    });
  }, [accountAuthTypes, accountProxies, authInfo.isSubstrateConnector]);

  const onOpenDAppConfigurationModal = useCallback(() => {
    activeModal(dAppConfigurationModalId);
  }, [activeModal]);

  const renderItem = useCallback((item: AccountProxy) => {
    const isEnabled: boolean = item.accounts.some((account) => authInfo.isAllowedMap[account.address]);

    const onClick = () => {
      setPendingMap((prevMap) => {
        return {
          ...prevMap,
          [item.id]: !isEnabled
        };
      });
      const newAllowedMap = { ...authInfo.isAllowedMap };

      item.accounts.forEach((account) => {
        if (isValidAccountChainType(account.chainType, {
          accountAuthTypes: authInfo.accountAuthTypes,
          accountSignMode: getSignMode(account),
          isSubstrateConnector: authInfo.isSubstrateConnector
        })) {
          newAllowedMap[account.address] = !isEnabled;
        }
      });

      changeAuthorizationPerSite({ values: newAllowedMap, id: authInfo.id })
        .catch(console.log)
        .finally(() => {
          setPendingMap((prevMap) => {
            const newMap = { ...prevMap };

            if (newMap[item.id]) {
              delete newMap[item.id];
            }

            return newMap;
          });
        });
    };

    return (
      <AccountProxyItem
        accountProxy={item}
        chainTypes={convertAuthorizeTypeToChainTypes(authInfo.accountAuthTypes, item.chainTypes)}
        className={'__account-proxy-connect-item'}
        key={item.id}
        rightPartNode={(
          <Switch
            checked={pendingMap[item.id] === undefined ? isEnabled : pendingMap[item.id]}
            disabled={!authInfo.isAllowed || pendingMap[item.id] !== undefined}
            {...{ onClick }}
            style={{ marginRight: 8 }}
          />
        )}
      />
    );
  }, [authInfo.accountAuthTypes, authInfo.id, authInfo.isAllowed, authInfo.isAllowedMap, authInfo.isSubstrateConnector, pendingMap]);

  const searchFunc = useCallback((item: AccountJson, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();

    return (
      item.name
        ? item.name.toLowerCase().includes(searchTextLowerCase)
        : false
    );
  }, []);

  useEffect(() => {
    setPendingMap((prevMap) => {
      if (!Object.keys(prevMap).length) {
        return prevMap;
      }

      return {};
    });
  }, [authInfo]);

  const renderEmptyList = useCallback(() => {
    return (
      <EmptyList
        emptyMessage={t('Your accounts will appear here.')}
        emptyTitle={t('No account found')}
        phosphorIcon={MagnifyingGlass}
      />
    );
  }, [t]);

  return (
    <PageWrapper className={`manage-website-access-detail ${className}`}>
      <Layout.WithSubHeaderOnly
        onBack={goBack}
        subHeaderIcons={[
          {
            icon: (
              <Icon
                phosphorIcon={GearSix}
                size='md'
                type='phosphor'
                weight='bold'
              />
            ),
            onClick: onOpenDAppConfigurationModal
          }
        ]}
        title={siteName || authInfo.id}
      >
        <SwList.Section
          className={'list-account-item'}
          enableSearchInput
          list={accountProxyItems}
          renderItem={renderItem}
          renderWhenEmpty={renderEmptyList}
          searchFunction={searchFunc}
          searchMinCharactersCount={2}
          searchPlaceholder={t<string>('Search account')}
        />

        <DAppConfigurationModal
          authInfo={authInfo}
        />
      </Layout.WithSubHeaderOnly>
    </PageWrapper>
  );
}

function WrapperComponent (props: WrapperProps) {
  const location = useLocation();
  const { accountAuthTypes, origin, siteName } = location.state as ManageWebsiteAccessDetailParam;
  const authInfo: undefined | AuthUrlInfo = useSelector((state: RootState) => state.settings.authUrls[origin]);
  const goBack = useDefaultNavigate().goBack;

  useEffect(() => {
    if (!authInfo) {
      goBack();
    }
  }, [goBack, authInfo]);

  return (
    <>
      {!!authInfo && (
        <Component
          {...props}
          accountAuthTypes={accountAuthTypes}
          authInfo={authInfo}
          goBack={goBack}
          origin={origin}
          siteName={siteName}
        />)}
    </>
  );
}

const ManageWebsiteAccessDetail = styled(WrapperComponent)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-list-section': {
      height: '100%'
    },

    '&.manage-website-access-detail': {
      backgroundColor: token.colorBgDefault
    },

    '.__account-proxy-connect-item .__item-middle-part': {
      textWrap: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      fontWeight: 600,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6
    },
    '.ant-sw-screen-layout-body': {
      paddingTop: token.paddingSM
    },

    '.list-account-item .ant-sw-list': {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  });
});

export default ManageWebsiteAccessDetail;
