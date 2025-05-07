// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import { _ReferendumInfo, RemoveVoteRequest, StandardVoteRequest } from '@subwallet/extension-base/services/open-gov/type';
import { isGovOngoing } from '@subwallet/extension-base/services/open-gov/utils';
import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { AmountInput, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { getAbstainTotal, handleRemoveVote, handleStandardVote } from '@subwallet/extension-koni-ui/messaging';
import { TransactionContent } from '@subwallet/extension-koni-ui/Popup/Transaction/parts';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Form, Icon, Image, ModalContext, SwModal } from '@subwallet/react-ui';
import { CaretLeft, GlobeHemisphereWest, PlusCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  address: string;
  data: _ReferendumInfo | null;
  chainAsset: _ChainAsset;

};

interface voteData{
  value: string,
  conviction: number
}

export const ReferendumDetailModalId = 'referendumDetailModalId';

const modalId = ReferendumDetailModalId;

function Component ({ address, chainAsset, className = '', data }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const [form] = Form.useForm();

  const [convictionValue, setConvictionValue] = useState<number>(0);
  const chain = chainAsset?.originChain;

  const [abstainTotal, setAbstainTotal] = useState<string>('0');

  useEffect(() => {
    const loadAbstainTotal = async () => {
      try {
        if (!data?.referendumIndex) {
          return;
        }

        const total = await getAbstainTotal({ chain, referendumIndex: data.referendumIndex });

        setAbstainTotal(total);
      } catch (err) {
        setAbstainTotal('0');
        console.error('Failed to load referendums:', err);
      }
    };

    loadAbstainTotal().catch((err) => console.error('Failed to load referendums:', err));
  }, [chain, data?.referendumIndex]);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onClickGlobalIcon = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onClickTwitterIcon = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onClickVote = useCallback(() => {
    form.validateFields().then(async (values: voteData) => {
      if (!data) {
        return;
      }

      const voteData: StandardVoteRequest = {
        address: address,
        chain: chain,
        referendumIndex: data.referendumIndex,
        aye: true,
        balance: values.value,
        conviction: values.conviction
      };

      inactiveModal(modalId);
      await handleStandardVote(voteData);
    }).catch((error) => {
      console.error('Form validation failed:', error);
    });
  }, [form, data, address, chain, inactiveModal]);

  const onClickRemoveVote = useCallback(() => {
    if (!data) {
      return;
    }

    const removeVoteData: RemoveVoteRequest = {
      address,
      chain,
      trackId: data.track,
      referendumIndex: data.referendumIndex
    };

    inactiveModal(modalId);

    handleRemoveVote(removeVoteData).catch(console.error);
  }, [data, address, chain, inactiveModal]);

  const modalCloseButton = (
    <Icon
      customSize={'24px'}
      phosphorIcon={CaretLeft}
      type='phosphor'
      weight={'light'}
    />
  );

  const valueColorSchema = 'blue';

  const convictionOptions = [
    { label: t('0.1x (No lockup)'), value: 0, lockPeriod: 0 },
    { label: t('1x (7 days)'), value: 1, lockPeriod: 7 },
    { label: t('2x (14 days)'), value: 2, lockPeriod: 14 },
    { label: t('3x (21 days)'), value: 3, lockPeriod: 21 },
    { label: t('4x (28 days)'), value: 4, lockPeriod: 28 },
    { label: t('5x (35 days)'), value: 5, lockPeriod: 35 },
    { label: t('6x (42 days)'), value: 6, lockPeriod: 42 }
  ];

  const handleConvictionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);

      setConvictionValue(value);
      form.setFieldsValue({ conviction: value });
    },
    [form]
  );

  return (
    <SwModal
      className={`${className}`}
      closeIcon={modalCloseButton}
      id={modalId}
      onCancel={onCancel}
      title={t(data?.title || 'Referendum details')}
    >
      {data && (
        <>
          <MetaInfo
            className={'__meta-block'}
            spaceSize={'ms'}
            valueColorScheme={'light'}
          >
            <MetaInfo.Default label={t('Name')}>{data.title}</MetaInfo.Default>

            <MetaInfo.Default
              className={'__status-pool'}
              label={t('Status')}
              valueColorSchema={valueColorSchema}
            >
              {data.state.name}
            </MetaInfo.Default>

            <MetaInfo.Number
              className={'__status-pool'}
              decimals={_getAssetDecimals(chainAsset)}
              label={t('Abstain total')}
              suffix={'votes'}
              value={abstainTotal}
            />
          </MetaInfo>

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
                  decimals={_getAssetDecimals(chainAsset)}
                  maxValue={'1'}
                  placeholder={t('Enter vote amount')}
                  showMaxButton={true}
                />
              </Form.Item>

              <Form.Item
                name={'conviction'}
                rules={[{ required: true, message: t('Please select a conviction') }]}
                statusHelpAsTooltip={true}
              >
                <div className='conviction-slider-container'>
                  <div className='conviction-label'>
                    {convictionOptions[convictionValue].label}
                  </div>
                  <input
                    className='conviction-slider'
                    max={6}
                    min={0}
                    onChange={handleConvictionChange}
                    step={1}
                    type='range'
                    value={convictionValue}
                  />
                  <div className='conviction-marks'>
                    {convictionOptions.map((option) => (
                      <span
                        className='conviction-mark'
                        key={option.value}
                      >
                        {option.value}
                      </span>
                    ))}
                  </div>
                </div>
              </Form.Item>
            </Form>
          </TransactionContent>

          <div className='__modal-footer'>
            <div className={'__modal-separator'}></div>

            <div className={'__modal-buttons'}>
              <Button
                className={'__modal-icon-button'}
                icon={
                  <Icon
                    phosphorIcon={GlobeHemisphereWest}
                    size={'sm'}
                    weight={'fill'}
                  />}
                onClick={onClickGlobalIcon}
                size={'xs'}
                type='ghost'
              />
              <Button
                className={'__modal-icon-button'}
                icon={
                  <Image
                    height={18}
                    shape='square'
                    src={DefaultLogosMap.xtwitter_transparent}
                    width={20}
                  />}
                onClick={onClickTwitterIcon}
                size={'xs'}
                type='ghost'
              />
              <Button
                disabled={!isGovOngoing(data.state.name)}
                icon={
                  <Icon
                    phosphorIcon={PlusCircle}
                    size={'sm'}
                    weight={'fill'}
                  />
                }
                onClick={onClickVote}
              >
                {t('Join now')}
              </Button>
              <Button
                disabled={!isGovOngoing(data.state.name)}
                icon={
                  <Icon
                    phosphorIcon={PlusCircle}
                    size={'sm'}
                    weight={'fill'}
                  />
                }
                onClick={onClickRemoveVote}
              >
                {t('Remove now')}
              </Button>
            </div>
          </div>
        </>
      )}
    </SwModal>
  );
}

export const ReferendumDetailModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
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
    },

    '.conviction-slider-container': {
      position: 'relative',
      padding: `${token.paddingSM}px 0`
    },
    '.conviction-label': {
      marginBottom: token.marginXS,
      fontSize: token.fontSizeSM,
      color: token.colorTextLight1,
      textAlign: 'center'
    },
    '.conviction-slider': {
      '-webkit-appearance': 'none',
      width: '100%',
      height: 8,
      background: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      outline: 'none',
      cursor: 'pointer',
      '&::-webkit-slider-thumb': {
        '-webkit-appearance': 'none',
        width: 20,
        height: 20,
        background: token.colorPrimary,
        borderRadius: '50%',
        border: `2px solid ${token.colorBgBase}`,
        cursor: 'pointer',
        transition: 'all 0.2s'
      },
      '&::-moz-range-thumb': {
        width: 20,
        height: 20,
        background: token.colorPrimary,
        borderRadius: '50%',
        border: `2px solid ${token.colorBgBase}`,
        cursor: 'pointer',
        transition: 'all 0.2s'
      },
      '&:hover::-webkit-slider-thumb': {
        transform: 'scale(1.2)'
      },
      '&:hover::-moz-range-thumb': {
        transform: 'scale(1.2)'
      }
    },
    '.conviction-marks': {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: token.marginXS,
      fontSize: token.fontSizeSM,
      color: token.colorTextLight3
    },
    '.conviction-mark': {
      flex: 1,
      textAlign: 'center'
    }
  });
});
