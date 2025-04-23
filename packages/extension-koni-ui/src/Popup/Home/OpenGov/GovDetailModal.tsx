// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ReferendumInfo } from '@subwallet/extension-base/services/open-gov/type';
import { AmountInput, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Form, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import { CaretLeft } from 'phosphor-react';
import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import TransactionContent from '../../Transaction/parts/TransactionContent';

type Props = ThemeProps & {
  data: _ReferendumInfo | null,
  chain: string | null,
};

export const GovDetailModalId = 'openGovDetailModalId';

const modalId = GovDetailModalId;

function Component ({ className = '', data }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onClickVote = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const modalCloseButton = <Icon
    customSize={'24px'}
    phosphorIcon={CaretLeft}
    type='phosphor'
    weight={'light'}
  />;

  const valueColorSchema = 'blue';

  return (
    <SwModal
      className={`${className}`}
      closeIcon={modalCloseButton}
      id={modalId}
      onCancel={onCancel}
      title={t(data?.title || 'Referendum details')}
    >
      {
        data && (
          <>
            <MetaInfo
              className={'__meta-block'}
              spaceSize={'ms'}
              valueColorScheme={'light'}
            >
              <MetaInfo.Default
                label={t('Name')}
              >
                {data.title}
              </MetaInfo.Default>

              <MetaInfo.Default
                className={'__status-pool'}
                label={t('Status')}
                valueColorSchema={valueColorSchema}
              >
                {data.state.name}
              </MetaInfo.Default>

              {/* <MetaInfo.Default
                className={'-vertical __markdown-container'}
                label={t('Description')}
                valueColorSchema={'gray'}
              >
                <div className='__markdown-wrapper'>
                  <Markdown>{data.polkassemblyContentHtml}</Markdown>
                </div>
              </MetaInfo.Default> */}
            </MetaInfo>

            {/* <div className='__modal-footer'>
              <div className={'__modal-separator'}></div>
              <TransactionContent>
                <Form
                  className={'form-container form-space-sm'}
                  form={form}
                  onFinish={onClickVote}
                >
                  <Form.Item
                    name={'value'}
                    statusHelpAsTooltip={true}
                  >
                    <AmountInput
                      decimals={decimals}
                      maxValue={bondedValue}
                      showMaxButton={true}
                    />
                  </Form.Item>
                </Form>
              </TransactionContent>
            </div> */}
          </>
        )
      }
    </SwModal>
  );
}

export const GovDetailModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-content': {
      paddingBottom: 0,
      maxHeight: 600,
      borderRadius: 0
    },
    '.__item-tag:last-child': {
      marginRight: 0
    },
    '.ant-sw-modal-header': {
      borderBottom: 0
    },
    '.__modal-icon-button .ant-image': {
      display: 'flex',
      alignItems: 'end'
    },
    '.__total-token-supply .__value': {
      fontWeight: token.fontWeightStrong
    },
    '.__status-pool .__value': {
      fontWeight: token.fontWeightStrong
    },
    '.__modal-background': {
      height: 65,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      filter: 'blur(7.5px)'
    },

    '.__modal-separator': {
      height: 2,
      marginBottom: token.marginLG,
      backgroundColor: 'rgba(33, 33, 33, 0.80)'
    },

    '.__modal-logo': {
      width: 64,
      height: 64,
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: -35,
      marginBottom: token.sizeXL
    },

    '.__modal-buttons': {
      gap: token.size,
      display: 'flex'
    },

    '.__modal-icon-button': {
      borderRadius: '100%',
      border: '2px solid',
      borderColor: token.colorBgBorder
    },

    '.__modal-join-now-button': {
      '.anticon': {
        height: 20,
        width: 20
      }
    },

    '.__meta-block': {
      '.__row': {
        gap: token.size
      },

      '.__label-col': {
        maxWidth: 'fit-content',
        justifyContent: 'flex-start'
      },

      '.__value-col': {
        textAlign: 'right'
      },

      '.__row.-vertical': {
        flexDirection: 'column',
        gap: token.sizeXS,

        '.__value-col': {
          textAlign: 'left'
        }
      }
    },

    '__modal-footer': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    '.__markdown-wrapper': {
      overflowX: 'auto',
      maxWidth: '100%',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    },
    '.__meta-block .__row.-vertical .__value-col': {
      textAlign: 'left',
      width: '100%'
    }
  });
});
