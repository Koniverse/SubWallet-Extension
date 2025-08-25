// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getTokenPairFromStep } from '@subwallet/extension-base/services/swap-service/utils';
import { ProcessTransactionData, ProcessType, ResponseSubscribeProcessById, SwapBaseTxData } from '@subwallet/extension-base/types';
import { CloseIcon, Layout, LoadingScreen, PageWrapper } from '@subwallet/extension-web-ui/components';
import { SwapTransactionBlock } from '@subwallet/extension-web-ui/components/Swap';
import { FeatureModalContext } from '@subwallet/extension-web-ui/contexts/FeatureModalContextProvider';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { WebUIContext } from '@subwallet/extension-web-ui/contexts/WebUIContext';
import { useDefaultNavigate } from '@subwallet/extension-web-ui/hooks';
import { cancelSubscription, subscribeProcess } from '@subwallet/extension-web-ui/messaging';
import { NotificationScreenParam, ThemeProps } from '@subwallet/extension-web-ui/types';
import { appendSuffixToClasses, isStepCompleted, isStepFailed, isStepFinal, isStepTimeout } from '@subwallet/extension-web-ui/utils';
import { PageIcon } from '@subwallet/react-ui';
import { SwIconProps } from '@subwallet/react-ui/es/icon';
import CN from 'classnames';
import { CheckCircle, ClockCounterClockwise, ProhibitInset, SpinnerGap } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

type SwapProcessingContentComponentProps = {
  processData: ProcessTransactionData;
}

const SwapProcessingContentComponent = (props: SwapProcessingContentComponentProps) => {
  const { t } = useTranslation();
  const { processData } = props;
  const [messageIndex, setMessageIndex] = useState(0);
  const data = processData.combineInfo as SwapBaseTxData;

  const originSwapPair = useMemo(() => {
    return getTokenPairFromStep(data.process.steps);
  }, [data.process.steps]);

  const messages = useMemo<string[]>(() => {
    return [
      t('Tip: Hit “View process” to view step-by-step details of your swap'),
      t('Hanging in there...')
    ];
  }, [t]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className='container'>
      <div className='page-icon'>
        <PageIcon
          color='var(--page-icon-color)'
          iconProps={{
            weight: 'fill',
            phosphorIcon: SpinnerGap,
            className: 'spinner'
          }}
        />
      </div>
      <div className='title'>
        {t('Swap in process')}
      </div>
      <div className='subtitle'>
        {t('DO NOT close the app!')}
      </div>
      <div className='description'>
        {messages[messageIndex]}
      </div>

      <SwapTransactionBlock
        className={'swap-transaction-block'}
        fromAmount={data.quote.fromAmount}
        fromAssetSlug={originSwapPair?.from}
        logoSize={36}
        toAmount={data.quote.toAmount}
        toAssetSlug={originSwapPair?.to}
      />
    </div>
  );
};

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;
  const [searchParams] = useSearchParams();
  const transactionProcessId = searchParams.get('transaction-process-id') || '';
  const [processData, setProcessData] = useState<ProcessTransactionData | undefined>();
  const { isWebUI } = useContext(ScreenContext);
  const { notificationModal: { open: openNotificationModal } } = useContext(FeatureModalContext);
  const { setWebBaseClassName } = useContext(WebUIContext);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goHome } = useDefaultNavigate();

  const viewProgress = useCallback(
    () => {
      if (!isWebUI) {
        navigate('/settings/notification', {
          state: {
            transactionProcess: {
              processId: transactionProcessId,
              triggerTime: `${Date.now()}`
            }
          } as NotificationScreenParam
        });
      } else {
        goHome();

        openNotificationModal({
          transactionProcess: {
            processId: transactionProcessId,
            triggerTime: `${Date.now()}`
          }
        });
      }
    },
    [goHome, isWebUI, navigate, openNotificationModal, transactionProcessId]
  );

  const isFinal = useMemo(() => {
    return isStepFinal(processData?.status);
  }, [processData]);

  const icon = useMemo<SwIconProps['phosphorIcon']>(() => {
    if (isStepCompleted(processData?.status)) {
      return CheckCircle;
    }

    if (isStepFailed(processData?.status)) {
      return ProhibitInset;
    }

    if (isStepTimeout(processData?.status)) {
      return ClockCounterClockwise;
    }

    return SpinnerGap;
  }, [processData?.status]);

  useEffect(() => {
    let cancel = false;
    let id = '';

    const onCancel = () => {
      if (id) {
        cancelSubscription(id).catch(console.error);
      }
    };

    if (transactionProcessId) {
      const updateProcess = (data: ResponseSubscribeProcessById) => {
        if (!cancel) {
          id = data.id;
          setProcessData(data.process);
        } else {
          onCancel();
        }
      };

      subscribeProcess({ processId: transactionProcessId }, updateProcess)
        .then(updateProcess)
        .catch(console.error);
    }

    return () => {
      cancel = true;
      onCancel();
    };
  }, [transactionProcessId]);

  useEffect(() => {
    setWebBaseClassName(appendSuffixToClasses(className, '-web-base-container'));

    return () => {
      setWebBaseClassName('');
    };
  }, [className, setWebBaseClassName]);

  const isSwapProcessing = processData?.type === ProcessType.SWAP;

  return (
    <PageWrapper className={CN(className, {
      '-desktop': isWebUI,
      '-transaction-done': isFinal,
      '-swap-processing': isSwapProcessing,
      '-common-processing': !isSwapProcessing,
      '-processing': !processData || !isFinal,
      '-complete': isStepCompleted(processData?.status),
      '-failed': isStepFailed(processData?.status),
      '-timeout': isStepTimeout(processData?.status)
    })}
    >
      <Layout.WithSubHeaderOnly
        leftFooterButton={processData
          ? ({
            block: true,
            onClick: goHome,
            children: t('Back to home')
          })
          : undefined}
        rightFooterButton={processData
          ? ({
            block: true,
            onClick: viewProgress,
            children: t('View process')
          })
          : undefined}
        subHeaderLeft={<CloseIcon />}
        title={isSwapProcessing ? t('Swap') : t('Submitted')}
      >
        {!processData && (
          <LoadingScreen />
        )}

        {!!processData && isSwapProcessing && !isFinal && (
          <SwapProcessingContentComponent processData={processData} />
        )}

        {
          !!processData && (!isSwapProcessing || isFinal) && (
            <div className='container'>
              <div className='page-icon'>
                <PageIcon
                  color='var(--page-icon-color)'
                  iconProps={{
                    weight: 'fill',
                    phosphorIcon: icon
                  }}
                />
              </div>
              <div className='title'>
                {t('Transaction submitted!')}
              </div>
              <div className='description'>
                {t('View transaction progress in the Notifications screen or go back to home')}
              </div>
            </div>
          )
        }
      </Layout.WithSubHeaderOnly>
    </PageWrapper>
  );
};

const TransactionSubmission = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    textAlign: 'center',

    '.page-icon': {
      display: 'flex',
      justifyContent: 'center'
    },

    '.title': {
      marginBottom: token.margin,
      fontWeight: token.fontWeightStrong,
      fontSize: token.fontSizeHeading3,
      lineHeight: token.lineHeightHeading3,
      color: token.colorTextBase
    },

    '&.-swap-processing': {
      '.spinner': {
        animation: 'swRotate 1.2s linear infinite'
      },

      '.page-icon': {
        marginTop: 24,
        marginBottom: 36
      },

      '.container': {
        paddingLeft: token.padding,
        paddingRight: token.padding
      },

      '.title': {
        marginBottom: token.marginXXS
      },

      '.subtitle': {
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        color: token.colorTextLight1,
        marginBottom: token.margin,
        fontWeight: token.headingFontWeight
      },

      '.description': {
        padding: '0 24px',
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        color: token.colorTextLight4,
        marginBottom: token.margin
      },

      '.swap-transaction-block': {
        '.__summary-quote': {
          marginBottom: 0
        },

        '.__amount-destination': {
          marginTop: 10,
          marginBottom: 4
        }
      }
    },

    '&.-common-processing, &.-transaction-done': {
      '.page-icon': {
        marginTop: 48,
        marginBottom: 40
      },

      '.description': {
        padding: '0 24px',
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        color: token.colorTextLight4,
        marginBottom: token.margin
      }
    },

    '&.-processing': {
      '--page-icon-color': '#D9A33E'
    },

    '&.-complete': {
      '--page-icon-color': token.colorSuccess
    },

    '&.-failed': {
      '--page-icon-color': token.colorError
    },

    '&.-timeout': {
      '--page-icon-color': token.gold
    },

    // desktop
    '.web-ui-enable &-web-base-container': {
      '.title-group .ant-btn': {
        display: 'none'
      }
    },

    '&.-desktop': {
      '.container': {
        width: '100%',
        maxWidth: 416,
        marginLeft: 'auto',
        marginRight: 'auto'
      },

      '.title': {
        marginBottom: 24
      },

      '.ant-sw-screen-layout-body': {
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: 'auto'
      },

      '.ant-sw-screen-layout-footer': {
        maxWidth: 416,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%'
      },

      '.page-icon.page-icon.page-icon': {
        marginTop: 52
      },

      '&.-swap-processing': {
        '.container': {
          paddingBottom: token.padding
        },

        '.description': {
          minHeight: 44,
          marginBottom: 24
        }
      },

      '.ant-sw-screen-layout-footer-button-container': {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingLeft: token.padding,
        paddingRight: token.padding,

        button: {
          marginRight: 0,
          marginLeft: 0
        },

        '.ant-sw-screen-layout-footer-right-button': {
          order: -1,
          marginBottom: token.marginSM
        }
      }
    }
  };
});

export default TransactionSubmission;
